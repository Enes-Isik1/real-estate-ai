import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export function ExecutiveSummary({ summary }: { summary: { title: string; content: string } }) {
  if (!summary) return null;

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{summary.title}</CardTitle>
            <CardDescription>Zusammenfassung der Immobilienanalyse</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {summary.content}
        </p>
      </CardContent>
    </Card>
  );
}