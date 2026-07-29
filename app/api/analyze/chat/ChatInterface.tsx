"use client";
import { useState } from "react";
import { Brain, CheckCircle2, MessageSquare, Quote } from "lucide-react";

export default function ChatInterface({ relevantChunks }: { relevantChunks: any[] }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ question, relevantChunks }),
    });
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold flex items-center gap-2 text-lg">
        <Brain className="w-5 h-5 text-indigo-500" /> DealPilot Copilot
      </h3>
      
      <div className="flex gap-2">
        <input 
          className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Was möchtest du wissen?"
        />
        <button 
          onClick={askQuestion} 
          disabled={loading}
          className="bg-indigo-600 text-white px-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "..." : "Senden"}
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Die direkte Antwort */}
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-900">
            <p className="font-semibold">{result.answer}</p>
          </div>

          {/* Reasoning & Quelle */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm space-y-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-gray-700 italic">{result.reasoning}</p>
            </div>
            
            <div className="border-t pt-3 border-gray-200">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>Nachweis Seite {result.pageNumber}</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Conf: {result.confidence}/10
                </span>
              </div>
              <p className="mt-2 text-gray-600 bg-white p-3 rounded-lg border border-gray-200 text-sm">
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