"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import CulturalCard from "./components/CulturalCard";
import type { CulturalPoint } from "./components/CulturalCard";
import ProximityEngine from "./components/ProximityEngine";
import DarijaCard from "./components/DarijaCard";
import SearchBar from "./components/SearchBar";
import { getDiscoveredIds, markDiscovered } from "@/lib/proximity";
import { registerServiceWorker } from "@/lib/offline";
import culturalPoints from "@/data/marrakech.json";
import trailsData from "@/data/trails.json";
import darijaData from "@/data/darija-basics.json";

const Map = dynamic(() => import("./components/Map"), { ssr: false });

if (typeof window !== "undefined") {
  registerServiceWorker();
}

interface Trail {
  id: string;
  title: string;
  description: string;
  points: string[];
  bonus_card: string;
}

export default function Home() {
  const [selectedPoint, setSelectedPoint] = useState<CulturalPoint | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [proximityTriggered, setProximityTriggered] = useState(false);
  const [showDarija, setShowDarija] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lng: number; lat: number } | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(new Set());
  const [bonusTrail, setBonusTrail] = useState<Trail | null>(null);

  const points = culturalPoints as CulturalPoint[];
  const trails = trailsData as Trail[];

  // Load discovered state from localStorage
  useEffect(() => {
    setDiscoveredIds(getDiscoveredIds());
  }, []);

  const handleSelectPoint = useCallback((point: CulturalPoint) => {
    setSelectedPoint(point);
    setRevealed(false);
    setProximityTriggered(false);
    setFlyTo({ lng: point.lng, lat: point.lat });
    setShowSearch(false);
  }, []);

  const handleReveal = useCallback(() => {
    if (!selectedPoint) return;
    setRevealed(true);
    const updated = markDiscovered(selectedPoint.id);
    setDiscoveredIds(new Set(updated));

    // Check if any trail is now complete
    if (selectedPoint.trail) {
      const trail = trails.find((t) => t.id === selectedPoint.trail);
      if (trail && trail.points.every((pid) => updated.has(pid))) {
        setBonusTrail(trail);
      }
    }
  }, [selectedPoint, trails]);

  const handleProximityTrigger = useCallback((point: CulturalPoint) => {
    if (!selectedPoint) {
      setSelectedPoint(point);
      setRevealed(false);
      setProximityTriggered(true);
      setFlyTo({ lng: point.lng, lat: point.lat });
    }
  }, [selectedPoint]);

  const handleUserPositionUpdate = useCallback((pos: { lat: number; lng: number }) => {
    setUserPosition(pos);
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedPoint(null);
    setRevealed(false);
    setProximityTriggered(false);
  }, []);

  // Trail info for selected point
  const trailInfo = useMemo(() => {
    if (!selectedPoint?.trail) return null;
    const trail = trails.find((t) => t.id === selectedPoint.trail);
    if (!trail) return null;
    const discovered = trail.points.filter((pid) => discoveredIds.has(pid)).length;
    return { title: trail.title, discovered, total: trail.points.length };
  }, [selectedPoint, trails, discoveredIds]);

  const secretsRemaining = points.length - discoveredIds.size;

  return (
    <main className="h-[100dvh] w-screen relative overflow-hidden">
      <Map
        points={points}
        onSelectPoint={handleSelectPoint}
        flyTo={flyTo}
        userPosition={userPosition}
        onUserPositionUpdate={handleUserPositionUpdate}
        discoveredIds={discoveredIds}
      />

      <ProximityEngine
        points={points}
        onTrigger={handleProximityTrigger}
        userPosition={userPosition}
      />

      {/* Search button — top left, subtle */}
      <button
        onClick={() => setShowSearch(true)}
        className="absolute top-12 left-4 z-30 px-4 py-2 rounded-xl font-sans text-xs font-medium transition-transform active:scale-95"
        style={{ backgroundColor: "rgba(26,26,26,0.8)", color: "#8a8078", backdropFilter: "blur(8px)" }}
      >
        Search secrets...
      </button>

      {/* Discovery counter — bottom center */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <p className="text-xs font-sans" style={{ color: "rgba(245,240,232,0.5)" }}>
          {discoveredIds.size === 0
            ? `${points.length} secrets nearby`
            : discoveredIds.size === points.length
            ? "Marrakech \u2014 fully decoded"
            : `${secretsRemaining} secrets remaining`}
        </p>
      </div>

      {/* Darija button — bottom left */}
      <button
        onClick={() => setShowDarija(true)}
        className="absolute bottom-12 left-4 z-30 w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shadow-lg transition-transform active:scale-95"
        style={{ backgroundColor: "#c4613a", color: "#faf6f1", fontFamily: "serif" }}
        aria-label="Open Darija phrases"
      >
        ض
      </button>

      {/* Cultural card */}
      {selectedPoint && (
        <CulturalCard
          point={selectedPoint}
          revealed={revealed}
          onReveal={handleReveal}
          onClose={handleCloseCard}
          trailInfo={trailInfo}
          proximityTriggered={proximityTriggered}
        />
      )}

      {/* Bonus trail completion card */}
      {bonusTrail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setBonusTrail(null)} />
          <div className="relative rounded-2xl p-6 max-w-sm w-full animate-fade-in" style={{ backgroundColor: "#faf6f1", color: "#1a1a1a" }}>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "#c4613a" }}>
              Trail Complete
            </p>
            <h3 className="font-serif text-xl font-semibold mb-3">{bonusTrail.title}</h3>
            <p className="font-sans text-sm leading-relaxed" style={{ color: "#3a3530" }}>
              {bonusTrail.bonus_card}
            </p>
            <button
              onClick={() => setBonusTrail(null)}
              className="mt-4 text-sm font-sans font-medium"
              style={{ color: "#c4613a" }}
            >
              Continue exploring &rarr;
            </button>
          </div>
        </div>
      )}

      {showDarija && <DarijaCard phrases={darijaData} onClose={() => setShowDarija(false)} />}
      {showSearch && <SearchBar points={points} onSelect={handleSelectPoint} onClose={() => setShowSearch(false)} />}
    </main>
  );
}
