import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { moveToSurfaceOfSphere } from '../../geometry-helpers.js';
import * as THREE from 'three';

import { load_photos } from '../photos/photos.js';
import { yawnish,nightSounds } from '../../sounds/sounds.js';






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
let flowersPicked = 0;

export const flowerPromise = loadFlowerPromise();

export function load_flowers(handlers){
    return Promise.all([flowerPromise,load_photos()])
        .then(([baseFlower, {init_photo}]) => {
        return {
            init_flower({position = [0,0,0]} = {}){
                const group = new THREE.Group();
                const flower = baseFlower.clone();
                flower.rotation.y = - Math.PI * 55 / 180;
                group.add(flower);

                /*const box = new THREE.Box3().setFromObject(flower);
                const boundingSphere = new THREE.Sphere();
                box.getBoundingSphere(boundingSphere);
                

                // Create a visual representation of the bounding sphere
                const sphereMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x00ff00, wireframe: true, 
                    transparent: true,
                    opacity: 0.0
                });
                const boundingSphereMesh = new THREE.Mesh(new THREE.SphereGeometry(boundingSphere.radius, 32, 32), sphereMaterial);
                boundingSphereMesh.position.copy(boundingSphere.center);*/
                //group.add(boundingSphereMesh);

                const headOnArms = init_photo("head-on-arms");
                headOnArms.scale.set(.3,.3,.3);
                headOnArms.position.set(0,.265,.029);
                group.add(headOnArms);
                
                const kiraAwake = init_photo("kira-awake");
                kiraAwake.scale.set(.2,.2,.2);
                kiraAwake.position.set(0,.27,.025);
                kiraAwake.visible = false;
                group.add(kiraAwake);
        
                
        

                group.scale.set(4,4,4);

                moveToSurfaceOfSphere({radius: 10, object3d: group});
                group._originalRotation = group.rotation.clone();
                group._soundPlayed = false;
                group._picked = false;
                group._awake = kiraAwake;
                group._sleeping = headOnArms;
                return group;
            },
            animate_flower(flower, camera, mouse) {
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);
                const flowerIntersects = raycaster.intersectObjects(flower.children);
                if(flowerIntersects.length) {
                    const closest = flowerIntersects[0].distance;
                    if(closest > 10) {
                        // we are probably seeing a flower through the earth
                        return;
                    }
                    //flowerScale = flowerScale + 0.01;
                    //flower.scale.set(flowerScale, flowerScale, flowerScale);
                    if(flower.scale.x < 5) {
                        if(flower.scale.x < 4) {
                            flower.scale.addScalar(0.20);
                        } else {
                            flower.scale.addScalar(0.04);
                        }
                        
                    } else if(!flower._picked){
                        flower._picked = true;
                        flowersPicked++;
                        flower._awake.visible = true;
                        flower._sleeping.visible = false;
                        if(handlers.flowerPicked) {
                            handlers.flowerPicked();
                        }
                        return;
                    }
                    
                    flower.rotation.copy(flower._originalRotation);
                    const rotatedPoint = movePointToSphereWithReferencePointAtNorthPole(camera.position, flower.position);
                    const yaw = getYawFromPointOnSphere(rotatedPoint);
                    flower.rotateOnAxis(new THREE.Vector3(0, 1, 0), yaw )
                    if(!flower._soundPlayed) {
                        flower._soundPlayed = true;
                        yawnish.play();
                    }
                }
            }
        }
    })
}


function rotateOnYAxisFromBasePosition(object, yaw){
    object.rotateOnAxis(new THREE.Vector3(0, 1, 0), yaw );
    var euler = new THREE.Euler().setFromQuaternion(object.quaternion, 'XYZ');

    // Extracting individual angles
    var pitch = euler.x; // Rotation around X-axis
    var yaw = euler.y;   // Rotation around Y-axis
    var roll = euler.z;  // Rotation around Z-axis

    object.rotation.set(0, 0, 0);
    object.quaternion.set(0, 0, 0, 1);

    // Apply new rotation
    object.rotation.x = pitch;
    object.rotation.y = yaw;
    object.rotation.z = roll;
}

function movePointToSphereWithReferencePointAtNorthPole(point, referencePoint){
    const pointToNorthPole = referencePoint.clone();
    var northPole = new THREE.Vector3(0, 1, 0); // Y-axis
    var axis = new THREE.Vector3();

    axis.crossVectors(pointToNorthPole, northPole).normalize();

    var angle = Math.acos(pointToNorthPole.normalize().dot(northPole));

    var quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, angle);


    var rotatedPoint = point.clone();
        rotatedPoint.applyQuaternion(quaternion);
    return rotatedPoint;
}

function getYawFromPointOnSphere(position){
    var direction = position.clone().normalize();

    // Calculate pitch and yaw
    var pitch = Math.atan2(-direction.y, Math.sqrt((direction.x * direction.x) + (direction.z * direction.z)));
    var yaw = Math.atan2(direction.x, direction.z);

    // Create a Euler object (assuming 'XYZ' order)
    return yaw;
}

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