"use client"

import { useState } from "react"
import { Bell, HelpCircle, LogOut, Search, Settings, User } from "lucide-react"
import { auth } from "@/lib/auth"

export function AppHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await auth.logout()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#D5DBDB] bg-white px-8">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687078]" />

          <input
            type="text"
            placeholder="Search"
            className="
              h-10
              w-72
              rounded-none
              border
              border-[#C6CACE]
              bg-white
              pl-10
              pr-4
              text-sm
              outline-none
              transition
              placeholder:text-[#687078]
              focus:border-[#0972D3]
              focus:ring-2
              focus:ring-[#0972D3]/20
            "
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HeaderIcon>
          <HelpCircle className="h-5 w-5" />
        </HeaderIcon>

        <HeaderIcon>
          <Bell className="h-5 w-5" />
        </HeaderIcon>

        <HeaderIcon>
          <Settings className="h-5 w-5" />
        </HeaderIcon>

        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-[#0972D3]
              text-sm
              font-semibold
              text-white
              transition-transform
              hover:scale-105
            "
          >
            A
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-56 rounded-none border border-[#D5DBDB] bg-white shadow-lg">
                <div className="border-b border-[#D5DBDB] px-4 py-3">
                  <p className="text-sm font-semibold text-[#16191F]">
                    Admin User
                  </p>
                  <p className="text-xs text-[#5F6B7A]">
                    admin@route53.local
                  </p>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-none
                      px-3
                      py-2
                      text-sm
                      text-[#16191F]
                      transition-colors
                      hover:bg-[#F2F3F3]
                    "
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

interface HeaderIconProps {
  children: React.ReactNode
}

function HeaderIcon({ children }: HeaderIconProps) {
  return (
    <button
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-none
        text-[#5F6B7A]
        transition-colors
        hover:bg-[#F2F3F3]
        hover:text-[#16191F]
      "
    >
      {children}
    </button>
  )
}