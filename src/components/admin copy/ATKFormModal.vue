<template>
  <Teleport to="body">
    <div v-if="show" @click="onClose" class="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"></div>

    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      
      <div class="relative w-full max-w-6xl h-[90vh] transform overflow-hidden rounded-2xl bg-slate-50 text-left shadow-2xl transition-all ring-1 ring-slate-900/5 flex flex-col" @click.stop>
        
        <div class="flex items-center justify-between border-b border-slate-200 px-8 py-5 bg-white z-20 flex-shrink-0 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div class="flex items-center gap-5 relative">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg ring-1 ring-white">
              <ArchiveBoxIcon v-if="!isEditing" class="h-7 w-7" />
              <PencilSquareIcon v-else class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-extrabold leading-6 text-slate-800 tracking-tight">
                {{ isEditing ? 'Edit Master Barang' : 'Registrasi Barang Baru' }}
              </h3>
              <p class="text-sm text-slate-500 mt-0.5 font-medium">
                Lengkapi spesifikasi barang. Kolom bertanda <span class="text-red-500 font-bold">*</span> wajib diisi.
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
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center shrink-0">
                  Visual Barang <span class="text-red-500">*</span>
                </label>
                
                <div 
                  class="relative w-full aspect-square rounded-2xl bg-slate-50 border-4 border-white shadow-xl ring-1 flex items-center justify-center overflow-hidden group cursor-pointer transition-all hover:ring-4 hover:ring-blue-200 shrink-0" 
                  :class="localItem.url_photo ? 'ring-slate-200' : 'ring-red-200 bg-red-50 animate-pulse'"
                  @click="triggerFileInput"
                >
                  <img v-if="localItem.url_photo" :src="localItem.url_photo" alt="Produk" class="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" />
                  
                  <div v-else class="flex flex-col items-center justify-center text-slate-300 group-hover:text-blue-400 transition-colors">
                      <PhotoIcon class="h-20 w-20 mb-1" :class="{'text-red-200': !localItem.url_photo}" />
                      <span class="text-[10px] font-bold uppercase tracking-wide opacity-50 text-red-400">Wajib Upload</span>
                  </div>

                  <div class="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                    <CameraIcon class="h-8 w-8 text-white mb-1 drop-shadow-md" />
                    <span class="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md">Ubah Foto</span>
                  </div>
                </div>
                
                <div class="mt-8 flex flex-col items-center w-full">
                  <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />
                  <button type="button" @click="triggerFileInput" class="w-full px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-bold hover:border-blue-500 hover:text-blue-600 transition-all mb-3 shadow-sm">
                    Pilih File Foto
                  </button>
                  <p v-if="!localItem.url_photo" class="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Foto belum dipilih!</p>
                </div>
             </div>
          </div>

          <div class="flex-1 h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
            <div class="p-8 max-w-3xl mx-auto pb-32">
              <form @submit.prevent="handleValidateAndSave" class="space-y-8">
                
                <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <TagIcon class="h-5 w-5 text-blue-500" /> Spesifikasi Produk
                    </h4>
                    
                    <div class="space-y-6">
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div class="space-y-2">
                           <label class="label-modern">Kode Barang (SKU) <span class="text-red-500">*</span></label>
                           <div class="relative group">
                              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                 <span class="text-slate-400 font-bold text-sm">ATK-</span>
                              </div>
                              <input 
                                :value="atkCodeSuffix"
                                @input="handleCodeInput"
                                type="text" maxlength="5" class="form-input-bold pl-12 font-mono" placeholder="001" 
                              />
                           </div>
                           <p v-if="idValidationError" class="text-error">{{ idValidationError }}</p>
                           <p v-else-if="isCodeDuplicate" class="text-error">Kode sudah digunakan</p>
                         </div>
                         
                         <div class="space-y-2">
                           <label class="label-modern">Kategori <span class="text-red-500">*</span></label>
                           <select v-model="localItem.category_id" class="form-select-bold px-4" @change="localItem.uom = ''">
                             <option value="" disabled>Pilih Kategori...</option>
                             <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                           </select>
                           <p v-if="!localItem.category_id" class="text-error">Wajib dipilih</p>
                         </div>
                       </div>

                       <div class="space-y-2">
                         <label class="label-modern">Nama Barang <span class="text-red-500">*</span></label>
                         <input v-model="localItem.name" type="text" class="form-input-bold px-4" placeholder="cth: Kertas A4 Sinar Dunia 80gr" />
                         <p v-if="!localItem.name?.trim()" class="text-error">Nama barang wajib diisi</p>
                       </div>

                       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div class="space-y-2">
                            <label class="label-modern">Satuan (UOM) <span class="text-red-500">*</span></label>
                            <select v-model="localItem.uom" class="form-select-bold px-4" :disabled="!localItem.category_id">
                                <option value="" disabled>Pilih Satuan...</option>
                                <option v-for="u in availableUOMs" :key="u" :value="u">{{ u }}</option>
                            </select>
                            <p v-if="!localItem.uom" class="text-error">Pilih satuan</p>
                          </div>

                          <div class="space-y-2">
                             <label class="label-modern">Harga Estimasi (Rp) <span class="text-red-500">*</span></label>
                             <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span class="text-slate-400 font-bold text-xs">Rp</span>
                                </div>
                                <input v-model.number="localItem.price" type="number" class="form-input-bold pl-10" />
                             </div>
                          </div>
                       </div>

                       <div class="space-y-2">
                          <label class="label-modern">Deskripsi / Spesifikasi</label>
                          <textarea v-model="localItem.description" rows="3" class="form-input-bold px-4 py-3 resize-none outline-none" placeholder="cth: Warna Putih, 80 GSM, Ukuran 210 x 297 mm"></textarea>
                       </div>
                    </div>
                </div>

                <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                    <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                       <QueueListIcon class="h-5 w-5 text-orange-500" /> Ambang Batas Stok (Threshold)
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div class="space-y-2">
                          <label class="label-modern">Minimum Stok <span class="text-red-500">*</span></label>
                          <input v-model.number="localItem.min_stock" type="number" class="form-input-bold px-4" />
                          <p class="text-[10px] text-slate-400 italic">Notifikasi stok kritis jika dibawah angka ini.</p>
                       </div>
                       <div class="space-y-2">
                          <label class="label-modern">Maksimum Stok <span class="text-red-500">*</span></label>
                          <input v-model.number="localItem.max_stock" type="number" class="form-input-bold px-4" />
                          <p class="text-[10px] text-slate-400 italic">Target stok ideal di gudang.</p>
                       </div>
                    </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between px-8 py-5 bg-white border-t border-slate-200 shrink-0 rounded-b-2xl z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] relative">
          <div class="flex-1 mr-4">
              <div v-if="validationSummary.length > 0" class="flex flex-col items-start gap-1">
                <p class="text-[10px] font-black text-red-500 uppercase tracking-wide flex items-center gap-1">
                   <ExclamationCircleIcon class="h-3 w-3" /> Data Belum Lengkap:
                </p>
                <div class="flex flex-wrap gap-1">
                   <span v-for="(err, idx) in validationSummary" :key="idx" class="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-bold">
                      {{ err }}
                   </span>
                </div>
              </div>
              <div v-else class="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckBadgeIcon class="h-5 w-5" /> SEMUA DATA VALID
              </div>
          </div>

          <div class="flex gap-4">
            <button @click="onClose" class="px-6 py-2.5 text-sm font-bold bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all">
               Batal
            </button>
            <button 
              @click="handleValidateAndSave" 
              :disabled="validationSummary.length > 0 || isCodeDuplicate"
              class="px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all min-w-[140px]"
              :class="(validationSummary.length > 0 || isCodeDuplicate) ? 'bg-slate-300 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-indigo-500/30'"
            >
              {{ isEditing ? 'Simpan Perubahan' : 'Registrasi Barang' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="localError.show" class="fixed bottom-10 right-10 z-[2000] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
        <ExclamationCircleIcon class="h-6 w-6" />
        <span class="font-bold text-sm">{{ localError.message }}</span>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useInventoryStore } from '../../stores/inventoryStore';
import { 
  ArchiveBoxIcon, XMarkIcon, CheckBadgeIcon, TagIcon, 
  QueueListIcon, PhotoIcon, CameraIcon, PencilSquareIcon, 
  ExclamationCircleIcon, InformationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({ show: Boolean, itemToEdit: Object, categoryOptions: Array });
const emit = defineEmits(['close', 'save']);

const store = useInventoryStore();
const localItem = ref({});
const fileInput = ref(null);
const localError = ref({ show: false, message: '' });

const isEditing = computed(() => !!localItem.value.id);

// --- LOGIKA UOM MAP ---
const uomMap = { 
  1: ['Pcs', 'Lusin', 'Pack', 'Box', 'Buku'], 
  2: ['Rim', 'Lembar', 'Map', 'Roll'],
  3: ['Botol', 'Cartridge'],
  4: ['Unit', 'Pcs', 'Buah', 'Set'],
  5: ['Roll', 'Pack', 'Pcs']
};
const availableUOMs = computed(() => localItem.value.category_id ? (uomMap[localItem.value.category_id] || ['Pcs']) : []);

// --- LOGIKA KODE (SKU) ---
const atkCodeSuffix = computed(() => localItem.value.code?.replace(/^ATK-/, '') || '');
const handleCodeInput = (e) => {
  const val = e.target.value.replace(/[^0-9]/g, '');
  localItem.value.code = 'ATK-' + val;
};

const idValidationError = computed(() => {
  const suffix = atkCodeSuffix.value;
  if (suffix.length === 0) return "Wajib diisi";
  if (suffix.length < 3) return "Minimal 3 digit";
  return null;
});

const isCodeDuplicate = computed(() => {
  return store.atks.some(a => a.code === localItem.value.code && a.id !== localItem.value.id);
});

// --- VALIDATION SUMMARY ---
const validationSummary = computed(() => {
  const errors = [];
  if (!localItem.value.url_photo) errors.push("Foto Barang");
  if (idValidationError.value) errors.push("Format Kode");
  if (!localItem.value.name?.trim()) errors.push("Nama Barang");
  if (!localItem.value.category_id) errors.push("Kategori");
  if (!localItem.value.uom) errors.push("Satuan");
  if (localItem.value.price <= 0) errors.push("Harga");
  return errors;
});

const handleValidateAndSave = () => {
  if (validationSummary.value.length > 0) return showError("Lengkapi data yang kurang!");
  if (isCodeDuplicate.value) return showError("Kode SKU sudah terdaftar!");
  emit('save', { ...localItem.value });
};

const triggerFileInput = () => fileInput.value.click();
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) return showError("Maksimal 2MB!");
    localItem.value.url_photo = URL.createObjectURL(file);
  }
};

const showError = (msg) => {
  localError.value = { show: true, message: msg };
  setTimeout(() => localError.value.show = false, 4000);
};

watch(() => props.show, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    localItem.value = props.itemToEdit ? { ...props.itemToEdit } : {
      code: 'ATK-', name: '', category_id: '', uom: '', 
      min_stock: 10, max_stock: 100, price: 0, status: 'Active', url_photo: '', description: ''
    };
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => document.body.style.overflow = '');
const onClose = () => emit('close');
</script>

<style scoped>
.label-modern { @apply block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1; }
.form-input-bold { @apply block w-full rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all outline-none sm:text-sm shadow-sm; }
.form-select-bold { @apply block w-full rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all cursor-pointer outline-none sm:text-sm shadow-sm; }
.text-error { @apply text-[10px] font-bold text-red-500 mt-1 italic animate-pulse; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>