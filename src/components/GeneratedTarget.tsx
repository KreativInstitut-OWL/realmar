import {
  RandomGenerator,
  unsafeUniformIntDistribution,
  xoroshiro128plus,
} from "pure-rand";
import { useMemo } from "react";
// @ts-expect-error Voronoi is not typed
import Voronoi from "voronoi";

function getSeed(id: string): number {
  // Use a large prime as a multiplier for each character's code.
  const prime = 31;
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    // Multiply the current hash by the prime and add the character's code.
    hash = (hash * prime + id.charCodeAt(i)) >>> 0; // Keep it within 32 bits.
  }

  // The final hash value can be directly returned as the seed.
  return hash;
}

const TARGET_SIZE = 16;

function generateFloat32(rng: RandomGenerator) {
  const g1 = unsafeUniformIntDistribution(0, (1 << 24) - 1, rng);
  const value = g1 / (1 << 24);
  return value;
}

// number between `from` and `to`
function generateFloat32Between(
  rng: RandomGenerator,
  from: number,
  to: number
) {
  return generateFloat32(rng) * (to - from) + from;
}

const VORONOI_POINT_COUNT = 64;
const LINE_PADDING = 2;

function round(value: number, precision = 1) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

export function GeneratedTarget({
  id,
  className,
  size,
}: {
  id: string;
  className?: string;
  size?: number;
}) {
  const rng = useMemo(() => xoroshiro128plus(getSeed(id)), [id]);

  const diagram = useMemo(() => {
    const points = [];

    for (let i = 0; i < VORONOI_POINT_COUNT; i += 1) {
      points.push({
        x: generateFloat32(rng) * TARGET_SIZE,
        y: generateFloat32(rng) * TARGET_SIZE,
      });
    }

    const voronoi = new Voronoi();

    const bbox = { xl: 0, xr: TARGET_SIZE, yt: 0, yb: TARGET_SIZE };

    return voronoi.compute(points, bbox) as {
      // this type is incomplete
      cells: {
        halfedges: {
          getStartpoint: () => { x: number; y: number };
        }[];
      }[];
    };
  }, [rng]);

  const randomLines = useMemo(() => {
    const lines = [];

    for (let i = 0; i < 32; i += 1) {
      const x1 = generateFloat32Between(
        rng,
        -LINE_PADDING,
        TARGET_SIZE + LINE_PADDING
      );
      const y1 = generateFloat32Between(
        rng,
        -LINE_PADDING,
        TARGET_SIZE + LINE_PADDING
      );
      const x2 = generateFloat32Between(
        rng,
        -LINE_PADDING,
        TARGET_SIZE + LINE_PADDING
      );
      const y2 = generateFloat32Between(
        rng,
        -LINE_PADDING,
        TARGET_SIZE + LINE_PADDING
      );
      const q = generateFloat32(rng);
      const o = generateFloat32(rng);
      const width = generateFloat32Between(rng, 0.25, 0.75);
      lines.push({ x1, y1, x2, y2, q, o, width });
    }

    return lines;
  }, [rng]);

  const confetti = useMemo(() => {
    const confetti = [];

    for (let i = 0; i < 64; i += 1) {
      const x = generateFloat32(rng) * TARGET_SIZE;
      const y = generateFloat32(rng) * TARGET_SIZE;
      const q = generateFloat32(rng);
      const o = generateFloat32(rng);
      const r = generateFloat32Between(rng, 0, 360);
      const size = generateFloat32Between(rng, 1, 2);
      confetti.push({ x, y, q, o, r, size });
    }

    return confetti;
  }, [rng]);

  return (
    <svg
      viewBox={`0 0 ${TARGET_SIZE} ${TARGET_SIZE}`}
      width={size}
      height={size}
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width={TARGET_SIZE} height={TARGET_SIZE} fill="white" />
      {/* {diagram.edges.map((edge, i) => {
        const start = edge.va;
        const end = edge.vb;

        return (
          <line
            key={i}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="black"
            strokeWidth={0.2}
          />
        );
      })} */}
      {diagram.cells.map((cell, i) => {
        const halfedges = cell.halfedges;
        const points = halfedges.map((halfedge) => {
          const start = halfedge.getStartpoint();
          return `${round(start.x)},${round(start.y)}`;
        });

        const hasEvenEdges = halfedges.length % 2 === 0;
        const isIndexDivisibleBy8 = i % 8 === 0;

        return (
          <polygon
            key={i}
            points={points.join(" ")}
            fill={
              isIndexDivisibleBy8 ? "#55fc27" : hasEvenEdges ? "white" : "black"
            }
            stroke="white"
            strokeWidth={0.5}
          />
        );
      })}

      {randomLines.map((line, i) => {
        return (
          <line
            key={i}
            x1={round(line.x1)}
            y1={round(line.y1)}
            x2={round(line.x2)}
            y2={round(line.y2)}
            stroke={
              line.q > 0.4 ? (line.q > 0.9 ? "#55fc27" : "black") : "white"
            }
            style={{ opacity: round(line.o, 2) }}
            strokeWidth={round(line.width, 2)}
          />
        );
      })}

      {confetti.map((confetti, i) => {
        return (
          <rect
            key={i}
            x={round(confetti.x)}
            y={round(confetti.y)}
            width={round(confetti.size, 2)}
            height={round(confetti.size, 2)}
            fill={confetti.q > 0.4 ? "#55fc27" : "black"}
            style={{
              opacity: round(confetti.o, 2),
              transform: `rotate(${round(confetti.r)}deg)`,
            }}
          />
        );
      })}

      {/* {id.split("").map((char, i) => {
        // distribute the characters across the marker
        const x = (i / id.length) * MARKER_SIZE + 1.5;
        const y = MARKER_SIZE / 2;

        return (
          <>
            <text
              key={i}
              x={x}
              y={y}
              style={{
                transform: `rotate(${i * 143.4}deg)`,
                transformOrigin: "50% 50%",
                mixBlendMode: "color-burn",
                opacity: 0.5,
              }}
              fill="black"
              fontSize={15}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {char}
            </text>
            <text
              key={i}
              x={MARKER_SIZE - x}
              y={y}
              style={{
                transform: `rotate(${i * -76.5}deg)`,
                transformOrigin: "50% 50%",
                mixBlendMode: "overlay",
              }}
              fill="#55fc27"
              fontSize={15}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {char}
            </text>
          </>
        );
      })} */}
    </svg>
  );
}

