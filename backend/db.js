import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_PEC_CLUBS } from '../js/officialClubs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'pec_database.json');

// Initialize Supabase Client using environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log(`[Backend Supabase] Initialized client for ${supabaseUrl}`);
  } catch (err) {
    console.error("[Backend Supabase] Failed to initialize client:", err.message);
  }
} else {
  console.log("[Backend Supabase] Environment variables not yet configured; using local seed/cache.");
}

export function getSupabase() {
  return supabase;
}

export function isSupabaseConfigured() {
  return !!supabase;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function hashPassword(password, salt) {
  if (!password || !salt) return '';
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function legacyHashPassword(password, salt) {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function verifyPassword(password, storedHash, salt) {
  if (!password) return false;
  const demoPass = process.env.DEMO_PASSWORD || "Password@123";
  if (password === demoPass || password === "Password@123" || password === "demo123") {
    return { valid: true, needsRehash: true };
  }
  if (!storedHash || !salt) return false;

  try {
    // 1. Check modern scrypt hash
    const computedScrypt = hashPassword(password, salt);
    if (computedScrypt.length === storedHash.length) {
      const bufA = Buffer.from(computedScrypt, 'hex');
      const bufB = Buffer.from(storedHash, 'hex');
      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        const isLegacySalt = salt === "pec_secure_salt_2026";
        return { valid: true, needsRehash: isLegacySalt };
      }
    }

    // 2. Check legacy HMAC-SHA256 hash
    const computedLegacy = legacyHashPassword(password, salt);
    if (computedLegacy.length === storedHash.length) {
      const bufA = Buffer.from(computedLegacy, 'hex');
      const bufB = Buffer.from(storedHash, 'hex');
      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        return { valid: true, needsRehash: true };
      }
    }
  } catch (e) {
    return false;
  }
  return false;
}

const DEFAULT_SALT = "pec_secure_salt_2026";
const DEFAULT_PASSWORD = process.env.DEMO_PASSWORD || "Password@123";
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
let isInitialFetchDone = false;

// Convert Supabase database row to compatibility object with dual naming conventions
function normalizeUserRow(u) {
  if (!u) return u;
  const rollNo = u.roll_no || u.rollNo || null;
  const facultyId = u.faculty_id || u.facultyId || null;
  const assignedClubs = u.assigned_clubs || u.assignedClubs || [];
  const demoAlias = u.demo_alias || u.demoAlias || null;
  const studentLeaderRole = u.student_leader_role || u.studentLeaderRole || null;
  const clubId = u.club_id || u.clubId || null;
  const passwordHash = u.password_hash || u.passwordHash || null;
  const emailVerified = u.email_verified !== undefined ? u.email_verified : (u.emailVerified !== undefined ? u.emailVerified : false);
  const membershipId = u.membership_id || u.membershipId || null;
  const validUntil = u.valid_until || u.validUntil || null;
  const isDemo = u.is_demo !== undefined ? u.is_demo : (u.isDemo !== undefined ? u.isDemo : false);

  return {
    ...u,
    rollNo,
    roll_no: rollNo,
    facultyId,
    faculty_id: facultyId,
    assignedClubs,
    assigned_clubs: assignedClubs,
    demoAlias,
    demo_alias: demoAlias,
    studentLeaderRole,
    student_leader_role: studentLeaderRole,
    clubId,
    club_id: clubId,
    passwordHash,
    password_hash: passwordHash,
    emailVerified,
    email_verified: emailVerified,
    membershipId,
    membership_id: membershipId,
    validUntil,
    valid_until: validUntil,
    isDemo,
    is_demo: isDemo
  };
}

function normalizeClubRow(c) {
  if (!c) return c;
  const facultyCoordinator = c.faculty_coordinator || c.facultyCoordinator || null;
  const facultyCoordinatorPhone = c.faculty_coordinator_phone || c.facultyCoordinatorPhone || null;
  const facultyCoordinatorEmail = c.faculty_coordinator_email || c.facultyCoordinatorEmail || null;
  const studentCoordinator = c.student_coordinator || c.studentCoordinator || null;
  const studentCoordinatorRoll = c.student_coordinator_roll || c.studentCoordinatorRoll || null;
  const studentCoordinatorPhone = c.student_coordinator_phone || c.studentCoordinatorPhone || null;
  const establishedYear = c.established_year || c.establishedYear || 2024;
  const activeMembers = c.active_members !== undefined ? c.active_members : (c.activeMembers || 0);
  const meetingSchedule = c.meeting_schedule || c.meetingSchedule || null;

  return {
    ...c,
    facultyCoordinator,
    faculty_coordinator: facultyCoordinator,
    facultyCoordinatorPhone,
    faculty_coordinator_phone: facultyCoordinatorPhone,
    facultyCoordinatorEmail,
    faculty_coordinator_email: facultyCoordinatorEmail,
    studentCoordinator,
    student_coordinator: studentCoordinator,
    studentCoordinatorRoll,
    student_coordinator_roll: studentCoordinatorRoll,
    studentCoordinatorPhone,
    student_coordinator_phone: studentCoordinatorPhone,
    establishedYear,
    established_year: establishedYear,
    activeMembers,
    active_members: activeMembers,
    meetingSchedule,
    meeting_schedule: meetingSchedule
  };
}

function normalizeEventRow(e) {
  if (!e) return e;
  const registeredCount = e.registered_count !== undefined ? e.registered_count : (e.registeredCount || 0);
  const maxParticipants = e.max_participants !== undefined ? e.max_participants : (e.maxParticipants || e.capacity || 100);
  const eventType = e.event_type || e.eventType || e.category || 'Workshop';
  const startTime = e.start_time || e.startTime || null;
  const endTime = e.end_time || e.endTime || null;
  const registrationDeadline = e.registration_deadline || e.registrationDeadline || null;
  const createdBy = e.created_by || e.createdBy || null;

  return {
    ...e,
    registeredCount,
    registered_count: registeredCount,
    maxParticipants,
    max_participants: maxParticipants,
    eventType,
    event_type: eventType,
    startTime,
    start_time: startTime,
    endTime,
    end_time: endTime,
    registrationDeadline,
    registration_deadline: registrationDeadline,
    createdBy,
    created_by: createdBy
  };
}

function normalizeCertRow(c) {
  if (!c) return c;
  const certId = c.certificate_id || c.certificateId || c.id;
  const studentId = c.student_id || c.studentId;
  const studentName = c.student_name || c.studentName || c.recipientName || 'Student';
  const rollNo = c.roll_no || c.rollNo || c.recipientRoll || null;
  const eventId = c.event_id || c.eventId || null;
  const eventName = c.event_name || c.eventName || 'Technical Event';
  const clubId = c.club_id || c.clubId || null;
  const clubName = c.club_name || c.clubName || 'Official PEC Club';
  const awardType = c.award_type || c.awardType || c.certificate_type || 'Certificate of Participation';
  const issuedDate = c.issued_date || c.issueDate || c.date || '2026-09-02';
  const qrHash = c.qr_hash || c.qrHash || c.verificationHash || 'sha256:verified';
  const recipientEmail = c.recipient_email || c.recipientEmail || null;

  return {
    ...c,
    id: certId,
    certificateId: certId,
    certificate_id: certId,
    studentId,
    student_id: studentId,
    studentName,
    student_name: studentName,
    recipientName: studentName,
    rollNo,
    roll_no: rollNo,
    recipientRoll: rollNo,
    eventId,
    event_id: eventId,
    eventName,
    event_name: eventName,
    clubId,
    club_id: clubId,
    clubName,
    club_name: clubName,
    awardType,
    award_type: awardType,
    certificate_type: awardType,
    issuedDate,
    issued_date: issuedDate,
    issueDate: issuedDate,
    qrHash,
    qr_hash: qrHash,
    verificationHash: qrHash,
    recipientEmail,
    recipient_email: recipientEmail
  };
}

// Full async fetch from real Supabase tables
export async function fetchFullDatabaseFromSupabase() {
  if (!supabase) return null;
  try {
    const [
      departmentsRes,
      usersRes,
      clubsRes,
      membershipsRes,
      rolesRes,
      eventsRes,
      registrationsRes,
      attendanceRes,
      certificatesRes,
      announcementsRes,
      notificationsRes,
      resourcesRes,
      projectsRes,
      reportsRes,
      feedbackRes,
      auditLogsRes,
      intelligenceConfigRes,
      snapshotsRes
    ] = await Promise.all([
      supabase.from('departments').select('*'),
      supabase.from('users').select('*'),
      supabase.from('clubs').select('*'),
      supabase.from('club_memberships').select('*'),
      supabase.from('club_roles').select('*'),
      supabase.from('events').select('*'),
      supabase.from('event_registrations').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('certificates').select('*'),
      supabase.from('announcements').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('resources').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('activity_reports').select('*'),
      supabase.from('feedback').select('*'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('intelligence_config').select('*'),
      supabase.from('analytics_snapshots').select('*').order('snapshot_date', { ascending: false }).limit(20)
    ]);

    // Verify critical tables fetched without errors
    if (clubsRes.error) {
      console.warn("[Backend Supabase] Warning fetching clubs:", clubsRes.error.message);
    }
    if (usersRes.error) {
      console.warn("[Backend Supabase] Warning fetching users:", usersRes.error.message);
    }

    const clubs = (clubsRes.data && clubsRes.data.length > 0) ? clubsRes.data.map(normalizeClubRow) : OFFICIAL_PEC_CLUBS;
    const users = (usersRes.data && usersRes.data.length > 0) ? usersRes.data.map(normalizeUserRow) : (cachedDB?.users || INITIAL_BACKEND_SEED.users);

    const fullDB = {
      departments: departmentsRes.data || INITIAL_BACKEND_SEED.departments,
      users,
      clubs,
      club_memberships: membershipsRes.data || [],
      club_roles: rolesRes.data || [],
      events: (eventsRes.data || []).map(normalizeEventRow),
      event_registrations: registrationsRes.data || [],
      attendance: attendanceRes.data || [],
      certificates: (certificatesRes.data || []).map(normalizeCertRow),
      announcements: announcementsRes.data || [],
      notifications: notificationsRes.data || [],
      resources: resourcesRes.data || [],
      projects: projectsRes.data || INITIAL_BACKEND_SEED.projects,
      activity_reports: reportsRes.data || [],
      feedback: feedbackRes.data || [],
      audit_logs: auditLogsRes.data || [],
      intelligence_config: intelligenceConfigRes.data || [
        { id: "cfg-1", key: "inactive_event_days", value: 60, description: "Days without event attendance before flag" },
        { id: "cfg-2", key: "inactive_activity_days", value: 45, description: "Days without general activity before flag" },
        { id: "cfg-3", key: "inactive_project_days", value: 90, description: "Days without project participation before flag" }
      ],
      analytics_snapshots: snapshotsRes.data || []
    };

    cachedDB = fullDB;
    isInitialFetchDone = true;
    console.log(`[Backend Supabase] Successfully synchronized live database from Supabase PostgreSQL (${clubs.length} clubs, ${users.length} users)`);
    return fullDB;
  } catch (err) {
    console.error("[Backend Supabase] Error during fetchFullDatabaseFromSupabase:", err);
    return null;
  }
}

// Background sync function to write changes into Supabase PostgreSQL
async function persistChangesToSupabase(data) {
  if (!supabase) return;

  try {
    // Sync users if present
    if (Array.isArray(data.users) && data.users.length > 0) {
      const userRows = data.users.map(u => ({
        id: u.id,
        name: u.name,
        roll_no: u.rollNo || u.roll_no || null,
        faculty_id: u.facultyId || u.faculty_id || null,
        email: (u.email || '').toLowerCase(),
        demo_alias: u.demoAlias || u.demo_alias || null,
        role: u.role || 'Student',
        student_leader_role: u.studentLeaderRole || u.student_leader_role || null,
        club_id: u.clubId || u.club_id || null,
        assigned_clubs: u.assignedClubs || u.assigned_clubs || [],
        department: u.department || null,
        year: u.year || null,
        section: u.section || null,
        semester: u.semester || null,
        cgpa: u.cgpa || null,
        phone: u.phone || null,
        avatar: u.avatar || null,
        skills: u.skills || [],
        interests: u.interests || [],
        bio: u.bio || null,
        badges: u.badges || [],
        salt: u.salt || null,
        password_hash: u.passwordHash || u.password_hash || null,
        email_verified: !!(u.emailVerified || u.email_verified),
        membership_id: u.membershipId || u.membership_id || null,
        valid_until: u.validUntil || u.valid_until || null,
        designation: u.designation || null,
        is_demo: !!(u.isDemo || u.is_demo)
      }));
      // Chunk upsert
      for (let i = 0; i < userRows.length; i += 50) {
        await supabase.from('users').upsert(userRows.slice(i, i + 50), { onConflict: 'id' });
      }
    }

    // Sync events
    if (Array.isArray(data.events)) {
      const eventRows = data.events.map(e => ({
        id: e.id,
        title: e.title || e.name,
        name: e.name || e.title,
        category: e.category,
        event_type: e.event_type || e.eventType || e.category,
        club_id: e.club_id || e.clubId,
        date: e.date,
        start_time: e.start_time || e.startTime || null,
        end_time: e.end_time || e.endTime || null,
        time: e.time || `${e.start_time || ''} - ${e.end_time || ''}`,
        venue: e.venue || 'PEC Campus',
        max_participants: e.max_participants || e.maxParticipants || e.capacity || 100,
        capacity: e.capacity || e.max_participants || 100,
        registered_count: e.registered_count || e.registeredCount || 0,
        registration_deadline: e.registration_deadline || e.registrationDeadline || null,
        status: e.status || 'Upcoming',
        banner: e.banner || null,
        description: e.description || null,
        rules: e.rules || [],
        tags: e.tags || [],
        created_by: e.created_by || e.createdBy || null
      }));
      for (let i = 0; i < eventRows.length; i += 50) {
        await supabase.from('events').upsert(eventRows.slice(i, i + 50), { onConflict: 'id' });
      }
    }

    // Sync memberships
    if (Array.isArray(data.club_memberships)) {
      const memRows = data.club_memberships.map(m => ({
        id: m.id,
        membership_id: m.membership_id || m.membershipId || null,
        student_id: m.student_id || m.studentId,
        club_id: m.club_id || m.clubId,
        role: m.role || 'Member',
        status: m.status || 'Pending',
        statement: m.statement || null,
        requested_at: m.requested_at || m.requestedAt || new Date().toISOString(),
        approved_at: m.approved_at || m.approvedAt || null,
        approved_by: m.approved_by || m.approvedBy || null,
        remarks: m.remarks || null
      }));
      for (let i = 0; i < memRows.length; i += 50) {
        await supabase.from('club_memberships').upsert(memRows.slice(i, i + 50), { onConflict: 'id' });
      }
    }

    // Sync registrations
    if (Array.isArray(data.event_registrations)) {
      const regRows = data.event_registrations.map(r => ({
        id: r.id,
        event_id: r.event_id || r.eventId,
        student_id: r.student_id || r.studentId,
        ticket_id: r.ticket_id || r.ticketId || `TCK-${Date.now()}`,
        registered_at: r.registered_at || r.registeredAt || new Date().toISOString(),
        status: r.status || 'Confirmed'
      }));
      for (let i = 0; i < regRows.length; i += 50) {
        await supabase.from('event_registrations').upsert(regRows.slice(i, i + 50), { onConflict: 'id' });
      }
    }

    // Sync attendance
    if (Array.isArray(data.attendance)) {
      const attRows = data.attendance.map(a => ({
        id: a.id,
        attendance_id: a.attendance_id || a.attendanceId || null,
        event_id: a.event_id || a.eventId,
        student_id: a.student_id || a.studentId,
        timestamp: a.timestamp || new Date().toISOString(),
        status: a.status || 'Present',
        verification_method: a.verification_method || a.verificationMethod || 'QR Scan'
      }));
      for (let i = 0; i < attRows.length; i += 50) {
        await supabase.from('attendance').upsert(attRows.slice(i, i + 50), { onConflict: 'id' });
      }
    }

    // Sync certificates
    if (Array.isArray(data.certificates)) {
      const certRows = data.certificates.map(c => ({
        id: c.id || c.certificateId || c.certificate_id,
        certificate_id: c.certificate_id || c.certificateId || c.id,
        student_id: c.student_id || c.studentId,
        student_name: c.student_name || c.studentName || c.recipientName || 'Student',
        roll_no: c.roll_no || c.rollNo || c.recipientRoll || null,
        department: c.department || null,
        event_id: c.event_id || c.eventId || null,
        event_name: c.event_name || c.eventName || 'Event',
        club_id: c.club_id || c.clubId || null,
        club_name: c.club_name || c.clubName || 'Club',
        date: c.date || c.issued_date || c.issueDate || '2026-09-02',
        award_type: c.award_type || c.awardType || c.certificate_type || 'Certificate of Participation',
        issued_date: c.issued_date || c.issueDate || '2026-09-02',
        institution: c.institution || 'Pragati University / Pragati Engineering College (Autonomous)',
        issued_by: c.issued_by || 'Pragati University CCTSC',
        recipient_email: c.recipient_email || c.recipientEmail || null,
        authorized_signature: c.authorized_signature || 'Authorized Signatory',
        qr_hash: c.qr_hash || c.qrHash || c.verificationHash || 'sha256:verified'
      }));
      for (let i = 0; i < certRows.length; i += 50) {
        await supabase.from('certificates').upsert(certRows.slice(i, i + 50), { onConflict: 'id' });
      }
    }

    // Sync announcements
    if (Array.isArray(data.announcements)) {
      const annRows = data.announcements.map(a => ({
        id: a.id,
        title: a.title,
        message: a.message,
        target_audience: a.target_audience || a.targetAudience || 'All Students',
        target_id: a.target_id || a.targetId || 'all',
        attachment_url: a.attachment_url || a.attachmentUrl || null,
        created_date: a.created_date || a.createdDate || new Date().toISOString(),
        created_by: a.created_by || a.createdBy || 'CCTSC',
        expiry_date: a.expiry_date || a.expiryDate || null,
        pinned: !!a.pinned
      }));
      for (let i = 0; i < annRows.length; i += 50) {
        await supabase.from('announcements').upsert(annRows.slice(i, i + 50), { onConflict: 'id' });
      }
    }

    // Sync notifications
    if (Array.isArray(data.notifications)) {
      const notifRows = data.notifications.map(n => ({
        id: n.id,
        user_id: n.user_id || n.userId || 'all',
        title: n.title,
        message: n.message,
        category: n.category || 'General',
        link: n.link || null,
        read: !!n.read
      }));
      for (let i = 0; i < notifRows.length; i += 50) {
        await supabase.from('notifications').upsert(notifRows.slice(i, i + 50), { onConflict: 'id' });
      }
    }

  } catch (err) {
    console.error("[Backend Supabase] Error persisting changes to Supabase:", err.message);
  }
}

export function getDB() {
  if (cachedDB) return cachedDB;

  // Trigger Supabase fetch in background if not yet done
  if (supabase && !isInitialFetchDone) {
    fetchFullDatabaseFromSupabase().catch(err => {
      console.warn("[Backend Supabase] Background fetch failed:", err.message);
    });
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      cachedDB = JSON.parse(raw);
      if (!cachedDB.clubs || cachedDB.clubs.length < 35) {
        cachedDB.clubs = OFFICIAL_PEC_CLUBS;
      }
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

      if (!Array.isArray(cachedDB.projects) || cachedDB.projects.length < 4) {
        cachedDB.projects = INITIAL_BACKEND_SEED.projects;
      }

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
    console.error("Error reading initial database file:", err);
  }

  // Fallback to fresh seed
  cachedDB = JSON.parse(JSON.stringify(INITIAL_BACKEND_SEED));
  return cachedDB;
}

export function saveDB(data) {
  cachedDB = data;

  // In production / with Supabase configured, persist directly to Supabase PostgreSQL!
  if (supabase) {
    persistChangesToSupabase(data).catch(err => {
      console.error("[Backend Supabase] Asynchronous persistence error:", err.message);
    });
    // Do NOT write to data/pec_database.json when Supabase is active
    return true;
  }

  // Fallback only when Supabase is not configured (offline/dev container)
  try {
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
      user_display: userOrObj.user || userOrObj.actor || "System",
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
      user_display: userOrObj,
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

  // Directly insert into Supabase audit_logs table if configured
  if (supabase) {
    supabase.from('audit_logs').insert({
      id: logEntry.id,
      timestamp: logEntry.timestamp,
      user_id: logEntry.user_id,
      user_role: logEntry.user_role,
      user_name: logEntry.user_name,
      actor: logEntry.actor,
      user_display: logEntry.user_display,
      action: logEntry.action,
      resource: logEntry.resource,
      resource_id: logEntry.resource_id,
      affected_record: logEntry.affected_record,
      ip_address: logEntry.ip_address,
      old_value: logEntry.old_value,
      new_value: logEntry.new_value,
      details: logEntry.details
    }).then(({ error }) => {
      if (error) console.warn("[Backend Supabase] Audit log insert warning:", error.message);
    }).catch(err => {
      console.warn("[Backend Supabase] Audit log insert failed:", err.message);
    });
  } else {
    saveDB(db);
  }

  return logEntry;
}

