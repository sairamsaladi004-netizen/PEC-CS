export function showToast(titleOrMessage, messageOrType, typeParam = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  // Handle both (message, type) and (title, message, type) signatures
  let title = "Notification";
  let message = titleOrMessage;
  let type = messageOrType || "info";

  if (typeParam && ["success", "error", "warning", "info"].includes(typeParam)) {
    // It was called as (title, message, type)
    title = titleOrMessage;
    message = messageOrType;
    type = typeParam;
  } else if (["success", "error", "warning", "info"].includes(messageOrType)) {
    // It was called as (message, type)
    title = messageOrType.charAt(0).toUpperCase() + messageOrType.slice(1);
    message = titleOrMessage;
    type = messageOrType;
  }

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-xl border text-xs font-semibold transition-all duration-300 transform translate-y-2 opacity-0 ${
    type === "success" ? "bg-slate-900 text-white border-emerald-500/40" :
    type === "error" ? "bg-rose-950 text-white border-rose-500/40" :
    type === "warning" ? "bg-amber-950 text-white border-amber-500/40" :
    "bg-slate-900 text-white border-blue-500/40"
  }`;

  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
  const iconColor = type === "success" ? "text-emerald-400" : type === "error" ? "text-rose-400" : "text-blue-400";

  toast.innerHTML = `
    <div class="flex items-start space-x-2.5">
      <span class="w-5 h-5 mt-0.5 rounded-full bg-white/10 flex items-center justify-center ${iconColor} font-bold text-[10px] shrink-0">${icon}</span>
      <div class="flex flex-col">
        <span class="font-bold text-slate-100">${title}</span>
        <span class="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">${message}</span>
      </div>
    </div>
    <button class="ml-4 text-slate-400 hover:text-white transition-colors shrink-0">✕</button>
  `;

  const closeBtn = toast.querySelector("button");
  const dismiss = () => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  };

  if (closeBtn) closeBtn.addEventListener("click", dismiss);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
  });

  setTimeout(dismiss, 4000);
}
