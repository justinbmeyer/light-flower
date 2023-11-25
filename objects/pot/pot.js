import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';


function getPot(success, progress, error){
    const loader = new GLTFLoader();
    loader.load(
        './models/pot-bottom.glb', // path to your glb file
        success,
        progress,
        error
    );
}