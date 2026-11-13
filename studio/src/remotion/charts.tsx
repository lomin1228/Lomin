import { scaleLinear } from "d3-scale";
import { arc, pie } from "d3-shape";

const ink = "#1c1915";

export function BatteryChart({ frame }: { frame: number }) {
  const grow = Math.max(0, Math.min(1, frame / 28));
  const x = scaleLinear().domain([0, 44]).range([0, 620]);
  const rows = [
    { label: "Outer display, video", hours: 44, fill: "#1d6b5f" },
    { label: "Inner display, video", hours: 31, fill: "#2d5f9a" },
  ];
  return (
    <svg width="980" height="280" role="img" aria-label="Video playback hours from Apple's August 2026 test">
      {rows.map((row, index) => {
        const width = x(row.hours * grow);
        const y = 20 + index * 120;
        return (
          <g key={row.label}>
            <text x="250" y={y + 48} textAnchor="end" fontFamily="Nunito, sans-serif" fontSize="28" fill={ink}>
              {row.label}
            </text>
            <rect x="270" y={y} width={width} height="72" rx="14" fill={row.fill} />
            <text
              x={width > 110 ? 254 + width : 286 + width}
              y={y + 48}
              textAnchor={width > 110 ? "end" : "start"}
              fontFamily="Fredoka, sans-serif"
              fontSize="36"
              fill={width > 110 ? "#fffaf3" : ink}
            >
              {row.hours}h
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ShareDonut({ frame }: { frame: number }) {
  const reveal = Math.max(0.04, Math.min(1, frame / 30));
  const slices = [
    { name: "Foldables, 2025", value: 1.6 * reveal },
    { name: "Remainder", value: 100 - 1.6 * reveal },
  ];
  const layout = pie<(typeof slices)[number]>().sort(null).value((slice) => slice.value);
  const draw = arc<(typeof slices)[number] & { startAngle: number; endAngle: number }>()
    .innerRadius(100)
    .outerRadius(176);
  const arcs = layout(slices);
  return (
    <svg width="420" height="420" viewBox="-210 -210 420 420">
      {arcs.map((slice) => (
        <path
          key={slice.data.name}
          d={draw(slice as never) ?? ""}
          fill={slice.data.name.startsWith("Foldables") ? "#ef5d2a" : "#efe6d4"}
          stroke={ink}
          strokeWidth="5"
        />
      ))}
      <text textAnchor="middle" y="16" fontFamily="Fredoka, sans-serif" fontSize="58" fill={ink}>
        1.6%
      </text>
    </svg>
  );
}
