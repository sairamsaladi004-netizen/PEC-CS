import fs from 'fs';
let code = fs.readFileSync('js/views/announcements.js', 'utf-8');

code = code.replace(/import \{ getDB, saveDB, logAudit \} from '\.\.\/db\.js';/, "import { getDB, apiRequest, saveDB, logAudit } from '../db.js';");

code = code.replace(/db\.announcements\.unshift\(\{[\s\S]*?saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
        db.announcements.unshift(newAnn);
        apiRequest('/api/announcements/create', 'POST', {
          title: newAnn.title,
          content: newAnn.content,
          club_id: "ALL", // Defaulting for general announcements if not specified
          target_audience: newAnn.targetRole,
          priority: newAnn.priority
        }).catch(console.error);
`);

fs.writeFileSync('js/views/announcements.js', code);
