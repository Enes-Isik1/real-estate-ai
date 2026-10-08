"use client";
import { useState } from "react";
import { Brain, CheckCircle2, MessageSquare, Quote } from "lucide-react";
import { createClient } from "@/lib/utils/supabase/client";

export default function ChatInterface({
  dealId,
  relevantChunks,
}: {
  dealId?: string;
  relevantChunks?: any[];
}) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ question, dealId, relevantChunks }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Anfrage");
      }

      setResult(data);
    } catch (err: any) {
      console.error("Chat-Fehler:", err);
      alert(err.message || "Netzwerkfehler im Copilot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold flex items-center gap-2 text-lg text-gray-900">
        <Brain className="w-5 h-5 text-indigo-500" /> DealPilot Copilot
      </h3>

      <div className="flex gap-2">
        <input
          className="flex-1 p-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Was möchtest du zu diesem Deal wissen?"
          onKeyDown={(e) => e.key === "Enter" && askQuestion()}
        />
        <button
          onClick={askQuestion}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Denkt nach..." : "Senden"}
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-indigo-900">
            <p className="text-sm font-semibold">{result.answer}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm space-y-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-gray-600 text-xs italic">{result.reasoning}</p>
            </div>

            <div className="border-t pt-3 border-gray-200/60">
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Nachweis Seite {result.pageNumber}</span>
                <span className="flex items-center gap-1 text-indigo-600">
                  <CheckCircle2 className="w-3 h-3" /> Konfidenz:{" "}
                  {result.confidence}/10
                </span>
              </div>
              <p className="mt-2 text-gray-700 bg-white p-3 rounded-xl border border-gray-200 text-xs">
                <Quote className="w-3 h-3 inline mr-1 text-indigo-400" />
                {result.sourceSnippet}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
