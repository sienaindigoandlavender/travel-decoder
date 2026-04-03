"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { CulturalPoint } from "./CulturalCard";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const MARRAKECH_CENTER: [number, number] = [-7.9891, 31.6295];
const DEFAULT_ZOOM = 14.5;

interface MapProps {
  points: CulturalPoint[];
  onSelectPoint: (point: CulturalPoint) => void;
  flyTo?: { lng: number; lat: number } | null;
  userPosition: { lat: number; lng: number } | null;
  onUserPositionUpdate: (pos: { lat: number; lng: number }) => void;
  discoveredIds: Set<string>;
}

export default function Map({
  points,
  onSelectPoint,
  flyTo,
  userPosition,
  onUserPositionUpdate,
  discoveredIds,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<globalThis.Map<string, HTMLDivElement>>(new globalThis.Map());
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize map — always dark style
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: MARRAKECH_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    m.on("load", () => {
      points.forEach((point) => {
        const el = document.createElement("div");
        el.className = "ember-marker";
        const discovered = discoveredIds.has(point.id);
        el.innerHTML = `
          <div class="ember-dot ${discovered ? "discovered" : ""}">
            <div class="ember-glow"></div>
            <div class="ember-core"></div>
          </div>
        `;
        el.style.cursor = "pointer";

        el.addEventListener("click", () => {
          onSelectPoint(point);
          m.flyTo({ center: [point.lng, point.lat], zoom: 16, duration: 800 });
        });

        markersRef.current.set(point.id, el);

        new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([point.lng, point.lat])
          .addTo(m);
      });
    });

    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker states when discoveredIds changes
  useEffect(() => {
    markersRef.current.forEach((el, id) => {
      const dot = el.querySelector(".ember-dot");
      if (!dot) return;
      if (discoveredIds.has(id)) {
        dot.classList.add("discovered");
      } else {
        dot.classList.remove("discovered");
      }
    });
  }, [discoveredIds]);

  // Watch user position
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => onUserPositionUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn("Geolocation error:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [onUserPositionUpdate]);

  // Update user marker — soft warm white dot
  useEffect(() => {
    if (!map.current || !userPosition) return;
    if (!userMarker.current) {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 14px; height: 14px; border-radius: 50%;
        background: #f5f0e8; border: 2px solid rgba(245,240,232,0.4);
        box-shadow: 0 0 8px rgba(245,240,232,0.3);
      `;
      userMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userPosition.lng, userPosition.lat])
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat([userPosition.lng, userPosition.lat]);
    }
  }, [userPosition]);

  // Fly to
  const handleFlyTo = useCallback(() => {
    if (!map.current || !flyTo) return;
    map.current.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: 16, duration: 800 });
  }, [flyTo]);

  useEffect(() => { handleFlyTo(); }, [handleFlyTo]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Online/offline indicator */}
      <div className="absolute top-12 right-4 z-10">
        <div
          className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500/60" : "bg-gray-500/60"}`}
          title={isOnline ? "Online" : "Offline"}
        />
      </div>

      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#1a1a1a" }}>
          <div className="text-center px-8">
            <p className="font-serif text-xl mb-2" style={{ color: "#f5f0e8" }}>Map requires setup</p>
            <p className="text-sm" style={{ color: "#666" }}>Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</p>
          </div>
        </div>
      )}
    </div>
  );
}
