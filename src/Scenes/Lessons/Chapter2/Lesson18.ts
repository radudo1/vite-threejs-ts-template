import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  LoadingManager,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from 'three';

import { resizeRendererToDisplaySize } from '../../../Helpers/responsiveness';
import '../../../style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { toggleFullScreen } from '../../../Helpers/fullscreen';
import * as dat from 'dat.gui';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let loadingManager: LoadingManager;

let textureLoader: TextureLoader;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let clock: Clock;
let galaxyGeometry: BufferGeometry | null = null;
let postionsArray: Float32Array = null!;
let galaxyMaterial: PointsMaterial = null!;
let galaxyPoints: Points | null = null;
const controls = {
  loadingManagerEnabled: false,
  count: 10000,
  size: 0.02,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
};

let gui: dat.GUI;

const generateGalaxy = () => {
  const count = controls.count;

  // Dispose old geometry and material
  if (galaxyPoints) {
    if (galaxyGeometry) galaxyGeometry.dispose();
    galaxyMaterial.dispose();
    scene.remove(galaxyPoints);
  }

  galaxyGeometry = new BufferGeometry();
  postionsArray = new Float32Array(count * 3);
  const colorsArray = new Float32Array(count * 3);

  // Helper function to convert hex color to RGB array

  const insideColorRgb = new Color(controls.insideColor);
  const outsideColorRgb = new Color(controls.outsideColor);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * controls.radius;
    const spingAngle = radius * controls.spin;
    const branchesAngle = ((i % controls.branches) / controls.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), controls.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * controls.randomness * radius;
    const randomY =
      Math.pow(Math.random(), controls.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * controls.randomness * radius;
    const randomZ =
      Math.pow(Math.random(), controls.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * controls.randomness * radius;

    postionsArray[i3 + 0] = Math.cos(branchesAngle + spingAngle) * radius + randomX;
    postionsArray[i3 + 1] = randomY;
    postionsArray[i3 + 2] = Math.sin(branchesAngle + spingAngle) * radius + randomZ;

    // Colors based on radius (inside hot, outside cool)
    const mixedColor = insideColorRgb.clone();
    mixedColor.lerp(outsideColorRgb, radius / controls.radius);

    colorsArray[i3 + 0] = mixedColor.r;

    colorsArray[i3 + 1] = mixedColor.g;
    colorsArray[i3 + 2] = mixedColor.b;
  }

  galaxyGeometry.setAttribute('position', new BufferAttribute(postionsArray, 3));
  galaxyGeometry.setAttribute('color', new BufferAttribute(colorsArray, 3));

  // Create material on first call
  if (!galaxyMaterial) {
    const texture = textureLoader.load('/textures/particles/7.png');
    galaxyMaterial = new PointsMaterial({
      size: controls.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: AdditiveBlending,
      //map: texture,
      transparent: true,
      //alphaMap: texture,
      vertexColors: true,
    });
  }

  // Update material size
  galaxyMaterial.size = controls.size;

  // Create and add new points
  galaxyPoints = new Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxyPoints);
};

init();
animate();

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    scene = new Scene();
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager();
    textureLoader = new TextureLoader();
    textureLoader.manager = loadingManager;

    if (controls.loadingManagerEnabled) {
      loadingManager.onStart = () => console.log('loading started');
      loadingManager.onProgress = (url, loaded, total) => {
        console.log(`loading in progress: ${url} -> ${loaded} / ${total}`);
      };
      loadingManager.onLoad = () => console.log('loaded!');
      loadingManager.onError = (error) => console.log('❌ error while loading: ', error);
    }
  }
  // ===== 🧬GALAXY =====
  {
    // Geometry
    generateGalaxy();
  }

  // ===== 💡 LIGHTS =====
  {
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

    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) toggleFullScreen(canvas);
    });
  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock();
  }

  // ===== 🎛️ GUI =====
  {
    gui = new dat.GUI();

    gui
      .add(controls, 'count')
      .min(100)
      .max(100000)
      .step(100)
      .onFinishChange(() => {
        generateGalaxy();
      });
    gui
      .add(controls, 'size')
      .min(0.001)
      .max(0.1)
      .step(0.001)
      .onChange(() => {
        if (galaxyMaterial) {
          galaxyMaterial.size = controls.size;
        }
      });
    gui
      .add(controls, 'radius')
      .min(0.01)
      .max(20)
      .step(0.01)
      .onFinishChange(() => generateGalaxy());
    gui
      .add(controls, 'branches')
      .min(2)
      .max(20)
      .step(1)
      .onFinishChange(() => generateGalaxy());
    gui
      .add(controls, 'spin')
      .min(-5)
      .max(5)
      .step(0.001)
      .onFinishChange(() => generateGalaxy());
    gui
      .add(controls, 'randomness')
      .min(0)
      .max(2)
      .step(0.001)
      .onFinishChange(() => generateGalaxy());
    gui
      .add(controls, 'randomnessPower')
      .min(1)
      .max(10)
      .step(0.001)
      .onFinishChange(() => generateGalaxy());
    gui.addColor(controls, 'insideColor').onFinishChange(() => generateGalaxy());
    gui.addColor(controls, 'outsideColor').onFinishChange(() => generateGalaxy());
  }
}

function animate() {
  requestAnimationFrame(animate);

  cameraControls.update();

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
