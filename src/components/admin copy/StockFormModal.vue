<template>
  <Teleport to="body">
    <div v-if="show" @click="onClose" class="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"></div>

    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      
      <div class="relative w-full max-w-6xl h-[85vh] transform overflow-hidden rounded-2xl bg-slate-50 text-left shadow-2xl transition-all ring-1 ring-slate-900/5 flex flex-col" @click.stop>
        
        <div class="flex items-center justify-between border-b border-slate-200 px-8 py-5 bg-white z-20 flex-shrink-0 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div class="flex items-center gap-5">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white">
              <ArchiveBoxIcon class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-extrabold leading-6 text-slate-800 tracking-tight">
                {{ isEditing ? 'Kelola Stok Barang' : 'Tambah Stok Baru' }}
              </h3>
              <p class="text-sm text-slate-500 mt-0.5 font-medium">
                {{ isEditing ? 'Catat transaksi masuk/keluar atau update data stok unit.' : 'Registrasi stok barang baru ke unit kerja (eatk_item_unit).' }}
              </p>
            </div>
          </div>
          <button @click="onClose" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all duration-200 hover:rotate-90">
            <XMarkIcon class="h-7 w-7" />
          </button>
        </div>

        <div class="flex flex-1 overflow-hidden">
          
          <div class="w-1/3 h-full bg-white border-r border-slate-200 p-8 flex flex-col items-center shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 hidden md:flex">
             <div class="w-full max-w-xs flex flex-col h-full">
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center shrink-0">Preview Barang Master</label>
                
                <div class="relative w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden mb-6 p-4 shadow-inner group">
                  <img v-if="selectedATKPhoto" :src="selectedATKPhoto" alt="Preview Produk" class="w-full h-full object-contain transition-all duration-500 group-hover:scale-105" />
                  <div v-else class="flex flex-col items-center text-slate-300">
                      <PhotoIcon class="h-16 w-16 mb-3" />
                      <span class="text-xs font-medium text-slate-400">Pilih Barang ATK</span>
                  </div>
                </div>

                <div v-if="selectedATK" class="w-full space-y-4 animate-fade-in">
                   <div class="text-center">
                      <h4 class="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{{ selectedATK.name }}</h4>
                      <p class="text-xs text-slate-500 font-mono mt-1 bg-slate-100 px-2 py-0.5 rounded inline-block border border-slate-200">{{ selectedATK.code }}</p>
                   </div>
                   <div class="grid grid-cols-2 gap-3">
                      <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                         <p class="text-[10px] font-bold text-slate-400 uppercase">Unit Satuan</p>
                         <p class="text-xs font-bold text-blue-600 mt-0.5">{{ selectedATK.uom }}</p>
                      </div>
                      <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                         <p class="text-[10px] font-bold text-slate-400 uppercase">Batas Kapasitas</p>
                         <p class="text-xs font-bold text-slate-700 mt-0.5">{{ selectedATK.max_stock }} {{ selectedATK.uom }}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div class="flex-1 h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
            <div class="p-8 max-w-3xl mx-auto pb-24">
              <form @submit.prevent="handleValidateAndSave" class="space-y-8">
                
                <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                   <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                   <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <LinkIcon class="h-5 w-5 text-blue-500" /> Relasi Data & Unit
                   </h4>
                   
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-2">
                        <label class="label-modern">Barang ATK <span class="text-red-500">*</span></label>
                        <select v-model.number="localStock.item_id" required class="form-select-bold w-full" :disabled="isEditing">
                           <option value="" disabled>-- Pilih Barang --</option>
                           <option v-for="atk in atkOptions" :key="atk.id" :value="atk.id">{{ atk.code }} - {{ atk.name }}</option>
                        </select>
                      </div>

                      <div class="space-y-2">
                        <label class="label-modern">Unit Kerja <span class="text-red-500">*</span></label>
                        <select v-model.number="localStock.unit_id" required class="form-select-bold w-full" :disabled="isEditing">
                           <option value="" disabled>-- Pilih Lokasi --</option>
                           <option v-for="unit in unitOptions" :key="unit.id" :value="unit.id">{{ unit.alias }} - {{ unit.name }}</option>
                        </select>
                      </div>
                   </div>

                   <div v-if="isCombinationDuplicate" class="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-pulse">
                      <ExclamationCircleIcon class="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p class="text-xs font-black text-red-800 uppercase">Data Stock Sudah Terdaftar</p>
                        <p class="text-[11px] text-red-600 leading-relaxed mt-0.5">Kombinasi Barang ATK dan Unit Kerja ini sudah ada. Silakan gunakan fitur edit pada data yang tersedia.</p>
                      </div>
                   </div>
                </div>

                <div v-if="isEditing" class="bg-blue-50 p-8 rounded-2xl border border-blue-100 shadow-inner relative overflow-hidden">
                   <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                   <h4 class="text-sm font-bold text-blue-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                     <ArrowsRightLeftIcon class="h-5 w-5" /> Pergerakan Stok
                   </h4>
                   
                   <div class="flex space-x-4 mb-6">
                      <button type="button" @click="transactionType = 'in'" class="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm" :class="transactionType === 'in' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-200' : 'border-slate-200 bg-white text-slate-500 hover:border-green-200'">
                         <ArrowUpTrayIcon class="h-5 w-5" /> Stok Masuk (+)
                      </button>
                      <button type="button" @click="transactionType = 'out'" class="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm" :class="transactionType === 'out' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-200' : 'border-slate-200 bg-white text-slate-500 hover:border-orange-200'">
                         <ArrowDownIcon class="h-5 w-5" /> Stok Keluar (-)
                      </button>
                   </div>

                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-2">
                        <label class="label-modern text-blue-900">Jumlah Transaksi</label>
                        <div class="relative">
                          <input v-model.number="transactionQty" type="number" min="0" class="form-input-bold text-lg pr-10 no-spinner" :class="(stockError || maxStockError) ? 'border-red-500 text-red-600 bg-red-50' : 'border-blue-200'" placeholder="0" />
                          <ExclamationCircleIcon v-if="stockError || maxStockError" class="absolute right-3 top-3.5 h-6 w-6 text-red-500 animate-pulse" />
                        </div>
                        
                        <div class="mt-3 p-4 bg-white/80 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                           <div class="flex items-center justify-between text-[11px] font-bold">
                              <span class="text-slate-500 uppercase tracking-tight">Stok saat ini:</span>
                              <span class="text-slate-800">{{ localStock.stock }} {{ selectedATK?.uom }}</span>
                           </div>
                           <div v-if="transactionType === 'in' && selectedATK" class="flex items-center justify-between text-[11px] font-bold border-t border-blue-50 pt-2">
                              <span class="text-blue-500 uppercase tracking-tight">Jumlah maksimal restock:</span>
                              <span class="text-blue-700">{{ selectedATK.max_stock - localStock.stock }} {{ selectedATK.uom }}</span>
                           </div>
                           <div v-else-if="transactionType === 'out'" class="flex items-center justify-between text-[11px] font-bold border-t border-orange-50 pt-2">
                              <span class="text-orange-500 uppercase tracking-tight">Maksimal pengeluaran:</span>
                              <span class="text-orange-700">{{ localStock.stock }} {{ selectedATK?.uom }}</span>
                           </div>
                        </div>

                        <p v-if="maxStockError" class="text-xs font-bold text-red-600 mt-3 flex items-center gap-1.5"><XCircleIcon class="h-4 w-4" /> {{ maxStockError }}</p>
                        <p v-if="stockError" class="text-xs font-bold text-red-600 mt-3 flex items-center gap-1.5"><XCircleIcon class="h-4 w-4" /> {{ stockError }}</p>
                      </div>
                      
                      <div class="space-y-2">
                        <label class="label-modern text-blue-900">Catatan Mutasi</label>
                        <textarea v-model="transactionNote" class="form-input-bold border-blue-200 focus:border-blue-500 h-[125px] resize-none py-3" placeholder="Keterangan transaksi..."></textarea>
                      </div>
                   </div>
                </div>

                <div v-else class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                   <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                   <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <ArchiveBoxIcon class="h-5 w-5 text-emerald-600" /> Pengaturan Stok & Alert
                   </h4>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-2">
                        <label class="label-modern">Stok Awal</label>
                        <input v-model.number="localStock.stock" type="number" min="0" class="form-input-bold no-spinner" :class="{'border-red-500 text-red-600 bg-red-50': maxStockError}" />
                        <div v-if="selectedATK" class="mt-2 text-[10px] font-bold text-slate-500 flex justify-between">
                            <span>KAPASITAS: {{ selectedATK.max_stock }}</span>
                            <span v-if="maxStockError" class="text-red-600 uppercase">{{ maxStockError }}</span>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <label class="label-modern">Stok Minimum (Alert)</label>
                        <input v-model.number="localStock.stock_min" type="number" min="0" class="form-input-bold no-spinner" />
                      </div>
                   </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                   <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div class="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                      <label class="label-modern">Harga Beli Satuan (Rp)</label>
                      <div class="relative group">
                        <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold">Rp</span>
                        <input v-model.number="localStock.price" type="number" min="0" class="form-input-bold !pl-12 no-spinner" />
                      </div>
                   </div>
                   
                   <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer group hover:border-emerald-300 transition-all flex items-center justify-between" @click="toggleStatus">
                      <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                      <div class="flex gap-4 items-center">
                         <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600"><ShieldCheckIcon class="h-6 w-6" /></div>
                         <div><span class="block text-sm font-black text-slate-800">Status Aktif</span><span class="text-[11px] text-slate-500">Bisa di-request user</span></div>
                      </div>
                      <button type="button" class="relative inline-flex h-7 w-12 rounded-full border-2 border-transparent transition-colors duration-200" :class="localStock.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'">
                        <span class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200" :class="localStock.status === 'Active' ? 'translate-x-5' : 'translate-x-0'"></span>
                      </button>
                   </div>
                </div>

              </form>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between px-8 py-5 bg-white border-t border-slate-200 shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-b-2xl">
          <div class="text-xs font-bold" :class="isFormReady ? 'text-emerald-600' : 'text-red-500'">
              <span v-if="isCombinationDuplicate" class="flex items-center gap-1.5"><XCircleIcon class="h-5 w-5" /> DATA STOCK SUDAH TERDAFTAR</span>
              <span v-else-if="maxStockError || stockError" class="flex items-center gap-1.5"><ExclamationCircleIcon class="h-5 w-5" /> MELEBIHI BATAS KAPASITAS</span>
              <span v-else-if="isFormReady" class="flex items-center gap-1.5"><CheckBadgeIcon class="h-5 w-5" /> DATA VALID & SIAP SIMPAN</span>
              <span v-else>Lengkapi pilihan barang dan jumlah yang valid.</span>
          </div>
          <div class="flex gap-4">
            <button @click="onClose" class="px-6 py-2.5 text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Batal</button>
            <button 
              @click="handleValidateAndSave" 
              :disabled="!isFormReady"
              class="px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all min-w-[170px]"
              :class="!isFormReady ? 'bg-slate-300 cursor-not-allowed opacity-50' : (isEditing ? (transactionType === 'in' ? 'bg-green-600' : 'bg-orange-600') : 'bg-blue-600')"
            >
              {{ isCombinationDuplicate ? 'Data Sudah Ada' : (isEditing ? (transactionQty > 1 ? (transactionType === 'in' ? 'Proses Restock' : 'Proses Keluar') : 'Simpan Data') : 'Tambah Stok Baru') }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <div v-if="localError.show" class="fixed bottom-10 right-10 z-[2000] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3 max-w-sm">
        <ExclamationCircleIcon class="h-6 w-6 shrink-0" />
        <span class="font-bold text-sm leading-snug">{{ localError.message }}</span>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useInventoryStore } from '../../stores/inventoryStore';
