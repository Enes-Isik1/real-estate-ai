import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";

export function PositiveAspects({ aspects }: { aspects: string[] }) {
  if (!aspects || aspects.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-600">
          <ThumbsUp className="w-5 h-5" />
          Positive Aspekte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-4 text-sm text-muted-foreground">
          {aspects.map((aspect, index) => (
            <li key={index}>{aspect}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}