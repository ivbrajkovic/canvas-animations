import { MutableRefObject, useEffect, useState } from "react";
import * as dat from "dat.gui";

const settings = {
  animation: {
    color: true,
    increment: true,
    amplitude: true,
  },
  wave: {
    amplitude: 100,
    waveLength: 0.01,
    frequency: 0.01,
  },
  color: {
    hue: 255,
    saturation: 50,
    lightness: 50,
  },
};

class Wave {
  public increment = settings.wave.frequency;

  constructor(public y: number) {}

  draw(context: CanvasRenderingContext2D) {
    const { animation, wave, color } = settings;
    context.strokeStyle = animation.color
      ? `hsl(${Math.abs(color.hue * Math.sin(this.increment))}, ${
          color.saturation
        }%, ${color.lightness}%)`
      : `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;

    context.beginPath();
    context.moveTo(0, this.y);

    for (let i = 0; i < context.canvas.width; i++) {
      const amplitude = animation.amplitude
        ? wave.amplitude * Math.sin(this.increment)
        : wave.amplitude;

      const waveLength = Math.sin(i * wave.waveLength + this.increment);
      context.lineTo(i, this.y + waveLength * amplitude);
    }

    context.stroke();
    context.closePath();

    if (animation.increment) this.increment += wave.frequency;
  }
}

const animate = (context: CanvasRenderingContext2D, wave: Wave) => {
  let isRunning = true;
  const animation = () => {
    if (!isRunning) return;
    context.fillStyle = "rgba(0, 0, 0, 0.04)";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    wave.draw(context);
    requestAnimationFrame(animation);
  };
  animation();
  return () => {
    isRunning = false;
  };
};

export const useWaveAnimation = (
  ctx: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  useState(() => {
    const gui = new dat.GUI();

    const animationFolder = gui.addFolder("Animate");
    animationFolder.open();
    animationFolder.add(settings.animation, "color");
    animationFolder.add(settings.animation, "increment");
    animationFolder.add(settings.animation, "amplitude");

    const waveFolder = gui.addFolder("Wave");
    waveFolder.open();
    waveFolder.add(settings.wave, "amplitude", -300, 300);
    waveFolder.add(settings.wave, "waveLength", -0.1, 0.1);
    waveFolder.add(settings.wave, "frequency", -0.1, 1);

    const waveColorFolder = gui.addFolder("Color");
    waveColorFolder.open();
    waveColorFolder.add(settings.color, "hue", 0, 360);
    waveColorFolder.add(settings.color, "saturation", 0, 100);
    waveColorFolder.add(settings.color, "lightness", 0, 100);
  });

  useEffect(() => {
    if (!ctx.current) return;

    const canvas = ctx.current.canvas;
    const context = ctx.current;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const wave = new Wave(canvas.height / 2);
    return animate(context, wave);
  }, []);
};
