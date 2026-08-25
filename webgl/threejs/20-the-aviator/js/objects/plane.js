import * as THREE from 'three';
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
    mesh,
    propellerMesh
  }
};