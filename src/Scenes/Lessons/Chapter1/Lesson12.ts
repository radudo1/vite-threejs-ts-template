import {
  AmbientLight,
  BoxGeometry,
  Clock,
  GridHelper,
  Group,
  LoadingManager,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  TorusGeometry,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
import { resizeRendererToDisplaySize } from '../../../Helpers/responsiveness';
import '../../../style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { createLoadingManager } from '../../../Helpers/createLoadingManager';
import { initializeScene } from '../../../Helpers/initializeScene';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { bounce, rotate } from '../../../Helpers/animations';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let loadingManager: LoadingManager;
let ambientLight: AmbientLight;
let pointLight: PointLight;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let fontLoader: FontLoader;
let textGeometry: TextGeometry;
let text: Mesh;
let textMaterial: MeshMatcapMaterial;
let donutGroup: Group;
let textureLoader: TextureLoader;
let matCapTexture: Texture;
let stats: Stats;
let textGroup: Group;
let clock: Clock;
let sonicModel: Group;

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
    matCapTexture = new TextureLoader(loadingManager).load('textures/matcaps/3.png');
    matCapTexture.colorSpace = SRGBColorSpace;
  }

  // ===== 📜 FONTS =====
  {
    fontLoader = new FontLoader(loadingManager);
    // fontLoader.load('fonts/helvetiker_regular.typeface.json', (font) => {
    //   textGroup = new Group();
    //   const text = 'Hello';
    //   const material = new MeshToonMaterial({ color: 'orange' });

    //   text.split('').forEach((char, index) => {
    //     const charGeometry = new TextGeometry(char, {
    //       font: font,
    //       size: 0.5,
    //       depth: 0.2,
    //       curveSegments: 12,
    //       bevelEnabled: true,
    //       bevelThickness: 0.03,
    //       bevelSize: 0.02,
    //       bevelOffset: 0,
    //       bevelSegments: 5,
    //     });

    //     const charMesh = new Mesh(charGeometry, material);
    //     charMesh.position.x = index * 0.5; // Adjust spacing between characters
    //     textGroup.add(charMesh);
    //   });

    //   textGroup.position.set(0, 1, 0); // Adjust the position of the entire text group
    fontLoader.load('fonts/helvetiker_regular.typeface.json', (font) => {
      donutGroup = new Group();
      textGeometry = new TextGeometry('Sonic', {
        font: font,
        size: 3,
        depth: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
      });
      textGeometry.computeBoundingBox();
      textGeometry.center();

      textMaterial = new MeshMatcapMaterial({ color: '#001E76' });

      textMaterial.matcap = matCapTexture;
      textMaterial.shadowSide = 2;
      textMaterial.flatShading = true;

      text = new Mesh(textGeometry, textMaterial);
      camera.lookAt(text.position);
      scene.add(text);

      for (let i = 0; i < 20; i++) {
        const donutGeometry = new TorusGeometry(0.5, 0.1, 16, 100);
        const donutMaterial = new MeshMatcapMaterial({ color: 'orange', matcap: matCapTexture });
        donutMaterial.opacity = 0.9;

        donutMaterial.transparent = true;
        const donut = new Mesh(donutGeometry, donutMaterial);

        donut.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
        donut.userData.initialPosition = donut.position.clone();
        donutGroup.add(donut);
      }
      scene.add(donutGroup);
    });
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
    const gltfLoader = new GLTFLoader(loadingManager);
    gltfLoader.load('./models/duck_gltf/rubber_duck_toy_1k.gltf', (gltf) => {
      sonicModel = gltf.scene;
      sonicModel.position.setX(0);
      sonicModel.position.setY(3);
      sonicModel.position.setZ(20);
      sonicModel.scale.set(10, 10, 10);
      sonicModel.animations = gltf.animations;

      sonicModel.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.material = new MeshMatcapMaterial({ matcap: matCapTexture });
        }
      });
      sonicModel.castShadow = true;
      scene.add(sonicModel);
    });
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(80, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 10);
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas);
    cameraControls.enableDamping = true;
    cameraControls.maxPolarAngle = Math.PI / 2;
    cameraControls.update();

    window.addEventListener('mousemove', (event: MouseEvent) => {
      cursor.x = event.clientX / window.innerWidth - 0.5;
      cursor.y = -(event.clientY / window.innerHeight - 0.5);
    });
  }

  // ===== 🪄 HELPERS =====
  {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    clock = new Clock();
  }
}

function animate() {
  requestAnimationFrame(animate);
  //   textGroup.children.forEach((charMesh, index) => {
  //     const delay = index * 0.1; // 0.5 second delay between each letter
  //     bounce(charMesh, clock, 1.5, 0.4, 0.3, delay);
  //     rotate(charMesh, clock, Math.PI / 4);
  //   });

  cameraControls.update();
  stats.update();
  if (donutGroup) {
    donutGroup.children.forEach((donut, index) => {
      const delay = index * 0.5;
      rotate(donut, clock, Math.PI / 4, delay);
      bounce(donut, clock, 1.5, 0.4, 0.3, delay);
    });
  }

  if (sonicModel) {
    moveDuck(sonicModel, clock);
  }
  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
function moveDuck(duck: Group, clock: Clock) {
  const elapsedTime = clock.getElapsedTime();
  const speed = 0.5;
  const distance = Math.sin(elapsedTime) * speed;

  // Move the duck forward and backward
  duck.position.x = distance;
  duck.position.z = Math.cos(elapsedTime) * speed;

  // Rotate the duck to face the direction of movement
  if (distance >= 0) {
    duck.rotation.y = Math.atan2(Math.cos(elapsedTime), Math.sin(elapsedTime));
  } else {
    duck.rotation.y = Math.atan2(-Math.cos(elapsedTime), -Math.sin(elapsedTime));
  }
}
