// Real-Time 'Peer Circle' Chat Component with Supabase Realtime Integration
import { getCurrentUser } from '../auth.js';
import { getDB, apiRequest } from '../db.js';
import { getSupabaseClient, initSupabaseClient } from '../supabaseClient.js';
import { showToast } from './toast.js';

let currentRoom = "general-lounge";
let activeChannel = null;
let presenceState = {};
let typingUsers = new Set();
let typingTimeout = null;

export const ROOMS = [
  { id: "general-lounge", name: "General Lounge", icon: "💬", desc: "Campus-wide technical discussions & announcements" },
  { id: "club-projects", name: "Club Projects", icon: "🚀", desc: "Collaborate on open-source builds & hackathons" },
  { id: "problem-sets", name: "Problem Sets & DSA", icon: "📚", desc: "Discuss coding challenges & interview problems" },
  { id: "ai-ml-circle", name: "AI & ML Circle", icon: "🤖", desc: "LoRA fine-tuning, RAG & PyTorch deep learning" },
  { id: "cyber-sec-guild", name: "Cyber Sec Guild", icon: "🛡️", desc: "CTF walkthroughs & web vulnerability scanning" },
  { id: "web-cloud-circle", name: "Web & Cloud Circle", icon: "☁️", desc: "Full-stack microservices, Docker & DevOps" }
];

// Helper: Escape HTML string safely
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Render the Peer Circle Chat component HTML
export function renderPeerCircleChat({ room = "general-lounge", compact = false } = {}) {
  currentRoom = room;
  const user = getCurrentUser() || { id: "guest", name: "Guest Student", role: "Student" };
  const db = getDB();
  const messages = getRoomMessages(db, currentRoom);
  const selectedRoomObj = ROOMS.find(r => r.id === currentRoom) || ROOMS[0];

  return `
    <div id="peer-circle-chat-container" class="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col ${compact ? 'h-[520px]' : 'h-[680px]'} transition-all">
      
      <!-- Chat Header -->
      <div class="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-lg text-indigo-300 font-bold">
            ${selectedRoomObj.icon}
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="text-sm font-black text-white tracking-tight">${selectedRoomObj.name}</h3>
              <span id="supabase-status-badge" class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Realtime Active</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-400 leading-tight">${selectedRoomObj.desc}</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Room Selector Dropdown / Pills -->
          <div class="relative">
            <select id="chat-room-select" class="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer">
              ${ROOMS.map(r => `<option value="${r.id}" ${r.id === currentRoom ? 'selected' : ''}>${r.icon} ${r.name}</option>`).join('')}
            </select>
          </div>

          <!-- Presence Pill -->
          <div id="active-presence-pill" class="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono font-bold flex items-center space-x-1">
            <span>👥</span>
            <span id="online-count">1</span>
            <span class="text-slate-500 hidden sm:inline">Online</span>
          </div>
        </div>
      </div>

      <!-- Channel Tabs Bar -->
      <div class="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-1.5 overflow-x-auto scrollbar-none shrink-0">
        ${ROOMS.map(r => `
          <button data-room="${r.id}" class="chat-room-tab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${r.id === currentRoom ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80'}">
            <span>${r.icon}</span>
            <span>${r.name}</span>
          </button>
        `).join('')}
      </div>

      <!-- Messages Scroll Area -->
      <div id="chat-messages-container" class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        ${messages.length === 0 ? `
          <div class="text-center py-12 space-y-3">
            <div class="text-4xl">💭</div>
            <h4 class="text-sm font-bold text-slate-700">No messages in #${selectedRoomObj.name} yet</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Be the first student or faculty member to start the peer circle discussion!</p>
          </div>
        ` : messages.map(msg => renderSingleMessage(msg, user)).join('')}
      </div>

      <!-- Typing Indicator -->
      <div id="chat-typing-indicator" class="px-5 py-1 text-[11px] text-indigo-600 font-semibold italic bg-indigo-50/50 border-t border-indigo-100 hidden">
        <span>A peer is typing...</span>
      </div>

      <!-- Message Input Box -->
      <div class="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2 shrink-0">
        
        <!-- Code Snippet Expander (Hidden by default) -->
        <div id="code-snippet-box" class="hidden p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-300">
            <span class="font-mono text-indigo-400 font-bold">💻 Attach Code Snippet</span>
            <select id="code-language-select" class="bg-slate-800 text-slate-200 text-[11px] px-2 py-1 rounded-lg border border-slate-700">
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="sql">SQL</option>
            </select>
          </div>
          <textarea id="code-snippet-input" rows="3" placeholder="// Paste code snippet or algorithm logic here..." class="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
        </div>

        <form id="peer-chat-form" class="flex items-end space-x-2">
          
          <div class="flex-1 space-y-1">
            <textarea id="chat-message-input" rows="1" placeholder="Share updates, ask a question, or discuss problem sets in #${selectedRoomObj.name}..." class="w-full bg-slate-50 text-slate-900 text-xs sm:text-sm p-3 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none max-h-24"></textarea>
          </div>

          <button type="button" id="toggle-code-btn" title="Attach Code Snippet" class="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shrink-0">
            💻
          </button>

          <button type="submit" id="send-message-btn" class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 shrink-0">
            <span>Send</span>
            <span>🚀</span>
          </button>
        </form>
      </div>

    </div>
  `;
}

