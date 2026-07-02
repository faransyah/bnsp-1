import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

const saltRounds = 10; // Kekuatan enkripsi bcrypt

// ===============================
// 1. DATABASE POOL
// ===============================
export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'atk_project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ===============================
// 2. HELPER: LOG STOK
// ===============================
// NOTE: sekarang ada parameter tambahan "requester" untuk mencatat
// siapa user yang mengajukan request (khusus log hasil approval transaksi).
// Untuk log stok manual (input langsung admin), requester dikirim null.
export async function logStock(type, itemId, qty, actor, requester, note, conn) {
  const sql = `INSERT INTO eatk_stock_log (type, item_id, qty, actor_name, requester_name, note, date) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
  const connection = conn || db;
  await connection.execute(sql, [type, itemId, qty, actor, requester || null, note]);
}

app.post('/api/logs', async (req, res) => {
  try {
    const { type, item_id, qty, actor, note } = req.body;
    // Manual log dari admin (misal via ManageStockModal) -> tidak ada requester
    await logStock(type, item_id, qty, actor, null, note);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ===============================
// 3. AUTHENTICATION (LOGIN HYBRID)
// ===============================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.execute(
      'SELECT * FROM c_sec_user WHERE username = ? AND is_active = 1', [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Username tidak ditemukan atau akun non-aktif.' });
    }

    const user = users[0];
    let isMatch = false;
    let needsRehash = false;

    if (user.password.startsWith('$2b$') && user.password.length >= 60) {
      isMatch = await bcrypt.compare(password, user.password);
    } else if (user.password === password) {
      isMatch = true;
      needsRehash = true;
    }

    if (!isMatch) return res.status(401).json({ message: 'Password salah.' });

    if (needsRehash) {
      const newHash = await bcrypt.hash(password, saltRounds);
      await db.execute('UPDATE c_sec_user SET password=? WHERE id=?', [newHash, user.id]);
      console.log(`[AUTO-HASH] Keamanan akun user "${username}" telah ditingkatkan.`);
    }

    const [unit] = await db.execute('SELECT name, alias FROM c_master_unit WHERE id=?', [user.unit_id]);

    const { password: _, ...userData } = user;
    userData.unit_name = unit.length > 0 ? unit[0].alias : 'Unknown Unit';

    res.json(userData);

  } catch (e) {
    console.error("[LOGIN ERROR]", e);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// ===============================
// 4. SYNC DASHBOARD
// ===============================
app.get('/api/sync-all', async (req, res) => {
  try {
    const [units] = await db.execute('SELECT * FROM c_master_unit');
    const [atks] = await db.execute('SELECT * FROM eatk_item');
    const [cats] = await db.execute('SELECT * FROM eatk_category');
    const [stocks] = await db.execute('SELECT * FROM eatk_item_unit');
    const [users] = await db.execute(
      'SELECT id, full_name, username, email, phone, nip, unit_id, role, is_active, position_name, url_photo, created_at FROM c_sec_user'
    );
    // requester_name & actor_name ikut terbawa otomatis via SELECT l.*
    const [history] = await db.execute(`
      SELECT l.*, i.name as itemName 
      FROM eatk_stock_log l 
      JOIN eatk_item i ON l.item_id = i.id 
      ORDER BY l.date DESC LIMIT 100
    `);
    const [trx] = await db.execute(`
      SELECT t.*, u.full_name as user_name, m.alias as unit_name
      FROM eatk_transaction t
      JOIN c_sec_user u ON t.user_id = u.id
      JOIN c_master_unit m ON t.unit_id = m.id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      ORDER BY t.created_at DESC
    `);
    const [trxDetails] = await db.execute('SELECT * FROM eatk_transaction_detail');

    res.json({ units, atks, cats, stocks, users, history, transactions: trx, transactionDetails: trxDetails });
  } catch (e) {
    console.error("[SYNC ERROR]", e);
    res.status(500).json({ error: e.message });
  }
});

// ===============================
// 5. MASTER DATA (CRUD)
// ===============================

// --- ATK ---
app.post('/api/atks', async (req, res) => {
  try {
    const { code, name, category_id, description, min_stock, max_stock, price, uom, status, url_photo } = req.body;
    const [exist] = await db.execute('SELECT id FROM eatk_item WHERE code=?', [code]);
    if (exist.length > 0) return res.status(400).json({ message: 'Kode ATK sudah terdaftar!' });

    await db.execute(
      `INSERT INTO eatk_item 
      (code, name, category_id, description, min_stock, max_stock, price, uom, status, url_photo, created_at) 
      VALUES (?,?,?,?,?,?,?,?,?,?, NOW())`,
      [code, name, category_id, description, min_stock, max_stock, price, uom, status, url_photo]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/atks/:id', async (req, res) => {
  try {
    const { code, name, category_id, description, min_stock, max_stock, price, uom, status, url_photo } = req.body;
    await db.execute(
      `UPDATE eatk_item 
      SET code=?, name=?, category_id=?, description=?, min_stock=?, max_stock=?, price=?, uom=?, status=?, url_photo=?, updated_at=NOW() 
      WHERE id=?`,
      [code, name, category_id, description, min_stock, max_stock, price, uom, status, url_photo, req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/atks/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM eatk_item WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Gagal hapus. Item mungkin dipakai.' }); }
});

// --- UNITS ---
app.post('/api/units', async (req, res) => {
  try {
    const { alias, name, address, phone, ref_id, parent_id, is_active } = req.body;
    await db.execute(
      'INSERT INTO c_master_unit (alias, name, address, phone, ref_id, parent_id, is_active) VALUES (?,?,?,?,?,?,?)',
      [alias, name, address, phone, ref_id, parent_id, is_active]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/units/:id', async (req, res) => {
  try {
    const { alias, name, address, phone, ref_id, parent_id, is_active } = req.body;
    await db.execute(
      'UPDATE c_master_unit SET alias=?, name=?, address=?, phone=?, ref_id=?, parent_id=?, is_active=? WHERE id=?',
      [alias, name, address, phone, ref_id, parent_id, is_active, req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/units/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM c_master_unit WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USERS (Hashing Implemented) ---
app.post('/api/users', async (req, res) => {
  try {
    const { full_name, username, password, email, phone, nip, unit_id, role, is_active, position_name, url_photo } = req.body;

    const [exist] = await db.execute('SELECT id FROM c_sec_user WHERE username=? OR nip=? OR email=?', [username, nip, email]);
    if (exist.length > 0) return res.status(400).json({ message: 'Username/NIP/Email sudah terdaftar!' });

    const plainPass = password || '123';
    const hashedPass = await bcrypt.hash(plainPass, saltRounds);

    await db.execute(
      `INSERT INTO c_sec_user 
      (full_name, username, password, email, phone, nip, unit_id, role, is_active, position_name, url_photo) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [full_name, username, hashedPass, email, phone, nip, unit_id, role, is_active, position_name, url_photo]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { full_name, username, email, phone, nip, unit_id, role, is_active, position_name, url_photo, password } = req.body;

    const [exist] = await db.execute(
      'SELECT id FROM c_sec_user WHERE (username=? OR email=?) AND id!=?', [username, email, req.params.id]
    );
    if (exist.length > 0) return res.status(400).json({ message: 'Username/Email sudah dipakai user lain.' });

    let sql, params;
    if (password && password.trim() !== "") {
      const hashedPass = await bcrypt.hash(password, saltRounds);
      sql = `UPDATE c_sec_user SET full_name=?, username=?, email=?, phone=?, nip=?, unit_id=?, role=?, is_active=?, position_name=?, url_photo=?, password=? WHERE id=?`;
      params = [full_name, username, email, phone || null, nip, unit_id, role, is_active, position_name || null, url_photo || null, hashedPass, req.params.id];
    } else {
      sql = `UPDATE c_sec_user SET full_name=?, username=?, email=?, phone=?, nip=?, unit_id=?, role=?, is_active=?, position_name=?, url_photo=? WHERE id=?`;
      params = [full_name, username, email, phone || null, nip, unit_id, role, is_active, position_name || null, url_photo || null, req.params.id];
    }

    await db.execute(sql, params);
    res.json({ success: true });
  } catch (e) {
    console.error("[UPDATE ERROR]", e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM c_sec_user WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===============================
// 6. TRANSAKSI & APPROVAL
// ===============================
app.post('/api/transactions', async (req, res) => {
  const { user_id, unit_id, description, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const rand = Math.floor(1000 + Math.random()*9000);
    const code = `TRX-${dateStr}-${rand}`;

    const [header] = await conn.execute(
      'INSERT INTO eatk_transaction (code, user_id, unit_id, description, status, created_at) VALUES (?,?,?,?, "Pending", NOW())',
      [code, user_id, unit_id, description]
    );
    const trxId = header.insertId;

    for (const item of details) {
      await conn.execute(
        'INSERT INTO eatk_transaction_detail (transaction_id, item_id, qty, notes, status) VALUES (?,?,?,?, "Pending")',
        [trxId, item.item_id, item.qty, item.notes]
      );
    }

    await conn.commit();
    res.json({ success: true, message: 'Permintaan terkirim.' });
  } catch (e) {
    await conn.rollback();
    console.error("[TRANSACTION ERROR]", e);
    res.status(500).json({ error: e.message });
  } finally { conn.release(); }
});

app.post('/api/process-transaction', async (req, res) => {
  const { trx_id, items, actor_name } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Ambil nama user pemilik request ini (requester), diambil dari DB
    // supaya tidak bergantung pada data yang dikirim frontend.
    const [trxRows] = await conn.execute(
      `SELECT u.full_name AS requester_name 
       FROM eatk_transaction t 
       JOIN c_sec_user u ON t.user_id = u.id 
       WHERE t.id = ?`,
      [trx_id]
    );
    const requesterName = trxRows[0]?.requester_name || 'Unknown User';

    // 1. Update status header transaksi
    await conn.execute('UPDATE eatk_transaction SET status="Completed", updated_at=NOW() WHERE id=?', [trx_id]);

    for (const item of items) {
      const status = item.action === 'approve' ? 'Approved' : 'Rejected';
      const approvedQty = item.action === 'approve' ? item.approved_qty : 0;

      await conn.execute(
        'UPDATE eatk_transaction_detail SET status=?, qty_approved=?, reject_reason=? WHERE id=?', 
        [status, approvedQty, item.reason || null, item.id]
      );

      if (item.action === 'approve' && approvedQty > 0) {
        const [exist] = await conn.execute('SELECT id FROM eatk_item_unit WHERE item_id=? AND unit_id=?', [item.item_id, item.unit_id]);
        
        if (exist.length > 0) {
          await conn.execute('UPDATE eatk_item_unit SET stock=stock+?, updated_at=NOW() WHERE id=?', [approvedQty, exist[0].id]);
        } else {
          await conn.execute(
            `INSERT INTO eatk_item_unit (item_id, unit_id, stock, stock_min, price, status, created_at)
            SELECT id, ?, ?, min_stock, price, 'Active', NOW() FROM eatk_item WHERE id=?`,
            [item.unit_id, approvedQty, item.item_id]
          );
        }

        // actor_name = admin yang approve, requesterName = user yang minta
        await logStock('IN', item.item_id, approvedQty, actor_name || 'Admin', requesterName, `Approved TRX #${trx_id}`, conn);
      }
    }

    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    console.error("[PROCESS TRX ERROR]", e);
    res.status(500).json({ error: e.message });
  } finally { conn.release(); }
});

// --- STOCKS MANUAL ---
app.post('/api/stocks', async (req, res) => {
  try {
    const { item_id, unit_id, stock, stock_min, price, status } = req.body;
    await db.execute('INSERT INTO eatk_item_unit (item_id, unit_id, stock, stock_min, price, status, created_at) VALUES (?,?,?,?,?,?,NOW())', [item_id, unit_id, stock, stock_min, price, status]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/stocks/:id', async (req, res) => {
  try {
    const { stock, stock_min, price, status } = req.body;
    await db.execute('UPDATE eatk_item_unit SET stock=?, stock_min=?, price=?, status=?, updated_at=NOW() WHERE id=?', [stock, stock_min, price, status, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/stocks/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM eatk_item_unit WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===============================
// SERVER START
// ===============================
app.listen(3000, () => console.log('Backend server running on port 3000'));