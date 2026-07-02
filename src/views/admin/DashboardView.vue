<template>
  <div class="space-y-6 pb-20 animate-fade-in-up">

    <Transition name="toast-slide-top">
      <div v-if="toast.show" class="fixed top-20 left-1/2 z-[100] w-full max-w-sm -translate-x-1/2 transform px-4">
        <div class="flex items-center overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl ring-1 transition-all"
          :class="{ 'bg-white/95 text-slate-800 ring-slate-200': true, 'border-l-4 border-green-500': toast.type === 'success', 'border-l-4 border-red-500': toast.type === 'error' }">
          <div class="flex-shrink-0">
            <CheckCircleIcon v-if="toast.type === 'success'" class="h-6 w-6 text-green-500" />
            <XCircleIcon v-if="toast.type === 'error'" class="h-6 w-6 text-red-500" />
          </div>
          <div class="ml-3 flex-1"><p class="text-sm font-semibold">{{ toast.message }}</p></div>
          <button @click="toast.show = false" class="ml-4 text-slate-400 hover:text-slate-600 focus:outline-none"><XMarkIcon class="h-5 w-5" /></button>
        </div>
      </div>
    </Transition>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">Dashboard</h1>
        <p class="mt-2 text-base text-slate-500">Monitoring sistem ATK <span class="font-semibold text-[#009BDB]">Icon Plus</span>.</p>
      </div>
      <div class="hidden sm:flex flex-col items-end justify-center">
        <div class="flex items-center gap-2 text-sm font-bold text-slate-700">
          <CalendarDaysIcon class="h-4 w-4 text-slate-400" /><span>{{ currentDate }}</span>
        </div>
        <div class="flex items-center gap-1.5 mt-1">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span class="text-xs font-mono font-medium text-slate-500 tracking-wide">{{ currentTime }} WIB</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
              <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">Unit Kerja Aktif</p>
              <p class="mt-1 text-3xl font-black text-slate-800">{{ stats.activeUnits }}</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600"><BoltSolidIcon class="h-7 w-7" /></div>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">Katalog Barang</p>
            <p class="mt-1 text-3xl font-black text-slate-800">{{ stats.totalATK }}</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><ClipboardDocumentListIcon class="h-6 w-6" /></div>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">Persediaan Total</p>
            <p class="mt-1 text-3xl font-black text-slate-800">{{ stats.totalStock }}</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><ArchiveBoxIcon class="h-6 w-6" /></div>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-lg" :class="{'border-rose-400': stats.lowStockCount > 0}">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">Stok Menipis</p>
            <p class="mt-1 text-3xl font-black tracking-tight" :class="stats.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'">{{ stats.lowStockCount }}</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><ExclamationTriangleIcon class="h-6 w-6" /></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 lg:col-span-8">
        <div class="h-full rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div class="mb-6 flex justify-between items-start">
              <div><h3 class="text-lg font-bold text-slate-800">Volume Distribusi Barang</h3><p class="text-sm text-slate-500">Statistik permintaan yang dipenuhi secara periodik.</p></div>
              <ChartBarIcon class="h-6 w-6 text-blue-500 opacity-50" />
          </div>
          <div class="-ml-2">
            <apexchart type="bar" height="350" :options="barChartOptions" :series="barChartSeries"></apexchart>
          </div>
        </div>
      </div>
      <div class="col-span-12 lg:col-span-4">
        <div class="h-full rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col">
          <div class="mb-4 flex justify-between items-start">
              <div><h3 class="text-lg font-bold text-slate-800">Komposisi Inventaris</h3><p class="text-sm text-slate-500">Persentase stok berdasarkan kategori.</p></div>
              <ChartPieIcon class="h-6 w-6 text-purple-500 opacity-50" />
          </div>
          <div class="flex-1 flex flex-col items-center justify-center py-4">
            <apexchart type="donut" width="320" :options="donutChartOptions" :series="donutChartSeries"></apexchart>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6 mt-6">
      
      <div class="col-span-12 lg:col-span-6">
        <div class="h-full rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center">
            <div><h2 class="text-lg font-bold text-slate-800">Persetujuan Tertunda</h2><p class="text-sm text-slate-500">Antrean permintaan unit kerja.</p></div>
            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{{ sortedPendingTransactions.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar p-6 max-h-[400px]">
             <div v-if="sortedPendingTransactions.length === 0" class="text-center py-10 text-slate-400 text-sm">Belum ada permintaan masuk.</div>
             <div v-else class="space-y-4">
                <div v-for="trx in sortedPendingTransactions" :key="trx.id" class="p-4 border rounded-xl hover:shadow-md transition-all bg-white group cursor-pointer" @click="openApprovalModal(trx)">
                   <div class="flex justify-between items-start mb-2">
                     <div>
                         <p class="text-sm font-bold text-slate-800">{{ trx.user_name }} <span class="text-slate-400 font-normal">({{ trx.unit_name }})</span></p>
                         <p class="text-xs text-blue-600 font-mono">{{ trx.code }}</p>
                     </div>
                     <span class="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">{{ formatTime(trx.created_at) }}</span>
                   </div>
                   <button class="w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors focus:outline-none">Review Permintaan</button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6">
        <div class="h-full rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-6 border-b border-slate-100">
             <h3 class="text-lg font-bold text-slate-800">Aktivitas Terakhir</h3>
             <p class="text-sm text-slate-500">Pencatatan pergerakan stok unit.</p>
          </div>
          <div class="custom-scrollbar h-[400px] overflow-y-auto p-6 pt-0">
            <div class="relative border-l border-slate-200 ml-3 mt-6 space-y-6">
                <div v-if="recentActivity.length === 0" class="py-8 text-center text-sm text-slate-500 pl-6">Belum ada aktivitas tercatat.</div>
                <div v-for="activity in recentActivity" :key="activity.id" class="relative pl-6 group">
                  <span class="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm" :class="activity.type === 'masuk' ? 'bg-green-500' : 'bg-amber-500'"></span>
                  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <p class="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {{ activity.item }}
                        <span class="font-extrabold" :class="activity.type === 'masuk' ? 'text-green-600' : 'text-amber-600'">
                          ({{ activity.type === 'masuk' ? '+' : '-' }}{{ activity.qty }})
                        </span>
                      </p>
                      <!-- Jika ada requester (hasil approval), tampilkan siapa yang minta & siapa yang approve.
                           Jika tidak ada (input manual admin), tampilkan seperti biasa. -->
                      <p v-if="activity.requester" class="text-xs text-slate-500 mt-0.5 font-medium">
                        <span class="text-slate-700 font-bold">{{ activity.requester }}</span> mengajukan
                        <span class="capitalize">{{ activity.type }}</span> •
                        disetujui oleh <span class="text-blue-600 font-bold">{{ activity.user }}</span>
                      </p>
                      <p v-else class="text-xs text-slate-500 mt-0.5 font-medium">
                        {{ activity.user }} • <span class="capitalize">{{ activity.type }}</span>
                      </p>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full whitespace-nowrap border border-slate-100">{{ activity.time }}</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal-fade">
      <div v-if="approvalModal.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="closeApprovalModal"></div>
        <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
           <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div><h3 class="text-lg font-bold text-slate-800">Persetujuan Transaksi</h3><p class="text-xs text-slate-500">{{ approvalModal.data?.code }}</p></div>
             <button @click="closeApprovalModal" class="p-2 rounded-full hover:bg-slate-200 text-slate-400 focus:outline-none"><XMarkIcon class="h-5 w-5"/></button>
           </div>
           <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div v-for="item in approvalModal.items" :key="item.id" class="p-4 border rounded-xl flex flex-col md:flex-row gap-4 transition-colors" :class="item.action === 'reject' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'">
                  <div class="flex-1">
                    <p class="text-sm font-bold text-slate-800">{{ item.itemName }}</p>
                    <p class="text-xs text-slate-500 mt-1">Request: <span class="font-bold">{{ item.qty }}</span> | Kuota Tersisa di Unit: <span class="text-blue-600 font-bold">{{ item.maxAllocatable }}</span></p>
                  </div>
                  <div class="flex flex-col gap-2 min-w-[200px]">
                    <div class="flex gap-2">
                       <button @click="item.action='approve'; item.approved_qty=item.qty" class="flex-1 py-1.5 text-xs font-bold rounded border transition-all" :class="item.action==='approve' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 hover:border-emerald-500'">Terima</button>
                       <button @click="item.action='reject'; item.approved_qty=0" class="flex-1 py-1.5 text-xs font-bold rounded border transition-all" :class="item.action==='reject' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-500 hover:border-red-500'">Tolak</button>
                    </div>
                    <div v-if="item.action === 'approve'">
                        <input type="number" v-model.number="item.approved_qty" class="w-full text-xs p-2 border rounded" :max="item.maxAllocatable" min="0">
                        <p v-if="item.approved_qty > item.maxAllocatable" class="text-[9px] text-red-500 mt-1">Melebihi sisa kuota unit!</p>
                    </div>
                    <input v-if="item.action === 'reject'" type="text" v-model="item.reason" placeholder="Alasan penolakan..." class="w-full text-xs p-2 border rounded border-red-300">
                  </div>
              </div>
           </div>
           <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             <button @click="closeApprovalModal" class="px-4 py-2 text-xs font-bold text-slate-600 bg-white border rounded-lg hover:bg-slate-100">Batal</button>
             <button @click="submitBatchProcessing" :disabled="!isFormValid || store.isLoading" class="px-6 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg transition-all focus:outline-none disabled:bg-slate-400">
               {{ store.isLoading ? 'Memproses...' : 'Simpan Keputusan' }}
             </button>
           </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useInventoryStore } from '../../stores/inventoryStore'; 
import {
  CalendarDaysIcon, ArchiveBoxIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, XMarkIcon,
  ChartPieIcon, ChartBarIcon, BoltIcon as BoltSolidIcon, ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline';

const store = useInventoryStore();
const toast = ref({ show: false, message: '', type: 'success' });
const approvalModal = ref({ show: false, data: null, items: [] });

// --- TIME & DATA POLLING ---
const currentTime = ref('');
const currentDate = ref('');
let timeInterval = null;
let dataPollingInterval = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// --- REALTIME STATISTICS ---
const stats = computed(() => ({
  activeUnits: store.units.filter(u => u.is_active === 1).length,
  totalATK: store.atks.length,
  totalStock: store.stocks.reduce((sum, item) => sum + item.stock, 0),
  lowStockCount: store.lowStockItems.length
}));

// requester_name ikut disertakan dari backend (eatk_stock_log.requester_name)
// -> null/undefined untuk log input manual admin, terisi untuk hasil approval request user.
const recentActivity = computed(() => {
  return store.history.slice(0, 10).map(log => ({
    id: log.id,
    type: log.type === 'IN' ? 'masuk' : 'keluar',
    item: log.itemName,
    qty: log.qty,
    user: log.actor_name,
    requester: log.requester_name || null,
    time: formatRelativeTime(log.date)
  }));
});

// --- CHART DATA ---
const last12Months = computed(() => {
  const labels = [];
  const counts = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    labels.push(monthLabel);

    const count = store.transactions.filter(trx => {
      const trxDate = new Date(trx.created_at);
      return trx.status === 'Completed' && 
             trxDate.getMonth() === d.getMonth() && 
             trxDate.getFullYear() === d.getFullYear();
    }).length;
    
    counts.push(count);
  }
  return { labels, counts };
});

const barChartSeries = computed(() => [{ name: 'Total Permintaan', data: last12Months.value.counts }]);
const barChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
  dataLabels: { enabled: false },
  xaxis: { categories: last12Months.value.labels, labels: { style: { fontSize: '10px', fontWeight: 600 } } },
  colors: ['#3b82f6'],
  grid: { borderColor: '#f1f5f9' },
  tooltip: { y: { formatter: (val) => `${val} Transaksi` } }
}));

