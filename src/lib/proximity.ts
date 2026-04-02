export interface LatLng {
  lat: number;
  lng: number;
}

/** Haversine distance in metres between two lat/lng points */
export function distanceMetres(a: LatLng, b: LatLng): number {
  const R = 6371000; // Earth radius in metres
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

/** Check if a point was triggered recently (within 1 hour) */
export function wasRecentlyTriggered(pointId: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `triggered_${pointId}`;
  const ts = localStorage.getItem(key);
  if (!ts) return false;
  return Date.now() - parseInt(ts, 10) < COOLDOWN_MS;
}

/** Mark a point as triggered now */
export function markTriggered(pointId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`triggered_${pointId}`, Date.now().toString());
}