// OLD CODE IGNORE!!!!!

// const pixels = useMemo(() => {
//   const numbers = generateN(
//     xoroshiro128plus(getSeed(id)),
//     MARKER_SIZE ** 2 - WATERMARK_START.length * 2
//   )[0];

//   return [...WATERMARK_START, ...numbers, ...WATERMARK_END];
// }, [id]);

{
  /* <rect width={MARKER_SIZE} height={MARKER_SIZE} fill="white" /> */
}
{
  /* {pixels.map((pixel, i) => {
        const x = i % MARKER_SIZE;
        const y = Math.floor(i / MARKER_SIZE);

        // keep the center region empty
        if (
          x >= CENTER_START &&
          x <= CENTER_END &&
          y >= CENTER_START &&
          y <= CENTER_END
        ) {
          return null;
        }

        // pixel is a value between MAX_NEGATIVE_INTEGER and MAX_POSITIVE_INTEGER

        // grab the first 8 bits of the pixel value
        // const h = 107.3;
        // const s = (((pixel >> 8) & 0xff) / 255) * 100;
        // const l = (((pixel >> 16) & 0xff) / 255) * 100;

        return pixel > 0 ? (
          <rect
            key={i}
            x={x}
            y={y}
            width={1}
            height={1}
            // fill={`hsl(${h.toFixed(2)}deg ${s.toFixed(2)}% ${l.toFixed(2)}%)`}
            fill={pixel % 19 === 0 ? "#55fc27" : "black"}
          />
        ) : null;
      })} */
}

// const CENTER = Math.floor(MARKER_SIZE / 2);
// const CENTER_START = CENTER - 3;
// const CENTER_END = CENTER + 2;

// const WATERMARK_START = [1, 0, 1, 0, 1, 1, 1, 0];
// const WATERMARK_END = WATERMARK_START.slice().reverse();
