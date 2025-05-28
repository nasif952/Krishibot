// API client for communicating with the FastAPI backend

/**
 * Base API URL - uses environment variable or defaults to "/api" for production
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Interface for chat request
 */
export interface ChatRequest {
  question: string;
  approach: string;
  model: string;
}

/**
 * Interface for chat response
 */
export interface ChatResponse {
  response: string;
  approach: string;
  model: string;
}

/**
 * Interface for varieties response
 */
export interface VarietiesResponse {
  varieties: string[];
}

/**
 * API Client class for the Krishti chatbot
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    return response.json();
  }

  async getVarieties(): Promise<VarietiesResponse> {
    const response = await fetch(`${this.baseUrl}/varieties`);
    
    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async healthCheck(): Promise<{ status: string; rag_system?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "error" };
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(); 