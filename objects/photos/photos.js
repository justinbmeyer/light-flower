import * as THREE from 'three';



function loadImageTextures(namesToPaths){
    const keys = Object.keys(namesToPaths);
    return Promise.all(Object.values(namesToPaths).map((path)=> {
        return new Promise((resolve, reject)=>{
            const loader = new THREE.TextureLoader();
            loader.load(path, resolve, undefined, reject)
        })
    })).then(textures => {
        const namesToTextures = {};
        for(let i = 0; i < keys.length; i++) {
            namesToTextures[keys[i]] = textures[i];
        }
        return namesToTextures;
    })
}

const photos = {
    "head-on-arms": "./objects/photos/head-on-arms.png",
    "kira-awake": "./objects/photos/kira-awake-2.png",
}

export function load_photos(){
    return loadImageTextures(photos).then(function(namesToTextures){
        return {
            init_photo(name){
                const texture = namesToTextures[name];
                const aspectRatio = texture.image.width / texture.image.height;

                // Define the size of the geometry based on the aspect ratio
                // For example, if you want the height of the plane to be 1 unit:
                const planeHeight = 1;
                const planeWidth = planeHeight * aspectRatio;

                // Create the geometry (rectangle) with the aspect ratio
                const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

                // Create the material and set the texture as its map
                const material = new THREE.MeshPhongMaterial({ map: texture, transparent: true });

                // Create the mesh
                const mesh = new THREE.Mesh(geometry, material);
                return mesh;
            }

        }
    })
}