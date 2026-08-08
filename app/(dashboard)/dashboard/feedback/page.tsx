"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/utils/supabase/client"; // Passe den Pfad zu deinem Supabase-Client an
import { MessageSquarePlus, ThumbsUp, Send } from "lucide-react";

type FeedbackItem = {
  id: string;
  content: string;
  category: string;
  created_at: string;
  user_email: string;
};

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [category, setCategory] = useState("feature");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Feedback beim Laden abrufen
  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFeedbackList(data);
    }
  };

  // Neues Feedback absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("feedback").insert([
      {
        content: newFeedback,
        category: category,
        user_id: user?.id,
        user_email: user?.email || "Anonym",
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Fehler beim Senden des Feedbacks.");
    } else {
      setNewFeedback("");
      fetchFeedback(); // Feed aktualisieren
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Feedback & Feature-Wünsche
        </h1>
        <p className="text-sm text-gray-500">
          Teile deine Ideen oder melde Bugs, um DealPilot gemeinsam zu
          verbessern.
        </p>
      </div>

      {/* Formular zum Einreichen */}
      <form
        onSubmit={handleSubmit}
        className="mb-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-base font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-indigo-600" />
          Neues Feedback einreichen
        </h2>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Kategorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="feature">💡 Feature-Wunsch</option>
            <option value="bug">🐛 Bug / Fehler</option>
            <option value="general">💬 Allgemeines Feedback</option>
          </select>
        </div>

        <textarea
          rows={3}
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="Was können wir verbessern? Welches Feature wünschst du dir?"
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none mb-4"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? "Wird gesendet..." : "Absenden"}
        </button>
      </form>

      {/* Feedback Feed Liste */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Community Feed</h2>

        {feedbackList.length === 0 ? (
          <p className="text-sm text-gray-500">
            Noch kein Feedback vorhanden. Sei der Erste!
          </p>
        ) : (
          feedbackList.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 uppercase">
                  {item.category}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString("de-DE")}
                </span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {item.content}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Von: {item.user_email.split("@")[0]}***</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
