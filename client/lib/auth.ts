// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Get the authentication token from localStorage
export const getAuthToken = (): string | null => {
  if (!isBrowser) return null
  return localStorage.getItem("authToken")
}

// Set the authentication token in localStorage
export const setAuthToken = (token: string): void => {
  if (!isBrowser) return
  localStorage.setItem("authToken", token)
}

// Remove the authentication token from localStorage
export const removeAuthToken = (): void => {
  if (!isBrowser) return
  localStorage.removeItem("authToken")
}

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  if (!isBrowser) return false
  return !!getAuthToken()
}

