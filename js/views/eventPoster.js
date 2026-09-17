import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

/**
 * 10 Pre-Defined Technical Poster Templates with Tailwind CSS & Canvas Render Configs
 */
export const POSTER_DESIGNS = [
  {
    id: "midnight",
    name: "Midnight Sapphire Hackathon",
    category: "code",
    desc: "Deep space navy, electric cyan & indigo with isometric grid matrix. Built for 36-hour hackathons and AI sprints.",
    accent: "#38bdf8",
    subAccent: "#818cf8",
    bgStart: "#070b14",
    bgEnd: "#17143a",
    textColor: "#ffffff",
    cardBg: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(56, 189, 248, 0.4)",
    badgeStyle: "neon-cyan",
    tagline: "36-HOUR NATIONAL AI & CLOUD HACKATHON",
    tailwind: {
      container: "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10 font-sans",
      badge: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40",
      card: "bg-white/5 border border-cyan-500/20 backdrop-blur-xs",
      accentText: "text-cyan-400",
      subAccentText: "text-indigo-300",
      pill: "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
    }
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
    tagline: "CYBER DEFENSE & QUANTUM SECURITY SUMMIT",
    tailwind: {
      container: "bg-gradient-to-br from-black via-slate-950 to-emerald-950 text-emerald-100 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 font-mono",
      badge: "bg-emerald-950/80 text-emerald-400 border border-emerald-500",
      card: "bg-emerald-950/40 border border-emerald-500/30",
      accentText: "text-emerald-400 font-bold",
      subAccentText: "text-cyan-400",
      pill: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
    }
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
    tagline: "ANNUAL NATIONAL TECHNICAL SYMPOSIUM & CONCLAVE",
    tailwind: {
      container: "bg-gradient-to-br from-red-950 via-rose-950 to-amber-950 text-amber-50 border-4 border-amber-600 shadow-2xl shadow-amber-600/20 font-serif",
      badge: "bg-amber-500/20 text-amber-300 border border-amber-400",
      card: "bg-black/30 border border-amber-500/30",
      accentText: "text-amber-400 font-bold",
      subAccentText: "text-rose-300",
      pill: "bg-amber-600/30 text-amber-200 border border-amber-500"
    }
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
    tagline: "NEXT-GEN GENERATIVE AI & LLM WORKSHOP",
    tailwind: {
      container: "bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-purple-50 border-2 border-purple-400/50 shadow-2xl shadow-purple-500/10 font-sans",
      badge: "bg-purple-500/20 text-purple-300 border border-purple-400/40",
      card: "bg-white/10 border border-purple-400/20 backdrop-blur-md",
      accentText: "text-purple-300 font-bold",
      subAccentText: "text-cyan-300",
      pill: "bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30"
    }
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
    tagline: "DISTINGUISHED SCIENTIFIC & TECHNICAL SEMINAR",
    tailwind: {
      container: "bg-slate-50 text-slate-900 border-2 border-slate-300 shadow-xl font-sans",
      badge: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      card: "bg-white border border-slate-200 shadow-sm",
      accentText: "text-emerald-700 font-bold",
      subAccentText: "text-blue-600",
      pill: "bg-slate-200 text-slate-800 border border-slate-300"
    }
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
    tagline: "48-HOUR GAME ENGINE & XR DEVELOPMENT SPRINT",
    tailwind: {
      container: "bg-gradient-to-br from-orange-950 via-neutral-950 to-pink-950 text-orange-50 border-2 border-orange-500 shadow-2xl shadow-orange-500/15 font-sans",
      badge: "bg-orange-500/20 text-orange-300 border border-orange-400",
      card: "bg-black/40 border border-orange-500/30",
      accentText: "text-orange-400 font-bold",
      subAccentText: "text-pink-400",
      pill: "bg-pink-500/20 text-pink-200 border border-pink-500/30"
    }
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
    tagline: "LINUX KERNEL & FULL-STACK SYSTEM DESIGN WORKSHOP",
    tailwind: {
      container: "bg-neutral-950 text-white border-2 border-yellow-400 shadow-2xl font-mono",
      badge: "bg-yellow-400 text-black font-bold border border-yellow-300",
      card: "bg-neutral-900 border border-yellow-400/40",
      accentText: "text-yellow-400 font-bold",
      subAccentText: "text-white",
      pill: "bg-white text-black font-bold"
    }
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
    tagline: "NATIONAL EMBEDDED SYSTEMS & DRONE ROBOTICS DERBY",
    tailwind: {
      container: "bg-gradient-to-br from-teal-950 via-slate-950 to-sky-950 text-teal-50 border-2 border-teal-400 shadow-2xl shadow-teal-500/10 font-sans",
      badge: "bg-teal-500/20 text-teal-300 border border-teal-400/40",
      card: "bg-teal-950/40 border border-teal-500/20",
      accentText: "text-teal-300 font-bold",
      subAccentText: "text-sky-300",
      pill: "bg-sky-500/20 text-sky-200 border border-sky-400/30"
    }
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
    tagline: "RAPID COMPETITIVE PROGRAMMING & SPEED CODING",
    tailwind: {
      container: "bg-gradient-to-br from-red-950 via-stone-950 to-black text-red-50 border-2 border-red-500 shadow-2xl shadow-red-500/15 font-sans",
      badge: "bg-red-600 text-white font-bold border border-red-400",
      card: "bg-red-950/40 border border-red-500/30",
      accentText: "text-red-400 font-bold",
      subAccentText: "text-amber-400",
      pill: "bg-amber-500/20 text-amber-200 border border-amber-400/30"
    }
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
    tagline: "CENTRAL TECHNICAL SOCIETIES LEADERSHIP SUMMIT 2026",
    tailwind: {
      container: "bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-slate-100 border-2 border-slate-400 shadow-2xl font-sans",
      badge: "bg-slate-700 text-amber-300 border border-amber-400/40 font-semibold",
      card: "bg-slate-800/60 border border-slate-600/40",
      accentText: "text-slate-100 font-bold",
      subAccentText: "text-amber-400",
      pill: "bg-slate-700 text-slate-200 border border-slate-500"
    }
  }
];

