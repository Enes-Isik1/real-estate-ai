import SearchBar from "../../components/SearchBar"
import NewDealButton from "../../components/NewDealButton"
import DealCard, { Deal } from "../../components/DealCard"

// Dummy-Daten für die Deals
const dummyDeals: Deal[] = [
  {
    id: "1",
    title: "Enterprise SaaS License",
    company: "Acme Corp",
    value: 45000,
    stage: "Proposal",
    lastContact: "Vor 2 Stunden"
  },
  {
    id: "2",
    title: "Cloud Migration Consulting",
    company: "Stark Industries",
    value: 120000,
    stage: "Lead",
    lastContact: "Gestern"
  },
  {
    id: "3",
    title: "CRM Integration Setup",
    company: "Wayne Enterprises",
    value: 15000,
    stage: "Contacted",
    lastContact: "Vor 3 Tagen"
  },
  {
    id: "4",
    title: "AI Chatbot Implementation",
    company: "Cyberdyne Systems",
    value: 85000,
    stage: "Won",
    lastContact: "Gerade eben"
  },
  {
    id: "5",
    title: "Security Audit & Training",
    company: "Umbrella Corp",
    value: 32000,
    stage: "Lost",
    lastContact: "Vor 1 Woche"
  }
]

export default function InboxPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Inbox</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Verwalte deine aktiven Deals und laufenden Gespräche.
          </p>
        </div>
        <NewDealButton />
      </div>

      {/* Filter / Action Bar */}
      <div className="flex items-center gap-4 bg-white p-4 border border-gray-100 rounded-xl">
        <SearchBar placeholder="Inbox durchsuchen..." />
      </div>

      {/* Deal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  )
}