import { OFFICIAL_PEC_CLUBS } from "./officialClubs.js";

export const DB_KEY = "campustech_pec_db_v3";

export const INITIAL_SEED = {
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
      semester: "5th Semester",
      cgpa: "9.12",
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      clubs: ["I4-08", "I4-03"],
      skills: ["Python", "PyTorch", "FastAPI", "Docker", "ROS"],
      interests: ["Artificial Intelligence", "Edge Computing", "Competitive Programming"],
      bio: "Undergraduate CSE student interested in edge AI autonomy and deep learning architectures.",
      badges: ["Verified PEC Student", "Dean's Honor Roll", "Active Participant"],
      membershipId: "PEC-MEM-2026-CSE-8492",
      validUntil: "30 June 2027",
      emailVerified: true,
      isDemo: true
    },
    {
      id: "coord-201",
      name: "Mrs. L. Yamuna",
      facultyId: "FAC-CSE-AIML-01",
      email: "yamuna.l@pragati.ac.in",
      demoAlias: "coordinator.demo@pragati.ac.in",
      role: "Club Coordinator",
      department: "CSE(AIML)",
      designation: "Assistant Professor & Faculty Coordinator",
      year: "Assistant Professor",
      semester: "Permanent",
      phone: "+91 884 2383305",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      clubs: ["I4-08"],
      assignedClubs: ["I4-08"],
      skills: ["Artificial Intelligence", "Machine Learning", "Research Mentorship"],
      interests: ["Deep Learning Models", "Curricular Innovations"],
      bio: "Official Faculty Coordinator for AI&ML Turing Club (CSE-AIML) at Pragati Engineering College.",
      badges: ["Faculty Coordinator - AI&ML Turing Club"],
      membershipId: "PEC-FAC-2026-AIML-01",
      validUntil: "Permanent",
      emailVerified: true,
      isDemo: true
    },
    {
      id: "std-102",
      name: "Priya Patel",
      rollNo: "22CS142",
      email: "priya.patel@pragati.ac.in",
      demoAlias: "leader.demo@pragati.ac.in",
      role: "Club Student Leader",
      studentLeaderRole: "President",
      clubId: "I4-08",
      department: "CSE(AIML)",
      year: "3rd Year",
      section: "A",
      semester: "5th Semester",
      cgpa: "8.95",
      phone: "+91 98480 12345",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      clubs: ["I4-08"],
      skills: ["Machine Learning", "Event Management", "Python", "Leadership"],
      interests: ["Tech Hackathons", "Community Building"],
      bio: "Student President of AI&ML Turing Club coordinating tech symposiums and workshops.",
      badges: ["Student President - Turing Club", "Verified PEC Student"],
      membershipId: "PEC-MEM-2026-AIML-5120",
      validUntil: "30 June 2027",
      emailVerified: true,
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
      year: "Principal",
      semester: "Permanent",
      phone: "+91 884 2383305",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      clubs: ["I4-01", "I4-08", "CC-05"],
      skills: ["Academic Administration", "NBA / NAAC Accreditation", "Institutional Leadership"],
      interests: ["Higher Technical Education", "Outcome-Based Education"],
      bio: "Principal, Pragati Engineering College (Autonomous), Surampalem.",
      badges: ["Institutional Head", "Council President"],
      membershipId: "PEC-ADMIN-2026-HQ-001",
      validUntil: "Lifetime",
      emailVerified: true,
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
      clubId: "I4-08",
      date: "2026-10-18",
      time: "09:00 - 21:00",
      start_time: "09:00",
      end_time: "21:00",
      venue: "Central Auditorium & Computer Center, PEC Campus",
      capacity: 250,
      max_participants: 250,
      registeredCount: 195,
      registration_deadline: "2026-10-16 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      description: "Flagship annual innovation symposium on deep learning architectures, multimodal LLMs, and edge vision models. Features mentor sessions and prize grants.",
      rules: [
        "Teams of 2 to 4 members from authorized engineering colleges.",
        "Original problem statements mapped to Industry 4.0 pillars.",
        "Working prototype and live repository demonstration required."
      ],
      tags: ["Deep Learning", "Generative AI", "Certificates", "Prize Pool ₹1,00,000"],
      created_by: "Mrs. L. Yamuna",
      created_at: "2026-09-01T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-102",
      title: "Autonomous Robotics & Embedded ROS Workshop",
      category: "Workshop",
      event_type: "Workshop",
      club_id: "I4-03",
      clubId: "I4-03",
      date: "2026-10-02",
      time: "10:00 - 16:30",
      start_time: "10:00",
      end_time: "16:30",
      venue: "Mechanical Engineering CAD/CAM Lab",
      capacity: 80,
      max_participants: 80,
      registeredCount: 68,
      registration_deadline: "2026-09-30 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
      description: "Hands-on session on kinematics, robotic manipulators, ROS Gazebo simulations, and Arduino/ESP32 motor interface calibration.",
      rules: [
        "Individual registration or pairs.",
        "Bring laptop with Ubuntu 22.04 or virtualized ROS container."
      ],
      tags: ["Robotics", "ROS", "Hardware Prototyping"],
      created_by: "Mr. V.V.N. Sarath",
      created_at: "2026-09-02T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-103",
      title: "Cloud Native Kubernetes & Microservices Masterclass",
      category: "Workshop",
      event_type: "Workshop",
      club_id: "I4-07",
      clubId: "I4-07",
      date: "2026-10-08",
      time: "14:00 - 18:00",
      start_time: "14:00",
      end_time: "18:00",
      venue: "IT Department Server Lab",
      capacity: 100,
      max_participants: 100,
      registeredCount: 84,
      registration_deadline: "2026-10-06 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      description: "Containerized services, Docker multi-stage builds, Kubernetes pod lifecycle, and CI/CD pipelines.",
      rules: ["Basic Linux familiarity expected.", "Docker Hub account required."],
      tags: ["Cloud", "DevOps", "Kubernetes"],
      created_by: "Mr. K Siva Shankar",
      created_at: "2026-09-03T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-104",
      title: "Cyber Defense CTF: Penetration Testing League",
      category: "Competition",
      event_type: "Competition",
      club_id: "I4-06",
      clubId: "I4-06",
      date: "2026-10-14",
      time: "10:00 - 17:00",
      start_time: "10:00",
      end_time: "17:00",
      venue: "Cyber Security Specialized Lab",
      capacity: 120,
      max_participants: 120,
      registeredCount: 110,
      registration_deadline: "2026-10-12 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
      description: "College-wide ethical hacking capture the flag challenge covering web security, network packet analysis, reverse engineering, and cryptography.",
      rules: ["Zero malicious activity outside sandbox network."],
      tags: ["CTF", "Ethical Hacking", "Cyber Defense"],
      created_by: "Mrs. K Sireesha",
      created_at: "2026-09-04T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-105",
      title: "Green Building & Sustainable Civil Infrastructure Conclave",
      category: "Technical Session",
      event_type: "Technical Session",
      club_id: "I4-01",
      clubId: "I4-01",
      date: "2026-09-02",
      time: "09:30 - 13:00",
      start_time: "09:30",
      end_time: "13:00",
      venue: "Civil Seminar Hall",
      capacity: 150,
      max_participants: 150,
      registeredCount: 142,
      registration_deadline: "2026-09-01 23:59",
      status: "Completed",
      banner: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=80",
      description: "Expert keynote presentations on net-zero energy design, IGBC/LEED green building metrics, and low-carbon cement composites.",
      rules: ["Open to all PEC students."],
      tags: ["Sustainability", "Civil Engineering", "LEED Ratings"],
      created_by: "Mr L Praveen Kumar",
      created_at: "2026-08-20T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-106",
      title: "Edge Computing & LoRaWAN Smart Campus Hackathon",
      category: "Hackathon",
      event_type: "Hackathon",
      club_id: "I4-09",
      clubId: "I4-09",
      date: "2026-10-24",
      time: "08:30 - 20:30",
      start_time: "08:30",
      end_time: "20:30",
      venue: "ECE Embedded Systems Lab & Open Courtyard",
      capacity: 160,
      max_participants: 160,
      registeredCount: 128,
      registration_deadline: "2026-10-22 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      description: "Build low-power long-range IoT sensor networks deployed across the PEC campus for air quality, solar tracking, and water flow monitoring.",
      rules: ["Teams of 2 to 3 members.", "Hardware development boards (ESP32/LoRa) provided on deposit."],
      tags: ["IoT", "LoRaWAN", "Edge Computing", "Hardware"],
      created_by: "Mr. G. Durga Prasad",
      created_at: "2026-09-05T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-107",
      title: "Spatial Computing & Digital Twin Industrial Workshop",
      category: "Bootcamp",
      event_type: "Bootcamp",
      club_id: "I4-04",
      clubId: "I4-04",
      date: "2026-11-04",
      time: "09:30 - 16:30",
      start_time: "09:30",
      end_time: "16:30",
      venue: "AR/VR Simulation Lab, CSE Block",
      capacity: 90,
      max_participants: 90,
      registeredCount: 72,
      registration_deadline: "2026-11-02 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80",
      description: "Hands-on development of real-time industrial digital twins using WebXR, Unity 3D, and real-time telemetry streaming pipelines.",
      rules: ["Individual participation.", "Basic knowledge of 3D coordinates recommended."],
      tags: ["AR/VR", "Digital Twin", "Unity3D", "WebXR"],
      created_by: "Mr. A. Avinash",
      created_at: "2026-09-06T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-201",
      title: "Smart Grid & Microgrid Renewable Energy Hackathon",
      category: "Hackathon",
      event_type: "Hackathon",
      club_id: "CC-01",
      clubId: "CC-01",
      date: "2026-10-22",
      time: "09:00 - 18:00",
      start_time: "09:00",
      end_time: "18:00",
      venue: "EEE Power Systems Simulation Center",
      capacity: 150,
      max_participants: 150,
      registeredCount: 114,
      registration_deadline: "2026-10-20 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80",
      description: "Design automated peak load leveling algorithms and solar microgrid distribution systems for sustainable university campuses.",
      rules: ["Teams of 2 to 4 students from all engineering disciplines.", "Simulink and Python models permitted."],
      tags: ["Smart Grid", "Renewable Energy", "MATLAB", "Sustainability"],
      created_by: "Mrs. K. Deepthi",
      created_at: "2026-09-07T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-202",
      title: "Hydrological Sensor Networks & IoT Water Quality Conclave",
      category: "Workshop",
      event_type: "Workshop",
      club_id: "CC-02",
      clubId: "CC-02",
      date: "2026-10-29",
      time: "10:00 - 15:30",
      start_time: "10:00",
      end_time: "15:30",
      venue: "Environmental Engineering Lab, CE Block",
      capacity: 80,
      max_participants: 80,
      registeredCount: 65,
      registration_deadline: "2026-10-27 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
      description: "Real-time water quality monitoring, turbidity sensor telemetry, and automatic filtration feedback control for rural water safety.",
      rules: ["Open to Civil, ECE, and CSE students."],
      tags: ["Water Analytics", "Sensors", "Civil Engineering"],
      created_by: "Mr. B. Rajesh",
      created_at: "2026-09-08T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-204",
      title: "Campus Tech for Good: Rural Digital Empowerment Sprint",
      category: "Hackathon",
      event_type: "Hackathon",
      club_id: "CC-05",
      clubId: "CC-05",
      date: "2026-11-12",
      time: "09:00 - 19:00",
      start_time: "09:00",
      end_time: "19:00",
      venue: "Central Seminar Hall 2",
      capacity: 140,
      max_participants: 140,
      registeredCount: 98,
      registration_deadline: "2026-11-10 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
      description: "Develop lightweight multilingual PWA web tools and offline educational resources for nearby rural schools in East Godavari district.",
      rules: ["Open-source solutions only.", "Mobile-first offline capability required."],
      tags: ["Social Impact", "Open Source", "Mobile Web", "PWA"],
      created_by: "Dr. P. V. S. Machiraju",
      created_at: "2026-09-09T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-301",
      title: "Pragsoft 24-Hour Full-Stack Distributed Systems Buildathon",
      category: "Hackathon",
      event_type: "Hackathon",
      club_id: "EC-04",
      clubId: "EC-04",
      date: "2026-10-26",
      time: "09:00 - 09:00 (+1 day)",
      start_time: "09:00",
      end_time: "09:00",
      venue: "Computer Center Lab 1 & 2 (Overnight Hackathon)",
      capacity: 200,
      max_participants: 200,
      registeredCount: 176,
      registration_deadline: "2026-10-24 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
      description: "Pragsoft flagship overnight hackathon building distributed microservices, event queues, resilience engineering, and reactive frontends.",
      rules: ["Teams of 2 to 4 members.", "Night pass consent required from college warden/HOD."],
      tags: ["Microservices", "Full Stack", "Distributed Systems", "Cash Prize ₹50,000"],
      created_by: "Mr. Ch. Venkata Ramana",
      created_at: "2026-09-10T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-302",
      title: "WebXR & Spatial Metaverse Developer Conclave",
      category: "Workshop",
      event_type: "Workshop",
      club_id: "EC-03",
      clubId: "EC-03",
      date: "2026-10-31",
      time: "10:00 - 16:00",
      start_time: "10:00",
      end_time: "16:00",
      venue: "CSE(AI) Advanced Multimedia Lab",
      capacity: 110,
      max_participants: 110,
      registeredCount: 88,
      registration_deadline: "2026-10-29 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80",
      description: "Three.js, WebGL shader optimization, and avatar synchronization in shared persistent 3D virtual spaces.",
      rules: ["Laptop with WebGL 2.0 supported browser."],
      tags: ["WebXR", "ThreeJS", "Metaverse", "WebGL"],
      created_by: "Mr. M. Radhika Mani",
      created_at: "2026-09-11T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-303",
      title: "Autonomous GO-KART EV Powertrain & Telemetry Grand Prix",
      category: "Competition",
      event_type: "Competition",
      club_id: "EC-06",
      clubId: "EC-06",
      date: "2026-11-06",
      time: "08:30 - 17:00",
      start_time: "08:30",
      end_time: "17:00",
      venue: "PEC Automotive Testing Track & Workshop Grounds",
      capacity: 120,
      max_participants: 120,
      registeredCount: 104,
      registration_deadline: "2026-11-04 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80",
      description: "Track trials of student-built electric go-karts featuring CAN-bus telemetry, regenerative braking controllers, and thermal battery management.",
      rules: ["Safety gear and fire safety briefing mandatory."],
      tags: ["Electric Vehicles", "Automotive", "Mechanical", "Telemetry"],
      created_by: "Mr. K. V. S. R. K. Prasad",
      created_at: "2026-09-12T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
    },
    {
      id: "evt-304",
      title: "High-Frequency VLSI & Embedded Signal Processing Symposium",
      category: "Technical Session",
      event_type: "Technical Session",
      club_id: "EC-08",
      clubId: "EC-08",
      date: "2026-11-14",
      time: "10:00 - 16:30",
      start_time: "10:00",
      end_time: "16:30",
      venue: "IETE Seminar Hall, ECE Block",
      capacity: 130,
      max_participants: 130,
      registeredCount: 92,
      registration_deadline: "2026-11-12 23:59",
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      description: "Keynotes and research presentations on FPGA accelerators, RISC-V softcores, and edge DSP pipelines in wireless communications.",
      rules: ["Open to UG & PG students."],
      tags: ["VLSI", "FPGA", "Signal Processing", "IETE"],
      created_by: "Dr. V. Sailaja",
      created_at: "2026-09-13T10:00:00.000Z",
      active_qr_token: null,
      qr_token_expiry: null,
      registrations: []
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
      studentId: "std-101",
      student_name: "Aarav Sharma",
      studentName: "Aarav Sharma",
      recipientName: "Aarav Sharma",
      roll_no: "22CS101",
      rollNo: "22CS101",
      recipientRoll: "22CS101",
      department: "CSE",
      event_id: "evt-105",
      event_name: "Green Building & Sustainable Civil Infrastructure Conclave",
      eventName: "Green Building & Sustainable Civil Infrastructure Conclave",
      club_id: "I4-01",
      club_name: "Green Building Club",
      date: "2026-09-02",
      awardType: "Certificate of Participation & Technical Completion",
      certificate_type: "Certificate of Participation & Technical Completion",
      issued_date: "2026-09-02",
      issueDate: "2026-09-02",
      institution: "Pragati University / Pragati Engineering College (Autonomous)",
      issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
      recipientEmail: "aarav.sharma@pragati.ac.in",
      authorized_signature: "Mr L Praveen Kumar & Dr. K. Satyanarayana (Principal, Pragati University / PEC)",
      qr_hash: "8f4a3c19e872d9b62a15c304f5b89a27d14e5903bcaef421975e810a43bc92fe",
      qrHash: "8f4a3c19e872d9b62a15c304f5b89a27d14e5903bcaef421975e810a43bc92fe",
      verificationHash: "8f4a3c19e872d9b62a15c304f5b89a27d14e5903bcaef421975e810a43bc92fe"
    },
    {
      id: "PEC-AIML-2026-000125",
      certificateId: "PEC-AIML-2026-000125",
      student_id: "std-102",
      studentId: "std-102",
      student_name: "Priya Patel",
      studentName: "Priya Patel",
      recipientName: "Priya Patel",
      roll_no: "22CS142",
      rollNo: "22CS142",
      recipientRoll: "22CS142",
      department: "CSE(AIML)",
      event_id: "evt-101",
      event_name: "Turing AI & Deep Learning National Symposium 2026",
      eventName: "Turing AI & Deep Learning National Symposium 2026",
      club_id: "I4-08",
      club_name: "AI&ML Turing Club",
      date: "2026-09-10",
      awardType: "Certificate of Merit & Technical Excellence",
      certificate_type: "Certificate of Merit & Technical Excellence",
      issued_date: "2026-09-10",
      issueDate: "2026-09-10",
      institution: "Pragati University / Pragati Engineering College (Autonomous)",
      issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
      recipientEmail: "priya.patel@pragati.ac.in",
      authorized_signature: "Mrs. L. Yamuna & Dr. K. Satyanarayana",
      qr_hash: "a49f7b12d38e65c01b442e987cfa610283e54b1d8e6a2c91834f826bc1209ade",
      qrHash: "a49f7b12d38e65c01b442e987cfa610283e54b1d8e6a2c91834f826bc1209ade",
      verificationHash: "a49f7b12d38e65c01b442e987cfa610283e54b1d8e6a2c91834f826bc1209ade"
    },
    {
      id: "PEC-ROB-2026-000188",
      certificateId: "PEC-ROB-2026-000188",
      student_id: "std-101",
      studentId: "std-101",
      student_name: "Aarav Sharma",
      studentName: "Aarav Sharma",
      recipientName: "Aarav Sharma",
      roll_no: "22CS101",
      rollNo: "22CS101",
      recipientRoll: "22CS101",
      department: "CSE",
      event_id: "evt-102",
      event_name: "Autonomous Robotics & Embedded ROS Workshop",
      eventName: "Autonomous Robotics & Embedded ROS Workshop",
      club_id: "I4-03",
      club_name: "Robotics Club",
      date: "2026-09-12",
      awardType: "Certificate of Participation",
      certificate_type: "Certificate of Participation",
      issued_date: "2026-09-12",
      issueDate: "2026-09-12",
      institution: "Pragati University / Pragati Engineering College (Autonomous)",
      issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
      recipientEmail: "aarav.sharma@pragati.ac.in",
      authorized_signature: "Mr. V.V.N. Sarath & Dr. K. Satyanarayana",
      qr_hash: "7e2b10ca4589d36184a2098e72c841b5903bcaef421975e810a43bc92fe98341",
      qrHash: "7e2b10ca4589d36184a2098e72c841b5903bcaef421975e810a43bc92fe98341",
      verificationHash: "7e2b10ca4589d36184a2098e72c841b5903bcaef421975e810a43bc92fe98341"
    },
    {
      id: "PEC-CYB-2026-000219",
      certificateId: "PEC-CYB-2026-000219",
      student_id: "std-103",
      studentId: "std-103",
      student_name: "Sneha Reddy",
      studentName: "Sneha Reddy",
      recipientName: "Sneha Reddy",
      roll_no: "23CS205",
      rollNo: "23CS205",
      recipientRoll: "23CS205",
      department: "CSE(CS)",
      event_id: "evt-104",
      event_name: "Cyber Defense CTF: Penetration Testing League",
      eventName: "Cyber Defense CTF: Penetration Testing League",
      club_id: "I4-06",
      club_name: "Cyber Security Club",
      date: "2026-09-14",
      awardType: "Winner & Grand Prix Hackathon Finalist",
      certificate_type: "Winner & Grand Prix Hackathon Finalist",
      issued_date: "2026-09-14",
      issueDate: "2026-09-14",
      institution: "Pragati University / Pragati Engineering College (Autonomous)",
      issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
      recipientEmail: "sneha.reddy@pragati.ac.in",
      authorized_signature: "Mrs. K Sireesha & Dr. K. Satyanarayana",
      qr_hash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01234",
      qrHash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01234",
      verificationHash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01234"
    },
    {
      id: "PEC-DEV-2026-000305",
      certificateId: "PEC-DEV-2026-000305",
      student_id: "std-104",
      studentId: "std-104",
      student_name: "Sai Kumar",
      studentName: "Sai Kumar",
      recipientName: "Sai Kumar",
      roll_no: "22IT045",
      rollNo: "22IT045",
      recipientRoll: "22IT045",
      department: "IT",
      event_id: "evt-103",
      event_name: "Cloud Native Kubernetes & Microservices Masterclass",
      eventName: "Cloud Native Kubernetes & Microservices Masterclass",
      club_id: "I4-07",
      club_name: "Cloud Computing Club",
      date: "2026-09-08",
      awardType: "Certificate of Participation",
      certificate_type: "Certificate of Participation",
      issued_date: "2026-09-08",
      issueDate: "2026-09-08",
      institution: "Pragati University / Pragati Engineering College (Autonomous)",
      issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
      recipientEmail: "sai.kumar@pragati.ac.in",
      authorized_signature: "Mr. K Siva Shankar & Dr. K. Satyanarayana",
      qr_hash: "9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
      qrHash: "9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
      verificationHash: "9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b"
    }
  ],

  announcements: [
    {
      id: "ann-001",
      title: "Official Pragati Engineering College Club Directory 2025-2026",
      message: "All 35 official college clubs across Industry 4.0, Co-Curricular, and Extra-Curricular categories are chartered under the Career Guidance Cell and Academic Council.",
      content: "All 35 official college clubs across Industry 4.0, Co-Curricular, and Extra-Curricular categories are actively chartered for Academic Year 2025-2026 under the Career Guidance Cell and Academic Council.",
      target_audience: "All Students",
      target_id: "all",
      priority: "critical",
      attachment_url: "https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/",
      date: "September 15, 2026",
      created_date: "2026-09-15T09:00:00.000Z",
      author: "Central Council of Technical Societies (CCTSC)",
      created_by: "Central Council of Technical Societies (CCTSC)",
      department: "Institutional",
      expiry_date: "2026-12-31",
      pinned: true
    },
    {
      id: "ann-002",
      title: "Turing AI & Deep Learning Symposium Registrations Open",
      message: "AI&ML Turing Club invites students across all departments for hands-on deep learning challenges and prototype exhibits.",
      content: "AI&ML Turing Club (CSE-AIML) invites student participants for hands-on challenge tracks and live model demonstration booths.",
      target_audience: "Club",
      target_id: "I4-08",
      priority: "important",
      attachment_url: "",
      date: "September 12, 2026",
      created_date: "2026-09-12T10:00:00.000Z",
      author: "Mrs. L. Yamuna (Faculty Coordinator)",
      created_by: "Mrs. L. Yamuna (Faculty Coordinator)",
      department: "CSE(AIML)",
      expiry_date: "2026-10-18",
      pinned: false
    }
  ],

  notifications: [
    {
      id: "notif-001",
      user_id: "std-101",
      userId: "std-101",
      title: "Club Membership Approved",
      message: "Your application to join AI&ML Turing Club (I4-08) has been approved by Mrs. L. Yamuna.",
      category: "Membership",
      link: "#/student/clubs",
      time: "2 hours ago",
      created_at: "2026-08-16T14:30:00.000Z",
      read: false
    },
    {
      id: "notif-002",
      user_id: "std-101",
      userId: "std-101",
      title: "Event Registration Confirmed",
      message: "You are confirmed for 'Turing AI & Deep Learning National Symposium 2026'. Pass Code: TCK-TUR-042.",
      category: "Events",
      link: "#/student/events",
      time: "1 day ago",
      created_at: "2026-09-10T11:00:00.000Z",
      read: false
    },
    {
      id: "notif-003",
      user_id: "all",
      userId: "all",
      title: "Official Club Directory Published",
      message: "Browse all 35 verified college technical and cultural societies.",
      category: "Announcements",
      link: "#/clubs",
      time: "2 days ago",
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
      clubId: "I4-07",
      category: "Lab Guide",
      uploaded_by: "Mr. K Siva Shankar",
      author: "Mr. K Siva Shankar",
      upload_date: "2026-09-01",
      dateAdded: "2026-09-01",
      file_url: "https://kubernetes.io/docs/home/",
      link: "https://kubernetes.io/docs/home/",
      target_semester: "5th Semester",
      targetSemester: "5th Semester",
      readTime: "45 mins lab",
      domain: "Cloud Computing",
      difficulty: "Intermediate",
      bookmarks: 142,
      completions: 89
    },
    {
      id: "res-002",
      title: "PyTorch Vision Transformers (ViT) & Transfer Learning Notebook",
      description: "Hands-on Jupyter notebook covering attention heads, fine-tuning, and ONNX deployment.",
      club_id: "I4-08",
      clubId: "I4-08",
      category: "Code Notebook",
      uploaded_by: "Mrs. L. Yamuna",
      author: "Mrs. L. Yamuna",
      upload_date: "2026-08-20",
      dateAdded: "2026-08-20",
      file_url: "https://pytorch.org/tutorials/",
      link: "https://pytorch.org/tutorials/",
      target_semester: "6th Semester",
      targetSemester: "6th Semester",
      readTime: "60 mins lab",
      domain: "Artificial Intelligence & ML",
      difficulty: "Advanced",
      bookmarks: 230,
      completions: 164
    }
  ],

  projects: [
    {
      id: "proj-001",
      title: "AeroShield: Edge-AI Wildfire & Hazard Detection Drone",
      description: "Autonomous payload integrating thermal sensor arrays with Jetson edge computer for instantaneous aerial hot spot alerts.",
      problem_statement: "Early detection of agricultural crop fires and thermal hazards before uncontrolled spreading.",
      solution: "Lightweight computer vision model running at 30 FPS on onboard edge compute with LoRa telemetry downlink.",
      technologies: ["PyTorch", "TensorRT", "Python", "ROS2", "LoRaWAN"],
      techStack: ["PyTorch", "TensorRT", "Python", "ROS2", "LoRaWAN"],
      team_members: ["Aarav Sharma", "Priya Patel"],
      teamMembers: ["Aarav Sharma", "Priya Patel"],
      teamLeader: "Aarav Sharma",
      mentor: "Mrs. L. Yamuna",
      facultyMentor: "Mrs. L. Yamuna",
      github_link: "https://github.com/pragati-eng/aeroshield",
      github: "https://github.com/pragati-eng/aeroshield",
      demo_link: "https://aeroshield.pragati.ac.in",
      demo: "https://aeroshield.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"],
      status: "Completed",
      club_id: "I4-08",
      domain: "Artificial Intelligence & ML",
      department: "CSE",
      year: "2025-2026",
      upvotes: 48,
      comments: [
        { author: "Priya Patel", text: "Great flight stability during the live campus demonstration!" },
        { author: "Dr. K. Satyanarayana", text: "Commendable interdisciplinary work combining aeronautics and computer vision." }
      ],
      featured: true,
      facultyReview: {
        rating: 5,
        status: "Approved",
        remarks: "Exemplary real-time vision pipeline and clean telemetry architecture.",
        reviewer: "Mrs. L. Yamuna",
        reviewedAt: "2026-09-11"
      }
    },
    {
      id: "proj-002",
      title: "AgriBot: Autonomous Rover for Precision Crop Health & Soil NPK Analysis",
      description: "Field rover equipped with multi-spectral cameras and spectroscopic sensors to analyze soil nitrogen, phosphorus, and potassium levels in real-time.",
      problem_statement: "High cost of soil laboratory testing leading to delayed fertilizer balancing for local farmers in East Godavari district.",
      solution: "Solar-powered tracked rover with localized computer vision disease classification and edge NPK telemetry mapped to GPS coordinates.",
      technologies: ["Embedded C++", "ROS 2", "YOLOv8", "Raspberry Pi 5", "LoRa"],
      techStack: ["Embedded C++", "ROS 2", "YOLOv8", "Raspberry Pi 5", "LoRa"],
      team_members: ["Kavya Patel", "Sai Kumar", "Rohan Verma"],
      teamMembers: ["Kavya Patel", "Sai Kumar", "Rohan Verma"],
      teamLeader: "Kavya Patel",
      mentor: "Mr. V.V.N. Sarath",
      facultyMentor: "Mr. V.V.N. Sarath",
      github_link: "https://github.com/pragati-eng/agribot-rover",
      github: "https://github.com/pragati-eng/agribot-rover",
      demo_link: "https://agribot.pragati.ac.in",
      demo: "https://agribot.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"],
      status: "Approved",
      club_id: "I4-03",
      domain: "Robotics & Automation",
      department: "ECE / CSE",
      year: "2025-2026",
      upvotes: 39,
      comments: [
        { author: "Sneha Reddy", text: "The field accuracy on ground testing was impressive." }
      ],
      featured: true,
      facultyReview: {
        rating: 5,
        status: "Approved",
        remarks: "Robust mechanical chassis design and high sensor calibration accuracy.",
        reviewer: "Mr. V.V.N. Sarath",
        reviewedAt: "2026-09-12"
      }
    },
    {
      id: "proj-003",
      title: "MediChain: Decentralized Zero-Knowledge EHR Records Ledger",
      description: "Privacy-preserving electronic health records storage utilizing zk-SNARKs and IPFS decentralized encryption with patient-governed access delegation.",
      problem_statement: "Inter-hospital medical record interoperability without compromising patient confidentiality under HIPAA and Indian DPDP Act standards.",
      solution: "Smart contracts on Polygon zkEVM with client-side zero-knowledge encryption key derivation for instant provider verification.",
      technologies: ["Solidity", "Rust", "Circom", "Next.js", "IPFS", "Ethers.js"],
      techStack: ["Solidity", "Rust", "Circom", "Next.js", "IPFS", "Ethers.js"],
      team_members: ["Aarav Sharma", "Sneha Reddy", "Aditya Joshi"],
      teamMembers: ["Aarav Sharma", "Sneha Reddy", "Aditya Joshi"],
      teamLeader: "Aarav Sharma",
      mentor: "Dr. K. Satyanarayana",
      facultyMentor: "Dr. K. Satyanarayana",
      github_link: "https://github.com/pragati-eng/medichain-zk",
      github: "https://github.com/pragati-eng/medichain-zk",
      demo_link: "https://medichain.pragati.ac.in",
      demo: "https://medichain.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"],
      status: "Approved",
      club_id: "I4-08",
      domain: "Web3 & Blockchain",
      department: "CSE",
      year: "2025-2026",
      upvotes: 56,
      comments: [
        { author: "K. Devanand", text: "Zero knowledge proof verification benchmarks look super fast!" }
      ],
      featured: true,
      facultyReview: {
        rating: 5,
        status: "Approved",
        remarks: "Excellent cryptographic rigor and patient privacy protocol implementation.",
        reviewer: "Dr. K. Satyanarayana",
        reviewedAt: "2026-09-14"
      }
    },
    {
      id: "proj-004",
      title: "QuantumGuard: Automated CTF Penetration Testing & Binary Analysis Engine",
      description: "Interactive security assessment platform featuring live sandboxed containers, automated vulnerability scanning, and dynamic symbol tracing.",
      problem_statement: "Lack of isolated, reproducible offensive security practice labs for cybersecurity club students preparing for national competitions.",
      solution: "Docker-in-Docker sandboxing engine with real-time audit logging and automated exploit evaluation harnesses.",
      technologies: ["Python", "Ghidra API", "Docker", "FastAPI", "WebSockets", "TailwindCSS"],
      techStack: ["Python", "Ghidra API", "Docker", "FastAPI", "WebSockets", "TailwindCSS"],
      team_members: ["Sneha Reddy", "Varun Teja"],
      teamMembers: ["Sneha Reddy", "Varun Teja"],
      teamLeader: "Sneha Reddy",
      mentor: "Mrs. K Sireesha",
      facultyMentor: "Mrs. K Sireesha",
      github_link: "https://github.com/pragati-eng/quantumguard-ctf",
      github: "https://github.com/pragati-eng/quantumguard-ctf",
      demo_link: "https://ctf.pragati.ac.in",
      demo: "https://ctf.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80"],
      status: "Approved",
      club_id: "I4-06",
      domain: "Cyber Security & Networks",
      department: "CSE(CS)",
      year: "2025-2026",
      upvotes: 62,
      comments: [
        { author: "Aarav Sharma", text: "Solved the reverse engineering challenge track—the sandbox is seamless!" }
      ],
      featured: true,
      facultyReview: {
        rating: 5,
        status: "Approved",
        remarks: "High industrial utility. Safe sandboxing containment confirmed.",
        reviewer: "Mrs. K Sireesha",
        reviewedAt: "2026-09-14"
      }
    },
    {
      id: "proj-005",
      title: "SolarGrid: Smart Micro-Grid Load Balancer with IoT Smart Metering",
      description: "Campus renewable energy management network monitoring solar generation panels, battery storage, and dynamic building power distribution.",
      problem_statement: "Peak load fluctuations causing reliance on diesel generator backups across college laboratory blocks.",
      solution: "Predictive load-shifting algorithm powered by weather forecasting APIs and MQTT energy sensor nodes across campus substations.",
      technologies: ["ESP32", "MQTT", "Node-RED", "InfluxDB", "Grafana", "Python"],
      techStack: ["ESP32", "MQTT", "Node-RED", "InfluxDB", "Grafana", "Python"],
      team_members: ["Sai Kumar", "T. Rajesh", "P. Ananya"],
      teamMembers: ["Sai Kumar", "T. Rajesh", "P. Ananya"],
      teamLeader: "Sai Kumar",
      mentor: "Mr L Praveen Kumar",
      facultyMentor: "Mr L Praveen Kumar",
      github_link: "https://github.com/pragati-eng/solargrid-iot",
      github: "https://github.com/pragati-eng/solargrid-iot",
      demo_link: "https://solargrid.pragati.ac.in",
      demo: "https://solargrid.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80"],
      status: "Approved",
      club_id: "I4-01",
      domain: "IoT & Sustainable Infrastructure",
      department: "EEE / Civil",
      year: "2025-2026",
      upvotes: 44,
      comments: [
        { author: "Mr L Praveen Kumar", text: "Successfully deployed in Block 3 with 14% energy savings logged." }
      ],
      featured: true,
      facultyReview: {
        rating: 5,
        status: "Approved",
        remarks: "Significant tangible energy reduction impact on campus infrastructure.",
        reviewer: "Mr L Praveen Kumar",
        reviewedAt: "2026-09-05"
      }
    },
    {
      id: "proj-006",
      title: "DecentraVote: Quantum-Resistant Student Council Polling Protocol",
      description: "Verifiable, anonymous electronic voting framework with lattice-based cryptography and instant verifiable tally generation.",
      problem_statement: "Manual ballot counting errors and verification latency during annual student executive elections.",
      solution: "Threshold cryptographic scheme ensuring anonymity while providing mathematical mathematical proof of tally integrity.",
      technologies: ["Go", "Kyber/Dilithium", "WebAssembly", "TypeScript", "TailwindCSS"],
      techStack: ["Go", "Kyber/Dilithium", "WebAssembly", "TypeScript", "TailwindCSS"],
      team_members: ["Aditya Joshi", "Aarav Sharma", "Kavya Patel"],
      teamMembers: ["Aditya Joshi", "Aarav Sharma", "Kavya Patel"],
      teamLeader: "Aditya Joshi",
      mentor: "Mrs. L. Yamuna",
      facultyMentor: "Mrs. L. Yamuna",
      github_link: "https://github.com/pragati-eng/decentravote",
      github: "https://github.com/pragati-eng/decentravote",
      demo_link: "https://vote.pragati.ac.in",
      demo: "https://vote.pragati.ac.in",
      images: ["https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80"],
      status: "Approved",
      club_id: "I4-08",
      domain: "Cryptography & Security",
      department: "CSE",
      year: "2025-2026",
      upvotes: 51,
      comments: [
        { author: "Sneha Reddy", text: "Tested with 500 simultaneous voters with zero collisions." }
      ],
      featured: true,
      facultyReview: {
        rating: 5,
        status: "Approved",
        remarks: "Novel cryptographic architecture with high voter privacy benchmarks.",
        reviewer: "Mrs. L. Yamuna",
        reviewedAt: "2026-09-15"
      }
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
      actor: "Dr. K. Satyanarayana (Super Admin)",
      user: "Dr. K. Satyanarayana (Super Admin)",
      action: "Verified Club Registry",
      affected_record: "All 35 Official PEC Clubs",
      target: "All 35 Official PEC Clubs",
      details: "Confirmed official status under Career Guidance Cell."
    },
    {
      id: "log-002",
      timestamp: "2026-09-15 14:20:45",
      actor: "Mrs. L. Yamuna (Faculty Coordinator)",
      user: "Mrs. L. Yamuna (Faculty Coordinator)",
      action: "Approved Symposium",
      affected_record: "Turing AI Symposium 2026",
      target: "Turing AI Symposium 2026",
      details: "Authorized convention hall and laboratory sessions."
    }
  ],

  // Backwards compatibility collections
  lmsResources: [
    {
      id: "lms-1",
      title: "Modern Docker & Kubernetes for Cloud Native Applications",
      domain: "Cloud Computing",
      difficulty: "Intermediate",
      category: "Lab Guide",
      targetSemester: "5th Semester",
      clubId: "I4-07",
      author: "Mr. K Siva Shankar",
      dateAdded: "2026-09-01",
      description: "Hands-on walkthrough for multi-stage Dockerfiles, Helm charts, and local Minikube cluster setup.",
      link: "https://kubernetes.io/docs/home/",
      readTime: "45 mins lab",
      bookmarks: 142,
      completions: 89
    },
    {
      id: "lms-2",
      title: "Deep Neural Networks & Computer Vision with PyTorch",
      domain: "Artificial Intelligence & ML",
      difficulty: "Advanced",
      category: "Code Notebook",
      targetSemester: "6th Semester",
      clubId: "I4-08",
      author: "Mrs. L. Yamuna",
      dateAdded: "2026-08-20",
      description: "Complete training pipeline for convolutional neural networks, transfer learning, and ONNX runtime export.",
      link: "https://pytorch.org/tutorials/",
      readTime: "60 mins lab",
      bookmarks: 230,
      completions: 164
    }
  ],

  roadmaps: [
    {
      id: "rm-ai",
      title: "Applied AI & Deep Learning Engineer",
      domain: "Artificial Intelligence & ML",
      description: "From linear algebra and NumPy foundations to transformers, LLM fine-tuning, and edge inference.",
      nodes: [
        { id: "ai-1", title: "Linear Algebra, Calculus & NumPy Vectors", level: "Beginner", completed: true },
        { id: "ai-2", title: "PyTorch Tensor Fundamentals & Autograd", level: "Beginner", completed: true },
        { id: "ai-3", title: "CNNs & Vision Transformers (ViT)", level: "Intermediate", completed: true },
        { id: "ai-4", title: "Diffusion Models & Generative AI", level: "Advanced", completed: false },
        { id: "ai-5", title: "TensorRT & Quantized Edge Inference", level: "Advanced", completed: false }
      ]
    },
    {
      id: "rm-cloud",
      title: "Cloud Native & DevOps Architect",
      domain: "Cloud Computing & DevOps",
      description: "Mastering containers, service meshes, Terraform IaC, and resilient distributed microservices.",
      nodes: [
        { id: "c-1", title: "Linux Systems, Shell Scripting & Networking", level: "Beginner", completed: true },
        { id: "c-2", title: "Docker Containerization & Multi-stage Builds", level: "Beginner", completed: true },
        { id: "c-3", title: "Kubernetes Cluster Architecture & Helm", level: "Intermediate", completed: false },
        { id: "c-4", title: "CI/CD Pipelines with GitHub Actions & ArgoCD", level: "Intermediate", completed: false },
        { id: "c-5", title: "Terraform Infrastructure as Code (IaC)", level: "Advanced", completed: false }
      ]
    }
  ],

  tools: [
    {
      id: "tool-1",
      name: "Docker Desktop",
      platform: "Mac / Windows / Linux",
      category: "DevOps & Cloud",
      purpose: "Local container runtime for rapid containerization, testing, and multi-service Docker Compose workflows.",
      tags: ["Containers", "DevOps", "Virtualization"],
      url: "https://www.docker.com"
    },
    {
      id: "tool-2",
      name: "PyTorch Framework",
      platform: "Python / C++",
      category: "AI & Data Science",
      purpose: "Open source machine learning framework that accelerates the path from research to deployment.",
      tags: ["Machine Learning", "Tensors", "Deep Learning"],
      url: "https://pytorch.org"
    }
  ],

  gallery: [
    {
      id: "gal-1",
      clubId: "I4-08",
      title: "Pragati Tech Expo & AI Symposium",
      description: "Students presenting machine learning and embedded prototypes at the central exhibition hall.",
      coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
      date: "October 2025"
    },
    {
      id: "gal-2",
      clubId: "I4-03",
      title: "Robotics Arena Demonstrations",
      description: "Autonomous line-following rovers and robotic arm manipulation showcased during annual tech festival.",
      coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
      date: "January 2026"
    }
  ],

  clubBudgets: [
    { clubId: "I4-08", allocated: 100000, utilized: 45000, claims: [] },
    { clubId: "I4-03", allocated: 120000, utilized: 60000, claims: [] },
    { clubId: "I4-06", allocated: 80000, utilized: 30000, claims: [] },
    { clubId: "I4-07", allocated: 90000, utilized: 35000, claims: [] }
  ],

  clubProposals: []
};

