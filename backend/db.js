import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { OFFICIAL_PEC_CLUBS } from '../js/officialClubs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'pec_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function hashPassword(password, salt) {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

const DEFAULT_SALT = "pec_secure_salt_2026";
const DEFAULT_PASSWORD = "Password@123";
const DEFAULT_PASSWORD_HASH = hashPassword(DEFAULT_PASSWORD, DEFAULT_SALT);

const INITIAL_BACKEND_SEED = {
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

  users: [
    {
      id: "std-101",
      name: "Aarav Sharma",
      rollNo: "22CS101",
      email: "aarav.sharma@pragati.ac.in",
      demoAlias: "student.demo@pragati.ac.in",
      role: "Student",
      department: "CSE",
      year: "3rd Year",
      section: "B",
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      skills: ["Python", "PyTorch", "FastAPI", "Docker", "ROS"],
      interests: ["Artificial Intelligence", "Edge Computing", "Competitive Programming"],
      bio: "Undergraduate CSE student enthusiastic about practical deep learning and edge autonomy.",
      salt: DEFAULT_SALT,
      passwordHash: DEFAULT_PASSWORD_HASH,
      emailVerified: true,
      membershipId: "PEC-MEM-2026-CSE-8492",
      validUntil: "30 June 2027",
      isDemo: true
    },
    {
      id: "coord-201",
      name: "Mrs. L. Yamuna",
      facultyId: "FAC-CSE-AIML-01",
      email: "yamuna.l@pragati.ac.in",
      demoAlias: "coordinator.demo@pragati.ac.in",
      role: "Faculty Coordinator",
      department: "CSE(AIML)",
      designation: "Assistant Professor & Faculty Coordinator",
      phone: "+91 884 2383305",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      assignedClubs: ["I4-08"],
      skills: ["Artificial Intelligence", "Machine Learning", "Research Mentorship"],
      interests: ["Deep Learning Models", "Curricular Innovations"],
      bio: "Faculty Coordinator for AI&ML Turing Club at Pragati Engineering College.",
      salt: DEFAULT_SALT,
      passwordHash: DEFAULT_PASSWORD_HASH,
      emailVerified: true,
      membershipId: "PEC-FAC-2026-AIML-01",
      validUntil: "Permanent",
      isDemo: true
    },
    {
      id: "std-102",
      name: "Priya Patel",
      rollNo: "22CS142",
      email: "priya.patel@pragati.ac.in",
      demoAlias: "leader.demo@pragati.ac.in",
      role: "Club Admin",
      studentLeaderRole: "President",
      clubId: "I4-08",
      assignedClubs: ["I4-08"],
      department: "CSE(AIML)",
      year: "3rd Year",
      section: "A",
      phone: "+91 98480 12345",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      skills: ["Machine Learning", "Event Management", "Python", "Leadership"],
      interests: ["Tech Hackathons", "Community Building"],
      bio: "Student President and Club Admin of AI&ML Turing Club organizing tech symposiums.",
      salt: DEFAULT_SALT,
      passwordHash: DEFAULT_PASSWORD_HASH,
      emailVerified: true,
      membershipId: "PEC-MEM-2026-AIML-5120",
      validUntil: "30 June 2027",
      isDemo: true
    },
    {
      id: "admin-001",
      name: "Dr. K. Satyanarayana",
      facultyId: "FAC-PEC-001",
      email: "principal@pragati.ac.in",
      demoAlias: "admin.demo@pragati.ac.in",
      role: "Super Admin",
      department: "CSE",
      designation: "Principal & Head of Academic Council",
      phone: "+91 884 2383305",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      skills: ["Academic Administration", "NBA / NAAC Accreditation", "Institutional Leadership"],
      interests: ["Higher Technical Education", "Outcome-Based Education"],
      bio: "Principal, Pragati Engineering College (Autonomous), Surampalem.",
      salt: DEFAULT_SALT,
      passwordHash: DEFAULT_PASSWORD_HASH,
      emailVerified: true,
      membershipId: "PEC-ADMIN-2026-HQ-001",
      validUntil: "Lifetime",
      isDemo: true
    },
    {
      id: "guest-001",
      name: "Public Guest",
      email: "guest@pragati.ac.in",
      demoAlias: "guest.demo@pragati.ac.in",
      role: "Guest",
      department: "General Public",
      designation: "Prospective Student / Public Visitor",
      phone: "+91 00000 00000",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      skills: ["Visitor"],
      interests: ["Technology Exploration"],
      bio: "Public visitor exploring technical clubs at Pragati Engineering College.",
      salt: DEFAULT_SALT,
      passwordHash: DEFAULT_PASSWORD_HASH,
      emailVerified: false,
      membershipId: "PEC-GUEST-2026",
      validUntil: "Session Only",
      isDemo: true
    }
  ],

  clubs: OFFICIAL_PEC_CLUBS,

  club_memberships: [
    {
      id: "mem-001",
      membership_id: "PEC-MEM-2026-AIML-101",
      student_id: "std-101",
      club_id: "I4-08",
      role: "Member",
      status: "Approved",
      requested_at: "2026-08-15T10:00:00.000Z",
      approved_at: "2026-08-16T14:30:00.000Z",
      approved_by: "Mrs. L. Yamuna",
      remarks: "Approved. Welcome to the AI&ML Turing Club!"
    },
    {
      id: "mem-002",
      membership_id: "PEC-MEM-2026-AIML-102",
      student_id: "std-102",
      club_id: "I4-08",
      role: "President",
      status: "Approved",
      requested_at: "2026-08-10T09:00:00.000Z",
      approved_at: "2026-08-11T11:00:00.000Z",
      approved_by: "Mrs. L. Yamuna",
      remarks: "Designated as Student President for AY 2025-2026."
    },
    {
      id: "mem-003",
      membership_id: "PEC-MEM-2026-ROB-103",
      student_id: "std-101",
      club_id: "I4-03",
      role: "Member",
      status: "Approved",
      requested_at: "2026-08-20T11:15:00.000Z",
      approved_at: "2026-08-21T09:45:00.000Z",
      approved_by: "Mr. V.V.N. Sarath",
      remarks: "Approved for robotics hardware workgroup."
    }
  ],

  club_roles: [
    {
      id: "crole-001",
      club_id: "I4-08",
      student_id: "std-102",
      role_title: "President",
      assigned_by: "Mrs. L. Yamuna",
      assigned_at: "2026-08-11T11:00:00.000Z"
    }
  ],

  events: [
    {
      id: "evt-101",
      title: "Turing AI & Deep Learning National Symposium 2026",
      category: "Hackathon",
      event_type: "Hackathon",
      club_id: "I4-08",
      date: "2026-10-18",
      start_time: "09:00",
      end_time: "21:00",
      venue: "Central Auditorium & Computer Center, PEC Campus",
      max_participants: 250,
      registration_deadline: "2026-10-16 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      description: "Flagship annual innovation symposium on deep learning architectures, multimodal LLMs, and edge vision models. Features mentor sessions and prize grants.",
      rules: [
        "Teams of 2 to 4 members from authorized engineering colleges.",
        "Original problem statements mapped to Industry 4.0 pillars.",
        "Working prototype and live repository demonstration required."
      ],
      created_by: "Mrs. L. Yamuna",
      created_at: "2026-09-01T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null
    },
    {
      id: "evt-102",
      title: "Autonomous Robotics & Embedded ROS Workshop",
      category: "Workshop",
      event_type: "Workshop",
      club_id: "I4-03",
      date: "2026-10-02",
      start_time: "10:00",
      end_time: "16:30",
      venue: "Mechanical Engineering CAD/CAM Lab",
      max_participants: 80,
      registration_deadline: "2026-09-30 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
      description: "Hands-on session on kinematics, robotic manipulators, ROS Gazebo simulations, and Arduino/ESP32 motor interface calibration.",
      rules: [
        "Individual registration or pairs.",
        "Bring laptop with Ubuntu 22.04 or virtualized ROS container."
      ],
      created_by: "Mr. V.V.N. Sarath",
      created_at: "2026-09-02T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null
    },
    {
      id: "evt-103",
      title: "Cloud Native Kubernetes & Microservices Masterclass",
      category: "Workshop",
      event_type: "Workshop",
      club_id: "I4-07",
      date: "2026-10-08",
      start_time: "14:00",
      end_time: "18:00",
      venue: "IT Department Server Lab",
      max_participants: 100,
      registration_deadline: "2026-10-06 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      description: "Containerized services, Docker multi-stage builds, Kubernetes pod lifecycle, and CI/CD pipelines.",
      rules: [
        "Basic Linux familiarity expected.",
        "Docker Hub account required for lab pushes."
      ],
      created_by: "Mr. K Siva Shankar",
      created_at: "2026-09-03T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null
    },
    {
      id: "evt-104",
      title: "Cyber Defense CTF: Penetration Testing League",
      category: "Competition",
      event_type: "Competition",
      club_id: "I4-06",
      date: "2026-10-14",
      start_time: "10:00",
      end_time: "17:00",
      venue: "Cyber Security Specialized Lab",
      max_participants: 120,
      registration_deadline: "2026-10-12 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
      description: "College-wide ethical hacking capture the flag challenge covering web security, network packet analysis, reverse engineering, and cryptography.",
      rules: [
        "Zero malicious activity outside the designated sandbox network.",
        "Points awarded for valid cryptographically signed flags."
      ],
      created_by: "Mrs. K Sireesha",
      created_at: "2026-09-04T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null
    },
    {
      id: "evt-105",
      title: "Green Building & Sustainable Civil Infrastructure Conclave",
      category: "Technical Session",
      event_type: "Technical Session",
      club_id: "I4-01",
      date: "2026-09-02",
      start_time: "09:30",
      end_time: "13:00",
      venue: "Civil Seminar Hall",
      max_participants: 150,
      registration_deadline: "2026-09-01 23:59",
      status: "Completed",
      banner: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=80",
      description: "Expert keynote presentations on net-zero energy design, IGBC/LEED green building metrics, and low-carbon cement composites.",
      rules: ["Open to all PEC students."],
      created_by: "Mr L Praveen Kumar",
      created_at: "2026-08-20T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null
    }
  ],

  event_registrations: [
    {
      id: "reg-001",
      event_id: "evt-101",
      student_id: "std-101",
      ticket_id: "TCK-TUR-042",
      registered_at: "2026-09-10T11:00:00.000Z",
      status: "Confirmed"
    },
    {
      id: "reg-002",
      event_id: "evt-102",
      student_id: "std-101",
      ticket_id: "TCK-ROB-018",
      registered_at: "2026-09-08T14:20:00.000Z",
      status: "Confirmed"
    },
    {
      id: "reg-003",
      event_id: "evt-105",
      student_id: "std-101",
      ticket_id: "TCK-GB-005",
      registered_at: "2026-08-28T09:30:00.000Z",
      status: "Confirmed"
    }
  ],

  attendance: [
    {
      id: "att-001",
      attendance_id: "ATT-2026-GB-005",
      event_id: "evt-105",
      student_id: "std-101",
      timestamp: "2026-09-02T09:35:12.000Z",
      status: "Present",
      verification_method: "QR Scan"
    }
  ],

  certificates: [
    {
      id: "PEC-AIML-2026-000124",
      certificateId: "PEC-AIML-2026-000124",
      student_id: "std-101",
      student_name: "Aarav Sharma",
      roll_no: "22CS101",
      event_id: "evt-105",
      event_name: "Green Building & Sustainable Civil Infrastructure Conclave",
      club_id: "I4-01",
      club_name: "Green Building Club",
      date: "2026-09-02",
      certificate_type: "Certificate of Participation",
      issued_date: "2026-09-02",
      institution: "Pragati University / Pragati Engineering College (Autonomous)",
      issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
      recipientEmail: "aarav.sharma@pragati.ac.in",
      authorized_signature: "Mr L Praveen Kumar & Dr. K. Satyanarayana (Principal, Pragati University / PEC)",
      qr_hash: "8f4a3c19e872d9b62a15c304f5b89a27d14e5903bcaef421975e810a43bc92fe"
    }
  ],

  announcements: [
    {
      id: "ann-001",
      title: "Official Pragati Engineering College Club Directory 2025-2026",
      message: "All 35 official college clubs across Industry 4.0, Co-Curricular, and Extra-Curricular categories are chartered under the Career Guidance Cell and Academic Council.",
      target_audience: "All Students",
      target_id: "all",
      attachment_url: "https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/",
      created_date: "2026-09-15T09:00:00.000Z",
      created_by: "Central Council of Technical Societies (CCTSC)",
      expiry_date: "2026-12-31",
      pinned: true
    },
    {
      id: "ann-002",
      title: "Turing AI & Deep Learning Symposium Registrations Open",
      message: "AI&ML Turing Club invites students across all departments for hands-on deep learning challenges and prototype exhibits.",
      target_audience: "Club",
      target_id: "I4-08",
      attachment_url: "",
      created_date: "2026-09-12T10:00:00.000Z",
      created_by: "Mrs. L. Yamuna (Faculty Coordinator)",
      expiry_date: "2026-10-18",
      pinned: false
    }
  ],

  notifications: [
    {
      id: "notif-001",
      user_id: "std-101",
      title: "Club Membership Approved",
      message: "Your application to join AI&ML Turing Club (I4-08) has been approved by Mrs. L. Yamuna.",
      category: "Membership",
      link: "#/student/clubs",
      created_at: "2026-08-16T14:30:00.000Z",
      read: false
    },
    {
      id: "notif-002",
      user_id: "std-101",
      title: "Event Registration Confirmed",
      message: "You are registered for 'Turing AI & Deep Learning National Symposium 2026'. Ticket: TCK-TUR-042.",
      category: "Events",
      link: "#/student/events",
      created_at: "2026-09-10T11:00:00.000Z",
      read: false
    },
    {
      id: "notif-003",
      user_id: "all",
      title: "Official Club Directory Published",
      message: "Browse all 35 verified college societies under Career Guidance Cell.",
      category: "Announcements",
      link: "#/clubs",
      created_at: "2026-09-15T09:00:00.000Z",
      read: true
    }
  ],

  resources: [
    {
      id: "res-001",
      title: "Modern Docker & Kubernetes Lab Guide for Cloud Native Microservices",
      description: "Comprehensive tutorial on multi-stage Docker builds, Kubernetes manifests, and Helm charts.",
      club_id: "I4-07",
      category: "Tutorial",
      uploaded_by: "Mr. K Siva Shankar",
      upload_date: "2026-09-01",
      file_url: "https://kubernetes.io/docs/home/",
      target_semester: "5th Semester"
    },
    {
      id: "res-002",
      title: "PyTorch Vision Transformers (ViT) & Transfer Learning Notebook",
      description: "Hands-on Jupyter notebook covering attention heads, fine-tuning, and ONNX deployment.",
      club_id: "I4-08",
      category: "Workshop Material",
      uploaded_by: "Mrs. L. Yamuna",
      upload_date: "2026-08-20",
      file_url: "https://pytorch.org/tutorials/",
      target_semester: "6th Semester"
    }
  ],

  projects: [
    {
      id: "proj-001",
      title: "AeroShield: Edge-AI Wildfire & Thermal Hazard Detection Drone",
      description: "Autonomous payload integrating thermal sensor arrays with Jetson edge computer for instantaneous aerial hot spot alerts.",
      problem_statement: "Early detection of agricultural crop fires and thermal hazards before uncontrolled spreading.",
      solution: "Lightweight computer vision model running at 30 FPS on onboard edge compute with LoRa telemetry downlink.",
      technologies: ["PyTorch", "TensorRT", "Python", "ROS2", "LoRaWAN"],
      team_members: ["Aarav Sharma", "Priya Patel"],
      mentor: "Mrs. L. Yamuna",
      github_link: "https://github.com/pragati-eng/aeroshield",
      demo_link: "https://aeroshield.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"],
      status: "Completed",
      club_id: "I4-08",
      year: "2025-2026"
    },
    {
      id: "proj-002",
      title: "RoboTrack: Autonomous Warehouse AGV with SLAM & Obstacle Avoidance",
      description: "Automated guided vehicle with 2D LiDAR SLAM, ROS2 navigation stack, and differential drive odometry.",
      problem_statement: "Automated intra-facility transport of electronics bins with dynamic obstacle replanning.",
      solution: "Embedded Teensy 4.1 microcontroller running RTOS communicating over micro-ROS with Jetson Orin.",
      technologies: ["ROS2", "C++", "Python", "LiDAR", "Gazebo"],
      team_members: ["Sneha Reddy", "Vikram Aditya"],
      mentor: "Mr. S. Rajesh",
      github_link: "https://github.com/pragati-eng/robotrack-agv",
      demo_link: "https://robotrack.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80"],
      status: "Completed",
      club_id: "I4-03",
      year: "2025-2026"
    },
    {
      id: "proj-003",
      title: "SentinelCore: Zero-Trust Network Traffic Anomaly & Intrusion Guardian",
      description: "Deep packet inspection engine parsing NetFlow logs in real-time to alert on unauthorized privilege escalation.",
      problem_statement: "Preventing lateral movement and data exfiltration inside campus server clusters.",
      solution: "eBPF kernel probe capturing packet flow headers with isolation sandbox rules.",
      technologies: ["eBPF", "Go", "Snort", "Wireshark", "Docker"],
      team_members: ["Rohan Varma", "Kavya Madhavan"],
      mentor: "Mrs. N. Swathi",
      github_link: "https://github.com/pragati-eng/sentinel-core",
      demo_link: "https://sentinel.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"],
      status: "Completed",
      club_id: "I4-06",
      year: "2025-2026"
    },
    {
      id: "proj-004",
      title: "CloudMatrix: Multi-Region Microservices Mesh with Automated Canary Rollouts",
      description: "Kubernetes operator orchestrating blue-green traffic switching based on Prometheus error budget burn rate.",
      problem_statement: "Minimizing downtime during production microservice upgrades across hybrid cloud nodes.",
      solution: "Custom Envoy proxy filter and CRD controller built in Golang with OpenTelemetry tracing.",
      technologies: ["Kubernetes", "Golang", "Envoy", "Prometheus", "Helm"],
      team_members: ["Aarav Sharma", "Ananya Deshmukh"],
      mentor: "Mr. K Siva Shankar",
      github_link: "https://github.com/pragati-eng/cloud-matrix-mesh",
      demo_link: "https://matrix.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80"],
      status: "Completed",
      club_id: "I4-07",
      year: "2025-2026"
    }
  ],

  activity_reports: [
    {
      id: "rep-001",
      activity_title: "Green Building & Sustainable Civil Infrastructure Conclave",
      date: "2026-09-02",
      club_id: "I4-01",
      description: "Institutional keynote conference on low-carbon construction methods and GRIHA certification metrics.",
      participants_count: 142,
      report_file_url: "https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/",
      photos: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=80"],
      created_by: "Mr L Praveen Kumar",
      official_url: "https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/"
    }
  ],

  feedback: [
    {
      id: "fb-001",
      event_id: "evt-105",
      student_id: "std-101",
      content_rating: 5,
      organization_rating: 5,
      speaker_rating: 5,
      venue_rating: 4,
      overall_rating: 5,
      written_feedback: "Extremely insightful presentations on GRIHA compliance. Great hands-on case studies.",
      submitted_at: "2026-09-02T14:15:00.000Z"
    }
  ],

  audit_logs: [
    {
      id: "log-001",
      timestamp: "2026-09-16 10:14:02",
      user: "Dr. K. Satyanarayana (Super Admin)",
      action: "Verified Club Registry",
      affected_record: "All 35 Official PEC Clubs",
      details: "Confirmed official status under Career Guidance Cell."
    },
    {
      id: "log-002",
      timestamp: "2026-09-15 14:20:45",
      user: "Mrs. L. Yamuna (Faculty Coordinator)",
      action: "Approved Symposium",
      affected_record: "Turing AI Symposium 2026",
      details: "Authorized convention hall and laboratory sessions."
    }
  ]
};

