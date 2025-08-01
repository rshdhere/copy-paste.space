import { AxiosError } from 'axios';

export interface NetworkErrorInfo {
  message: string;
  type: 'error' | 'warning';
  isMobileNetworkIssue: boolean;
}

export function detectNetworkError(error: unknown): NetworkErrorInfo {
  const axiosError = error as AxiosError;
  
  // Check for mobile network connectivity issues (specific network error codes)
  if (axiosError.code === "NETWORK_ERROR" || 
      axiosError.code === "ERR_NETWORK" || 
      axiosError.code === "ERR_INTERNET_DISCONNECTED") {
    return {
      message: "Network Error\nplease check your WiFi/Mobile Data",
      type: "warning",
      isMobileNetworkIssue: true
    };
  }
  
  // Check for timeout issues
  if (axiosError.code === "ECONNABORTED" || 
      axiosError.code === "ETIMEDOUT") {
    return {
      message: "Connection Timeout\nPlease check your internet connection and try again",
      type: "warning",
      isMobileNetworkIssue: true
    };
  }
  
  // Check for server errors
  if (axiosError.response?.status === 500) {
    return {
      message: "Server Error\nPlease try again later",
      type: "error",
      isMobileNetworkIssue: false
    };
  }
  
  // Check for not found errors
  if (axiosError.response?.status === 404) {
    return {
      message: "Service Not Found\nPlease check the URL and try again",
      type: "error",
      isMobileNetworkIssue: false
    };
  }
  
  // Check for client errors
  if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
    return {
      message: "Request Failed\nPlease check your input and try again",
      type: "warning",
      isMobileNetworkIssue: false
    };
  }
  
  // Check for backend down (no response but with specific error codes)
  if (!axiosError.response) {
    // If it's a connection refused or host unreachable, it's likely backend down
    if (axiosError.code === "ERR_CONNECTION_REFUSED" || 
        axiosError.code === "ERR_HOST_UNREACHABLE" ||
        axiosError.code === "ERR_NAME_NOT_RESOLVED") {
      return {
        message: "Backend Is Down\nWe are on it, please try again later",
        type: "error",
        isMobileNetworkIssue: false
      };
    }
    
    // For other connection issues without specific error codes, show network error
    return {
      message: "Network Error\nPlease check your internet connection",
      type: "warning",
      isMobileNetworkIssue: true
    };
  }
  
  // Fallback
  return {
    message: "Unexpected Error\nPlease try again",
    type: "error",
    isMobileNetworkIssue: false
  };
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getOptimalTimeout(): number {
  // Use longer timeouts for mobile devices
  return isMobileDevice() ? 15000 : 10000;
}

// Function to check if it's likely a backend down issue vs network issue
export async function checkBackendStatus(): Promise<boolean> {
  try {
    // Try to reach a known reliable service to test internet connectivity
    await fetch('https://www.google.com', { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    
    // If we can reach Google, but not our backend, it's likely backend down
    return false; // Backend is down
  } catch {
    // If we can't reach Google either, it's a network issue
    return true; // Network issue
  }
} 