// Map legacy fields
INITIAL_SEED.auditLogs = INITIAL_SEED.audit_logs;
INITIAL_SEED.auditLog = INITIAL_SEED.audit_logs;

import { initSupabaseClient, getSupabaseClient } from './supabaseClient.js';

// In-memory single source of truth for runtime database
let memoryDB = null;
let isDbInitialized = false;

// Database Access & Persistence Layer backed by Supabase & Express API
export function getDB() {
  if (memoryDB) return memoryDB;

  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DB_KEY) : null;
    let data;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        data = null;
      }
    }

    if (!data) {
      data = JSON.parse(JSON.stringify(INITIAL_SEED));
    }
    
    // Ensure all 35 official Pragati Engineering College clubs are loaded
    if (!data.clubs || data.clubs.length < 35 || data.clubs.some(c => c.id === "acm" || c.id === "gdsc")) {
      data.clubs = JSON.parse(JSON.stringify(OFFICIAL_PEC_CLUBS));
    }

    // Ensure events across all categories exist
    if (!Array.isArray(data.events) || data.events.length < 10) {
      data.events = JSON.parse(JSON.stringify(INITIAL_SEED.events));
    }

    // Ensure all relational arrays exist
    if (!Array.isArray(data.club_memberships)) data.club_memberships = INITIAL_SEED.club_memberships;
    if (!Array.isArray(data.event_registrations)) data.event_registrations = INITIAL_SEED.event_registrations;
    if (!Array.isArray(data.attendance)) data.attendance = INITIAL_SEED.attendance;
    if (!Array.isArray(data.feedback)) data.feedback = INITIAL_SEED.feedback;
    if (!Array.isArray(data.resources) || data.resources.length === 0) data.resources = INITIAL_SEED.resources;
    if (!Array.isArray(data.activity_reports) || data.activity_reports.length === 0) data.activity_reports = INITIAL_SEED.activity_reports;
    if (!Array.isArray(data.audit_logs)) data.audit_logs = INITIAL_SEED.audit_logs;
    if (!Array.isArray(data.projects) || data.projects.length < 3) data.projects = INITIAL_SEED.projects;
    if (!Array.isArray(data.certificates) || data.certificates.length < 3) {
      data.certificates = INITIAL_SEED.certificates;
    }

    // Ensure all certificate records have consistent dual naming fields
    if (Array.isArray(data.certificates)) {
      data.certificates.forEach(c => {
        const name = c.recipientName || c.student_name || c.studentName || 'Aarav Sharma';
        const roll = c.recipientRoll || c.roll_no || c.rollNo || '22CS101';
        const event = c.eventName || c.event_name || c.title || 'Technical Workshop';
        const certType = c.awardType || c.certificate_type || c.category || 'Accredited Certificate';
        const hash = c.qrHash || c.qr_hash || c.verificationHash || `sha256:0x${Math.random().toString(16).slice(2, 12)}`;
        const issue = c.issueDate || c.issued_date || c.date || '2026-09-02';

        c.recipientName = name;
        c.student_name = name;
        c.studentName = name;
        c.recipientRoll = roll;
        c.roll_no = roll;
        c.rollNo = roll;
        c.eventName = event;
        c.event_name = event;
        c.awardType = certType;
        c.certificate_type = certType;
        c.qrHash = hash;
        c.qr_hash = hash;
        c.verificationHash = hash;
        c.issueDate = issue;
        c.issued_date = issue;
      });
    }

    data.auditLogs = data.audit_logs;
    data.auditLog = data.audit_logs;

    memoryDB = data;

    // Trigger async initialization from Supabase/Backend if not yet run
    if (!isDbInitialized) {
      initDB();
    }

    return memoryDB;
  } catch (err) {
    console.error("Error initializing in-memory database:", err);
    memoryDB = JSON.parse(JSON.stringify(INITIAL_SEED));
    return memoryDB;
  }
}

