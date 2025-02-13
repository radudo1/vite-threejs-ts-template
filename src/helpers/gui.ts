import GUI from 'lil-gui'

import * as THREE from 'three';


export const setupGUI = () => {
    
const animation = { enabled: true, play: true };
const dragControls = { enabled: true }; // Define dragControls
  const cameraControls = { autoRotate: true }; // Define cameraControls

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial()
  );
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(10, 10, 10);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

  const axesHelper = new THREE.AxesHelper(5);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);

  const gui = new GUI({ title: '🐞 Debug GUI', width: 300 });

  const cubeOneFolder = gui.addFolder('Cube one');

  cubeOneFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x');
  cubeOneFolder
    .add(cube.position, 'y')
    .min(-5)
    .max(5)
    .step(1)
    .name('pos y')
    .onChange(() => (animation.play = false))
    .onFinishChange(() => (animation.play = true));
  cubeOneFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z');

  cubeOneFolder.add(cube.material, 'wireframe');
  cubeOneFolder.addColor(cube.material, 'color');
  cubeOneFolder.add(cube.material, 'metalness', 0, 1, 0.1);
  cubeOneFolder.add(cube.material, 'roughness', 0, 1, 0.1);

  cubeOneFolder
    .add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate x');
  cubeOneFolder
    .add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate y')
    .onChange(() => (animation.play = false))
    .onFinishChange(() => (animation.play = true));
  cubeOneFolder
    .add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate z');

  cubeOneFolder.add(animation, 'enabled').name('animated');

  const controlsFolder = gui.addFolder('Controls');
  controlsFolder.add(dragControls, 'enabled').name('drag controls');

  const lightsFolder = gui.addFolder('Lights');
  lightsFolder.add(pointLight, 'visible').name('point light');
  lightsFolder.add(ambientLight, 'visible').name('ambient light');

  const helpersFolder = gui.addFolder('Helpers');
  helpersFolder.add(axesHelper, 'visible').name('axes');
  helpersFolder.add(pointLightHelper, 'visible').name('pointLight');

  const cameraFolder = gui.addFolder('Camera');
  cameraFolder.add(cameraControls, 'autoRotate');

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

  return gui;
};