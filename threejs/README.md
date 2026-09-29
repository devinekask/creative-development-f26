# ThreeJS

Doing 2D WebGPU might have seemed a lot of work already, and things get a bit more complicated when we start adding the 3rd dimension. This is why we'll use [Three.js](https://threejs.org/) to abstract some of the math and shader stuff.

Three.js itself has some great [documentation](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene) and [an extensive list of examples](https://threejs.org/examples/).

To learn how to work with Three.js, we are going to go with the lesson series at https://threejs.org/manual/#en/fundamentals. We'll go through some of the pages there, before creating an interactive 3D experience.

## Hello Three.js

Three.js comes with two renderers: the classic `WebGLRenderer` and the newer `WebGPURenderer`. As we've just been writing raw WebGPU, we'll continue on that path and use the WebGPU renderer. It automatically falls back to WebGL2 on browsers without WebGPU support. Custom shaders are written in WGSL, and are plugged into three.js' node based materials (more on that at the end of this chapter).

To be able to run the Three.js code, you'll need to link the Three.js library. We'll just use the CDN for now. And, as you're just experimenting and learning right now, you don't really need to go through the trouble of setting up a bundler / transpiler. We'll switch to a bundler for the bigger projects later in this chapter.

To tell our browser where to find the threejs module, add an `<script type="importmap">` tag to your html:

```html
<script type="importmap">{
  "imports": {
    "three": "https://unpkg.com/three@0.186.0/build/three.webgpu.js",
    "three/webgpu": "https://unpkg.com/three@0.186.0/build/three.webgpu.js",
    "three/tsl": "https://unpkg.com/three@0.186.0/build/three.tsl.js",
    "three/addons/": "https://unpkg.com/three@0.186.0/examples/jsm/"
  }
}</script>
```

The `three/webgpu` entry is the WebGPU build of three.js, `three/tsl` contains the shading language helpers we'll need for custom shaders, and `three/addons/` gives access to the extras (controls, loaders, ...). The plain `three` entry points to the WebGPU build as well, because the addons import from `three` internally.

You'll write your code in a second script tag, with type module. This way you can use the import syntax to import the Three.js library:

```html
<script type="module">
  import * as THREE from 'three/webgpu';
</script>
```

> **Following the threejs.org manual with WebGPU**
>
> The manual pages use the WebGL renderer. When coding along, apply these changes:
>
> - import from `'three/webgpu'` instead of `'three'` (it exports everything `'three'` does, plus the WebGPU renderer and node materials).
> - `new THREE.WebGLRenderer({canvas})` becomes `new THREE.WebGPURenderer({canvas, alpha: false})`. The `alpha: false` gives you the opaque black canvas the manual shows, leave it out if you want a transparent canvas.
> - The WebGPU renderer initializes asynchronously, so you can't render right away. Instead of kicking off a `requestAnimationFrame` loop yourself, hand your render function to `renderer.setAnimationLoop(render)`: it waits for the renderer to be ready and then calls `render` every frame (with the same timestamp argument `requestAnimationFrame` gives you). Don't call `requestAnimationFrame` inside `render` anymore.
>
> ```javascript
> // manual (WebGL)
> const renderer = new THREE.WebGLRenderer({canvas});
> function render(time) {
>   // ...
>   renderer.render(scene, camera);
>   requestAnimationFrame(render);
> }
> requestAnimationFrame(render);
>
> // ours (WebGPU)
> const renderer = new THREE.WebGPURenderer({canvas, alpha: false});
> function render(time) {
>   // ...
>   renderer.render(scene, camera);
> }
> renderer.setAnimationLoop(render);
> ```
>
> For a one-off render without a loop, wait for the renderer first: `await renderer.init(); renderer.render(scene, camera);`

You'll start by going through the page at https://threejs.org/manual/#en/fundamentals where you'll build a basic Three.js scene, familiarizing yourself with some basic Three.js concepts.

Work your way through the following lessons:

- https://threejs.org/manual/#en/responsive
- https://threejs.org/manual/#en/primitives
- https://threejs.org/manual/#en/scenegraph

Read up on materials at https://threejs.org/manual/#en/materials

And continue coding with:

- https://threejs.org/manual/#en/textures (up until Filtering and Mips)

After handling the basics of textures, read through the following pages, and check the live demos. No need to code these yourself, just get yourself familiar with the different types and options:

- https://threejs.org/manual/#en/lights
- https://threejs.org/manual/#en/cameras
- https://threejs.org/manual/#en/shadows

## The Aviator

We'll build a fun little interactive 3D scene, based on the tutorial at https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/. Since that tutorial was written, there have been a few changes to threejs, so the guide in this course will be slightly different.

![end result of tutorial, controlling a 3d plane by moving the mouse](images/threejs-aviator-final.gif)

### Project setup

For this project we'll switch from the CDN import map to a bundler. Our code will be split into several modules (a file per object, a file for the colors), and in the next exercise we'll import shader files as well. [Vite](https://vite.dev/) serves our project during development, resolves the `three` imports from `node_modules`, and can build an optimized version of the project when we're done.

Create a new folder for the project, and initialize it as an npm project, with three.js as a dependency and Vite as a development dependency:

```bash
npm init -y
npm install three
npm install -D vite
```

Optionally, install the type definitions as well, they give you autocompletion for the three.js api in VS Code:

```bash
npm install -D @types/three
```

Add a `dev` script to the `scripts` section of your `package.json`:

```json
"scripts": {
  "dev": "vite"
},
```

Running `npm run dev` starts the Vite development server. It serves the `index.html` from your project root at the url it prints in the terminal, and reloads the page whenever you save a file.

### Html and boilerplate

Start with a basic `index.html` file, which has a couple of style rules to make sure the canvas is fullscreen and our body has a gradient background:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>The Aviator</title>
  <style>
    html, body {
      margin: 0;
      height: 100%;
    }
    body {
      background: linear-gradient(#e4e0ba, #f7d9aa);
    }
    #c {
      width: 100%;
      height: 100%;
      display: block;
    }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script src="js/script.js" type="module"></script>
</body>
</html>
```

Note that there's no import map in this html file: Vite resolves the imports from `node_modules`. In `js/script.js` we add the basic boilerplate to setup a renderer, scene and camera, with resize logic as well. We import from `three/webgpu`: the plain `three` entry of the npm package is the WebGL build, which doesn't contain the WebGPU renderer (the CDN import map we used before pointed `three` at the WebGPU build for us).

```javascript
import * as THREE from 'three/webgpu';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGPURenderer({
  canvas,
  alpha: true,
  antialias: true
})

const fov = 60;
const aspect = 2;
const near = 1;
const far = 10000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.y = 100;
camera.position.z = 200;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

const init = () => {
  renderer.setAnimationLoop(render);
};

const render = () => {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
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
}

init();
```

### Defining some colors

Create a file `constants/colors.js` which exports a colors const:

```javascript
export const Colors = {
  red:0xf25346,
  white:0xd8d0d1,
  brown:0x59332e,
  pink:0xF5986E,
  brownDark:0x23190f,
  blue:0x68c3c0,
};
```

### Creating your first mesh

Let's create a mesh for the sea. Add a file `objects/sea.js` with the following code:

```javascript
import * as THREE from 'three/webgpu';
import { Colors } from '../constants/colors';

export const createSea = () => {
  // create the geometry (shape) of the cylinder;
  // the parameters are: 
  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  const geom = new THREE.CylinderGeometry(600,600,800,40,10);
  
  // rotate the geometry on the x axis
  geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  
  // create the material 
  const mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.6,
    flatShading: true,
  });

  // To create an object in Three.js, we have to create a mesh 
  // which is a combination of a geometry and some material
  const mesh = new THREE.Mesh(geom, mat);

  // Allow the sea to receive shadows
  mesh.receiveShadow = true;

  return {
    mesh
  }
};
```

This method returns an object, with a property "mesh", which points to the mesh that was created in that method.

Import the createSea method in your main script, and add the mesh to the scene:

```javascript
import { createSea } from './objects/sea';

