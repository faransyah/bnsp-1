<template>
  <Teleport to="body">
    <div v-if="show" @click="onClose" class="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"></div>

    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      
      <div class="relative w-full max-w-6xl h-[90vh] transform overflow-hidden rounded-2xl bg-slate-50 text-left shadow-2xl transition-all ring-1 ring-slate-900/5 flex flex-col" @click.stop>
        
        <div class="flex items-center justify-between border-b border-slate-200 px-8 py-5 bg-white z-20 flex-shrink-0 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div class="flex items-center gap-5 relative">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg ring-1 ring-white">
              <UserCircleIcon v-if="!isEditing" class="h-7 w-7" />
              <PencilSquareIcon v-else class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-extrabold leading-6 text-slate-800 tracking-tight">
                {{ isEditing ? 'Edit Data Pegawai' : 'Registrasi Pegawai Baru' }}
              </h3>
              <p class="text-sm text-slate-500 mt-0.5 font-medium">
                Lengkapi formulir di bawah. Kolom bertanda <span class="text-red-500 font-bold">*</span> wajib diisi.
              </p>
            </div>
          </div>
          <button @click="onClose" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all duration-200 hover:rotate-90 focus:outline-none">
            <XMarkIcon class="h-7 w-7" />
          </button>
        </div>

        <div class="flex flex-1 overflow-hidden">
          
          <div class="w-1/3 h-full bg-white border-r border-slate-200 p-8 flex flex-col items-center shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 hidden md:flex">
             <div class="w-full max-w-xs flex flex-col h-full">
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center shrink-0">
                  Foto Profil <span class="text-red-500">*</span>
                </label>
                
                <div 
                  class="relative w-48 h-48 mx-auto rounded-full bg-slate-50 border-4 border-white shadow-xl ring-1 flex items-center justify-center overflow-hidden group cursor-pointer transition-all hover:ring-4 hover:ring-blue-200 shrink-0" 
                  :class="localUser.url_photo ? 'ring-slate-200' : 'ring-red-200 bg-red-50 animate-pulse'"
                  @click="triggerFileInput"
                >
                  <img v-if="localUser.url_photo" :src="localUser.url_photo" alt="Profile" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  
                  <div v-else class="flex flex-col items-center justify-center text-slate-300 group-hover:text-blue-400 transition-colors">
                      <UserIcon class="h-24 w-24 mb-1" :class="{'text-red-200': !localUser.url_photo}" />
                      <span class="text-[10px] font-bold uppercase tracking-wide opacity-50 text-red-400">Wajib Upload</span>
                  </div>

                  <div class="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                    <CameraIcon class="h-8 w-8 text-white mb-1 drop-shadow-md" />
                    <span class="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md">Ubah Foto</span>
                  </div>
                </div>
                
                <div class="mt-8 flex flex-col items-center w-full">
                  <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />
                  <button type="button" @click="triggerFileInput" class="w-full px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-bold hover:border-blue-500 hover:text-blue-600 transition-all mb-3">
                    Pilih File Foto
                  </button>
                  <p v-if="!localUser.url_photo" class="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Foto belum dipilih!</p>
                </div>

                <div class="mt-auto bg-blue-50 p-5 rounded-2xl border border-blue-100">
                    <h5 class="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2"><LockClosedIcon class="h-4 w-4" /> Keamanan Akun</h5>
                    <p v-if="!isEditing" class="text-[11px] text-blue-700 leading-relaxed font-medium">Password otomatis ditetapkan: <span class="font-black">123</span></p>
                    <div v-else class="space-y-2">
                        <p class="text-[10px] text-blue-700 italic leading-relaxed">Password lama terenkripsi. Isi di bawah hanya jika ingin mengganti.</p>
                        <input v-model="localUser.new_password" type="password" class="form-input-bold !py-1.5 !px-3 !text-xs" placeholder="Password Baru" />
                    </div>
                </div>
             </div>
          </div>

          <div class="flex-1 h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
            <div class="p-8 max-w-3xl mx-auto pb-32"> <form @submit.prevent="handleValidateAndSave" class="space-y-8">
                
                <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                   <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                   <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                     <IdentificationIcon class="h-5 w-5 text-blue-500" /> Identitas & Kontak
                   </h4>
                   
                   <div class="space-y-6">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                          <label class="label-modern">Nama Lengkap <span class="text-red-500">*</span></label>
                          <input v-model="localUser.full_name" type="text" class="form-input-bold px-4" placeholder="Nama Lengkap" />
                          <p v-if="!localUser.full_name" class="text-error">Wajib diisi</p>
                        </div>
                        
                        <div class="space-y-2">
                          <label class="label-modern">Username <span class="text-red-500">*</span></label>
                          <div class="relative group">
                             <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span class="text-slate-400 font-bold text-sm">@</span>
                             </div>
                             <input 
                               v-model="localUser.username" 
                               @input="applyFilter($event, 'username', 'username')"
                               type="text" class="form-input-bold pl-9 lowercase" placeholder="username.pln" 
                             />
                          </div>
                          <p v-if="!localUser.username" class="text-error">Username wajib diisi</p>
                          <p v-if="duplicateDetails.username" class="text-error">Username sudah dipakai</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                          <label class="label-modern">Email Kantor <span class="text-red-500">*</span></label>
                          <div class="relative group">
                             <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <EnvelopeIcon class="h-5 w-5 text-slate-400" />
                             </div>
                             <input v-model="localUser.email" type="email" class="form-input-bold pl-12" placeholder="contoh@pln.co.id" />
                          </div>
                          <p v-if="!localUser.email || !localUser.email.includes('@')" class="text-error">Email tidak valid</p>
                          <p v-if="duplicateDetails.email" class="text-error">Email sudah terdaftar</p>
                        </div>

                        <div class="space-y-2">
                          <label class="label-modern">NIP (18 Digit) <span class="text-red-500">*</span></label>
                          <input v-model="localUser.nip" @input="applyFilter($event, 'nip', 'numeric')" maxlength="18" type="text" class="form-input-bold px-4 font-mono" placeholder="XXXXXXXXXXXXXXXXXX" />
                          <p v-if="!localUser.nip || localUser.nip.length !== 18" class="text-error">NIP harus 18 digit (Saat ini: {{ localUser.nip?.length || 0 }})</p>
                          <p v-if="duplicateDetails.nip" class="text-error">NIP sudah terdaftar</p>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <label class="label-modern">Nomor Telepon / WA <span class="text-red-500">*</span></label>
                        <div class="relative group">
                           <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <PhoneIcon class="h-5 w-5 text-slate-400" />
                           </div>
                           <input 
                              v-model="localUser.phone" 
                              @input="applyFilter($event, 'phone', 'phone')" 
                              type="text" 
                              maxlength="15"
                              class="form-input-bold pl-12" 
                              placeholder="0812xxxxxxxx" 
                           />
                        </div>
                        <div class="flex justify-between items-start">
                           <p class="text-[10px] text-slate-400 italic">Hanya angka, Min 10 - Max 15 digit.</p>
                           <p v-if="!localUser.phone || localUser.phone.length < 10" class="text-error">
                              {{ !localUser.phone ? 'Wajib diisi' : 'Minimal 10 digit' }}
                           </p>
                        </div>
                      </div>
                   </div>
                </div>

                <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                   <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                   <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <BriefcaseIcon class="h-5 w-5 text-orange-500" /> Unit & Jabatan
                   </h4>
                   <div class="space-y-6">
                      <div class="space-y-2">
                          <label class="label-modern">Unit Kerja Utama <span class="text-red-500">*</span></label>
                          <select v-model.number="localUser.unit_id" class="form-select-bold w-full" @change="handleUnitChange">
                            <option value="" disabled>Pilih Unit...</option>
                            <option v-for="unit in unitOptions" :key="unit.id" :value="unit.id">{{ unit.alias }} - {{ unit.name }}</option>
                          </select>
                          <p v-if="!localUser.unit_id" class="text-error">Pilih unit kerja</p>
                      </div>
                      <div class="space-y-2">
                          <label class="label-modern">Nama Jabatan<span class="text-red-500">*</span></label>
                          <input v-model="localUser.position_name" type="text" class="form-input-bold px-4" placeholder="cth: Officer Pengadaan" />
                          <p v-if="!localUser.position_name?.trim()" class="text-error">Nama jabatan wajib diisi</p>
                      </div>
                   </div>
                </div>

                <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                   <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                   <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <ShieldCheckIcon class="h-5 w-5 text-purple-500" /> Hak Akses & Status
                   </h4>

                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-2">
                          <label class="label-modern">Role Aplikasi <span class="text-red-500">*</span></label>
                          <div v-if="localUser.unit_id === 3">
                             <select v-model="localUser.role" class="form-select-bold px-4">
                                <option value="User">User (Pegawai)</option>
                                <option value="Admin">Administrator</option>
                             </select>
                          </div>
                          <div v-else>
                             <div class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold text-sm">
                                <ShieldCheckIcon class="h-4 w-4 text-blue-500" /> User (Pegawai)
                             </div>
                          </div>
                      </div>

                      <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 cursor-pointer h-fit self-end" @click="localUser.is_active = localUser.is_active ? 0 : 1">
                        <div>
                          <span class="block text-xs font-black text-slate-700">Akun Aktif</span>
                          <span class="text-[10px] text-slate-500">User bisa login jika aktif</span>
                        </div>
                        <button type="button" class="relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors" :class="localUser.is_active ? 'bg-green-500' : 'bg-slate-300'">
                          <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition" :class="localUser.is_active ? 'translate-x-5' : 'translate-x-0'"></span>
                        </button>
                      </div>
                   </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between px-8 py-5 bg-white border-t border-slate-200 shrink-0 rounded-b-2xl z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] relative">
          
          <div class="flex-1 mr-4">
             <div v-if="validationSummary.length > 0" class="flex flex-col items-start gap-1 animate-pulse">
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
            <div class="relative group">
               <button 
                 @click="handleValidateAndSave" 
                 :disabled="validationSummary.length > 0 || isAnyDuplicate"
                 class="px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-[120px]"
                 :class="(validationSummary.length > 0 || isAnyDuplicate) ? 'bg-slate-300 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-indigo-500/30'"
               >
                 {{ isEditing ? 'Simpan Perubahan' : 'Registrasi' }}
               </button>
               <div v-if="validationSummary.length > 0" class="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-white text-[10px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                  Tombol terkunci karena data belum lengkap.
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="localError.show" class="fixed bottom-10 right-10 z-[2000] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3">
        <ExclamationCircleIcon class="h-6 w-6" />
        <span class="font-bold text-sm">{{ localError.message }}</span>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useInventoryStore } from '../../stores/inventoryStore'; 
