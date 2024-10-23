export type OptionalDeep<T> = {
  [P in keyof T]?: OptionalDeep<T[P]>;
};

type BaseParticleOptions = {
  color: {
    opacity: number;
    particle: { r: number; g: number; b: number };
    connection: { r: number; g: number; b: number };
  };
  connectionDistance: number;
  lineWidth: number;
  particleCount?: number | null;
  particleCountFactor: number;
};

export type FpsOptions =
  | { fps?: { show: true; element: HTMLElement } }
  | { fps?: { show: false; element: null | undefined } };

export type ParticlesOptions = FpsOptions & BaseParticleOptions;
export type PartialParticlesOptions = FpsOptions & Partial<BaseParticleOptions>;
