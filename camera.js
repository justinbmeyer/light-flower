
import * as THREE from 'three';

export const CAMERA_POS = [0, 0, 14];

export function makeCamera(element){
    const fov = 60;
	const aspect = element.clientWidth / element.clientHeight; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set(...CAMERA_POS);


    // Rotate around Z-axis
    camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);  // angleZ in radians
    //camera.translateY(-9);
    //camera.translateZ(2);
    //camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI * 65 / 180);
    
    window.camera = camera;
    window.THREE = THREE;
    return camera;
}



