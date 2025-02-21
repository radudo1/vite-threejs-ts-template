import { WebGLRenderer, Scene, PCFSoftShadowMap } from 'three';

export const initializeScene = (canvasId: string): { canvas: HTMLElement; renderer: WebGLRenderer; scene: Scene } => {
  const canvas = document.querySelector(`canvas#${canvasId}`) as HTMLCanvasElement;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  const scene = new Scene();

  return { canvas, renderer, scene };
};