/**
 * AI Domain-Based Theme & Copywriting Engine
 */
export function runAIPosterIntelligence(promptOrData, db) {
  const text = typeof promptOrData === 'string' ? promptOrData : `${promptOrData.title} ${promptOrData.theme} ${promptOrData.club}`;
  const lower = text.toLowerCase();

  // 1. Theme Template Keyword Classifier
  let matchedTheme = "midnight";
  if (lower.includes("cyber") || lower.includes("security") || lower.includes("ctf") || lower.includes("hacking") || lower.includes("crypto") || lower.includes("matrix")) {
    matchedTheme = "cyberpunk";
  } else if (lower.includes("game") || lower.includes("unity") || lower.includes("unreal") || lower.includes("esport") || lower.includes("blaze") || lower.includes("xr")) {
    matchedTheme = "blaze";
  } else if (lower.includes("iot") || lower.includes("drone") || lower.includes("robot") || lower.includes("arduino") || lower.includes("embedded") || lower.includes("hardware") || lower.includes("ocean")) {
    matchedTheme = "oceanic";
  } else if (lower.includes("symposium") || lower.includes("national conference") || lower.includes("gala") || lower.includes("convocation") || lower.includes("annual fest")) {
    matchedTheme = "imperial";
  } else if (lower.includes("seminar") || lower.includes("lecture") || lower.includes("research") || lower.includes("paper") || lower.includes("faculty") || lower.includes("swiss")) {
    matchedTheme = "minimalist";
  } else if (lower.includes("linux") || lower.includes("kernel") || lower.includes("open source") || lower.includes("brutalist") || lower.includes("cli")) {
    matchedTheme = "monochrome";
  } else if (lower.includes("speed") || lower.includes("grand prix") || lower.includes("competitive") || lower.includes("racing") || lower.includes("velocity") || lower.includes("bug hunt")) {
    matchedTheme = "velocity";
  } else if (lower.includes("leadership") || lower.includes("council") || lower.includes("executive") || lower.includes("summit") || lower.includes("conclave") || lower.includes("platinum")) {
    matchedTheme = "platinum";
  } else if (lower.includes("ai") || lower.includes("llm") || lower.includes("machine learning") || lower.includes("neural") || lower.includes("web3") || lower.includes("deep tech") || lower.includes("aurora")) {
    matchedTheme = "aurora";
  } else {
    matchedTheme = "midnight";
  }

  // 2. Extract Event Title or generate enhanced one
  let title = typeof promptOrData === 'object' && promptOrData.title ? promptOrData.title : "ApexHacks 2026: 36h National Hackathon";
  if (typeof promptOrData === 'string' && promptOrData.trim()) {
    title = promptOrData.trim();
  }

  // 3. AI Generated Slogans & Agendas
  const slogans = {
    cyberpunk: "Zero Trust. Maximum Defense. Secure the Autonomous Grid.",
    aurora: "Architecting Next-Gen Intelligence & Autonomous Silicon.",
    midnight: "36 Hours of Non-Stop Innovation, Code & Breakthroughs.",
    blaze: "Forge Virtual Realms. Push Physics to the Limit.",
    oceanic: "Connecting Smart Sensors & Autonomous Aerial Drones.",
    imperial: "Celebrating Engineering Heritage & Academic Eminence.",
    minimalist: "Distinguished Academic Discourse & Groundbreaking Research.",
    monochrome: "High-Performance Systems & Raw Algorithmic Logic.",
    velocity: "Precision Execution Under Relentless Competitive Pressure.",
    platinum: "Empowering Student Innovators & Strategic Engineering Leadership."
  };

  const tagline = slogans[matchedTheme] || "Engineering Tomorrow's Autonomous Frontiers.";

  // 4. Default Perks & Cash Pools
  const prizePools = {
    cyberpunk: "₹1,00,000 Cash Pool + Bug Bounty Trophies",
    aurora: "₹1,50,000 Cash Pool + Cloud Credits",
    midnight: "₹2,00,000 National Hackathon Prize Pool",
    blaze: "₹75,000 Cash + Game Studio Mentorship",
    oceanic: "₹80,000 + Hardware Development Kits",
    imperial: "Gold Medals & Institutional Fellowships",
    minimalist: "IEEE/ACM Best Paper Awards & Publication",
    monochrome: "₹60,000 + Open Source Bounties",
    velocity: "₹50,000 Rapid Speed Coding Bounty",
    platinum: "Distinguished Leadership Badges & Grants"
  };

  return {
    themeId: matchedTheme,
    title,
    tagline,
    prize: prizePools[matchedTheme] || "₹1,50,000 Cash Prize Pool",
    perks: "NBA & IEEE Verified Certificates • Free Food & Goodies • Gate QR Pass",
    category: matchedTheme === "minimalist" || matchedTheme === "imperial" ? "National Technical Symposium" : (matchedTheme === "oceanic" ? "Robotics & Drone Derby" : "36-Hour National Hackathon")
  };
}

