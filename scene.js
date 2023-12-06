import * as THREE from 'three';



const colorBreakpoints = ["black",0x231e46,0xff6b3e,0xf7c16a,0xffef7a, 0xb5d6e0]
export function updateBackgroundSunrise(scene, howFarToSunrise){
    
    const point = colorBreakpoints.length*howFarToSunrise;
    const left = Math.floor(point);
    const right = left+1;
    if(right >= colorBreakpoints.length) {
        return scene.background =  new THREE.Color(colorBreakpoints[colorBreakpoints.length - 1]);
        return;
    }
    const fraction = point % 1;
    const color = interpolateColor(colorBreakpoints[left],colorBreakpoints[right], fraction);

    return scene.background = color;
}


export function interpolateColor(colorStart, colorEnd, fraction) {
    var start = new THREE.Color(colorStart);
    var end = new THREE.Color(colorEnd);

    var r = start.r + (end.r - start.r) * fraction;
    var g = start.g + (end.g - start.g) * fraction;
    var b = start.b + (end.b - start.b) * fraction;

    return new THREE.Color(r, g, b);
}