    btn.addEventListener("click", (e) => {
      const resId = e.currentTarget.dataset.resid;
      const db = getDB();
      const res = db.lmsResources.find(r => r.id === resId);
      if (res) {
        res.bookmarks += 1;
        saveDB(db);
        const countSpan = e.currentTarget.querySelector(".bm-count");
        if (countSpan) countSpan.textContent = res.bookmarks;
        showToast("Bookmarked to your Student Hub!", "success");
      }
    });
  });
  // Upload Resource Modal
  const uploadModal = document.getElementById("upload-res-modal");
  const openUploadBtn = document.getElementById("open-upload-res-btn");
  const closeUploadBtn = document.getElementById("close-res-modal");
  const uploadForm = document.getElementById("upload-res-form");
  if (openUploadBtn && uploadModal) {
    openUploadBtn.addEventListener("click", () => uploadModal.classList.remove("hidden"));
    if (closeUploadBtn) closeUploadBtn.addEventListener("click", () => uploadModal.classList.add("hidden"));
    if (uploadForm) {
      uploadForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const db = getDB();
        const user = getCurrentUser();
        const newRes = {
          id: "lms-" + Date.now(),
          title: document.getElementById("new-res-title").value,
          domain: document.getElementById("new-res-domain").value,
          difficulty: document.getElementById("new-res-diff").value,
          category: document.getElementById("new-res-cat").value,
          targetSemester: document.getElementById("new-res-sem").value,
          clubId: user.adminForClub || "cctsc",
          author: user.name,
          dateAdded: new Date().toISOString().split("T")[0],
          description: document.getElementById("new-res-desc").value,
          link: document.getElementById("new-res-url").value,
          readTime: "40 mins lab",
          bookmarks: 0,
          completions: 0
        };
        db.lmsResources.unshift(newRes);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Published LMS Resource", newRes.title, `Domain: ${newRes.domain}`);
        showToast("New LMS resource published to campus repository!", "success");
        uploadModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
