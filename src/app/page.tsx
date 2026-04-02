"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import CulturalCard from "./components/CulturalCard";
import type { CulturalPoint } from "./components/CulturalCard";
import ProximityEngine from "./components/ProximityEngine";
import DarijaCard from "./components/DarijaCard";
import SearchBar from "./components/SearchBar";
import { distanceMetres } from "@/lib/proximity";
import { registerServiceWorker } from "@/lib/offline";
import culturalPoints from "@/data/marrakech.json";
import darijaData from "@/data/darija-basics.json";

// Dynamic import for Map to avoid SSR issues with mapbox-gl
const Map = dynamic(() => import("./components/Map"), { ssr: false });

// Register service worker on load
if (typeof window !== "undefined") {
  registerServiceWorker();
}

export default function Home() {
  const [selectedPoint, setSelectedPoint] = useState<CulturalPoint | null>(
    null
  );
  const [showDarija, setShowDarija] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lng: number; lat: number } | null>(
    null
  );
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const points = culturalPoints as CulturalPoint[];

  const handleSelectPoint = useCallback(
    (point: CulturalPoint) => {
      setSelectedPoint(point);
      setFlyTo({ lng: point.lng, lat: point.lat });
      setShowSearch(false);
    },
    []
  );

  const handleProximityTrigger = useCallback(
    (point: CulturalPoint) => {
      if (!selectedPoint) {
        setSelectedPoint(point);
        setFlyTo({ lng: point.lng, lat: point.lat });
      }
    },
    [selectedPoint]
  );

  const handleUserPositionUpdate = useCallback(
    (pos: { lat: number; lng: number }) => {
      setUserPosition(pos);
    },
    []
  );

  // Nearby points within 200m of selected point
  const nearbyPoints = useMemo(() => {
    if (!selectedPoint) return [];
    return points
      .filter(
        (p) =>
          p.id !== selectedPoint.id &&
          distanceMetres(selectedPoint, p) <= 200
      )
      .sort(
        (a, b) =>
          distanceMetres(selectedPoint, a) -
          distanceMetres(selectedPoint, b)
      )
      .slice(0, 5);
  }, [selectedPoint, points]);

  return (
    <main className="h-[100dvh] w-screen relative overflow-hidden">
      {/* Full-screen map */}
      <Map
        points={points}
        onSelectPoint={handleSelectPoint}
        flyTo={flyTo}
        userPosition={userPosition}
        onUserPositionUpdate={handleUserPositionUpdate}
      />

      {/* Proximity detection */}
      <ProximityEngine
        points={points}
        onTrigger={handleProximityTrigger}
        userPosition={userPosition}
      />

      {/* Search button */}
      <button
        onClick={() => setShowSearch(true)}
        className="absolute top-12 left-4 z-30 px-4 py-2.5 rounded-xl font-sans text-sm font-medium shadow-lg transition-transform active:scale-95"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        Search places...
      </button>

      {/* Darija floating button */}
      <button
        onClick={() => setShowDarija(true)}
        className="absolute bottom-6 left-4 z-30 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg bg-terracotta transition-transform active:scale-95"
        aria-label="Open Darija phrases"
        style={{ fontFamily: "serif" }}
      >
        ض
      </button>

      {/* Cultural card */}
      {selectedPoint && (
        <CulturalCard
          point={selectedPoint}
          nearby={nearbyPoints}
          onClose={() => setSelectedPoint(null)}
          onSelectPoint={handleSelectPoint}
        />
      )}

      {/* Darija panel */}
      {showDarija && (
        <DarijaCard
          phrases={darijaData}
          onClose={() => setShowDarija(false)}
        />
      )}

      {/* Search overlay */}
      {showSearch && (
        <SearchBar
          points={points}
          onSelect={handleSelectPoint}
          onClose={() => setShowSearch(false)}
        />
      )}
    </main>
  );
}
