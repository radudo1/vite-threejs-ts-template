import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  GridHelper,
  LoadingManager,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from 'three';

import { resizeRendererToDisplaySize } from '../../../Helpers/responsiveness';
import '../../../style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { toggleFullScreen } from '../../../Helpers/fullscreen';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let loadingManager: LoadingManager;
let ambientLight: AmbientLight;
let pointLight: PointLight;
let cube: Mesh;
let sphere: Mesh;
let crazyGeometry: Mesh;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let cursor = {
  x: 0,
  y: 0,
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

    loadingManager.onStart = () => {
      console.log('loading started');
    };
    loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:');
      console.log(`${url} -> ${loaded} / ${total}`);
    };
    loadingManager.onLoad = () => {
      console.log('loaded!');
    };
    loadingManager.onError = () => {
      console.log('❌ error while loading');
    };
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

  // ===== 📦 OBJECTS =====
  {
    // Create an empty BufferGeometry
    const geometry = new BufferGeometry();

    // Create 50 triangles (450 values)
    const count = 1000;
    const positionsArray = new Float32Array(count * 3 * 3);
    for (let i = 0; i < count * 3 * 3; i++) {
      positionsArray[i] = (Math.random() - 0.5) * 4;
    }

    // Create the attribute and name it 'position'
    const positionsAttribute = new BufferAttribute(positionsArray, 3);
    geometry.setAttribute('position', positionsAttribute);
    const material = new MeshBasicMaterial({ color: 'red', wireframe: true });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(80, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 5);
    //camera.lookAt(cube.position);
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas);
    // cameraControls.target = cube.position.clone();
    cameraControls.enableDamping = true;
    cameraControls.autoRotate = true;
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
    const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray');
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);
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
