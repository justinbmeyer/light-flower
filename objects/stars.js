import * as THREE from 'three';
import { rotation as makeRotation, randomPointOnSphere } from '../geometry-helpers.js';



export function makeStars(innerRadius=20, outerRadius = 1000, starsCount=3000){
    const starGeometry = new THREE.CircleGeometry( 1.5, 16 );
    const starsMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    const starField = new THREE.InstancedMesh(starGeometry, starsMaterial, starsCount);

    for (let i = 0; i < starsCount; i++) {

        const positionOnUnitSphere = randomPointOnSphere(1);
        const furtherOutFactor = Math.random();
        const innerPosition = positionOnUnitSphere.clone().multiplyScalar(innerRadius);
        const randomAmountFurtherOut = positionOnUnitSphere.clone().multiplyScalar( (outerRadius - innerRadius) * furtherOutFactor );
        const outerPosition = innerPosition.add(randomAmountFurtherOut);
        const matrix = new THREE.Matrix4().makeTranslation(
            outerPosition.x, outerPosition.y, outerPosition.z
        );

        const quaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1), // Default normal of circle
            positionOnUnitSphere
        );

        const rotation = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
        // the further out we are, the bigger we need to be
        const scale = furtherOutFactor;
        matrix
            .multiply(rotation)
            .scale(new THREE.Vector3(scale, scale, scale))
        //matrix.setPosition(Math.random() * 1000 - 500, Math.random() * 1000 - 500, Math.random() * 1000 - 500);
        starField.setMatrixAt(i, matrix);
    }
    return starField;
}



