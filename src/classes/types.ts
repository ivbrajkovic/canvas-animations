export type Update = (ctx: CanvasRenderingContext2D, other?: any) => void;
export type Updatable = { update: Update };
