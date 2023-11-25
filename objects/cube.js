import * as THREE from 'three';


export function init_cube({w = 1,h=1,d=1,x = 0,y= 0 ,z = 0, color = 0xeeeeee }){
	const geometry = new THREE.BoxGeometry( w, h, d );
    const cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color } ) );
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    return cube;
}