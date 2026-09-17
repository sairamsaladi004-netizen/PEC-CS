import fs from 'fs';
let code = fs.readFileSync('js/views/projects.js', 'utf-8');

code = code.replace(/import \{ getDB, saveDB, logAudit \} from '\.\.\/db\.js';/, "import { getDB, apiRequest, saveDB, logAudit } from '../db.js';");

// 1. upvote
code = code.replace(/proj\.upvotes = \(proj\.upvotes \|\| 12\) \+ 1;\s*saveDB\(db\);/m, `
        proj.upvotes = (proj.upvotes || 12) + 1;
        apiRequest(\`/api/projects/\${projId}/upvote\`, 'POST').catch(console.error);
`);

// 2. submit project
code = code.replace(/db\.projects\.unshift\(newProj\);\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
        db.projects.unshift(newProj);
        apiRequest('/api/projects/create', 'POST', newProj).catch(console.error);
`);

// 3. endorse project
code = code.replace(/proj\.facultyReview = \{[\s\S]*?proj\.status = proj\.facultyReview\.status;\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
        proj.facultyReview = {
          rating: parseFloat(rating),
          feedback,
          reviewer: user.name,
          status: "Institutionally Endorsed",
          reviewedAt: new Date().toISOString().split("T")[0]
        };
        proj.status = proj.facultyReview.status;
        apiRequest(\`/api/projects/\${projId}/endorse\`, 'POST', { rating, feedback }).catch(console.error);
`);

// 4. register hackathon
code = code.replace(/else entry\.status = "Active Contender";\s*\}\);\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
        else entry.status = "Active Contender";
      });
      apiRequest(\`/api/hackathons/\${hackathon.id}/register\`, 'POST', { teamName, members, problemStatementId: psId }).catch(console.error);
`);

// 5. evaluate hackathon
code = code.replace(/else entry\.status = "Active Contender";\s*\}\);\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
            else entry.status = "Active Contender";
          });
          apiRequest(\`/api/hackathons/\${hackathon.id}/evaluate\`, 'POST', { 
            teamId, 
            scores: { innovation, technical, impact, presentation }, 
            feedback 
          }).catch(console.error);
`);

fs.writeFileSync('js/views/projects.js', code);
