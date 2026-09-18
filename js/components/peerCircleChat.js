/**
 * Pragati Engineering College - CampusTech
 * Peer Circle Realtime Collaboration Chat Component
 * Enables technical collaboration, problem set discussions, and hackathon team chats.
 */

import { getCurrentUser } from '../auth.js';
import { showToast } from './toast.js';

// Local storage key for persistent peer circle chat messages
const PEER_CHAT_STORAGE_KEY = 'pec_campustech_peer_circle_messages';

function getStoredMessages() {
  try {
    const raw = localStorage.getItem(PEER_CHAT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Default collegiate seed messages
  return [
    {
      id: 'msg-1',
      room: 'general-lounge',
      author: 'K. Sai Ram',
      rollNo: '22A31A0501',
      role: 'Student Tech Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      time: '10:14 AM',
      text: 'Welcome to the Peer Circle! Today at 4:30 PM, we have the ACM DSA problem set review in Lab 3.'
    },
    {
      id: 'msg-2',
      room: 'general-lounge',
      author: 'P. Bhavya Sri',
      rollNo: '22A31A0542',
      role: 'Club Secretary',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      time: '10:28 AM',
      text: 'Reminder: GitHub Campus Expert nominations are open. Please sync with Faculty Coordinator if you need recommendations.'
    },
    {
      id: 'msg-3',
      room: 'general-lounge',
      author: 'Dr. V. Radhika',
      rollNo: 'FAC-PEC-014',
      role: 'Faculty Mentor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      time: '11:05 AM',
      text: 'The Industry 4.0 Hackathon problem statements are live in the portal. All 3rd year teams must register by Friday.'
    }
  ];
}

function saveMessages(msgs) {
  try {
    localStorage.setItem(PEER_CHAT_STORAGE_KEY, JSON.stringify(msgs));
  } catch {}
}

let currentActiveRoom = 'general-lounge';

/**
 * Renders the Peer Circle Chat component markup
 */
export function renderPeerCircleChat({ room = 'general-lounge' } = {}) {
  currentActiveRoom = room;
  const user = getCurrentUser() || {};
  const allMessages = getStoredMessages();
  const roomMessages = allMessages.filter(m => (m.room || 'general-lounge') === currentActiveRoom);

  const rooms = [
    { id: 'general-lounge', name: '💬 General Tech Lounge', count: allMessages.filter(m => m.room === 'general-lounge').length },
    { id: 'hackathon-collab', name: '🚀 Hackathon Teams', count: allMessages.filter(m => m.room === 'hackathon-collab').length },
    { id: 'dsa-competitive', name: '⚡ Competitive Coding', count: allMessages.filter(m => m.room === 'dsa-competitive').length },
    { id: 'ai-robotics', name: '🤖 AI & Robotics Circle', count: allMessages.filter(m => m.room === 'ai-robotics').length }
  ];

  return `
    <div id="peer-circle-chat-container" class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[540px]">
      
      <!-- Left Sidebar: Channels & Peer Circles -->
      <div class="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-4 flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span class="text-xs font-black text-slate-900 uppercase tracking-wider">Active Circles</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          <div class="space-y-1">
            ${rooms.map(r => `
              <button data-room="${r.id}" class="peer-room-btn w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${r.id === currentActiveRoom ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'}">
                <span class="truncate">${r.name}</span>
                <span class="text-[10px] opacity-80 font-mono">${r.count}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Online Member Strip -->
        <div class="pt-3 border-t border-slate-200/80 space-y-2 text-[11px] text-slate-500">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-700">Online Peers (7)</span>
            <span class="font-mono text-emerald-600 font-bold text-[10px]">Realtime Active</span>
          </div>
          <div class="flex -space-x-1.5 overflow-hidden">
            <img class="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Peer 1">
            <img class="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Peer 2">
            <img class="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Peer 3">
            <img class="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Peer 4">
            <div class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 ring-2 ring-white text-[10px] font-bold text-blue-800">+3</div>
          </div>
        </div>
      </div>

      <!-- Right Main Chat Pane -->
      <div class="flex-1 flex flex-col justify-between bg-white">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 id="current-room-title" class="text-sm font-black text-slate-900 capitalize">
              # ${currentActiveRoom.replace('-', ' ')}
            </h3>
            <p class="text-[11px] text-slate-400">Accredited Student Society Peer Network • Pragati Engineering College</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
            Encrypted Room
          </span>
        </div>

        <!-- Chat Messages Feed -->
        <div id="peer-messages-feed" class="flex-1 p-6 space-y-4 overflow-y-auto max-h-[400px]">
          ${roomMessages.length === 0 ? `
            <div class="text-center py-12 text-slate-400 text-xs">
              <span class="text-2xl block mb-2">💬</span>
              No messages in this circle yet. Start the conversation with your peers!
            </div>
          ` : roomMessages.map(m => `
            <div class="flex items-start space-x-3 text-xs">
              <img src="${m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}" class="w-8 h-8 rounded-xl object-cover mt-0.5 border border-slate-200" alt="${m.author}" />
              <div class="space-y-1 max-w-xl">
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-slate-900">${m.author}</span>
                  <span class="text-[10px] font-mono text-slate-400">${m.rollNo || ''}</span>
                  <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-semibold">${m.role || 'Student'}</span>
                  <span class="text-[10px] text-slate-400">${m.time || 'Just now'}</span>
                </div>
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 leading-relaxed">
                  ${m.text}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Message Input Form -->
        <form id="peer-chat-form" class="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center space-x-2">
          <input type="text" id="peer-chat-input" placeholder="Share code insights, question, or project update in #${currentActiveRoom}..." class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" required autocomplete="off" />
          <button type="submit" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1 shadow-sm">
            <span>Send</span>
            <span>→</span>
          </button>
        </form>

      </div>

    </div>
  `;
}

/**
 * Attaches event handlers to the Peer Circle chat pane
 */
export function attachPeerCircleChatEvents() {
  const container = document.getElementById('peer-circle-chat-container');
  if (!container) return;

  // Room buttons
  container.querySelectorAll('.peer-room-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const room = btn.dataset.room;
      if (!room) return;
      currentActiveRoom = room;

      // Update button active styles
      container.querySelectorAll('.peer-room-btn').forEach(b => {
        b.className = 'peer-room-btn w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between text-slate-600 hover:bg-slate-200/60';
      });
      btn.className = 'peer-room-btn w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between bg-blue-600 text-white shadow-sm';

      // Update title & feed
      const titleEl = document.getElementById('current-room-title');
      if (titleEl) titleEl.textContent = `# ${room.replace('-', ' ')}`;

      const inputEl = document.getElementById('peer-chat-input');
      if (inputEl) inputEl.placeholder = `Share code insights, question, or project update in #${room}...`;

      renderMessagesForRoom(room);
    });
  });

  // Submit new message
  const form = document.getElementById('peer-chat-form');
  const input = document.getElementById('peer-chat-input');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      const user = getCurrentUser() || {};
      const allMessages = getStoredMessages();

      const newMsg = {
        id: 'msg-' + Date.now(),
        room: currentActiveRoom,
        author: user.name || 'Anonymous Student',
        rollNo: user.rollNo || user.studentId || '22A31A0501',
        role: user.role || 'Student',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: text
      };

      allMessages.push(newMsg);
      saveMessages(allMessages);

      input.value = '';
      renderMessagesForRoom(currentActiveRoom);
      showToast('Message Sent', `Posted to #${currentActiveRoom}`, 'info');
    });
  }
}

