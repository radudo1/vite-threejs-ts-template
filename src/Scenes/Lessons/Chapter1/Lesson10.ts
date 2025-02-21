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
} from 'three';
import gsap from 'gsap';

import { resizeRendererToDisplaySize } from '../../../Helpers/responsiveness';
import '../../../style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { toggleFullScreen } from '../../../Helpers/fullscreen';
import GUI from 'lil-gui';
import rotationsAngles from '../../../Helpers/rotationAngles';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let loadingManager: LoadingManager;
let ambientLight: AmbientLight;
let pointLight: PointLight;
let cube: Mesh;
let colorTexture: Texture;
let sphere: Mesh;
let textureLoader: TextureLoader;
let checkboardTexture: Texture;
let minecraftTexture: Texture;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
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
      loadingManager.onError = (error) => {
        console.log('❌ error while loading: ', error);
      };
    }
  }

  // ===== 🧬TEXTURES =====
  {
    colorTexture = textureLoader.load('/textures/door/color.jpg');
    checkboardTexture = textureLoader.load('/textures/checkerboard-8x8.png');
    minecraftTexture = textureLoader.load('/textures/minecraft.png');
    /* 
    colorTexture.repeat.x = 2;
    colorTexture.repeat.y = 3;

    colorTexture.wrapS = MirroredRepeatWrapping;
    colorTexture.wrapT = MirroredRepeatWrapping;

    colorTexture.offset.x = 0.5;
    colorTexture.offset.y = 0.5;

    colorTexture.rotation = rotationsAngles['45'];
    colorTexture.center.x = 0.5;
    colorTexture.center.y = 0.5; 
    */

    // checkboardTexture.magFilter = NearestFilter;
    minecraftTexture.generateMipmaps = false;
    minecraftTexture.minFilter = NearestFilter;
    minecraftTexture.magFilter = NearestFilter;
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
    const sideLength = 1;
    const secondSideLength = 1;
    const cubeGeometry = new BoxGeometry(
      sideLength,
      sideLength,
      sideLength,
      secondSideLength,
      secondSideLength,
      secondSideLength
    );

    const sphereGeometry = new SphereGeometry(0.5, 16, 16, 0);
    const sphereMaterial = new MeshStandardMaterial({
      color: 'red',
      metalness: 0.5,
      roughness: 0.7,
    });
    sphere = new Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.position.x = 1;
    sphere.position.y = 0.5;

    const cubeMaterial = new MeshStandardMaterial({
      map: minecraftTexture,
      color: '#f69f1f',
    });
    cube = new Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.position.y = 0.5;

    const planeGeometry = new PlaneGeometry(3, 3);
    const planeMaterial = new MeshLambertMaterial({
      color: 'gray',
      emissive: 'teal',
      emissiveIntensity: 0.2,
      side: 2,
      transparent: true,
      opacity: 0.4,
    });
    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.rotateX(Math.PI / 2);
    plane.receiveShadow = true;

    scene.add(cube);
    //scene.add(sphere);
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(80, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 5);
    camera.lookAt(cube.position);
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas);
    cameraControls.target = cube.position.clone();
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
    interface IDebugObject {
      spin?: () => void;
      subdivision: number;
      width: number;
      height: number;
      depth: number;
    }

    const debugObject: IDebugObject = {
      subdivision: 1,
      width: 1,
      height: 1,
      depth: 1,
    };
    const controls = {
      enableRotation: cameraControls.autoRotate,
    };
    const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray');
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const gui = new GUI({ title: '🐞 Debug GUI', width: 300 });
    const cubeOneFolder = gui.addFolder('Cube Folder');
    cubeOneFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x');
    cubeOneFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z');
    cubeOneFolder.add(cube.material, 'wireframe');
    cubeOneFolder
      .add(controls, 'enableRotation')
      .name('Enable Rotation')
      .onChange((value: boolean) => {
        cameraControls.autoRotate = value;
      });
    cubeOneFolder.addColor(cube.material, 'color');
    cubeOneFolder.add(cube.material, 'metalness', 0, 1, 0.001);
    cubeOneFolder.add(cube.material, 'roughness', 0, 1);

    cubeOneFolder.add(cube.scale, 'x').min(0.1).max(2).step(0.01).name('scale x');
    cubeOneFolder.add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4).name('rotate x');
    cubeOneFolder.add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4).name('rotate y');
    cubeOneFolder.add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4).name('rotate z');
    cubeOneFolder
      .add(debugObject, 'subdivision')
      .min(1)
      .max(20)
      .step(1)

      .onFinishChange(() => {
        cube.geometry = new BoxGeometry(
          debugObject.width,
          debugObject.height,
          debugObject.depth,
          debugObject.subdivision,
          debugObject.subdivision,
          debugObject.subdivision
        );
      });
    debugObject.spin = () => {
      gsap.to(cube.rotation, { duration: 1, y: cube.rotation.y + Math.PI * 2 });
    };

    gui.add(debugObject, 'spin').name('Spin Cube');

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
  }
}

function animate() {
  requestAnimationFrame(animate);

  cameraControls.update();
  camera.lookAt(cube.position);
  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
