<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="show" 
        @click="$emit('close')" 
        class="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      ></div>
    </Transition>

    <Transition name="zoom">
      <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div 
          class="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto border border-white/20"
          @click.stop
        >
          <div class="relative px-8 py-6 border-b border-slate-100 bg-white shrink-0">
            <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>
            
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-5">
                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shrink-0">
                  <ArchiveBoxIcon class="h-8 w-8" />
                </div>
                <div class="min-w-0">
                  <h3 class="text-2xl font-black text-slate-800 leading-tight truncate">{{ item?.name }}</h3>
                  <div class="flex flex-wrap gap-2 mt-1.5">
                    <span class="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200 uppercase tracking-widest font-mono">SKU: {{ item?.sku }}</span>
                    <span class="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-widest flex items-center gap-1">
                      <MapPinIcon class="h-3 w-3" /> {{ item?.unit }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button 
                  @click="$emit('edit')" 
                  class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                  Edit Parameter
                </button>
                <button 
                  @click="$emit('close')" 
                  class="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 hover:rotate-90"
                >
                  <XMarkIcon class="h-7 w-7" />
                </button>
              </div>
            </div>
          </div>

          <div class="p-8 overflow-y-auto custom-scrollbar bg-slate-50/40 flex-1">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div class="lg:col-span-4 space-y-6">
                <div class="relative w-full aspect-square rounded-[2rem] bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden p-6 group transition-all hover:shadow-xl hover:ring-4 hover:ring-blue-50">
                  <img v-if="item?.url_photo" :src="item.url_photo" alt="Barang" class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                  <PhotoIcon v-else class="h-20 w-20 text-slate-200" />
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Teknis</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-bold text-slate-500">Kategori</span>
                      <span class="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{{ item?.category }}</span>
                    </div>
                    <div class="flex justify-between items-center border-t border-slate-50 pt-3">
                      <span class="text-xs font-bold text-slate-500">Satuan</span>
                      <span class="text-xs font-black text-blue-600">{{ item?.uom }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-8 space-y-6">
                
                <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group">
                   <div class="flex items-center gap-4">
                      <div class="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                         <ArchiveBoxIcon class="h-6 w-6" />
                      </div>
                      <div>
                         <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Stok Real-time</p>
                         <div class="flex items-baseline gap-1.5">
                            <span class="text-2xl font-black text-slate-800">{{ totalStock }}</span>
                            <span class="text-[10px] font-bold text-slate-400">{{ item?.uom }}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div class="flex flex-col items-end">
                      <div v-if="totalStock <= (item?.stock_min || 0)" class="flex items-center gap-1.5 text-red-500 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                         <ExclamationTriangleIcon class="h-3.5 w-3.5 animate-pulse" />
                         <span class="text-[9px] font-black uppercase tracking-tighter">Stok Kritis</span>
                      </div>
                      <div v-else class="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                         <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span class="text-[9px] font-black uppercase tracking-tighter">Persediaan Aman</span>
                      </div>
                      <div class="mt-2 h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                            class="h-full rounded-full transition-all duration-1000" 
                            :class="totalStock <= (item?.stock_min || 0) ? 'bg-red-500' : 'bg-blue-500'"
                            :style="{ width: Math.min((totalStock / (item?.max_stock || 100)) * 100, 100) + '%' }"
                         ></div>
                      </div>
                   </div>
                </div>

                <div class="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <ArrowsRightLeftIcon class="h-4 w-4 text-indigo-500" /> Riwayat Mutasi Barang
                    </h4>
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-bold text-slate-400 uppercase">{{ currentPage }} / {{ totalPages }}</span>
                      <div class="flex gap-1">
                        <button @click="currentPage > 1 ? currentPage-- : null" :disabled="currentPage === 1" class="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"><ChevronLeftIcon class="h-4 w-4"/></button>
                        <button @click="currentPage < totalPages ? currentPage++ : null" :disabled="currentPage === totalPages" class="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"><ChevronRightIcon class="h-4 w-4"/></button>
                      </div>
                    </div>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr class="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50/30">
                          <th class="px-6 py-3 text-left">Waktu</th>
                          <th class="px-6 py-3 text-center">Tipe</th>
                          <th class="px-6 py-3 text-right">Qty</th>
                          <th class="px-6 py-3 text-left">Oleh</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50">
                        <tr v-for="log in paginatedHistory" :key="log.id" class="hover:bg-blue-50/30 transition-colors group">
                          <td class="px-6 py-4 text-[10px] font-bold text-slate-500 font-mono">{{ formatDate(log.date) }}</td>
                          <td class="px-6 py-3 text-center">
                            <span :class="log.type === 'IN' ? 'text-green-600 bg-green-50 border-green-100' : 'text-orange-600 bg-orange-50 border-orange-100'" class="px-2 py-0.5 rounded text-[9px] font-black border uppercase">
                              {{ log.type }}
                            </span>
                          </td>
                          <td class="px-6 py-3 text-right font-black text-sm" :class="log.type === 'IN' ? 'text-green-600' : 'text-orange-600'">
                            {{ log.type === 'IN' ? '+' : '-' }}{{ log.qty }}
                          </td>
                          <td class="px-6 py-3 text-[10px] font-bold text-slate-600">{{ log.actor_name }}</td>
                        </tr>
                        <tr v-if="itemHistory.length === 0">
                          <td colspan="4" class="px-6 py-24 text-center text-slate-400 italic text-xs">Belum ada riwayat pergerakan stok.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center shrink-0">
             <div class="flex items-center gap-2">
               <div class="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
               <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Referensi: EATK_STOCK_LOG</span>
             </div>
             <p class="text-[10px] text-slate-400 font-medium italic">Klik di luar modal untuk menutup</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useInventoryStore } from '../../stores/inventoryStore';
import { 
  XMarkIcon, MapPinIcon, ArchiveBoxIcon, PencilSquareIcon, PhotoIcon, 
  ClockIcon, ChevronLeftIcon, ChevronRightIcon,
  ExclamationTriangleIcon, ArrowsRightLeftIcon
} from '@heroicons/vue/24/outline';

const props = defineProps(['show', 'item']);
defineEmits(['close', 'edit']);

const store = useInventoryStore();

// Live data dari store agar reaktif (mencari stok terbaru di unit ini)
const liveStockData = computed(() => {
  return store.stocks.find(s => s.id === props.item?.id) || props.item;
});

// --- LOGIKA RIWAYAT MUTASI ---
const currentPage = ref(1);
const itemsPerPage = 5;

const itemHistory = computed(() => {
  if (!props.item?.item_id) return [];
  // Filter history global berdasarkan item_id dari barang yang dipilih
  return store.history.filter(log => log.item_id === props.item.item_id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalPages = computed(() => Math.ceil(itemHistory.value.length / itemsPerPage) || 1);

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return itemHistory.value.slice(start, start + itemsPerPage);
});

// --- STATISTIK DINAMIS ---
const totalStock = computed(() => {
  return liveStockData.value?.stock || 0;
});

watch(() => props.item, () => { 
  currentPage.value = 1; 
});

const formatDate = (str) => {
  if (!str) return '-';
  const d = new Date(str);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + 
         d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

// Scroll Lock
watch(() => props.show, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});

onUnmounted(() => { document.body.style.overflow = ''; });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.zoom-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.zoom-leave-active { transition: all 0.2s ease-in; }
.zoom-enter-from { opacity: 0; transform: scale(0.9) translateY(20px); }
.zoom-leave-to { opacity: 0; transform: scale(0.95); }
</style>