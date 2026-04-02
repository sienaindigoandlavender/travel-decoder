"use client";

import { useCallback, useEffect, useState } from "react";

interface DarijaPhrase {
  phrase: string;
  pronunciation: string;
  literal: string;
  meaning: string;
  reply: string;
  when: string;
  category: string;
}

interface DarijaCardProps {
  phrases: DarijaPhrase[];
  onClose: () => void;
}

const CATEGORIES = [
  { id: "greetings", label: "Greetings" },
  { id: "shopping", label: "Shopping" },
  { id: "directions", label: "Directions" },
  { id: "food", label: "Food" },
  { id: "emergency", label: "Emergency" },
];

export default function DarijaCard({ phrases, onClose }: DarijaCardProps) {
  const [visible, setVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("greetings");
  const [search, setSearch] = useState("");

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const filtered = phrases.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        p.phrase.toLowerCase().includes(q) ||
        p.meaning.toLowerCase().includes(q) ||
        p.literal.toLowerCase().includes(q)
      );
    }
    return p.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`absolute inset-y-0 left-0 w-[85vw] max-w-sm transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Darija</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg p-1"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* Search */}
          <div className="px-5 pb-3">
            <input
              type="text"
              placeholder="Search in English..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm font-sans bg-gray-100 dark:bg-gray-800 border-0 outline-none focus:ring-2 focus:ring-terracotta/50"
            />
          </div>

          {/* Category tabs */}
          {!search && (
            <div className="px-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? "bg-terracotta text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Phrases list */}
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
            {filtered.map((p) => (
              <div
                key={p.phrase}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-serif text-lg font-semibold">
                    {p.phrase}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-sans">
                    {p.meaning}
                  </span>
                </div>
                <p className="text-xs text-terracotta font-sans mb-2">
                  /{p.pronunciation}/ &mdash; literally &ldquo;{p.literal}
                  &rdquo;
                </p>
                {p.reply && (
                  <p className="text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      Reply:
                    </span>{" "}
                    {p.reply}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {p.when}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