export function saveDB(data) {
  memoryDB = data;

  // Persist asynchronously to the backend / Supabase PostgreSQL
  if (typeof fetch !== 'undefined') {
    apiRequest('/api/db/sync', 'POST', {
      feedback: data.feedback,
      notifications: data.notifications,
      events: data.events,
      announcements: data.announcements,
      resources: data.resources,
      projects: data.projects,
      attendance: data.attendance
    }).catch(err => {
      console.warn("[SaveDB] Asynchronous sync notice:", err.message);
    });
  }

  // Backup cache in localStorage strictly for instantaneous offline resume
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }
  } catch (err) {
    // Ignore storage quota warnings
  }
}

export function resetDB() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem("campustech_pec_db_v2");
    localStorage.removeItem("campustech_pec_db_v1");
  }
  const clean = JSON.parse(JSON.stringify(INITIAL_SEED));
  memoryDB = clean;
  saveDB(clean);
  return clean;
}

export function logAudit(actor, action, target, details) {
  const db = getDB();
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
  const logEntry = {
    id: "log-" + Date.now(),
    timestamp,
    actor,
    user: actor,
    action,
    target,
    affected_record: target,
    details
  };
  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift(logEntry);
  db.auditLogs = db.audit_logs;
  db.auditLog = db.audit_logs;

  // Dispatch directly to the audit log API in backend/Supabase
  if (typeof fetch !== 'undefined') {
    apiRequest('/api/audit-logs', 'POST', {
      action,
      affected_record: target,
      details,
      actor
    }).catch(() => {});
  }

  return logEntry;
}

