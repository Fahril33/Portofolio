type Point = [number, number, number, number];
type Color = [number, number, number];

interface Projection {
  cx: number;
  cy: number;
  size: number;
  sx: number;
  cxr: number;
  sy: number;
  cyr: number;
  sz: number;
  cz: number;
}

interface SurfaceSegment {
  points: Point[];
  depth: number;
  color: string;
  alpha: number;
  width: number;
}

export interface AboutKineticScene {
  draw(time: number, morph: number[], pointerX: number, pointerY: number, layout?: number): void;
  resize(width: number, height: number): void;
  setColors(colors: string[]): void;
}

const TAU = Math.PI * 2;
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
const fraction = (value: number): number => value - Math.floor(value);
const ease = (value: number): number => {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
};
const noise = (value: number): number =>
  fraction(Math.sin(value * 127.1 + 17.7) * 43758.5453);

const rgb = (value: string): Color => {
  const values = (value.match(/-?[\d.]+/g) ?? []).map(Number);
  const multiplier = value.startsWith("color(") ? 255 : 1;
  return [
    (values[0] ?? 0) * multiplier,
    (values[1] ?? 0) * multiplier,
    (values[2] ?? 0) * multiplier,
  ];
};

const mix = (a: Color, b: Color, amount: number): Color => [
  a[0] + (b[0] - a[0]) * amount,
  a[1] + (b[1] - a[1]) * amount,
  a[2] + (b[2] - a[2]) * amount,
];

const colorString = (color: number[]): string =>
  `rgb(${color.map(Math.round).join(",")})`;

