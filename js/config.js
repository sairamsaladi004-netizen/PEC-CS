export const APP_CONFIG = {
  institutionName: "Pragati Engineering College, Andhra Pradesh",
  institutionShort: "PEC CampusTech",
  academicCouncil: "Central Council of Technical Societies & Clubs (CCTSC)",
  currentAcademicYear: "2025-2026",
  currentSemester: "Academic Year 2025-2026",
  contactEmail: "clubs@pragati.ac.in",
  portalUrl: typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : '',
  officialClubReportsUrl: "https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/",
  
  categories: [
    "Industry 4.0",
    "Co-Curricular",
    "Extra-Curricular"
  ],

  departments: [
    { code: "CE", name: "Civil Engineering" },
    { code: "IT", name: "Information Technology" },
    { code: "ME", name: "Mechanical Engineering" },
    { code: "CSE", name: "Computer Science & Engineering" },
    { code: "CSE(CS)", name: "CSE - Cyber Security" },
    { code: "CSE(AIML)", name: "CSE - Artificial Intelligence & Machine Learning" },
    { code: "ECE", name: "Electronics & Communication Engineering" },
    { code: "EEE", name: "Electrical & Electronics Engineering" },
    { code: "CSE(DS)", name: "CSE - Data Science" },
    { code: "BSH", name: "Basic Sciences & Humanities" },
    { code: "CSE(AI)", name: "CSE - Artificial Intelligence" }
  ],
  eventCategories: [
    { id: "hackathon", name: "Hackathon", color: "purple" },
    { id: "workshop", name: "Hands-on Workshop", color: "blue" },
    { id: "coding_contest", name: "Coding Contest", color: "emerald" },
    { id: "tech_talk", name: "Tech Talk / Webinar", color: "amber" },
    { id: "bootcamp", name: "Bootcamp", color: "rose" }
  ],
  roles: {
    STUDENT: "Student",
    CLUB_ADMIN: "Club Admin",
    FACULTY_COORD: "Faculty Coordinator",
    SUPER_ADMIN: "Super Admin",
    GUEST: "Guest"
  },
  rolePermissions: {
    "Student": [
      "clubs.view", "events.view", "attendance.view", "certificates.view", "projects.view",
      "projects.create", "resources.view", "announcements.view", "reports.view",
      "view_clubs", "join_club", "register_event", "view_card", "submit_project", "access_lms", "view_roadmaps", "view_tools", "download_cert"
    ],
    "Club Admin": [
      "clubs.view", "clubs.update", "members.view", "members.approve", "events.view",
      "events.create", "events.update", "attendance.view", "attendance.mark", "certificates.view",
      "certificates.request", "projects.view", "projects.create", "projects.update", "resources.view",
      "resources.create", "resources.update", "announcements.view", "announcements.create", "reports.view", "analytics.view",
      "manage_club", "create_event", "generate_poster", "scan_attendance", "manage_lms_resources", "view_club_analytics"
    ],
    "Faculty Coordinator": [
      "users.view", "clubs.view", "clubs.update", "members.view", "members.approve", "members.remove",
      "events.view", "events.create", "events.update", "events.approve", "attendance.view",
      "attendance.mark", "attendance.update", "attendance.approve", "certificates.view",
      "certificates.request", "certificates.generate", "certificates.approve", "projects.view",
      "projects.create", "projects.update", "projects.approve", "resources.view", "resources.create",
      "resources.update", "resources.delete", "announcements.view", "announcements.create",
      "announcements.update", "announcements.delete", "reports.view", "reports.export", "analytics.view", "audit_logs.view"
    ],
    "Super Admin": ["all_permissions", "*"],
    "Guest": ["clubs.view", "events.view", "announcements.view", "resources.view", "view_clubs"]
  }
};