export async function initDB() {
  isDbInitialized = true;

  // Initialize Supabase browser client
  try {
    await initSupabaseClient();
  } catch (err) {
    console.warn("[InitDB] Supabase client init notice:", err);
  }

  // Fetch live synchronized database from the backend Express API backed by Supabase
  if (typeof fetch !== 'undefined') {
    try {
      const sessionToken = typeof localStorage !== 'undefined' ? localStorage.getItem("campustech_session_token") : null;
      const headers = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      const res = await fetch('/api/db', { headers });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.clubs && serverData.clubs.length >= 35) {
          const current = memoryDB || getDB();
          memoryDB = {
            ...current,
            ...serverData,
            // Retain local client preferences if any
            preferences: current.preferences || {}
          };
          // Update cache
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(DB_KEY, JSON.stringify(memoryDB));
            }
          } catch (e) {}
          console.log(`[InitDB] Synchronized ${memoryDB.clubs.length} clubs and ${memoryDB.events?.length || 0} events from Supabase backend.`);
        }
      }
    } catch (err) {
      console.warn("[InitDB] Backend fetch notice:", err.message);
    }
  }
  return getDB();
}

// REST API Dispatch Helpers for Real Database Mutations with RBAC Auth Context
export async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    
    // Check for session token: Supabase Auth Session token or secure session token
    let token = typeof localStorage !== 'undefined' ? localStorage.getItem("campustech_session_token") : null;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
        }
      } catch (e) {}
    }

    if (token) {
      opts.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(endpoint, opts);

    // Handle 401 Unauthorized: clear invalid session token
    if (res.status === 401 && token) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem("campustech_session_token");
        localStorage.removeItem("campustech_active_user_id");
      }
      if (typeof window !== 'undefined' && window.location.hash !== '#/login') {
        window.dispatchEvent(new CustomEvent("auth-changed", { detail: null }));
        window.location.hash = "#/login";
      }
    }

    const data = await res.json();
    if (data && typeof data === 'object') {
      data._httpStatus = res.status;
      if (!res.ok && data.success === undefined) {
        data.success = false;
      }
    }
    return data;
  } catch (err) {
    console.warn(`API call to ${endpoint} failed, falling back to local handler:`, err);
    return null;
  }
}

export { escapeHtml, sanitizeUrl } from "./utils.js";

