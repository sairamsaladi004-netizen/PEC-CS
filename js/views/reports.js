
export function attachReportsEvents() {
  const db = getDB();
  function downloadCSV(filename, content) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}!`, "success");
  }
  // 1. Export Clubs CSV
  document.getElementById("export-clubs-csv")?.addEventListener("click", () => {
    let csv = "Club ID,Club Name,Domain,Department,Active Members,Status,Faculty Coordinator,Email\n";
    db.clubs.forEach(c => {
      csv += `"${c.id}","${c.name}","${c.domain}","${c.department}",${c.memberCount},"${c.activeStatus}","${c.facultyCoordinator.name}","${c.facultyCoordinator.email}"\n`;
    });
    downloadCSV("Clubs_Audit_Report_2026.csv", csv);
  });
  // 2. Export Events CSV
  document.getElementById("export-events-csv")?.addEventListener("click", () => {
    let csv = "Event ID,Title,Category,Host Club,Date,Venue,Capacity,Registrations,Status\n";
    db.events.forEach(e => {
      csv += `"${e.id}","${e.title}","${e.category}","${e.clubId}","${e.date}","${e.venue}",${e.capacity},${e.registeredCount},"${e.status}"\n`;
    });
    downloadCSV("Events_Attendance_Report_2026.csv", csv);
  });
  // 3. Export Certificates CSV
  document.getElementById("export-certs-csv")?.addEventListener("click", () => {
    let csv = "Certificate ID,Student Name,Roll No,Department,Event Name,Award Type,Issue Date,Security Hash\n";
    db.certificates.forEach(c => {
      csv += `"${c.id}","${c.studentName}","${c.rollNo}","${c.department}","${c.eventName}","${c.awardType}","${c.issueDate}","${c.qrHash}"\n`;
    });
    downloadCSV("Accredited_Certificates_Registry_2026.csv", csv);
  });
  // 4. Export Projects CSV
  document.getElementById("export-projects-csv")?.addEventListener("click", () => {
    let csv = "Project ID,Title,Domain,Department,Team Leader,Rating,Status,Reviewer\n";
    db.projects.forEach(p => {
      csv += `"${p.id}","${p.title}","${p.domain}","${p.department}","${p.teamLeader}",${p.facultyReview.rating},"${p.facultyReview.status}","${p.facultyReview.reviewer}"\n`;
    });
    downloadCSV("Projects_Showcase_Leaderboard_2026.csv", csv);
  });
}
