import { WebGLRenderer } from 'three'

export const resizeRendererToDisplaySize = (renderer: WebGLRenderer) => {
  const canvas = renderer.domElement
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const pixelRatio = Math.min(window.devicePixelRatio, 2)
  const needResize = canvas.width !== width || canvas.height !== height
  console.log("Entered Function");
  
  if (needResize) {
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(pixelRatio)
  }
  return needResize
}
