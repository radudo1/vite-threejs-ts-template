import {
  AmbientLight,
  BoxGeometry,
  Clock,
  ConeGeometry,
  DirectionalLight,
  Group,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
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
import { createBush, createGraves } from './lesson16Helpers/primitivesMakers';

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
let floor: Mesh;
let material: MeshStandardMaterial;
let walls: Mesh;
let roof: Mesh;
let houseGroup: Group;
let cursor = {
  x: 0,
  y: 0,
};
let door: Mesh;
let bush1: Mesh;
let bush2: Mesh;
let bush3: Mesh;
let bush4: Mesh;
let graves: Group;

const controls: { loadingManagerEnabled: boolean } = {
  loadingManagerEnabled: false,
};

const houseMeasurments = {
  width: 4,
  height: 2.5,
  depth: 4,
};

const floorMeasurments = {
  width: 20,
  height: 20,
};
const roofMeasurments = {
  radius: 3.5,
  height: 1.5,
  segments: 4,
};

const init = () => {
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
  // ===== 🎨 TEXTURES =====
  {
  }
  // ===== 📦 OBJECTS =====
  {
    // ===== 🌐 House =====
    {
      houseGroup = new Group();
      walls = new Mesh(
        new BoxGeometry(houseMeasurments.width, houseMeasurments.height, houseMeasurments.depth),
        new MeshStandardMaterial({ color: 'orange' })
      );
      walls.position.y += houseMeasurments.height / 2;

      roof = new Mesh(
        new ConeGeometry(roofMeasurments.radius, roofMeasurments.height, roofMeasurments.segments),
        new MeshStandardMaterial({ color: 'red' })
      );
      roof.position.y += houseMeasurments.height + roofMeasurments.height / 2;
      roof.rotation.y = rotationsAngles[45];

      door = new Mesh(new PlaneGeometry(2.2, 2.2), new MeshStandardMaterial());
      door.position.y = 1;
      door.position.z = 2.001;

      houseGroup.add(walls, roof, door);
      scene.add(houseGroup);
    }

    // ===== 🌳 Bushes =====
    {
      bush1 = createBush(0.5, { x: 0.8, y: 0.2, z: 2.2 });
      bush2 = createBush(0.25, { x: 1.4, y: 0.1, z: 2.1 });
      bush3 = createBush(0.4, { x: -0.8, y: 0.1, z: 2.2 });
      bush4 = createBush(0.15, { x: -1, y: 0.05, z: 2.6 });

      houseGroup.add(bush1, bush2, bush3, bush4);
    }

    // ===== 🪦 Graves =====
    {
      const graveGeometry = new BoxGeometry(0.6, 0.8, 0.2);
      const graveMaterial = new MeshStandardMaterial();
      graves = createGraves(20, graveGeometry, graveMaterial);
      scene.add(graves);
    }

    // ===== 🪟 Plane =====
    {
      floor = new Mesh(
        new PlaneGeometry(floorMeasurments.width, floorMeasurments.height),
        new MeshStandardMaterial({ color: 'pink' })
      );
      floor.rotation.x = -rotationsAngles[90];
      scene.add(floor);
    }
  }

  // ===== 🎥 CAMERA =====
  {
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

    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas);
      }
    });
  }

  // ===== 🪄 HELPERS =====
  {
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 });

    gui.onFinishChange(() => {
      const guiState = gui.save();
      localStorage.setItem('guiState', JSON.stringify(guiState));
    });

    const guiState = localStorage.getItem('guiState');
    if (guiState) gui.load(JSON.parse(guiState));

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
};

const animate = () => {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  cameraControls.update();

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
};

init();
animate();