export function renderEventPosterView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const defaultTheme = params.theme || "midnight";
  const eventId = params.eventId || params.id;
  const selectedEvent = eventId ? db.events.find(e => e.id === eventId) : null;

  // Filter events for this coordinator if applicable
  const assignedClubs = user.assignedClubs || (user.clubId ? [user.clubId] : []);
  const myClubEvents = (db.events || []).filter(e => assignedClubs.includes(e.club_id) || assignedClubs.includes(e.clubId));

  return `
    <div class="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <!-- Top Title & Coordinator Action Header -->
      <div class="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div class="flex items-center space-x-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
              AI Graphic Studio
            </span>
            <span class="text-slate-300">•</span>
            <span class="text-xs text-blue-600 font-bold flex items-center">
              ● 10 Curated CSS/Tailwind & Canvas Templates
            </span>
            ${user.role ? `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium font-mono">${user.role} Console</span>` : ''}
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            AI-Powered Event Poster Generator
          </h1>
          <p class="text-xs sm:text-sm text-slate-500">
            Generate stunning high-resolution posters from club event details, auto-enhance copy with AI, and download 4K graphics for campus displays and social media.
          </p>
        </div>

        <!-- Coordinator Quick Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <button id="copy-poster-image-btn" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs">
            <span>📋</span>
            <span>Copy Image</span>
          </button>
          <button id="print-poster-btn" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs">
            <span>🖨️</span>
            <span>Print Poster</span>
          </button>
          <div class="relative inline-block" id="download-dropdown-group">
            <button id="download-poster-btn" class="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer">
              <span>📥</span>
              <span>Download 4K Poster (PNG)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- AI Natural Language Prompt & Auto-Crafter Bar -->
      <div class="no-print bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-sm">✨</span>
            <div>
              <h2 class="text-sm font-black tracking-tight text-purple-100">AI Prompt-to-Poster Assistant</h2>
              <p class="text-[11px] text-purple-300">Enter a brief event description or topic to auto-match the optimal template and generate high-impact copywriting</p>
            </div>
          </div>
          <div class="flex items-center space-x-1.5 text-xs">
            <button type="button" id="quick-prompt-ai-hackathon" class="quick-ai-chip px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 text-[10px] font-semibold border border-purple-400/20 cursor-pointer">AI Hackathon</button>
            <button type="button" id="quick-prompt-cyber-ctf" class="quick-ai-chip px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 text-[10px] font-semibold border border-purple-400/20 cursor-pointer">Cyber CTF</button>
            <button type="button" id="quick-prompt-drone-derby" class="quick-ai-chip px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 text-[10px] font-semibold border border-purple-400/20 cursor-pointer">Drone Derby</button>
            <button type="button" id="quick-prompt-national-conf" class="quick-ai-chip px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 text-[10px] font-semibold border border-purple-400/20 cursor-pointer">Symposium</button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div class="relative flex-1 w-full">
            <input type="text" id="ai-poster-prompt-input" placeholder="e.g. 36h Autonomous AI & Cloud Hackathon for Turing Club on Oct 25 with ₹1.5L prize pool and Google mentors in Turing Lab" class="w-full px-4 py-3 bg-black/40 border border-purple-400/30 rounded-2xl text-xs text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:outline-hidden" />
          </div>
          <button type="button" id="run-ai-generator-btn" class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-black rounded-2xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0">
            <span>✨</span>
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      <!-- 10 Poster Template Gallery Selector Carousel / Grid -->
      <div class="no-print bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">🎨</span>
            <h2 class="text-xs font-black text-slate-900 uppercase tracking-wider">10 Pre-Defined Design Templates (CSS / Tailwind & 4K Canvas)</h2>
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
                <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md" style="color: ${d.accent}; background: rgba(0,0,0,0.5);">${d.id}</span>
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

      <!-- Studio Editor & Dual Preview Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Studio Parameter Controls (5 Cols) -->
        <div class="no-print lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-sm font-black text-slate-900 flex items-center space-x-2">
              <span>⚙️</span>
              <span>Club Event Details & Style</span>
            </h2>
            <div class="flex items-center space-x-2">
              <button type="button" id="enhance-copy-btn" class="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center space-x-1 cursor-pointer">
                <span>✨</span>
                <span>AI Enhance Copy</span>
              </button>
              <button id="reset-poster-defaults-btn" class="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer">Reset</button>
            </div>
          </div>

          <form id="poster-editor-form" class="space-y-3.5 text-xs">
            
            <!-- Quick Pre-load from DB -->
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <label class="block font-bold text-slate-800">Pre-load Event from Database:</label>
                ${myClubEvents.length > 0 ? `<span class="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">${myClubEvents.length} from your club</span>` : ''}
              </div>
              <select id="poster-event-preset" class="w-full p-2 bg-white rounded-xl border border-slate-200 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500">
                <option value="">-- Choose Existing Event --</option>
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
              <input type="text" id="poster-title" value="${selectedEvent ? selectedEvent.title : 'ApexHacks 2026: 36h National Hackathon'}" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-semibold text-slate-700">Tagline / Slogan</label>
                <button type="button" id="mini-slogan-btn" class="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">Suggest Slogan</button>
              </div>
              <input type="text" id="poster-tagline" value="Architecting Scalable Intelligence & Silicon Systems" class="w-full p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium" />
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
                <label class="block font-semibold text-slate-700 mb-1">Event Category / Format</label>
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
              <input type="text" id="poster-venue" value="${selectedEvent ? selectedEvent.venue : 'Central Auditorium & Turing AI Labs, Surampalem Campus'}" class="w-full p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
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
                  <div class="w-7 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
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

        <!-- Right: Dual Mode Live Preview (7 Cols) -->
        <div class="lg:col-span-7 flex flex-col items-center justify-start bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden min-h-[650px]">
          
          <!-- View Toggle Bar -->
          <div class="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-4 pb-3 border-b border-slate-800 flex-wrap gap-2">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span id="canvas-dim-indicator" class="font-bold text-slate-300">Live Render Engine • 600 × 800 px</span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div class="bg-slate-900 p-0.5 rounded-xl border border-slate-800 flex items-center">
                <button type="button" id="preview-mode-canvas" class="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-blue-600 text-white cursor-pointer transition-all">
                  🎨 Canvas (Export 4K)
                </button>
                <button type="button" id="preview-mode-tailwind" class="px-2.5 py-1 rounded-lg font-semibold text-[11px] text-slate-400 hover:text-white cursor-pointer transition-all">
                  💻 CSS / Tailwind DOM
                </button>
              </div>
              <span id="current-template-tag" class="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-bold uppercase">Midnight Sapphire</span>
            </div>
          </div>

          <!-- Canvas View Mount -->
          <div id="canvas-preview-wrapper" class="printable-area certificate-printable-wrapper w-full flex items-center justify-center p-2">
            <canvas id="poster-canvas" width="600" height="800" class="rounded-2xl shadow-2xl max-w-full h-auto border border-slate-800 bg-slate-900 transition-all duration-300"></canvas>
          </div>

          <!-- Tailwind CSS Live Component View Mount (Initially hidden, toggled via tab) -->
          <div id="tailwind-preview-wrapper" class="hidden w-full max-w-[600px] flex items-center justify-center p-2">
            <div id="tailwind-poster-card" class="w-full rounded-2xl p-6 transition-all duration-300">
              <!-- Dynamically populated by JS render loop -->
            </div>
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
 * Attaches real-time canvas & CSS/Tailwind rendering events, template engine bindings, and AI generators
 */