// here be some code

const init = () => {

  // adding the sea mesh
  const { mesh: seaMesh } = createSea();
  seaMesh.position.y = -600;
  scene.add(seaMesh);
  // end adding the sea mesh

  renderer.setAnimationLoop(render);
};

// here be some code
```

You should see part of a dark cylinder on your screen:

![a dark cylinder](images/aviator-sea-dark.png)

### Adding some lights

Let's add some lights to the scene. Add a file `objects/lights.js` with the following code:

```javascript
import * as THREE from 'three/webgpu';

export const createLights = () => {
  // A hemisphere light is a gradient colored light; 
  // the first parameter is the sky color, the second parameter is the ground color, 
  // the third parameter is the intensity of the light
  const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
  
  // A directional light shines from a specific direction. 
  // It acts like the sun, that means that all the rays produced are parallel. 
  const shadowLight = new THREE.DirectionalLight(0xffffff, .9);

  // Set the direction of the light  
  shadowLight.position.set(150, 350, 350);
  
  // Allow shadow casting 
  shadowLight.castShadow = true;

  // define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // define the resolution of the shadow; the higher the better, 
  // but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  return {
    hemisphereLight,
    shadowLight
  }
}
```

Write the necessary code in your main script, to call this function, adding the lights to your scene:

```javascript
const { hemisphereLight, shadowLight } = createLights();
scene.add(hemisphereLight);
scene.add(shadowLight);
```

You should see the following result:

![a blue cylinder](images/aviator-sea-light.png)

### Adding the sky

Let's create a sky with some clouds. The clouds will be a combination of a couple of meshes.

Create a file `objects/cloud.js` with the following code:

```javascript
import * as THREE from 'three/webgpu';
import { Colors } from '../constants/colors';

export const createCloud = () => {
  // Create an empty container that will hold the different parts of the cloud
  const mesh = new THREE.Object3D();
  
  // create a cube geometry;
  // this shape will be duplicated to create the cloud
  const geom = new THREE.BoxGeometry(20,20,20);
  
  // create a material; a simple white material will do the trick
  const mat = new THREE.MeshPhongMaterial({
    color:Colors.white,  
  });
  
  // duplicate the geometry a random number of times
  const nBlocs = 3+Math.floor(Math.random()*3);
  for (let i=0; i<nBlocs; i++ ){
    
    // create the mesh by cloning the geometry
    const m = new THREE.Mesh(geom, mat); 
    
    // set the position and the rotation of each cube randomly
    m.position.x = i*15;
    m.position.y = Math.random()*10;
    m.position.z = Math.random()*10;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    
    // set the size of the cube randomly
    const s = .1 + Math.random()*.9;
    m.scale.set(s,s,s);
    
    // allow each cube to cast and to receive shadows
    m.castShadow = true;
    m.receiveShadow = true;
    
    // add the cube to the container we first created
    mesh.add(m);
  }
  return {
    mesh
  }
}
```

This is the code for one single cloud. Create another file `objects/sky.js` where we'll create multiple clouds:

```javascript
import * as THREE from 'three/webgpu';
import { createCloud } from "./cloud";

