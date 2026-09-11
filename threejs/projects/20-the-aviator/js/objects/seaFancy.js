import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils';
import { Colors } from '../constants/colors';

export const createSea = () => {
  // create the geometry (shape) of the cylinder;
  // the parameters are: 
  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  let geom = new THREE.CylinderGeometry(600,600,800,40,10);
  
  // rotate the geometry on the x axis
  geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  geom.deleteAttribute( 'normal' );
  geom.deleteAttribute( 'uv' );
  geom = BufferGeometryUtils.mergeVertices( geom );
  const positionAttribute = geom.attributes.position;
  const positionArray = positionAttribute.array;
  geom.computeVertexNormals();
  
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
    mesh,
    animate
  }
};