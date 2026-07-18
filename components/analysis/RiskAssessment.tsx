import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function RiskAssessment({ risks, onScrollToSource }: { risks: any[]; onScrollToSource: () => void }) {
  if (!risks || risks.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Risikobewertung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map((risk, index) => (
          <div key={index} className="flex flex-col gap-1 border-b pb-2 last:border-0">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{risk.title}</span>
              <Badge variant={risk.severity === "High" ? "destructive" : "secondary"}>
                {risk.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{risk.whyItMatters}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}