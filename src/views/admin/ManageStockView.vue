<template>
  <Transition name="toast-slide-top">
    <div v-if="toast.show" class="fixed top-20 left-1/2 z-[100] w-full max-w-sm -translate-x-1/2 transform px-4">
      <div class="flex items-center overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl ring-1 transition-all"
        :class="{ 
          'bg-white/95 text-slate-800 ring-slate-200': true, 
          'border-l-4 border-green-500': toast.type === 'success', 
          'border-l-4 border-red-500': toast.type === 'error' 
        }">
        <div class="flex-shrink-0">
          <CheckCircleIcon v-if="toast.type === 'success'" class="h-6 w-6 text-green-500" />
          <XCircleIcon v-if="toast.type === 'error'" class="h-6 w-6 text-red-500" />
        </div>
        <div class="ml-3 flex-1"><p class="text-sm font-semibold">{{ toast.message }}</p></div>
        <button @click="toast.show = false" class="ml-4 flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"><XMarkIcon class="h-5 w-5" /></button>
      </div>
    </div>
  </Transition>

  <div v-if="showDeleteModal" class="relative z-[1100]">
    <div class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" @click="closeDeleteModal"></div>
    <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
      <div class="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-lg">
        <div class="bg-white p-6">
          <div class="flex items-start gap-4">
            <div class="h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 flex">
              <NoSymbolIcon class="h-6 w-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Hapus Data Stok</h3>
              <p class="text-sm text-slate-500 mt-1">Yakin hapus stok ini? Data yang dihapus akan tercatat di riwayat mutasi sebagai pembersihan.</p>
            </div>
          </div>
        </div>
        <div class="bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button @click="confirmDeleteAction" class="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-all">Ya, Hapus</button>
          <button @click="closeDeleteModal" class="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all">Batal</button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="space-y-8 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">Manage Stock</h1>
        <p class="mt-2 text-base text-slate-500">Monitoring stok fisik per unit & Riwayat Mutasi (Ref: eatk_item_unit).</p>
      </div>
      <div class="hidden sm:flex flex-col items-end justify-center">
        <div class="flex items-center gap-2 text-sm font-bold text-slate-700">
          <CalendarDaysIcon class="h-4 w-4 text-slate-400" />
          <span>{{ currentDate }}</span>
        </div>
        <div class="text-xs font-mono text-slate-500 mt-1">{{ currentTime }} WIB</div>
      </div>
    </div>

    <div class="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      
      <div class="mb-8 border-b border-slate-200">
        <nav class="-mb-px flex space-x-8">
          <button @click="switchTab('stock')" class="py-4 px-1 text-sm font-bold border-b-2 transition-all" :class="activeTab === 'stock' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'">Stok Fisik Unit</button>
          <button @click="switchTab('history')" class="py-4 px-1 text-sm font-bold border-b-2 transition-all" :class="activeTab === 'history' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'">Log Mutasi</button>
        </nav>
      </div>

      <div v-if="activeTab === 'stock'" class="space-y-6">
        
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
             <ArchiveBoxIcon class="h-5 w-5 text-slate-400" /> Daftar Stok
          </h2>
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div class="relative w-full sm:w-64">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon class="h-4 w-4 text-slate-400" />
              </div>
              <input 
                v-model="searchQuery" 
                @input="resetPage" 
                type="text" 
                class="block w-full rounded-lg border-0 h-10 py-1.5 pl-10 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow" 
                placeholder="Cari nama barang..."
              >
            </div>
            
            <div class="relative w-full sm:w-52">
               <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon class="h-4 w-4 text-slate-400" />
               </div>
               <select 
                  v-model="selectedUnit" 
                  @change="resetPage" 
                  class="block w-full rounded-lg border-0 h-10 py-1.5 pl-9 pr-8 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 cursor-pointer"
               >
                  <option value="Semua Unit">Semua Unit</option>
                  <option v-for="u in uniqueUnits" :key="u.id" :value="u.id">{{ u.alias }}</option>
               </select>
            </div>

            <button @click="exportStockToExcel" class="inline-flex items-center justify-center rounded-lg bg-emerald-600 h-10 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95 whitespace-nowrap">
              <ArrowDownTrayIcon class="mr-1.5 h-4 w-4" /> Export Excel
            </button>

            <button @click="openStockModal(null)" class="inline-flex items-center justify-center rounded-lg bg-blue-600 h-10 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95 whitespace-nowrap">
              <PlusIcon class="mr-1.5 h-4 w-4" /> Tambah Stok
            </button>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th class="px-6 py-4 text-left">Barang</th>
                <th class="px-6 py-4 text-left">Unit</th>
                <th class="px-6 py-4 text-left">Stok</th>
                <th class="px-6 py-4 text-center">Status</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-if="filteredStock.length === 0"><td colspan="5" class="py-12 text-center text-sm text-slate-500">Data stok tidak ditemukan.</td></tr>
              <tr v-for="item in paginatedStock" :key="item.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                  <button 
                    @click="openDetailModal(item)" 
                    class="flex items-center gap-3 group/item text-left w-full rounded-lg p-1 -ml-1 hover:bg-blue-50 transition-all"
                  >
                    <div class="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 group-hover/item:border-blue-200 group-hover/item:shadow-sm transition-all flex-shrink-0">
                      <img v-if="getATK(item.item_id).url_photo" :src="getATK(item.item_id).url_photo" class="h-8 w-8 object-contain" />
                      <ArchiveBoxIcon v-else class="h-5 w-5 text-slate-400" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-bold text-slate-800 group-hover/item:text-blue-700 truncate transition-colors">
                        {{ getATK(item.item_id).name }}
                      </p>
                      <p class="text-[10px] font-mono text-slate-400 group-hover/item:text-blue-500 transition-colors">
                        {{ getATK(item.item_id).code }}
                      </p>
                    </div>
                    <ChevronRightIcon class="h-4 w-4 text-blue-400 opacity-0 group-hover/item:opacity-100 transition-all mr-1 flex-shrink-0" />
                  </button>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-slate-600">{{ getUnitAlias(item.unit_id) }}</td>
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-black text-slate-700">{{ item.stock }} <span class="text-[10px] font-normal text-slate-400">{{ getATK(item.item_id).uom }}</span></span>
                    <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all" :style="{ width: Math.min((item.stock / (item.stock_min * 2)) * 100, 100) + '%' }" :class="item.stock <= item.stock_min ? 'bg-orange-500' : 'bg-emerald-500'"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2 py-1 rounded-full text-[10px] font-bold" :class="item.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'">{{ item.status }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      @click="openStockModal(item)" 
                      class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md font-bold shadow-sm text-xs border border-blue-200 transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      @click="handleDelete(item)" 
                      class="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md font-bold shadow-sm text-xs border border-red-200 transition-all"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
             <div class="flex flex-1 justify-between sm:hidden">
                <button @click="stockPage > 1 ? stockPage-- : null" :disabled="stockPage === 1" class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Previous</button>
                <button @click="stockPage < totalStockPages ? stockPage++ : null" :disabled="stockPage === totalStockPages || totalStockPages === 0" class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Next</button>
             </div>
             <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-slate-700">
                    Menampilkan
                    <span class="font-bold text-slate-900">{{ (stockPage - 1) * itemsPerPage + 1 }}</span>
                    sampai
                    <span class="font-bold text-slate-900">{{ Math.min(stockPage * itemsPerPage, filteredStock.length) }}</span>
                    dari
                    <span class="font-bold text-slate-900">{{ filteredStock.length }}</span>
                    data
                  </p>
                </div>
                <div>
                   <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button @click="stockPage > 1 ? stockPage-- : null" :disabled="stockPage === 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"><ChevronLeftIcon class="h-5 w-5" /></button>
                      
                      <button v-for="p in totalStockPages" :key="p" @click="stockPage = p" :class="[p === stockPage ? 'relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0']">
                        {{ p }}
                      </button>

                      <button @click="stockPage < totalStockPages ? stockPage++ : null" :disabled="stockPage === totalStockPages || totalStockPages === 0" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"><ChevronRightIcon class="h-5 w-5" /></button>
                   </nav>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'history'">
        <div class="flex justify-end mb-4">
          <button @click="exportHistoryToExcel" class="inline-flex items-center justify-center rounded-lg bg-emerald-600 h-10 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95 whitespace-nowrap">
            <ArrowDownTrayIcon class="mr-1.5 h-4 w-4" /> Export Excel
          </button>
        </div>
        <div class="overflow-hidden rounded-xl border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th class="px-6 py-4 text-left">Waktu</th>
                <th class="px-6 py-4 text-left">Tipe</th>
                <th class="px-6 py-4 text-left">Barang</th>
                <th class="px-6 py-4 text-center">Qty</th>
                <th class="px-6 py-4 text-left">Diminta Oleh</th>
                <th class="px-6 py-4 text-left">Disetujui Oleh</th>
                <th class="px-6 py-4 text-left">Catatan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-if="store.history.length === 0"><td colspan="7" class="py-12 text-center text-sm text-slate-500">Belum ada riwayat mutasi.</td></tr>
              <tr v-for="log in paginatedHistory" :key="log.id" class="text-xs text-slate-600">
                <td class="px-6 py-4 font-mono">{{ formatDateTime(log.date) }}</td>
                <td class="px-6 py-4"><span class="px-2 py-0.5 rounded border" :class="log.type === 'IN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'">{{ log.type }}</span></td>
                <td class="px-6 py-4 font-bold text-slate-800">{{ log.itemName }}</td>
                <td class="px-6 py-4 text-center font-black" :class="log.type === 'IN' ? 'text-green-600' : 'text-orange-600'">{{ log.type === 'IN' ? '+' : '-' }}{{ log.qty }}</td>
                <td class="px-6 py-4">
                  <span v-if="log.requester_name" class="font-semibold text-slate-700">{{ log.requester_name }}</span>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="px-6 py-4 font-semibold">{{ log.actor_name }}</td>
                <td class="px-6 py-4 italic">{{ log.note }}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
             <div class="flex flex-1 justify-between sm:hidden">
                <button @click="historyPage > 1 ? historyPage-- : null" :disabled="historyPage === 1" class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Previous</button>
                <button @click="historyPage < totalHistoryPages ? historyPage++ : null" :disabled="historyPage === totalHistoryPages || totalHistoryPages === 0" class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Next</button>
             </div>
             <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-slate-700">
                    Menampilkan
                    <span class="font-bold text-slate-900">{{ (historyPage - 1) * itemsPerPage + 1 }}</span>
                    sampai
                    <span class="font-bold text-slate-900">{{ Math.min(historyPage * itemsPerPage, store.history.length) }}</span>
                    dari
                    <span class="font-bold text-slate-900">{{ store.history.length }}</span>
                    riwayat
                  </p>
                </div>
                <div>
                   <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button @click="historyPage > 1 ? historyPage-- : null" :disabled="historyPage === 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"><ChevronLeftIcon class="h-5 w-5" /></button>
                      
                      <button v-for="p in totalHistoryPages" :key="p" @click="historyPage = p" :class="[p === historyPage ? 'relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0']">
                        {{ p }}
                      </button>

                      <button @click="historyPage < totalHistoryPages ? historyPage++ : null" :disabled="historyPage === totalHistoryPages || totalHistoryPages === 0" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"><ChevronRightIcon class="h-5 w-5" /></button>
                   </nav>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <StockFormModal
    :show="isModalOpen"
    :stock-to-edit="selectedItem"
    :atk-options="store.atks"
    :unit-options="store.units"
    @close="closeModal"
    @save="handleStockSave"
  />
  <StockDetailModal
    :show="isDetailModalOpen"
    :item="selectedItem"
    @close="closeDetailModal" 
    @edit="handleEditFromDetail"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useInventoryStore } from '../../stores/inventoryStore';