export const createSky = () => {
  // Create an empty container
  const mesh = new THREE.Object3D();
  
  // choose a number of clouds to be scattered in the sky
  const nClouds = 20;
  
  // To distribute the clouds consistently,
  // we need to place them according to a uniform angle
  const stepAngle = Math.PI*2 / nClouds;
  
  // create the clouds
  for(let i=0; i<nClouds; i++){
    const { mesh: cloudMesh } = createCloud();
   
    // set the rotation and the position of each cloud;
    // for that we use a bit of trigonometry
    const a = stepAngle*i; // this is the final angle of the cloud
    const h = 750 + Math.random()*200; // this is the distance between the center of the axis and the cloud itself

    // Trigonometry!!! I hope you remember what you've learned in Math :)
    // in case you don't: 
    // we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
    cloudMesh.position.y = Math.sin(a)*h;
    cloudMesh.position.x = Math.cos(a)*h;

    // rotate the cloud according to its position
    cloudMesh.rotation.z = a + Math.PI/2;

    // for a better result, we position the clouds 
    // at random depths inside of the scene
    cloudMesh.position.z = -400-Math.random()*400;
    
    // we also set a random scale for each cloud
    const s = 1+Math.random()*2;
    cloudMesh.scale.set(s,s,s);

    // do not forget to add the mesh of each cloud in the scene
    mesh.add(cloudMesh);  
  }

  return {
    mesh
  };
}
```

End with adding the sky to the scene in your main script:

```javascript
const { mesh: skyMesh } = createSky();
skyMesh.position.y = -600;
scene.add(skyMesh);
```

![clouds around a cylinder](images/aviator-clouds.png)

### Creating the airplane

Add another file called `objects/plane.js` with the following code:

```javascript
import * as THREE from 'three/webgpu';
import { Colors } from '../constants/colors';

export const createPlane = () => {
  
  const mesh = new THREE.Object3D();
  
  // Create the cabin
  const geomCockpit = new THREE.BoxGeometry(60,50,50,1,1,1);
  const matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
  const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  mesh.add(cockpit);
  
  // Create the engine
  const geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
  const matEngine = new THREE.MeshPhongMaterial({color:Colors.white, flatShading: true});
  const engine = new THREE.Mesh(geomEngine, matEngine);
  engine.position.x = 40;
  engine.castShadow = true;
  engine.receiveShadow = true;
  mesh.add(engine);
  
  // Create the tail
  const geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
  const matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
  const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
  tailPlane.position.set(-35,25,0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  mesh.add(tailPlane);
  
  // Create the wing
  const geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
  const matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
  const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  mesh.add(sideWing);
  
  // propeller
  const geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
  const matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, flatShading: true});
  const propellerMesh = new THREE.Mesh(geomPropeller, matPropeller);
  propellerMesh.castShadow = true;
  propellerMesh.receiveShadow = true;
  
  // blades
  const geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
  const matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, flatShading: true});
  
  const blade = new THREE.Mesh(geomBlade, matBlade);
  blade.position.set(8,0,0);
  blade.castShadow = true;
  blade.receiveShadow = true;
  propellerMesh.add(blade);
  propellerMesh.position.set(50,0,0);
  mesh.add(propellerMesh);

  return {
    mesh
  }
};
```

Add the plane to the scene in your main script:

```javascript
  const { mesh: planeMesh } = createPlane();
  planeMesh.scale.set(.25,.25,.25);
  planeMesh.position.y = 100;
  scene.add(planeMesh);
```

![simple plane](images/aviator-simple-plane.png)

We're still missing something: shadows. While our meshes are set to cast and receive shadows, we haven't enabled shadows on our renderer yet.

Set the shadowMapEnabled property to true on your renderer:

```javascript
renderer.shadowMap.enabled = true;
```

And enjoy some shadows:

![simple plane with shadows](images/aviator-simple-plane-shadows.png)

### Adding mouse interaction

We'll add some mouse interaction to our scene, so we can control the plane with our mouse.

First of all, at the top of your main script, define a mousePos const, where we will store the mouse coordinates:

```javascript
const mousePos = {x:0, y:0};
```

Define a handleMouseMove event handler, where you update that mousePos object:

```javascript
const handleMouseMove = (event) => {
  // here we are converting the mouse position value received 
  // to a normalized value varying between -1 and 1;
  // this is the formula for the horizontal axis:
  mousePos.x = -1 + (event.clientX / window.innerWidth)*2;

  // for the vertical axis, we need to inverse the formula 
  // because the 2D y-axis goes the opposite direction of the 3D y-axis
  mousePos.y = 1 - (event.clientY / window.innerHeight)*2;
};
```

Finally, in your init function, link this event handler to the mousemove event on the document:

```javascript
document.addEventListener('mousemove', handleMouseMove, false);
```

We now have a global mouse position, which gets updated automatically when the mouse moves.

Let's update our render loop, so that we take this mouse position into account when rendering the scene.

Create an updatePlane method and a normalize method (to easily transform the mouse position to a value which makes sense for the plane)

```javascript
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
```

Call the `updatePlane` method in your render loop (you'll get an error):

> Uncaught ReferenceError: planeMesh is not defined

We'll need to move the planeMesh definition into a global variable, so we can access it from the updatePlane method:

```javascript
// at the top of your main file:
let planeMesh = undefined;
```

```javascript
// when creating the plane
const { mesh: localPlaneMesh } = createPlane();
planeMesh = localPlaneMesh;
```

You should now be able to move the plane using your mouse cursor.

### Rotating the clouds and cylinder

We'll update the rotations of the clouds and cylinder in our render loop. In order to do so, we will need to store those mesh definitions in a global variable as well, just like we did with the planeMesh.

```javascript
// at the top of your main file
let seaMesh, skyMesh = undefined;
```

```javascript
// update code to store the meshes in those global variables:
const { mesh: localSeaMesh } = createSea();
seaMesh = localSeaMesh;
seaMesh.position.y = -600;
scene.add(seaMesh);

