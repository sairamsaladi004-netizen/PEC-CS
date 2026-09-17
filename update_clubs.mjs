import fs from 'fs';
let code = fs.readFileSync('js/views/clubs.js', 'utf-8');

// 1. Nominating executive: POST /api/clubs/:id/executive/nominate
code = code.replace(/saveDB\(db\);\s*logAudit\("Club Admin", "Nominated Student Executive"/m, 
`
        // apiRequest to backend
        apiRequest(\`/api/clubs/\${club.id}/executive/nominate\`, 'POST', {
          name, role, year, email
        }).catch(console.error);

        saveDB(db);
        logAudit("Club Admin", "Nominated Student Executive"
`);

// 2. Approving executive: POST /api/clubs/:id/executive/approve
code = code.replace(/saveDB\(db\);\s*logAudit\("Faculty Coordinator", "Approved Executive Appointment"/m,
`
        apiRequest(\`/api/clubs/\${club.id}/executive/approve\`, 'POST', {
          memberIndex: memberIdx
        }).catch(console.error);
        
        saveDB(db);
        logAudit("Faculty Coordinator", "Approved Executive Appointment"
`);

// 3. Rejecting executive: POST /api/clubs/:id/executive/reject
code = code.replace(/saveDB\(db\);\s*logAudit\("Faculty Coordinator", "Rejected Executive Nomination"/m,
`
        apiRequest(\`/api/clubs/\${club.id}/executive/reject\`, 'POST', {
          memberIndex: memberIdx
        }).catch(console.error);

        saveDB(db);
        logAudit("Faculty Coordinator", "Rejected Executive Nomination"
`);

fs.writeFileSync('js/views/clubs.js', code);
