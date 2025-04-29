import {
  AmbientLight,
  BoxGeometry,
  Clock,
  ConeGeometry,
  DirectionalLight,
  Fog,
  FogExp2,
  Group,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from 'three';

import Stats from 'three/examples/jsm/libs/stats.module';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { toggleFullScreen } from '../../../Helpers/fullscreen';
import { Sky } from 'three/examples/jsm/objects/Sky';
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
let doorLight: PointLight;

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

let floorAlphaTexture: Texture;
let floorColorTexture: Texture;
let floorARMTexture: Texture;
let floorNormalTexture: Texture;
let floorDisplacementTexture: Texture;

let wallColorTexture: Texture;
let wallARMTexture: Texture;
let wallNormalTexture: Texture;
let wallDisplacementTexture: Texture;

let roofColorTexture: Texture;
let roofARMTexture: Texture;
let roofNormalTexture: Texture;

let bushColorTexture: Texture;
let bushARMTexture: Texture;
let bushNormalTexture: Texture;

let bush2ColorTexture: Texture;
let bush2NormalTexture: Texture;
let bush2DisplacementTexture: Texture;
let stats: Stats;

let graveColorTexture: Texture;
let graveNormalTexture: Texture;
let graveARMTexture: Texture;

let doorColorTexture: Texture;
let doorNormalTexture: Texture;
let doorMetalnessTexture: Texture;
let doorAplhaTexture: Texture;
let doorAmbientOcclusionTexture: Texture;
let doorRoughnessTexture: Texture;
let doorHeightTexture: Texture;

let ghost1: PointLight;
let ghost2: PointLight;
let ghost3: PointLight;

const controls: { loadingManagerEnabled: boolean } = {
  loadingManagerEnabled: true,
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
    ambientLight = new AmbientLight('#86cdff', 0.257);
    directionalLight = new DirectionalLight('#86cdff', 1.5);
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
    // ===== 🪟 Floor Texture =====
    {
      floorAlphaTexture = textureLoader.load('./floor/alpha.jpg');
      floorColorTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg');
      floorARMTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg');
      floorNormalTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg');
      floorDisplacementTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.jpg');
      floorColorTexture.repeat.set(8, 8);
      floorARMTexture.repeat.set(8, 8);
      floorNormalTexture.repeat.set(8, 8);
      floorDisplacementTexture.repeat.set(8, 8);

      floorColorTexture.wrapS =
        floorColorTexture.wrapT =
        floorARMTexture.wrapS =
        floorARMTexture.wrapT =
        floorNormalTexture.wrapS =
        floorNormalTexture.wrapT =
        floorDisplacementTexture.wrapS =
        floorDisplacementTexture.wrapT =
          RepeatWrapping;

      floorColorTexture.colorSpace = SRGBColorSpace;
    }
    // ==== Walls Texture =====
    {
      wallColorTexture = textureLoader.load('./wall/mossy/mossy_brick_diff_1k.jpg');
      wallARMTexture = textureLoader.load('./wall/mossy/mossy_brick_arm_1k.jpg');
      wallNormalTexture = textureLoader.load('./wall/mossy/mossy_brick_nor_gl_1k.jpg');
      wallDisplacementTexture = textureLoader.load('./wall/mossy/mossy_brick_disp_1k.jpg');

      wallColorTexture.colorSpace = SRGBColorSpace;
    }
    // ===== 🎨 Roof Textures =====
    {
      roofColorTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_diff_1k.jpg');
      roofARMTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_arm_1k.jpg');
      roofNormalTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.jpg');

      roofColorTexture.repeat.set(3, 1);
      roofARMTexture.repeat.set(3, 1);
      roofNormalTexture.repeat.set(3, 1);

      roofColorTexture.wrapS = roofColorTexture.wrapS = roofARMTexture.wrapS = RepeatWrapping;
      roofColorTexture.colorSpace = SRGBColorSpace;
    }

    // ==== 🌳 Bushes Textures =====
    {
      bushColorTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.jpg');
      bushARMTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.jpg');
      bushNormalTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.jpg');
      bushColorTexture.colorSpace = SRGBColorSpace;

      bush2ColorTexture = textureLoader.load('./bush/nina/Bush.png');
      bush2NormalTexture = textureLoader.load('./bush/nina/Bush_Normal.png');
      bush2DisplacementTexture = textureLoader.load('./bush/nina/Bush_Displacement.png');

      bush2ColorTexture.colorSpace = SRGBColorSpace;
    }

    // ==== 🪦 Graves Textures =====
    {
      graveColorTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg');
      graveNormalTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg');
      graveARMTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg');
    }

    // ==== 🚪 Door Textures =====
    {
      doorColorTexture = textureLoader.load('./door/color.jpg');
      doorNormalTexture = textureLoader.load('./door/normal.jpg');
      doorMetalnessTexture = textureLoader.load('./door/metalness.jpg');
      doorAplhaTexture = textureLoader.load('./door/alpha.jpg');
      doorAmbientOcclusionTexture = textureLoader.load('./door/ambientOcclusion.jpg');
      doorRoughnessTexture = textureLoader.load('./door/roughness.jpg');
      doorHeightTexture = textureLoader.load('./door/height.jpg');

      doorColorTexture.colorSpace = SRGBColorSpace;
    }
  }
  // ===== 📦 OBJECTS =====
  {
    // ===== 🌐 House =====
    {
      houseGroup = new Group();
      walls = new Mesh(
        new BoxGeometry(houseMeasurments.width, houseMeasurments.height, houseMeasurments.depth, 100, 100),
        new MeshStandardMaterial({
          map: wallColorTexture,
          aoMap: wallARMTexture,
          roughnessMap: wallARMTexture,
          metalnessMap: wallARMTexture,
          normalMap: wallNormalTexture,
          displacementMap: wallDisplacementTexture,
          displacementScale: 0.1,
          displacementBias: -0.1,
        })
      );
      walls.position.y += houseMeasurments.height / 2;

      roof = new Mesh(
        new ConeGeometry(roofMeasurments.radius, roofMeasurments.height, roofMeasurments.segments),
        new MeshStandardMaterial({
          map: roofColorTexture,
          aoMap: roofARMTexture,
          roughnessMap: roofARMTexture,
          metalnessMap: roofARMTexture,
          normalMap: roofNormalTexture,
        })
      );
      roof.position.y += houseMeasurments.height + roofMeasurments.height / 2;
      roof.rotation.y = rotationsAngles[45];

      door = new Mesh(
        new PlaneGeometry(2.2, 2.2, 100, 100),
        new MeshStandardMaterial({
          map: doorColorTexture,
          transparent: true,
          normalMap: doorNormalTexture,
          metalnessMap: doorMetalnessTexture,
          alphaMap: doorAplhaTexture,
          aoMap: doorAmbientOcclusionTexture,
          roughnessMap: doorRoughnessTexture,
          displacementMap: doorHeightTexture,
          displacementScale: 0.15,
          displacementBias: -0.04,
        })
      );
      door.position.y = 1;
      door.position.z = 2.001;

      houseGroup.add(walls, roof, door);
      scene.add(houseGroup);
    }
    // ===== Door Light =====
    {
      doorLight = new PointLight('#ff7d46', 1, 7);
      doorLight.position.set(0, 2.2, 2.2);
      doorLight.castShadow = true;
      houseGroup.add(doorLight);
    }

    // ===== 🌳 Bushes =====
    {
      const applyBushTextures = (bush: Mesh) => {
        const material = bush.material as MeshStandardMaterial;
        material.map = bush2ColorTexture;
        material.displacementMap = bush2DisplacementTexture;
        material.normalMap = bush2NormalTexture;
        material.displacementScale = 0.35;
      };
      bush1 = createBush(0.5, { x: 1.5, y: 0.2, z: 2.2 });
      bush2 = createBush(0.25, { x: 2.1, y: 0.1, z: 2.1 });
      bush3 = createBush(0.4, { x: -1, y: 0.1, z: 2.2 });
      bush4 = createBush(0.15, { x: -1, y: 0.05, z: 2.6 });

      applyBushTextures(bush1);
      applyBushTextures(bush2);
      applyBushTextures(bush3);
      applyBushTextures(bush4);

      houseGroup.add(bush1, bush2, bush3, bush4);
    }

    // ===== 🪦 Graves =====
    {
      const graveGeometry = new BoxGeometry(0.6, 0.8, 0.2);
      const graveMaterial = new MeshStandardMaterial({
        map: graveColorTexture,
        aoMap: graveARMTexture,
        roughnessMap: graveARMTexture,
        metalnessMap: graveARMTexture,
        normalMap: graveNormalTexture,
      });
      graves = createGraves(20, graveGeometry, graveMaterial);
      scene.add(graves);
    }

    // ===== 🪟 Plane =====
    {
      floor = new Mesh(
        new PlaneGeometry(floorMeasurments.width, floorMeasurments.height, 100, 100),
        new MeshStandardMaterial({
          alphaMap: floorAlphaTexture,
          transparent: true,
          map: floorColorTexture,
          aoMap: floorARMTexture,
          roughnessMap: floorARMTexture,
          metalnessMap: floorARMTexture,
          normalMap: floorNormalTexture,
          displacementMap: floorDisplacementTexture,
          displacementScale: 0.3,
          displacementBias: -0.1,
        })
      );
      floor.rotation.x = -rotationsAngles[90];
      scene.add(floor);
    }
  }
  // ===== GHOSTS =====
  {
    ghost1 = new PointLight('#8800ff', 6);
    ghost2 = new PointLight('#00ff00', 6);
    ghost3 = new PointLight('#ff0000', 6);
    ghost1.castShadow = true;
    ghost2.castShadow = true;
    ghost3.castShadow = true;

    scene.add(ghost1, ghost2, ghost3);
  }

  {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    directionalLight.castShadow = true;

    walls.castShadow = true;
    walls.receiveShadow = true;

    roof.castShadow = true;
    floor.receiveShadow = true;
  }
  // ===== SKY ===
  {
    const sky = new Sky();
    scene.add(sky);

    sky.material.uniforms['turbidity'].value = 10;
    sky.material.uniforms['rayleigh'].value = 3;
    sky.material.uniforms['mieCoefficient'].value = 0.1;
    sky.material.uniforms['mieDirectionalG'].value = 0.95;
    sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95);
    sky.scale.set(100, 100, 100);
  }
  // ==== FOG ====
  {
    scene.fog = new FogExp2('#04343f', 0.1);
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

    gui.add(controls, 'loadingManagerEnabled').name('Loading Manager');
    gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.01).name('Displacement Scale');
    gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.01).name('Displacement Bias');

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
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  cameraControls.update();
  stats.update();
  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  const updateGhostPosition = (ghost: PointLight, speed: number, radius: number, heightMultiplier: number) => {
    const angle = elapsedTime * speed;
    ghost.position.x = Math.cos(angle) * radius;
    ghost.position.z = Math.sin(angle) * radius;
    ghost.position.y = Math.sin(angle * heightMultiplier) * Math.sin((angle * 2) / 3);
  };

  updateGhostPosition(ghost1, 0.5, 4, 3);
  updateGhostPosition(ghost2, 0.3, 5, 2);
  updateGhostPosition(ghost3, 0.7, 3, 4);
  renderer.render(scene, camera);
};

init();
animate();
