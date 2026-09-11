import * as THREE from 'three/webgpu'
import { wgslFn, uniform, uv, colorSpaceToWorking } from 'three/tsl'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import cyberFujiShader from './shaders/cyberFuji/fragment.wgsl?raw'

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const size = {
  width: window.innerWidth,
  height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(45, size.width / size.height, 0.1, 100)
camera.position.x = 14
camera.position.y = 15
camera.position.z = 12
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.05

const renderer = new THREE.WebGPURenderer({
  canvas: canvas,
  antialias: true,
  alpha: false
})
renderer.setSize(size.width, size.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const bakedTexture = new THREE.TextureLoader().load( 'assets/baked.jpg' )
// glTF models expect textures with flipY disabled
bakedTexture.flipY = false
// the baked image contains display (sRGB) colors
bakedTexture.colorSpace = THREE.SRGBColorSpace
const material = new THREE.MeshBasicMaterial({ map: bakedTexture })

// uniforms are TSL nodes, we update their .value every frame
const iTime = uniform(0)
const iResolution = uniform(new THREE.Vector2(16, 9))

const cyberFuji = wgslFn(cyberFujiShader)
const monitorPlaneMaterial = new THREE.MeshBasicNodeMaterial()
// the shadertoy shader outputs display-ready (sRGB) colors, tell three to treat them as such
monitorPlaneMaterial.colorNode = colorSpaceToWorking(cyberFuji({
  fragCoord: uv().mul(iResolution),
  iTime,
  iResolution,
}), THREE.SRGBColorSpace)

const loader = new GLTFLoader();
loader.load(
	// resource URL
	'assets/Room.glb',
	// called when the resource is loaded
	( gltf ) => {
    gltf.scene.traverse(child => {
      if (child.name === "Monitor_Plane") {
        child.material = monitorPlaneMaterial;
      } else {
        child.material = material;
      }
    })
    gltf.scene.position.y = -4
    scene.add(gltf.scene)
  }
);

const clock = new THREE.Clock()
const draw = () => {
  const elapsedTime = clock.getElapsedTime()

  iTime.value = elapsedTime

  controls.update()
  renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
  // Update size
  size.width = window.innerWidth
  size.height = window.innerHeight

  // Update camera
  camera.aspect = size.width / size.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(size.width, size.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

renderer.setAnimationLoop(draw)
