export interface TypeScaleRatio {
  name: string;
  value: number;
}

export const MODULAR_RATIOS: TypeScaleRatio[] = [
  { name: 'Minor Second', value: 1.067 },
  { name: 'Major Second', value: 1.125 },
  { name: 'Minor Third', value: 1.200 },
  { name: 'Major Third', value: 1.250 },
  { name: 'Perfect Fourth', value: 1.333 },
  { name: 'Augmented Fourth', value: 1.414 },
  { name: 'Perfect Fifth', value: 1.500 },
  { name: 'Golden Ratio', value: 1.618 },
];

export interface TypeScaleStep {
  label: string;
  cssVar: string;
  step: number;
  px: number;
  rem: number;
}

export function generateTypeScale(basePx: number, ratio: number): TypeScaleStep[] {
  const stepsDef = [
    { label: 'Caption / XS', cssVar: '--font-size-xs', step: -2 },
    { label: 'Small / SM', cssVar: '--font-size-sm', step: -1 },
    { label: 'Base / Body', cssVar: '--font-size-base', step: 0 },
    { label: 'Medium / MD', cssVar: '--font-size-md', step: 1 },
    { label: 'Large / LG', cssVar: '--font-size-lg', step: 2 },
    { label: 'Heading 4 / XL', cssVar: '--font-size-xl', step: 3 },
    { label: 'Heading 3 / 2XL', cssVar: '--font-size-2xl', step: 4 },
    { label: 'Heading 2 / 3XL', cssVar: '--font-size-3xl', step: 5 },
    { label: 'Heading 1 / 4XL', cssVar: '--font-size-4xl', step: 6 },
    { label: 'Display / 5XL', cssVar: '--font-size-5xl', step: 7 },
  ];

  return stepsDef.map((item) => {
    const rawPx = basePx * Math.pow(ratio, item.step);
    const px = Math.round(rawPx * 100) / 100;
    const rem = Math.round((px / 16) * 1000) / 1000;
    return {
      label: item.label,
      cssVar: item.cssVar,
      step: item.step,
      px,
      rem,
    };
  });
}

export function generateTypeScaleCss(steps: TypeScaleStep[]): string {
  const lines = steps.map((s) => `  ${s.cssVar}: ${s.rem}rem; /* ${s.px}px */`);
  return `:root {\n${lines.join('\n')}\n}`;
}