import { 
  UserCircleIcon, XMarkIcon, IdentificationIcon, BriefcaseIcon, BuildingOfficeIcon,
  CameraIcon, LockClosedIcon, CheckBadgeIcon, ShieldCheckIcon,
  EnvelopeIcon, PhoneIcon, UserIcon, PencilSquareIcon, ExclamationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({ show: Boolean, userToEdit: Object, unitOptions: Array });
const emit = defineEmits(['close', 'save']);

const store = useInventoryStore();
const localUser = ref({});
const isEditing = computed(() => !!localUser.value.id);
const fileInput = ref(null);
const localError = ref({ show: false, message: '' });

// Helper Trigger
const triggerFileInput = () => fileInput.value.click();
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) return showError("Ukuran foto maksimal 2MB!");
    localUser.value.url_photo = URL.createObjectURL(file);
  }
};

const handleUnitChange = () => {
  if (localUser.value.unit_id !== 3) localUser.value.role = 'User';
};

const applyFilter = (e, field, type) => {
  let val = e.target.value;
  if (type === 'numeric') val = val.replace(/[^0-9]/g, '');
  if (type === 'phone') val = val.replace(/[^0-9]/g, ''); // Phone hanya angka
  if (type === 'username') val = val.replace(/[^a-zA-Z0-9._]/g, '');
  localUser.value[field] = val;
};

