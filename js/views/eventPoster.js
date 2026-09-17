import { getDB } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderEventPosterView() {
  const db = getDB();

  return `
    <div class="space-y-6 pb-16">
      <!-- Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Technical Event Poster Studio</h1>
          <p class="text-xs sm:text-sm text-slate-500">Automated canvas graphic generation with dynamic gate QR codes for social & campus display</p>
        </div>
        <div class="flex items-center space-x-3">
          <button id="download-poster-btn" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2">
            <span>📥 Export High-Res PNG</span>
          </button>
        </div>
      </div>

      <!-- Studio Editor & Canvas Preview Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Configuration Form -->
        <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Poster Customization</h2>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Pre-load Event</label>
              <select id="poster-event-preset" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500">
                <option value="">-- Choose Existing Event --</option>
                ${db.events.map(e => `
                  <option value="${e.id}">${e.title}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Event Title</label>
              <input type="text" id="poster-title" value="ApexHacks 2026: 36h National Hackathon" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Organizing Society</label>
                <input type="text" id="poster-club" value="ACM Student Chapter" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Theme Palette</label>
                <select id="poster-theme" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500">
                  <option value="midnight">Midnight Sapphire</option>
                  <option value="cyber">Cyber Neon Dark</option>
                  <option value="crimson">Crimson Gold Academic</option>
                  <option value="emerald">Emerald Deep Tech</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Date</label>
                <input type="text" id="poster-date" value="October 18, 2026" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Time</label>
                <input type="text" id="poster-time" value="09:00 AM - 09:00 PM" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Venue & Location</label>
              <input type="text" id="poster-venue" value="Central Convention Hall & Tech Park" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Highlights & Perks</label>
              <input type="text" id="poster-perks" value="Prizes ₹1,50,000 • Free Meals • Accredited Certificates" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Portal URL (Encoded in QR)</label>
              <input type="text" id="poster-url" value="https://campustech.panimalar.edu/#/events" class="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <!-- Right: Live Canvas Preview -->
        <div class="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div class="text-xs text-slate-400 font-mono mb-3 flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Real-time HTML5 2D Canvas Engine (600 × 750 px)</span>
          </div>
          <canvas id="poster-canvas" width="600" height="750" class="rounded-2xl shadow-2xl max-w-full h-auto border border-slate-800"></canvas>
          <div id="hidden-qr-div" class="hidden"></div>
        </div>

      </div>
    </div>
  `;
}

export function attachEventPosterEvents() {
  const canvas = document.getElementById("poster-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const inputs = [
    "poster-title",
    "poster-club",
    "poster-theme",
    "poster-date",
    "poster-time",
    "poster-venue",
    "poster-perks",
    "poster-url"
  ];

  const renderPoster = () => {
    const title = document.getElementById("poster-title")?.value || "Technical Event";
    const club = document.getElementById("poster-club")?.value || "Central Technical Society";
    const theme = document.getElementById("poster-theme")?.value || "midnight";
    const date = document.getElementById("poster-date")?.value || "Upcoming";
    const time = document.getElementById("poster-time")?.value || "09:00 AM";
    const venue = document.getElementById("poster-venue")?.value || "Campus Auditorium";
    const perks = document.getElementById("poster-perks")?.value || "Verifiable QR Certification";
    const url = document.getElementById("poster-url")?.value || window.location.href;

    // Theme backgrounds
    let bgGrad = ctx.createLinearGradient(0, 0, 600, 750);
    let accentColor = "#38bdf8";
    let subAccent = "#818cf8";

    if (theme === "cyber") {
      bgGrad.addColorStop(0, "#05050d");
      bgGrad.addColorStop(1, "#022c22");
      accentColor = "#34d399";
      subAccent = "#22d3ee";
    } else if (theme === "crimson") {
      bgGrad.addColorStop(0, "#1f090d");
      bgGrad.addColorStop(1, "#450a0a");
      accentColor = "#fbbf24";
      subAccent = "#f87171";
    } else if (theme === "emerald") {
      bgGrad.addColorStop(0, "#022c22");
      bgGrad.addColorStop(1, "#064e3b");
      accentColor = "#6ee7b7";
      subAccent = "#93c5fd";
    } else {
      // midnight
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(1, "#1e1b4b");
      accentColor = "#38bdf8";
      subAccent = "#6366f1";
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 750);

    // Decorative grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 600; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 750);
      ctx.stroke();
    }
    for (let y = 0; y < 750; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(600, y);
      ctx.stroke();
    }

    // Outer border frame
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 560, 710);

    // Institution Header
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.textAlign = "center";
    ctx.fillText("PANIMALAR ENGINEERING COLLEGE", 300, 55);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("CENTRAL COUNCIL OF TECHNICAL SOCIETIES & CLUBS", 300, 75);

    // Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 95);
    ctx.lineTo(540, 95);
    ctx.stroke();

    // Organizing Club Pill
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.roundRect(170, 115, 260, 32, 16);
    ctx.fill();
    ctx.strokeStyle = subAccent;
    ctx.lineWidth = 1;
    ctx.roundRect(170, 115, 260, 32, 16);
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.font = "bold 11px 'Inter', sans-serif";
    ctx.fillText("PRESENTS", 300, 135);

    // Club Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.fillText(club.toUpperCase(), 300, 185);

    // Main Event Title (wrapped)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px 'Inter', sans-serif";
    wrapText(ctx, title, 300, 240, 500, 34);

    // Date & Time Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.roundRect(50, 350, 500, 90, 16);
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.fillText("📅 " + date + "  •  ⏰ " + time, 300, 385);

    ctx.fillStyle = "#ffffff";
    ctx.font = "13px 'Inter', sans-serif";
    ctx.fillText("📍 " + venue, 300, 415);

    // Highlights / Perks
    ctx.fillStyle = subAccent;
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("⚡ " + perks, 300, 480);

    // QR Code Box for Fast Gate Passes
    const qrDiv = document.getElementById("hidden-qr-div");
    if (qrDiv && window.QRCode) {
      qrDiv.innerHTML = "";
      new window.QRCode(qrDiv, {
        text: url,
        width: 100,
        height: 100,
        colorDark: "#000000",
        colorLight: "#ffffff"
      });

      setTimeout(() => {
        const qrImg = qrDiv.querySelector("img");
        if (qrImg) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(245, 520, 110, 110);
          ctx.drawImage(qrImg, 250, 525, 100, 100);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px 'JetBrains Mono', monospace";
          ctx.fillText("SCAN TO REGISTER / FAST PASS", 300, 655);

          // Footer
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "9px 'Inter', sans-serif";
          ctx.fillText("Official Digital Ecosystem Verified by CCTSC Secretariat", 300, 700);
        }
      }, 100);
    }
  };

  const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  };

  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderPoster);
  });

  const presetSelect = document.getElementById("poster-event-preset");
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      const db = getDB();
      const evt = db.events.find(ev => ev.id === e.target.value);
      if (evt) {
        const club = db.clubs.find(c => c.id === evt.clubId);
        document.getElementById("poster-title").value = evt.title;
        document.getElementById("poster-club").value = club ? club.name : "Central Council";
        document.getElementById("poster-date").value = evt.date;
        document.getElementById("poster-time").value = evt.time;
        document.getElementById("poster-venue").value = evt.venue;
        document.getElementById("poster-perks").value = evt.tags ? evt.tags.join(" • ") : "Official Accredited Event";
        renderPoster();
      }
    });
  }

  const downloadBtn = document.getElementById("download-poster-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = `pec-event-poster-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Poster graphic exported successfully!", "success");
    });
  }

  renderPoster();
}
