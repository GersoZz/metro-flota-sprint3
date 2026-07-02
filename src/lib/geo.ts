// Funciones geometricas para trabajar con coordenadas de latitud y longitud.
// Se usan para medir distancias reales en metros sobre la superficie terrestre.

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6371000;

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

// Distancia de Haversine: mide los metros entre dos puntos sobre la esfera terrestre.
// Es mas precisa que una resta simple porque toma en cuenta la curvatura de la Tierra.
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Distancia de un punto al segmento formado por a y b, en metros.
// Sirve para saber que tan lejos esta un bus de un tramo de la ruta.
// Se proyecta el punto sobre el segmento usando coordenadas locales en metros.
export function distancePointToSegmentMeters(p: LatLng, a: LatLng, b: LatLng): number {
  // Convertimos a un plano local en metros tomando 'a' como origen.
  // La longitud se corrige por el coseno de la latitud para no deformar distancias.
  const latScale = EARTH_RADIUS_M * (Math.PI / 180);
  const lngScale = latScale * Math.cos(toRadians(a.lat));

  const ax = 0;
  const ay = 0;
  const bx = (b.lng - a.lng) * lngScale;
  const by = (b.lat - a.lat) * latScale;
  const px = (p.lng - a.lng) * lngScale;
  const py = (p.lat - a.lat) * latScale;

  const segLenSq = (bx - ax) ** 2 + (by - ay) ** 2;
  if (segLenSq === 0) {
    // a y b son el mismo punto, la distancia es al punto a.
    return Math.sqrt(px ** 2 + py ** 2);
  }

  // t indica en que parte del segmento cae la proyeccion (0 = a, 1 = b).
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / segLenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = ax + t * (bx - ax);
  const closestY = ay + t * (by - ay);

  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
}

// Distancia minima de un punto a una polilinea (lista ordenada de paradas).
// Recorre cada tramo y se queda con la distancia mas corta.
export function distanceToPolylineMeters(p: LatLng, line: LatLng[]): number {
  if (line.length === 0) return Infinity;
  if (line.length === 1) return haversineMeters(p, line[0]!);

  let min = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const d = distancePointToSegmentMeters(p, line[i]!, line[i + 1]!);
    if (d < min) min = d;
  }
  return min;
}
