export interface RadiusValues {
  topLeftX: number;
  topRightX: number;
  bottomRightX: number;
  bottomLeftX: number;
  topLeftY: number;
  topRightY: number;
  bottomRightY: number;
  bottomLeftY: number;
  is8Point: boolean;
  unit: 'px' | '%';
}

export function generateBorderRadiusCss(val: RadiusValues): string {
  const u = val.unit;
  if (!val.is8Point) {
    if (
      val.topLeftX === val.topRightX &&
      val.topRightX === val.bottomRightX &&
      val.bottomRightX === val.bottomLeftX
    ) {
      return `${val.topLeftX}${u}`;
    }
    return `${val.topLeftX}${u} ${val.topRightX}${u} ${val.bottomRightX}${u} ${val.bottomLeftX}${u}`;
  }

  // 8-value elliptical format: horizontal radii / vertical radii
  return `${val.topLeftX}${u} ${val.topRightX}${u} ${val.bottomRightX}${u} ${val.bottomLeftX}${u} / ${val.topLeftY}${u} ${val.topRightY}${u} ${val.bottomRightY}${u} ${val.bottomLeftY}${u}`;
}

export const RADIUS_PRESETS: { name: string; values: RadiusValues }[] = [
  {
    name: 'Standard Card',
    values: {
      topLeftX: 16,
      topRightX: 16,
      bottomRightX: 16,
      bottomLeftX: 16,
      topLeftY: 16,
      topRightY: 16,
      bottomRightY: 16,
      bottomLeftY: 16,
      is8Point: false,
      unit: 'px',
    },
  },
  {
    name: 'Pill / Capsule',
    values: {
      topLeftX: 9999,
      topRightX: 9999,
      bottomRightX: 9999,
      bottomLeftX: 9999,
      topLeftY: 9999,
      topRightY: 9999,
      bottomRightY: 9999,
      bottomLeftY: 9999,
      is8Point: false,
      unit: 'px',
    },
  },
  {
    name: 'Organic Blob 1',
    values: {
      topLeftX: 60,
      topRightX: 40,
      bottomRightX: 30,
      bottomLeftX: 70,
      topLeftY: 60,
      topRightY: 30,
      bottomRightY: 70,
      bottomLeftY: 40,
      is8Point: true,
      unit: '%',
    },
  },
  {
    name: 'Organic Blob 2',
    values: {
      topLeftX: 30,
      topRightX: 70,
      bottomRightX: 70,
      bottomLeftX: 30,
      topLeftY: 30,
      topRightY: 30,
      bottomRightY: 70,
      bottomLeftY: 70,
      is8Point: true,
      unit: '%',
    },
  },
  {
    name: 'Leaf / Teardrop',
    values: {
      topLeftX: 0,
      topRightX: 50,
      bottomRightX: 0,
      bottomLeftX: 50,
      topLeftY: 0,
      topRightY: 50,
      bottomRightY: 0,
      bottomLeftY: 50,
      is8Point: false,
      unit: '%',
    },
  },
  {
    name: 'Egg Shape',
    values: {
      topLeftX: 50,
      topRightX: 50,
      bottomRightX: 50,
      bottomLeftX: 50,
      topLeftY: 60,
      topRightY: 60,
      bottomRightY: 40,
      bottomLeftY: 40,
      is8Point: true,
      unit: '%',
    },
  },
];

