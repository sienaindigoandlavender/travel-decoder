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
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`absolute top-0 inset-x-0 transition-transform duration-200 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <div className="px-4 pt-12 pb-3 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search secrets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-base font-sans border-0 outline-none"
            style={{ backgroundColor: "#2a2a2a", color: "#f5f0e8" }}
          />
          <button onClick={handleClose} className="text-sm font-sans font-medium" style={{ color: "#c4613a" }}>
            Cancel
          </button>
        </div>

        {results.length > 0 && (
          <div className="max-h-[60dvh] overflow-y-auto px-4 pb-4 space-y-1">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); handleClose(); }}
                className="w-full text-left px-4 py-3 rounded-xl transition-colors"
                style={{ color: "#f5f0e8" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <p className="text-sm font-medium font-sans">{p.title}</p>
                <p className="text-xs" style={{ color: "#8a8078" }}>
                  {p.category}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
