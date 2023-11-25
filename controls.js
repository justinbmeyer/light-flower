import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';


export function init_directionalControls(camera, renderer){
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
            }
            if(event.code === "ArrowLeft") {
                camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI * 5 / 180);
            }
            if(event.code === "ArrowUp") {
                camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI * 5 / 180);
            }
            if(event.code === "ArrowDown") {
                camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI * 5 / 180);
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
}



export function animate_directionalControls(controls){
    //controls.update();
}


export function init_getMouse(element, onMouseMove){
    const mouse = new THREE.Vector2();

    element.addEventListener('mousemove', handleMouseMove, false)

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