/** Draws the reference's four materials; the caller owns time and animation scheduling. */
export function createAboutKineticScene(
  canvas: HTMLCanvasElement,
  initialColors: string[]
): AboutKineticScene {
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) {
    return { draw: () => {}, resize: () => {}, setColors: () => {} };
  }
  const context: CanvasRenderingContext2D = canvasContext;

  let width = 700;
  let height = 510;
  let colors = initialColors.slice();
  let palette = colors.map(rgb);
  let morph = [1, 0, 0, 0];
  let layout = 0;
  let pointerX = 0;
  let pointerY = 0;
  let projection: Projection;

  const neuralSeeds: Array<{ u: number; v: number }> = [];
  const neuralEdges: Array<[number, number]> = [];
  for (let ring = 0; ring < 6; ring++) {
    for (let cell = 0; cell < 30; cell++) {
      const id = ring * 30 + cell;
      neuralSeeds.push({
        u: ((cell + 0.28 * (noise(id) - 0.5)) / 30) * TAU,
        v: ((ring + 0.34 * (noise(id + 300) - 0.5)) / 6) * TAU,
      });
      neuralEdges.push([id, ring * 30 + ((cell + 1) % 30)]);
      if ((cell + ring) % 2 === 0) {
        neuralEdges.push([id, ((ring + 1) % 6) * 30 + cell]);
      }
      if ((cell + ring) % 5 === 0) {
        neuralEdges.push([id, ((ring + 1) % 6) * 30 + ((cell + 1) % 30)]);
      }
    }
  }

  const brushSeeds = Array.from({ length: 9 }, (_, i) => ({
    u: noise(i + 40) * TAU,
    v: noise(i + 130) * TAU,
    offset: noise(i + 500),
    duration: 2.8 + noise(i + 600) * 1.4,
    length: 1.15 + noise(i + 700) * 1.6,
    color: [2, 7, 2, 6, 8, 2, 7, 6, 2][i],
    width: 4 + noise(i + 800) * 5,
  }));

  // Fixed seeds keep scroll reversal stable and avoid per-frame random allocations.
  const ambientSeeds = Array.from({ length: 78 }, (_, index) => ({
    x: 0.04 + noise(index + 910) * 0.92,
    y: 0.10 + noise(index + 1020) * 0.80,
    phase: noise(index + 1130) * TAU,
    speed: 0.14 + noise(index + 1240) * 0.18,
    radius: 0.8 + noise(index + 1350) * 1.5,
  }));
  const ambientLinks = ambientSeeds.map((seed, index) => {
    let nearest = -1;
    let distance = 0.18;
    for (let candidate = 0; candidate < index; candidate++) {
      const other = ambientSeeds[candidate];
      const nextDistance = Math.hypot(seed.x - other.x, seed.y - other.y);
      if (nextDistance < distance) { nearest = candidate; distance = nextDistance; }
    }
    return nearest;
  });
  const ambientPoints = ambientSeeds.map((): Point => [0, 0, 0, 1]);

  function drawIntroParticles(time: number): void {
    const intro = (1 - layout) ** 2;
    if (intro < 0.005) return;
    // Fewer particles on small canvases; all effects share this bounded field.
    const count = width < 600 ? 42 : ambientSeeds.length;
    const imagine = morph[0] * intro;
    const design = morph[1] * intro;
    const code = morph[2] * intro;
    for (let index = 0; index < count; index++) {
      const seed = ambientSeeds[index];
      const point = ambientPoints[index];
      point[0] = seed.x * width + Math.sin(time * seed.speed + seed.phase) * Math.min(width * 0.025, 24);
      point[1] = seed.y * height + Math.cos(time * seed.speed * 0.8 + seed.phase) * Math.min(height * 0.03, 20);
    }
    context.font = '10px ui-monospace, monospace';
    for (let index = 0; index < count; index++) {
      const seed = ambientSeeds[index];
      const point = ambientPoints[index];
      // Leave the center quieter so the headline and main silhouette stay legible.
      const centerDistance = Math.hypot((seed.x - 0.5) * 2, (seed.y - 0.48) * 2);
      const breathing = 0.55 + 0.45 * Math.sin(time * 0.7 + seed.phase) ** 2;
      const alpha = (0.16 + 0.3 * clamp(centerDistance, 0, 1)) * breathing;
      if (imagine > 0.005) {
        const neighbor = ambientLinks[index];
        if (neighbor >= 0) {
          const other = ambientPoints[neighbor];
          stroke([point, other], colors[0], imagine * alpha * 0.32, 0.65);
          if (index % 3 === 0) {
            const travel = fraction(time * 0.22 + seed.phase);
            dot([point[0] + (other[0] - point[0]) * travel, point[1] + (other[1] - point[1]) * travel, 0, 1],
              colors[1], 1.3, imagine * alpha * 0.9, true);
          }
        }
        dot(point, colors[index % 4 === 0 ? 1 : 0], seed.radius, imagine * alpha, index % 5 === 0);
      }
      if (design > 0.005) {
        const tone = colors[[2, 6, 7, 8][index % 4]];
        const life = Math.sin(fraction(time * 0.11 + seed.phase) * Math.PI);
        dot(point, tone, seed.radius * (0.8 + life * 0.6), design * alpha * life);
        if (index % 5 === 0) {
          const angle = seed.phase + time * 0.07;
          const length = 5 + life * 9;
          stroke([point, [point[0] + Math.cos(angle) * length, point[1] + Math.sin(angle) * length, 0, 1]],
            tone, design * alpha * life * 0.7, seed.radius * 1.4);
        }
      }
      if (code > 0.005) {
        const travel = fraction(time * 0.06 + seed.phase);
        const x = Math.round(seed.x * width / 24) * 24;
        const y = height * (0.1 + travel * 0.8);
        const fade = Math.sin(travel * Math.PI);
        context.fillStyle = colors[3];
        context.globalAlpha = code * alpha * fade;
        if (index % 7 === 0) {
          context.fillText(['0', '1', '{', '}'][index % 4], x, y);
        } else {
          context.fillRect(x, y, seed.radius, seed.radius * 1.5);
        }
        if (index % 3 === 0) {
          stroke([[x, y - 14, 0, 1], [x, y - 3, 0, 1]], colors[3], code * alpha * fade * 0.35, 0.7);
        }
      }
    }
  }

  function prepareProjection(time: number): void {
    const [, precise, digital] = morph;
    const together = layout;
    // Rotation stays continuous when the material or shape changes.
    const ax = 0.48 + 0.16 * Math.sin(time * 0.23) + pointerY;
    const ay = time * 0.32 + 0.24 + pointerX;
    const az = -0.22 + 0.15 * Math.sin(time * 0.19) + 0.08 * precise - 0.06 * digital;
    const desktopScale = Math.min(clamp(width / 884, 1, 1.36), Math.max(1, height / 600));
    const base = Math.min(width * 0.34, 152 * desktopScale) * (1 - 0.11 * precise - 0.13 * digital);
    const mobile = window.innerWidth <= 700;
    const finalSize = mobile
      ? Math.min(width * 0.27, height * 0.17, 150)
      : Math.min(width * 0.17, height * 0.26, 230);
    projection = {
      cx: width * (0.51 * (1 - together) + (mobile ? 0.5 : 0.73) * together),
      cy: height * (0.47 * (1 - together) + (mobile ? 0.68 : 0.44) * together),
      size: base * (1 - together) + finalSize * together,
      sx: Math.sin(ax),
      cxr: Math.cos(ax),
      sy: Math.sin(ay),
      cyr: Math.cos(ay),
      sz: Math.sin(az),
      cz: Math.cos(az),
    };
  }

  function position(u: number, v: number, time: number, lift = 0): Point {
    const [organic, precise, digital, together] = morph;
    const cu = Math.cos(u);
    const su = Math.sin(u);
    const cv = Math.cos(v);
    const sv = Math.sin(v);
    const radius = 1 + 0.105 * Math.sin(3 * u + time * 0.35) + 0.045 * Math.cos(5 * u - time * 0.23);
    const tube = 0.19 + 0.04 * Math.sin(2 * u + time * 0.4);
    const squareX = Math.sign(cu) * Math.pow(Math.abs(cu), 0.43);
    const squareY = Math.sign(su) * Math.pow(Math.abs(su), 0.43);
    let x =
      (radius + tube * cv) * cu * organic +
      (1 + 0.16 * cv) * squareX * precise +
      (1 + 0.19 * cv) * squareX * digital +
      (1 + 0.23 * cv) * cu * together;
    let y =
      (radius + tube * cv) * su * organic +
      (1 + 0.16 * cv) * squareY * precise +
      (1 + 0.19 * cv) * squareY * digital +
      (1 + 0.23 * cv) * su * together;
    let z =
      (0.21 * Math.sin(2 * u + time * 0.24) + tube * sv) * organic +
      0.16 * sv * precise +
      (0.25 * sv + 0.04 * Math.sin(4 * u)) * digital +
      (0.27 * Math.sin(3 * u) + 0.23 * sv) * together;
    x += cu * lift;
    y += su * lift;
    z += sv * lift * 0.7;
    const p = projection;
    const yy = y * p.cxr - z * p.sx;
    const zz = y * p.sx + z * p.cxr;
    const xx = x * p.cyr + zz * p.sy;
    const depth = -x * p.sy + zz * p.cyr;
    const rx = xx * p.cz - yy * p.sz;
    const ry = xx * p.sz + yy * p.cz;
    const perspective = 5.6 / (5.6 + depth);
    return [
      p.cx + rx * p.size * perspective,
      p.cy + ry * p.size * perspective,
      depth,
      perspective,
    ];
  }

  function depthOpacity(point: number[]): number {
    return clamp(0.7 - point[2] * 0.3, 0.2, 1);
  }

  function materialColor(v: number, u: number): string {
    const dream = mix(palette[0], palette[1], 0.5 + 0.5 * Math.sin(v + u));
    const finalA = mix(palette[0], palette[2], clamp((Math.sin(u + v * 0.2) + 1) * 0.7, 0, 1));
    const finalColor = mix(finalA, palette[3], clamp(Math.cos(u - v * 0.3) * 0.8, 0, 1));
    return colorString(dream.map((value, i) =>
      value * morph[0] + palette[2][i] * morph[1] + palette[3][i] * morph[2] + finalColor[i] * morph[3]
    ));
  }

  function stroke(points: Point[], color: string, alpha: number, lineWidth = 1): void {
    if (points.length < 2 || alpha < 0.001) return;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.globalAlpha = clamp(alpha, 0, 1);
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i][0], points[i][1]);
    }
    context.stroke();
  }

  function dot(point: Point, color: string, radius: number, alpha: number, halo = false): void {
    if (alpha < 0.002) return;
    context.fillStyle = color;
    if (halo) {
      context.globalAlpha = alpha * 0.065;
      context.beginPath();
      context.arc(point[0], point[1], radius * 4, 0, TAU);
      context.fill();
    }
    context.globalAlpha = clamp(alpha, 0, 1);
    context.beginPath();
    context.arc(point[0], point[1], radius, 0, TAU);
    context.fill();
  }

  function drawBackground(time: number): void {
    context.strokeStyle = colors[5];
    context.lineWidth = 0.6;
    context.globalAlpha = 0.5 * morph[1] + 0.22 * morph[2];
    const cell = width < 450 ? 38 : 46;
    context.beginPath();
    for (let x = (width / 2) % cell; x < width; x += cell) {
      context.moveTo(x, 75);
      context.lineTo(x, height - 85);
    }
    for (let y = 75; y < height - 85; y += cell) {
      context.moveTo(18, y);
      context.lineTo(width - 18, y);
    }
    context.stroke();
    const align = morph[1] + morph[2];
    for (let i = 0; i < 54; i++) {
      const baseX = (((i * 163.321) % 997) / 997) * width;
      const baseY = 90 + (((i * 91.277) % 401) / 401) * (height - 200);
      const x = (baseX + Math.sin(time * 0.18 + i * 1.9) * 8) * (1 - align) + Math.round(baseX / cell) * cell * align;
      const y = (baseY + Math.cos(time * 0.21 + i * 0.8) * 7) * (1 - align) + (Math.round((baseY - 75) / cell) * cell + 75) * align;
      context.globalAlpha = (0.17 + 0.15 * Math.sin(i * 2.9 + time * 0.3)) * (1 - 0.55 * morph[3]);
      context.fillStyle = colors[4];
      context.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
    }
  }

  function drawSurface(time: number): void {
    const count = 32;
    const samples = 96;
    const segments: SurfaceSegment[] = [];
    for (let j = 0; j < count; j++) {
      const v = (j / count) * TAU;
      const points: Point[] = [];
      for (let i = 0; i <= samples; i++) points.push(position((i / samples) * TAU, v, time));
      const sparse = j % 3 === 0 ? 1 : 1 - 0.88 * morph[2];
      const alpha = (0.21 * morph[0] + 0.18 * morph[1] + 0.32 * morph[2] + 0.28 * morph[3]) * sparse;
      const color = materialColor(v, (j / count) * 3);
      for (let start = 0; start < samples; start += 12) {
        const piece = points.slice(start, start + 13);
        const midpoint = piece[6];
        segments.push({ points: piece, depth: midpoint[2], color, alpha: alpha * depthOpacity(midpoint), width: 0.7 });
      }
    }
    segments.sort((a, b) => b.depth - a.depth);
    segments.forEach(segment => stroke(segment.points, segment.color, segment.alpha, segment.width));
    // Luminous rails keep the silhouette readable through each material.
    for (let j = 0; j < 3; j++) {
      const v = j * 2.1 + time * 0.08;
      const points: Point[] = [];
      for (let i = 0; i <= 96; i++) points.push(position((i / 96) * TAU, v, time));
      stroke(points, materialColor(v, j * 2), 0.37 - 0.15 * morph[2], 1);
    }
  }

  function drawNeural(time: number): void {
    const amount = morph[0] + 0.25 * morph[1] + 0.4 * morph[3];
    if (amount < 0.005) return;
    const nodes = neuralSeeds.map(seed => position(seed.u, seed.v, time, 0.01));
    for (let i = 0; i < neuralEdges.length; i++) {
      const [a, b] = neuralEdges[i];
      const midpoint = [0, 0, (nodes[a][2] + nodes[b][2]) * 0.5];
      stroke([nodes[a], nodes[b]], colors[i % 3 === 0 ? 1 : 0], amount * 0.3 * depthOpacity(midpoint), 0.65);
    }
    const order = nodes.map((point, index) => ({ point, index })).sort((a, b) => b.point[2] - a.point[2]);
    for (const { point, index } of order) {
      const activation = Math.pow(0.5 + 0.5 * Math.sin(time * 2.2 - neuralSeeds[index].u * 2 - neuralSeeds[index].v), 10);
      const depth = depthOpacity(point);
      dot(point, colors[index % 4 === 0 ? 1 : 0], (0.8 + activation * 1.2) * point[3], amount * (0.38 + activation * 0.6) * depth, activation > 0.3);
    }
    // Signals travel along actual connections on the rotating surface.
    for (let k = 0; k < 12; k++) {
      const clock = time * 0.65 + k * 31.73;
      const edge = neuralEdges[Math.floor(clock) % neuralEdges.length];
      const progress = fraction(clock);
      const a = neuralSeeds[edge[0]];
      const b = neuralSeeds[edge[1]];
      const du = ((b.u - a.u + Math.PI * 3) % TAU) - Math.PI;
      const dv = ((b.v - a.v + Math.PI * 3) % TAU) - Math.PI;
      const point = position(a.u + du * progress, a.v + dv * progress, time, 0.017);
      dot(point, colors[k % 2], 1.9 * point[3], amount * 0.8 * Math.sin(Math.PI * progress) * depthOpacity(point), true);
    }
  }

  function drawPaint(time: number): void {
    const amount = morph[1] + 0.35 * morph[3];
    if (amount < 0.005) return;
    const scale = clamp(projection.size / 150, 0.45, 1);
    for (let k = 0; k < brushSeeds.length; k++) {
      const seed = brushSeeds[k];
      const age = fraction(time / seed.duration + seed.offset);
      const reveal = ease(age / 0.4);
      const erase = ease((age - 0.57) / 0.43);
      const envelope = ease(age / 0.09) * (1 - ease((age - 0.65) / 0.35)) * amount;
      if (envelope < 0.006) continue;
      const head = seed.length * reveal;
      const tail = seed.length * erase;
      const tone = colors[seed.color];
      const points: Point[] = [];
      for (let j = 0; j <= 36; j++) {
        const progress = j / 36;
        const u = seed.u + tail + (head - tail) * progress;
        points.push(position(u, seed.v + 0.17 * Math.sin(u * 2 + k), time, 0.02));
      }
      const depth = depthOpacity(points[18]);
      // Wet pigment and individual bristles follow the same 3D surface.
      stroke(points, tone, envelope * 0.17 * depth, seed.width * scale);
      for (let bristle = 0; bristle < 7; bristle++) {
        const offset = (bristle - 3) * 0.043;
        const strip: Point[] = [];
        for (let j = 0; j <= 28; j++) {
          const progress = j / 28;
          const u = seed.u + tail + (head - tail) * progress;
          const rough = 0.012 * Math.sin(u * 23 + bristle * 2.7 + k);
          strip.push(position(u, seed.v + offset + 0.17 * Math.sin(u * 2 + k) + rough, time, 0.023));
        }
        stroke(strip, tone, envelope * (0.32 + 0.22 * noise(bristle + k)) * depth, (bristle % 3 === 0 ? 1.6 : 0.7) * scale);
      }
      dot(points[36], tone, 2.2 * scale, envelope * 0.9 * depth, true);
      // Paint flecks spread away from the surface and fade with each stroke.
      for (let j = 0; j < 8; j++) {
        const scatter = fraction(age * 1.45 + j * 0.137);
        const life = Math.sin(scatter * Math.PI);
        const u = seed.u + head - 0.08 + scatter * 0.24;
        const v = seed.v + (noise(j + k * 11) - 0.5) * scatter * 1.7;
        const point = position(u, v, time, 0.035 + scatter * (0.12 + 0.12 * noise(j + 85)));
        dot(point, tone, (0.65 + noise(j + k * 31) * 1.25) * scale, envelope * life * 0.8 * depthOpacity(point), j === 0);
      }
    }
  }

  function drawCode(time: number): void {
    const amount = morph[2] + 0.28 * morph[3];
    if (amount < 0.005) return;
    for (let j = 0; j < 32; j++) {
      const u = (j / 32) * TAU;
      const points: Point[] = [];
      for (let i = 0; i <= 20; i++) points.push(position(u, (i / 20) * TAU, time));
      stroke(points, colors[3], amount * 0.32 * depthOpacity(points[10]), 0.65);
      for (let k = 0; k < 4; k++) {
        const point = position(u, (k / 4) * TAU, time);
        context.fillStyle = colors[3];
        context.globalAlpha = amount * 0.65 * depthOpacity(point);
        context.fillRect(point[0] - 1, point[1] - 1, 2, 2);
      }
    }
    for (let k = 0; k < 5; k++) {
      const point = position((time * 0.75 + k * 1.26) % TAU, k * 1.3, time, 0.01);
      dot(point, colors[3], 2 * point[3], amount * 0.9 * depthOpacity(point), true);
    }
  }

  return {
    draw(time, nextMorph, nextPointerX, nextPointerY, nextLayout = nextMorph[3]): void {
      if (palette.length < 9 || nextMorph.length < 4 || width <= 0 || height <= 0) return;
      morph = nextMorph;
      layout = clamp(nextLayout, 0, 1);
      pointerX = nextPointerX;
      pointerY = nextPointerY;
      context.clearRect(0, 0, width, height);
      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";
      prepareProjection(time);
      drawBackground(time);
      drawIntroParticles(time);
      drawSurface(time);
      drawNeural(time);
      drawPaint(time);
      drawCode(time);
      context.restore();
    },
    resize(nextWidth, nextHeight): void {
      width = Math.max(0, nextWidth);
      height = Math.max(0, nextHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    setColors(nextColors): void {
      colors = nextColors.slice();
      palette = colors.map(rgb);
    },
  };
}
