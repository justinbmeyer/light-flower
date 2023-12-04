import * as THREE from 'three';
import { makeSphere } from './grass';

let lastIntensity = 20;

export function makeAmbientLight(){
    return new THREE.AmbientLight( /*0xe0e0e0*/  0x383838, 2); // soft white light
}

export function makeSpotLight(target){
    const spotLight = new THREE.SpotLight(0xffffff, lastIntensity);
    spotLight.angle = Math.PI / 15; // The width of the light cone
    spotLight.penumbra = 0.6; // How soft the edge of the light cone is
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
    if(spotLight.intensity !== 0) {
        lastIntensity = spotLight.intensity;
        spotLight.intensity = 0;
    }
}

export function turnSpotlightOn(spotLight){
    spotLight.intensity = lastIntensity;
}