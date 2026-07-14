import { Button } from "../ui/Button";

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Guten Morgen, Alex
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          4 Deals warten auf eine Antwort. Der schnellste Weg dahin ist unten.
        </p>
      </div>
      
      {/* Wir nutzen hier ein reines HTML/SVG Plus-Icon, damit du lucide-react nicht installieren musst! */}
      <Button 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        }
      >
        Neuer Deal
      </Button>
    </div>
  );
}