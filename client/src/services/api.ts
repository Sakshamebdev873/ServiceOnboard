import type { ServiceFormData } from "../types/ServiceFormData";

const API_URL = "https://serviceonboard.onrender.com/api/service-center";
// const API_URL = "http://localhost:5000/api/service-center"

interface SubmitServiceResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

export const submitServiceForm = async (
  formData: ServiceFormData
): Promise<SubmitServiceResponse> => {
  const dataToSend = new FormData();

  // 1. Append basic text fields
  (Object.keys(formData) as Array<keyof ServiceFormData>).forEach((key) => {
    if (key !== "categories" && key !== "imagePaths") {
      const value = formData[key];
      if (typeof value === "string") {
        dataToSend.append(key, value);
      }
    }
  });

  // 2. Append Categories
  formData.categories.forEach((cat: string) => {
    dataToSend.append("categories", cat);
  });

  // 3. Append Images
  formData.imagePaths.forEach((image: File) => {
    dataToSend.append("images", image);
  });

  const response = await fetch(API_URL, {
    method: "POST",
    body: dataToSend,
  });

  // --- CRITICAL FIX STARTS HERE ---
  
  // 4. Check if the response is actually JSON
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const result: SubmitServiceResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error ?? `Server Error: ${response.status}`);
    }
    
    return result;
  } else {
    // If we are here, Render sent an HTML error page (like a 413, 502, or 504)
    if (response.status === 413) {
      throw new Error("The images you uploaded are too large for the server to process.");
    }
    if (response.status === 504) {
      throw new Error("The server took too long to respond (Timeout). Try uploading fewer images.");
    }
    
    // Read the text to see what happened, but don't try to parse as JSON
    const errorText = await response.text();
    console.error("Non-JSON response received:", errorText);
    throw new Error(`Critical Server Error (${response.status}). Please try again later.`);
  }
};