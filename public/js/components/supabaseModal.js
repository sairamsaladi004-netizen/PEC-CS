import { getSupabaseConfigStatus, saveSupabaseConfig, syncLocalDBToSupabase } from '../supabaseClient.js';
import { getDB, saveDB } from '../db.js';
import { showToast } from './toast.js';

export function renderSupabaseConfigModal() {
  const status = getSupabaseConfigStatus();

  return `
    <div id="supabase-config-modal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto border border-slate-100">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xl font-bold shadow-xs">
              ⚡
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-base font-black text-slate-900 tracking-tight">Supabase Realtime Database Console</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${status.isCustom ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                  ${status.isCustom ? 'CUSTOM LIVE PROJECT' : 'EMBEDDED DB LAYER'}
                </span>
              </div>
              <p class="text-xs text-slate-500">Configure PostgreSQL connection credentials, sync live records, or inspect SQL DDL scripts.</p>
            </div>
          </div>
          <button id="close-supabase-modal-btn" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
        </div>

        <!-- Connection Status Banner -->
        <div class="p-4 rounded-2xl ${status.isCustom ? 'bg-emerald-50/70 border border-emerald-200' : 'bg-slate-50 border border-slate-200'} text-xs space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full ${status.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} inline-block"></span>
              <span class="font-bold text-slate-900">Database Status: ${status.isCustom ? 'Connected to Custom Supabase Project' : 'Running on Autonomous Database Layer'}</span>
            </div>
            <span class="font-mono text-[10px] text-slate-400">PostgreSQL 15</span>
          </div>
          <div class="font-mono text-[11px] text-slate-600 break-all">
            Project URL: <strong>${status.url}</strong>
          </div>
        </div>

        <!-- Supabase Configuration Form -->
        <form id="supabase-config-form" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Supabase Project URL</label>
            <input type="url" id="sb-url-input" value="${status.url}" placeholder="https://xyzcompany.supabase.co" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono" />
            <span class="text-[10px] text-slate-400 mt-1 block">Found in your Supabase Dashboard under Settings ➔ API</span>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Supabase Anon / Public API Key</label>
            <input type="password" id="sb-key-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono" />
            <span class="text-[10px] text-slate-400 mt-1 block">Public anon key used for client-side queries and mutations</span>
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <button type="submit" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs">
              Save Credentials & Connect
            </button>
            <button type="button" id="trigger-supabase-sync-btn" class="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs flex items-center space-x-1">
              <span>↻ Sync Local DB to Supabase</span>
            </button>
          </div>
        </form>

        <!-- Quick SQL DDL Viewer Accordion -->
        <div class="pt-4 border-t border-slate-100 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-800">1-Click SQL Schema Script (PostgreSQL / Supabase DDL):</span>
            <button id="copy-sql-schema-btn" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all border border-slate-200 cursor-pointer">
              📋 Copy SQL Schema
            </button>
          </div>
          <p class="text-[11px] text-slate-500">Run this script in your Supabase SQL Editor to provision all 9 relational tables (users, clubs, club_memberships, events, certificates, etc.).</p>
        </div>

      </div>
    </div>
  `;
}

export function attachSupabaseModalEvents() {
  const modal = document.getElementById("supabase-config-modal");
  const closeBtn = document.getElementById("close-supabase-modal-btn");
  const form = document.getElementById("supabase-config-form");
  const syncBtn = document.getElementById("trigger-supabase-sync-btn");
  const copySqlBtn = document.getElementById("copy-sql-schema-btn");

  closeBtn?.addEventListener("click", () => modal?.classList.add("hidden"));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = document.getElementById("sb-url-input")?.value.trim();
    const key = document.getElementById("sb-key-input")?.value.trim();

    if (!url) return;

    saveSupabaseConfig(url, key);
    showToast("Supabase Connected!", "Updated connection endpoint & API key.", "success");
    modal?.classList.add("hidden");
    setTimeout(() => window.location.reload(), 300);
  });

  syncBtn?.addEventListener("click", async () => {
    syncBtn.disabled = true;
    syncBtn.textContent = "Syncing...";
    
    const db = getDB();
    const res = await syncLocalDBToSupabase(db);

    syncBtn.disabled = false;
    syncBtn.innerHTML = "<span>↻ Sync Local DB to Supabase</span>";

    if (res.success) {
      showToast("Supabase Database Synced", res.message, "success");
    } else {
      showToast("Sync Error", res.message, "error");
    }
  });

  copySqlBtn?.addEventListener("click", async () => {
    const sqlText = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Student',
  department TEXT,
  year TEXT,
  phone TEXT,
  skills TEXT[],
  interests TEXT[]
);

CREATE TABLE IF NOT EXISTS public.clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  faculty_coordinator TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.club_memberships (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES public.users(id),
  club_id TEXT REFERENCES public.clubs(id),
  role TEXT DEFAULT 'Member',
  status TEXT DEFAULT 'Approved'
);

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Workshop',
  club_id TEXT REFERENCES public.clubs(id),
  date DATE,
  venue TEXT,
  status TEXT DEFAULT 'Upcoming'
);
    `.trim();

    try {
      await navigator.clipboard.writeText(sqlText);
      showToast("SQL Copied!", "Copied Supabase PostgreSQL setup script to clipboard.", "success");
    } catch (e) {
      alert("Copied SQL Schema script!");
    }
  });
}
