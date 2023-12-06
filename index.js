import * as THREE from 'three';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';

import { makeGrassTexture, makeGrassWorld} from './grass.js';
import { makeCameraRendererMatchElementFrame } from './camera-renderer-element.js';
import {  
        makeSpotLight, makeAmbientLight, 
        positionSpotLightFromCamera, 
        pointSpotLightAtXYPlaneFromMouseRaycaster, turnSpotlightOff, turnSpotlightOn } from './lighting.js';

import {init_directionalControls, animate_directionalControls, init_touch, usesTouchEvents, 
        moveCameraWithDrag, finalizeMoveCameraWithDrag, animate_cameraFromDrag } from "./controls.js";

import { load_flowers } from './objects/flower/flower.js';
import { init_cube } from './objects/cube.js';
import { debug, drawFrustrum } from './debug.js';
import { startingCameraPositionAndDirection } from './camera.js';
import { makeStars } from './objects/stars.js';
import { updateBackgroundSunrise } from './scene.js';
import { tween } from './geometry-helpers.js';
import { init_scoreboard } from './rules.js';

//import { monkeyPower } from './objects/monkey/monkey.js';

function main() {

    const  {renderer, camera} = makeCameraRendererMatchElementFrame();
    const scene = new THREE.Scene();
    // const debugHooks = debug(scene, camera);
    window.camera = camera;
    window.THREE = THREE;

    // controls
    startingCameraPositionAndDirection(camera);
    const directionalControls = init_directionalControls(camera, renderer, scene);
    const getPointers = init_touch(renderer.domElement, {
        pointerMove, pointerDown, pointerUp,
        pointerDrag
    });

	
    // lighting
    const spotLight = makeSpotLight();
    positionSpotLightFromCamera(spotLight, camera);
    const ambientLight = makeAmbientLight()
    scene.add(spotLight, spotLight.target, ambientLight );
    
    if(usesTouchEvents) {
        turnSpotlightOff(spotLight);
    }
    
    const scoreboard = init_scoreboard();
    // "game board"
    //scene.add(makeGrass());
    //scene.add(makeGrassTexture());
    scene.add(makeGrassWorld(10));
    scene.add(makeStars())

    // EVENTS
    function pointerDown(){
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(getPointers().pointerDown, camera);
        pointSpotLightAtXYPlaneFromMouseRaycaster(spotLight, raycaster);
        turnSpotlightOn(spotLight);
        moveCameraWithDrag(camera, getPointers().pointerDown);
    }
    function pointerMove({event}){
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(getPointers().pointerMove, camera);
        pointSpotLightAtXYPlaneFromMouseRaycaster(spotLight, raycaster);
    }
    function pointerDrag({event}) {
        
        // make sure the spot light is looking at the mouse
        moveCameraWithDrag(camera, getPointers().pointerDrag);
    }
    function pointerUp(){
        if(usesTouchEvents) {
            turnSpotlightOff(spotLight);
        }
        finalizeMoveCameraWithDrag(camera, getPointers().pointerUp);
    }
    const sunriseTween = tween(0,0, 5000)
    const loadingFlowers = load_flowers({
        flowerPicked(){
            scoreboard.pickedFlower();
            sunriseTween.newEndValue(scoreboard.flowersPicked() / scoreboard.flowersToWin());
        }
    })

   
    renderer.render( scene, camera );
    
    //drawFrustrum(scene, camera);

    Promise.all([loadingFlowers/*monkeyPower*/])
        .then( ([
            {init_flower, animate_flower},
            // {init_photo}
            //{init_monkey}
        ])=>{

        
        
        const flowers = [];
        for(let i = 0; i < 100; i++) {
            const flower = init_flower({});
            scene.add( flower );
            flowers.push(flower);
        }

        //const monkey = init_monkey({position: [0,0,0]})
        //scene.add(monkey);

        function animate(time){
            const mouse = getPointers().pointerMove || getPointers().pointerDown;
            
    
            time *= 0.001; // convert time to seconds
            
            

            if(mouse) {
                for(const flower of flowers) {
                    animate_flower(flower, camera, mouse);
                }

            }

            const color = updateBackgroundSunrise(scene, sunriseTween.getValue())
            ambientLight.intensity = 2 + sunriseTween.getValue()* 20;
            spotLight.intensity = 20 + sunriseTween.getValue()*10;
            document.querySelector("meta[name=theme-color]").setAttribute("content", ""+color.getHexString())

            animate_directionalControls(directionalControls);
            animate_cameraFromDrag(camera);
            //debugHooks.animate();

            render(time);
        }
    
        function render( {time, mouse} ) {
            
            // only needs to happen after a camera move
            positionSpotLightFromCamera(spotLight, camera);
    
            renderer.render( scene, camera );
      
            requestAnimationFrame( animate );
            
        }
    
        requestAnimationFrame( animate );
    })
    
    
    
    


    


    
}


main();












