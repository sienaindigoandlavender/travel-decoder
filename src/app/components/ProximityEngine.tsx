"use client";

import { useEffect, useRef } from "react";
import type { CulturalPoint } from "./CulturalCard";
import {
  distanceMetres,
  wasRecentlyTriggered,
  markTriggered,
} from "@/lib/proximity";

const PROXIMITY_THRESHOLD = 80; // metres

interface ProximityEngineProps {
  points: CulturalPoint[];
  onTrigger: (point: CulturalPoint) => void;
  userPosition: { lat: number; lng: number } | null;
}

export default function ProximityEngine({
  points,
  onTrigger,
  userPosition,
}: ProximityEngineProps) {
  const lastTriggered = useRef<string | null>(null);

  useEffect(() => {
    if (!userPosition) return;

    let closest: CulturalPoint | null = null;
    let closestDist = Infinity;

    for (const point of points) {
      const dist = distanceMetres(userPosition, point);
      if (
        dist < PROXIMITY_THRESHOLD &&
        dist < closestDist &&
        !wasRecentlyTriggered(point.id)
      ) {
        closest = point;
        closestDist = dist;
      }
    }

    if (closest && closest.id !== lastTriggered.current) {
      lastTriggered.current = closest.id;
      markTriggered(closest.id);
      // Gentle vibration
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      onTrigger(closest);
    }
  }, [userPosition, points, onTrigger]);

  return null;
}