const { mesh: localSkyMesh } = createSky();
skyMesh = localSkyMesh;
skyMesh.position.y = -600;
scene.add(skyMesh);
```

We're now able to modify those meshes in our render loop:

```javascript
seaMesh.rotation.z += .005;
skyMesh.rotation.z += .01;
updatePlane();
```

### Animating the propeller

A plane with no rotating propellet is not a plane. Let's add some animation to the propeller. In order to access the propeller from our render loop, we'll need to return the propeller mesh from our createPlane method as well:

```javascript
return {
  mesh,
  propellerMesh
}
```

In your main script, store the propeller mesh in a global variable:

```javascript
const { mesh: localPlaneMesh, propellerMesh: localPropellerMesh } = createPlane();
planeMesh = localPlaneMesh;
propellerMesh = localPropellerMesh;
```

Finally, update your render loop, so it looks like this:

```javascript
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

  renderer.render(scene, camera);
};
```

## Aviator - Part 2

In the previous part, we've created a basic scene with a plane, clouds and a sea. In this part, we'll make the plane look cooler, and create a moving Sea. Like the initial part, this is an updated version of the original tutorial at https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/.

### Fancy Plane

Duplicate the plane.js file and call it planeFancy.js. Replace the import in your main script, so it used the fancy plane instead of the simple plane.

We're going to modify the vertex positions of the cockpit. Since threejs version 125, you'll need to do this through the position attribute of the shader. This is a bit more complicated than it used to be, but it's also more performant.

Add the following code to your planeFancy.js file, right after creating the `geomCockpit`:

```javascript
const positionAttribute = geomCockpit.attributes.position;
const positionArray = positionAttribute.array;
console.log(positionArray.length / 3);
```

This code gets the position attribute and array, and logs the number of vertices (each vertex has 3 components, for x, y and z, so we divide the length by 3).

You should see the following output in your console:

> 24

This means we have 24 vertices in our cockpit, which seems like a lot for a simple box. This is because we have 6 faces, each with 4 vertices. If we want better control of the vertices, it's better to merge the vertices of the faces, so we'd have 8 vertices instead of 24.

We can merge vertices with [the BufferGeometryUtils.mergeVertices](https://threejs.org/docs/#examples/en/utils/BufferGeometryUtils.mergeVertices) method. This only works when the vertex normals and uvs also correspond, which won't be the case. We'll remove those attributes from the geometry.

Add an import for the BufferGeometryUtils at the top of your planeFancy.js file:

```javascript
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
```

Update the geomCockpit definition, so it removes the normal and uv attributes, and merges the vertices:

```javascript
let geomCockpit = new THREE.BoxGeometry(60,50,50,1,1,1);
geomCockpit.deleteAttribute( 'normal' );
geomCockpit.deleteAttribute( 'uv' );
geomCockpit = BufferGeometryUtils.mergeVertices( geomCockpit );

const positionAttribute = geomCockpit.attributes.position;
const positionArray = positionAttribute.array;

// test update vertex position
positionArray[0] += 100;

