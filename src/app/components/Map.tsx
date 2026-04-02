"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { CulturalPoint } from "./CulturalCard";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const CATEGORY_COLORS: Record<string, string> = {
  landmark: "#C45D3E",
  craft: "#8B6914",
  religion: "#2E6B4F",
  food: "#B85C2F",
  architecture: "#6B4C8A",
  market: "#C4823E",
  history: "#7A3B2E",
  nature: "#3E8A5C",
};

const MARRAKECH_CENTER: [number, number] = [-7.9891, 31.6295];
const DEFAULT_ZOOM = 14.5;

interface MapProps {
  points: CulturalPoint[];
  onSelectPoint: (point: CulturalPoint) => void;
  flyTo?: { lng: number; lat: number } | null;
  userPosition: { lat: number; lng: number } | null;
  onUserPositionUpdate: (pos: { lat: number; lng: number }) => void;
}

export default function Map({
  points,
  onSelectPoint,
  flyTo,
  userPosition,
  onUserPositionUpdate,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Track online status
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) {
      console.warn("Mapbox token not set. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: MARRAKECH_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    m.on("load", () => {
      // Add cultural point markers
      points.forEach((point) => {
        const el = document.createElement("div");
        el.className = "cultural-marker";
        el.style.cssText = `
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${CATEGORY_COLORS[point.category] || "#C45D3E"};
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        `;
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.4)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
        });
        el.addEventListener("click", () => {
          onSelectPoint(point);
          m.flyTo({
            center: [point.lng, point.lat],
            zoom: 16,
            duration: 800,
          });
        });

        new mapboxgl.Marker({ element: el })
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

  // Watch user position
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onUserPositionUpdate({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.warn("Geolocation error:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onUserPositionUpdate]);

  // Update user marker
  useEffect(() => {
    if (!map.current || !userPosition) return;

    if (!userMarker.current) {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #4285F4;
        border: 3px solid white;
        box-shadow: 0 0 0 2px rgba(66,133,244,0.3), 0 1px 4px rgba(0,0,0,0.3);
      `;
      userMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userPosition.lng, userPosition.lat])
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat([userPosition.lng, userPosition.lat]);
    }
  }, [userPosition]);

  // Fly to selected point
  const handleFlyTo = useCallback(() => {
    if (!map.current || !flyTo) return;
    map.current.flyTo({
      center: [flyTo.lng, flyTo.lat],
      zoom: 16,
      duration: 800,
    });
  }, [flyTo]);

  useEffect(() => {
    handleFlyTo();
  }, [handleFlyTo]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Online/offline indicator */}
      <div className="absolute top-12 right-4 z-10">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isOnline ? "bg-green-400" : "bg-gray-400"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      </div>

      {/* Mapbox token missing warning */}
      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center px-8">
            <p className="font-serif text-xl mb-2">Map requires setup</p>
            <p className="text-sm text-gray-500">
              Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
