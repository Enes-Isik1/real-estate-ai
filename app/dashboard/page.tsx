"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  ChevronRight, 
  FileText, 
  Sparkles, 
  User,
  Clock,
  Plus,
  Sliders,
  Globe
} from "lucide-react"

// Hilfskomponente für den "New Deal" Button
function InlineNewDealButton() {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.push("/dashboard/new-deal")}
      className="relative group overflow-hidden bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-bold text-sm py-2.5 px-5 rounded-2xl transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_14px_30px_-5px_rgba(79,70,229,0.5)] -translate-y-[1px] hover:-translate-y-[3px] active:translate-y-0 flex items-center justify-center gap-2 border-t border-indigo-400/30 active:scale-95 cursor-pointer"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <Plus className="w-4 h-4 stroke-[3] transition-transform duration-300 group-hover:rotate-90" />
      <span className="tracking-wide">New Deal</span>
    </button>
  )
}

const INITIAL_DEALS = [
  {
    id: "1",
    title: "Lakefront Villa Munich",
    client: "Maximilian Bauer",
    email: "m.bauer@gmail.com",
    score: 94,
    status: "Reviewing",
    date: "Today",
    price: "€4,250,000"
  },
  {
    id: "2",
    title: "Penthouse Hamburg",
    client: "Sarah Jenkins",
    email: "sarah.j@jenkins-capital.com",
    score: 88,
    status: "Missing Docs",
    date: "Yesterday",
    price: "€2,890,000"
  },
  {
    id: "3",
    title: "Cozy Apartment Berlin",
    client: "Jonas Schmidt",
    email: "jonas.schmidt@web.de",
    score: 72,
    status: "Contacted",
    date: "3 days ago",
    price: "€640,000"
  },
  {
    id: "4",
    title: "Commercial Loft Cologne",
    client: "Elena Rostova",
    email: "e.rostova@rostov-holdings.com",
    score: 91,
    status: "Reviewing",
    date: "4 days ago",
    price: "€1,850,000"
  }
]

