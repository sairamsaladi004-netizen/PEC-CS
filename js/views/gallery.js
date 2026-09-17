            <div class="p-6 space-y-3">
              <p class="text-xs text-slate-600 leading-relaxed">${album.description}</p>
              
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium">Club: ${album.clubId.toUpperCase()}</span>
                <button data-cover="${album.coverImage}" data-title="${album.title}" data-desc="${album.description}" class="open-lightbox-btn text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1">
                  <span>Open Album Lightbox</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <!-- Lightbox Modal -->
      <div id="gallery-lightbox-modal" class="hidden fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl text-white space-y-4">
          <div class="relative h-96 sm:h-[480px]">
            <img id="lightbox-img" src="" class="w-full h-full object-cover" />
            <button id="close-lightbox-btn" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors">✕</button>
          </div>
          <div class="p-6 space-y-2">
            <h3 id="lightbox-title" class="text-xl font-bold"></h3>
            <p id="lightbox-desc" class="text-xs text-slate-300 leading-relaxed"></p>
          </div>
        </div>
      </div>
    </div>
  `;
}
export function attachGalleryEvents() {
  const modal = document.getElementById("gallery-lightbox-modal");
  const closeBtn = document.getElementById("close-lightbox-btn");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDesc = document.getElementById("lightbox-desc");
  document.querySelectorAll(".open-lightbox-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      lightboxImg.src = btn.dataset.cover;
      lightboxTitle.textContent = btn.dataset.title;
      lightboxDesc.textContent = btn.dataset.desc;
      modal.classList.remove("hidden");
    });
  });
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }
}
