import * as THREE from 'three';
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