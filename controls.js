import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { ArcballControls } from './node_modules/three/examples/jsm/controls/ArcballControls.js';

import {  getNormalOfScreen } from './orientation.js';
import { rotateCameraAndCameraTopOnXAxis } from './camera.js';
import { addEventListener } from './orientation.js';


export const usesTouchEvents = 'ontouchstart' in window;

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
                rotateCameraAndCameraTopOnXAxis(camera, Math.PI * 5 / 180);
            }
            if(event.code === "ArrowDown") {
                rotateCameraAndCameraTopOnXAxis(camera, -Math.PI * 5 / 180);
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
    let leftRightTurnSpeed = 0;
    
    addEventListener((orientationData)=>{
        // posture adjustment
        forwardBackSpeed = acceleratedAndGappedSpeed(orientationData.userTopDirection.z, 0.4, 0.04, 0.9);
        /*
        if(orientationData.userTopDirection.z < -0.4) {
            forwardBackSpeed = -(orientationData.userTopDirection.z+0.2) * .15;
        } else if(orientationData.userTopDirection.z > 0) {
            forwardBackSpeed = -(orientationData.userTopDirection.z+0.2) * .15;
        } else {
            forwardBackSpeed = 0;
        }*/
        
        if(orientationData.userTopDirection.x > 0.2 || orientationData.userTopDirection.x < -0.2) {
            leftRightSpeed = -orientationData.userTopDirection.x * .15;
        } else {
            leftRightSpeed = 0;
        }
        //console.log(orientationData.userTopDirection.x);
        leftRightSpeed = acceleratedAndGappedSpeed(orientationData.userTopDirection.x, 0.0, 0.03, 1.0);
    });

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
            


            if(forwardBackSpeed === 0 && leftRightSpeed === 0) {
                return;
            }

            const originalDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
            const originalLeft  = new THREE.Vector3().crossVectors(camera.up, originalDirection).normalize(); 
            const originalPosition = new THREE.Vector3().copy(camera.position);

            const howMuchToMoveLeft = originalLeft.clone().multiplyScalar( leftRightSpeed )
            // move how it looked like we were going to move
            const newPositionOffSphere = originalPosition.clone()
                .add(originalDirection.multiplyScalar( forwardBackSpeed ))
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

function acceleratedAndGappedSpeed(value, offset = 0.3, gap = 0.05, accelerationCoefficient = 1.2){
    let adjustedZ = value + offset,
        gapAdjustedZ = 0,
        sign = 1;
    const width = gap;
    if(Math.abs(adjustedZ) < width) {
        adjustedZ = 0; 
    } else {
        if(adjustedZ > 0) {
            gapAdjustedZ = adjustedZ - width;
            sign = -1;
        } else {
            gapAdjustedZ = adjustedZ + width;
            sign = 1;
        }
    }
    return (gapAdjustedZ* accelerationCoefficient)*(gapAdjustedZ* accelerationCoefficient) * sign;
}

export function animate_directionalControls(controls){
    controls.update();
}

function vectorFromEvent(event){
    return new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
}

export function init_touch(element, callbacks){
    let pointerDown = null;
    let pointerMove = null;
    let pointerDrag = null;
    let pointerUp = null;
    
    element.addEventListener("ontouchstart", function(event){
        event.preventDefault();
    })

    element.addEventListener('pointermove', handlePointerMove, false);
    element.addEventListener('pointerdown', handlePointerDown, false);

    element.addEventListener('pointerup', handlePointerUp, false);

    element.style ="touch-action: none";

    function handlePointerDown(event){
        pointerDown = vectorFromEvent(event);
        if(callbacks.pointerDown) {
            callbacks.pointerDown({pointerDown, event});
        }
    }
    

    function handlePointerMove(event) {
        pointerMove = vectorFromEvent(event);
        if(callbacks.pointerMove) {
            callbacks.pointerMove({pointerMove, event});
        }
        
        if(pointerDown) {
            pointerDrag = pointerMove;
            if(callbacks.pointerDrag) {
                callbacks.pointerDrag({pointerDown, pointerDrag: pointerMove, event});
            }
        } else if(callbacks.mouseMove) {
            callbacks.mouseMove({pointerMove, event});
        }
    }

    function handlePointerUp(event){
        pointerUp = vectorFromEvent(event);
        if(callbacks.pointerUp) {
            callbacks.pointerUp({pointerUp, event, pointerDown, pointerDrag});
        }
        pointerUp = pointerDown = pointerDrag = pointerMove = null;
    }

    return function getPointers(){
        return {pointerUp, pointerDown, pointerDrag, pointerMove};
    }
}

