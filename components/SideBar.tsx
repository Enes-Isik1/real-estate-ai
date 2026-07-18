"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Settings, 
  FolderKanban
} from "lucide-react"

// WICHTIG: export default und das große "B" im Funktionsnamen
export default function SideBar() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Deals", href: "/dashboard/deals", icon: FolderKanban },
    { name: "AI Analytics", href: "/dashboard/analyze", icon: Sparkles },
    { name: "Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 border-r border-gray-200/60 bg-white h-screen flex flex-col p-4 shrink-0 justify-between">
      
      {/* LOGO & NAVIGATION */}
      <div className="space-y-6 flex flex-col">
        {/* LOGO */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            D
          </div>
          <span className="font-black text-gray-900 tracking-tight text-lg">
            Deal<span className="text-indigo-600">Pilot</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* UNTERER STATUS BLOCK */}
      <div className="mt-auto pt-6 border-t border-gray-200/50">
        <div className="bg-slate-50 border border-gray-200/40 rounded-xl p-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Engine Status</span>
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Pilot Mode v1.0
            </span>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
            AI Active
          </span>
        </div>
      </div>

    </aside>
  )
}