export interface LatLng {
  lat: number;
  lng: number;
}

/** Haversine distance in metres between two lat/lng points */
export function distanceMetres(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export function wasRecentlyTriggered(pointId: string): boolean {
  if (typeof window === "undefined") return false;
  const ts = localStorage.getItem(`triggered_${pointId}`);
  if (!ts) return false;
  return Date.now() - parseInt(ts, 10) < COOLDOWN_MS;
}

export function markTriggered(pointId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`triggered_${pointId}`, Date.now().toString());
}

// ── Discovery tracking ──

const DISCOVERED_KEY = "discovered_points";

export function getDiscoveredIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(DISCOVERED_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function markDiscovered(pointId: string): Set<string> {
  const ids = getDiscoveredIds();
  ids.add(pointId);
  localStorage.setItem(DISCOVERED_KEY, JSON.stringify(Array.from(ids)));
  return ids;
}

export function isDiscovered(pointId: string): boolean {
  return getDiscoveredIds().has(pointId);
}
