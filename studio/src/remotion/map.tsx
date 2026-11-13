import { cupertino, launchCountries } from "../content/iphone-duo";
import landData from "./land-110m.json";

type Position = [number, number];
type Geometry = { type: string; coordinates: Position[][] | Position[][][] };

export const MAP_W = 1180;
export const MAP_H = 540;

export function project(lon: number, lat: number, width = MAP_W, height = MAP_H): [number, number] {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

function rings(geometry: Geometry): Position[][] {
  if (geometry.type === "Polygon") return geometry.coordinates as Position[][];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates as Position[][][]).flat();
  return [];
}

function landPath(): string {
  const features = (landData as unknown as { features: { geometry: Geometry }[] }).features;
  return features
    .flatMap((feature) => rings(feature.geometry))
    .map((ring) => {
      const drawn = ring.map((point, index) => {
        const [x, y] = project(point[0], point[1]);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      });
      return `${drawn.join(" ")} Z`;
    })
    .join(" ");
}

const LAND = landPath();

export function WorldMap({ frame }: { frame: number }) {
  const visible = Math.min(launchCountries.length, Math.floor(frame / 4));
  return (
    <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
      <rect width={MAP_W} height={MAP_H} rx="24" fill="#d7ecf3" />
      <path d={LAND} fill="#efe6d4" stroke="#1c1915" strokeWidth="1.2" />
      {launchCountries.slice(0, visible).map((country) => {
        const [x, y] = project(country.lon, country.lat);
        return <circle key={country.name} cx={x} cy={y} r="7" fill="#ef5d2a" stroke="#1c1915" strokeWidth="2" />;
      })}
      {frame > 8
        ? (() => {
            const [x, y] = project(cupertino.lon, cupertino.lat);
            return <polygon points={`${x},${y - 12} ${x + 8},${y + 8} ${x - 8},${y + 8}`} fill="#e2b43a" stroke="#1c1915" strokeWidth="2" />;
          })()
        : null}
    </svg>
  );
}