positionAttribute.needsUpdate = true;
```

![a plane with a modified vertex position](images/aviator-vertex-try.png)

The goal is to make the plane smaller at the back, by modifying the vertex y and z positions of the vertices at the back of the plane. Try to figure this out yourself, before looking at the solution below.

```javascript
positionArray[ 4*3+1 ] -= 10;
positionArray[ 4*3+2 ] += 10;
positionArray[ 5*3+1 ] += 10;
positionArray[ 5*3+2 ] += 10;
positionArray[ 6*3+1 ] -= 10;
positionArray[ 6*3+2 ] -= 10;
positionArray[ 7*3+1 ] += 10;
positionArray[ 7*3+2 ] -= 10;
```

![a plane with a modified vertex position](images/aviator-vertices-cockpit.png)

Notice how the wings no longer cast a shadow on the cockpit? This is because our mesh no longer has vertex normals. We can fix this by adding a call to [computeVertexNormals](https://threejs.org/docs/#api/en/core/BufferGeometry.computeVertexNormals) after merging the vertices:

```javascript
geomCockpit.computeVertexNormals();
```

### Morphed Sea

Duplicate the sea.js file into a seaFancy.js, and replace the import in your main script. We'll make this a low-poly moving sea.

1. Remove the normal and uv attributes from the geometry, and merge the vertices.
2. Add some logic to set the vertex x and y position to a random offset

```javascript
for (let i = 0; i < positionArray.length; i += 3) {
  const angle = Math.random()*Math.PI*2;
  const amplitude = 5 + Math.random()*15;
  positionArray[i] = positionArray[i] + Math.cos(angle)*amplitude;
  positionArray[i+1] = positionArray[i+1] + Math.sin(angle)*amplitude;
}
```

![morphed sea](images/aviator-morphed-sea.png)

### Animated Sea

We'll now move the sea vertices, so the waves go up and down. In order to do so we will store the original coordinates, target angles and amplitudus in a separate array, and export a method to update the sea.

Replace the previous for-loop with the following:

```javascript
const waves = [];
for (let i = 0; i < positionArray.length; i += 3) {
  const angle = Math.random()*Math.PI*2;
  const amplitude = 5 + Math.random()*15;
  const speed = 0.016 + Math.random()*0.032;
  waves.push({
    x: positionArray[i],
    y: positionArray[i+1],
    angle,
    amplitude,
    speed,
  })
}
```

Right after that for-loop, within your createSea() method, define a function called "animate":

```javascript
const animate = () => {
  for (let i = 0; i < waves.length; i++) {
    let positionIndex = i*3;
    waves[i].angle += waves[i].speed;
    const { x, y, angle, amplitude } = waves[i];
    positionArray[positionIndex] = x + Math.cos(angle)*amplitude;
    positionArray[positionIndex+1] = y + Math.sin(angle)*amplitude;
  }
  positionAttribute.needsUpdate = true;
}
// animate one initial step
animate();
```

Add that animate function to your export:

```javascript
return {
  mesh,
  animate
}
```

In your main script, store the animate method in a global variable (make sure to define `seaAnimate` at the top of your main script)):

```javascript
// adjusted code destructuring the seaMesh and animate method
const { mesh: localSeaMesh, animate: localSeaAnimate } = createSea();
seaMesh = localSeaMesh;
seaAnimate = localSeaAnimate;
```

Call the global `seaAnimate` method in your render loop, and you should see a moving sea.

## Shadertoy shader in Three.js

In the WebGPU chapter you ported a Shadertoy shader to WGSL and rendered it on a fullscreen quad (see [Using a Shadertoy shader](../webgpu/README.md#using-a-shadertoy-shader)). In this exercise we'll bring a Shadertoy shader into a Three.js project: the shader becomes the material of a mesh in a 3D scene you can orbit around. Along the way you'll learn how Three.js lets you plug WGSL into its materials, and how to render a shader into a texture, so it can be used by another shader.

We'll port the plasma effect at https://www.shadertoy.com/view/XsVSDz. Open it and look at the tabs above the code: next to **Image** there's a **Buffer A** tab. Buffer A is a second shader, which renders a color palette into a texture. The Image shader receives that texture as `iChannel0` and uses it to color the plasma. So we'll need two WGSL shaders and two render passes.

![plasma shader on a plane in a three.js scene](images/three-shadertoy-05-final.png)

The finished project is in `projects/shadertoy`, try to follow the steps before peeking.

### Project setup

Create a new Vite project, the same way as for The Aviator: `npm init -y`, `npm install three`, `npm install -D vite`, and the `dev` script in your `package.json`.

Create an `index.html` with a fullscreen canvas:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Three Shadertoy</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <canvas id="webgl"></canvas>
  <script src="js/script.js" type="module"></script>
</body>
</html>
```

And the stylesheet, `css/style.css`:

```css
*
{
    margin: 0;
    padding: 0;
}

html,
body
{
    overflow: hidden;
}

#webgl
{
    position: fixed;
    top: 0;
    left: 0;
    outline: none;
    width: 100%;
    height: 100%;
}
```

Create an empty `js/script.js` and run `npm run dev`. You should get a blank page, without errors in the console.

### Three.js boilerplate

Add the basic Three.js setup to `js/script.js`: a WebGPU renderer, a camera, a scene with orbit controls, and a plane with a plain magenta material. We'll replace that material with our shader in the next step.

```javascript
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $canvas = document.getElementById('webgl');
let renderer, camera, scene, controls;
let clock = new THREE.Clock();
let plane, material;
const mouse = new THREE.Vector2();

const init = () => {
  renderer = new THREE.WebGPURenderer({canvas: $canvas, alpha: false});

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.set(0, 0, 10);

  scene = new THREE.Scene();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const geometry = new THREE.PlaneGeometry(2, 2);
  material = new THREE.MeshBasicMaterial({color: 0xff00ff});
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
  controls.update();
  renderer.render(scene, camera);
};

const resize = () => {
  renderer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

init();
```

A few things to note:

- The renderer is created with `alpha: false`, so we get a black background instead of a transparent canvas.
- `resize()` sets the canvas size to the window size times the device pixel ratio. The third argument of `setSize` is `false`, so Three.js doesn't touch the css size of the canvas (our stylesheet already makes it fullscreen).
- We keep track of the mouse position and create a `Clock`. We'll pass the mouse position and the elapsed time to the shader later.

![a magenta plane](images/three-shadertoy-01-plane.png)

