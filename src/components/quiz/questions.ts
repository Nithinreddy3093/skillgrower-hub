
import { QuestionCategory, QuestionDifficulty, QuizQuestion } from "./types";

export const quizQuestions: QuizQuestion[] = [
  // Easy questions
  {
    id: "e1",
    question: "What is an API in the context of AI integration?",
    options: [
      "A programming language specifically for AI",
      "An interface that allows applications to interact with AI services",
      "A hardware component for AI processing",
      "A database of AI models"
    ],
    correctAnswer: 1,
    category: "APIs & SDKs",
    difficulty: "easy",
    explanation: "API (Application Programming Interface) is an interface that allows your application to interact with AI services and models without needing to understand their internal implementation."
  },
  {
    id: "e2",
    question: "Which of the following is NOT a common AI model deployment approach?",
    options: [
      "Cloud-based API",
      "On-device inference",
      "Physical AI chips",
      "Embedded quantum computing"
    ],
    correctAnswer: 3,
    category: "AI Integration Basics",
    difficulty: "easy",
    explanation: "While cloud-based APIs, on-device inference, and specialized AI chips are common deployment methods, embedded quantum computing is not yet a mainstream approach for AI model deployment."
  },
  {
    id: "e3",
    question: "What is the primary purpose of data preprocessing in AI systems?",
    options: [
      "To encrypt the data for security",
      "To make data suitable for AI model consumption",
      "To reduce storage costs",
      "To comply with data protection regulations"
    ],
    correctAnswer: 1,
    category: "Data Preprocessing",
    difficulty: "easy",
    explanation: "Data preprocessing transforms and cleans raw data into a format that AI models can effectively use for training or inference."
  },
  {
    id: "e4",
    question: "In computer science, what does the acronym 'OOP' stand for?",
    options: [
      "Order of Operations Processing",
      "Object-Oriented Programming",
      "Online Operating Protocol",
      "Optimal Output Procedure"
    ],
    correctAnswer: 1,
    category: "Computer Science",
    difficulty: "easy",
    explanation: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects', which can contain data and code that manipulates that data."
  },
  {
    id: "e5",
    question: "Which cybersecurity practice involves using multiple authentication methods to access a system?",
    options: [
      "Encryption",
      "Firewall configuration",
      "Multi-factor authentication (MFA)",
      "Intrusion detection"
    ],
    correctAnswer: 2,
    category: "Cybersecurity",
    difficulty: "easy",
    explanation: "Multi-factor authentication (MFA) requires users to provide two or more verification factors to gain access, significantly enhancing security beyond just passwords."
  },
  
  // Intermediate questions
  {
    id: "i1",
    question: "Which technique is used to integrate AI models in web applications with limited client-side resources?",
    options: [
      "Running the entire model in the browser",
      "API calls to cloud-based AI services",
      "Edge computing with WebAssembly",
      "Both B and C are valid approaches"
    ],
    correctAnswer: 3,
    category: "AI in Frontend/Backend",
    difficulty: "intermediate",
    explanation: "For web applications with limited client resources, both API calls to cloud services and edge computing with WebAssembly are valid approaches, depending on the specific requirements."
  },
  {
    id: "i2",
    question: "What is a webhook in the context of AI service integration?",
    options: [
      "A UI component that displays AI results",
      "A callback URL that receives notifications when AI processing completes",
      "A tool for testing AI endpoints",
      "A security protocol for AI APIs"
    ],
    correctAnswer: 1,
    category: "APIs & SDKs",
    difficulty: "intermediate",
    explanation: "Webhooks are callback URLs that AI services can call to notify your application when asynchronous processing is complete, enabling efficient handling of time-consuming AI tasks."
  },
  {
    id: "i3",
    question: "Which ethical consideration is MOST important when integrating AI that processes user data?",
    options: [
      "Making the AI as accurate as possible",
      "Ensuring the application runs efficiently",
      "Obtaining proper consent and being transparent about data usage",
      "Using the latest AI models"
    ],
    correctAnswer: 2,
    category: "Ethics in AI",
    difficulty: "intermediate",
    explanation: "Obtaining informed consent and transparently communicating how user data will be used by AI systems is a fundamental ethical requirement when handling personal data."
  },
  {
    id: "i4",
    question: "In cloud computing, what does 'IaaS' stand for?",
    options: [
      "Internet as a Service",
      "Infrastructure as a Service",
      "Integration as a Service",
      "Intelligence as a Service"
    ],
    correctAnswer: 1,
    category: "Cloud Computing",
    difficulty: "intermediate",
    explanation: "Infrastructure as a Service (IaaS) is a cloud computing offering that provides virtualized computing resources over the internet, allowing organizations to rent servers, storage, networks, and operating systems on a pay-as-you-go basis."
  },
  {
    id: "i5",
    question: "What is the purpose of normalization in database design?",
    options: [
      "To encrypt sensitive data",
      "To minimize data redundancy and dependency",
      "To speed up query processing",
      "To reduce the number of tables"
    ],
    correctAnswer: 1,
    category: "Data Science",
    difficulty: "intermediate",
    explanation: "Normalization in database design is the process of organizing data to minimize redundancy and dependency by dividing larger tables into smaller ones and defining relationships between them."
  },
  {
    id: "i6",
    question: "Which software development methodology emphasizes adaptive planning and evolutionary development?",
    options: [
      "Waterfall",
      "Agile",
      "V-Model",
      "Big Bang"
    ],
    correctAnswer: 1,
    category: "Engineering",
    difficulty: "intermediate",
    explanation: "Agile methodology emphasizes adaptive planning, evolutionary development, early delivery, and continual improvement, encouraging rapid and flexible response to change."
  },
  
  // Advanced questions
  {
    id: "a1",
    question: "In a production environment, what's the best approach for handling AI model versioning?",
    options: [
      "Always use the latest version automatically",
      "Implement a shadow deployment strategy with gradual rollout",
      "Let users choose which model version to use",
      "Keep using the same version indefinitely for consistency"
    ],
    correctAnswer: 1,
    category: "AI Integration Basics",
    difficulty: "advanced",
    explanation: "Shadow deployment allows testing a new model version alongside the current one, comparing results before gradually rolling it out to users, which helps ensure service quality and reliability."
  },
  {
    id: "a2",
    question: "Which technique helps reduce latency when integrating AI models into real-time applications?",
    options: [
      "Using synchronous API calls for all requests",
      "Batching requests and implementing request queuing",
      "Generating results ahead of time for all possible inputs",
      "Reducing the UI complexity"
    ],
    correctAnswer: 1,
    category: "AI in Frontend/Backend",
    difficulty: "advanced",
    explanation: "Batching multiple requests together and implementing request queuing can significantly reduce latency overhead in real-time AI applications by optimizing resource usage and network calls."
  },
  {
    id: "a3",
    question: "Which approach is recommended for handling bias in AI systems during integration?",
    options: [
      "Use only data from trusted sources",
      "Implement continuous monitoring and regular bias audits",
      "Rely on the AI provider to handle all bias issues",
      "Focus only on technical performance metrics"
    ],
    correctAnswer: 1,
    category: "Ethics in AI",
    difficulty: "advanced",
    explanation: "Continuous monitoring and regular bias audits are essential for detecting, addressing, and mitigating bias in AI systems over time, as biases can emerge in unexpected ways even with trusted data sources."
  },
  {
    id: "a4",
    question: "Which data preprocessing technique is most effective for handling imbalanced datasets in AI training?",
    options: [
      "Normalization",
      "Feature engineering",
      "Resampling techniques (oversampling/undersampling)",
      "Data augmentation"
    ],
    correctAnswer: 2,
    category: "Data Preprocessing",
    difficulty: "advanced",
    explanation: "Resampling techniques like oversampling minority classes or undersampling majority classes help address the imbalance issue directly, improving model training on skewed datasets."
  },
  {
    id: "a5",
    question: "In web development, which of the following is a key advantage of server-side rendering (SSR) over client-side rendering?",
    options: [
      "Reduced server load",
      "Better SEO performance",
      "Simpler codebase maintenance",
      "Faster updates to the UI"
    ],
    correctAnswer: 1,
    category: "Web Development",
    difficulty: "advanced",
    explanation: "Server-side rendering (SSR) provides better SEO performance because search engine crawlers can directly access the fully rendered content, unlike client-side rendering where JavaScript must execute first."
  },
  {
    id: "a6",
    question: "Which cryptographic attack attempts to find collisions in hash functions?",
    options: [
      "Rainbow table attack",
      "Man-in-the-middle attack",
      "Birthday attack",
      "Dictionary attack"
    ],
    correctAnswer: 2,
    category: "Cybersecurity",
    difficulty: "advanced",
    explanation: "The birthday attack is a cryptographic technique that exploits the mathematics behind the birthday paradox to find collisions in hash functions with significantly fewer attempts than a brute force approach."
  },
  {
    id: "a7",
    question: "In distributed systems, what does the CAP theorem state?",
    options: [
      "A system cannot simultaneously provide Consistency, Availability, and Partition tolerance",
      "A system must choose between Cost, Accessibility, and Performance",
      "A system requires Caching, Authentication, and Proxy servers",
      "A system should prioritize Connectivity, Automation, and Persistence"
    ],
    correctAnswer: 0,
    category: "Computer Science",
    difficulty: "advanced",
    explanation: "The CAP theorem states that a distributed data store cannot simultaneously provide more than two out of these three guarantees: Consistency, Availability, and Partition tolerance."
  },
  {
    id: "a8",
    question: "Which neural network architecture is best suited for sequential data processing like natural language?",
    options: [
      "Convolutional Neural Networks (CNN)",
      "Recurrent Neural Networks (RNN)",
      "Generative Adversarial Networks (GAN)",
      "Multilayer Perceptrons (MLP)"
    ],
    correctAnswer: 1,
    category: "AI Integration Basics",
    difficulty: "advanced",
    explanation: "Recurrent Neural Networks (RNNs) are designed to recognize patterns in sequences of data, making them ideal for tasks involving sequential information like text, speech, or time series data."
  }
];

