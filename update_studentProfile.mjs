import fs from 'fs';
let code = fs.readFileSync('js/views/studentProfile.js', 'utf-8');

// Migrate: POST /api/users/update
code = code.replace(/saveDB\(db\);\n\s*\}\n\s*\}\n\s*showToast\("AI Classification Complete"/m,
`
              apiRequest('/api/users/update', 'POST', updatedProfile).catch(console.error);
              saveDB(db);
            }
          }
          showToast("AI Classification Complete"
`);

fs.writeFileSync('js/views/studentProfile.js', code);
