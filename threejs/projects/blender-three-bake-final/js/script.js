import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import cyberFujiVertexShader from './shaders/cyberFuji/vertex.glsl?raw'
import cyberFujiFragmentShader from './shaders/cyberFuji/fragment.glsl?raw'

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

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(size.width, size.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const texture = new THREE.TextureLoader().load( 'assets/baked.jpg' )
texture.flipY = -1
const material = new THREE.MeshBasicMaterial({ map: texture })

const monitorPlaneMaterial = new THREE.ShaderMaterial({
  uniforms: {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(16, 9) },
    iMouse: { value: new THREE.Vector2(0, 0) },
  },
  vertexShader: cyberFujiVertexShader,
  fragmentShader: cyberFujiFragmentShader,
})

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

  monitorPlaneMaterial.uniforms.iTime.value = elapsedTime
  
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(draw)
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

draw()