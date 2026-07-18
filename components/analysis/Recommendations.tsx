import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function Recommendations({ recs }: { recs: string[] }) {
  if (!recs || recs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-amber-600">
          <Lightbulb className="w-5 h-5" />
          Handlungsempfehlungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-4 text-sm text-muted-foreground">
          {recs.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}