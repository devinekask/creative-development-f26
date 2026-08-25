import * as THREE from 'three';
import { createLights } from './objects/lights';
import { createSea } from './objects/seaFancy';
import { createSky } from './objects/sky';
import { createPlane } from './objects/planeFancy';

const mousePos = {x:0, y:0};
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
})
renderer.shadowMap.enabled = true;

const fov = 60;
const aspect = 2;
const near = 1;
const far = 10000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.y = 100;
camera.position.z = 200;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

let planeMesh, propellerMesh = undefined;
let seaMesh, skyMesh = undefined;
let seaAnimate = undefined;

const init = () => {

  const { hemisphereLight, shadowLight } = createLights();
  scene.add(hemisphereLight);
  scene.add(shadowLight);

  const { mesh: localSeaMesh, animate: localSeaAnimate } = createSea();
  seaMesh = localSeaMesh;
  seaAnimate = localSeaAnimate;
  seaMesh.position.y = -600;
  scene.add(seaMesh);

  const { mesh: localSkyMesh } = createSky();
  skyMesh = localSkyMesh;
  skyMesh.position.y = -600;
  scene.add(skyMesh);

  const { mesh: localPlaneMesh, propellerMesh: localPropellerMesh } = createPlane();
  planeMesh = localPlaneMesh;
  propellerMesh = localPropellerMesh;
  planeMesh.scale.set(.25,.25,.25);
  planeMesh.position.y = 100;
  scene.add(planeMesh);

  document.addEventListener('mousemove', handleMouseMove, false);
  requestAnimationFrame(render);
};

const render = () => {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  seaMesh.rotation.z += .005;
  skyMesh.rotation.z += .01;
  propellerMesh.rotation.x += 0.3;
  updatePlane();
  seaAnimate();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width  = canvas.clientWidth  * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

const handleMouseMove = (event) => {
  // here we are converting the mouse position value received 
  // to a normalized value varying between -1 and 1;
  // this is the formula for the horizontal axis:
  mousePos.x = -1 + (event.clientX / window.innerWidth)*2;

  // for the vertical axis, we need to inverse the formula 
  // because the 2D y-axis goes the opposite direction of the 3D y-axis
  mousePos.y = 1 - (event.clientY / window.innerHeight)*2;
};

const updatePlane = () => {
  // let's move the airplane between -100 and 100 on the horizontal axis, 
  // and between 25 and 175 on the vertical axis,
  // depending on the mouse position which ranges between -1 and 1 on both axes;
  // to achieve that we use a normalize function (see below)
  
  const targetX = normalize(mousePos.x, -1, 1, -100, 100);
  const targetY = normalize(mousePos.y, -1, 1, 25, 175);

  // update the airplane's position
  planeMesh.position.y = targetY;
  planeMesh.position.x = targetX;
};

const normalize = (v,vmin,vmax,tmin, tmax) => {
  const nv = Math.max(Math.min(v,vmax), vmin);
  const dv = vmax-vmin;
  const pc = (nv-vmin)/dv;
  const dt = tmax-tmin;
  const tv = tmin + (pc*dt);
  return tv;
};

init();