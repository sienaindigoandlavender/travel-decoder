"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface DarijaPhrase {
  word: string;
  meaning: string;
  pronunciation: string;
  context: string;
}

export interface CulturalPoint {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  card_text: string;
  category: string;
  darija_phrase?: DarijaPhrase;
  source: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  landmark: "\u{1F4CD}",
  craft: "\u{1F9F5}",
  religion: "\u{1F54C}",
  food: "\u{1F375}",
  architecture: "\u{1F3DB}\uFE0F",
  market: "\u{1F6D2}",
  history: "\u{1F4DC}",
  nature: "\u{1F333}",
};

interface CulturalCardProps {
  point: CulturalPoint;
  nearby?: CulturalPoint[];
  onClose: () => void;
  onSelectPoint?: (point: CulturalPoint) => void;
}

export default function CulturalCard({
  point,
  nearby,
  onClose,
  onSelectPoint,
}: CulturalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (cardRef.current && diff > 0 && !expanded) {
      cardRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (cardRef.current) {
      cardRef.current.style.transform = "";
    }
    if (diff > 100) {
      handleClose();
    } else if (diff < -50) {
      setExpanded(true);
    }
  };

  const icon = CATEGORY_ICONS[point.category] || "\u{1F4CD}";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
      style={{ pointerEvents: "auto" }}
    >
      {/* Backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/20 transition-opacity duration-300"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative rounded-t-2xl transition-all duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          backgroundColor: "var(--card-bg)",
          boxShadow: "var(--card-shadow)",
          maxHeight: expanded ? "80dvh" : "42dvh",
          minHeight: expanded ? "60dvh" : "auto",
          overflow: expanded ? "auto" : "hidden",
        }}
      >
        {/* Drag handle */}
        <div className="drag-handle" />

        <div className="px-5 pb-6">
          {/* Category + close */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-sans font-medium uppercase tracking-wider text-terracotta">
              {icon} {point.category}
            </span>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg p-1"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* Title */}
          <h2 className="font-serif text-2xl font-semibold leading-tight mb-1">
            {point.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-sans">
            {point.subtitle}
          </p>

          {/* Card text */}
          <p className="font-sans text-base leading-relaxed">
            {point.card_text}
          </p>

          {/* Expanded content */}
          {expanded && (
            <div className="mt-5 space-y-5 animate-fadeIn">
              {/* Darija phrase */}
              {point.darija_phrase && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs font-sans font-medium uppercase tracking-wider text-terracotta mb-2">
                    Darija
                  </p>
                  <p className="font-serif text-xl font-semibold">
                    {point.darija_phrase.word}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    /{point.darija_phrase.pronunciation}/ &mdash;{" "}
                    {point.darija_phrase.meaning}
                  </p>
                  <p className="text-sm mt-2 leading-relaxed">
                    {point.darija_phrase.context}
                  </p>
                </div>
              )}

              {/* Source */}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Source: {point.source}
              </p>

              {/* Nearby */}
              {nearby && nearby.length > 0 && (
                <div>
                  <p className="text-xs font-sans font-medium uppercase tracking-wider text-terracotta mb-2">
                    Nearby
                  </p>
                  <div className="space-y-2">
                    {nearby.map((np) => (
                      <button
                        key={np.id}
                        onClick={() => onSelectPoint?.(np)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="text-sm font-medium">
                          {CATEGORY_ICONS[np.category] || "\u{1F4CD}"}{" "}
                          {np.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {np.subtitle}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expand hint */}
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-3 text-xs text-terracotta font-medium font-sans"
            >
              Swipe up or tap for more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
