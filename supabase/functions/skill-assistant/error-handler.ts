
import { corsHeaders } from "./config.ts";

// Handle and format errors in a consistent way
export function handleError(error: any) {
  console.error("Error in skill-assistant function:", error);
  
  // Provide more specific error messages based on error type
  let errorMessage = error.message || "An unexpected error occurred";
  let statusCode = 500;
  
  if (errorMessage.includes("API key")) {
    statusCode = 401;
    errorMessage = "API key issue: " + errorMessage;
  } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
    statusCode = 429;
    errorMessage = "Rate limit exceeded: " + errorMessage;
  } else if (errorMessage.includes("model")) {
    errorMessage = "Model issue: " + errorMessage;
  }
  
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      errorCode: statusCode,
      timestamp: new Date().toISOString()
    }),
    { 
      status: statusCode,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
