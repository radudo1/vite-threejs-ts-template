import {
  BufferAttribute,
  BufferGeometry,
  Clock,
  ConeGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshToonMaterial,
  NearestFilter,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  TorusGeometry,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three';
import GUI from 'lil-gui';
import gsap from 'gsap';

import { resizeRendererToDisplaySize } from '../../../Helpers/responsiveness';
import '../../../style.css';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let textureLoader: TextureLoader;
let camera: PerspectiveCamera;
let cameraGroup: Group;
let clock: Clock;
let gui: GUI;

let material: MeshToonMaterial;
let particlesMaterial: PointsMaterial;
let sectionMeshes: Mesh[] = [];
let sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let scrollY = 0;
let currentSection = 0;
let cursor = { x: 0, y: 0 };
let previousTime = 0;
const objectsDistance = 4;

const parameters = {
  materialColor: '#ffeded',
};

init();
animate();

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`);
    renderer = new WebGLRenderer({ canvas: canvas as HTMLCanvasElement, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    scene = new Scene();
  }

  // ===== 👨🏻‍💼 TEXTURE LOADER =====
  {
    textureLoader = new TextureLoader();
  }

  // ===== 💡 LIGHTS =====
  {
    const directionalLight = new DirectionalLight('#ffffff', 3);
    directionalLight.position.set(1, 1, 0);
    scene.add(directionalLight);
  }

  // ===== 🎨 MATERIALS & OBJECTS =====
  {
    const gradientTexture = textureLoader.load('textures/gradients/3.jpg');
    gradientTexture.magFilter = NearestFilter;

    material = new MeshToonMaterial({
      color: parameters.materialColor,
      gradientMap: gradientTexture,
    });

    const mesh1 = new Mesh(new TorusGeometry(1, 0.4, 16, 60), material);
    const mesh2 = new Mesh(new ConeGeometry(1, 2, 32), material);
    const mesh3 = new Mesh(new TorusKnotGeometry(0.8, 0.35, 100, 16), material);

    mesh1.position.x = 2;
    mesh2.position.x = -2;
    mesh3.position.x = 2;

    mesh1.position.y = -objectsDistance * 0;
    mesh2.position.y = -objectsDistance * 1;
    mesh3.position.y = -objectsDistance * 2;

    scene.add(mesh1, mesh2, mesh3);
    sectionMeshes = [mesh1, mesh2, mesh3];
  }

  // ===== ✨ PARTICLES =====
  {
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const particlesGeometry = new BufferGeometry();
    particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3));

    particlesMaterial = new PointsMaterial({
      color: parameters.materialColor,
      sizeAttenuation: true,
      size: 0.07,
    });

    const particles = new Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
  }

  // ===== 🎥 CAMERA =====
  {
    cameraGroup = new Group();
    scene.add(cameraGroup);

    camera = new PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = 6;
    cameraGroup.add(camera);
  }

  // ===== 📈 CLOCK =====
  {
    clock = new Clock();
  }

  // ===== 🎛️ GUI =====
  {
    gui = new GUI();

    gui.addColor(parameters, 'materialColor').onChange(() => {
      material.color.set(parameters.materialColor);
      particlesMaterial.color.set(parameters.materialColor);
    });
  }

  // ===== 📐 RESIZE HANDLER =====
  {
    window.addEventListener('resize', () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  // ===== 📜 SCROLL HANDLER =====
  {
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      const newSection = Math.round(scrollY / sizes.height);

      if (newSection !== currentSection) {
        currentSection = newSection;

        gsap.to(sectionMeshes[currentSection].rotation, {
          duration: 1.5,
          ease: 'power2.inOut',
          x: '+=6',
          y: '+=3',
          z: '+=1.5',
        });
      }
    });
  }

  // ===== 🖱️ CURSOR HANDLER =====
  {
    window.addEventListener('mousemove', (event) => {
      cursor.x = event.clientX / sizes.width - 0.5;
      cursor.y = event.clientY / sizes.height - 0.5;
    });
  }
}

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Animate meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
