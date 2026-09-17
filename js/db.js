export const DB_KEY = "campustech_pec_db_v1";

export const INITIAL_SEED = {
  users: [
    {
      id: "std-101",
      name: "Aarav Sharma",
      rollNo: "22CS101",
      email: "aarav.sharma@apextech.edu",
      role: "Student",
      department: "CSE",
      year: "3rd Year",
      semester: "5th Semester",
      cgpa: "9.12",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      clubs: ["acm", "gdsc"],
      skills: ["Python", "PyTorch", "FastAPI", "Docker", "ROS"],
      badges: ["Hackathon Winner", "Open Source Contributor", "Dean's Honor Roll"],
      membershipId: "PEC-MEM-2026-CSE-8492",
      validUntil: "30 June 2027"
    },
    {
      id: "std-102",
      name: "Priya Patel",
      rollNo: "22CS142",
      email: "priya.patel@apextech.edu",
      role: "Club Admin",
      department: "CSE",
      year: "3rd Year",
      semester: "5th Semester",
      cgpa: "8.95",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      clubs: ["gdsc", "cyber"],
      adminForClub: "gdsc",
      skills: ["Kubernetes", "Golang", "TypeScript", "React"],
      badges: ["Club Lead", "Cloud Pioneer"],
      membershipId: "PEC-MEM-2026-CSE-5120",
      validUntil: "30 June 2027"
    },
    {
      id: "std-103",
      name: "Rohan Verma",
      rollNo: "21IT089",
      email: "rohan.v@apextech.edu",
      role: "Club Member",
      department: "IT",
      year: "4th Year",
      semester: "7th Semester",
      cgpa: "9.40",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      clubs: ["acm"],
      skills: ["Algorithms", "C++", "System Architecture"],
      badges: ["ICPC Finalist", "Competitive Coder"],
      membershipId: "PEC-MEM-2026-IT-3199",
      validUntil: "30 June 2026"
    },
    {
      id: "fac-201",
      name: "Dr. M. S. Swaminathan",
      facultyId: "FAC-CSE-001",
      email: "swaminathan@apextech.edu",
      role: "Super Admin",
      department: "CSE",
      year: "Faculty",
      semester: "Permanent",
      cgpa: "Ph.D.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      clubs: ["acm", "gdsc", "aiml"],
      skills: ["Academic Accreditation", "Distributed Systems", "Grant Review"],
      badges: ["Council President", "Distinguished Professor"],
      membershipId: "PEC-FAC-2026-CSE-001",
      validUntil: "Lifetime"
    },
    {
      id: "fac-202",
      name: "Prof. Ananya Iyer",
      facultyId: "FAC-AIDS-014",
      email: "ananya.iyer@apextech.edu",
      role: "Faculty Coordinator",
      department: "AIDS",
      year: "Faculty",
      semester: "Permanent",
      cgpa: "Ph.D.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      clubs: ["aiml"],
      skills: ["Deep Learning", "Computer Vision", "Research Ethics"],
      badges: ["Faculty Advisor", "IEEE Senior Member"],
      membershipId: "PEC-FAC-2026-AIDS-014",
      validUntil: "Lifetime"
    },
    {
      id: "admin-301",
      name: "Dr. Rajesh Raman",
      adminId: "DEPT-HOD-CSE",
      email: "hod.cse@apextech.edu",
      role: "Department Admin",
      department: "CSE",
      year: "HoD",
      semester: "Administrative",
      cgpa: "Ph.D.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      clubs: ["acm", "cyber"],
      skills: ["Curriculum Planning", "NBA / NAAC Audit", "Institutional Policy"],
      badges: ["Department Chair", "NAAC Lead Evaluator"],
      membershipId: "PEC-ADMIN-2026-CSE-100",
      validUntil: "Lifetime"
    }
  ],

  clubs: [
    {
      id: "acm",
      name: "ACM Student Chapter",
      shortName: "ACM PEC",
      domain: "Open Source & Systems",
      department: "CSE",
      memberCount: 340,
      activeStatus: "Active",
      description: "Premier student organization dedicated to competitive programming, systems research, and high-performance engineering.",
      banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      icon: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80",
      executiveTeam: [
        { name: "Rohan Verma", role: "Chairperson", year: "4th Year CSE", tenure: "2025-2026", email: "rohan.v@apextech.edu", status: "Approved" },
        { name: "Sneha Reddy", role: "Vice Chair", year: "3rd Year CSE", tenure: "2025-2026", email: "sneha.r@apextech.edu", status: "Approved" },
        { name: "Karthik Nair", role: "Technical Head", year: "3rd Year CSE", tenure: "2025-2026", email: "karthik.n@apextech.edu", status: "Approved" }
      ],
      facultyCoordinator: { name: "Dr. M. S. Swaminathan", email: "swaminathan@apextech.edu", phone: "+91 98401 23456" }
    },
    {
      id: "gdsc",
      name: "Google Developer Student Club",
      shortName: "GDSC PEC",
      domain: "Mobile & Cross-Platform",
      department: "IT",
      memberCount: 480,
      activeStatus: "Active",
      description: "Bridging the gap between theory and practical engineering through Android, Cloud, Flutter, and Google Developer Technologies.",
      banner: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      icon: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=100&auto=format&fit=crop&q=80",
      executiveTeam: [
        { name: "Priya Patel", role: "Club Lead", year: "3rd Year CSE", tenure: "2025-2026", email: "priya.p@apextech.edu", status: "Approved" },
        { name: "Aditya Mohan", role: "Cloud Lead", year: "3rd Year IT", tenure: "2025-2026", email: "aditya.m@apextech.edu", status: "Approved" }
      ],
      facultyCoordinator: { name: "Prof. S. Meenakshi", email: "s.meenakshi@apextech.edu", phone: "+91 94440 87654" }
    },
    {
      id: "aiml",
      name: "AI & Neural Networks Society",
      shortName: "AINN PEC",
      domain: "Artificial Intelligence & ML",
      department: "AIDS",
      memberCount: 420,
      activeStatus: "Active",
      description: "Pushing boundaries in Deep Learning, Computer Vision, Natural Language Processing, and Autonomous Robotic Systems.",
      banner: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
      icon: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=100&auto=format&fit=crop&q=80",
      executiveTeam: [
        { name: "Aarav Sharma", role: "Research Lead", year: "3rd Year CSE", tenure: "2025-2026", email: "aarav.sharma@apextech.edu", status: "Approved" },
        { name: "Divya Krishnan", role: "Student Coordinator", year: "3rd Year AIDS", tenure: "2025-2026", email: "divya.k@apextech.edu", status: "Approved" }
      ],
      facultyCoordinator: { name: "Prof. Ananya Iyer", email: "ananya.iyer@apextech.edu", phone: "+91 98840 55667" }
    },
    {
      id: "cyber",
      name: "Cyber Defense & White Hat Guild",
      shortName: "CyberSec PEC",
      domain: "Cybersecurity & Ethical Hacking",
      department: "CSE",
      memberCount: 215,
      activeStatus: "Active",
      description: "Ethical hacking, binary exploitation, penetration testing, cryptographic protocols, and collegiate CTF competitions.",
      banner: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
      icon: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80",
      executiveTeam: [
        { name: "Varun Teja", role: "CTF Captain", year: "4th Year CSE", tenure: "2025-2026", email: "varun.t@apextech.edu", status: "Approved" }
      ],
      facultyCoordinator: { name: "Prof. T. Balaji", email: "t.balaji@apextech.edu", phone: "+91 99620 11223" }
    },
    {
      id: "ieee",
      name: "IEEE Computer Society Chapter",
      shortName: "IEEE CS PEC",
      domain: "Robotics, IoT & Embedded Systems",
      department: "ECE",
      memberCount: 290,
      activeStatus: "Active",
      description: "Global technical networking, IoT edge telemetry, sensor microcontrollers, and hardware-software co-design workshops.",
      banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      icon: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80",
      executiveTeam: [
        { name: "Rahul Menon", role: "President", year: "4th Year ECE", tenure: "2025-2026", email: "rahul.m@apextech.edu", status: "Approved" }
      ],
      facultyCoordinator: { name: "Dr. V. Ganesh", email: "v.ganesh@apextech.edu", phone: "+91 98410 99887" }
    },
    {
      id: "web3",
      name: "Web3 & Distributed Ledger Lab",
      shortName: "Web3 PEC",
      domain: "Web3 & Blockchain",
      department: "IT",
      memberCount: 190,
      activeStatus: "Active",
      description: "Smart contract security, zero-knowledge proofs, decentralized storage, and consensus algorithm exploration.",
      banner: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
      icon: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=100&auto=format&fit=crop&q=80",
      executiveTeam: [
        { name: "Siddharth Rao", role: "Consensus Lead", year: "3rd Year IT", tenure: "2025-2026", email: "siddharth.r@apextech.edu", status: "Approved" }
      ],
      facultyCoordinator: { name: "Dr. P. Suresh", email: "p.suresh@apextech.edu", phone: "+91 98405 33445" }
    }
  ],

  events: [
    {
      id: "evt-101",
      title: "ApexHacks 2026: 36-Hour National Hackathon",
      category: "hackathon",
      clubId: "acm",
      date: "2026-10-18",
      time: "09:00 - 21:00",
      venue: "Central Convention Hall & Tech Park",
      capacity: 300,
      registeredCount: 285,
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      description: "The flagship annual innovation marathon uniting 80+ engineering institutions. Solve problem statements from industry leaders across AI, FinTech, and Green Computing.",
      tags: ["AI", "Cloud", "Grand Prizes ₹1,50,000", "Food Provided"],
      registrations: [
        {
          studentId: "std-101",
          studentName: "Aarav Sharma",
          rollNo: "22CS101",
          email: "aarav.sharma@apextech.edu",
          department: "CSE",
          ticketId: "TCK-APEX-042",
          registeredAt: "2026-09-10",
          checkedIn: false
        }
      ]
    },
    {
      id: "evt-102",
      title: "Kubernetes & Cloud Orchestration Bootcamp",
      category: "workshop",
      clubId: "gdsc",
      date: "2026-09-28",
      time: "10:00 - 16:30",
      venue: "Cloud Architecture Lab 302",
      capacity: 80,
      registeredCount: 80,
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80",
      description: "Deep-dive workshop on Docker containers, Kubernetes pods, deployments, horizontal pod autoscaling, and cloud-native observability with Prometheus.",
      tags: ["DevOps", "Containers", "Certified Lab Badge"],
      registrations: [
        {
          studentId: "std-101",
          studentName: "Aarav Sharma",
          rollNo: "22CS101",
          email: "aarav.sharma@apextech.edu",
          department: "CSE",
          ticketId: "TCK-K8S-018",
          registeredAt: "2026-09-08",
          checkedIn: true
        }
      ]
    },
    {
      id: "evt-103",
      title: "AlgoStrike 2026: ICPC-Style Speed Coding",
      category: "coding_contest",
      clubId: "acm",
      date: "2026-10-05",
      time: "14:00 - 18:00",
      venue: "Main Computer Center (Lab 1 & 2)",
      capacity: 150,
      registeredCount: 112,
      status: "Upcoming",
      banner: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80",
      description: "Fast-paced algorithmic battle testing dynamic programming, graph theory, number theory, and time complexity optimization.",
      tags: ["Competitive Programming", "Leaderboard", "Amazon Vouchers"],
      registrations: []
    },
    {
      id: "evt-104",
      title: "Autonomous Drone Navigation with Edge AI",
      category: "bootcamp",
      clubId: "aiml",
      date: "2026-09-02",
      time: "09:30 - 17:00",
      venue: "Robotics & Avionics Arena",
      capacity: 60,
      registeredCount: 60,
      status: "Completed",
      banner: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
      description: "Hands-on UAV control with ROS2, OpenCV object tracking, and Edge TPU visual telemetry in obstacle navigation courses.",
      tags: ["Robotics", "Computer Vision", "Hardware Kits"],
      registrations: [
        {
          studentId: "std-101",
          studentName: "Aarav Sharma",
          rollNo: "22CS101",
          email: "aarav.sharma@apextech.edu",
          department: "CSE",
          ticketId: "TCK-DRN-005",
          registeredAt: "2026-08-28",
          checkedIn: true
        }
      ]
    }
  ],

  certificates: [
    {
      id: "PEC-CERT-K8S-2026-104",
      studentId: "std-101",
      studentName: "Aarav Sharma",
      rollNo: "22CS101",
      department: "CSE",
      eventName: "Kubernetes in Production Masterclass",
      awardType: "Certificate of Merit & Excellence",
      issueDate: "2026-09-12",
      qrHash: "8f4a3c19e872d9b62a15c304f5b89a27d14e5903bcaef421975e810a43bc92fe"
    },
    {
      id: "PEC-CERT-HACK-2026-052",
      studentId: "std-101",
      studentName: "Aarav Sharma",
      rollNo: "22CS101",
      department: "CSE",
      eventName: "Smart India Hackathon Internal Ideathon",
      awardType: "First Runner Up - Track AI/Robotics",
      issueDate: "2026-08-25",
      qrHash: "3b2e7c91a04d58e2197c4f6820ab93cd74e12089f65cba23104e7689dcae9812"
    }
  ],

  projects: [
    {
      id: "proj-1",
      title: "AeroShield: Autonomous Edge-AI Wildfire Detection Drone",
      domain: "Robotics, IoT & Embedded Systems",
      department: "CSE",
      teamLeader: "Aarav Sharma",
      teamMembers: ["Aarav Sharma", "Priya Patel", "Devanand K"],
      description: "Lightweight thermal drone payload with NVIDIA Jetson Nano processing real-time aerial smoke & heat signatures with sub-2-second telemetry reporting.",
      github: "https://github.com/sairamsaladi004-netizen/aeroshield",
      demo: "https://aeroshield.demo.panimalar.edu",
      featured: true,
      facultyReview: {
        rating: 5,
        status: "Approved",
        remarks: "Exceptional edge computing optimization and mechanical gimbal design.",
        reviewer: "Prof. Ananya Iyer",
        reviewedAt: "2026-09-11"
      }
    },
    {
      id: "proj-2",
      title: "MedLedger: Zero-Knowledge Decentralized Electronic Health Records",
      domain: "Web3 & Blockchain",
      department: "IT",
      teamLeader: "Priya Patel",
      teamMembers: ["Priya Patel", "Siddharth Rao"],
      description: "HIPAA-compliant patient record access exchange utilizing Polygon zkEVM rollups for zero-knowledge patient consent authorization.",
      github: "https://github.com/sairamsaladi004-netizen/medledger",
      demo: "https://medledger.demo.panimalar.edu",
      featured: true,
      facultyReview: {
        rating: 4,
        status: "Approved",
        remarks: "Solid zk-SNARK circuit implementation; recommend gas optimization on storage layout.",
        reviewer: "Dr. P. Suresh",
        reviewedAt: "2026-09-08"
      }
    },
    {
      id: "proj-3",
      title: "SentinAI: Threat Intelligence & Vulnerability Graph Visualizer",
      domain: "Cybersecurity & Ethical Hacking",
      department: "CSE",
      teamLeader: "Varun Teja",
      teamMembers: ["Varun Teja", "Sneha Reddy"],
      description: "Automated network surface analyzer ingesting CVE feeds and generating real-time Neo4j attack graph visualizations.",
      github: "https://github.com/sairamsaladi004-netizen/sentin-ai",
      demo: "https://sentinai.demo.panimalar.edu",
      featured: false,
      facultyReview: {
        rating: 4,
        status: "Approved",
        remarks: "Clean graph model representation and intuitive dashboard.",
        reviewer: "Prof. T. Balaji",
        reviewedAt: "2026-09-05"
      }
    }
  ],

  lmsResources: [
    {
      id: "lms-1",
      title: "Modern Docker & Kubernetes for Fullstack Engineers",
      domain: "Cloud Computing & DevOps",
      difficulty: "Intermediate",
      category: "Lab Guide",
      targetSemester: "5th Semester",
      clubId: "gdsc",
      author: "Priya Patel",
      dateAdded: "2026-09-01",
      description: "Hands-on walkthrough for multi-stage Dockerfiles, Helm charts, ingress controllers, and local Minikube cluster setup.",
      link: "https://github.com/sairamsaladi004-netizen/k8s-handbook",
      readTime: "45 mins lab",
      bookmarks: 142,
      completions: 89
    },
    {
      id: "lms-2",
      title: "Computer Vision with YOLOv10 & PyTorch from Scratch",
      domain: "Artificial Intelligence & ML",
      difficulty: "Advanced",
      category: "Code Notebook",
      targetSemester: "6th Semester",
      clubId: "aiml",
      author: "Prof. Ananya Iyer",
      dateAdded: "2026-08-20",
      description: "Complete training pipeline for custom object detection datasets, tensorboard metrics, and ONNX runtime export.",
      link: "https://colab.research.google.com",
      readTime: "60 mins lab",
      bookmarks: 230,
      completions: 164
    },
    {
      id: "lms-3",
      title: "Smart Contract Auditing & Solidity Reentrancy Exploits",
      domain: "Web3 & Blockchain",
      difficulty: "Advanced",
      category: "Security Guide",
      targetSemester: "7th Semester",
      clubId: "web3",
      author: "Dr. P. Suresh",
      dateAdded: "2026-08-15",
      description: "Practical breakdown of the DAO hack, flash loan attacks, Slither static analysis, and Foundry fuzzing.",
      link: "https://book.getfoundry.sh",
      readTime: "50 mins lab",
      bookmarks: 98,
      completions: 45
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
    },
    {
      id: "rm-cyber",
      title: "Offensive Security & Penetration Testing",
      domain: "Cybersecurity & Ethical Hacking",
      description: "Network reconnaissance, web application security (OWASP Top 10), and binary exploitation.",
      nodes: [
        { id: "sec-1", title: "TCP/IP Protocol Stack & Wireshark Analysis", level: "Beginner", completed: true },
        { id: "sec-2", title: "OWASP Top 10 Web Security & Burp Suite", level: "Beginner", completed: true },
        { id: "sec-3", title: "Active Directory Exploitation & Kerberoasting", level: "Intermediate", completed: false },
        { id: "sec-4", title: "x86/x64 Buffer Overflow & ROP Chains", level: "Advanced", completed: false }
      ]
    },
    {
      id: "rm-web",
      title: "Modern Full Stack Web Architecture",
      domain: "Web Development",
      description: "From TypeScript and Next.js reactive frontends to distributed GraphQL, PostgreSQL, and Redis cache clusters.",
      nodes: [
        { id: "w-1", title: "TypeScript & Modern ECMAScript Essentials", level: "Beginner", completed: true },
        { id: "w-2", title: "React & Next.js Server Components", level: "Intermediate", completed: true },
        { id: "w-3", title: "PostgreSQL & Prisma ORM Data Modeling", level: "Intermediate", completed: false },
        { id: "w-4", title: "Micro-frontends & Edge CDN Caching", level: "Advanced", completed: false }
      ]
    },
    {
      id: "rm-mobile",
      title: "Cross-Platform Mobile Engineering (Flutter & Android)",
      domain: "Mobile Development",
      description: "Building production Flutter, Dart, Kotlin Jetpack Compose apps with native device integrations and offline syncing.",
      nodes: [
        { id: "m-1", title: "Dart Language & Flutter Widget Tree", level: "Beginner", completed: true },
        { id: "m-2", title: "State Management with Riverpod & BLoC", level: "Intermediate", completed: false },
        { id: "m-3", title: "Native Platform Channels & Bluetooth Low Energy", level: "Advanced", completed: false }
      ]
    }
  ],

  tools: [
    {
      id: "tool-1",
      name: "Docker Desktop",
      platform: "Mac / Windows / Linux",
      category: "DevOps & Cloud",
      purpose: "Enterprise-grade local container runtime for rapid containerization, testing, and multi-service Docker Compose workflows.",
      tags: ["Containers", "DevOps", "Virtualization"],
      url: "https://www.docker.com"
    },
    {
      id: "tool-2",
      name: "Postman API Platform",
      platform: "Web / Desktop",
      category: "Development",
      purpose: "Design, mock, debug, and automate REST, GraphQL, and WebSocket API requests with automated collection runners.",
      tags: ["API", "Testing", "Backend"],
      url: "https://www.postman.com"
    },
    {
      id: "tool-3",
      name: "PyTorch Framework",
      platform: "Python / C++",
      category: "AI & Data Science",
      purpose: "Open source machine learning framework that accelerates the path from research prototyping to production deployment.",
      tags: ["Machine Learning", "Tensors", "Deep Learning"],
      url: "https://pytorch.org"
    },
    {
      id: "tool-4",
      name: "Wireshark Packet Analyzer",
      platform: "Desktop",
      category: "Cybersecurity",
      purpose: "World's foremost network protocol analyzer for packet inspection, TLS handshake diagnostics, and threat hunting.",
      tags: ["Networking", "Security", "Packet Capture"],
      url: "https://www.wireshark.org"
    },
    {
      id: "tool-5",
      name: "GitHub CLI (gh)",
      platform: "Terminal CLI",
      category: "Open Source",
      purpose: "Take GitHub to your command line. Create pull requests, manage issues, and trigger GitHub Actions without leaving your terminal.",
      tags: ["Git", "Terminal", "Productivity"],
      url: "https://cli.github.com"
    },
    {
      id: "tool-6",
      name: "Foundry Ethereum Toolkit",
      platform: "CLI / Rust",
      category: "Web3 & Blockchain",
      purpose: "Blazing fast, portable and modular toolkit for Ethereum application development written in Rust.",
      tags: ["Solidity", "Smart Contracts", "EVM"],
      url: "https://getfoundry.sh"
    }
  ],

  gallery: [
    {
      id: "gal-1",
      clubId: "acm",
      title: "ApexHacks 2025 Grand Finale",
      description: "Over 250 students spent 36 continuous hours architecting AI and blockchain prototypes in the Central Convention Hall.",
      coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
      date: "October 2025"
    },
    {
      id: "gal-2",
      clubId: "gdsc",
      title: "Google Cloud Community Day",
      description: "Keynotes from Google Developer Experts on distributed generative AI architectures and BigQuery telemetry.",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      date: "November 2025"
    },
    {
      id: "gal-3",
      clubId: "aiml",
      title: "Autonomous Robotics Arena Showcase",
      description: "Live demonstrations of student-built edge AI drones and LiDAR autonomous rovers navigating obstacle tracks.",
      coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
      date: "January 2026"
    }
  ],

  announcements: [
    {
      id: "ann-1",
      title: "Central Council Nominations for Executive Posts Open (2026-2027)",
      content: "All eligible 3rd and 4th-year student members may submit nominations for Council Secretary, Technical Head, and Club President roles. Submission deadline: October 15, 2026.",
      priority: "critical",
      date: "September 15, 2026",
      pinned: true,
      author: "Central Technical Council Secretariat",
      department: "All Engineering Departments"
    },
    {
      id: "ann-2",
      title: "ApexHacks 2026 Problem Statements Released",
      content: "Official industry problem statements from Intel, Cisco, and Google Cloud are now live in the Events portal. Teams must lock in their project abstract before October 1st.",
      priority: "important",
      date: "September 12, 2026",
      pinned: false,
      author: "ACM Student Chapter",
      department: "CSE"
    },
    {
      id: "ann-3",
      title: "Accredited QR Certificate Digital Verification Live",
      content: "All certificates issued for campus hackathons and technical symposiums are now verifiable via our tamper-proof SHA-256 digital signature registry.",
      priority: "normal",
      date: "September 08, 2026",
      pinned: false,
      author: "Office of Dean (Student Affairs)",
      department: "Institutional"
    }
  ],

  auditLogs: [
    { id: "log-1", timestamp: "2026-09-16 10:14:02", actor: "Dr. M. S. Swaminathan (Super Admin)", action: "Approved Event", target: "ApexHacks 2026", details: "Cleared institutional clearance and allocated Convention Hall." },
    { id: "log-2", timestamp: "2026-09-15 14:20:45", actor: "Priya Patel (Club Admin)", action: "Published LMS Resource", target: "Modern Docker & Kubernetes", details: "Domain: Cloud Computing & DevOps" },
    { id: "log-3", timestamp: "2026-09-14 09:30:12", actor: "Dr. M. S. Swaminathan (Super Admin)", action: "Updated Role", target: "Priya Patel", details: "Assigned Club Admin role for GDSC." },
    { id: "log-4", timestamp: "2026-09-12 16:45:00", actor: "System Engine", action: "Generated Certificate", target: "Aarav Sharma (PEC-CERT-K8S-2026-104)", details: "Attendance & 5-star feedback verified." },
    { id: "log-5", timestamp: "2026-09-10 18:22:15", actor: "Aarav Sharma (Student)", action: "Submitted Project", target: "AeroShield AI Drone", details: "Uploaded GitHub repo & video demo URL." }
  ],

  notifications: [
    { id: "notif-1", userId: "std-101", title: "Certificate Ready for Download", message: "Your accredited certificate for 'Kubernetes in Production' is now available in your Student Profile.", category: "Certificates", time: "2 hours ago", read: false, link: "#/student-profile" },
    { id: "notif-2", userId: "std-101", title: "ApexHacks 2026 Registration Confirmed", message: "Your ticket #TCK-APEX-042 is verified. Check-in starts at 08:30 AM at the Central Auditorium.", category: "Events", time: "Yesterday", read: false, link: "#/events" },
    { id: "notif-3", userId: "all", title: "Executive Board Nominations Open", message: "Submit your nomination for technical club executive posts before October 15.", category: "Announcements", time: "2 days ago", read: true, link: "#/announcements" }
  ]
};

// Database Access & Persistence Layer
export function getDB() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(DB_KEY) : null;
    if (!raw) {
      saveDB(INITIAL_SEED);
      return JSON.parse(JSON.stringify(INITIAL_SEED));
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database from localStorage:", err);
    return JSON.parse(JSON.stringify(INITIAL_SEED));
  }
}

export function saveDB(data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }
  } catch (err) {
    console.error("Error saving database to localStorage:", err);
  }
}

export function resetDB() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(DB_KEY);
  }
  saveDB(INITIAL_SEED);
  return JSON.parse(JSON.stringify(INITIAL_SEED));
}

export function logAudit(actor, action, target, details) {
  const db = getDB();
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
  const logEntry = {
    id: "log-" + Date.now(),
    timestamp,
    actor,
    action,
    target,
    details
  };
  db.auditLogs.unshift(logEntry);
  saveDB(db);
}

export function initDB() {
  return getDB();
}
