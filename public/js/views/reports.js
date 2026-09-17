import { getDB } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderReportsView() {
  const db = getDB();

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Action Bar -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">NBA / NAAC Compliance Matrix</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Institutional Accreditation Dossier</h1>
          <p class="text-xs sm:text-sm text-slate-500">Criteria 9 (Student Support & Technical Societies) & NAAC Criterion 5 compliance records</p>
        </div>
        <div class="flex items-center space-x-3">
          <button id="export-csv-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors">
            📊 Export CSV Dataset
          </button>
          <button id="print-report-btn" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all">
            🖨️ Print Audit Sheet
          </button>
        </div>
      </div>

      <!-- Printable Accreditation Sheet -->
      <div class="printable-area bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 text-slate-900">
        
        <!-- Institutional Header -->
        <div class="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">PRAGATI ENGINEERING COLLEGE</div>
            <h2 class="text-xl font-black text-slate-900 mt-0.5">Central Technical Societies & Student Chapters Council</h2>
            <div class="text-xs text-slate-500 font-mono">Accreditation Cycle: 2024-2027 • Current Academic Year: 2025-2026</div>
          </div>
          <div class="text-right font-mono text-xs text-slate-500 space-y-0.5">
            <div>Audit Form: NBA-SAR-CR9-2026</div>
            <div class="text-emerald-700 font-bold">STATUS: AUDIT-READY (TIER-1)</div>
          </div>
        </div>

        <!-- Section 1: Professional Society Chapters -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 9.1: Active Professional Society Student Chapters</h3>
            <span class="text-xs font-mono text-slate-400">${db.clubs.length} Recognized Chapters</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border border-slate-200">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th class="p-3">Society Chapter</th>
                  <th class="p-3">Department</th>
                  <th class="p-3">Category / Domain</th>
                  <th class="p-3">Faculty Coordinator</th>
                  <th class="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                ${db.clubs.map(c => `
                  <tr>
                    <td class="p-3 font-bold">${c.name}</td>
                    <td class="p-3 font-mono">${c.department}</td>
                    <td class="p-3">${c.category || c.domain}</td>
                    <td class="p-3">${typeof c.facultyCoordinator === 'object' ? c.facultyCoordinator.name : c.facultyCoordinator}</td>
                    <td class="p-3 text-right font-mono font-bold text-emerald-600">${c.status || 'Active'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 2: Technical Events & Competitions Hosted -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 9.2: Technical Hackathons, Bootcamps & Workshops (Past 12 Months)</h3>
            <span class="text-xs font-mono text-slate-400">${db.events.length} Major Activities</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border border-slate-200">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th class="p-3">Activity / Competition</th>
                  <th class="p-3">Category</th>
                  <th class="p-3">Date</th>
                  <th class="p-3">Venue</th>
                  <th class="p-3 text-right">Delegates Registered</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                ${db.events.map(e => `
                  <tr>
                    <td class="p-3 font-bold">${e.title}</td>
                    <td class="p-3 font-mono uppercase text-[10px]">${e.category}</td>
                    <td class="p-3 font-mono">${e.date}</td>
                    <td class="p-3">${e.venue}</td>
                    <td class="p-3 text-right font-mono font-bold">${e.registeredCount}/${e.capacity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Verifiable Digital Certificates Registry -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 9.3: SHA-256 Digital Verification Registry</h3>
            <span class="text-xs font-mono text-slate-400">Cryptographic Integrity Log</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border border-slate-200 font-mono text-[11px]">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th class="p-3">Certificate ID</th>
                  <th class="p-3">Student Name</th>
                  <th class="p-3">Roll No</th>
                  <th class="p-3">Event Validated</th>
                  <th class="p-3">SHA-256 Hash Prefix</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${db.certificates.map(cert => `
                  <tr>
                    <td class="p-3 font-bold text-blue-600">${cert.id}</td>
                    <td class="p-3">${cert.studentName}</td>
                    <td class="p-3">${cert.rollNo}</td>
                    <td class="p-3">${cert.eventName}</td>
                    <td class="p-3 text-slate-400">${cert.qrHash.slice(0, 20)}...</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Signatures & Verification Endorsement -->
        <div class="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div class="space-y-1">
            <div class="font-serif italic text-sm text-slate-800 font-bold">K. Satyanarayana</div>
            <div class="w-40 h-0.5 bg-slate-300"></div>
            <div class="text-xs font-bold text-slate-900">Dr. K. Satyanarayana</div>
            <div class="text-[10px] text-slate-500 font-mono">Principal, Pragati Engineering College</div>
          </div>

          <div class="space-y-1">
            <div class="font-serif italic text-sm text-slate-800 font-bold">Career Guidance Cell</div>
            <div class="w-40 h-0.5 bg-slate-300"></div>
            <div class="text-xs font-bold text-slate-900">Convener, CGC & Academic Council</div>
            <div class="text-[10px] text-slate-500 font-mono">Pragati Engineering College (Autonomous)</div>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function attachReportsEvents() {
  const printBtn = document.getElementById("print-report-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  const exportBtn = document.getElementById("export-csv-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const db = getDB();
      let csv = "ID,Society,Category,Department,Faculty Coordinator,Status\n";
      db.clubs.forEach(c => {
        const coord = typeof c.facultyCoordinator === 'object' ? c.facultyCoordinator.name : c.facultyCoordinator;
        csv += `"${c.id}","${c.name}","${c.category || c.domain}","${c.department}","${coord}","${c.status || 'Active'}"\n`;
      });
      csv += "\nEvent,Category,Date,Venue,Registrations\n";
      db.events.forEach(e => {
        csv += `"${e.title}","${e.category}","${e.date}","${e.venue}",${e.registeredCount}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `pec_accreditation_report_${Date.now()}.csv`;
      link.href = url;
      link.click();
      showToast("Accreditation dataset exported as CSV!", "success");
    });
  }
}
