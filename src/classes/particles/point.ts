import random from 'lodash/fp/random';

const SPEED = 0.8;
const MAX_SIZE = 3;
const MAX_MOVE = 10;
const MAX_DENSITY = 30;
const DEFAULT_COLOR = 'rgba(255,255,255)';

export class Particle {
  constructor(w, h, size = MAX_SIZE, maxMove = MAX_MOVE) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.baseX = this.x;
    this.baseY = this.y;
    this.size = Math.random() * (size || MAX_SIZE) + 1;
    this.density = Math.random() * MAX_DENSITY + 1;
    this.maxMove = maxMove || MAX_MOVE;
    this.directionX = 1;
    this.directionY = 1;
    this.countMoveX = 0;
    this.countMoveY = 0;
    this.directionAngle = Math.floor(Math.random() * 360 + 1);
    this.vector = {
      x: Math.cos(this.directionAngle) * SPEED,
      y: Math.sin(this.directionAngle) * SPEED,
    };
  }

  draw(ctx, color) {
    ctx.fillStyle = color || DEFAULT_COLOR;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update(mouse) {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.hypot(dx, dy);

    if (distance < mouse.radius) {
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (mouse.radius - distance) / mouse.radius;
      const directionX = forceDirectionX * force * this.density;
      const directionY = forceDirectionY * force * this.density;
      this.x -= directionX;
      this.y -= directionY;
    } else {
      if (this.x !== this.baseX) {
        const dx = this.x - this.baseX;
        this.x -= dx / 50;
      }
      if (this.y !== this.baseY) {
        const dy = this.y - this.baseY;
        this.y -= dy / 50;
      }
    }
  }

  move(canvas) {
    if (this.x + this.vector.x < 0) {
      this.vector.x *= -1;
      this.x = 0;
      this.baseX = 0;
    } else if (this.x + this.vector.x > canvas.width) {
      this.vector.x *= -1;
      this.x = canvas.width;
      this.baseX = canvas.width;
    }

    if (this.y + this.vector.y < 0) {
      this.vector.y *= -1;
      this.y = 0;
      this.baseY = 0;
    } else if (this.y + this.vector.y > canvas.height) {
      this.vector.y *= -1;
      this.y = canvas.height;
      this.baseY = canvas.height;
    } else {
      this.x += this.vector.x;
      this.baseX += this.vector.x;
      this.y += this.vector.y;
      this.baseY += this.vector.y;
    }
  }

  move2(canvas) {
    const x = random(1, 11);
    const y = random(1, 11);
    const distance = 1;

    if (x < 6) {
      if (this.baseX > 1) this.baseX -= distance;
      else this.baseX += distance;
    } else {
      if (this.baseX < canvas.width) this.baseX += distance;
      else this.baseX -= distance;
    }

    if (y < 6) {
      if (this.baseY > 1) this.baseY -= 1;
      else this.baseY += distance;
    } else {
      if (this.baseY < canvas.height) this.baseY += distance;
      else this.baseY -= distance;
    }
  }

  move3(canvas) {
    // const x = random(-2, 3);
    const x = random(-5, 6);
    const y = random(-5, 6);
    // const y = random(-2, 3);
    // const y = random(-10, 11);

    if (this.countMoveX) {
      this.countMoveX--;
      if (this.directionX === 1) this.baseX += Math.abs(x);
      else this.baseX += -Math.abs(x);
    } else if (this.baseX - x < 1) {
      this.countMoveX = random(1, 10);
      this.directionX = 1;
    } else if (this.baseX + x > canvas.width) {
      this.countMoveX = random(1, 10);
      this.directionX = 0;
    } else this.baseX -= x;

    if (this.countMoveY) {
      this.countMoveY--;
      if (this.directionY === 1) this.baseY += Math.abs(y);
      else this.baseY += -Math.abs(y);
    } else if (this.baseY - y < 1) {
      this.countMoveY = random(1, 10);
      this.directionY = 1;
    } else if (this.baseY + y > canvas.height) {
      this.countMoveY = random(1, 10);
      this.directionY = 0;
    } else this.baseY -= y;
  }
}