### A first WGSL function

Three.js materials for the WebGPU renderer are *node materials*: their properties (color, opacity, position, ...) can be nodes, small building blocks which get compiled into the final shader. The `three/tsl` module (TSL stands for Three Shading Language) contains functions to create those nodes. One of them, `wgslFn`, takes a string with a WGSL function and turns it into a node you can call.

Create a file `js/shaders/plasma/fragment.wgsl` with a small test function:

```wgsl
fn plasma(fragCoord: vec2f, iResolution: vec2f) -> vec4f {
  let uv = fragCoord / iResolution;
  return vec4f(uv, 0.0, 1.0);
}
```

Compared to the WebGPU chapter, there's no `@fragment` entry point, no `@builtin(position)` and no uniform struct with `@group` / `@binding` decorations. It's a plain function: everything it needs comes in as parameters, and it returns the color. Three.js generates the entry point and the bindings for us.

Import the file in your `script.js`. The `?raw` suffix is a Vite feature which imports the file contents as a string (the `.wgsl` extension is just a convention, Vite doesn't care):

```javascript
import { wgslFn, uniform, uv } from 'three/tsl';

import plasmaFragmentShader from './shaders/plasma/fragment.wgsl?raw';
```

Replace the magenta material with a `MeshBasicNodeMaterial`, and set its `colorNode` to a call of our WGSL function:

```javascript
  const uniforms = {
    iResolution: uniform(new THREE.Vector2(2, 2)),
  };

  const geometry = new THREE.PlaneGeometry(2, 2);
  const plasma = wgslFn(plasmaFragmentShader);
  material = new THREE.MeshBasicNodeMaterial();
  material.colorNode = plasma({
    fragCoord: uv().mul(uniforms.iResolution),
    iResolution: uniforms.iResolution,
  });
  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
```

What's happening here:

- `wgslFn(plasmaFragmentShader)` reads the signature of the function in the string (its name, parameters and types) and returns a javascript function.
- Calling that function with an object creates the node. The properties of the object are matched **by name** to the parameters of the WGSL function, so the names have to correspond.
- The values you pass in are nodes as well. `uv()` is the uv coordinate of the plane (0 to 1 in both directions), `uniform(...)` is a value we can change from javascript (more on that in the next step). `uv().mul(uniforms.iResolution)` multiplies the two: this is how we rebuild Shadertoy's `fragCoord`. On Shadertoy that's the pixel coordinate, going from 0 to the resolution of the canvas. Our "canvas" is the plane, and we tell the shader it's 2 by 2 "pixels" big, the size of our plane. As the shader divides `fragCoord` by `iResolution` right away, the actual value doesn't matter much.
- `colorNode` is the color output of the material: whatever our function returns is what gets drawn.

Your plane should now show a uv gradient: red increases to the right, green increases to the top.

![uv gradient on the plane](images/three-shadertoy-02-uv.png)

### Uniforms from javascript

A Shadertoy shader uses a couple of built-in inputs: `iTime`, `iMouse`, `iResolution`, ... In the WebGPU chapter you had to create a uniform buffer for these, calculate the offsets, and write into it every frame. With TSL, a `uniform()` node does all of that: you create it with an initial value, and update its `.value` property whenever you want.

Complete the uniforms object with `iTime` and `iMouse`, and move it to the top of your script (right after the `mouse` declaration), as we'll need it in the render loop as well:

```javascript
// uniforms are TSL nodes, we update their .value every frame
const uniforms = {
  iTime: uniform(0),
  iMouse: uniform(new THREE.Vector2(0, 0)),
  iResolution: uniform(new THREE.Vector2(2, 2)),
};
```

Pass all of them to the shader function:

```javascript
  material.colorNode = plasma({
    fragCoord: uv().mul(uniforms.iResolution),
    iTime: uniforms.iTime,
    iMouse: uniforms.iMouse,
    iResolution: uniforms.iResolution,
  });
```

Update their values at the start of your `draw` function:

```javascript
const draw = () => {
  const elapsedTime = clock.getElapsedTime();

  uniforms.iTime.value = elapsedTime * 2;
  uniforms.iMouse.value.set(mouse.x, mouse.y);

  controls.update();
  renderer.render(scene, camera);
};
```

Add the new parameters to the WGSL function as well (again: the names must match), and use the time to animate the blue channel, to check that everything is connected:

```wgsl
fn plasma(fragCoord: vec2f, iTime: f32, iMouse: vec2f, iResolution: vec2f) -> vec4f {
  let uv = fragCoord / iResolution;
  return vec4f(uv, 0.5 + 0.5 * sin(iTime), 1.0);
}
```

The gradient should now pulse: more blue, less blue.

### Porting the Image shader

Time to port the actual shader. This is the GLSL code in the **Image** tab on Shadertoy:

```glsl
const vec2 vp = vec2(320.0, 200.0);

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	float t = iTime * 10.0 + iMouse.x;
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 p0 = (uv - 0.5) * vp;
    vec2 hvp = vp * 0.5;
	vec2 p1d = vec2(cos( t / 98.0),  sin( t / 178.0)) * hvp - p0;
	vec2 p2d = vec2(sin(-t / 124.0), cos(-t / 104.0)) * hvp - p0;
	vec2 p3d = vec2(cos(-t / 165.0), cos( t / 45.0))  * hvp - p0;
    float sum = 0.5 + 0.5 * (
		cos(length(p1d) / 30.0) +
		cos(length(p2d) / 20.0) +
		sin(length(p3d) / 25.0) * sin(p3d.x / 20.0) * sin(p3d.y / 15.0));
    fragColor = texture(iChannel0, vec2(fract(sum), 0));
}
```

Ignore the last line for now (we don't have `iChannel0` yet), and try to port the rest yourself, using the [WGSL cheat sheet](../webgpu/README.md#wgsl-cheat-sheet-coming-from-glsl). Return `sum` as a grayscale color, so you can see the result. Tip: the module-level `const vp` can become a `let` inside the function.

This is the solution:

```wgsl
fn plasma(fragCoord: vec2f, iTime: f32, iMouse: vec2f, iResolution: vec2f) -> vec4f {
  let vp = vec2f(320.0, 200.0);
  let t = iTime * 10.0 + iMouse.x;
  let uv = fragCoord / iResolution;
  let p0 = (uv - 0.5) * vp;
  let hvp = vp * 0.5;
  let p1d = vec2f(cos( t / 98.0),  sin( t / 178.0)) * hvp - p0;
  let p2d = vec2f(sin(-t / 124.0), cos(-t / 104.0)) * hvp - p0;
  let p3d = vec2f(cos(-t / 165.0), cos( t / 45.0))  * hvp - p0;
  let sum = 0.5 + 0.5 * (
    cos(length(p1d) / 30.0) +
    cos(length(p2d) / 20.0) +
    sin(length(p3d) / 25.0) * sin(p3d.x / 20.0) * sin(p3d.y / 15.0));
  return vec4f(vec3f(fract(sum)), 1.0);
}
```

The usual rules applied: `vec2` becomes `vec2f`, `float` becomes `f32` (or just `let`, WGSL infers the type), the `out` parameter becomes a return value, and the math functions keep their names. Move your mouse horizontally to change the speed of the animation.

![grayscale plasma](images/three-shadertoy-03-grayscale.png)

### Buffer A: rendering a shader into a texture

Look at the **Buffer A** tab on Shadertoy:

```glsl
const float pi = 3.1415926435;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  float i = fragCoord.x / iResolution.x;
  vec3 t = (iTime + iMouse.y) / vec3(63.0, 78.0, 45.0);
  vec3 cs = cos(i * pi * 2.0 + vec3(0.0, 1.0, -0.5) * pi + t);
  fragColor = vec4(0.5 + 0.5 * cs, 1.0);
}
```

It generates a horizontal color gradient which changes over time: a color palette. The Image shader looks up a color in that palette with `texture(iChannel0, vec2(fract(sum), 0))` (the y coordinate is always 0, only the x coordinate matters). To make this work in Three.js, we'll render this shader into a *render target*: a texture we can draw into, and afterwards use like any other texture.

Create `js/shaders/plasma/buffer.wgsl` with the port of Buffer A:

```wgsl
// generates the color palette the plasma shader samples from
fn plasmaBuffer(fragCoord: vec2f, iTime: f32, iMouse: vec2f, iResolution: vec2f) -> vec4f {
  let pi = 3.1415926435;
  let i = fragCoord.x / iResolution.x;
  let t = (iTime + iMouse.y) / vec3f(63.0, 78.0, 45.0);
  let cs = cos(i * pi * 2.0 + vec3f(0.0, 1.0, -0.5) * pi + t);
  return vec4f(0.5 + 0.5 * cs, 1.0);
}
```

Import it, together with the `texture` node function from TSL:

```javascript
import { wgslFn, uniform, uv, texture } from 'three/tsl';

import plasmaBufferShader from './shaders/plasma/buffer.wgsl?raw';
import plasmaFragmentShader from './shaders/plasma/fragment.wgsl?raw';
```

Rendering a shader into a texture works the same as rendering it to the screen: we need a scene with a mesh, a camera, and a call to `renderer.render`. Add the variables for this second scene at the top of your script, right after `plane` and `material`:

```javascript
let renderTarget, rtScene, rtCamera, rtMaterial;
```

Shadertoy passes `iTime` and `iMouse` to Buffer A as well, so add a second set of uniforms, right before the existing `uniforms` object:

```javascript
const rtUniforms = {
  iTime: uniform(0),
  iMouse: uniform(new THREE.Vector2(0, 0)),
  iResolution: uniform(new THREE.Vector2(2, 2)),
};
```

In `init`, right after creating the renderer, set up the render target scene: a 2 by 2 plane with the buffer shader as material, viewed by an orthographic camera which shows exactly the -1 to 1 range, so the plane fills the whole render target:

```javascript
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
```

The render target is only 100 by 100 pixels: the palette is a smooth gradient, so we don't need more, and the linear filters make sure lookups in between two pixels are interpolated.

In `draw`, update the buffer uniforms and render the buffer scene into the render target, before rendering the main scene. `setRenderTarget(null)` switches back to rendering to the canvas:

```javascript
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
```

Nothing changes on screen yet, the plasma is still grayscale. To check the palette, temporarily show the render target texture on the main plane, by replacing the `colorNode` of the main material:

```javascript
  material.colorNode = texture(renderTarget.texture);
```

![the color palette rendered into the render target](images/three-shadertoy-04-palette.png)

Remove that line again once you've seen the palette.

### Sampling the texture in the shader

Finally, we'll pass the palette into the plasma shader. In WGSL, sampling a texture needs two things: the texture and a sampler. Add both as parameters to the function, and replace the grayscale return with the texture lookup:

```wgsl
fn plasma(fragCoord: vec2f, iTime: f32, iMouse: vec2f, iResolution: vec2f, iChannel0: texture_2d<f32>, iChannel0Sampler: sampler) -> vec4f {
  // ... unchanged ...
  return textureSample(iChannel0, iChannel0Sampler, vec2f(fract(sum), 0.0));
}
```

In javascript, create a texture node from the render target texture, and pass it for **both** parameters. A TSL texture node knows about its texture and its sampler, and hands over the right one depending on the parameter type:

```javascript
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
```

You should see the colored plasma. Compare it with the original on Shadertoy though: ours is quite a bit brighter and washed out.

### Fixing the colors

Three.js does color management: it calculates lighting in a linear color space, and converts the final image to sRGB when it's displayed. Our shader doesn't do any lighting, it outputs colors which are meant to be displayed as-is, like Shadertoy does. Three.js applies its conversion on top of that, which brightens the colors.

As our whole scene consists of the shader, we can switch that conversion off for the entire renderer. Add this line right after creating the renderer:

```javascript
  // shadertoy shaders output display-ready colors, so skip the linear to sRGB conversion
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
```

(If you combine a shader with regular, lit materials, you'd rather keep the conversion, and mark only the shader output as sRGB. The Blender project in the next section does exactly that.)

![plasma shader on a plane in a three.js scene](images/three-shadertoy-05-final.png)

Orbit around the plane with your mouse: the shader is just a material, so it works from every angle, and you can apply it to any mesh.

For reference, this is the complete `js/script.js`:

```javascript
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
```

Some ideas to go further:

- Pick another shader on Shadertoy. Shaders with only an Image tab need just one WGSL file and no render target. Check the "Shader Inputs" list on Shadertoy to see which uniforms you need to pass in.
- Apply the material to a different geometry, like a `SphereGeometry` or a `TorusKnotGeometry`.

## ThreeJS + Blender + Shader

There's one more tutorial on the learning platform, which teaches you how to bake lighting and shadows from Blender into a texture and how to integrate a shadertoy fragment shader into that same ThreeJS scene.

![3d room with nice shadows and animation](images/three-baked-shader.gif)

That tutorial was recorded with the WebGL renderer, where custom shaders are GLSL strings in a `ShaderMaterial`. With the WebGPU renderer, `ShaderMaterial` is not supported, so the monitor screen uses the technique from the previous section instead: the shadertoy shader is ported to `shaders/cyberFuji/fragment.wgsl` and plugged into a `MeshBasicNodeMaterial` with `wgslFn`, with `iTime` and `iResolution` uniforms. That shader has a couple of helper functions (`sun`, `grid`, ...). Those go *below* the main function in the WGSL file, as `wgslFn` reads the signature of the first function in the string. The finished project is in `projects/blender-three-bake-final`.

One difference with the plasma project: the room is textured with the baked lighting, so we can't switch off the color conversion of the whole renderer. Instead, we tell three.js that the output of the shader is already sRGB, by wrapping the function call in `colorSpaceToWorking`:

```javascript
import { wgslFn, uniform, uv, colorSpaceToWorking } from 'three/tsl';

// ...

monitorPlaneMaterial.colorNode = colorSpaceToWorking(cyberFuji({
  fragCoord: uv().mul(iResolution),
  iTime,
  iResolution,
}), THREE.SRGBColorSpace);
```

# Where to go from here

- https://threejs.org/manual/ - the manual our fundamentals projects were based on; continue with the chapters on materials, lights, shadows, loading glTF models and post-processing
- https://threejs.org/examples/?q=webgpu - hundreds of official examples, each with a link to its source code; the WebGPU ones are a great starting point for your own experiments
- https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language - the TSL wiki: how custom shaders and node materials work in the WebGPU renderer
- https://discourse.threejs.org/c/showcase/ - the community showcase, great for seeing what's possible
- https://tympanus.net/codrops/ - demos and tutorials on creative web effects; The Aviator started as a Codrops tutorial: https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
- https://codepen.io/Yakudoo - CodePens by Karim Maaloul, the creator of The Aviator
- https://threejs-journey.com/ - Bruno Simon's (paid) course, the gold standard for learning Three.js in depth - and check his portfolio at https://bruno-simon.com/
- https://www.youtube.com/watch?v=AB6sulUMRGE - Tutorial: Create a Cute Award-Winning Room Portfolio with Three.js and Blender | Beginner Course
- https://www.youtube.com/watch?v=X3pPAdQBKHo - Tutorial: Intro to Creative Web Development with Three.js and Blender | Create a 3D Portfolio for Beginners
- https://www.awwwards.com/websites/webgl/ - award-winning sites built with WebGL
- [https://www.youtube.com/@akella_](https://www.youtube.com/@akella_) - Yuri Artiukh live-codes recreations of award-winning WebGL effects
- https://blog.maximeheckel.com/ - in-depth articles on shaders and creative coding on the web
- https://r3f.docs.pmnd.rs/ - React Three Fiber: build Three.js scenes with React components, combining this chapter with what you know from React
- https://poly.pizza/ - free low-poly 3D models to use in your own scenes
