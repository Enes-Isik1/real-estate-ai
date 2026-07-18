"use client"

import React, { useRef, useEffect } from "react"
import { Search } from "lucide-react"

interface SearchBarProps {
  readonly placeholder?: string
}

export default function SearchBar({ placeholder = "Suchen..." }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Tastatur-Shortcut aktivieren (Cmd+K oder Strg+K fokussiert das Suchfeld)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="relative w-full group">
      {/* Search Icon links */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
      </div>

      {/* Das Eingabefeld */}
      <input
        ref={inputRef}
        type="text"
        className="block w-full pl-11 pr-16 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-gray-900 placeholder-gray-400 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
        placeholder={placeholder}
      />

      {/* Das stylische Shortcut-Badge ganz rechts */}
      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold font-sans text-gray-400 bg-white border border-gray-200 rounded-lg shadow-sm group-focus-within:border-indigo-300 group-focus-within:text-indigo-500 transition-colors duration-200">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </div>
  )
}