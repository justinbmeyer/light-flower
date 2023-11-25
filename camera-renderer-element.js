import * as THREE from 'three';
import { makeCamera } from './camera.js';

export function makeCameraRendererMatchElementFrame(){
    const renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);

    const camera = makeCamera(renderer.domElement);


    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onWindowResize();

    return {
        renderer, camera
    }
}