export function attachEventPosterEvents(params = {}) {
  const canvas = document.getElementById("poster-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let currentThemeId = params.theme || "midnight";
  let activePreviewMode = "canvas"; // 'canvas' | 'tailwind'

  const getTheme = () => {
    return POSTER_DESIGNS.find(d => d.id === currentThemeId) || POSTER_DESIGNS[0];
  };

  const DIMENSIONS = {
    portrait: { width: 600, height: 800, label: "3:4 Portrait • 600 × 800 px" },
    square: { width: 700, height: 700, label: "1:1 Square • 700 × 700 px" },
    story: { width: 540, height: 960, label: "9:16 Story • 540 × 960 px" }
  };

  /**
   * Primary Real-Time Canvas & CSS/Tailwind Render Loop
   */
  const renderPoster = () => {
    const theme = getTheme();
    const aspectKey = document.getElementById("poster-aspect-ratio")?.value || "portrait";
    const dim = DIMENSIONS[aspectKey] || DIMENSIONS.portrait;

    if (canvas.width !== dim.width || canvas.height !== dim.height) {
      canvas.width = dim.width;
      canvas.height = dim.height;
    }

    const dimIndicator = document.getElementById("canvas-dim-indicator");
    if (dimIndicator) dimIndicator.textContent = `Live Render Engine • ${dim.label}`;

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

    // --- 1. RENDER HTML5 2D CANVAS (FOR EXPORT) ---
    let bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Thematic Graphic Overlays
    if (theme.id === "midnight" || theme.id === "monochrome") {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    } else if (theme.id === "cyberpunk") {
      ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      drawCrosshair(ctx, 35, 35);
      drawCrosshair(ctx, W - 35, 35);
      drawCrosshair(ctx, 35, H - 35);
      drawCrosshair(ctx, W - 35, H - 35);
    } else if (theme.id === "imperial") {
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, W - 36, H - 36);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, W - 48, H - 48);
    } else if (theme.id === "aurora") {
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
      ctx.fillStyle = theme.id === "blaze" ? "rgba(249, 115, 22, 0.12)" : "rgba(239, 68, 68, 0.15)";
      ctx.beginPath();
      ctx.moveTo(W - 140, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, 140);
      ctx.closePath();
      ctx.fill();
    } else if (theme.id === "oceanic") {
      ctx.strokeStyle = "rgba(45, 212, 191, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, H - 200);
      ctx.lineTo(120, H - 200);
      ctx.lineTo(180, H - 120);
      ctx.lineTo(W - 40, H - 120);
      ctx.stroke();
    }

    if (theme.id !== "imperial") {
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, W - 36, H - 36);
    }

    // Header
    ctx.textAlign = "center";
    ctx.fillStyle = theme.textColor;
    ctx.font = "bold 11px 'Inter', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("PRAGATI ENGINEERING COLLEGE (AUTONOMOUS)", W / 2, 45);

    ctx.fillStyle = theme.id === "minimalist" ? "#64748b" : "rgba(255, 255, 255, 0.6)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText("CENTRAL COUNCIL OF TECHNICAL SOCIETIES & STUDENT CHAPTERS", W / 2, 60);

    ctx.strokeStyle = theme.id === "minimalist" ? "#e2e8f0" : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 75);
    ctx.lineTo(W - 50, 75);
    ctx.stroke();

    // Society Pill
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

    // Title
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

    ctx.fillStyle = theme.accent;
    ctx.font = "italic 600 12px 'Inter', sans-serif";
    ctx.fillText(`"${tagline}"`, W / 2, curY + 6);
    curY += 28;

    // Date/Time Card
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

    ctx.fillStyle = theme.accent;
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.fillText(`📅 ${date}   •   ⏰ ${time}`, W / 2, cardY + 28);

    ctx.fillStyle = theme.textColor;
    ctx.font = "500 12px 'Inter', sans-serif";
    ctx.fillText(`📍 ${venue}`, W / 2, cardY + 54);

    curY = cardY + cardH + 18;

    // Prize Banner
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

    // Keynote
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
    }

    // QR Code
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
          ctx.fillStyle = "#ffffff";
          roundRect(ctx, (W - qrSize - 16) / 2, qrY - 8, qrSize + 16, qrSize + 16, 10);
          ctx.fill();
          ctx.drawImage(qrImg, (W - qrSize) / 2, qrY, qrSize, qrSize);

          ctx.fillStyle = theme.textColor;
          ctx.font = "bold 10px 'JetBrains Mono', monospace";
          ctx.fillText("SCAN FOR INSTANT GATE PASS & REGISTRATION", W / 2, qrY + qrSize + 22);

          ctx.fillStyle = theme.id === "minimalist" ? "#94a3b8" : "rgba(255, 255, 255, 0.45)";
          ctx.font = "8px 'Inter', sans-serif";
          ctx.fillText("Official Digital Ecosystem Verified by CCTSC Secretariat • Pragati Autonomous", W / 2, H - 28);
        }
      }, 80);
    }

    // --- 2. RENDER PURE CSS / TAILWIND DOM COMPONENT VIEW ---
    const tailwindCard = document.getElementById("tailwind-poster-card");
    if (tailwindCard && theme.tailwind) {
      const tw = theme.tailwind;
      tailwindCard.className = `w-full rounded-3xl p-6 sm:p-8 space-y-5 ${tw.container}`;
      tailwindCard.innerHTML = `
        <!-- Institutional Letterhead -->
        <div class="text-center space-y-1 pb-3 border-b border-white/10">
          <div class="text-[10px] font-bold tracking-widest uppercase opacity-80">Pragati Engineering College (Autonomous)</div>
          <div class="text-[9px] font-mono opacity-60">Central Council of Technical Societies & Student Chapters</div>
        </div>

        <!-- Presenting Pill -->
        <div class="text-center space-y-2">
          <div class="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tw.badge}">
            Presents • ${category}
          </div>
          <div class="text-lg font-black uppercase tracking-tight text-white">${club}</div>
        </div>

        <!-- Main Title & Tagline -->
        <div class="text-center space-y-2 py-2">
          <h2 class="text-xl sm:text-2xl font-black tracking-tight leading-tight">${title}</h2>
          <p class="text-xs italic font-medium ${tw.subAccentText}">"${tagline}"</p>
        </div>

        <!-- Date & Venue Card -->
        <div class="p-4 rounded-2xl text-center space-y-1.5 ${tw.card}">
          <div class="text-xs font-bold font-mono ${tw.accentText}">📅 ${date} • ⏰ ${time}</div>
          <div class="text-xs font-medium text-slate-200">📍 ${venue}</div>
        </div>

        <!-- Prize & Highlights -->
        <div class="p-3.5 rounded-2xl text-center space-y-1 ${tw.card}">
          <div class="text-xs font-black text-amber-400">🏆 ${prize}</div>
          <div class="text-[11px] opacity-80">✨ ${perks}</div>
        </div>

        <!-- Speaker if enabled -->
        ${showSpeaker ? `
          <div class="p-3 rounded-xl text-center ${tw.card}">
            <div class="text-[11px] font-bold ${tw.accentText}">KEYNOTE: ${speakerName}</div>
            <div class="text-[10px] opacity-70">${speakerTitle}</div>
          </div>
        ` : ''}

        <!-- QR Code & Verification Prompt -->
        <div class="pt-2 text-center space-y-2">
          <div class="inline-block p-2 bg-white rounded-xl shadow-lg">
            <div id="tailwind-qr-mount" class="w-[80px] h-[80px] mx-auto flex items-center justify-center"></div>
          </div>
          <div class="text-[10px] font-mono font-bold ${tw.accentText}">SCAN FOR INSTANT GATE PASS & REGISTRATION</div>
          <div class="text-[8px] opacity-40 font-mono">PEC-CCTSC AUTONOMOUS CREDENTIAL SYSTEM</div>
        </div>
      `;

      // Mount QR code inside Tailwind component
      const twQrMount = document.getElementById("tailwind-qr-mount");
      if (twQrMount && window.QRCode) {
        twQrMount.innerHTML = "";
        new window.QRCode(twQrMount, {
          text: url,
          width: 80,
          height: 80,
          colorDark: "#090d16",
          colorLight: "#ffffff"
        });
      }
    }
  };

  // Helper Canvas Functions
  function drawCrosshair(context, x, y) {
    context.beginPath();
    context.moveTo(x - 8, y); context.lineTo(x + 8, y);
    context.moveTo(x, y - 8); context.lineTo(x, y + 8);
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
    if (curLine.trim().length > 0) lines.push(curLine.trim());
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

  // Switch Preview Modes (Canvas vs Tailwind DOM)
  const canvasModeBtn = document.getElementById("preview-mode-canvas");
  const twModeBtn = document.getElementById("preview-mode-tailwind");
  const canvasWrapper = document.getElementById("canvas-preview-wrapper");
  const twWrapper = document.getElementById("tailwind-preview-wrapper");

  if (canvasModeBtn && twModeBtn && canvasWrapper && twWrapper) {
    canvasModeBtn.addEventListener("click", () => {
      activePreviewMode = "canvas";
      canvasModeBtn.className = "px-2.5 py-1 rounded-lg font-bold text-[11px] bg-blue-600 text-white cursor-pointer transition-all";
      twModeBtn.className = "px-2.5 py-1 rounded-lg font-semibold text-[11px] text-slate-400 hover:text-white cursor-pointer transition-all";
      canvasWrapper.classList.remove("hidden");
      twWrapper.classList.add("hidden");
      renderPoster();
    });

    twModeBtn.addEventListener("click", () => {
      activePreviewMode = "tailwind";
      twModeBtn.className = "px-2.5 py-1 rounded-lg font-bold text-[11px] bg-blue-600 text-white cursor-pointer transition-all";
      canvasModeBtn.className = "px-2.5 py-1 rounded-lg font-semibold text-[11px] text-slate-400 hover:text-white cursor-pointer transition-all";
      twWrapper.classList.remove("hidden");
      canvasWrapper.classList.add("hidden");
      renderPoster();
    });
  }

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

  // AI Prompt Execution
  const runAIGenerator = (customText = null) => {
    const promptInput = document.getElementById("ai-poster-prompt-input");
    const promptText = customText || (promptInput ? promptInput.value : "");
    if (!promptText.trim()) {
      showToast("AI Prompt Required", "Please enter an event topic, title or brief description.", "warning");
      return;
    }

    const db = getDB();
    const result = runAIPosterIntelligence(promptText, db);

    // Update Theme
    currentThemeId = result.themeId;
    document.querySelectorAll(".poster-template-card").forEach(c => {
      if (c.dataset.themeId === currentThemeId) {
        c.className = "poster-template-card group relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ring-2 ring-blue-600 border-blue-500 bg-blue-50/50 shadow-xs";
      } else {
        c.className = "poster-template-card group relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between border-slate-200 hover:border-slate-300 bg-slate-50/50";
      }
    });

    if (document.getElementById("poster-title")) document.getElementById("poster-title").value = result.title;
    if (document.getElementById("poster-tagline")) document.getElementById("poster-tagline").value = result.tagline;
    if (document.getElementById("poster-prize")) document.getElementById("poster-prize").value = result.prize;
    if (document.getElementById("poster-perks")) document.getElementById("poster-perks").value = result.perks;
    if (document.getElementById("poster-category-type")) document.getElementById("poster-category-type").value = result.category;

    renderPoster();
    showToast("AI Poster Generated", `Matched "${getTheme().name}" with optimized copy!`, "success");
  };

  const aiGenBtn = document.getElementById("run-ai-generator-btn");
  if (aiGenBtn) aiGenBtn.addEventListener("click", () => runAIGenerator());

  const enhanceCopyBtn = document.getElementById("enhance-copy-btn");
  if (enhanceCopyBtn) {
    enhanceCopyBtn.addEventListener("click", () => {
      const curTitle = document.getElementById("poster-title")?.value || "";
      runAIGenerator(curTitle);
    });
  }

  // Quick Prompt Chips
  const chipPrompts = {
    "quick-prompt-ai-hackathon": "ApexHacks 2026: 36h Autonomous AI & Cloud Hackathon with ₹2L Prizes for Turing Club in Tech Park",
    "quick-prompt-cyber-ctf": "CyberDefense CTF 2026: Quantum Encryption & Red Team Exploit Summit with ₹1L Bounty",
    "quick-prompt-drone-derby": "Autonomous Aerial Drone & Embedded IoT Derby 2026 for Robotics Society in Central Grounds",
    "quick-prompt-national-conf": "Pragati National Technical Symposium & Research Paper Conclave 2026 in Central Auditorium"
  };

  Object.entries(chipPrompts).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        const input = document.getElementById("ai-poster-prompt-input");
        if (input) input.value = text;
        runAIGenerator(text);
      });
    }
  });

  // Preset Event Selector Handler
  const presetSelect = document.getElementById("poster-event-preset");
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      const db = getDB();
      const evt = db.events.find(ev => ev.id === e.target.value);
      if (evt) {
        const club = db.clubs.find(c => c.id === evt.clubId || c.id === evt.club_id);
        if (document.getElementById("poster-title")) document.getElementById("poster-title").value = evt.title;
        if (document.getElementById("poster-club")) document.getElementById("poster-club").value = club ? club.name : (evt.clubName || "Central Technical Council");
        if (document.getElementById("poster-date")) document.getElementById("poster-date").value = evt.date;
        if (document.getElementById("poster-time")) document.getElementById("poster-time").value = evt.time;
        if (document.getElementById("poster-venue")) document.getElementById("poster-venue").value = evt.venue;
        if (document.getElementById("poster-perks")) document.getElementById("poster-perks").value = evt.tags ? evt.tags.join(" • ") : "Accredited IEEE Certificates • Food";
        
        // Auto match AI theme
        const aiMatch = runAIPosterIntelligence(evt.title, db);
        currentThemeId = aiMatch.themeId;
        if (document.getElementById("poster-tagline")) document.getElementById("poster-tagline").value = aiMatch.tagline;

        renderPoster();
        showToast("Event Loaded", `Auto-configured template for "${evt.title}"`, "success");
      }
    });
  }

  // Copy Image to Clipboard
  const copyBtn = document.getElementById("copy-poster-image-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      canvas.toBlob((blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([
            new window.ClipboardItem({ "image/png": blob })
          ]).then(() => {
            showToast("Copied to Clipboard", "High-res poster graphic copied to clipboard!", "success");
          }).catch(() => {
            showToast("Notice", "Clipboard copy restricted by browser. Use Download PNG.", "warning");
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
      const titleClean = (document.getElementById("poster-title")?.value || "pec-event-poster")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 30);
      link.download = `${titleClean}-${currentThemeId}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      const user = getCurrentUser();
      logAudit(`${user.name} (${user.role})`, "Exported Event Poster", currentThemeId, titleClean);
      showToast("Poster Exported", "High-resolution 4K graphic saved successfully!", "success");
    });
  }

  // Initial Render
  renderPoster();
}
