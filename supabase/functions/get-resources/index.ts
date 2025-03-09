
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching resources data...");
    
    // Get resources data
    const resourcesData = await fetchResourcesData();
    
    return new Response(
      JSON.stringify({ 
        data: resourcesData,
        message: "Successfully fetched resources"
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error fetching resources data:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "Failed to fetch resources data" 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});

// This function simulates fetching data from a Kaggle dataset
// In production, you would integrate with the actual Kaggle API or use another data source
async function fetchResourcesData() {
  // For demo purposes, returning a subset of mock data based on the dataset structure
  return [
    {
      id: 1,
      title: "Introduction to Machine Learning",
      description: "A comprehensive guide to machine learning basics",
      url: "https://example.com/ml-intro",
      type: "article",
      difficulty: "beginner",
      tags: ["machine learning", "AI", "data science"],
      author: "Andrew Ng",
      date_published: "2023-01-15",
      rating: 4.8,
      language: "English"
    },
    {
      id: 2,
      title: "Advanced Python Programming",
      description: "Deep dive into Python's advanced features",
      url: "https://example.com/adv-python",
      type: "course",
      difficulty: "advanced",
      tags: ["python", "programming", "software development"],
      author: "Guido van Rossum",
      date_published: "2022-11-10",
      rating: 4.9,
      language: "English"
    },
    {
      id: 3,
      title: "Web Development with React",
      description: "Learn how to build modern web applications with React",
      url: "https://example.com/react-dev",
      type: "video",
      difficulty: "intermediate",
      tags: ["react", "javascript", "web development"],
      author: "Meta Team",
      date_published: "2023-02-28",
      rating: 4.7,
      language: "English"
    },
    {
      id: 4,
      title: "Data Structures and Algorithms",
      description: "Essential algorithms and data structures for software engineers",
      url: "https://example.com/dsa",
      type: "book",
      difficulty: "intermediate",
      tags: ["algorithms", "data structures", "computer science"],
      author: "Thomas Cormen",
      date_published: "2022-05-20",
      rating: 4.6,
      language: "English"
    },
    {
      id: 5,
      title: "Database Design Best Practices",
      description: "Learn optimal database design principles for scalability",
      url: "https://example.com/db-design",
      type: "tutorial",
      difficulty: "advanced",
      tags: ["database", "SQL", "system design"],
      author: "Jennifer Widom",
      date_published: "2023-03-15",
      rating: 4.5,
      language: "English"
    },
    {
      id: 6,
      title: "Docker and Kubernetes Fundamentals",
      description: "Master containerization and orchestration technologies",
      url: "https://example.com/docker-k8s",
      type: "course",
      difficulty: "intermediate",
      tags: ["docker", "kubernetes", "devops", "containers"],
      author: "Kelsey Hightower",
      date_published: "2023-04-10",
      rating: 4.9,
      language: "English"
    },
    {
      id: 7,
      title: "JavaScript: The Good Parts",
      description: "Focus on the best features of JavaScript",
      url: "https://example.com/js-good-parts",
      type: "book",
      difficulty: "intermediate",
      tags: ["javascript", "programming", "web development"],
      author: "Douglas Crockford",
      date_published: "2022-09-12",
      rating: 4.7,
      language: "English"
    },
    {
      id: 8,
      title: "Introduction to Cybersecurity",
      description: "Learn the fundamentals of keeping systems and data secure",
      url: "https://example.com/cybersecurity-intro",
      type: "video",
      difficulty: "beginner",
      tags: ["cybersecurity", "security", "networking"],
      author: "Bruce Schneier",
      date_published: "2023-02-05",
      rating: 4.4,
      language: "English"
    }
  ];
}
