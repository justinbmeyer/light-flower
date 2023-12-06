import { subtractAngles, addAngles } from "./geometry-helpers.js";
import * as THREE from 'three';

let mustRequest = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === 'function';

if(mustRequest) {
    DeviceOrientationEvent.requestPermission().then(()=>{
        console.log("got access")
    },()=>{
        console.log("rejected access");
        const button = makeRequestButton();
        document.body.append(button);
        button.onclick = function(){
            DeviceOrientationEvent.requestPermission().then(()=>{
                button.remove();
            },()=>{
                
            })
            
        }
    })
}

export function getOrientation(){
    if(typeof screen !== "undefined" && screen?.orientation?.type){
        return screen.orientation.type;
    } else if(typeof window.orientation !== "undefined"){
        if(window.orientation === 0 ) {
            return "portrait-primary"
        }
        else if( window.orientation === 180 ) {
            return "portrait-secondary"
        }
        else if(window.orientation === 90) {
            return "landscape-primary" // landscape left
        } 
        else if(window.orientation === -90 || window.orientation === 270) {
            return "landscape-secondary"; // landscape right
        }
    }
}

function makeRequestButton(){
    const button = document.createElement("button");
    button.innerHTML = "enable device orientation";
    Object.assign(button.style,{
        position: "fixed",
        left: "0px",
        top: "0px",
        width: "100vw",
        fontSize: "5vh"
    });
    return button;
}



let firstEvent,
    isOrientationRelativeToGravity = true,
    lastEventSinceOrientationChange = null;


function nearZero(value){
    return Math.abs(subtractAngles(value, 0)) < 5
}
function isNotRelativeToGravity({alpha,gamma, beta}, orientation= getOrientation()) {
    console.log("nearZero", alpha, nearZero(alpha) , beta, nearZero(beta), gamma, nearZero(gamma) )
    return nearZero(alpha) && nearZero(gamma) && nearZero(beta);
}

addOrientationChangeEventListener(function(){
    lastEventSinceOrientationChange = null;
})

function getUpdatedRotationsFromOrientationEvent(newEvent, lastOrientationEvent, orientation= getOrientation()) {
    if(orientation === "landscape-primary") {
        return {
            alpha:  addAngles( subtractAngles( newEvent.alpha, lastOrientationEvent.alpha ), 90),
            beta: subtractAngles( newEvent.beta, lastOrientationEvent.beta ),
            gamma:  subtractAngles( subtractAngles( newEvent.gamma, lastOrientationEvent.gamma ), 90)
        }
    } else if(orientation === "portrait-primary"){
        return {
            alpha: subtractAngles( newEvent.alpha, lastOrientationEvent.alpha ),
            beta: addAngles( subtractAngles( newEvent.beta, lastOrientationEvent.beta ), 90),
            gamma:  subtractAngles( newEvent.gamma, lastOrientationEvent.gamma )
        }
    }
}

const handlers = [];
window.addEventListener('deviceorientation', function(event){
    if(!firstEvent) {
        firstEvent = event;
        if(isNotRelativeToGravity(event)) {
            isOrientationRelativeToGravity = false;
        }
    }
    if(lastEventSinceOrientationChange === null) {
        lastEventSinceOrientationChange = event;
    }
    const orientation = getOrientation();
    const axes = {
        sourceOrientationEvent: event,
        firstDeviceOrientation: firstEvent,
        screenOrientation: getOrientation(),
        deviceOrientationAtLastScreenOrientation: lastEventSinceOrientationChange,
        isOrientationRelativeToGravity: isOrientationRelativeToGravity
    };
    let adjustedOrientation;
    if(!isOrientationRelativeToGravity) {
        adjustedOrientation = getUpdatedRotationsFromOrientationEvent(event, lastEventSinceOrientationChange);
    } else {
        adjustedOrientation ={alpha: event.alpha, beta: event.beta, gamma: event.gamma};
    }
    // we need to figure out what's "up" to the user ... 

    Object.assign(axes, {
        adjustedOrientation: adjustedOrientation,
        z: getNormalOfScreen(adjustedOrientation),
        userTopDirection: getUserTopPhoneDirection(adjustedOrientation)
    })


    handlers.forEach((handler) => handler(axes));
});

export function getFirstEvent(){
    return firstEvent;
}

function addOrientationChangeEventListener(handler){
    if(window?.screen?.orientation?.addEventListener) {
        window.screen.orientation.addEventListener("change",handler)
    } else {
        window.addEventListener("orientationchange", handler);
    }
}





export function addEventListener(handler){
    handlers.push(handler);
}
export function removeEventEventListener(handler){
    const index = handlers.indexOf(handler);
    if(index !== -1) {
        handlers.splice(index, 1);
    }
}



/*
    
    function handleActivation(){
        console.log("testing!");
        button.removeEventListener("click", handleActivation);
        button.remove();
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
              .then(permissionState => {
                if (permissionState === 'granted') {
                  window.addEventListener('deviceorientation', handleDeviceOrientation);
                }
              })
              .catch(console.error);
          } else {
            console.log("just listening")
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
    }
    button.addEventListener("click",handleActivation);*/




let report = false;


// this points the direction the screen is facing
export function getNormalOfScreen(event){
    return getDirection(event, new THREE.Vector3(0, 1, 0) );
}

// This points to the top of the screen from a users' perspective
export function getUserTopPhoneDirection(event, orientationType = getOrientation()){
    if(orientationType === "portrait-primary") {
        return getDirection(event, new THREE.Vector3(0, 0, -1) );
    }
    else if(orientationType === "portrait-secondary") {
        return getDirection(event, new THREE.Vector3(0, 0, 1) );
    }
    else if(orientationType === "landscape-primary") { 
        return getDirection(event, new THREE.Vector3(1, 0, 0) );
    }
    else if(orientationType === "landscape-secondary") {
        return getDirection(event, new THREE.Vector3(-1, 0, 0) );
    } 
    else {
        return getDirection(event, new THREE.Vector3(0, 0, -1) );
    }
    
}

export function getDirection(event, baseVector ) {
    let {alpha, beta, gamma, absolute} = event;
    alpha = THREE.MathUtils.degToRad(alpha);
    beta = THREE.MathUtils.degToRad(beta);
    gamma = THREE.MathUtils.degToRad(-gamma);
    

    // Create Euler object
    var euler = new THREE.Euler(beta,alpha , gamma, 'YXZ'); // The order might vary depending on your use case
    return baseVector.applyEuler(euler);
}



