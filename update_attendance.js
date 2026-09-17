const fs = require('fs');
let code = fs.readFileSync('js/views/attendance.js', 'utf-8');

// Replace saveDB import (it can stay but we won't use it)
code = code.replace(/import \{ getDB, saveDB, logAudit \} from '\.\.\/db\.js';/, "import { getDB, apiRequest, saveDB, logAudit } from '../db.js';");

// 1. In checkinTicket
code = code.replace(/saveDB\(db\);\s*logAudit\("Gate Kiosk", "Attendee Checked-in", \`\$\{event\.title\} - \$\{reg\.studentName\}\`, \`Pass: \$\{reg\.ticketId\}\`\);/, "/* Backend handles persistence */");
code = code.replace(/saveDB\(db\);\s*playSound\("success"\);\s*showToast\("Student Verified/g, '/* Backend handles persistence */ playSound("success"); showToast("Student Verified');

// 2. Walkin form
code = code.replace(/event\.registrations\.push\(\{[\s\S]*?saveDB\(db\);[\s\S]*?logAudit\([\s\S]*?\);/m, `
          apiRequest('/api/events/walkin', 'POST', {
            eventId,
            studentName: name,
            rollNo,
            department,
            email
          }).catch(console.error);
          
          if (!event.registrations) event.registrations = [];
          event.registrations.push({
            studentId: "walkin-" + Date.now(),
            studentName: name,
            rollNo,
            email,
            department,
            ticketId,
            registeredAt: new Date().toISOString().split("T")[0],
            checkedIn: true,
            checkinTime: new Date().toLocaleTimeString()
          });
          event.registeredCount += 1;
`);

// 3. Undo checkin
code = code.replace(/reg\.checkedIn = false;\s*reg\.checkinTime = null;\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
          reg.checkedIn = false;
          reg.checkinTime = null;
          apiRequest('/api/attendance/manual-checkin', 'POST', {
            eventId,
            studentId: reg.studentId || reg.student_id,
            status: 'Absent'
          }).catch(console.error);
`);

// 4. Issue Cert
code = code.replace(/db\.certificates\.unshift\(newCert\);\s*saveDB\(db\);\s*logAudit\([\s\S]*?\);/m, `
        db.certificates.unshift(newCert);
        apiRequest('/api/certificates/issue', 'POST', {
          eventId: eventId,
          studentId: studentId,
          certificateType: "Participation"
        }).catch(console.error);
`);

// 5. Offline sync
code = code.replace(/saveDB\(db\);\s*localStorage\.removeItem\(OFFLINE_QUEUE_KEY\);/m, `
      // Sync to backend
      Promise.all(queue.map(item => {
        return apiRequest('/api/attendance/organizer-checkin', 'POST', {
          eventId: item.eventId,
          ticketId: item.ticketId
        });
      })).then(() => {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
      }).catch(console.error);
`);

fs.writeFileSync('js/views/attendance.js', code);
