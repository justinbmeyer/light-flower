import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { ArcballControls } from './node_modules/three/examples/jsm/controls/ArcballControls.js';

import {  getNormalOfScreen } from './orientation.js';
import { rotateCameraAndCameraTopOnXAxis } from './camera.js';
import { addEventListener } from './orientation.js';
import { subtractAngles } from './geometry-helpers.js';
import { makeSphere } from './grass.js';



export const usesTouchEvents = 'ontouchstart' in window;
const useOrientationControls = usesTouchEvents;

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
    let rightLeftSpeed = 0;
    let leftRightTurnSpeed = 0;

    let startTimeOfOddMovement = null;
    
    addEventListener((orientationData)=>{
        // posture adjustment
        //forwardBackSpeed = acceleratedAndGappedSpeed(orientationData.userTopDirection.z, 0.4, 0.04, 0.9);
        //rightLeftSpeed = acceleratedAndGappedSpeed(orientationData.userTopDirection.x, 0.0, 0.03, 1.0);

        /*if(Math.abs(rightLeftSpeed) > .3) {
            if(startTimeOfOddMovement === null) {
                startTimeOfOddMovement = new Date().getTime()
            } else if(new Date().getTime() - startTimeOfOddMovement > 2000) {
                console.log("LOTS of FAST HORIZONTAL MOVEMENT")
            }
        } else {
            startTimeOfOddMovement = null;
        }*/

        //const alphaChange = subtractAngles(orientationData.adjustedOrientation.alpha, 0),
        //    gammaChange = subtractAngles(orientationData.adjustedOrientation.gamma, 0);
        
        const speeds =   positionChanges(orientationData);
        forwardBackSpeed = speeds.forwardBackSpeed;
        rightLeftSpeed = speeds.rightLeftSpeed;
        //forwardBackSpeed = acceleratedAndGappedSpeed(orientationData.adjustedOrientation.beta, -60, 10, 0.009)
        //rightLeftSpeed = acceleratedAndGappedSpeed(alphaChange, 0, 10, 0.009)
        /*if(Math.abs(gammaChange) < 5 && Math.abs(alphaChange) > Math.abs(gammaChange)* 1.2) {
            if(startTimeOfOddMovement === null) {
                startTimeOfOddMovement = new Date().getTime()
            } else if(new Date().getTime() - startTimeOfOddMovement > 1000) {
                console.log("You seem to be re-orienting")
            }
        } else {
            startTimeOfOddMovement = null;
        }*/
            //console.log(alphaChange, gammaChange)
        
    });



    function round(num){
        return Math.round((num + Number.EPSILON) * 100) / 100
    }



    return {
        update(){
            if(!useOrientationControls) {
                return;
            }
            
            if(forwardBackSpeed === 0 && rightLeftSpeed === 0) {
                return;
            }

            const originalDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
            const originalLeft  = new THREE.Vector3().crossVectors(camera.up, originalDirection).normalize(); 
            const originalPosition = new THREE.Vector3().copy(camera.position);

            const howMuchToMoveLeft = originalLeft.clone().multiplyScalar( -rightLeftSpeed )
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


export function positionChanges(orientationData){

    const forwardBackSpeed = acceleratedAndGappedSpeed(orientationData.adjustedOrientation.beta, -60, 4, 0.010)
    
    const twisting = calculateTwisting(orientationData.z, orientationData.userTopDirection);
    let twistingDegrees = twisting * (180 / Math.PI);
    const rightLeftSpeed = acceleratedAndGappedSpeed(twistingDegrees, 0, 6, 0.009);

    //console.log(forwardBackSpeed, rightLeftSpeed)
    return {forwardBackSpeed, rightLeftSpeed};
}

export function coplanarPerpendicularVector(vectorToBePerpendicularFrom, coplanarReference = new THREE.Vector3(0,1,0)) {
    const perpendicularVector = new THREE.Vector3().crossVectors(vectorToBePerpendicularFrom, coplanarReference);

    return new THREE.Vector3().crossVectors(perpendicularVector, vectorToBePerpendicularFrom );
}

function calculateTwisting(screenNormal, topDirection){
    // this is where would would expect the top to be from the screen normal
    const topWithoutTwistingDirection = coplanarPerpendicularVector(screenNormal);

    // what's the plane defined by the screen normal and "north pole"
    let planeNormal = new THREE.Vector3().crossVectors(topWithoutTwistingDirection, screenNormal).normalize();


    let dotProduct = planeNormal.dot(topDirection);
    let angleRadians = Math.acos(dotProduct) - Math.PI / 2;
    return angleRadians;
}

export function init_touch(element, callbacks){
    let pointerDown = null;
    let pointerMove = null;
    let pointerDrag = null;
    let pointerUp = null;
    
    element.addEventListener('contextmenu', function(e) {
        e.preventDefault();
      });
      
    element.addEventListener("ontouchstart", function(event){
        event.preventDefault();
    })

    element.addEventListener('pointermove', handlePointerMove, false);
    element.addEventListener('pointerdown', handlePointerDown, false);

    element.addEventListener('pointerup', handlePointerUp, false);

    element.style ="touch-action: none";

    function handlePointerDown(event){
        event.preventDefault();
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

const worldSphere = ( ()=> {
    return makeSphere(11);
})()


let startingDrags = null;

export function moveCameraWithDrag(camera, pointerDrag){
    if(useOrientationControls) {
        return;
    }
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointerDrag, camera);

    const intersectsSphere = raycaster.intersectObject(worldSphere);
    if (intersectsSphere.length) {
        const newDrag = {position: intersectsSphere[0].point, time: new Date().getTime()}
        if(!startingDrags) {
            startingDrags = [newDrag];
        } else {
            //moveCameraBetween(camera, startingDrags[0].position, newDrag.position);
            //startingDrags = [newDrag]
            startingDrags.push(newDrag)
        }
    } else {
        startingDrags = null
    }
}

export function finalizeMoveCameraWithDrag(camera, pointerUp){
    
    startingDrags = null;
    
}

export function animate_cameraFromDrag(camera){
    if(startingDrags && startingDrags.length > 1) {

        
        moveCameraBetween(camera, startingDrags[0].position, startingDrags[startingDrags.length - 1].position);
        startingDrags = [];
    }
    
}
function moveCameraBetween(camera, startingDrag, newDrag) {
    
    const vector = newDrag.clone().sub(startingDrag)
    let cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    const moveInCameraCoordinates = calculateVectorFromAnotherFrame(cameraDirection.clone(), camera.up.clone(), vector.clone())
    
    //console.log(/*cameraDirection,*/ vector.x, "->",moveInCameraCoordinates.x, vector.y, "->",moveInCameraCoordinates.y)
    moveCamera(camera, moveInCameraCoordinates);
}




/**
```
calculateVectorFromAnotherFrame(
    new THREE.Vector3(0, 1, 0), // frameZ
    new THREE.Vector3(1, 0, 0), // frameY
    new THREE.Vector3(0, 1, 0)  // vector
) // {x: 0, y: 0, z: 1}

calculateVectorFromAnotherFrame(
    new THREE.Vector3(0, 0, -1), // frameZ
    new THREE.Vector3(0, 1, 0), // frameY
    new THREE.Vector3(0, 0, 1)  // vector
) // {x: 0, y: 0, z: 1}
```
 */
function calculateVectorFromAnotherFrame(frameZ, frameY, vector){
    let xAxis = new THREE.Vector3();
    let yAxis = frameY.clone().normalize();
    let zAxis = frameZ.clone().normalize();

    // Compute the X-axis
    xAxis.crossVectors(yAxis, zAxis).normalize();

    let basisChangeMatrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);

    // Invert the matrix for the transformation
    let inverseBasisChangeMatrix = new THREE.Matrix4().copy(basisChangeMatrix).invert();

    return vector.clone().applyMatrix4(inverseBasisChangeMatrix);
}
window.calculateVectorFromAnotherFrame = calculateVectorFromAnotherFrame;


function moveCamera(camera, xyMovement){
    const originalDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const originalLeft  = new THREE.Vector3().crossVectors(camera.up, originalDirection).normalize(); 
    const originalPosition = new THREE.Vector3().copy(camera.position);

    const howMuchToMoveLeft = originalLeft.clone().multiplyScalar( -xyMovement.x* 4 );
    const howMuchMoveForward = originalDirection.multiplyScalar( -xyMovement.y*4 );
    
    // move how it looked like we were going to move
    const newPositionOffSphere = originalPosition.clone()
        .add(howMuchMoveForward)
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
    camera.updateProjectionMatrix()
}