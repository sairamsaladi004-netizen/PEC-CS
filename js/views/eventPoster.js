import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

/**
 * 10 Distinct Professional Technical Poster Templates
 */
export const POSTER_DESIGNS = [
  {
    id: "midnight",
    name: "Midnight Sapphire Hackathon",
    category: "code",
    desc: "Deep space navy, electric cyan & indigo with isometric grid matrix. Ideal for Hackathons & AI sprints.",
    accent: "#38bdf8",
    subAccent: "#818cf8",
    bgStart: "#070b14",
    bgEnd: "#17143a",
    textColor: "#ffffff",
    cardBg: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(56, 189, 248, 0.4)",
    badgeStyle: "neon-cyan",
    tagline: "36-HOUR NATIONAL AI & CLOUD HACKATHON"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Quantum Matrix",
    category: "code",
    desc: "Pure black canvas with glowing emerald matrix rain, laser green accents and terminal monospace.",
    accent: "#10b981",
    subAccent: "#06b6d4",
    bgStart: "#030712",
    bgEnd: "#022c22",
    textColor: "#f0fdf4",
    cardBg: "rgba(6, 78, 59, 0.25)",
    borderColor: "#10b981",
    badgeStyle: "terminal-matrix",
    tagline: "CYBER DEFENSE & QUANTUM SECURITY SUMMIT"
  },
  {
    id: "imperial",
    name: "Imperial Heritage Gold & Crimson",
    category: "academic",
    desc: "Heritage burgundy & crimson with ornate gilded double borders and classical university typography.",
    accent: "#fbbf24",
    subAccent: "#f87171",
    bgStart: "#2a080c",
    bgEnd: "#450a0a",
    textColor: "#fffbeb",
    cardBg: "rgba(251, 191, 36, 0.1)",
    borderColor: "#d97706",
    badgeStyle: "gilded-ribbon",
    tagline: "ANNUAL NATIONAL TECHNICAL SYMPOSIUM & CONCLAVE"
  },
  {
    id: "aurora",
    name: "Apex Aurora Deep Tech",
    category: "code",
    desc: "Radial violet-fuchsia glow with glassmorphism overlays. Built for Machine Learning & Web3 events.",
    accent: "#c084fc",
    subAccent: "#38bdf8",
    bgStart: "#0f0728",
    bgEnd: "#2e1065",
    textColor: "#faf5ff",
    cardBg: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(192, 132, 252, 0.5)",
    badgeStyle: "aurora-glow",
    tagline: "NEXT-GEN GENERATIVE AI & LLM WORKSHOP"
  },
  {
    id: "minimalist",
    name: "Swiss Clean Minimalist",
    category: "academic",
    desc: "Crisp white/light slate canvas with stark high-contrast typography, emerald highlights and barcode geometry.",
    accent: "#059669",
    subAccent: "#2563eb",
    bgStart: "#f8fafc",
    bgEnd: "#f1f5f9",
    textColor: "#0f172a",
    cardBg: "#ffffff",
    borderColor: "#cbd5e1",
    badgeStyle: "swiss-badge",
    tagline: "DISTINGUISHED SCIENTIFIC & TECHNICAL SEMINAR"
  },
  {
    id: "blaze",
    name: "Sunset Blaze Game Jam",
    category: "code",
    desc: "Fiery volcanic orange, dark charcoal and magenta with dynamic diagonal razor cuts.",
    accent: "#f97316",
    subAccent: "#ec4899",
    bgStart: "#180b06",
    bgEnd: "#3b0718",
    textColor: "#fff7ed",
    cardBg: "rgba(249, 115, 22, 0.15)",
    borderColor: "#ea580c",
    badgeStyle: "blaze-pill",
    tagline: "48-HOUR GAME ENGINE & XR DEVELOPMENT SPRINT"
  },
  {
    id: "monochrome",
    name: "Monochrome Brutalist Code Lab",
    category: "code",
    desc: "Ultra-bold pure black, stark white, code brackets and warning yellow accents with ASCII accents.",
    accent: "#facc15",
    subAccent: "#ffffff",
    bgStart: "#0a0a0a",
    bgEnd: "#171717",
    textColor: "#ffffff",
    cardBg: "#000000",
    borderColor: "#facc15",
    badgeStyle: "brutalist-block",
    tagline: "LINUX KERNEL & FULL-STACK SYSTEM DESIGN WORKSHOP"
  },
  {
    id: "oceanic",
    name: "Oceanic Wave IoT & Hardware",
    category: "hardware",
    desc: "Deep aqua teal & ocean navy with circuit trace nodes and sleek micro-electronic contours.",
    accent: "#2dd4bf",
    subAccent: "#38bdf8",
    bgStart: "#042f2e",
    bgEnd: "#082f49",
    textColor: "#f0fdfa",
    cardBg: "rgba(45, 212, 191, 0.12)",
    borderColor: "#14b8a6",
    badgeStyle: "iot-wave",
    tagline: "NATIONAL EMBEDDED SYSTEMS & DRONE ROBOTICS DERBY"
  },
  {
    id: "velocity",
    name: "Electric Red Velocity Grand Prix",
    category: "hardware",
    desc: "Vibrant scarlet racing red on matte carbon black with dynamic chevron speed indicators.",
    accent: "#ef4444",
    subAccent: "#f59e0b",
    bgStart: "#1c0507",
    bgEnd: "#450a0a",
    textColor: "#fef2f2",
    cardBg: "rgba(239, 68, 68, 0.12)",
    borderColor: "#dc2626",
    badgeStyle: "speed-badge",
    tagline: "RAPID COMPETITIVE PROGRAMMING & SPEED CODING"
  },
  {
    id: "platinum",
    name: "Royal Platinum Leadership Summit",
    category: "academic",
    desc: "Modern executive slate & titanium with fine silver pinstripes and golden council seals.",
    accent: "#e2e8f0",
    subAccent: "#f59e0b",
    bgStart: "#0f172a",
    bgEnd: "#334155",
    textColor: "#f8fafc",
    cardBg: "rgba(255, 255, 255, 0.08)",
    borderColor: "#94a3b8",
    badgeStyle: "executive-seal",
    tagline: "CENTRAL TECHNICAL SOCIETIES LEADERSHIP SUMMIT 2026"
  }
];