const donutChartSeries = computed(() => {
  const catCounts = store.categories.map(cat => store.atks.filter(atk => atk.category_id === cat.id).length);
  return catCounts.length ? catCounts : [0];
});

const donutChartOptions = computed(() => ({ 
  chart: { type: 'donut' }, 
  labels: store.categories.map(c => c.name).length ? store.categories.map(c => c.name) : ['Tidak ada data'],
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  legend: { position: 'bottom', fontSize: '11px', fontWeight: 600 },
  plotOptions: { pie: { donut: { size: '75%' } } }
}));

// --- ACTION METHODS ---
const sortedPendingTransactions = computed(() => store.pendingTransactionList);

const openApprovalModal = (trx) => {
    const items = trx.details.map(d => {
        const masterItem = store.atks.find(a => a.id === d.item_id);
        const unitStockRecord = store.stocks.find(s => s.item_id === d.item_id && s.unit_id === trx.unit_id);
        const currentStock = unitStockRecord ? unitStockRecord.stock : 0;
        
        return {
            ...d,
            unit_id: trx.unit_id,
            itemName: masterItem?.name || 'Unknown Item',
            maxAllocatable: Math.max(0, (masterItem?.max_stock || 100) - currentStock),
            approved_qty: d.qty, 
            action: 'approve',
            reason: ''
        };
    });
    approvalModal.value = { show: true, data: trx, items };
};

