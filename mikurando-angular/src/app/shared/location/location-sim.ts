export type GeoPoint = { lat: number; lng: number };

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371; //in km
  const dLat = deg2rad(b.lat - a.lat);
  const dLng = deg2rad(b.lng - a.lng);

  const sa = Math.sin(dLat / 2);
  const sb = Math.sin(dLng / 2);

  const h = sa * sa + Math.cos(deg2rad(a.lat)) * Math.cos(deg2rad(b.lat)) * sb * sb;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export function estimateEtaMinutes(distanceKmValue: number): number {
  //simulate: 18 km/h avg  + 7 min handlingtime
  const avgSpeedKmh = 18;
  const baseHandlingMin = 7;
  const travelMin = (distanceKmValue / avgSpeedKmh) * 60;
  return Math.max(5, Math.round(baseHandlingMin + travelMin));
}

//zone simulation: center around zone code 
export function zoneCenter(zoneCode: string): GeoPoint {
  const z = zoneCode.trim().toUpperCase();
  //seed-map
  const letter = z[0] ?? 'A';
  const num = Number(z.slice(1) || '1');

  //center around vienna 
  const base: GeoPoint = { lat: 48.2082, lng: 16.3738 };

  const letterOffset = (letter.charCodeAt(0) - 'A'.charCodeAt(0)) * 0.02;
  const numOffset = (Math.max(1, Math.min(9, num)) - 1) * 0.015;

  return { lat: base.lat + letterOffset, lng: base.lng + numOffset };
}

export function isPointInZone(point: GeoPoint, zoneCode: string): boolean {
  //simulate 4.5 km radius
  const center = zoneCenter(zoneCode);
  return distanceKm(point, center) <= 4.5;
}

export function validateDeliveryZone(point: GeoPoint, allowedZones: string[]): boolean {
  return allowedZones.some((z) => isPointInZone(point, z));
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
