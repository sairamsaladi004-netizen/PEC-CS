import { getDB } from '../db.js';

export function renderGalleryView() {
  const db = getDB();

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Campus Life & Innovation Gallery</h1>
          <p class="text-xs sm:text-sm text-slate-500">Photographic records of hackathon sprints, keynote sessions, and robotics showcases</p>
        </div>
      </div>

      <!-- Albums Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.gallery.map(item => {
          const club = db.clubs.find(c => c.id === item.clubId);
          return `
            <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div class="relative h-48 overflow-hidden bg-slate-900 cursor-pointer gallery-photo" data-img="${item.coverImage}" data-title="${item.title}">
                  <img src="${item.coverImage}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm font-mono">
                    ${item.date}
                  </span>
                </div>
                <div class="p-6 space-y-2">
                  <div class="text-[11px] text-blue-600 font-extrabold uppercase tracking-wider">${club ? club.name : 'Central Council'}</div>
                  <h3 class="text-base font-bold text-slate-900 leading-snug">${item.title}</h3>
                  <p class="text-xs text-slate-600 leading-relaxed">${item.description}</p>
                </div>
              </div>
              <div class="p-6 pt-0">
                <button class="gallery-photo w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors" data-img="${item.coverImage}" data-title="${item.title}">
                  View Full Resolution 🔍
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Lightbox Modal -->
      <div id="gallery-lightbox-modal" class="hidden fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="max-w-3xl w-full space-y-3">
          <div class="flex items-center justify-between text-white">
            <h3 id="lightbox-title" class="text-sm font-bold"></h3>
            <button id="close-lightbox-btn" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>
          <div class="rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
            <img id="lightbox-img" class="w-full max-h-[70vh] object-contain" />
          </div>
        </div>
      </div>

    </div>
  `;
}

export function attachGalleryEvents() {
  const modal = document.getElementById("gallery-lightbox-modal");
  const imgEl = document.getElementById("lightbox-img");
  const titleEl = document.getElementById("lightbox-title");
  const closeBtn = document.getElementById("close-lightbox-btn");

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  document.querySelectorAll(".gallery-photo").forEach(el => {
    el.addEventListener("click", () => {
      const src = el.dataset.img;
      const title = el.dataset.title;
      if (imgEl && titleEl && modal) {
        imgEl.src = src;
        titleEl.innerText = title;
        modal.classList.remove("hidden");
      }
    });
  });
}
