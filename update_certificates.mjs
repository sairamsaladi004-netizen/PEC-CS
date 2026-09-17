import fs from 'fs';
let code = fs.readFileSync('js/views/certificates.js', 'utf-8');

// 1. Mint single cert: POST /api/certificates/create
code = code.replace(/saveDB\(db\);\s*logAudit\(`\${user\.name\} \(\${user\.role\}\)`, "Minted Digital Certificate"/m,
`
        apiRequest('/api/certificates/create', 'POST', newCert).catch(console.error);
        saveDB(db);
        logAudit(\`\${user.name} (\${user.role})\`, "Minted Digital Certificate"
`);

// 2. Bulk mint: POST /api/certificates/bulk-mint
code = code.replace(/saveDB\(db\);\s*logAudit\(`\${user\.name\} \(\${user\.role\}\)`, "Bulk Minted Certificates"/m,
`
        apiRequest('/api/certificates/bulk-mint', 'POST', { 
            eventId, awardType, template 
        }).catch(console.error);

        saveDB(db);
        logAudit(\`\${user.name} (\${user.role})\`, "Bulk Minted Certificates"
`);

fs.writeFileSync('js/views/certificates.js', code);
