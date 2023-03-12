export type Update = (ctx: CanvasRenderingContext2D) => void;
export type Updatable = { update: Update };
