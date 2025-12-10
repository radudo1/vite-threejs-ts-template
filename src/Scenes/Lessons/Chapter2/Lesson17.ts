import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Clock,
  DirectionalLight,
  DirectionalLightHelper,
  HemisphereLight,
  HemisphereLightHelper,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Points,
  PointsMaterial,
  RectAreaLight,
  Scene,
  SphereGeometry,
  SpotLight,
  SpotLightHelper,
  Texture,
  TextureLoader,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { toggleFullScreen } from '../../../Helpers/fullscreen';
import { initializeScene } from '../../../Helpers/initializeScene';
import { resizeRendererToDisplaySize } from '../../../Helpers/responsiveness';
import '../../../style.css';
import { createLoadingManager } from '../../../Helpers/createLoadingManager';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let loadingManager: LoadingManager;
let textureLoader: TextureLoader;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let clock: Clock;

let particlesGeometry: BufferGeometry;
let particlesMaterial: PointsMaterial;
let particles: Points;
let count: number;
let particlesPositions: Float32Array;
let particlesColors: Float32Array;
let particleTexture: Texture;
let cursor = {
  x: 0,
  y: 0,
};

const controls: { loadingManagerEnabled: boolean } = {
  loadingManagerEnabled: false,
};
init();
animate();

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    const sceneSetup = initializeScene(CANVAS_ID);
    canvas = sceneSetup.canvas;
    renderer = sceneSetup.renderer;
    scene = sceneSetup.scene;
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = createLoadingManager(controls);
    textureLoader = new TextureLoader();

    textureLoader.manager = loadingManager;
  }

  // ===== 🧬TEXTURES =====
  {
    particleTexture = textureLoader.load('/textures/particles/8.png');
  }
  // ===== 💡 LIGHTS =====
  {
  }
  // ===== MATERIALS =====
  {
    particlesMaterial = new PointsMaterial({
      //color: '#ff88cc',
      size: 0.1,
      sizeAttenuation: true,
      map: particleTexture,
      transparent: true,
      alphaMap: particleTexture,
      depthWrite: false,
      //alphaTest: 0.001,
      //depthTest: false,
      blending: AdditiveBlending,
    });
  }

  // ===== 📦 OBJECTS =====
  {
    // Particles
    particlesGeometry = new BufferGeometry();
    particles = new Points(particlesGeometry, particlesMaterial);

    count = 50000;

    particlesPositions = new Float32Array(count * 3);
    particlesColors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      particlesPositions[i] = (Math.random() - 0.5) * 10;
      particlesColors[i] = Math.random();
    }

    particlesGeometry.setAttribute('position', new BufferAttribute(particlesPositions, 3));
    particlesGeometry.setAttribute('color', new BufferAttribute(particlesColors, 3));
    particlesMaterial.vertexColors = true;
    scene.add(particles);
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(80, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 5);
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas);

    cameraControls.enableDamping = true;
    cameraControls.autoRotate = false;
    cameraControls.update();

    window.addEventListener('mousemove', (event: MouseEvent) => {
      cursor.x = event.clientX / window.innerWidth - 0.5;
      cursor.y = -(event.clientY / window.innerHeight - 0.5);
    });

    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas);
      }
    });
  }

  // ===== 🪄 HELPERS =====
  {
  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock();
  }
}

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  //particles.setRotationFromAxisAngle(new Vector3(-1, 1, 1), elapsedTime * 0.01);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const x = particlesGeometry.attributes.position.array[i3];
    const z = particlesGeometry.attributes.position.array[i3 + 2];
    particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x - z);
  }
  particlesGeometry.attributes.position.needsUpdate = true;
  cameraControls.update();

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
