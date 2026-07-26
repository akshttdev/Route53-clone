const TOKEN_KEY = "access_token"
const EMAIL_KEY = "user_email"

export const auth = {
  getToken() {
    if (typeof window === "undefined") return null

    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated() {
    return !!this.getToken()
  },

  clearLocalSession() {
    this.removeToken()
    localStorage.removeItem(EMAIL_KEY)
  },

  async logout() {
    this.clearLocalSession()

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      })
    } catch (error) {
      console.error("Logout API error:", error)
    }

    window.location.href = "/login"
  },
}
