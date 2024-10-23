import { Particle } from 'classes/particles/point';

type CellKey = `${number}:${number}`;

export class Grid {
  private cells: Map<CellKey, Particle[]> = new Map();

  constructor(private cellSize: number) {}

  getKey(x: number, y: number): CellKey {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return `${col}:${row}`;
  }

  insert(particle: Particle) {
    const key = this.getKey(particle.x, particle.y);
    const cell = this.cells.get(key);
    if (cell) cell.push(particle);
    else this.cells.set(key, [particle]);
  }

  insertParticles(particles: Particle[]) {
    particles.forEach((particle) => this.insert(particle));
  }

  getNearbyParticles(particle: Particle): Particle[] {
    const nearbyParticles: Particle[] = [];
    const col = Math.floor(particle.x / this.cellSize);
    const row = Math.floor(particle.y / this.cellSize);

    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        const cellKey: CellKey = `${col + xOffset}:${row + yOffset}`;
        const cell = this.cells.get(cellKey);

        if (cell) nearbyParticles.push(...cell);
      }
    }

    return nearbyParticles;
  }

  clear() {
    this.cells.clear();
  }
}