const closeApprovalModal = () => { approvalModal.value.show = false; };

const isFormValid = computed(() => {
    return approvalModal.value.items.every(item => {
        if (item.action === 'approve') {
            return item.approved_qty >= 0 && item.approved_qty <= item.maxAllocatable;
        }
        return item.reason.trim().length > 0;
    });
});

const submitBatchProcessing = async () => {
    try {
        await store.processBatchTransaction(approvalModal.value.data.id, approvalModal.value.items);
        closeApprovalModal();
        triggerToast('Keputusan berhasil disimpan & stok diperbarui.', 'success');
        await store.fetchAllData();
    } catch (e) {
        console.error(e);
        triggerToast('Gagal memproses permintaan.', 'error');
    }
};

const triggerToast = (message, type) => {
  toast.value = { show: true, message, type };
  setTimeout(() => toast.value.show = false, 3000);
};

const formatTime = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const formatRelativeTime = (dateString) => {
  const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
  if (diff < 1) return 'Baru saja';
  if (diff < 60) return `${diff}m lalu`;
  if (diff < 1440) return `${Math.floor(diff/60)}j lalu`;
  return new Date(dateString).toLocaleDateString('id-ID');
};

// --- LIFECYCLE ---
onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  store.fetchAllData(); 
  dataPollingInterval = setInterval(() => { store.fetchAllData(); }, 30000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
  if (dataPollingInterval) clearInterval(dataPollingInterval);
});

watch(() => approvalModal.value.show, (val) => document.body.style.overflow = val ? 'hidden' : '');
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>