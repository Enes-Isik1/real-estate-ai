"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inbox, FolderKanban, Settings, Landmark } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { label: "Inbox", href: "/", icon: Inbox },
    { label: "Deals", href: "/deals", icon: FolderKanban },
    { label: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0 shrink-0 hidden md:flex">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 gap-2">
        <Landmark className="w-6 h-6 text-blue-600" />
        <span className="font-bold text-xl tracking-tight text-gray-900">
          Deal<span className="text-blue-600">Pilot</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
        v1.0.0 • Pilot Mode
      </div>
    </aside>
  )
}