const PRESET_SLOGANS = [
  "Code. Build. Transcend the Limits.",
  "Engineering Tomorrow's Autonomous Frontiers.",
  "Where Algorithms Meet Architectural Brilliance.",
  "Igniting Technical Innovation Across Campus.",
  "Transforming Raw Logic into Scalable Impact.",
  "36 Hours of Non-Stop Innovation & Code Defense.",
  "Architecting Scalable Intelligence & Silicon Systems."
];

export function renderEventPosterView(params = {}) {
  const db = getDB();
  const defaultTheme = params.theme || "midnight";
  const eventId = params.eventId || params.id;
  const selectedEvent = eventId ? db.events.find(e => e.id === eventId) : null;

  return `
    <div class="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <!-- Top Title & Quick Actions Header -->
      <div class="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
              Autonomous Graphic Engine
            </span>
            <span class="text-slate-300">•</span>
            <span class="text-xs text-emerald-600 font-bold flex items-center">
              ● 10 Official Technical Templates
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Dynamic Event Poster Creation Studio
          </h1>
          <p class="text-xs sm:text-sm text-slate-500">
            Generate high-resolution promotional posters with dynamic gate QR codes, sponsor ribbons, and printable typography for campus & social channels.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button id="random-slogan-btn" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer">
            <span>✨</span>
            <span>AI Slogan Generator</span>
          </button>
          <button id="copy-poster-image-btn" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer">
            <span>📋</span>
            <span>Copy Image</span>
          </button>
          <button id="print-poster-btn" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer">
            <span>🖨️</span>
            <span>Print Poster</span>
          </button>
          <button id="download-poster-btn" class="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📥</span>
            <span>Download 4K Poster (PNG)</span>
          </button>
        </div>
      </div>

      <!-- 10 Poster Template Gallery Selector Carousel / Grid -->
      <div class="no-print bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">🎨</span>
            <h2 class="text-xs font-black text-slate-900 uppercase tracking-wider">Select Poster Design Template (10 Curated Styles)</h2>
          </div>
          <div class="flex items-center space-x-1 text-xs">
            <button data-cat="all" class="theme-cat-btn px-2.5 py-1 rounded-lg font-bold bg-blue-600 text-white text-[11px] cursor-pointer">All (10)</button>
            <button data-cat="code" class="theme-cat-btn px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] cursor-pointer">Hackathons & Code (5)</button>
            <button data-cat="academic" class="theme-cat-btn px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] cursor-pointer">Symposiums & Academic (3)</button>
            <button data-cat="hardware" class="theme-cat-btn px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] cursor-pointer">Hardware & Robotics (2)</button>
          </div>
        </div>

        <!-- 10 Design Thumbnails Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 pt-1" id="template-pill-grid">
          ${POSTER_DESIGNS.map(d => `
            <button type="button" data-theme-id="${d.id}" data-category="${d.category}" class="poster-template-card group relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${d.id === defaultTheme ? 'ring-2 ring-blue-600 border-blue-500 bg-blue-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}">
              <div class="w-full h-12 rounded-xl mb-2 flex items-center justify-center relative overflow-hidden shadow-xs" style="background: linear-gradient(135deg, ${d.bgStart}, ${d.bgEnd});">
                <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md" style="color: ${d.accent}; background: rgba(0,0,0,0.4);">${d.id}</span>
                <div class="absolute bottom-0 inset-x-0 h-1" style="background: ${d.accent};"></div>
              </div>
              <div>
                <div class="text-[11px] font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">${d.name}</div>
                <div class="text-[9px] text-slate-400 capitalize mt-0.5">${d.category}</div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Studio Editor & Live Canvas Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Studio Parameter Controls (5 Cols) -->
        <div class="no-print lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-sm font-black text-slate-900 flex items-center space-x-2">
              <span>⚙️</span>
              <span>Event & Visual Parameters</span>
            </h2>
            <button id="reset-poster-defaults-btn" class="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer">Reset</button>
          </div>

          <form id="poster-editor-form" class="space-y-3.5 text-xs">
            
            <!-- Quick Pre-load from DB -->
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label class="block font-bold text-slate-800">Pre-load Registered Event:</label>
              <select id="poster-event-preset" class="w-full p-2 bg-white rounded-xl border border-slate-200 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500">
                <option value="">-- Or Load Existing Event Details --</option>
                ${(db.events || []).map(e => `
                  <option value="${e.id}" ${selectedEvent && selectedEvent.id === e.id ? 'selected' : ''}>
                    ${e.title} (${e.clubName || e.clubId})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Event Title & Slogan -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Event Main Title</label>
              <input type="text" id="poster-title" value="${selectedEvent ? selectedEvent.title : 'ApexHacks 2026: 36h National Hackathon'}" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-semibold text-slate-700">Tagline / Slogan</label>
                <button type="button" id="mini-slogan-btn" class="text-[10px] text-blue-600 font-bold hover:underline">Suggest New</button>
              </div>
              <input type="text" id="poster-tagline" value="Architecting Scalable Intelligence & Silicon Systems" class="w-full p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
            </div>

            <!-- Society & Category -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Organizing Society</label>
                <select id="poster-club" class="w-full p-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500">
                  ${(db.clubs || []).map(c => `
                    <option value="${c.name}" ${selectedEvent && selectedEvent.clubId === c.id ? 'selected' : ''}>${c.name}</option>
                  `).join('')}
                  <option value="Central Technical Societies Council (CCTSC)">Central Technical Council (CCTSC)</option>
                  <option value="ACM Student Chapter & IEEE CS">ACM & IEEE CS Chapters</option>
                  <option value="AI&ML Turing Club & Deep Learning Lab">AI&ML Turing Club</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Event Category</label>
                <select id="poster-category-type" class="w-full p-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500">
                  <option value="36-Hour National Hackathon">36-Hour National Hackathon</option>
                  <option value="Hands-On Technical Workshop">Hands-On Technical Workshop</option>
                  <option value="National Technical Symposium">National Technical Symposium</option>
                  <option value="Distinguished Keynote & Lecture">Distinguished Keynote Lecture</option>
                  <option value="Project Exhibition & Tech Expo">Project Exhibition & Expo</option>
                  <option value="Autonomous Drone & Robotics Derby">Robotics & Drone Derby</option>
                </select>
              </div>
            </div>

            <!-- Date, Time, Venue -->
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Event Date(s)</label>
                <input type="text" id="poster-date" value="${selectedEvent ? selectedEvent.date : 'October 18-19, 2026'}" class="w-full p-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Timing</label>
                <input type="text" id="poster-time" value="${selectedEvent ? selectedEvent.time : '09:00 AM - 08:00 PM'}" class="w-full p-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Venue & Location</label>
              <input type="text" id="poster-venue" value="${selectedEvent ? selectedEvent.venue : 'Central Auditorium & Turing AI Labs, Surampalem'}" class="w-full p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
            </div>

            <!-- Highlights, Perks & Cash Pool -->
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Cash Prize Pool</label>
                <input type="text" id="poster-prize" value="₹1,50,000 Cash Pool" class="w-full p-2 rounded-xl border border-slate-200 font-bold text-amber-600 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Perks & Certification</label>
                <input type="text" id="poster-perks" value="NBA/IEEE Verified Certificates • Free Food" class="w-full p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <!-- Keynote / Chief Guest Section -->
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-bold text-slate-700">Distinguished Keynote / Speaker</label>
                <label class="inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="poster-show-speaker" checked class="sr-only peer">
                  <div class="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div id="speaker-inputs-group" class="grid grid-cols-2 gap-2 pt-1">
                <input type="text" id="poster-speaker-name" value="Dr. Sundar Pichai (Honorary)" placeholder="Speaker Name" class="p-2 rounded-xl border border-slate-200 bg-white" />
                <input type="text" id="poster-speaker-title" value="Principal AI Architect, Google Cloud" placeholder="Designation" class="p-2 rounded-xl border border-slate-200 bg-white" />
              </div>
            </div>

            <!-- Canvas Dimensions / Aspect Ratio -->
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Aspect Ratio</label>
                <select id="poster-aspect-ratio" class="w-full p-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500">
                  <option value="portrait">3:4 Portrait (600×800)</option>
                  <option value="square">1:1 Square (700×700)</option>
                  <option value="story">9:16 Story (540×960)</option>
                </select>
              </div>

              <div class="col-span-2">
                <label class="block font-semibold text-slate-700 mb-1">Registration Portal URL (QR)</label>
                <input type="text" id="poster-url" value="${window.location.origin}${window.location.pathname}#/events" class="w-full p-2 rounded-xl border border-slate-200 font-mono text-[10px] focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

          </form>
        </div>

        <!-- Right: Real-Time Dynamic HTML5 Canvas Preview (7 Cols) -->
        <div class="lg:col-span-7 flex flex-col items-center justify-start bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden min-h-[600px]">
          
          <div class="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-4 pb-3 border-b border-slate-800">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span id="canvas-dim-indicator" class="font-bold text-slate-300">Live 2D Canvas • 600 × 800 px</span>
            </div>
            <div class="flex items-center space-x-2">
              <span id="current-template-tag" class="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-bold uppercase">Midnight Sapphire</span>
            </div>
          </div>

          <!-- The Canvas Mount -->
          <div class="printable-area certificate-printable-wrapper w-full flex items-center justify-center p-2">
            <canvas id="poster-canvas" width="600" height="800" class="rounded-2xl shadow-2xl max-w-full h-auto border border-slate-800 bg-slate-900 transition-all duration-300"></canvas>
          </div>

          <!-- Hidden QR generation container -->
          <div id="hidden-poster-qr-container" class="hidden"></div>

          <!-- Bottom Canvas Quick Tools -->
          <div class="no-print mt-6 w-full max-w-md bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-around text-xs text-slate-300">
            <span class="flex items-center space-x-1.5">
              <span>🖨️</span>
              <span>Print Ready</span>
            </span>
            <span class="text-slate-700">•</span>
            <span class="flex items-center space-x-1.5">
              <span>📱</span>
              <span>Gate QR Embedded</span>
            </span>
            <span class="text-slate-700">•</span>
            <span class="flex items-center space-x-1.5">
              <span>🛡️</span>
              <span>PEC Autonomous Seal</span>
            </span>
          </div>

        </div>

      </div>

    </div>
  `;
}

/**
 * Attaches real-time canvas rendering events and template engine bindings
 */
export function attachEventPosterEvents(params = {}) {
  const canvas = document.getElementById("poster-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let currentThemeId = params.theme || "midnight";

  const getTheme = () => {
    return POSTER_DESIGNS.find(d => d.id === currentThemeId) || POSTER_DESIGNS[0];
  };

  // Canvas Dimensions Mapping
  const DIMENSIONS = {
    portrait: { width: 600, height: 800, label: "3:4 Portrait • 600 × 800 px" },
    square: { width: 700, height: 700, label: "1:1 Square • 700 × 700 px" },
    story: { width: 540, height: 960, label: "9:16 Story • 540 × 960 px" }
  };

  /**
   * Primary Real-Time Canvas Render Loop
   */
  const renderPoster = () => {
    const theme = getTheme();
    const aspectKey = document.getElementById("poster-aspect-ratio")?.value || "portrait";
    const dim = DIMENSIONS[aspectKey] || DIMENSIONS.portrait;

    // Resize canvas if needed
    if (canvas.width !== dim.width || canvas.height !== dim.height) {
      canvas.width = dim.width;
      canvas.height = dim.height;
    }

    const dimIndicator = document.getElementById("canvas-dim-indicator");
    if (dimIndicator) dimIndicator.textContent = `Live 2D Canvas • ${dim.label}`;

    const tagIndicator = document.getElementById("current-template-tag");
    if (tagIndicator) tagIndicator.textContent = theme.name;

    const W = canvas.width;
    const H = canvas.height;
    const isSquare = aspectKey === "square";
    const isStory = aspectKey === "story";

    const title = document.getElementById("poster-title")?.value || "ApexHacks 2026: 36h Hackathon";
    const tagline = document.getElementById("poster-tagline")?.value || theme.tagline;
    const club = document.getElementById("poster-club")?.value || "Central Technical Societies Council";
    const category = document.getElementById("poster-category-type")?.value || "36-Hour National Hackathon";
    const date = document.getElementById("poster-date")?.value || "October 18-19, 2026";
    const time = document.getElementById("poster-time")?.value || "09:00 AM - 08:00 PM";
    const venue = document.getElementById("poster-venue")?.value || "Central Auditorium, Surampalem Campus";
    const prize = document.getElementById("poster-prize")?.value || "₹1,50,000 Cash Prize Pool";
    const perks = document.getElementById("poster-perks")?.value || "NBA/IEEE Verified Certificates • Free Food";
    const showSpeaker = document.getElementById("poster-show-speaker")?.checked;
    const speakerName = document.getElementById("poster-speaker-name")?.value || "Distinguished Industry Mentor";
    const speakerTitle = document.getElementById("poster-speaker-title")?.value || "Keynote Speaker";
    const url = document.getElementById("poster-url")?.value || window.location.href;

    // 1. Background Fill
    let bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Thematic Graphic Overlays & Textures
    if (theme.id === "midnight" || theme.id === "monochrome") {
      // Tech Grid Pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    } else if (theme.id === "cyberpunk") {
      // Matrix rain & crosshairs
      ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      // Corner crosshair brackets
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      drawCrosshair(ctx, 35, 35);
      drawCrosshair(ctx, W - 35, 35);
      drawCrosshair(ctx, 35, H - 35);
      drawCrosshair(ctx, W - 35, H - 35);
    } else if (theme.id === "imperial") {
      // Classical double gilded border
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, W - 36, H - 36);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, W - 48, H - 48);
    } else if (theme.id === "aurora") {
      // Aurora glowing radial circles
      let radial1 = ctx.createRadialGradient(W * 0.2, H * 0.2, 10, W * 0.2, H * 0.2, 260);
      radial1.addColorStop(0, "rgba(192, 132, 252, 0.25)");
      radial1.addColorStop(1, "transparent");
      ctx.fillStyle = radial1;
      ctx.fillRect(0, 0, W, H);

      let radial2 = ctx.createRadialGradient(W * 0.8, H * 0.7, 10, W * 0.8, H * 0.7, 300);
      radial2.addColorStop(0, "rgba(56, 189, 248, 0.2)");
      radial2.addColorStop(1, "transparent");
      ctx.fillStyle = radial2;
      ctx.fillRect(0, 0, W, H);
    } else if (theme.id === "blaze" || theme.id === "velocity") {
      // Dynamic diagonal hazard slashes in top corner
      ctx.fillStyle = theme.id === "blaze" ? "rgba(249, 115, 22, 0.12)" : "rgba(239, 68, 68, 0.15)";
      ctx.beginPath();
      ctx.moveTo(W - 140, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, 140);
      ctx.closePath();
      ctx.fill();
    } else if (theme.id === "oceanic") {
      // Circuit node lines
      ctx.strokeStyle = "rgba(45, 212, 191, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, H - 200);
      ctx.lineTo(120, H - 200);
      ctx.lineTo(180, H - 120);
      ctx.lineTo(W - 40, H - 120);
      ctx.stroke();
    }

    // Outer framing border
    if (theme.id !== "imperial") {
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, W - 36, H - 36);
    }

    // 3. Institutional Header
    ctx.textAlign = "center";
    ctx.fillStyle = theme.textColor;
    ctx.font = "bold 11px 'Inter', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("PRAGATI ENGINEERING COLLEGE (AUTONOMOUS)", W / 2, 45);

    ctx.fillStyle = theme.id === "minimalist" ? "#64748b" : "rgba(255, 255, 255, 0.6)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText("CENTRAL COUNCIL OF TECHNICAL SOCIETIES & STUDENT CHAPTERS", W / 2, 60);

    // Divider line
    ctx.strokeStyle = theme.id === "minimalist" ? "#e2e8f0" : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 75);
    ctx.lineTo(W - 50, 75);
    ctx.stroke();

    // 4. Organizing Society & Category Pill
    const pillY = 95;
    const pillW = Math.min(360, W - 80);
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, (W - pillW) / 2, pillY, pillW, 26, 13);
    ctx.fill();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    roundRect(ctx, (W - pillW) / 2, pillY, pillW, 26, 13);
    ctx.stroke();

    ctx.fillStyle = theme.accent;
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.fillText(`PRESENTS • ${category.toUpperCase()}`, W / 2, pillY + 17);

    // Host Society Title
    ctx.fillStyle = theme.id === "minimalist" ? "#1e293b" : "#ffffff";
    ctx.font = "bold 15px 'Inter', sans-serif";
    ctx.fillText(club.toUpperCase(), W / 2, pillY + 50);

    // 5. Main Event Title (Dynamic Multi-line wrap)
    const titleY = pillY + 90;
    ctx.fillStyle = theme.textColor;
    ctx.font = isSquare ? "900 28px 'Inter', sans-serif" : "900 24px 'Inter', sans-serif";
    const maxTitleW = W - 80;
    const titleLines = wrapTextLines(ctx, title, maxTitleW);
    let curY = titleY;
    titleLines.forEach(line => {
      ctx.fillText(line, W / 2, curY);
      curY += 32;
    });

    // Tagline / Slogan
    ctx.fillStyle = theme.accent;
    ctx.font = "italic 600 12px 'Inter', sans-serif";
    ctx.fillText(`"${tagline}"`, W / 2, curY + 6);
    curY += 28;

    // 6. Date, Time & Venue Card
    const cardY = curY;
    const cardH = 75;
    const cardW = W - 70;
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, 35, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 1;
    roundRect(ctx, 35, cardY, cardW, cardH, 16);
    ctx.stroke();

    // Date & Time text
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.fillText(`📅 ${date}   •   ⏰ ${time}`, W / 2, cardY + 28);

    // Venue text
    ctx.fillStyle = theme.textColor;
    ctx.font = "500 12px 'Inter', sans-serif";
    ctx.fillText(`📍 ${venue}`, W / 2, cardY + 54);

    curY = cardY + cardH + 18;

    // 7. Prize Pool & Highlights Banner
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, 35, curY, cardW, 46, 12);
    ctx.fill();
    ctx.strokeStyle = theme.subAccent;
    ctx.lineWidth = 1;
    roundRect(ctx, 35, curY, cardW, 46, 12);
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 12px 'Inter', sans-serif";
    ctx.fillText(`🏆 ${prize}`, W / 2, curY + 20);

    ctx.fillStyle = theme.id === "minimalist" ? "#475569" : "rgba(255, 255, 255, 0.75)";
    ctx.font = "10px 'Inter', sans-serif";
    ctx.fillText(`✨ ${perks}`, W / 2, curY + 36);

    curY += 60;

    // 8. Keynote Speaker Callout (If enabled)
    if (showSpeaker && !isSquare) {
      ctx.fillStyle = theme.cardBg;
      roundRect(ctx, 45, curY, W - 90, 38, 10);
      ctx.fill();

      ctx.fillStyle = theme.accent;
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.fillText(`KEYNOTE: ${speakerName}`, W / 2, curY + 16);

      ctx.fillStyle = theme.id === "minimalist" ? "#64748b" : "rgba(255, 255, 255, 0.6)";
      ctx.font = "9px 'Inter', sans-serif";
      ctx.fillText(speakerTitle, W / 2, curY + 30);

      curY += 50;
    }

    // 9. QR Code Fast Pass Container
    const qrSize = isSquare ? 80 : 90;
    const qrY = H - (isStory ? 190 : (isSquare ? 130 : 155));

    const qrDiv = document.getElementById("hidden-poster-qr-container");
    if (qrDiv && window.QRCode) {
      qrDiv.innerHTML = "";
      new window.QRCode(qrDiv, {
        text: url,
        width: qrSize,
        height: qrSize,
        colorDark: "#090d16",
        colorLight: "#ffffff"
      });

      setTimeout(() => {
        const qrImg = qrDiv.querySelector("img");
        if (qrImg) {
          // White QR backing card
          ctx.fillStyle = "#ffffff";
          roundRect(ctx, (W - qrSize - 16) / 2, qrY - 8, qrSize + 16, qrSize + 16, 10);
          ctx.fill();
          ctx.drawImage(qrImg, (W - qrSize) / 2, qrY, qrSize, qrSize);

          // Scan prompt
          ctx.fillStyle = theme.textColor;
          ctx.font = "bold 10px 'JetBrains Mono', monospace";
          ctx.fillText("SCAN FOR INSTANT GATE PASS & REGISTRATION", W / 2, qrY + qrSize + 22);

          // Footer
          ctx.fillStyle = theme.id === "minimalist" ? "#94a3b8" : "rgba(255, 255, 255, 0.45)";
          ctx.font = "8px 'Inter', sans-serif";
          ctx.fillText("Official Digital Ecosystem Verified by CCTSC Secretariat • Pragati Autonomous", W / 2, H - 28);
        }
      }, 80);
    }
  };

  /**
   * Helper functions for Canvas Drawing
   */
  function drawCrosshair(context, x, y) {
    context.beginPath();
    context.moveTo(x - 8, y);
    context.lineTo(x + 8, y);
    context.moveTo(x, y - 8);
    context.lineTo(x, y + 8);
    context.stroke();
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function wrapTextLines(context, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let curLine = "";
    for (let i = 0; i < words.length; i++) {
      const test = curLine + words[i] + " ";
      if (context.measureText(test).width > maxWidth && i > 0) {
        lines.push(curLine.trim());
        curLine = words[i] + " ";
      } else {
        curLine = test;
      }
    }
    if (curLine.trim().length > 0) {
      lines.push(curLine.trim());
    }
    return lines;
  }

  // Bind All Input Events for Live Re-render
  const inputIds = [
    "poster-title", "poster-tagline", "poster-club", "poster-category-type",
    "poster-date", "poster-time", "poster-venue", "poster-prize",
    "poster-perks", "poster-show-speaker", "poster-speaker-name",
    "poster-speaker-title", "poster-aspect-ratio", "poster-url"
  ];

  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", renderPoster);
      el.addEventListener("change", renderPoster);
    }
  });

  // Template Card Click Handlers
  document.querySelectorAll(".poster-template-card").forEach(card => {
    card.addEventListener("click", () => {
      currentThemeId = card.dataset.themeId;
      document.querySelectorAll(".poster-template-card").forEach(c => {
        c.className = "poster-template-card group relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between border-slate-200 hover:border-slate-300 bg-slate-50/50";
      });
      card.className = "poster-template-card group relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ring-2 ring-blue-600 border-blue-500 bg-blue-50/50 shadow-xs";
      renderPoster();
      showToast("Theme Applied", `Switched to "${getTheme().name}" design!`, "info");
    });
  });

  // Category Filter Buttons
  document.querySelectorAll(".theme-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".theme-cat-btn").forEach(b => {
        b.className = "theme-cat-btn px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] cursor-pointer";
      });
      btn.className = "theme-cat-btn px-2.5 py-1 rounded-lg font-bold bg-blue-600 text-white text-[11px] cursor-pointer";
      const cat = btn.dataset.cat;
      document.querySelectorAll(".poster-template-card").forEach(card => {
        const cardCat = card.dataset.category;
        card.style.display = (cat === "all" || cardCat === cat) ? "flex" : "none";
      });
    });
  });

  // Preset Event Selector Handler
  const presetSelect = document.getElementById("poster-event-preset");
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      const db = getDB();
      const evt = db.events.find(ev => ev.id === e.target.value);
      if (evt) {
        const club = db.clubs.find(c => c.id === evt.clubId);
        if (document.getElementById("poster-title")) document.getElementById("poster-title").value = evt.title;
        if (document.getElementById("poster-club")) document.getElementById("poster-club").value = club ? club.name : (evt.clubName || "Central Technical Council");
        if (document.getElementById("poster-date")) document.getElementById("poster-date").value = evt.date;
        if (document.getElementById("poster-time")) document.getElementById("poster-time").value = evt.time;
        if (document.getElementById("poster-venue")) document.getElementById("poster-venue").value = evt.venue;
        if (document.getElementById("poster-perks")) document.getElementById("poster-perks").value = evt.tags ? evt.tags.join(" • ") : "Accredited IEEE Certificates • Food";
        renderPoster();
        showToast("Event Loaded", `Populated parameters from "${evt.title}"`, "success");
      }
    });
  }

  // AI / Random Slogan Generator
  const generateSlogan = () => {
    const randomSlogan = PRESET_SLOGANS[Math.floor(Math.random() * PRESET_SLOGANS.length)];
    const taglineInput = document.getElementById("poster-tagline");
    if (taglineInput) {
      taglineInput.value = randomSlogan;
      renderPoster();
      showToast("Tagline Generated", `"${randomSlogan}"`, "info");
    }
  };

  const sloganBtn = document.getElementById("random-slogan-btn");
  const miniSloganBtn = document.getElementById("mini-slogan-btn");
  if (sloganBtn) sloganBtn.addEventListener("click", generateSlogan);
  if (miniSloganBtn) miniSloganBtn.addEventListener("click", generateSlogan);

  // Copy Image to Clipboard
  const copyBtn = document.getElementById("copy-poster-image-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      canvas.toBlob((blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([
            new window.ClipboardItem({ "image/png": blob })
          ]).then(() => {
            showToast("Copied to Clipboard", "High-res poster image copied directly to clipboard!", "success");
          }).catch(() => {
            showToast("Notice", "Clipboard copy not supported in this browser mode. Use Download PNG.", "warning");
          });
        }
      });
    });
  }

  // Print Poster
  const printBtn = document.getElementById("print-poster-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Download High-Res 4K PNG
  const downloadBtn = document.getElementById("download-poster-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      const titleClean = (document.getElementById("poster-title")?.value || "pec-poster")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 30);
      link.download = `${titleClean}-${currentThemeId}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      const user = getCurrentUser();
      logAudit(`${user.name} (${user.role})`, "Exported Event Poster", currentThemeId, titleClean);
      showToast("Poster Exported", "High-resolution graphic saved to your device!", "success");
    });
  }

  // Initial Render
  renderPoster();
}
