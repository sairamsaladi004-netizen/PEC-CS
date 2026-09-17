        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, curY);
  }
  // Bind Poster Studio Events
  drawPoster();
  document.getElementById("render-canvas-btn")?.addEventListener("click", drawPoster);
  // Template switch
  document.querySelectorAll(".poster-tmpl-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".poster-tmpl-btn").forEach(b => {
        b.className = "poster-tmpl-btn p-2.5 rounded-xl border text-center font-bold bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
      });
      btn.className = "poster-tmpl-btn p-2.5 rounded-xl border text-center font-bold bg-blue-50 border-blue-500 text-blue-700";
      activeTemplate = btn.dataset.template;
      drawPoster();
    });
  });
  // Event select switch
  document.getElementById("poster-event-select")?.addEventListener("change", (e) => {
    const db = getDB();
    const evt = db.events.find(ev => ev.id === e.target.value);
    if (evt) {
      const club = db.clubs.find(c => c.id === evt.clubId);
      document.getElementById("poster-title").value = evt.title;
      document.getElementById("poster-club").value = club ? club.name : "Technical Society";
      document.getElementById("poster-category").value = evt.category.toUpperCase();
      document.getElementById("poster-date").value = `${evt.date} (${evt.time.split('-')[0]})`;
      document.getElementById("poster-venue").value = evt.venue;
      drawPoster();
    }
  });
  // Download PNG Poster
  document.getElementById("download-poster-btn")?.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `Event-Poster-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("High-resolution poster downloaded!", "success");
  });
  // Print Circular
  document.getElementById("print-circular-btn")?.addEventListener("click", () => {
    activeTemplate = "academic-circular";
    drawPoster();
    setTimeout(() => window.print(), 200);
  });
}