let cachedDB = null;

export function getDB() {
  if (cachedDB) return cachedDB;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      cachedDB = JSON.parse(raw);
      // Ensure all 35 official clubs are present
      if (!cachedDB.clubs || cachedDB.clubs.length < 35) {
        cachedDB.clubs = OFFICIAL_PEC_CLUBS;
      }
      // Ensure user roles are updated to standard RBAC roles
      if (Array.isArray(cachedDB.users)) {
        cachedDB.users.forEach(u => {
          if (u.id === "coord-201" && u.role === "Club Coordinator") u.role = "Faculty Coordinator";
          if (u.id === "std-102" && (u.role === "Club Student Leader" || !u.assignedClubs)) {
            u.role = "Club Admin";
            u.assignedClubs = ["I4-08"];
          }
        });
        if (!cachedDB.users.some(u => u.id === "guest-001")) {
          const guestSeed = INITIAL_BACKEND_SEED.users.find(u => u.id === "guest-001");
          if (guestSeed) cachedDB.users.push(guestSeed);
        }
      }

      // Ensure projects array has complete seed
      if (!Array.isArray(cachedDB.projects) || cachedDB.projects.length < 4) {
        cachedDB.projects = INITIAL_BACKEND_SEED.projects;
      }

      // Ensure Round 2 intelligence collections are initialized
      if (!Array.isArray(cachedDB.student_engagement)) cachedDB.student_engagement = [];
      if (!Array.isArray(cachedDB.club_engagement_scores)) cachedDB.club_engagement_scores = [];
      if (!Array.isArray(cachedDB.recommendations)) cachedDB.recommendations = [];
      if (!Array.isArray(cachedDB.engagement_predictions)) cachedDB.engagement_predictions = [];
      if (!Array.isArray(cachedDB.inactive_members)) cachedDB.inactive_members = [];
      if (!Array.isArray(cachedDB.event_intelligence)) cachedDB.event_intelligence = [];
      if (!Array.isArray(cachedDB.analytics_snapshots)) cachedDB.analytics_snapshots = [];
      if (!Array.isArray(cachedDB.intelligence_config)) {
        cachedDB.intelligence_config = [
          { id: "cfg-1", key: "inactive_event_days", value: 60, description: "Days without event attendance before flag" },
          { id: "cfg-2", key: "inactive_activity_days", value: 45, description: "Days without general activity before flag" },
          { id: "cfg-3", key: "inactive_project_days", value: 90, description: "Days without project participation before flag" }
        ];
      }

      return cachedDB;
    }
  } catch (err) {
    console.error("Error reading database file:", err);
  }

  // Fallback to fresh seed
  cachedDB = JSON.parse(JSON.stringify(INITIAL_BACKEND_SEED));
  saveDB(cachedDB);
  return cachedDB;
}

