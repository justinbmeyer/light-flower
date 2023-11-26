import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';


function loadMonkeyModel(success, progress, error){
    const loader = new GLTFLoader();
    loader.load(
        './objects/doughnut/donut.glb', // path to your glb file
        success,
        progress,
        error
    );
}

function loadMonkeyPromise(){
    return new Promise((resolve, reject)=>{
        loadMonkeyModel((gltf)=>{
            resolve(gltf.scene)
        },()=>{},(err)=>{
            reject(err);
        });
    })
}

export const monkeyPromise = loadMonkeyPromise();

export const monkeyPower = monkeyPromise.then((baseMonkey) => {
    return {
        init_monkey({position = [0,0,0]} = {}){
            const group = new THREE.Group();
            const monkey = baseMonkey.clone();
            monkey.scale.set(2, 2, 2); // This scales the model to twice its original size

            monkey.position.set(...position);
            monkey.rotation.y = - Math.PI * ( 60 / 180);
            monkey.rotation.x = Math.PI / 2;
            return monkey;
        }
    }
})


