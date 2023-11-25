import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';


function loadFlowerModel(success, progress, error){
    const loader = new GLTFLoader();
    loader.load(
        './objects/flower/flower-top.glb', // path to your glb file
        success,
        progress,
        error
    );
}

function loadFlowerPromise(){
    return new Promise((resolve, reject)=>{
        loadFlowerModel((gltf)=>{
            resolve(gltf.scene)
        },()=>{},(err)=>{
            reject(err);
        });
    })
}

export const flowerPromise = loadFlowerPromise();

export const flowerPower = flowerPromise.then((baseFlower) => {
    return {
        init_flower({position = [0,0,0]} = {}){
            const flower = baseFlower.clone();
            flower.position.set(...position);
            flower.rotation.y = - Math.PI * ( 60 / 180);
            flower.rotation.x = Math.PI / 2;
            return flower;
        },
        animate_flower(flower, raycaster) {
            const flowerIntersects = raycaster.intersectObjects(flower.children);
            if(flowerIntersects.length) {
                //flowerScale = flowerScale + 0.01;
                //flower.scale.set(flowerScale, flowerScale, flowerScale);
                flower.scale.addScalar(0.01);
            }
        }
    }
})



/*
export async function getFlower({position = [0,0,0]}){
    const baseFlower = await loadFlowerPromise();
    const flower = baseFlower.clone();
    flower.position.set(...position);
    flower.rotation.x = Math.PI / 2;
    return flower;
}*/


function createGrowingFlower(position){
    let flower;
    let flowerScale = 1;

    return new Promise((resolve, reject)=>{
        getFlower((gltf)=>{
            flower = gltf.scene;
            flower.position.set(...position);
            flower.rotation.x = Math.PI / 2;
            resolve({
                object3D: flower,
                update({raycaster}){
                    
                }
            })
        },()=>{},(err)=>{
            reject(err);
        });
    })
    

    return {
        
        update({mouse, camera}){

        }
    }
}