import * as THREE from 'three';
import { makeSphere } from './grass';

export function makeAmbientLight(){
    return new THREE.AmbientLight( /*0xe0e0e0*/  0x383838, 20); // soft white light
}

export function makeSpotLight(target){
    const spotLight = new THREE.SpotLight(0xffffff, 20 * 10);
    spotLight.angle = Math.PI / 25; // The width of the light cone
    spotLight.penumbra = 0.3; // How soft the edge of the light cone is
    spotLight.target.position.set(0, 0, 0);
    //spotLight.lookAt(spotLight.target.position)
    return spotLight;
}


export function positionSpotLightAtCamera(spotLight, camera){
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
    const intersection = new THREE.Vector3();
    const intersectsSphere = mouseRaycaster.intersectObject(worldSphere);

    if (intersectsSphere.length) {
        //const material = new THREE.MeshPhongMaterial({ color: 0x5b8fc4 });
        //const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        //const sphere = new THREE.Mesh(sphereGeometry, material);
        //sphere.position.copy(intersection);
        //scene.add(sphere);

        spotLight.target.position.copy(intersectsSphere[0].point);
    }
}
