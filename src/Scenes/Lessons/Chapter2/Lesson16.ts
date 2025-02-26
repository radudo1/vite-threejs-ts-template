import {
  AmbientLight,
  CameraHelper,
  Clock,
  DirectionalLight,
  DirectionalLightHelper,
  LoadingManager,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  SpotLight,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from 'three';

import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { toggleFullScreen } from '../../../Helpers/fullscreen';
import { resizeRendererToDisplaySize } from '../../../Helpers/responsiveness';
import '../../../style.css';
import { initializeScene } from '../../../Helpers/initializeScene';
import { optimizeLightShadow } from '../../../Helpers/optimizeLightShadow';
import { createLoadingManager } from '../../../Helpers/createLoadingManager';
import rotationsAngles from '../../../Helpers/rotationAngles';
import { bounce } from '../../../Helpers/animations';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let loadingManager: LoadingManager;
let ambientLight: AmbientLight;
let gui: GUI;
let textureLoader: TextureLoader;
let directionalLight: DirectionalLight;

let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let clock: Clock;

let material: MeshStandardMaterial;
let house: Mesh;
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
    renderer.shadowMap.enabled = false;

    renderer.shadowMap.type = PCFSoftShadowMap;
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = createLoadingManager(controls);
    textureLoader = new TextureLoader();

    textureLoader.manager = loadingManager;
  }

  // ===== 🧬TEXTURES =====
  {
  }
  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('#ffffff', 0.5);
    directionalLight = new DirectionalLight('#ffffff', 1.5);
    directionalLight.position.set(3, 2, -8);

    scene.add(ambientLight, directionalLight);
  }

  // ===== 🎨 MATERIALS =====
  {
    material = new MeshStandardMaterial({ color: 'orange' });
    material.roughness = 0.6;
  }
  // ===== 📦 OBJECTS =====
  {
    // ===== 🌐 House =====
    {
      house = new Mesh(new SphereGeometry(1, 32, 32), new MeshStandardMaterial({ roughness: 0.7 }));
      scene.add(house);
    }
  }

  // ===== 🎥 CAMERA =====
  {
    // Base Camera
    camera = new PerspectiveCamera(80, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(4, 2, 5);
    scene.add(camera);
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
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 });

    const lightsFolder = gui.addFolder('Lights Folder');

    lightsFolder.add(ambientLight, 'intensity').min(0).max(3).step(0.01).name('Ambient Light Intensity');
    lightsFolder.add(directionalLight, 'intensity').min(0).max(3).step(0.001).name('Directional Light Intensity');
    lightsFolder.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('Directional Light X');
    lightsFolder.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('Directional Light Y');
    lightsFolder.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('Directional Light Z');

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save();
      localStorage.setItem('guiState', JSON.stringify(guiState));
    });

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState');
    if (guiState) gui.load(JSON.parse(guiState));

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState');
      gui.reset();
    };
    gui.add({ resetGui }, 'resetGui').name('RESET');

    gui.close();
  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  cameraControls.update();

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
