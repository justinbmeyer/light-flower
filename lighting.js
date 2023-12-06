import * as THREE from 'three';
import { makeSphere } from './grass.js';

export function makeAmbientLight(){
    return new THREE.AmbientLight( /*0xe0e0e0*/  0x383838, 2); // soft white light
}

export function makeSpotLight(target){
    const spotLight = new THREE.SpotLight(0xffffff, 20);
    spotLight.angle = Math.PI / 15; // The width of the light cone
    spotLight.penumbra = 0.6; // How soft the edge of the light cone is
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    return spotLight;
}


export function positionSpotLightFromCamera(spotLight, camera){
    spotLight.position.set(camera.position.x, camera.position.y, camera.position.z)
}

const xyPlane = (()=>{
    const planeNormal = new THREE.Vector3(0, 0, -1); // Normal to the plane
    const planeConstant = 0; // Plane constant (distance from the origin)
    return new THREE.Plane(planeNormal, planeConstant);
})();

const worldSphere = ( ()=> {
    return makeSphere();
})()

export function pointSpotLightAtXYPlaneFromMouseRaycaster(spotLight, mouseRaycaster){
    const intersectsSphere = mouseRaycaster.intersectObject(worldSphere);

    if (intersectsSphere.length) {
        spotLight.target.position.copy(intersectsSphere[0].point);
    }
}

export function turnSpotlightOff(spotLight){
    spotLight.visible = false;
}

export function turnSpotlightOn(spotLight){
    spotLight.visible = true;
}