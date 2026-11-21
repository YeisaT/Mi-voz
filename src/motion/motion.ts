import type { Container, Ticker } from 'pixi.js';

type Task = (dt: number) => boolean;

const tasks: Task[] = [];
let bound = false;

/** Reloj compartido. Las curvas imitan los springs de Motion (rigidez + amortiguación). */
export function bindMotion(ticker: Ticker): void {
  if (bound) return;
  bound = true;
  ticker.add((t) => {
    const dt = Math.min(0.05, t.deltaMS / 1000);
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i]!(dt)) tasks.splice(i, 1);
    }
  });
}

function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** El contenedor ya se destruyó al cambiar de escena: su posición ya no existe. */
function gone(view: Container): boolean {
  return view.destroyed || view.position == null;
}

export function tween(
  ms: number,
  onUpdate: (t: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let elapsed = 0;
    tasks.push((dt) => {
      elapsed += dt * 1000;
      const t = Math.min(1, elapsed / Math.max(1, ms));
      onUpdate(easeOut(t));
      if (t >= 1) {
        resolve();
        return true;
      }
      return false;
    });
  });
}

export function springTo(
  read: () => number,
  write: (value: number) => void,
  target: number,
  stiffness = 170,
  damping = 18,
): Promise<void> {
  let velocity = 0;
  return new Promise((resolve) => {
    tasks.push((dt) => {
      let x = target;
      try {
        x = read();
      } catch {
        resolve();
        return true;
      }
      const acc = -stiffness * (x - target) - damping * velocity;
      velocity += acc * dt;
      const next = x + velocity * dt;
      try {
        write(next);
      } catch {
        resolve();
        return true;
      }
      if (Math.abs(next - target) < 0.35 && Math.abs(velocity) < 6) {
        write(target);
        resolve();
        return true;
      }
      return false;
    });
  });
}

export function riseIn(view: Container, delayMs = 0, from = 16): void {
  const y = view.y;
  view.alpha = 0;
  view.y = y + from;
  let waited = 0;
  let running = false;
  let elapsed = 0;
    tasks.push((dt) => {
      if (gone(view)) return true;
      if (!running) {
        waited += dt * 1000;
        if (waited < delayMs) return false;
        running = true;
      }
      elapsed += dt * 1000;
      const t = easeOut(Math.min(1, elapsed / 320));
      view.alpha = t;
      view.y = y + from * (1 - t);
      return t >= 1;
    });
}

/** Flotación continua. Devuelve una función para detenerla. */
export function idleFloat(
  view: Container,
  amplitude = 5,
  period = 2.6,
): () => void {
  const baseY = view.y;
  let time = Math.random() * period;
  const task: Task = (dt) => {
    if (gone(view)) return true;
    time += dt;
    view.y = baseY + Math.sin((time / period) * Math.PI * 2) * amplitude;
    return false;
  };
  tasks.push(task);
  return () => {
    const i = tasks.indexOf(task);
    if (i >= 0) tasks.splice(i, 1);
    view.y = baseY;
  };
}

export function pressable(face: Container): void {
  const up = () => {
    face.scale.set(1);
  };
  face.eventMode = 'static';
  face.on('pointerdown', () => face.scale.set(0.96));
  face.on('pointerup', up);
  face.on('pointerupoutside', up);
  face.on('pointerout', up);
}
