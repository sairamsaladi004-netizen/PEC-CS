import fs from 'fs';
let code = fs.readFileSync('js/views/lms.js', 'utf-8');

code = code.replace(/import \{ getDB, saveDB, logAudit \} from '\.\.\/db\.js';/, "import { getDB, apiRequest, saveDB, logAudit } from '../db.js';");

// Bookmark
code = code.replace(/res\.bookmarks = \(res\.bookmarks \|\| 0\) \+ 1;\s*saveDB\(db\);/m, `
        res.bookmarks = (res.bookmarks || 0) + 1;
        apiRequest(\`/api/lms/resources/\${lmsId}/bookmark\`, 'POST').catch(console.error);
`);

// Complete Quiz (Mint Cert)
code = code.replace(/db\.certificates\.unshift\(\{[\s\S]*?saveDB\(db\);/m, `
      apiRequest('/api/lms/quiz/complete', 'POST', {
        certId,
        verificationHash: certHash,
        eventName: quizEl.dataset.quiz || "Cloud DevOps CI/CD Technical Assessment"
      }).catch(console.error);
`);

// Publish LMS
code = code.replace(/db\.lmsResources\.unshift\(newRes\);\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
        db.lmsResources.unshift(newRes);
        apiRequest('/api/lms/resources/create', 'POST', newRes).catch(console.error);
`);

fs.writeFileSync('js/views/lms.js', code);
