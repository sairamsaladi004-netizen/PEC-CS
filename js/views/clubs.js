      const db = getDB();
      const user = getCurrentUser();
      const club = db.clubs.find(c => c.id === clubId);
      if (club && user) {
        if (!user.clubs) user.clubs = [];
        if (!user.clubs.includes(clubId)) {
          user.clubs.push(clubId);
          club.memberCount += 1;
          const userIdx = db.users.findIndex(u => u.id === user.id);
          if (userIdx !== -1) db.users[userIdx] = user;
          saveDB(db);
          logAudit(`${user.name} (${user.role})`, "Joined Club", club.name, `New member of ${club.shortName}`);
          showToast(`Welcome to ${club.name}! Digital membership updated.`, "success");
          setTimeout(() => window.location.reload(), 400);
        }
      }
    });
  });
  // Team Member Appointment Modal
  const addTeamBtn = document.getElementById("add-team-member-btn");
  const teamModal = document.getElementById("team-modal");
  const closeModal = document.getElementById("close-team-modal");
  const teamForm = document.getElementById("team-member-form");
  if (addTeamBtn && teamModal) {
    addTeamBtn.addEventListener("click", () => teamModal.classList.remove("hidden"));
    if (closeModal) closeModal.addEventListener("click", () => teamModal.classList.add("hidden"));
    if (teamForm) {
      teamForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const db = getDB();
        const club = db.clubs.find(c => c.id === params.id);
        if (club) {
          const newMember = {
            name: document.getElementById("member-name").value,
            role: document.getElementById("member-role").value,
            year: document.getElementById("member-dept").value,
            tenure: document.getElementById("member-tenure").value,
            email: document.getElementById("member-email").value,
            status: "Approved"
          };
          club.executiveTeam.push(newMember);
          saveDB(db);
          logAudit("Faculty Advisor", "Appointed Executive", `${club.name} - ${newMember.name}`, `Assigned role: ${newMember.role}`);
          showToast(`Appointed ${newMember.name} as ${newMember.role}!`, "success");
          teamModal.classList.add("hidden");
          setTimeout(() => window.location.reload(), 300);
        }
      });
    }
  }
}
