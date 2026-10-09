export type ColorStop = {
  id: string;
  color: string;
  stop: number; // 0 to 100
};

export type GradientConfig = {
  type: "linear" | "radial";
  angle: number; // 0 to 360
  shape: "circle" | "ellipse";
  stops: ColorStop[];
};

export function buildGradientCss(config: GradientConfig): string {
  const sortedStops = [...config.stops].sort((a, b) => a.stop - b.stop);
  const stopsString = sortedStops
    .map((s) => `${s.color} ${s.stop}%`)
    .join(", ");

  if (config.type === "linear") {
    return `linear-gradient(${config.angle}deg, ${stopsString})`;
  } else {
    return `radial-gradient(${config.shape} at center, ${stopsString})`;
  }
}

export const PRESET_GRADIENTS: Array<{ name: string; config: GradientConfig }> = [
  {
    name: "Sunset Ember",
    config: {
      type: "linear",
      angle: 135,
      shape: "circle",
      stops: [
        { id: "1", color: "#F97316", stop: 0 },
        { id: "2", color: "#EC4899", stop: 50 },
        { id: "3", color: "#8B5CF6", stop: 100 },
      ],
    },
  },
  {
    name: "Ocean Breeze",
    config: {
      type: "linear",
      angle: 90,
      shape: "circle",
      stops: [
        { id: "1", color: "#06B6D4", stop: 0 },
        { id: "2", color: "#3B82F6", stop: 100 },
      ],
    },
  },
  {
    name: "Neon Glow",
    config: {
      type: "radial",
      angle: 0,
      shape: "circle",
      stops: [
        { id: "1", color: "#10B981", stop: 0 },
        { id: "2", color: "#064E3B", stop: 100 },
      ],
    },
  },
  {
    name: "Aurora Sky",
    config: {
      type: "linear",
      angle: 45,
      shape: "circle",
      stops: [
        { id: "1", color: "#A855F7", stop: 0 },
        { id: "2", color: "#3B82F6", stop: 50 },
        { id: "3", color: "#14B8A6", stop: 100 },
      ],
    },
  },
];

