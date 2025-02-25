import {
  AmbientLight,
  BoxGeometry,
  Clock,
  GridHelper,
  LoadingManager,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  NearestFilter,
  MagnificationTextureFilter,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  Texture,
  TextureLoader,
  TorusGeometry,
  WebGLRenderer,
  NearestMipMapNearestFilter,
  LinearFilter,
  MeshBasicMaterial,
  SRGBColorSpace,
  Color,
  DoubleSide,
  MeshNormalMaterial,
  MeshMatcapMaterial,
  MeshDepthMaterial,
  MeshPhongMaterial,
  MeshToonMaterial,
  EquirectangularReflectionMapping,
  MeshPhysicalMaterial,
} from 'three';
import gsap from 'gsap';

import { resizeRendererToDisplaySize } from '../../../Helpers/responsiveness';
import '../../../style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { toggleFullScreen } from '../../../Helpers/fullscreen';
import GUI from 'lil-gui';
import rotationsAngles from '../../../Helpers/rotationAngles';
import colorHelper from '../../../Helpers/colorHelper';
import Stats from 'three/examples/jsm/libs/stats.module';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { createLoadingManager } from '../../../Helpers/createLoadingManager';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let loadingManager: LoadingManager;
let ambientLight: AmbientLight;
let pointLight: PointLight;
let sphere: Mesh;
let plane: Mesh;
let torus: Mesh;
let textureLoader: TextureLoader;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let clock: Clock;
let stats: Stats;
let cursor = {
  x: 0,
  y: 0,
};
let doorColorTexture: Texture;
let doorAlphaTexture: Texture;
let doorAmbientOcclusionTexture: Texture;
let doorHeightTexture: Texture;
let doorNormalTexture: Texture;
let doorMetalnessTexture: Texture;
let doorRoughnessTexture: Texture;
let matCapTexture: Texture;
let gradientsTexture: Texture;
let material: MeshPhysicalMaterial;
let rgbeLoader: RGBELoader;

