"use client"
import { Plus } from "lucide-react"

export default function NewDealButton() {
  return (
    <button 
      onClick={() => alert("Neuer Deal Workflow wird bald implementiert!")}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
    >
      <Plus className="w-4 h-4" />
      New Deal
    </button>
  )
}