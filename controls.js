import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { ArcballControls } from './node_modules/three/examples/jsm/controls/ArcballControls.js';

import {  getNormalOfScreen } from './orientation.js';

export function init_directionalControls(camera, renderer, scene){
    //const controls = new OrbitControls(camera, renderer.domElement);
    //controls.listenToKeyEvents( window );

    //return controls;

    window.onkeydown = function(event){
        
        if(event.code === "Digit0") {
            if(event.shiftKey) {
                camera.position.set(0, 0, -20);
                camera.rotation.x = 0; // Rotation around X axis (in radians)
                camera.rotation.y = 0; // Rotation around Y axis
                camera.rotation.z = 0; // Rotation around Z axis
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            } else {
                camera.position.set(0, 0, 20);
                camera.rotation.x = 0; // Rotation around X axis (in radians)
                camera.rotation.y = 0; // Rotation around Y axis
                camera.rotation.z = 0; // Rotation around Z axis
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            }
            
        } 
         else if(event.code === "Digit1") {
            camera.position.set(0, 0, 0);
            camera.rotation.x = 0; // Rotation around X axis (in radians)
            camera.rotation.y = 0; // Rotation around Y axis
            camera.rotation.z = 0; // Rotation around Z axis
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), - Math.PI / 4); // angleZ in radians
            camera.translateY(-9);
            camera.translateZ(2);
            camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI * 65 / 180);
        } else if(event.code === "Space") {
            if(event.shiftKey) {
                camera.translateY(-.5);
            } else {
                camera.translateY(.5);
            }
        }
        

        if(event.shiftKey) {
            if(event.code === "ArrowRight") {
                camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI * 5 / 180);
                //camera.up.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI * 5 / 180).normalize()
            }
            if(event.code === "ArrowLeft") {
                
                camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI * 5 / 180);
                //camera.up.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 5 / 180).normalize()

                //const newRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 5 / 180);
                //camera.quaternion.multiplyQuaternions(newRotation, camera.quaternion);
                //camera.up.applyQuaternion(newRotation).normalize();
            }
            if(event.code === "ArrowUp") {
                // we need to calculate "left"
                const left = getLeftOfCamera(camera);
                // rotate to new direction
                camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI * 5 / 180);
                // update to new direction
                var newUp = new THREE.Vector3().crossVectors(getCameraDirection(camera), left);
                camera.up.copy(newUp); 
                //camera.up.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 5 / 180).normalize()

                //const newRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 5 / 180);
                //camera.quaternion.multiplyQuaternions(newRotation, camera.quaternion);
                //camera.up.applyQuaternion(newRotation).normalize();
            }
            if(event.code === "ArrowDown") {

                const left = getLeftOfCamera(camera);
                camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI * 5 / 180);
                var newUp = new THREE.Vector3().crossVectors(getCameraDirection(camera), left);
                camera.up.copy(newUp); 
                
                //const newRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI * 5 / 180);
                //camera.quaternion.multiplyQuaternions(newRotation, camera.quaternion);
                //camera.up.applyQuaternion(newRotation).normalize();
                
            }
        } else {
            if(event.code === "ArrowRight") {
                camera.translateX(.5);
            }
            if(event.code === "ArrowLeft") {
                camera.translateX(-.5);
            }
            if(event.code === "ArrowUp") {
                camera.translateZ(-.5);
            }
            if(event.code === "ArrowDown") {
                camera.translateZ(.5);
            }
        }

        
        
    }
    /*
    const controls = new ArcballControls( camera, renderer.domElement, scene );

    controls.addEventListener( 'change', function () {

        renderer.render( scene, camera );

    } );*/

    let forwardBackSpeed = 0;
    let leftRightSpeed = 0;
    /*
    getDeviceOrientation(function handleDeviceOrientation(event) {

        
        const screenNormal = getNormalOfScreen(event);
        if(screenNormal.y > 0.2 || screenNormal.y < -0.2) {
            forwardBackSpeed = screenNormal.y;
        } else {
            forwardBackSpeed = 0;
        }
        if(screenNormal.x > 0.2 || screenNormal.x < -0.2) {
            leftRightSpeed = screenNormal.x;
        } else {
            leftRightSpeed = 0;
        }
        //console.log(screenNormal)
    });*/

    



    return {
        update(){
            

            return;
            if(forwardBackSpeed === 0 && leftRightSpeed === 0) {
                return;
            }

            const originalDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
            const originalLeft  = new THREE.Vector3().crossVectors(camera.up, originalDirection).normalize(); 
            const originalPosition = new THREE.Vector3().copy(camera.position);

            const howMuchToMoveLeft = originalLeft.clone().multiplyScalar( leftRightSpeed* .1 )
            // move how it looked like we were going to move
            const newPositionOffSphere = originalPosition.clone()
                .add(originalDirection.multiplyScalar( forwardBackSpeed* .1 ))
                .add(howMuchToMoveLeft);

            // where is that from 0,0,0?
            const newUp = newPositionOffSphere.clone().normalize();
            // move out to the sphere to find our position
            const newPosition = newPositionOffSphere.clone().normalize().multiplyScalar(14);

            // get the new "orbit" direction .... NEEDS TO CHANGE with left / right
            const newOrbitDirection = new THREE.Vector3().crossVectors(newUp, originalLeft).normalize().negate();

            // look down a bit by finding a point back towards the center
            const downwardVector = newUp.clone().negate();
            const slerpFactor = Math.sin( THREE.MathUtils.degToRad(45) ) / Math.sqrt(2);
            const desiredVector = new THREE.Vector3().copy(newOrbitDirection).lerp(downwardVector, slerpFactor).normalize();


            const lookAtPoint = newPosition.clone().add(desiredVector);



            camera.position.copy(newPosition);
            camera.up.copy(newUp);

            

            // Orient the camera
            camera.lookAt(lookAtPoint);
            //camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);



            /*
            const spherical = new THREE.Spherical().setFromVector3(camera.position);

            // Adjust theta and phi values
            spherical.theta += thetaDelta; // Change in longitude
            spherical.phi += phiDelta; // Change in latitude
            spherical.makeSafe(); // Ensure phi is within bounds to prevent flip at poles

            // Convert back to Cartesian coordinates and update camera position
            const newPosition = new THREE.Vector3().setFromSpherical(spherical);
            camera.position.copy(newPosition);

            // Calculate the tangent direction at the new position
            const tangentDirection = new THREE.Vector3().copy(newPosition).normalize().cross(new THREE.Vector3(0, 1, 0)).normalize();

            // Set the camera to look along the tangent direction
            const lookAtPoint = new THREE.Vector3().addVectors(newPosition, tangentDirection);
            camera.lookAt(lookAtPoint);
            thetaDelta = null;
            phiDelta = null;*/
        }
    }
}



export function animate_directionalControls(controls){
    controls.update();
}


export function init_getMouse(element, onMouseMove){
    const mouse = new THREE.Vector2();
    
    element.addEventListener('pointermove', handleMouseMove, false)
    element.style ="touch-action: none";

    function handleMouseMove(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        if(onMouseMove) {
            onMouseMove({mouse, event});
        }
    }

    return function getMouse(){
        return mouse;
    }
}
function getCameraDirection(camera){
    var cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    return cameraDirection;
}

function getLeftOfCamera(camera){
   

    return new THREE.Vector3().crossVectors(camera.up, getCameraDirection(camera)).normalize();
}
