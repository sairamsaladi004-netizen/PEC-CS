        showToast("Project submitted! Queued for Faculty review.", "success");
        submitModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
  // Faculty Review Dialog
  const reviewModal = document.getElementById("faculty-review-modal");
  const closeReviewBtn = document.getElementById("close-review-modal");
  const reviewForm = document.getElementById("faculty-review-form");
  document.querySelectorAll(".open-review-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const projId = btn.dataset.projid;
      document.getElementById("review-proj-id").value = projId;
      reviewModal.classList.remove("hidden");
    });
  });
  if (closeReviewBtn && reviewModal) {
    closeReviewBtn.addEventListener("click", () => reviewModal.classList.add("hidden"));
  }
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const projId = document.getElementById("review-proj-id").value;
      const db = getDB();
      const user = getCurrentUser();
      const proj = db.projects.find(p => p.id === projId);
      if (proj) {
        const rating = parseInt(document.getElementById("review-rating").value);
        const remarks = document.getElementById("review-remarks").value;
        const status = document.getElementById("review-status").value;
        proj.facultyReview = {
          status,
          rating,
          remarks,
          reviewer: user.name,
          reviewedAt: new Date().toISOString().split("T")[0]
        };
        if (status === "Approved") proj.featured = true;
        saveDB(db);
        logAudit(`${user.name} (Faculty)`, "Reviewed Project", proj.title, `Rating: ${rating}/5, Status: ${status}`);
        showToast(`Project review saved! (${status})`, "success");
        reviewModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  }
}