// Render a single message bubble
function renderSingleMessage(msg, currentUser) {
  const isMe = msg.senderId === currentUser.id;
  const isFaculty = (msg.senderRole || "").toLowerCase().includes("faculty") || (msg.senderRole || "").toLowerCase().includes("coordinator");
  const isLeader = (msg.senderRole || "").toLowerCase().includes("leader") || (msg.senderRole || "").toLowerCase().includes("admin");

  const badgeClass = isFaculty
    ? "bg-purple-100 text-purple-800 border-purple-200"
    : isLeader
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-blue-100 text-blue-800 border-blue-200";

  return `
    <div class="flex items-start space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : ''} group" data-message-id="${msg.id}">
      <img src="${msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${escapeHtml(msg.senderName)}" class="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5" />
      
      <div class="space-y-1 max-w-[82%] sm:max-w-[75%]">
        <div class="flex items-center space-x-2 ${isMe ? 'justify-end' : ''}">
          <span class="text-xs font-bold text-slate-900">${escapeHtml(msg.senderName)}</span>
          <span class="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold border ${badgeClass}">
            ${escapeHtml(msg.senderRole || 'Member')}
          </span>
          <span class="text-[10px] text-slate-400 font-mono">${formatTime(msg.timestamp)}</span>
        </div>

        <div class="p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${isMe ? 'bg-indigo-600 text-white rounded-tr-xs' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'}">
          <p class="whitespace-pre-wrap break-words">${escapeHtml(msg.content)}</p>

          ${msg.codeSnippet ? `
            <div class="mt-2.5 p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 relative group/code">
              <div class="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
                <span class="uppercase font-bold text-indigo-400">${escapeHtml(msg.codeLanguage || 'code')}</span>
                <button data-copy-code class="hover:text-white transition-colors">Copy 📋</button>
              </div>
              <pre><code>${escapeHtml(msg.codeSnippet)}</code></pre>
            </div>
          ` : ''}
        </div>

        <!-- Reactions Row -->
        <div class="flex items-center space-x-1 ${isMe ? 'justify-end' : ''} pt-0.5">
          ${["👍", "🚀", "💡", "🔥"].map(emoji => {
            const count = (msg.reactions && msg.reactions[emoji]) || 0;
            return `
              <button data-react-msg="${msg.id}" data-emoji="${emoji}" class="px-2 py-0.5 rounded-full text-[11px] border transition-all ${count > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'} flex items-center space-x-1">
                <span>${emoji}</span>
                ${count > 0 ? `<span class="font-mono text-[10px]">${count}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// Get messages for room from DB / Memory
function getRoomMessages(db, room) {
  if (!db.peer_circle_messages) {
    db.peer_circle_messages = getInitialSeedMessages();
  }
  return db.peer_circle_messages.filter(m => m.room === room).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Attach event handlers & initialize Supabase Realtime channel
export async function attachPeerCircleChatEvents() {
  const user = getCurrentUser() || { id: "guest", name: "Guest Scholar", role: "Student" };
  const messagesContainer = document.getElementById('chat-messages-container');

  // Auto-scroll to bottom
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Room Select Dropdown
  const roomSelect = document.getElementById('chat-room-select');
  if (roomSelect) {
    roomSelect.addEventListener('change', (e) => {
      switchRoom(e.target.value);
    });
  }

  // Room Tab Buttons
  document.querySelectorAll('.chat-room-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const room = btn.getAttribute('data-room');
      if (room) switchRoom(room);
    });
  });

  // Toggle Code Snippet input
  const toggleCodeBtn = document.getElementById('toggle-code-btn');
  const codeBox = document.getElementById('code-snippet-box');
  if (toggleCodeBtn && codeBox) {
    toggleCodeBtn.addEventListener('click', () => {
      codeBox.classList.toggle('hidden');
    });
  }

  // Handle Copy Code Snippet
  document.addEventListener('click', (e) => {
    if (e.target && e.target.hasAttribute('data-copy-code')) {
      const pre = e.target.closest('.group\\/code')?.querySelector('code');
      if (pre) {
        navigator.clipboard.writeText(pre.innerText);
        showToast("Code snippet copied to clipboard!", "success");
      }
    }
  });

  // Handle Reactions
  document.querySelectorAll('[data-react-msg]').forEach(btn => {
    btn.addEventListener('click', () => {
      const msgId = btn.getAttribute('data-react-msg');
      const emoji = btn.getAttribute('data-emoji');
      if (msgId && emoji) {
        addReaction(msgId, emoji, user);
      }
    });
  });

  // Handle Message Input & Typing Broadcast
  const input = document.getElementById('chat-message-input');
  if (input) {
    input.addEventListener('input', () => {
      broadcastTyping(user);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const form = document.getElementById('peer-chat-form');
        if (form) form.requestSubmit();
      }
    });
  }

  // Form Submission
  const form = document.getElementById('peer-chat-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = input?.value?.trim();
      const codeSnippet = document.getElementById('code-snippet-input')?.value?.trim();
      const codeLanguage = document.getElementById('code-language-select')?.value || 'python';

      if (!content && !codeSnippet) {
        showToast("Please enter a message or code snippet.", "info");
        return;
      }

      await sendMessage({
        room: currentRoom,
        senderId: user.id,
        senderName: user.name || "Student Scholar",
        senderRole: user.role || "Student",
        senderAvatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
        content: content || "Sharing code snippet:",
        codeSnippet: codeSnippet || null,
        codeLanguage: codeLanguage,
        timestamp: new Date().toISOString(),
        reactions: {}
      });

      // Reset form
      if (input) input.value = '';
      const codeInput = document.getElementById('code-snippet-input');
      if (codeInput) codeInput.value = '';
      if (codeBox) codeBox.classList.add('hidden');
    });
  }

  // Connect Supabase Realtime Channel
  setupSupabaseRealtimeChannel(currentRoom, user);
}

// Switch Active Room
function switchRoom(room) {
  currentRoom = room;
  const chatContainer = document.getElementById('peer-circle-chat-container');
  if (chatContainer) {
    chatContainer.outerHTML = renderPeerCircleChat({ room: currentRoom });
    attachPeerCircleChatEvents();
  }
}

// Send Message (Postgres/API + Supabase Broadcast + Local DB)
async function sendMessage(msgData) {
  const db = getDB();
  const newMsg = {
    id: "msg-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    ...msgData
  };

  if (!Array.isArray(db.peer_circle_messages)) db.peer_circle_messages = [];
  db.peer_circle_messages.push(newMsg);

  // Broadcast via Supabase Realtime Channel if available
  if (activeChannel) {
    try {
      activeChannel.send({
        type: 'broadcast',
        event: 'new-message',
        payload: newMsg
      });
    } catch (err) {
      console.warn("[Realtime] Broadcast notice:", err.message);
    }
  }

  // API Persistence
  try {
    await apiRequest('/api/peer-circles/messages', 'POST', newMsg);
  } catch (err) {
    console.warn("API notice saving peer circle message:", err);
  }

  // Update UI locally
  appendMessageToUI(newMsg, getCurrentUser() || {});
}

// Append single message to DOM
function appendMessageToUI(msg, currentUser) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  // Remove empty state if present
  const emptyState = container.querySelector('.text-center');
  if (emptyState) emptyState.remove();

  const msgHtml = renderSingleMessage(msg, currentUser);
  container.insertAdjacentHTML('beforeend', msgHtml);
  container.scrollTop = container.scrollHeight;

  // Re-attach reaction listeners
  const newMsgEl = container.querySelector(`[data-message-id="${msg.id}"]`);
  if (newMsgEl) {
    newMsgEl.querySelectorAll('[data-react-msg]').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji');
        addReaction(msg.id, emoji, currentUser);
      });
    });
  }
}

// Add Reaction to Message
async function addReaction(msgId, emoji, user) {
  const db = getDB();
  const msg = (db.peer_circle_messages || []).find(m => m.id === msgId);
  if (!msg) return;

  if (!msg.reactions) msg.reactions = {};
  msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;

  // Broadcast reaction via Supabase
  if (activeChannel) {
    try {
      activeChannel.send({
        type: 'broadcast',
        event: 'reaction',
        payload: { msgId, emoji, reactions: msg.reactions }
      });
    } catch (e) {}
  }

  // Update DOM locally
  const msgEl = document.querySelector(`[data-message-id="${msgId}"]`);
  if (msgEl) {
    const btn = msgEl.querySelector(`[data-emoji="${emoji}"]`);
    if (btn) {
      const count = msg.reactions[emoji];
      btn.innerHTML = `<span>${emoji}</span><span class="font-mono text-[10px]">${count}</span>`;
      btn.className = "px-2 py-0.5 rounded-full text-[11px] border transition-all bg-indigo-50 border-indigo-200 text-indigo-800 font-bold flex items-center space-x-1";
    }
  }
}

// Broadcast typing event over Supabase Channel
function broadcastTyping(user) {
  if (!activeChannel) return;
  if (typingTimeout) clearTimeout(typingTimeout);

  activeChannel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { senderName: user.name || "Peer" }
  });

  typingTimeout = setTimeout(() => {}, 3000);
}

// Setup Supabase Realtime Channel
async function setupSupabaseRealtimeChannel(room, user) {
  try {
    let supabase = getSupabaseClient();
    if (!supabase) {
      supabase = await initSupabaseClient();
    }

    if (activeChannel) {
      supabase?.removeChannel(activeChannel);
      activeChannel = null;
    }

    if (supabase) {
      activeChannel = supabase.channel(`peer-circle-room-${room}`, {
        config: {
          broadcast: { self: false },
          presence: { key: user.id || `guest-${Date.now()}` }
        }
      });

      activeChannel
        .on('broadcast', { event: 'new-message' }, ({ payload }) => {
          if (payload && payload.room === currentRoom) {
            appendMessageToUI(payload, getCurrentUser() || {});
          }
        })
        .on('broadcast', { event: 'reaction' }, ({ payload }) => {
          if (payload) {
            const { msgId, emoji, reactions } = payload;
            const msgEl = document.querySelector(`[data-message-id="${msgId}"]`);
            if (msgEl) {
              const btn = msgEl.querySelector(`[data-emoji="${emoji}"]`);
              if (btn && reactions) {
                btn.innerHTML = `<span>${emoji}</span><span class="font-mono text-[10px]">${reactions[emoji]}</span>`;
                btn.className = "px-2 py-0.5 rounded-full text-[11px] border transition-all bg-indigo-50 border-indigo-200 text-indigo-800 font-bold flex items-center space-x-1";
              }
            }
          }
        })
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          const indicator = document.getElementById('chat-typing-indicator');
          if (indicator) {
            indicator.innerHTML = `<span>💬 <strong>${escapeHtml(payload.senderName)}</strong> is typing code...</span>`;
            indicator.classList.remove('hidden');
            setTimeout(() => {
              indicator.classList.add('hidden');
            }, 3000);
          }
        })
        .on('presence', { event: 'sync' }, () => {
          const state = activeChannel.presenceState();
          const count = Object.keys(state).length || 1;
          const countEl = document.getElementById('online-count');
          if (countEl) countEl.textContent = count;
        })
        .subscribe((status) => {
          const badge = document.getElementById('supabase-status-badge');
          if (badge) {
            if (status === 'SUBSCRIBED') {
              badge.className = "px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1";
              badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Realtime Active</span>`;
              activeChannel.track({
                user_id: user.id,
                name: user.name,
                role: user.role,
                online_at: new Date().toISOString()
              });
            } else {
              badge.className = "px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center space-x-1";
              badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>Sync Mode</span>`;
            }
          }
        });
    }
  } catch (err) {
    console.warn("[Peer Circle Realtime] Channel initialization notice:", err);
  }
}

// Initial Seed Messages
function getInitialSeedMessages() {
  return [
    {
      id: "msg-seed-1",
      room: "general-lounge",
      senderId: "coord-201",
      senderName: "Mrs. L. Yamuna",
      senderRole: "Faculty Coordinator",
      senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      content: "Welcome students and faculty to the Pragati Peer Circle! Use this real-time space to collaborate on technical projects, prepare for upcoming hackathons, and discuss problem sets.",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      reactions: { "👍": 8, "🚀": 5 }
    },
    {
      id: "msg-seed-2",
      room: "general-lounge",
      senderId: "std-101",
      senderName: "Aarav Sharma",
      senderRole: "Student",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      content: "Hello ma'am! We are organizing project teams for the Edge Computing & Smart Campus Hackathon in the AI&ML Turing Club.",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      reactions: { "🔥": 4 }
    },
    {
      id: "msg-seed-3",
      room: "problem-sets",
      senderId: "std-102",
      senderName: "Priya Patel",
      senderRole: "Club Student Leader",
      senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      content: "In Problem Set #3 (Graph Shortest Paths), remember Dijkstra's algorithm uses a priority queue for O((V + E) log V) time complexity. Here is the implementation snippet:",
      codeSnippet: `import heapq\n\ndef dijkstra(graph, start):\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    while pq:\n        curr_dist, u = heapq.heappop(pq)\n        if curr_dist > distances[u]: continue\n        for v, weight in graph[u].items():\n            distance = curr_dist + weight\n            if distance < distances[v]:\n                distances[v] = distance\n                heapq.heappush(pq, (distance, v))\n    return distances`,
      codeLanguage: "python",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      reactions: { "💡": 7, "👍": 3 }
    },
    {
      id: "msg-seed-4",
      room: "club-projects",
      senderId: "admin-001",
      senderName: "Dr. K. Satyanarayana",
      senderRole: "Super Admin",
      senderAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
      content: "Academic Council has allocated cloud infrastructure resources for student projects in AI/ML, Cyber Security, and IoT. Keep up the high standard of technical work!",
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      reactions: { "🚀": 10, "👏": 6 }
    }
  ];
}

// Utility: Format timestamp
function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}
