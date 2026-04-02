"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CulturalPoint } from "./CulturalCard";

interface SearchBarProps {
  points: CulturalPoint[];
  onSelect: (point: CulturalPoint) => void;
  onClose: () => void;
}

export default function SearchBar({ points, onSelect, onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
      inputRef.current?.focus();
    });
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const results = query.length > 0
    ? points.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`absolute top-0 inset-x-0 transition-transform duration-200 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <div className="safe-area-top" />
        <div className="px-4 pt-12 pb-3 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search places..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-base font-sans bg-gray-100 dark:bg-gray-800 border-0 outline-none focus:ring-2 focus:ring-terracotta/50"
          />
          <button
            onClick={handleClose}
            className="text-sm font-sans font-medium text-terracotta"
          >
            Cancel
          </button>
        </div>

        {results.length > 0 && (
          <div className="max-h-[60dvh] overflow-y-auto px-4 pb-4 space-y-1">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  handleClose();
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <p className="text-sm font-medium font-sans">{p.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {p.subtitle}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
