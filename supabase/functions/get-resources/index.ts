
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { load } from "https://esm.sh/kagglehub";

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
    console.log("Fetching Kaggle dataset...");
    
    // Convert the dataset to a JSON object
    // Note: In a Deno environment we can't use pandas directly, so we'll
    // simulate the loading with a simplified approach for this demo
    const resourcesData = await fetchKaggleDataset();
    
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
    console.error("Error fetching Kaggle dataset:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "Failed to fetch Kaggle dataset" 
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

// This is a simplified mock function that would normally use KaggleDatasetAdapter.PANDAS
// In production, you would integrate with the actual Kaggle API
async function fetchKaggleDataset() {
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
    }
  ];
}
