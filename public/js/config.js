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
    CLUB_MEMBER: "Club Member",
    CLUB_ADMIN: "Club Admin",
    FACULTY_COORD: "Faculty Coordinator",
    DEPT_ADMIN: "Department Admin",
    SUPER_ADMIN: "Super Admin"
  },
  rolePermissions: {
    "Student": ["view_clubs", "join_club", "register_event", "view_card", "submit_project", "access_lms", "view_roadmaps", "view_tools", "download_cert"],
    "Club Member": ["view_clubs", "join_club", "register_event", "view_card", "submit_project", "access_lms", "view_roadmaps", "view_tools", "download_cert", "member_perks"],
    "Club Admin": ["view_clubs", "join_club", "register_event", "view_card", "submit_project", "access_lms", "view_roadmaps", "view_tools", "download_cert", "member_perks", "manage_club", "create_event", "generate_poster", "scan_attendance", "manage_lms_resources", "view_club_analytics"],
    "Faculty Coordinator": ["view_clubs", "approve_club_teams", "review_projects", "endorse_certificates", "view_club_analytics", "download_reports", "access_lms"],
    "Department Admin": ["view_clubs", "view_dept_analytics", "manage_dept_clubs", "download_reports", "review_dept_events"],
    "Super Admin": ["all_permissions", "manage_users", "approve_new_clubs", "manage_rbac", "audit_logs", "institutional_reports", "system_moderation"]
  }
};
