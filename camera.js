
import * as THREE from 'three';

export const CAMERA_POS = [0, 0, 14];

export function makeCamera(element){
    const fov = 60;
	const aspect = element.clientWidth / element.clientHeight; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	
    return camera;
}

export function startingCameraPositionAndDirection(camera){
    camera.position.set(...CAMERA_POS);
    rotateCameraAndCameraTopOnXAxis(camera,  Math.PI / 4)
}

export function rotateCameraAndCameraTopOnXAxis(camera, angle) {
    const left = getLeftOfCamera(camera);
    camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), angle);
    var newUp = new THREE.Vector3().crossVectors(getCameraDirection(camera), left);
    camera.up.copy(newUp); 
}

function getCameraDirection(camera){
    var cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    return cameraDirection;
}

function getLeftOfCamera(camera){
    return new THREE.Vector3().crossVectors(camera.up, getCameraDirection(camera)).normalize();
}

