import * as THREE from 'three';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';

import { makeGrassTexture, makeGrassWorld} from './grass.js';
import { makeCameraRendererMatchElementFrame } from './camera-renderer-element.js';
import {  
        makeSpotLight, makeAmbientLight, 
        positionSpotLightAtCamera, 
        pointSpotLightAtXYPlaneFromMouseRaycaster } from './lighting.js';

import {init_directionalControls, animate_directionalControls, init_getMouse } from "./controls.js";

import { flowerPower } from './objects/flower/flower.js';
import { init_cube } from './objects/cube.js';
import { debug, drawFrustrum } from './debug.js';

//import { monkeyPower } from './objects/monkey/monkey.js';

function main() {

    const  {renderer, camera} = makeCameraRendererMatchElementFrame();
    const scene = new THREE.Scene();
    debug(scene);

    // controls
    const directionalControls = init_directionalControls(camera, renderer, scene);
    const getMouse = init_getMouse(renderer.domElement, mouseMove);

	
    // lighting
    const spotLight = makeSpotLight();
    positionSpotLightAtCamera(spotLight, camera);
    scene.add(spotLight, spotLight.target, makeAmbientLight() );

    // "game board"
    //scene.add(makeGrass());
    //scene.add(makeGrassTexture());
    scene.add(makeGrassWorld(10))

    let oneMouseMove = false;
    // EVENTS
    function mouseMove({event}){
        oneMouseMove = true;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(getMouse(), camera);
        // make sure the spot light is looking at the mouse
        pointSpotLightAtXYPlaneFromMouseRaycaster(spotLight, raycaster);
    }
   
    renderer.render( scene, camera );
    
    //drawFrustrum(scene, camera);

    Promise.all([flowerPower, /*monkeyPower*/])
        .then( ([
            {init_flower, animate_flower},
            //{init_monkey}
        ])=>{
        
        const flowers = [];
        for(let i = 0; i < 10; i++) {
            const flower = init_flower({position: [5 - Math.random() * 10, 5 - Math.random() * 10, 0]});
            scene.add( flower );
            flowers.push(flower);
        }

        //const monkey = init_monkey({position: [0,0,0]})
        //scene.add(monkey);

        function animate(time){
            const mouse = getMouse();
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(getMouse(), camera);
    
            time *= 0.001; // convert time to seconds
            
            animate_directionalControls(directionalControls);

            if(oneMouseMove) {
                for(const flower of flowers) {
                    animate_flower(flower, raycaster);
                }

            }

            render(time);
        }
    
        function render( {time, mouse} ) {
            
        
            positionSpotLightAtCamera(spotLight, camera);
    
            renderer.render( scene, camera );
            //console.log(camera.position);
    
            requestAnimationFrame( animate );
    
        }
    
        requestAnimationFrame( animate );
    })
    
    
    
    


    


    
}


main();












