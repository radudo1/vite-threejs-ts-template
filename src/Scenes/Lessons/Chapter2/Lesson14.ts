import {
  AmbientLight,
  BoxGeometry,
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
  RectAreaLight,
  Scene,
  SphereGeometry,
  SpotLight,
  SpotLightHelper,
  TextureLoader,
  TorusGeometry,
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
let ambientLight: AmbientLight;
let pointLight: PointLight;
let textureLoader: TextureLoader;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let material: MeshStandardMaterial;
let sphere: Mesh;
let cube: Mesh;
let torus: Mesh;
let plane: Mesh;
let clock: Clock;
let directionalLight: DirectionalLight;
let hemisphereLight: HemisphereLight;
let rectAreaLight: RectAreaLight;
let spotLight: SpotLight;

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
  }
  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 1);

    directionalLight = new DirectionalLight('orange', 0.5);
    directionalLight.position.set(1, 0.25, 0);

    hemisphereLight = new HemisphereLight('red', 'blue', 0.9);

    pointLight = new PointLight('orange', 1.5);
    pointLight.position.set(1, 0, 1);
    pointLight.castShadow = true;
    pointLight.distance = 20;

    rectAreaLight = new RectAreaLight('purple', 10, 3, 1);
    rectAreaLight.position.set(-1, 1, 1);
    rectAreaLight.lookAt(0, 0, 0);

    spotLight = new SpotLight(0x78ff00, 4.5, 20, Math.PI * 0.2, 0.25, 1);
    spotLight.position.set(0, 2, 3);
    spotLight.target.position.x = -2;

    //=== HELPERS ===
    {
      const hemisphereLightHelper = new HemisphereLightHelper(hemisphereLight, 0.5);
      const directionalLightHelper = new DirectionalLightHelper(directionalLight, 0.5);
      const pointLightHelper = new PointLightHelper(pointLight, 0.3);
      const spotlightHelper = new SpotLightHelper(spotLight);
      const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
      scene.add(hemisphereLightHelper, directionalLightHelper, pointLightHelper, spotlightHelper, rectAreaLightHelper);
    }

    scene.add(ambientLight, pointLight, directionalLight, hemisphereLight, rectAreaLight, spotLight, spotLight.target);
  }
  // ===== MATERIALS =====
  {
    material = new MeshStandardMaterial({ color: 'snow' });
    material.roughness = 0.7;
  }

  // ===== 📦 OBJECTS =====
  {
    sphere = new Mesh(new SphereGeometry(0.5, 32, 32), material);
    sphere.position.x = -1.5;
    cube = new Mesh(new BoxGeometry(0.75, 0.75, 0.75), material);
    torus = new Mesh(new TorusGeometry(0.3, 0.2, 32, 64), material);
    torus.position.x = 1.5;
    plane = new Mesh(new PlaneGeometry(5, 5), material);

    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.65;

    scene.add(sphere, cube, torus, plane);
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

  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime;
  cube.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = 0.15 * elapsedTime;
  cube.rotation.x = 0.15 * elapsedTime;
  torus.rotation.x = 0.15 * elapsedTime;

  cameraControls.update();

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