import { 
  ArchiveBoxIcon, XMarkIcon, BuildingOfficeIcon, ArrowsRightLeftIcon, 
  ArrowUpTrayIcon, ArrowDownIcon, PhotoIcon, LinkIcon, ShieldCheckIcon, 
  ExclamationCircleIcon, CheckBadgeIcon, XCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({ show: Boolean, stockToEdit: Object, atkOptions: Array, unitOptions: Array });
const emit = defineEmits(['close', 'save']);

const store = useInventoryStore();
const localStock = ref({});
const isEditing = computed(() => !!localStock.value.id);
const transactionType = ref('in');
const transactionQty = ref(0);
const transactionNote = ref('');
const localError = ref({ show: false, message: '' });

// --- HELPERS ---
const selectedATK = computed(() => props.atkOptions?.find(a => a.id === localStock.value.item_id));
const selectedATKPhoto = computed(() => selectedATK.value?.url_photo || null);

// --- LOGIKA CONSTRAINT UNIQUE (ATK + UNIT) ---
const isCombinationDuplicate = computed(() => {
  if (isEditing.value) return false; 
  const current = localStock.value;
  if (!current.item_id || !current.unit_id) return false;
  
  return store.stocks.some(s => s.item_id === current.item_id && s.unit_id === current.unit_id);
});

// --- LOGIKA PERHITUNGAN & VALIDASI STOK OTOMATIS ---
const maxStockError = computed(() => {
  const max = selectedATK.value?.max_stock;
  if (!max) return '';
  
  if (!isEditing.value) {
    if (localStock.value.stock > max) return `Melebihi kapasitas (Maks: ${max})`;
  } else if (transactionType.value === 'in') {
    const newTotal = localStock.value.stock + transactionQty.value;
    if (newTotal > max) return `Kapasitas penuh! Maksimal restock: ${max - localStock.stock}`;
  }
  return '';
});

const stockError = computed(() => {
  if (isEditing.value && transactionType.value === 'out' && transactionQty.value > localStock.value.stock) {
    return `Stok tidak cukup! Maksimal keluar: ${localStock.value.stock}`;
  }
  return '';
});

// Status kesiapan tombol simpan
const isFormReady = computed(() => {
  // Pengecekan Validitas Dasar (Wajib pilih barang & unit, serta tidak ada error stok)
  const isBasicValid = localStock.value.item_id && 
                       localStock.value.unit_id && 
                       !maxStockError.value && 
                       !stockError.value && 
                       !isCombinationDuplicate.value;

  if (isEditing.value) {
    // Tombol aktif jika: Dasar Valid DAN (Ada Mutasi Stok ATAU Harga Berubah ATAU Stok Min Berubah ATAU Status Berubah)
    const hasAnyChange = 
      (transactionQty.value > 0) || 
      (localStock.value.price !== props.stockToEdit.price) ||
      (localStock.value.stock_min !== props.stockToEdit.stock_min) ||
      (localStock.value.status !== props.stockToEdit.status);

    return isBasicValid && hasAnyChange;
  }

  // Untuk mode Tambah Baru (bukan edit)
  return isBasicValid && localStock.value.stock >= 0;
});

// --- FUNGSI VALIDASI PROAKTIF SAAT SIMPAN ---
const handleValidateAndSave = () => {
  if (isCombinationDuplicate.value) return showError("Data Stock dengan kombinasi ATK & Unit ini sudah terdaftar!");
  if (maxStockError.value) return showError("Jumlah restock melebihi batas kapasitas maksimal gudang!");
  if (stockError.value) return showError("Jumlah pengeluaran melebihi sisa stok yang tersedia!");
  if (!isFormReady.value) return showError("Mohon periksa kembali inputan Anda.");

  emit('save', { ...localStock.value, txType: transactionType.value, txQty: transactionQty.value, txNote: transactionNote.value });
};

const showError = (msg) => {
  localError.value = { show: true, message: msg };
  setTimeout(() => localError.value.show = false, 4500);
};

const toggleStatus = () => localStock.value.status = localStock.value.status === 'Active' ? 'Inactive' : 'Active';

watch(() => props.show, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    transactionQty.value = 0; transactionNote.value = ''; transactionType.value = 'in';
    localStock.value = props.stockToEdit ? { ...props.stockToEdit } : { item_id: '', unit_id: '', stock: 0, stock_min: 5, price: 0, status: 'Active' };
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => document.body.style.overflow = '');
const onClose = () => emit('close');
</script>

<style scoped>
.label-modern { @apply block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1; }
.form-input-bold { @apply block w-full rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 px-4 transition-all outline-none sm:text-sm; }
.form-select-bold { @apply block w-full rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 px-4 transition-all cursor-pointer outline-none sm:text-sm; }
.no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.animate-bounce { animation: bounce 0.5s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
</style>