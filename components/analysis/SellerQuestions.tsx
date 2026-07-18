import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export function SellerQuestions({ questions }: { questions: any[] }) {
  if (!questions || questions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HelpCircle className="w-5 h-5 text-primary" />
          Fragen an den Verkäufer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {questions.map((q, index) => (
            <li key={index}>
              <span className="font-semibold block text-foreground">{q.question}</span>
              <span className="text-xs italic">Kontext: {q.context}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}