<template>
  <Teleport to="body">
    <div v-if="show" @click="onClose" class="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"></div>

    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      
      <div class="relative w-full max-w-4xl h-[85vh] transform overflow-hidden rounded-2xl bg-slate-50 text-left shadow-2xl transition-all ring-1 ring-slate-900/5 flex flex-col" @click.stop>
        
        <div class="flex items-center justify-between border-b border-slate-200 px-8 py-5 bg-white z-20 flex-shrink-0 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div class="flex items-center gap-5">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg ring-1 ring-white">
              <BuildingOfficeIcon class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-extrabold leading-6 text-slate-800 tracking-tight">
                {{ isEditing ? 'Edit Data Unit' : 'Registrasi Unit Baru' }}
              </h3>
              <p class="text-sm text-slate-500 mt-0.5 font-medium">
                Sistem validasi cerdas untuk Ref ID dan normalisasi Nomor Telepon.
              </p>
            </div>
          </div>
          <button @click="onClose" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all duration-200 hover:rotate-90">
            <XMarkIcon class="h-7 w-7" />
          </button>
        </div>

        <div class="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/80">
          <form @submit.prevent="handleValidateAndSave" class="space-y-8 max-w-5xl mx-auto pb-10">
            
            <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
              <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                <InformationCircleIcon class="h-5 w-5 text-emerald-600" />
                Identitas Utama
              </h4>
              
              <div class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ref ID <span class="text-red-500">*</span></label>
                        <div class="flex rounded-xl shadow-sm">
                          <div class="relative">
                            <select v-model="refPrefix" class="h-full rounded-l-xl border-y border-l border-r-0 border-slate-300 bg-slate-50 text-slate-600 font-bold text-sm pl-3 pr-7 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 appearance-none outline-none">
                              <option value="UID">UID</option>
                              <option value="UIW">UIW</option>
                              <option value="UP3">UP3</option>
                              <option value="ULP">ULP</option>
                              <option value="PUSAT">PUSAT</option>
                            </select>
                            <ChevronDownIcon class="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <div class="relative flex-1">
                             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="text-slate-400 font-bold text-sm">-</span>
                             </div>
                             <input 
                               v-model="refNumber" 
                               @input="handleRefNumberInput"
                               type="text" 
                               maxlength="5" 
                               required 
                               class="block w-full rounded-r-xl border border-slate-300 bg-white text-slate-800 font-semibold tracking-wide focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 pl-6 py-2.5 transition-all outline-none sm:text-sm" 
                               :class="{'border-red-500 ring-red-100': idValidationError || duplicateDetails.ref_id}"
                               placeholder="1001" 
                             />
                          </div>
                        </div>
                        <p v-if="idValidationError" class="text-[10px] text-red-600 pt-1 ml-1 font-bold italic animate-pulse">
                           {{ idValidationError }}
                        </p>
                        <p v-else-if="duplicateDetails.ref_id" class="text-[10px] text-red-600 pt-1 ml-1 font-bold italic animate-pulse">
                           Kode Unit ini sudah digunakan oleh unit lain!
                        </p>
                        <p v-else class="text-[10px] text-emerald-600 pt-1 ml-1 font-medium">
                           Preview Kode: <strong>{{ localUnit.ref_id || '-' }}</strong>
                        </p>
                      </div>

                      <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">UNIT Induk</label>
                        <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <QueueListIcon class="h-5 w-5 text-emerald-500" />
                        </div>
                        <input 
                          :value="localUnit.parent_id === 3 ? 'UID PUSAT (KPS-001)' : localUnit.parent_id" 
                          type="text" 
                          readonly 
                          class="form-input-bold pl-11 bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed outline-none" 
                        />
                      </div>
                      <p class="text-[10px] text-slate-400 mt-1 ml-1 font-medium italic">
                        * Unit baru otomatis berada di bawah koordinasi Kantor Pusat.
                      </p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Alias Unit <span class="text-red-500">*</span></label>
                        <div class="relative group">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600">
                              <span class="text-sm font-bold text-slate-500">{{ refPrefix }}</span>
                          </div>
                          <input v-model="unitRegion" @input="handleRegionInput" type="text" maxlength="30" required class="form-input-bold capitalize outline-none" :class="refPrefix.length > 3 ? 'pl-[4.5rem]' : 'pl-14'" placeholder="Jatim" />
                        </div>
                      </div>
                      
                      <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Lengkap <span class="text-red-500">*</span></label>
                        <input v-model="localUnit.name" type="text" required class="form-input-bold px-4 outline-none" placeholder="cth: PT PLN (Persero)..." />
                      </div>
                  </div>
              </div>
            </div>

            <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
              <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MapPinIcon class="h-5 w-5 text-cyan-600" />
                Kontak & Lokasi
              </h4>

              <div class="space-y-6">
                <div class="space-y-2">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nomor Telepon Unit <span class="text-red-500">*</span></label>
                    <div class="relative group w-full md:w-1/2">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <PhoneIcon class="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        v-model="localUnit.phone" 
                        @input="filterPhoneInput" 
                        type="text" 
                        required 
                        class="form-input-bold pl-11 outline-none" 
                        :class="{'border-red-500 ring-red-100': duplicateDetails.phone}"
                        placeholder="cth: (021) 123456" 
                      />
                    </div>
                    <p v-if="duplicateDetails.phone" class="text-[10px] text-red-600 pt-1 ml-1 font-bold italic animate-pulse">
                        Nomor telepon sudah digunakan oleh unit lain (format diabaikan)!
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Alamat Kantor <span class="text-red-500">*</span></label>
                    <div class="relative group">
                      <div class="absolute top-3.5 left-3.5 pointer-events-none">
                        <MapPinIcon class="h-5 w-5 text-slate-400" />
                      </div>
                      <textarea v-model="localUnit.address" rows="3" required class="form-input-bold pl-11 py-3 resize-none outline-none" placeholder="Masukkan alamat lengkap..."></textarea>
                    </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer group h-full" @click="localUnit.is_active = localUnit.is_active ? 0 : 1">
                <div class="flex gap-4 items-center">
                    <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600"><ShieldCheckIcon class="h-6 w-6" /></div>
                    <div>
                      <span class="block text-sm font-bold text-slate-800">Status Operasional</span>
                      <span class="text-[11px] text-slate-500">Unit Aktif/Non-Aktif</span>
                    </div>
                </div>
                <button type="button" class="relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors duration-200" :class="localUnit.is_active ? 'bg-green-500' : 'bg-slate-300'">
                  <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition" :class="localUnit.is_active ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div class="flex items-center justify-between px-8 py-5 bg-white border-t border-slate-200 shrink-0 rounded-b-2xl z-20 shadow-sm">
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
            <button @click="onClose" class="px-6 py-2.5 text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Batal</button>
            <button 
              @click="handleValidateAndSave" 
              :disabled="!isFormReady"
              class="px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all min-w-[120px]"
              :class="!isFormReady ? 'bg-slate-300 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/30'"
            >
              {{ isEditing ? 'Simpan Perubahan' : 'Tambah Unit' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="localError.show" class="fixed bottom-10 right-10 z-[2000] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3 max-w-sm">
        <ExclamationCircleIcon class="h-6 w-6 shrink-0" />
        <span class="font-bold text-sm">{{ localError.message }}</span>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useInventoryStore } from '../../stores/inventoryStore';
import { 
  BuildingOfficeIcon, MapPinIcon, XMarkIcon, TagIcon, PhoneIcon,
  ShieldCheckIcon, InformationCircleIcon, CheckBadgeIcon, 
  ChevronDownIcon, QueueListIcon, ExclamationCircleIcon, XCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({ show: Boolean, unitToEdit: Object });
const emit = defineEmits(['close', 'save']);

const store = useInventoryStore();
const localUnit = ref({});
const isEditing = computed(() => !!localUnit.value.id);
const localError = ref({ show: false, message: '' });

// --- LOGIKA KODE & ALIAS ---
const refPrefix = ref('UID'); 
const refNumber = ref('');    
const unitRegion = ref('');   

const updateRefId = () => { localUnit.value.ref_id = `${refPrefix.value}-${refNumber.value}`; };
const handlePrefixChange = () => { updateRefId(); localUnit.value.alias = unitRegion.value ? `${refPrefix.value} ${unitRegion.value}` : ''; };

const handleRefNumberInput = (e) => {
  const val = e.target.value.replace(/[^0-9]/g, '');
  refNumber.value = val;
  updateRefId();
};

const handleRegionInput = (e) => {
  const val = e.target.value.replace(/[^a-zA-Z\s]/g, ''); 
  unitRegion.value = val;
  localUnit.value.alias = val ? `${refPrefix.value} ${val}` : '';
};

// const filterParentId = (e) => {
//   const val = e.target.value.replace(/[^0-9]/g, '');
//   localUnit.value.parent_id = val === '' ? 0 : parseInt(val);
// };

const filterPhoneInput = (e) => {
  localUnit.value.phone = e.target.value;
};

// --- LOGIKA VALIDASI KETAT ID ---
const idValidationError = computed(() => {
  if (refNumber.value.length === 0) return null;
  if (refNumber.value.length < 3) return "ID Unit minimal harus 3 digit!";
  if (refNumber.value === '000') return "ID Unit tidak boleh bernilai 000!";
  return null;
});

// --- LOGIKA NORMALISASI & DUPLIKASI TELEPON ---
// Fungsi Normalizer: Membuang semua karakter selain angka
const normalizePhone = (p) => p ? p.replace(/[^0-9]/g, '') : '';

const duplicateDetails = computed(() => {
  const current = localUnit.value;
  // Filter unit selain data yang sedang di-edit
  const otherUnits = store.units.filter(u => u.id !== current.id);
  const normalizedCurrentPhone = normalizePhone(current.phone);

  return {
    ref_id: otherUnits.some(u => u.ref_id === current.ref_id && refNumber.value.length >= 3),
    phone: normalizedCurrentPhone.length > 0 && otherUnits.some(u => normalizePhone(u.phone) === normalizedCurrentPhone)
  };
});

const isAnyDuplicate = computed(() => duplicateDetails.value.ref_id || duplicateDetails.value.phone);

// --- VALIDATION SUMMARY (KONSISTEN DENGAN ATK) ---
const validationSummary = computed(() => {
  const errors = [];
  
  if (idValidationError.value) errors.push("Format Kode");
  if (!refNumber.value) errors.push("REF ID");
  if (duplicateDetails.value.ref_id) errors.push("Kode Terdaftar");
  
  if (!unitRegion.value?.trim()) errors.push("Alias Unit");
  if (!localUnit.value.name?.trim()) errors.push("Nama Lengkap");
  if (!localUnit.value.phone?.trim()) errors.push("No Telepon");
  if (duplicateDetails.value.phone) errors.push("Telepon Terdaftar");
  if (!localUnit.value.address?.trim()) errors.push("Alamat");

  return errors;
});

const isFormComplete = computed(() => validationSummary.value.length === 0);
const isFormReady = computed(() => isFormComplete.value && !idValidationError.value && !isAnyDuplicate.value);

const handleValidateAndSave = () => {
  if (idValidationError.value) return showError(idValidationError.value);
  if (duplicateDetails.value.ref_id) return showError("Ref ID sudah terdaftar!");
  if (duplicateDetails.value.phone) return showError("Nomor telepon sudah digunakan unit lain!");
  if (!isFormComplete.value) return showError("Data belum lengkap!");

  emit('save', { ...localUnit.value });
};

const showError = (msg) => {
  localError.value = { show: true, message: msg };
  setTimeout(() => localError.value.show = false, 4000);
};

watch(() => props.show, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    if (props.unitToEdit) {
      localUnit.value = { ...props.unitToEdit };
      const partsCode = localUnit.value.ref_id?.split('-') || [];
      refPrefix.value = partsCode[0] || 'UID';
      refNumber.value = partsCode[1] || '';
      const partsAlias = localUnit.value.alias?.split(' ') || [];
      unitRegion.value = partsAlias.slice(1).join(' ');
    } else {
      localUnit.value = { ref_id: '', parent_id: 3, alias: '', name: '', address: '', phone: '', is_active: 1 };
      refPrefix.value = 'UID'; refNumber.value = ''; unitRegion.value = '';
    }
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => document.body.style.overflow = '');
const onClose = () => emit('close');
</script>

<style scoped>
.form-input-bold { @apply block w-full rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 py-2.5 transition-all sm:text-sm; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.animate-bounce { animation: bounce 0.5s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
</style>