export const R = 46;

// Six blades drawn from one hexagon: `open` 0 = shut, 1 = wide open.
export function aperturePaths(open: number) {
  const r = 6 + 30 * open;
  const turn = (1 - open) * 1.1 + 0.3;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = turn + (i * Math.PI) / 3;
    return [r * Math.cos(a), r * Math.sin(a)] as const;
  });
  const blades = hex
    .map(([x, y], i) => {
      const [nx, ny] = hex[(i + 1) % 6];
      const len = Math.hypot(nx - x, ny - y);
      const [dx, dy] = [(nx - x) / len, (ny - y) / len];
      const b = x * dx + y * dy;
      const s = -b + Math.sqrt(b * b - (x * x + y * y) + R * R);
      return `M${x.toFixed(2)} ${y.toFixed(2)}L${(x + dx * s).toFixed(2)} ${(y + dy * s).toFixed(2)}`;
    })
    .join("");
  return { hole: hex.map((p) => p.map((n) => n.toFixed(2)).join(",")).join(" "), blades };
}
