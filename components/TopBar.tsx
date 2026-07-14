import { User, Bell } from "lucide-react"

export default function Topbar() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 md:px-8 w-full sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile Logo (Nur auf Handys sichtbar) */}
        <span className="font-bold text-lg tracking-tight text-gray-900 md:hidden">
          Deal<span className="text-blue-600">Pilot</span>
        </span>
        <h1 className="text-sm font-medium text-gray-500 hidden md:block">
          Welcome back, <span className="text-gray-900 font-semibold">Enes</span> 👋
        </h1>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 cursor-pointer">
          E
        </div>
      </div>
    </header>
  )
}