export default function DashboardPage() {
  const router = useRouter()
  
  // Dynamischer State für alle Deals (Startet mit den Initialen Werten)
  const [deals, setDeals] = useState(INITIAL_DEALS)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Show all")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // 1. NEU: Effekt zum Laden des frisch analysierten Deals aus dem SessionStorage
  useEffect(() => {
    const storedDeal = sessionStorage.getItem("latest_analyzed_deal")
    
    if (storedDeal) {
      try {
        const parsedDeal = JSON.parse(storedDeal)
        
        // Verhindert doppeltes Hinzufügen beim erneuten Rendern
        setDeals((prevDeals) => {
          const exists = prevDeals.some(deal => deal.id === parsedDeal.id)
          if (exists) return prevDeals
          
          // Wir packen den neuen echten Deal ganz nach oben!
          return [parsedDeal, ...prevDeals]
        })
      } catch (e) {
        console.error("Fehler beim Laden des echten Deals aus dem SessionStorage:", e)
      }
    }
  }, [])

  // Prefetcht die Analyse-Seite im Hintergrund für ein nahtloses Nutzungserlebnis
  useEffect(() => {
    router.prefetch("/dashboard/analyze")
  }, [router])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // 2. Filter-Logik angepasst: Nutzt jetzt den dynamischen "deals"-State statt INITIAL_DEALS
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.status.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (statusFilter === "Show all") return matchesSearch
    
    if (statusFilter === "Reviewing") return matchesSearch && deal.status === "Reviewing"
    if (statusFilter === "Missing Docs") return matchesSearch && deal.status === "Missing Docs"
    if (statusFilter === "Contacted") return matchesSearch && deal.status === "Contacted"
    return matchesSearch
  })

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            {getGreeting()}, Enes <span className="animate-bounce-slow">👋</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            You have <span className="text-indigo-600 font-bold">3 hot leads</span> waiting for your review today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InlineNewDealButton />
        </div>
      </div>

      {/* KPI CARDS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Inquiries</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">This Week</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">14</span>
            <span className="text-xs font-bold text-emerald-500">+40%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hot Leads</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">High Score</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">6</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Missing Docs</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full">Action Req.</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">3</span>
            <span className="text-xs font-bold text-rose-500">Urgent</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Follow-ups Today</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">Schedule</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">5</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-gray-200/60 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals, buyers or status..."
            className="w-full bg-gray-50/50 text-gray-900 text-sm py-2 pl-10 pr-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/80 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Dropdown-Box */}
          <div className="relative flex items-center">
            <Globe className="absolute left-3 w-3.5 h-3.5 text-emerald-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-gray-50/50 hover:bg-gray-100/40 border border-gray-200 text-xs font-semibold text-gray-700 py-2 pl-9 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
            >
              <option value="Show all">Show all</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Missing Docs">Missing Docs</option>
              <option value="Contacted">Contacted</option>
            </select>
            <ChevronRight className="absolute right-3 w-3.5 h-3.5 text-gray-400 rotate-90 pointer-events-none" />
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-600 cursor-pointer">
            <Sliders className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* TABLE & AI INSIGHTS SPLIT-SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LINKS: DIE DEALS TABELLE */}
        <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden lg:col-span-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/60 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Deal Details</th>
                  <th className="py-4 px-6">Client Profile</th>
                  <th className="py-4 px-6 text-center">AI Score</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Received</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal) => {
                    const strokeColor = deal.score >= 80 ? "stroke-indigo-500" : deal.score >= 60 ? "stroke-amber-500" : "stroke-rose-500";

                    return (
                      <tr 
                        key={deal.id}
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        onClick={() => router.push("/dashboard/analyze")}
                      >
                        {/* Column 1: Deal Name & Price */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                              <svg className="absolute w-full h-full transform -rotate-90">
                                <circle 
                                  cx="20" 
                                  cy="20" 
                                  r="16" 
                                  className="stroke-gray-100 fill-none" 
                                  strokeWidth="2.5" 
                                />
                                <circle 
                                  cx="20" 
                                  cy="20" 
                                  r="16" 
                                  className={`fill-none transition-all duration-1000 ${strokeColor}`}
                                  strokeWidth="2.5" 
                                  strokeDasharray={100.5}
                                  strokeDashoffset={100.5 - (100.5 * deal.score) / 100}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="text-[10px] font-black text-gray-700">{deal.score}</span>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors">
                                {deal.title}
                              </div>
                              <div className="text-xs text-gray-400 font-semibold mt-0.5">{deal.price}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-700">{deal.client}</div>
                              <div className="text-xs text-gray-400">{deal.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1 bg-indigo-50/60 px-2.5 py-1 rounded-full border border-indigo-100">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-xs font-black text-indigo-700">{deal.score}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            deal.status === "Reviewing" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : deal.status === "Missing Docs"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {deal.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            {deal.date}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No deals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECHTS: DEALPILOT AI INSIGHTS CARD */}
        <div className="bg-[#0b0c14] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white lg:col-span-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center pb-4 border-b border-gray-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-gray-300">
                DEALPILOT AI INSIGHTS
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-bold border border-emerald-500/20">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          </div>

          <div className="mt-5 space-y-5">
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              AI has analyzed your active deals. Action is required for a high-value lead.
            </p>

            {/* Inner Alert Box: Urgent Action */}
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                <span>Urgent Action</span>
                <span className="text-gray-500">Lakefront Villa</span>
              </div>
              <h3 className="text-xs font-bold text-white">Request Missing Documents</h3>
              <p className="text-[10px] text-gray-400 leading-normal">
                Without the missing documents, the closing probability will drop by <span className="text-rose-400 font-bold">12% in the next 48h</span>.
              </p>
            </div>

            {/* Inner Alert Box: Hot Opportunity */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                <span>Hot Opportunity</span>
                <span className="text-gray-500">Penthouse HH</span>
              </div>
              <h3 className="text-xs font-bold text-white">Clients financial status</h3>
              <p className="text-[10px] text-gray-400 leading-normal">
                High engagement score detected. Customer opened the document link 4 times today.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}