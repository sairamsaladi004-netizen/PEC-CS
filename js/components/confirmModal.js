export function showConfirmModal(title, message, onConfirm, onCancel = null) {
  // Check if modal already exists
  let modalContainer = document.getElementById('confirm-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'confirm-modal-container';
    modalContainer.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none';
    document.body.appendChild(modalContainer);
  }

  // Build Modal Content
  modalContainer.innerHTML = `
    <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden transform scale-95 transition-transform duration-300">
      <div class="p-6">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-black text-slate-900 mb-2">${title}</h3>
        <p class="text-sm text-slate-500 font-medium">${message}</p>
      </div>
      <div class="bg-slate-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-slate-100">
        <button id="confirm-modal-cancel" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors">
          Cancel
        </button>
        <button id="confirm-modal-confirm" class="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-colors">
          Confirm Action
        </button>
      </div>
    </div>
  `;

  // Show Modal
  requestAnimationFrame(() => {
    modalContainer.classList.remove('opacity-0', 'pointer-events-none');
    modalContainer.classList.add('opacity-100', 'pointer-events-auto');
    modalContainer.querySelector('div.bg-white').classList.remove('scale-95');
    modalContainer.querySelector('div.bg-white').classList.add('scale-100');
  });

  const closeModal = () => {
    modalContainer.classList.remove('opacity-100', 'pointer-events-auto');
    modalContainer.classList.add('opacity-0', 'pointer-events-none');
    modalContainer.querySelector('div.bg-white').classList.remove('scale-100');
    modalContainer.querySelector('div.bg-white').classList.add('scale-95');
    setTimeout(() => {
      modalContainer.innerHTML = '';
    }, 300);
  };

  document.getElementById('confirm-modal-cancel').addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });

  document.getElementById('confirm-modal-confirm').addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
}
