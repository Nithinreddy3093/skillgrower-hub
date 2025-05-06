
import { ResourceSuggestion } from "./types";

export const topicOptions = [
  { id: "dsa", name: "Data Structures & Algorithms" },
  { id: "c", name: "C Programming" },
  { id: "cpp", name: "C++ Programming" },
  { id: "os", name: "Operating Systems" },
  { id: "cyber", name: "Cybersecurity" },
  { id: "ai", name: "Artificial Intelligence" },
  { id: "python", name: "Python" }
];

export const resourcesByTopic: Record<string, ResourceSuggestion[]> = {
  dsa: [
    {
      title: "Introduction to Algorithms",
      type: "course",
      description: "Comprehensive course covering fundamental algorithms and data structures",
      url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-006-introduction-to-algorithms-fall-2011/"
    },
    {
      title: "Data Structures Visualization",
      type: "article",
      description: "Interactive visualizations to help understand common data structures",
      url: "https://visualgo.net/en"
    },
    {
      title: "DSA Problem Solving Challenge",
      type: "challenge",
      description: "Weekly coding challenges to improve your algorithm skills",
      url: "https://leetcode.com/problemset/all/"
    }
  ],
  c: [
    {
      title: "C Programming for Beginners",
      type: "video",
      description: "Step-by-step guide to C programming fundamentals",
      url: "https://www.youtube.com/watch?v=KJgsSFOSQv0"
    },
    {
      title: "Advanced C Programming Concepts",
      type: "course",
      description: "Deep dive into memory management, pointers, and advanced C features",
      url: "https://www.edx.org/learn/c-programming"
    },
    {
      title: "Build Your Own Shell in C",
      type: "project",
      description: "Practical project to understand system programming with C",
      url: "https://github.com/codecrafters-io/build-your-own-x"
    }
  ],
  cpp: [
    {
      title: "C++ Crash Course",
      type: "course",
      description: "Fast-paced introduction to C++ for programmers",
      url: "https://www.coursera.org/learn/cpp-chengxu-sheji"
    },
    {
      title: "Modern C++ Features",
      type: "article",
      description: "Overview of C++11/14/17/20 features with practical examples",
      url: "https://www.modernescpp.com/"
    },
    {
      title: "Game Development with C++",
      type: "project",
      description: "Create a simple 2D game using C++ and SDL",
      url: "https://lazyfoo.net/tutorials/SDL/"
    }
  ],
  os: [
    {
      title: "Operating Systems: Three Easy Pieces",
      type: "article",
      description: "Comprehensive guide to OS concepts with practical examples",
      url: "https://pages.cs.wisc.edu/~remzi/OSTEP/"
    },
    {
      title: "Build a Simple OS",
      type: "project",
      description: "Step-by-step guide to building your own operating system",
      url: "https://wiki.osdev.org/Main_Page"
    },
    {
      title: "Advanced OS Concepts",
      type: "course",
      description: "Deep dive into process management, memory, and file systems",
      url: "https://www.coursera.org/learn/os-pku"
    }
  ],
  cyber: [
    {
      title: "Web Security Academy",
      type: "course",
      description: "Hands-on labs for web security vulnerabilities and exploits",
      url: "https://portswigger.net/web-security"
    },
    {
      title: "Practical Cryptography",
      type: "article",
      description: "Understanding modern cryptographic algorithms and protocols",
      url: "https://cryptopals.com/"
    },
    {
      title: "Ethical Hacking Challenge",
      type: "challenge",
      description: "Practice your cybersecurity skills with CTF challenges",
      url: "https://www.hackthebox.com/"
    }
  ],
  ai: [
    {
      title: "Machine Learning Crash Course",
      type: "course",
      description: "Google's fast-paced introduction to machine learning",
      url: "https://developers.google.com/machine-learning/crash-course"
    },
    {
      title: "Deep Learning Specialization",
      type: "video",
      description: "Comprehensive series on neural networks and deep learning",
      url: "https://www.coursera.org/specializations/deep-learning"
    },
    {
      title: "Build an AI-powered Recommendation System",
      type: "project",
      description: "Practical project to implement machine learning algorithms",
      url: "https://www.tensorflow.org/recommenders"
    }
  ],
  python: [
    {
      title: "Python for Everybody",
      type: "course",
      description: "Beginner-friendly introduction to Python programming",
      url: "https://www.py4e.com/"
    },
    {
      title: "Advanced Python Concepts",
      type: "article",
      description: "Deep dive into decorators, generators, and context managers",
      url: "https://realpython.com/"
    },
    {
      title: "Web Scraping with Python",
      type: "project",
      description: "Build a web scraper to collect and analyze data",
      url: "https://www.scrapingbee.com/blog/web-scraping-101-with-python/"
    }
  ]
};
