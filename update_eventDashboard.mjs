import fs from 'fs';
let code = fs.readFileSync('js/components/eventDashboard.js', 'utf-8');

code = code.replace(/import \{ getDB, saveDB, logAudit \} from '\.\.\/db\.js';/, "import { getDB, apiRequest, saveDB, logAudit } from '../db.js';");

// 1. register event
code = code.replace(/currentDb\.event_registrations\.push\(newReg\);\s*saveDB\(currentDb\);\s*logAudit\([\s\S]*?\);/m, `
      currentDb.event_registrations.push(newReg);
      apiRequest('/api/events/register', 'POST', { eventId: evt.id }).catch(console.error);
`);

// 2. waitlist
code = code.replace(/evt\.waitlist\.push\(waitEntry\);\s*saveDB\(currentDb\);\s*logAudit\([\s\S]*?\);/m, `
      evt.waitlist.push(waitEntry);
      apiRequest(\`/api/events/\${evt.id}/waitlist\`, 'POST').catch(console.error);
`);

// 3. create event
code = code.replace(/currentDb\.events\.unshift\(newEvt\);\s*saveDB\(currentDb\);\s*logAudit\([\s\S]*?\);/m, `
        currentDb.events.unshift(newEvt);
        apiRequest('/api/events/create', 'POST', newEvt).catch(console.error);
`);

fs.writeFileSync('js/components/eventDashboard.js', code);