export function saveDB(data) {
  try {
    cachedDB = data;
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error("Error writing database file:", err);
    return false;
  }
}

export function logAudit(userOrObj, action, affected_record, details) {
  const db = getDB();
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
  
  let logEntry;
  if (typeof userOrObj === 'object' && userOrObj !== null && !action) {
    // Structured audit entry
    logEntry = {
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp,
      user_id: userOrObj.user_id || "system",
      user_role: userOrObj.user_role || "System",
      user_name: userOrObj.user_name || "System",
      actor: userOrObj.actor || `${userOrObj.user_name || 'User'} (${userOrObj.user_role || 'System'})`,
      user: userOrObj.actor || userOrObj.user_name || "System",
      action: userOrObj.action || "ADMIN_ACTION",
      resource: userOrObj.resource || "system",
      resource_id: userOrObj.resource_id || "",
      affected_record: userOrObj.affected_record || `${userOrObj.resource || 'Resource'}: ${userOrObj.resource_id || ''}`,
      ip_address: userOrObj.ip_address || "127.0.0.1",
      old_value: userOrObj.old_value !== undefined ? userOrObj.old_value : null,
      new_value: userOrObj.new_value !== undefined ? userOrObj.new_value : null,
      details: userOrObj.details || ""
    };
  } else {
    // Legacy positional arguments
    logEntry = {
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp,
      user_id: "system",
      user_role: "System",
      user: userOrObj,
      actor: userOrObj,
      action: action || "ADMIN_ACTION",
      resource: "system",
      resource_id: "",
      affected_record: affected_record || "",
      details: details || "",
      ip_address: "127.0.0.1"
    };
  }

  if (!Array.isArray(db.audit_logs)) db.audit_logs = [];
  db.audit_logs.unshift(logEntry);
  saveDB(db);
  return logEntry;
}
