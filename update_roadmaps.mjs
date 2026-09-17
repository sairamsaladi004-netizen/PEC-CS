import fs from 'fs';
let code = fs.readFileSync('js/views/roadmaps.js', 'utf-8');

// 1. Add apiRequest to imports
code = code.replace(/import \{ getDB, saveDB \} from '\.\.\/db\.js';/, "import { getDB, apiRequest, saveDB } from '../db.js';");

// 2. Add API call
code = code.replace(/saveDB\(db\);\s*showToast\(node\.completed \?/m, 
`
            apiRequest(\`/api/roadmaps/\${rmId}/toggle-node\`, 'POST', {
                nodeId,
                completed: e.target.checked
            }).catch(console.error);

            saveDB(db);
            showToast(node.completed ?
`);

fs.writeFileSync('js/views/roadmaps.js', code);
