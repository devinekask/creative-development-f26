// https://www.shadertoy.com/view/XsVSDz
import * as THREE from 'three/webgpu';
import { wgslFn, uniform, uv, texture } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import plasmaBufferShader from './shaders/plasma/buffer.wgsl?raw';
import plasmaFragmentShader from './shaders/plasma/fragment.wgsl?raw';

const $canvas = document.getElementById('webgl');
let renderer, camera, scene, controls;
let clock = new THREE.Clock();
let plane, material;
let renderTarget, rtScene, rtCamera, rtMaterial;
const mouse = new THREE.Vector2();

// uniforms are TSL nodes, we update their .value every frame
const rtUniforms = {
  iTime: uniform(0),
  iMouse: uniform(new THREE.Vector2(0, 0)),
  iResolution: uniform(new THREE.Vector2(2, 2)),
};
const uniforms = {
  iTime: uniform(0),
  iMouse: uniform(new THREE.Vector2(0, 0)),
  iResolution: uniform(new THREE.Vector2(2, 2)),
};

const init = () => {
  console.log('init');

  renderer = new THREE.WebGPURenderer({canvas: $canvas, alpha: false});
  // shadertoy shaders output display-ready colors, so skip the linear to sRGB conversion
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  // shader renderer
  const effectPlaneGeometry = new THREE.PlaneGeometry(2, 2);
  const plasmaBuffer = wgslFn(plasmaBufferShader);
  rtMaterial = new THREE.MeshBasicNodeMaterial();
  rtMaterial.colorNode = plasmaBuffer({
    fragCoord: uv().mul(rtUniforms.iResolution),
    iTime: rtUniforms.iTime,
    iMouse: rtUniforms.iMouse,
    iResolution: rtUniforms.iResolution,
  });
  const effectPlane = new THREE.Mesh(effectPlaneGeometry, rtMaterial);
  rtCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  rtScene = new THREE.Scene();
  rtScene.add(effectPlane);
  renderTarget = new THREE.RenderTarget(100, 100, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
  // end shader renderer

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.set(0, 0, 10);

  scene = new THREE.Scene();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const geometry = new THREE.PlaneGeometry(2, 2);
  const plasma = wgslFn(plasmaFragmentShader);
  // the render target texture is passed twice: once as texture, once as sampler
  const iChannel0 = texture(renderTarget.texture);
  material = new THREE.MeshBasicNodeMaterial();
  material.colorNode = plasma({
    fragCoord: uv().mul(uniforms.iResolution),
    iTime: uniforms.iTime,
    iMouse: uniforms.iMouse,
    iResolution: uniforms.iResolution,
    iChannel0: iChannel0,
    iChannel0Sampler: iChannel0,
  });
  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  renderer.setAnimationLoop(draw);
};

const draw = () => {
  const elapsedTime = clock.getElapsedTime();

  rtUniforms.iTime.value = elapsedTime;
  rtUniforms.iMouse.value.set(mouse.x, mouse.y);
  uniforms.iTime.value = elapsedTime * 2;
  uniforms.iMouse.value.set(mouse.x, mouse.y);

  renderer.setRenderTarget(renderTarget);
  renderer.render(rtScene, rtCamera);
  renderer.setRenderTarget(null);

  controls.update();
  renderer.render(scene, camera);
};

const resize = () => {
  renderer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

init();
