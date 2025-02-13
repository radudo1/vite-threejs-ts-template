
import {
    AmbientLight,
    AxesHelper,
    BoxGeometry,
    Clock,
    GridHelper,
    LoadingManager,
    Mesh,
    MeshLambertMaterial,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PlaneGeometry,
    PointLight,
    PointLightHelper,
    Scene,
    WebGLRenderer,
  } from 'three'
  import { DragControls } from 'three/examples/jsm/controls/DragControls'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
  import Stats from 'three/examples/jsm/libs/stats.module'
  import { toggleFullScreen } from '../helpers/fullscreen'
  import { resizeRendererToDisplaySize } from '../helpers/responsiveness'
  import '../style.css'

  
  const CANVAS_ID = 'scene'
  
  let canvas: HTMLElement
  let renderer: WebGLRenderer
  let scene: Scene
  let loadingManager: LoadingManager
  let ambientLight: AmbientLight
  let pointLight: PointLight
  let cube: Mesh
  let camera: PerspectiveCamera
  let cameraControls: OrbitControls
  let axesHelper: AxesHelper
  let pointLightHelper: PointLightHelper

  
  
  const animation = { enabled: false, play: true }
  
  init()
  animate()
  
  function init() {
    // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
    {
      canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = PCFSoftShadowMap
      scene = new Scene()
    }
  
    // ===== 👨🏻‍💼 LOADING MANAGER =====
    {
      loadingManager = new LoadingManager()
  
      loadingManager.onStart = () => {
        console.log('loading started')
      }
      loadingManager.onProgress = (url, loaded, total) => {
        console.log('loading in progress:')
        console.log(`${url} -> ${loaded} / ${total}`)
      }
      loadingManager.onLoad = () => {
        console.log('loaded!')
      }
      loadingManager.onError = () => {
        console.log('❌ error while loading')
      }
    }
  
    // ===== 💡 LIGHTS =====
    {
      ambientLight = new AmbientLight('white', 0.4)
      pointLight = new PointLight('white', 20, 100)
      pointLight.position.set(-2, 2, 2)
      pointLight.castShadow = true
      pointLight.shadow.radius = 4
      pointLight.shadow.camera.near = 0.5
      pointLight.shadow.camera.far = 4000
      pointLight.shadow.mapSize.width = 2048
      pointLight.shadow.mapSize.height = 2048
      scene.add(ambientLight)
      scene.add(pointLight)
    }
  
    // ===== 📦 OBJECTS =====
    {
      const sideLength = 1
      const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
      const cubeMaterial = new MeshStandardMaterial({
        color: '#f69f1f',
        metalness: 0.5,
        roughness: 0.7,
      })
      cube = new Mesh(cubeGeometry, cubeMaterial)
      cube.castShadow = true
      cube.position.y = 0.5
  
      const planeGeometry = new PlaneGeometry(3, 3)
      const planeMaterial = new MeshLambertMaterial({
        color: 'gray',
        emissive: 'teal',
        emissiveIntensity: 0.2,
        side: 2,
        transparent: true,
        opacity: 0.4,
      })
      const plane = new Mesh(planeGeometry, planeMaterial)
      plane.rotateX(Math.PI / 2)
      plane.receiveShadow = true
  
      scene.add(cube)
    }
  
    // ===== 🎥 CAMERA =====
    {
      camera = new PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
      camera.position.set(2, 2, 2)
      camera.lookAt(cube.position)
    }
  
    // ===== 🕹️ CONTROLS =====
    {


    }
  
    // ===== 🪄 HELPERS =====
    {
      axesHelper = new AxesHelper(4)
      axesHelper.visible = true
      scene.add(axesHelper)


      const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
      gridHelper.position.y = -0.01
      scene.add(gridHelper)
    }

  }
  
  function animate() {
    requestAnimationFrame(animate)
  
    //stats.update()
    /* if (animation.enabled && animation.play) {
      animations.rotate(cube, clock, Math.PI / 3)
      animations.bounce(cube, clock, 1, 0.5, 0.5)
    } */
  
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }
  
  
    renderer.render(scene, camera)
  }
  