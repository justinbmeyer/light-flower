import * as THREE from 'three';
import { rotation as makeRotation, randomPointOnSphere } from './geometry-helpers';


export function makeSphere(radius = 10){
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x241914 });
    return new THREE.Mesh(geometry, material);
}

export function makeGrassWorld(radius = 10){
    const bladeGeometry = new THREE.PlaneGeometry(0.1, 1, 1, 1);
    const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0x108010, side: THREE.DoubleSide });
    const numBlades = 50000; // Number of grass blades
    const instancedGrass = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, numBlades);

    for (let i = 0; i < numBlades; i++) {
        
        const position = randomPointOnSphere(radius);

        const matrix = new THREE.Matrix4().makeTranslation(
            position.x, position.y, position.z
        );

        const normal = position.normalize();
        
        var quaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(Math.random() / 2,Math.random()* 5,Math.random() / 2).normalize(), normal);
        const rotation = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
   
        // Apply scale and rotation
        const scale = Math.random() * 0.1 + 1; // Random scale for variety
        matrix
            .multiply(rotation)
            .scale(new THREE.Vector3(scale, scale, scale));

        const colorVariation = new THREE.Color(0xffffff);
        colorVariation.multiplyScalar(0.5 + Math.random() * 0.5); // Vary the green color
        
        instancedGrass.setColorAt(i, colorVariation);
        instancedGrass.setMatrixAt(i, matrix);
    }
    const group = new THREE.Group();
    group.add(instancedGrass);
    group.add(makeSphere(radius));
    return group;
}




export function makeGrassTexture(){
    const planeGeometry = new THREE.PlaneGeometry(12, 12);
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('./models/green-grass-1024x1024.jpg');
    const grassMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
    const grass = new THREE.Mesh(planeGeometry, grassMaterial);
    //grass.rotation.x = -Math.PI / 2; // Rotate to lay it flat
    return grass;
}


