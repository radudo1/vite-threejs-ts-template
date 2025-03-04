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
let spotLight: SpotLight;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let clock: Clock;
let sphereShadow: Mesh;
let material: MeshStandardMaterial;
let simpleShadow: Texture;
let bakedShadow: Texture;
let sphere: Mesh;
let plane: Mesh;
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
    bakedShadow = textureLoader.load('/textures/bakedShadow.jpg');
    bakedShadow.colorSpace = SRGBColorSpace;
    simpleShadow = textureLoader.load('/textures/simpleShadow.jpg');
    simpleShadow.colorSpace = SRGBColorSpace;
  }
  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 1);

    directionalLight = new DirectionalLight('white', 1.5);
    directionalLight.position.set(2, 2, -1);
    directionalLight.castShadow = true;

    //Improves shadow quality multiply by 2
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    //Improves shadow quality
    directionalLight.shadow.camera.far = 10;
    directionalLight.shadow.camera.near = 1;

    //Optimize the render area and shadow quality
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;

    //Blur
    directionalLight.shadow.radius = 10;

    // Spot light
    const spotLight = new SpotLight(0xffffff, 3.6, 10, Math.PI * 0.3);
    spotLight.castShadow = true;
    spotLight.position.set(0, 2, 2);
    optimizeLightShadow(spotLight, 'high');
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 6;
    scene.add(spotLight);
    scene.add(spotLight.target);

    const spotLightCameraHelper = new CameraHelper(spotLight.shadow.camera);
    spotLightCameraHelper.visible = false;
    scene.add(spotLightCameraHelper);
    scene.add(ambientLight, directionalLight);

    //Point light
    const pointLight = new PointLight(0xffffff, 3.6);
    pointLight.castShadow = true;
    pointLight.position.set(-1, 1, 0);
    optimizeLightShadow(pointLight, 'high');
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 6;
    const pointLightCameraHelper = new CameraHelper(pointLight.shadow.camera);
    pointLightCameraHelper.visible = false;

    scene.add(pointLight, pointLightCameraHelper);
  }

  // ===== 🎨 MATERIALS =====
  {
    material = new MeshStandardMaterial({ color: 'orange' });
    material.roughness = 0.6;
  }
  // ===== 📦 OBJECTS =====
  {
    sphere = new Mesh(new SphereGeometry(0.5, 32, 32), material);
    plane = new Mesh(new PlaneGeometry(5, 5), material);
    sphereShadow = new Mesh(
      new PlaneGeometry(1.5, 1.5),
      new MeshBasicMaterial({ alphaMap: simpleShadow, color: 'black', transparent: true })
    );

    sphere.castShadow = true;
    plane.receiveShadow = true;

    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.5;

    sphereShadow.rotation.x = -rotationsAngles[90];
    sphereShadow.position.y = plane.position.y + 0.01;

    scene.add(sphere, plane, sphereShadow);
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

  //Animate Shpere
  sphere.position.x = Math.cos(elapsedTime) * 1.5;
  sphere.position.z = Math.sin(elapsedTime) * 1.5;
  sphere.position.y = Math.abs(Math.sin(elapsedTime * 5)) * 0.5;

  sphereShadow.position.x = sphere.position.x;
  sphereShadow.position.z = sphere.position.z;
  (sphereShadow.material as MeshBasicMaterial).opacity = (1 - sphere.position.y) * 0.5;

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