export const getQuestionsByDifficulty = (difficulty: QuestionDifficulty) => {
  return quizQuestions.filter(q => q.difficulty === difficulty);
};

export const getResourceSuggestions = (score: number, totalQuestions: number) => {
  const percentage = (score / totalQuestions) * 100;
  
  if (percentage < 50) {
    return [
      {
        title: "AI Integration Fundamentals",
        type: "course" as const,
        description: "A beginner-friendly course covering the basics of AI integration in applications.",
        url: "https://example.com/courses/ai-fundamentals"
      },
      {
        title: "Getting Started with AI APIs",
        type: "video" as const,
        description: "Step-by-step tutorial on making your first API calls to popular AI services.",
        url: "https://example.com/videos/ai-api-tutorial"
      },
      {
        title: "Understanding AI Integration Concepts",
        type: "article" as const,
        description: "A comprehensive guide to the core concepts of integrating AI into applications.",
        url: "https://example.com/articles/ai-integration-guide"
      },
      {
        title: "Computer Science for Beginners",
        type: "course" as const,
        description: "Learn the fundamentals of computer science with practical exercises.",
        url: "https://example.com/courses/cs-fundamentals"
      }
    ];
  } else if (percentage < 80) {
    return [
      {
        title: "AI Integration Practice Challenges",
        type: "challenge" as const,
        description: "A series of hands-on challenges to apply your AI integration knowledge.",
        url: "https://example.com/challenges/ai-integration"
      },
      {
        title: "Intermediate AI API Usage",
        type: "course" as const,
        description: "Learn advanced techniques for working with AI APIs efficiently.",
        url: "https://example.com/courses/intermediate-ai-apis"
      },
      {
        title: "Real-world AI Integration Case Studies",
        type: "article" as const,
        description: "Analyze how companies have successfully integrated AI into their products.",
        url: "https://example.com/articles/ai-case-studies"
      },
      {
        title: "Cloud Computing Architecture",
        type: "course" as const,
        description: "Design scalable systems using modern cloud architecture patterns.",
        url: "https://example.com/courses/cloud-architecture"
      }
    ];
  } else {
    return [
      {
        title: "Building an AI-powered Application",
        type: "project" as const,
        description: "A comprehensive project guide to build a full-featured application with AI capabilities.",
        url: "https://example.com/projects/ai-application"
      },
      {
        title: "Advanced AI Integration Patterns",
        type: "course" as const,
        description: "Learn design patterns and best practices for complex AI integrations.",
        url: "https://example.com/courses/advanced-ai-patterns"
      },
      {
        title: "Contributing to Open Source AI Projects",
        type: "challenge" as const,
        description: "Apply your skills by contributing to real open source AI integration projects.",
        url: "https://example.com/challenges/opensource-ai"
      },
      {
        title: "Research Papers in Applied AI",
        type: "article" as const,
        description: "Read and understand cutting-edge research in applied artificial intelligence.",
        url: "https://example.com/articles/ai-research-papers"
      },
      {
        title: "Advanced Cybersecurity Techniques",
        type: "course" as const,
        description: "Master the latest techniques in securing AI systems and applications.",
        url: "https://example.com/courses/advanced-cybersecurity"
      }
    ];
  }
};