function renderMessagesForRoom(room) {
  const feed = document.getElementById('peer-messages-feed');
  if (!feed) return;

  const allMessages = getStoredMessages();
  const roomMessages = allMessages.filter(m => (m.room || 'general-lounge') === room);

  if (roomMessages.length === 0) {
    feed.innerHTML = `
      <div class="text-center py-12 text-slate-400 text-xs">
        <span class="text-2xl block mb-2">💬</span>
        No messages in this circle yet. Start the conversation with your peers!
      </div>
    `;
    return;
  }

  feed.innerHTML = roomMessages.map(m => `
    <div class="flex items-start space-x-3 text-xs">
      <img src="${m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}" class="w-8 h-8 rounded-xl object-cover mt-0.5 border border-slate-200" alt="${m.author}" />
      <div class="space-y-1 max-w-xl">
        <div class="flex items-center space-x-2">
          <span class="font-bold text-slate-900">${m.author}</span>
          <span class="text-[10px] font-mono text-slate-400">${m.rollNo || ''}</span>
          <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-semibold">${m.role || 'Student'}</span>
          <span class="text-[10px] text-slate-400">${m.time || 'Just now'}</span>
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 leading-relaxed">
          ${m.text}
        </div>
      </div>
    </div>
  `).join('');

  feed.scrollTop = feed.scrollHeight;
}

export default {
  renderPeerCircleChat,
  attachPeerCircleChatEvents
};
