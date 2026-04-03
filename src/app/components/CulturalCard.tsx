"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface DarijaPhrase {
  word: string;
  meaning: string;
  literal: string;
  context: string;
}

interface AffiliateLink {
  text: string;
  url: string;
}

export interface CulturalPoint {
  id: string;
  title: string;
  question: string;
  answer: string;
  category: string;
  lat: number;
  lng: number;
  trail: string | null;
  darija?: DarijaPhrase;
  source: string;
  affiliate_link?: AffiliateLink;
}

const CATEGORY_LABELS: Record<string, string> = {
  forbidden: "Forbidden Knowledge",
  architecture: "Architecture",
  craft: "Guild Secrets",
  sacred: "Sacred",
  food: "Food & Water",
  women: "Women's History",
  language: "Language Secrets",
};

interface CulturalCardProps {
  point: CulturalPoint;
  revealed: boolean;
  onReveal: () => void;
  onClose: () => void;
  trailInfo?: { title: string; discovered: number; total: number } | null;
  proximityTriggered?: boolean;
}

export default function CulturalCard({
  point,
  revealed,
  onReveal,
  onClose,
  trailInfo,
  proximityTriggered,
}: CulturalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [autoRevealDone, setAutoRevealDone] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Auto-reveal after 2 seconds if triggered by proximity
  useEffect(() => {
    if (proximityTriggered && !revealed && !autoRevealDone) {
      const timer = setTimeout(() => {
        onReveal();
        setAutoRevealDone(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [proximityTriggered, revealed, autoRevealDone, onReveal]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 400);
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
    if (cardRef.current) cardRef.current.style.transform = "";
    if (diff > 100) handleClose();
    else if (diff < -50) setExpanded(true);
    startY.current = 0;
    currentY.current = 0;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50" style={{ pointerEvents: "auto" }}>
      {expanded && (
        <div
          className="fixed inset-0 bg-black/40 transition-opacity duration-400"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative rounded-t-2xl transition-all duration-[400ms] ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          backgroundColor: "#faf6f1",
          color: "#1a1a1a",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
          maxHeight: expanded ? "80dvh" : "42dvh",
          minHeight: expanded ? "50dvh" : "auto",
          overflow: expanded ? "auto" : "hidden",
        }}
      >
        <div className="drag-handle" />

        <div className="px-5 pb-6">
          {/* Category */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em]" style={{ color: "#c4613a" }}>
              {CATEGORY_LABELS[point.category] || point.category}
            </span>
            <button onClick={handleClose} className="text-[#8a8078] hover:text-[#1a1a1a] text-lg p-1" aria-label="Close">
              &times;
            </button>
          </div>

          {/* Title */}
          <h2 className="font-serif text-[26px] font-semibold leading-tight mb-3" style={{ color: "#1a1a1a" }}>
            {point.title}
          </h2>

          {/* Question — italic serif */}
          <p
            className={`font-serif text-base leading-relaxed italic transition-opacity duration-300 ${
              revealed ? "opacity-50" : "opacity-100"
            }`}
            style={{ color: "#3a3530" }}
          >
            {point.question}
          </p>

          {/* Reveal button or Answer */}
          {!revealed ? (
            <button
              onClick={onReveal}
              className="mt-4 text-sm font-sans font-medium animate-fade-in"
              style={{ color: "#c4613a" }}
            >
              Reveal &rarr;
            </button>
          ) : (
            <div className="mt-4 animate-fade-in-delay">
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: "#2a2520" }}>
                {point.answer}
              </p>

              {/* Trail indicator */}
              {trailInfo && (
                <div className="mt-4 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(196,97,58,0.08)" }}>
                  <p className="text-xs font-sans font-medium" style={{ color: "#c4613a" }}>
                    {trailInfo.title} &mdash; {trailInfo.discovered} of {trailInfo.total}
                  </p>
                </div>
              )}

              {/* Expanded content */}
              {expanded && (
                <div className="mt-5 space-y-4 animate-fade-in">
                  {point.darija && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(196,97,58,0.06)" }}>
                      <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "#c4613a" }}>
                        Darija
                      </p>
                      <p className="font-serif text-xl font-semibold" style={{ color: "#1a1a1a" }}>
                        {point.darija.word}
                      </p>
                      <p className="text-sm mt-1" style={{ color: "#8a8078" }}>
                        {point.darija.meaning} &mdash; literally &ldquo;{point.darija.literal}&rdquo;
                      </p>
                      <p className="text-sm mt-2 leading-relaxed" style={{ color: "#3a3530" }}>
                        {point.darija.context}
                      </p>
                    </div>
                  )}

                  {point.affiliate_link && (
                    <a
                      href={point.affiliate_link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-sans font-medium"
                      style={{ color: "#c4613a" }}
                    >
                      {point.affiliate_link.text} &rarr;
                    </a>
                  )}

                  <p className="text-[11px]" style={{ color: "#b0a89e" }}>
                    Source: {point.source}
                  </p>
                </div>
              )}

              {!expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="mt-3 text-xs font-sans font-medium"
                  style={{ color: "#c4613a" }}
                >
                  Swipe up for more
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
