<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
        
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

        <div class="relative w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 transition-all flex flex-col max-h-[90vh] animate-scale-up">
          
          <div class="relative h-32 w-full bg-gradient-to-r from-indigo-600 to-blue-700 overflow-hidden shrink-0">
            <div class="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
            <div class="absolute left-10 bottom-[-20px] h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            
            <button 
              @click="$emit('close')" 
              class="absolute top-4 right-4 p-2 rounded-full bg-black/10 text-white hover:bg-black/20 backdrop-blur-md transition-colors focus:outline-none"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="px-8 relative shrink-0">
             <div class="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 gap-6">
                <div class="relative h-32 w-32 rounded-full bg-white p-1.5 shadow-lg ring-1 ring-slate-100 shrink-0">
                   <div class="h-full w-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center relative group">
                      <img v-if="user?.url_photo" :src="user.url_photo" class="h-full w-full object-cover" alt="User Profile" />
                      <div v-else class="flex flex-col items-center justify-center text-slate-300">
                         <UserIcon class="h-16 w-16" />
                      </div>
                   </div>
                   <div 
                      class="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white shadow-sm"
                      :class="user?.is_active ? 'bg-emerald-500' : 'bg-red-500'"
                      :title="user?.is_active ? 'Akun Aktif' : 'Akun Non-Aktif'"
                   ></div>
                </div>

                <div class="text-center sm:text-left pb-2 flex-1 min-w-0 w-full">
                   <h2 class="text-2xl font-black text-slate-800 tracking-tight truncate">{{ user?.full_name }}</h2>
                   
                   <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                      <span class="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                         <BriefcaseIcon class="h-3.5 w-3.5" />
                         {{ user?.position_name || 'Jabatan Belum Diatur' }}
                      </span>
                      <span class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200 font-mono">
                         NIP: {{ user?.nip }}
                      </span>
                   </div>
                </div>
                
                <div class="hidden sm:block pb-2">
                   <button @click="$emit('edit')" class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
                      <PencilSquareIcon class="h-4 w-4" /> Edit Profil
                   </button>
                </div>
             </div>
          </div>

          <div class="px-8 pb-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                
                <div class="space-y-6">
                   <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                         <IdentificationIcon class="h-4 w-4 text-indigo-500" /> Data Personel
                      </h4>
                      <div class="grid grid-cols-2 gap-4">
                         <div>
                            <p class="text-[10px] uppercase text-slate-400 font-bold">Jenis Kelamin</p>
                            <p class="text-sm font-bold text-slate-700">{{ user?.gender === 'L' ? 'Laki-laki' : (user?.gender === 'P' ? 'Perempuan' : '-') }}</p>
                         </div>
                         <div>
                            <p class="text-[10px] uppercase text-slate-400 font-bold">Agama</p>
                            <p class="text-sm font-bold text-slate-700 capitalize">{{ user?.religion?.toLowerCase() || '-' }}</p>
                         </div>
                         <div class="col-span-2 border-t border-slate-50 pt-3">
                            <p class="text-[10px] uppercase text-slate-400 font-bold">Username Aplikasi</p>
                            <p class="text-sm font-bold text-blue-600">@{{ user?.username }}</p>
                         </div>
                      </div>
                   </div>

                   <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                         <EnvelopeIcon class="h-4 w-4 text-indigo-500" /> Kontak Media
                      </h4>
                      <div class="space-y-4">
                         <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100"><EnvelopeIcon class="h-5 w-5" /></div>
                            <div class="min-w-0">
                               <p class="text-[10px] text-slate-400 font-bold uppercase">Email Korporat</p>
                               <p class="text-sm font-bold text-slate-700 truncate">{{ user?.email || '-' }}</p>
                            </div>
                         </div>
                         <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100"><PhoneIcon class="h-5 w-5" /></div>
                            <div class="min-w-0">
                               <p class="text-[10px] text-slate-400 font-bold uppercase">No. Telepon / WA</p>
                               <p class="text-sm font-bold text-slate-700">{{ user?.phone || '-' }}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div class="space-y-6">
                   <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div class="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8"></div>
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2 relative z-10">
                         <BuildingOfficeIcon class="h-4 w-4 text-indigo-500" /> Penempatan Unit
                      </h4>
                      
                      <div class="mb-4 relative z-10">
                         <p class="text-[10px] uppercase text-slate-400 font-bold mb-1">Unit Kerja Utama</p>
                         <p class="text-sm font-black text-slate-800">{{ user?.unit_name }}</p>
                         <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <MapPinIcon class="h-3.5 w-3.5 text-blue-500" /> {{ user?.unit_address || 'Lokasi tidak terdaftar' }}
                         </p>
                      </div>

                      <div class="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <div>
                            <p class="text-slate-400 font-bold uppercase">Role Akses</p>
                            <span class="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">{{ user?.role }}</span>
                         </div>
                         <div>
                            <p class="text-slate-400 font-bold uppercase">Status Login</p>
                            <p class="font-bold mt-1" :class="user?.is_active ? 'text-emerald-600' : 'text-red-600'">
                               {{ user?.is_active ? 'Dizinkan' : 'Diblokir' }}
                            </p>
                         </div>
                      </div>
                   </div>

                   <div class="bg-slate-900 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                      <div class="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                      <h4 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <ShieldCheckIcon class="h-4 w-4 text-blue-400" /> Keamanan & Sistem
                      </h4>
                      <div class="space-y-4 text-white">
                         <div class="flex justify-between items-center text-xs">
                            <span class="opacity-60 font-medium">Metode Login</span>
                            <span class="font-bold bg-white/10 px-2 py-0.5 rounded">{{ user?.is_sso ? 'Single Sign-On (SSO)' : 'Lokal / Database' }}</span>
                         </div>
                         <div class="flex justify-between items-center text-xs border-t border-white/10 pt-4">
                            <span class="opacity-60 font-medium">Terdaftar Sejak</span>
                            <span class="font-mono opacity-90">{{ user?.created_at || '-' }}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div class="bg-white px-8 py-5 border-t border-slate-100 flex justify-between items-center shrink-0 rounded-b-3xl">
             <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Data Source: <span class="text-slate-800">C_SEC_USER</span>
             </div>
             <button @click="$emit('close')" class="rounded-xl bg-slate-100 px-8 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95">
               Tutup Profil
             </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onUnmounted } from 'vue';
import { 
  XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, 
  PencilSquareIcon, MapPinIcon, IdentificationIcon, 
  ShieldCheckIcon, BriefcaseIcon, BriefcaseIcon as IdentificationIconDark
} from '@heroicons/vue/24/outline';

const props = defineProps({
  show: Boolean,
  user: Object
});

const emit = defineEmits(['close', 'edit']);

// Scroll Locking
watch(() => props.show, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>