import StockFormModal from '../../components/admin/StockFormModal.vue';
import { 
  MagnifyingGlassIcon, PlusIcon, ArchiveBoxIcon, XMarkIcon, CalendarDaysIcon, 
  CheckCircleIcon, XCircleIcon, NoSymbolIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline';
import StockDetailModal from '../../components/admin/StockDetailModal.vue';

const store = useInventoryStore();

// UI STATE
const activeTab = ref('stock');
const searchQuery = ref('');
const selectedUnit = ref('Semua Unit');
const toast = ref({ show: false, message: '', type: 'success' });
const isModalOpen = ref(false);
const selectedItem = ref(null);
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
const isDetailModalOpen = ref(false);

// PAGINATION STATE
const stockPage = ref(1);
const historyPage = ref(1);
const itemsPerPage = 10;

// TIME HELPERS
const currentTime = ref('');
const currentDate = ref('');
let timer = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('id-ID', { hour12: false });
  currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// DATA HELPERS
const getATK = (id) => store.atks.find(a => a.id === id) || { name: 'Item', code: '-', url_photo: '' };
const getUnitAlias = (id) => store.units.find(u => u.id === id)?.alias || '-';

const uniqueUnits = computed(() => {
  const ids = [...new Set(store.stocks.map(s => s.unit_id))];
  return store.units.filter(u => ids.includes(u.id));
});

// --- FILTER & PAGINATION LOGIC (STOCK) ---
const filteredStock = computed(() => {
  return store.stocks.filter(s => {
    const atk = getATK(s.item_id);
    const matchSearch = atk.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || atk.code.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchUnit = selectedUnit.value === 'Semua Unit' || s.unit_id === selectedUnit.value;
    return matchSearch && matchUnit;
  });
});

const paginatedStock = computed(() => {
  const start = (stockPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredStock.value.slice(start, end);
});

const totalStockPages = computed(() => Math.ceil(filteredStock.value.length / itemsPerPage) || 1);

// --- PAGINATION LOGIC (HISTORY) ---
const paginatedHistory = computed(() => {
  const start = (historyPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return store.history.slice(start, end);
});

const totalHistoryPages = computed(() => Math.ceil(store.history.length / itemsPerPage) || 1);

const resetPage = () => {
  stockPage.value = 1; // Reset saat filter berubah
};

const switchTab = (tab) => {
  activeTab.value = tab;
};

// ACTIONS
const triggerToast = (msg, type) => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => toast.value.show = false, 3000);
};

const openStockModal = (item) => {
  selectedItem.value = item ? { ...item } : null;
  isModalOpen.value = true;
};

const closeModal = () => { isModalOpen.value = false; selectedItem.value = null; };

const openDetailModal = (item) => {
  // Ambil data referensi dari master ATK dan Unit
  const atkMaster = getATK(item.item_id);
  const unitMaster = store.units.find(u => u.id === item.unit_id);
  const categoryName = store.categories.find(c => c.id === atkMaster.category_id)?.name || 'Umum';

  // Susun object data yang lengkap untuk dikirim ke Detail Modal
  selectedItem.value = {
    ...item,
    stock: item.stock,
    name: atkMaster.name,
    sku: atkMaster.code,
    uom: atkMaster.uom,
    url_photo: atkMaster.url_photo,
    unit: unitMaster?.alias || '-',
    category: categoryName,
    // Ambil data batch (pastikan struktur di store sudah FIFO siap)
    batches: item.batches || [] 
  };
  isDetailModalOpen.value = true;
};

const closeDetailModal = () => {
  isDetailModalOpen.value = false;
  selectedItem.value = null;
};

// 4. LOGIC KETIKA TOMBOL EDIT DI DALAM DETAIL MODAL DIKLIK
const handleEditFromDetail = () => {
  // Simpan item yang sedang dilihat
  const itemToEdit = { ...selectedItem.value };
  // Tutup modal detail
  closeDetailModal();
  // Buka modal form edit (fungsi openStockModal yang sudah ada sebelumnya)
  // Perlu sedikit penyesuaian di fungsi openStockModal asli agar menerima item penuh
  openStockModal(itemToEdit); 
};

const handleStockSave = async (formData) => {
  try {
    const admin = JSON.parse(localStorage.getItem('activeUser') || '{}');
    const actor = admin.full_name || 'Administrator';

    if (formData.id) {
      // UPDATE STOK
      const qtyChange = parseInt(formData.txQty || 0);
      const type = formData.txType?.toUpperCase() || 'IN';
      
      await axios.put(`http://localhost:3000/api/stocks/${formData.id}`, {
        stock: type === 'IN' ? (formData.stock + qtyChange) : (formData.stock - qtyChange),
        stock_min: formData.stock_min,
        price: formData.price,
        status: formData.status
      });

      if (qtyChange > 0) {
        // Sudah menggunakan /api/logs (plural) sesuai server.js
        await axios.post('http://localhost:3000/api/logs', {
          type: type, 
          item_id: formData.item_id, 
          qty: qtyChange, 
          actor: actor, 
          note: formData.txNote || 'Koreksi Manual'
        });
      }
      // ...
      } else {
        await axios.post('http://localhost:3000/api/stocks', formData);
        // Sudah menggunakan /api/logs (plural) sesuai server.js
        await axios.post('http://localhost:3000/api/logs', {
          type: 'IN', 
          item_id: formData.item_id, 
          qty: formData.stock, 
          actor: actor, 
          note: 'Initial Stock'
        });
      }
    
    await store.fetchAllData();
    closeModal();
  } catch (error) {
    triggerToast('Kesalahan database. Cek sisa stok!', 'error');
  }
};

const handleDelete = (item) => { itemToDelete.value = item; showDeleteModal.value = true; };
const closeDeleteModal = () => { showDeleteModal.value = false; itemToDelete.value = null; };

const confirmDeleteAction = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/stocks/${itemToDelete.value.id}`);
    await store.fetchAllData();
    triggerToast('Data stok berhasil dihapus.', 'success');
    closeDeleteModal();
  } catch (error) {
    triggerToast('Gagal menghapus data.', 'error');
  }
};

const formatDateTime = (str) => new Date(str).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

// --- EXPORT KE EXCEL ---
const buildExportFilename = (prefix) => {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 19).replace(/[-:T]/g, '');
  return `${prefix}_${stamp}.xlsx`;
};

const exportStockToExcel = () => {
  try {
    if (filteredStock.value.length === 0) {
      return triggerToast('Tidak ada data stok untuk di-export.', 'error');
    }

    const rows = filteredStock.value.map(item => {
      const atk = getATK(item.item_id);
      return {
        'Kode Barang': atk.code,
        'Nama Barang': atk.name,
        'Unit Kerja': getUnitAlias(item.unit_id),
        'Stok': item.stock,
        'Satuan': atk.uom,
        'Stok Minimum': item.stock_min,
        'Harga Beli (Rp)': item.price,
        'Status': item.status
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 16 }, { wch: 30 }, { wch: 18 }, { wch: 10 },
      { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 10 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stok Fisik Unit');
    XLSX.writeFile(wb, buildExportFilename('Stok_ATK'));

    triggerToast('Data stok berhasil di-export.', 'success');
  } catch (error) {
    console.error(error);
    triggerToast('Gagal export data stok.', 'error');
  }
};

const exportHistoryToExcel = () => {
  try {
    if (store.history.length === 0) {
      return triggerToast('Tidak ada riwayat mutasi untuk di-export.', 'error');
    }

    const rows = store.history.map(log => ({
      'Waktu': formatDateTime(log.date),
      'Tipe': log.type,
      'Barang': log.itemName,
      'Qty': log.type === 'IN' ? log.qty : -log.qty,
      'Diminta Oleh': log.requester_name || '-',
      'Disetujui Oleh': log.actor_name,
      'Catatan': log.note || ''
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 16 }, { wch: 8 }, { wch: 30 }, { wch: 8 },
      { wch: 20 }, { wch: 20 }, { wch: 28 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Log Mutasi Stok');
    XLSX.writeFile(wb, buildExportFilename('Log_Mutasi_Stok'));

    triggerToast('Riwayat mutasi berhasil di-export.', 'success');
  } catch (error) {
    console.error(error);
    triggerToast('Gagal export riwayat mutasi.', 'error');
  }
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  store.fetchAllData();
});

onUnmounted(() => clearInterval(timer));
</script>