import fs from 'fs';
let code = fs.readFileSync('js/views/admin.js', 'utf-8');

// 1. Approve Club
code = code.replace(/prop\.status = "Approved & Chartered";\s*logAudit\(`\${user\.name\} \(\${user\.role\}\)`, "Approved Club Charter", prop\.name/m,
`
        apiRequest(\`/api/admin/clubs/proposals/\${pid}/approve\`, 'POST', {}).catch(console.error);
        prop.status = "Approved & Chartered";
        logAudit(\`\${user.name} (\${user.role})\`, "Approved Club Charter", prop.name
`);

// 2. Create Club
code = code.replace(/db\.clubs\.push\(newClub\);\s*saveDB\(db\);\s*logAudit\(`\${user\.name\} \(\${user\.role\}\)`, "Chartered Society"/m,
`
        apiRequest('/api/admin/clubs/create', 'POST', newClub).catch(console.error);
        db.clubs.push(newClub);
        saveDB(db);
        logAudit(\`\${user.name} (\${user.role})\`, "Chartered Society"
`);

// 3. Schedule Event
code = code.replace(/db\.events\.push\(newEvent\);\s*saveDB\(db\);\s*logAudit\(`\${user\.name\} \(\${user\.role\}\)`, "Scheduled Event"/m,
`
        apiRequest('/api/admin/events/create', 'POST', newEvent).catch(console.error);
        db.events.push(newEvent);
        saveDB(db);
        logAudit(\`\${user.name} (\${user.role})\`, "Scheduled Event"
`);

// 4. Issue Certificate
code = code.replace(/db\.certificates\.unshift\(newCert\);\s*saveDB\(db\);\s*logAudit\(`\${user\.name\} \(\${user\.role\}\)`, "Issued Certificate"/m,
`
        apiRequest('/api/admin/certificates/create', 'POST', newCert).catch(console.error);
        db.certificates.unshift(newCert);
        saveDB(db);
        logAudit(\`\${user.name} (\${user.role})\`, "Issued Certificate"
`);

fs.writeFileSync('js/views/admin.js', code);
