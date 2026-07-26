const TOKEN_KEY = "access_token"

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

  async logout() {
    this.removeToken()

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout API error:", error)
    }

    window.location.href = "/login"
  },
}