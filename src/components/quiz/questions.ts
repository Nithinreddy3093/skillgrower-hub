
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
      }
    ];
  }
};