const controls: { loadingManagerEnabled: boolean } = {
  loadingManagerEnabled: false,
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
    loadingManager = createLoadingManager(controls);
    textureLoader = new TextureLoader();

    textureLoader.manager = loadingManager;
  }

  // ===== 🧬TEXTURES =====
  {
    doorColorTexture = textureLoader.load('./textures/door/color.jpg');
    doorAlphaTexture = textureLoader.load('./textures/door/alpha.jpg');
    doorAmbientOcclusionTexture = textureLoader.load('./textures/door/ambientOcclusion.jpg');
    doorHeightTexture = textureLoader.load('./textures/door/height.jpg');
    doorNormalTexture = textureLoader.load('./textures/door/normal.jpg');
    doorMetalnessTexture = textureLoader.load('./textures/door/metalness.jpg');
    doorRoughnessTexture = textureLoader.load('./textures/door/roughness.jpg');

    matCapTexture = textureLoader.load('./textures/matcaps/3.png');
    gradientsTexture = textureLoader.load('./textures/gradients/3.jpg');

    doorColorTexture.colorSpace = SRGBColorSpace;
    matCapTexture.colorSpace = SRGBColorSpace;
  }
  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 0.4);
    pointLight = new PointLight('white', 20, 100);
    pointLight.position.set(-2, 2, 2);
    pointLight.castShadow = true;
    pointLight.shadow.radius = 4;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 4000;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    scene.add(ambientLight);
    scene.add(pointLight);
  }

  // ===== 🌐 ENVIROMENT MAP =====
  {
    rgbeLoader = new RGBELoader();
    rgbeLoader.load('./textures/environmentMap/2k.hdr', (environmentMap) => {
      environmentMap.mapping = EquirectangularReflectionMapping;
      scene.background = environmentMap;
      scene.environment = environmentMap;
    });
  }

  // ===== 📦 OBJECTS =====
  {
    // const color = colorHelper('red');
    // const material = new MeshBasicMaterial();
    // material.map = doorColorTexture;
    // // material.side = 2;
    // // material.wireframe = true;
    // // material.opacity = 0.5;
    // // material.transparent = true;
    // // material.alphaMap = doorAlphaTexture;
    // //material.side = DoubleSide;

    // const material = new MeshNormalMaterial();
    // material.flatShading = true;

    // const material = new MeshMatcapMaterial();
    // material.matcap = matCapTexture;

    // const material = new MeshDepthMaterial();

    // const material = new MeshLambertMaterial();

    // const material = new MeshPhongMaterial();
    // material.shininess = 100;
    // material.specular = new Color('0x1188ff');

    // const material = new MeshToonMaterial();

    // gradientsTexture.minFilter = NearestFilter;
    // gradientsTexture.magFilter = NearestFilter;
    // gradientsTexture.generateMipmaps = false;
    // material.gradientMap = gradientsTexture;

    // material = new MeshStandardMaterial();
    // material.metalness = 1;
    // material.roughness = 1;
    // //material.color = new Color('red');

    // material.map = doorColorTexture;
    // material.aoMap = doorAmbientOcclusionTexture;
    // material.aoMapIntensity = 1;

    // material.displacementMap = doorHeightTexture;
    // material.displacementScale = 0.06;

    // material.metalnessMap = doorMetalnessTexture;
    // material.roughnessMap = doorRoughnessTexture;

    // material.normalMap = doorNormalTexture;
    // material.normalScale.set(0.5, 0.5);

    // material.alphaMap = doorAlphaTexture;
    // material.transparent = true;

    material = new MeshPhysicalMaterial();
    material.metalness = 1;
    material.roughness = 1;
    //material.color = new Color('red');

    material.map = doorColorTexture;
    material.aoMap = doorAmbientOcclusionTexture;
    material.aoMapIntensity = 1;

    material.displacementMap = doorHeightTexture;
    material.displacementScale = 0.06;

    material.metalnessMap = doorMetalnessTexture;
    material.roughnessMap = doorRoughnessTexture;

    material.normalMap = doorNormalTexture;
    material.normalScale.set(0.5, 0.5);

    material.alphaMap = doorAlphaTexture;
    material.transparent = true;

    // //Clearcoat - Material
    // material.clearcoat = 1;
    // material.clearcoatRoughness = 0.5;

    // //Sheen - Fluffiness
    // material.sheen = 1;
    // material.sheenRoughness = 2;
    // material.sheenColor = new Color('red');

    // material.iridescence = 1;
    // material.iridescenceIOR = 1.6;
    // material.iridescenceThicknessRange = [100, 400];

    //Transmision
    material.transmission = 1;
    material.ior = 2.417;
    material.thickness = 0.9;

    sphere = new Mesh(new SphereGeometry(0.5, 64, 64), material);
    plane = new Mesh(new PlaneGeometry(1, 1, 100, 100), material);
    torus = new Mesh(new TorusGeometry(0.3, 0.2, 64, 128), material);

    sphere.position.x = -1.5;
    plane.position.x = 0;
    torus.position.x = 1.5;

    scene.add(sphere, plane, torus);
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
    const gui = new GUI({ title: '🐞 Lesson 11 GUI', width: 300 });
    const cubeOneFolder = gui.addFolder('Cube Folder');

    cubeOneFolder.add(material, 'metalness', 0, 1, 0.1);
    cubeOneFolder.add(material, 'roughness', 0, 1, 0.1);
    cubeOneFolder.addColor(material, 'color');
    cubeOneFolder.add(material, 'aoMapIntensity', 0, 3, 0.1);
    cubeOneFolder.add(material, 'displacementScale', 0, 0.1, 0.001);
    // cubeOneFolder.add(material, 'iridescence', 0, 1, 0.1);
    // cubeOneFolder.add(material, 'iridescenceIOR', 1, 2, 0.1);
    // cubeOneFolder.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1).name('Iridescence 0');
    // cubeOneFolder.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1).name('Iridescence 1');

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
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  stats.update();
  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime;
  plane.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = -0.15 * elapsedTime;
  plane.rotation.x = -0.15 * elapsedTime;
  torus.rotation.x = -0.15 * elapsedTime;

  cameraControls.update();

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
