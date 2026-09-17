    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab-btn").forEach(b => {
        b.className = "admin-tab-btn pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-900";
      });
      btn.className = "admin-tab-btn pb-3 border-b-2 border-blue-600 text-blue-600 font-extrabold";
      const tab = btn.dataset.tab;
      document.getElementById("admin-users-section").classList.toggle("hidden", tab !== "users");
      document.getElementById("admin-audit-section").classList.toggle("hidden", tab !== "audit");
      document.getElementById("admin-clubs-section").classList.toggle("hidden", tab !== "clubs");
    });
  });
  // Role Modal
  const modal = document.getElementById("role-modal");
  const closeBtn = document.getElementById("close-role-modal");
  const form = document.getElementById("modify-role-form");
  document.querySelectorAll(".open-role-modal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.userid;
      document.getElementById("modal-target-userid").value = userId;
      modal.classList.remove("hidden");
    });
  });
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  }
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const userId = document.getElementById("modal-target-userid").value;
      const newRole = document.getElementById("modal-new-role").value;
      const db = getDB();
      const currentUser = getCurrentUser();
      const targetUser = db.users.find(u => u.id === userId);
      if (targetUser) {
        const oldRole = targetUser.role;
        targetUser.role = newRole;
        saveDB(db);
        logAudit(
          `${currentUser.name} (${currentUser.role})`,
          "Elevated User Role",
          `${targetUser.name} (${targetUser.email})`,
          `Changed role from "${oldRole}" to "${newRole}".`
        );
        showToast(`Updated role for ${targetUser.name} to "${newRole}"!`, "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  }
}
