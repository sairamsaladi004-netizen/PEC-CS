export const INITIAL_RESOURCES = [
  {
    id: "res-101",
    title: "Deep Learning Architectures & Transformer Attention Mechanism Guide",
    type: "Study Material",
    category: "Study Material",
    club_id: "I4-08",
    clubId: "I4-08",
    club_name: "AI&ML Turing Club [Industry 4.0]",
    subject: "Deep Learning & PyTorch",
    author: "Mrs. L. Yamuna (Faculty Coordinator)",
    added_date: "2026-09-10",
    downloads: 342,
    likes: 89,
    rating: 4.9,
    file_format: "PDF",
    file_size: "5.4 MB",
    file_url: "https://pragati.ac.in/resources/aiml/Transformer_Attention_Guide_2026.pdf",
    description: "Comprehensive 45-page official reference manual detailing Multi-Head Self-Attention, Positional Encodings, FlashAttention optimization, and step-by-step PyTorch implementations.",
    difficulty: "Intermediate",
    tags: ["PyTorch", "Transformers", "Self-Attention", "Deep Learning", "LLMs"],
    content: `# Deep Learning Architectures & Attention Mechanism
Author: Mrs. L. Yamuna | AI&ML Turing Club

## 1. Multi-Head Self-Attention Equation
Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V

## 2. Key Takeaways
- **Query (Q)**: Vector representation of current token asking for context.
- **Key (K)**: Vectors of all candidate tokens being evaluated.
- **Value (V)**: Content vectors scaled by computed attention weights.

## 3. PyTorch Code Snippet
\`\`\`python
import torch
import torch.nn as nn

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, n_heads=8):
        super().__init__()
        self.mha = nn.MultiheadAttention(embed_dim=d_model, num_heads=n_heads)
    
    def forward(self, query, key, value):
        attn_output, attn_weights = self.mha(query, key, value)
        return attn_output
\`\`\``,
    questions: []
  },
  {
    id: "res-102",
    title: "PyTorch & Computer Vision Problem Set (15 Hard Benchmarks)",
    type: "Problem Set",
    category: "Problem Set",
    club_id: "I4-08",
    clubId: "I4-08",
    club_name: "AI&ML Turing Club [Industry 4.0]",
    subject: "Computer Vision & CNNs",
    author: "Priya Patel (Student President)",
    added_date: "2026-09-12",
    downloads: 280,
    likes: 67,
    rating: 4.8,
    file_format: "JUPYTER",
    file_size: "2.1 MB",
    file_url: "https://pragati.ac.in/resources/aiml/CV_PyTorch_ProblemSet_2026.ipynb",
    description: "Hands-on Jupyter notebook problem set covering custom ResNet implementations, YOLOv8 object detection loss derivation, image segmentation metric calculation (mIoU), and data augmentation pipelines.",
    difficulty: "Advanced",
    tags: ["Computer Vision", "PyTorch", "CNNs", "YOLO", "Problem Set"],
    content: `# Computer Vision Problem Set
1. Implement a custom ResNet-18 residual block with shortcut connections.
2. Calculate Mean Intersection over Union (mIoU) for multi-class semantic segmentation.
3. Optimize a transfer learning pipeline for medical X-ray classification.`,
    questions: [
      {
        id: "q1",
        question: "In ResNet architectures, what is the primary mathematical purpose of residual skip connections?",
        options: [
          "To reduce memory usage during forward propagation",
          "To prevent vanishing gradient problems during backpropagation across deep layers",
          "To force weight matrices to be strictly sparse",
          "To speed up softmax activation calculations"
        ],
        correctAnswer: 1,
        explanation: "Skip connections allow gradients to flow directly through identity shortcuts, mitigating vanishing gradients in very deep networks."
      },
      {
        id: "q2",
        question: "Which metric is most appropriate for evaluating bounding box overlap in object detection models like YOLO?",
        options: ["Mean Absolute Error (MAE)", "Intersection over Union (IoU)", "Cosine Similarity", "Cross-Entropy Loss"],
        correctAnswer: 1,
        explanation: "IoU measures the area of overlap divided by the area of union between predicted and ground truth bounding boxes."
      }
    ]
  },
  {
    id: "res-103",
    title: "AI&ML Foundation Quiz Template (Turing Club Screening)",
    type: "Quiz Template",
    category: "Quiz Template",
    club_id: "I4-08",
    clubId: "I4-08",
    club_name: "AI&ML Turing Club [Industry 4.0]",
    subject: "Machine Learning Foundations",
    author: "Aarav Sharma (Core Lead)",
    added_date: "2026-09-14",
    downloads: 410,
    likes: 112,
    rating: 5.0,
    file_format: "JSON / Interactive",
    file_size: "1.2 MB",
    file_url: "#",
    description: "Standardized 10-question diagnostic quiz template used for AI&ML club member screening, covering bias-variance tradeoff, gradient descent variants, regularization (L1/L2), and evaluation metrics.",
    difficulty: "Beginner",
    tags: ["Machine Learning", "Quiz Template", "Gradient Descent", "L1/L2"],
    content: "Interactive quiz template designed for automated evaluation of machine learning fundamentals.",
    questions: [
      {
        id: "q101",
        question: "What happens to a decision tree model when its maximum depth is allowed to grow without limit on a noisy dataset?",
        options: [
          "High bias and underfitting",
          "High variance and overfitting",
          "Zero training error and high generalization capability",
          "Constant cross-validation error"
        ],
        correctAnswer: 1,
        explanation: "An unconstrained decision tree creates leaf nodes for every data point including noise, leading to high variance and severe overfitting."
      },
      {
        id: "q102",
        question: "Which optimizer combines momentum with adaptive learning rates per parameter?",
        options: ["SGD", "AdaGrad", "Adam (Adaptive Moment Estimation)", "RMSprop"],
        correctAnswer: 2,
        explanation: "Adam calculates exponentially decaying averages of past squared gradients (like RMSprop) and past gradients (like Momentum)."
      }
    ]
  },
  {
    id: "res-104",
    title: "Ethical Hacking & Web Penetration Testing Field Manual",
    type: "Study Material",
    category: "Study Material",
    club_id: "I4-06",
    clubId: "I4-06",
    club_name: "Cyber Security Guild [Industry 4.0]",
    subject: "Cyber Security & Offensive Defense",
    author: "Mrs. K Sireesha (Faculty Coordinator)",
    added_date: "2026-09-08",
    downloads: 315,
    likes: 95,
    rating: 4.9,
    file_format: "PDF",
    file_size: "6.8 MB",
    file_url: "https://pragati.ac.in/resources/cyber/Web_Penetration_Testing_Manual_2026.pdf",
    description: "Comprehensive operational handbook detailing OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, SSRF, IDOR), Burp Suite Pro workflows, payload crafting, and security hardening guidelines.",
    difficulty: "Intermediate",
    tags: ["Cyber Security", "OWASP", "Penetration Testing", "Burp Suite", "CTF"],
    content: `# OWASP Top 10 Web Vulnerabilities
1. **A01: Broken Access Control**: Inadequate authorization checks on IDOR endpoints.
2. **A02: Cryptographic Failures**: Weak hash algorithms or hardcoded private keys.
3. **A03: Injection (SQLi/Command Injection)**: Unsanitized user inputs passed to system interpreters.`,
    questions: []
  },
  {
    id: "res-105",
    title: "Network Security & Cryptography Problem Set",
    type: "Problem Set",
    category: "Problem Set",
    club_id: "I4-06",
    clubId: "I4-06",
    club_name: "Cyber Security Guild [Industry 4.0]",
    subject: "Cryptography & Wireshark",
    author: "Cyber Guild Technical Core",
    added_date: "2026-09-11",
    downloads: 210,
    likes: 54,
    rating: 4.7,
    file_format: "ZIP / PCAP",
    file_size: "14.2 MB",
    file_url: "https://pragati.ac.in/resources/cyber/Wireshark_Crypto_Lab.zip",
    description: "Real-world network packet capture analysis problems. Includes 5 PCAP capture files requiring Wireshark inspection to reconstruct decrypted TLS handshakes, extract suspicious payloads, and identify MITM attacks.",
    difficulty: "Advanced",
    tags: ["Wireshark", "Cryptography", "PCAP", "Network Analysis", "Problem Set"],
    content: "Includes 5 capture challenges (.pcap) and answer key for Wireshark traffic breakdown.",
    questions: [
      {
        id: "cq1",
        question: "In an RSA encryption scheme, if p=61 and q=53, what is the value of Euler's totient function phi(n)?",
        options: ["3233", "3120", "3000", "3180"],
        correctAnswer: 1,
        explanation: "phi(n) = (p-1)*(q-1) = 60 * 52 = 3120."
      }
    ]
  },
  {
    id: "res-106",
    title: "ROS 2 Kinematics & Autonomous Robotics Handbook",
    type: "Study Material",
    category: "Study Material",
    club_id: "I4-03",
    clubId: "I4-03",
    club_name: "Robotics & Automation Club [Industry 4.0]",
    subject: "Robotics & ROS 2",
    author: "Mr. V.V.N. Sarath (Faculty Coordinator)",
    added_date: "2026-09-05",
    downloads: 198,
    likes: 42,
    rating: 4.8,
    file_format: "PDF",
    file_size: "8.1 MB",
    file_url: "https://pragati.ac.in/resources/robotics/ROS2_Humble_Kinematics.pdf",
    description: "Guide to ROS 2 Humble installation, URDF robot description files, Gazebo physics simulation setup, forward/inverse kinematics, and Nav2 autonomous mobile robot navigation stack.",
    difficulty: "Intermediate",
    tags: ["ROS 2", "Robotics", "URDF", "Kinematics", "Gazebo"],
    content: "ROS 2 Humble setup, URDF creation, TF2 transform trees, and differential drive robot control loops.",
    questions: []
  },
  {
    id: "res-107",
    title: "Docker, Kubernetes & Microservices Architecture Problem Set",
    type: "Problem Set",
    category: "Problem Set",
    club_id: "I4-07",
    clubId: "I4-07",
    club_name: "Cloud Computing & DevOps Guild",
    subject: "Cloud & Containerization",
    author: "Cloud Guild Admin Team",
    added_date: "2026-09-09",
    downloads: 260,
    likes: 71,
    rating: 4.9,
    file_format: "ZIP / YAML",
    file_size: "3.5 MB",
    file_url: "https://pragati.ac.in/resources/cloud/K8s_Microservices_Lab.zip",
    description: "Practical scenarios requiring students to write multi-stage Dockerfiles, configure Kubernetes StatefulSets, construct ingress rules with TLS cert-manager, and build Helm charts.",
    difficulty: "Advanced",
    tags: ["Kubernetes", "Docker", "DevOps", "Helm", "Cloud"],
    content: "10 Production container deployment challenges with evaluation test scripts.",
    questions: []
  },
  {
    id: "res-108",
    title: "IoT LoRaWAN Smart Campus Hardware Schematics & ESP32 Code",
    type: "Study Material",
    category: "Study Material",
    club_id: "I4-09",
    clubId: "I4-09",
    club_name: "IoT & Smart Systems Lab [Industry 4.0]",
    subject: "Embedded IoT & Wireless",
    author: "Mr. G. Durga Prasad (Faculty Coordinator)",
    added_date: "2026-09-07",
    downloads: 230,
    likes: 60,
    rating: 4.7,
    file_format: "ZIP / C++",
    file_size: "4.8 MB",
    file_url: "https://pragati.ac.in/resources/iot/LoRaWAN_ESP32_Schematics.zip",
    description: "Wiring diagrams, Eagle CAD schematics, and C++ Arduino code for ESP32 sensors communicating with The Things Network (TTN) via LoRa gateways.",
    difficulty: "Intermediate",
    tags: ["IoT", "ESP32", "LoRaWAN", "Embedded Systems", "Hardware"],
    content: "Hardware pinouts, low-power sleep modes, and MQTT payload parsing scripts.",
    questions: []
  },
  {
    id: "res-109",
    title: "Competitive Programming & Data Structures Blueprint (C++ STL & Java)",
    type: "Problem Set",
    category: "Problem Set",
    club_id: "CC-05",
    clubId: "CC-05",
    club_name: "Coding Ninjas & Algo Society",
    subject: "Algorithms & DS",
    author: "Algorithmic Club Council",
    added_date: "2026-09-03",
    downloads: 512,
    likes: 145,
    rating: 5.0,
    file_format: "PDF / C++",
    file_size: "3.2 MB",
    file_url: "https://pragati.ac.in/resources/algo/CP_DSA_Blueprint_2026.pdf",
    description: "Curated 50 LeetCode / Codeforces pattern problems with optimal O(N log N) solutions in C++20 and Java 21. Covers Segment Trees, Disjoint Set Union (DSU), Dynamic Programming, and Graph Shortest Paths.",
    difficulty: "Advanced",
    tags: ["Competitive Programming", "C++", "DSA", "Segment Trees", "DP"],
    content: "50 Standardized algorithmic challenges with solution templates and time complexity breakdowns.",
    questions: []
  },
  {
    id: "res-110",
    title: "Unity 3D & WebXR Spatial Computing Starter Kit",
    type: "Study Material",
    category: "Study Material",
    club_id: "I4-04",
    clubId: "I4-04",
    club_name: "AR/VR & Spatial Computing Lab",
    subject: "AR/VR & Unity",
    author: "Mr. A. Avinash (Faculty Coordinator)",
    added_date: "2026-09-06",
    downloads: 175,
    likes: 38,
    rating: 4.6,
    file_format: "UNITYPACKAGE",
    file_size: "45.0 MB",
    file_url: "https://pragati.ac.in/resources/arvr/Unity_Spatial_StarterKit.unitypackage",
    description: "Starter template package for Unity 2022.3 LTS featuring WebXR interactions, hand tracking controllers, lighting setups, and spatial audio scripts.",
    difficulty: "Beginner",
    tags: ["AR/VR", "Unity3D", "Spatial Computing", "WebXR"],
    content: "Pre-built Unity VR interaction rigs, custom shaders, and cross-platform build settings.",
    questions: []
  }
];
