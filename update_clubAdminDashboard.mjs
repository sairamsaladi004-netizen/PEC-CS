import fs from 'fs';
let code = fs.readFileSync('js/views/clubAdminDashboard.js', 'utf-8');

code = code.replace(/import \{ getDB, saveDB, logAudit, apiRequest \} from '\.\.\/db\.js';/, "import { getDB, apiRequest, saveDB, logAudit } from '../db.js';");

// 1. approve
code = code.replace(/mem\.status = "Approved";\s*mem\.approved_at = new Date\(\)\.toISOString\(\);\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
        mem.status = "Approved";
        mem.approved_at = new Date().toISOString();
        apiRequest('/api/memberships/review', 'POST', { membershipId: memId, action: 'approve' }).catch(console.error);
`);

// 2. reject
code = code.replace(/mem\.status = "Rejected";\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
        mem.status = "Rejected";
        apiRequest('/api/memberships/review', 'POST', { membershipId: memId, action: 'decline' }).catch(console.error);
`);

// 3. broadcast
code = code.replace(/db\.announcements\.unshift\(\{[\s\S]*?\}\);\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
      apiRequest('/api/announcements/create', 'POST', {
        title,
        content: message,
        club_id: activeClub,
        target_audience: "All Students"
      }).catch(console.error);
`);

fs.writeFileSync('js/views/clubAdminDashboard.js', code);