// --- CHECK DUPLICATE ---
const duplicateDetails = computed(() => {
  const current = localUser.value;
  const users = store.users;
  const otherUsers = users.filter(u => u.id != current.id);

  return {
    username: otherUsers.some(u => u.username?.toLowerCase() === current.username?.toLowerCase() && current.username?.length > 0),
    nip: otherUsers.some(u => u.nip === current.nip && current.nip?.length > 0),
    email: otherUsers.some(u => u.email?.toLowerCase() === current.email?.toLowerCase() && current.email?.length > 0)
  };
});
const isAnyDuplicate = computed(() => duplicateDetails.value.username || duplicateDetails.value.nip || duplicateDetails.value.email);

// --- VALIDATION LIST SUMMARY (LIST OF ERRORS) ---
const validationSummary = computed(() => {
  const errors = [];
  if (!localUser.value.url_photo) errors.push("Foto Profil");
  if (!localUser.value.full_name?.trim()) errors.push("Nama Lengkap");
  if (!localUser.value.username?.trim()) errors.push("Username");
  if (duplicateDetails.value.username) errors.push("Username Duplikat");
  if (!localUser.value.email?.includes('@')) errors.push("Email Invalid");
  if (duplicateDetails.value.email) errors.push("Email Duplikat");
  if (!localUser.value.position_name?.trim()) errors.push("Jabatan");

  // Validasi NIP
  if (!localUser.value.nip) errors.push("NIP Kosong");
  else if (localUser.value.nip.length !== 18) errors.push(`NIP Kurang (${localUser.value.nip.length}/18)`);
  if (duplicateDetails.value.nip) errors.push("NIP Duplikat");

  // Validasi HP
  if (!localUser.value.phone) errors.push("No HP Kosong");
  else if (localUser.value.phone.length < 10) errors.push("No HP < 10 digit");
  
  if (!localUser.value.unit_id) errors.push("Pilih Unit");

  return errors;
});

// --- SAVE HANDLER ---
const handleValidateAndSave = () => {
  if (validationSummary.value.length > 0) return showError("Lengkapi data yang kurang!");
  if (isAnyDuplicate.value) return showError("Terdapat data duplikat!");

  // Process Payload
  const payload = { ...localUser.value };
  if (!isEditing.value) {
    payload.password = '123'; 
  } else {
    if (payload.new_password && payload.new_password.trim() !== '') {
      payload.password = payload.new_password;
    } else {
      delete payload.password;
    }
  }
  delete payload.new_password;

  emit('save', payload);
};

const showError = (msg) => {
  localError.value = { show: true, message: msg };
  setTimeout(() => localError.value.show = false, 4000);
};

watch(() => props.show, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    if (props.userToEdit) {
      localUser.value = { ...props.userToEdit, new_password: '' };
    } else {
      localUser.value = { 
        full_name: '', username: '', email: '', phone: '', nip: '',
        unit_id: '', role: 'User', is_active: 1, url_photo: '',
        position_name: '',
      };
    }
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

.animate-bounce { animation: bounce 0.5s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
</style>