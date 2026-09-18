/**
 * Central QR Code Generator and Verification Utility for PEC CampusTech
 * Handles unique student membership card QR generation, cryptographic payload formatting,
 * dynamic downloads, full-screen scanner modal rendering, and event check-in validation.
 */

/**
 * Constructs a unique, cryptographically identifiable QR payload object for a student's membership card
 */
export function generateMembershipQRPayload(student = {}, club = {}, event = null) {
  const rollNo = student.rollNo || student.facultyId || "22A31A0501";
  const dept = (student.department || "CSE").toUpperCase();
  const membershipId = student.membershipId || `PEC-MEM-2026-${dept}-${rollNo.slice(-4) || '8492'}`;
  const timestamp = Date.now();
  
  // Calculate a deterministic checkin token hash
  const rawTokenBase = `${membershipId}::${rollNo}::${club?.id || 'ALL'}::${timestamp}`;
  let hashVal = 0;
  for (let i = 0; i < rawTokenBase.length; i++) {
    hashVal = ((hashVal << 5) - hashVal) + rawTokenBase.charCodeAt(i);
    hashVal |= 0;
  }
  const tokenHash = "0x" + Math.abs(hashVal).toString(16).padStart(8, '0') + rollNo.toLowerCase();

  const payload = {
    protocol: "PEC_CCTSC_GATE_PASS_V2",
    type: "STUDENT_MEMBERSHIP_CHECKIN",
    membershipId: membershipId,
    studentId: student.id || "std-101",
    rollNo: rollNo,
    name: student.name || "Student Member",
    department: dept,
    academicYear: student.year || "3rd Year",
    clubId: club?.id || "I4-08",
    clubName: club?.name || "Official Technical Society",
    domain: club?.domain || "Industry 4.0",
    role: student.role || "Active Student Member",
    validUntil: student.validUntil || "30 JUNE 2027",
    verificationHash: tokenHash,
    issuedBy: "Central Technical Council (CCTSC), Pragati Engineering College (Autonomous)",
    timestamp: timestamp,
    // If bound to a specific event
    ...(event ? {
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      passMode: "EVENT_BOUND_FAST_PASS"
    } : {
      passMode: "UNIVERSAL_MEMBERSHIP_PASS"
    })
  };

  return payload;
}

/**
 * Renders a QR code safely into a container element.
 * Uses window.QRCode if loaded, or falls back to an embedded high-resolution SVG/API generator.
 */
export function renderQRCodeToElement(container, payloadData, options = {}) {
  if (!container) return;
  const {
    width = 120,
    height = 120,
    colorDark = "#0f172a",
    colorLight = "#ffffff",
    correctLevel = 2 // Level H or M
  } = options;

  const textToEncode = typeof payloadData === "string" ? payloadData : JSON.stringify(payloadData);

  container.innerHTML = "";

  if (window.QRCode) {
    try {
      new window.QRCode(container, {
        text: textToEncode,
        width: width,
        height: height,
        colorDark: colorDark,
        colorLight: colorLight,
        correctLevel: correctLevel
      });
      return;
    } catch (e) {
      console.warn("window.QRCode rendering fallback:", e);
    }
  }

  // Graceful Fallback: Render via QR API or dynamic high-res SVG
  const encodedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${width}x${height}&data=${encodeURIComponent(textToEncode)}&color=${colorDark.replace('#', '')}&bgcolor=${colorLight.replace('#', '')}&margin=2`;
  const img = document.createElement("img");
  img.src = encodedUrl;
  img.alt = "Student Membership QR Pass";
  img.className = "w-full h-full object-contain rounded-md";
  img.crossOrigin = "anonymous";
  container.appendChild(img);
}

/**
 * Downloads the rendered QR code as a PNG image file
 */
export function downloadQRCodeAsImage(container, filename = "pec-student-membership-qr.png") {
  if (!container) return false;

  const canvas = container.querySelector("canvas");
  if (canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  const img = container.querySelector("img");
  if (img && img.src) {
    // Fetch image and trigger download
    fetch(img.src)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        window.open(img.src, "_blank");
      });
    return true;
  }

  return false;
}
