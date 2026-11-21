import { Application } from 'pixi.js';
import { SceneManager } from './core/SceneManager';
import { CreacionScene } from './scenes/Creacion';
import { IntroScene } from './scenes/Intro';
import { CasaScene } from './scenes/Casa';
import { createColegioScene } from './scenes/Colegio';
import { createParqueScene } from './scenes/Parque';
import { FinalScene } from './scenes/Final';
import { HEX } from './config/palette';

/**
 * Init asíncrono PixiJS v8.
 * resizeTo: window | background: #FDF7EB
 */
async function main(): Promise<void> {
  const app = new Application();

  await app.init({
    resizeTo: window,
    background: HEX.fondo,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  document.body.replaceChildren(app.canvas);
  app.canvas.style.display = 'block';
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';

  const sm = new SceneManager(app);

  sm.register('creacion', () => new CreacionScene(sm));
  sm.register('intro', () => new IntroScene(sm));
  sm.register('casa', () => new CasaScene(sm));
  sm.register('colegio', () => createColegioScene(sm));
  sm.register('parque', () => createParqueScene(sm));
  sm.register('final', () => new FinalScene(sm));

  window.addEventListener('resize', () => sm.handleResize());

  await sm.goTo('creacion', 0);
}

main().catch(() => {
  document.body.textContent = 'No se pudo iniciar el juego. Recarga la página.';
});
