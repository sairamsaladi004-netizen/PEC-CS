import fs from 'fs';
let code = fs.readFileSync('js/views/coordinatorPortal.js', 'utf-8');

// 1. reviewMembership fallback
code = code.replace(/saveDB\(db\);/g, "/* saveDB replaced by backend APIs */");

fs.writeFileSync('js/views/coordinatorPortal.js', code);
