import { Building2, DollarSign, ArrowUpRight } from "lucide-react"

export interface Deal {
  id: string
  title: string
  company: string
  value: number
  stage: "Lead" | "Contacted" | "Proposal" | "Won" | "Lost"
  lastContact: string
}

interface DealCardProps {
  deal: Deal
}

const stageColors = {
  Lead: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Proposal: "bg-purple-50 text-purple-700 border-purple-200",
  Won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-rose-50 text-rose-700 border-rose-200",
}

export default function DealCard({ deal }: DealCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow group cursor-pointer relative">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
            {deal.title}
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{deal.company}</span>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${stageColors[deal.stage]}`}>
          {deal.stage}
        </span>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-4 text-sm">
        <div className="flex items-center text-gray-900 font-semibold">
          <DollarSign className="w-4 h-4 text-gray-400 -mr-0.5" />
          {deal.value.toLocaleString("de-DE")}
        </div>
        <span className="text-xs text-gray-400">Contact: {deal.lastContact}</span>
      </div>
    </div>
  )
}