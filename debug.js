import * as THREE from 'three';
import { init_cube } from './objects/cube.js';

export function debug(scene){

    const size = 10; // The size of the grid (10x10 in this example)
    const divisions = 10; // How many divisions (lines) the grid will have

    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.rotation.x = Math.PI / 2; 
    gridHelper.position.x = 0;
    gridHelper.position.y = 0;
    gridHelper.position.z = 0;
    scene.add(gridHelper);


    // DEBUG
    scene.add( init_cube({x: 5, y: 5, color: 0xff8080}) )
    scene.add( init_cube({x: 5, y: -5, color: 0x800000}) )
    scene.add( init_cube({x: -5, y: 5, color: 0x8080ff}) )
    scene.add( init_cube({x: -5, y: -5, color: 0x000080}) )
    scene.add( init_cube({x: 0, y: 0, color: 0xffffff}) )
}

function numberToHexString(number) {
    return "0x" + number.toString(16).toUpperCase().padStart(6, '0');
}

export function drawFrustrum(scene , camera){
    camera.updateProjectionMatrix()
    
    let frustum = new THREE.Frustum();
    let cameraViewProjectionMatrix = new THREE.Matrix4();
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

    let colors = [0x800000,0xff8080,0x008000,0x80ff80,0x000080,0x8080ff];
    let names = ["right","left","bottom","top","far","near"];

    console.table( frustum.planes
        .map((p, i) => {
            return {name: names[i], color: numberToHexString(colors[i]), constant: p.constant,  normal: [p.normal.x,p.normal.y, p.normal.z].join() }
        }) )
    

    const floor = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    let planes = frustum.planes;
    planes.forEach((plane, i) => {
        let normal = plane.normal;
        // Define the size of the plane mesh
        let planeSize = 7; // Adjust as needed
    
        // Create a PlaneGeometry and a MeshBasicMaterial
        let planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
        let planeMaterial = new THREE.MeshBasicMaterial({
            color: colors[i], // Example color
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
    
        // Create a mesh
        let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        let quaternion = new THREE.Quaternion();
        let up = new THREE.Vector3(0, 1, 0);

        //quaternion.setFromUnitVectors(up, normal.normalize());
        //planeMesh.quaternion.copy(quaternion);

        let displacement = normal.clone().normalize().multiplyScalar(plane.constant);
        const point = findPoint( plane);
        planeMesh.position.add(displacement);
        console.log(names[i], point, rotation(normal));
        if(point) {
            //planeMesh.position.x = point.x;
            //planeMesh.position.y = point.y;
            //planeMesh.position.z = point.z;
            const curNormal = getNormalFromMesh(planeMesh);
            const theta = angleBetweenNormals(curNormal, normal);

            const r = rotation(normal)
    
            // Applying rotation to the mesh
            //animateRotation(planeMesh, r);
            //planeMesh.rotation.x = r.x;
            //planeMesh.rotation.y = r.y;
            //planeMesh.rotateOnAxis(normal, theta);
            planeMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), r.y);
            planeMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), r.x);
        }
       

    
        // Position and orient the mesh to align with the frustum plane
        // This step is non-trivial - you need to set the position and rotation 
        // of the mesh so that it matches the position and orientation of the frustum plane.
        // One way to do this is to use the plane's normal and a coplanar point.
    
        // Add the mesh to the scene
        if(i >= 0 && i <= 1) {
            scene.add(planeMesh);
        }
        

        //if(names[i] === "left") {
            
        //}
    });

    camera.far = 100;
    camera.updateProjectionMatrix();
}

function animateRotation(mesh, r){
    let amount = 0;
    const iteration = function(){
        amount += 0.1;
        if(amount < 1) {
            mesh.rotation.x = amount *r.x;
            //mesh.rotation.y = amount * r.y
            setTimeout(iteration, 2000);
        } else{
            mesh.rotation.x = r.x;
            mesh.rotation.y = r.y
        }
    };

    
    setTimeout(iteration,2000);
}

function getNormalFromMesh(mesh){
    var normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    return new THREE.Vector3(0, 0, 1).applyMatrix3(normalMatrix).normalize();
}

function findPoint(plane){
    var normal = plane.normal; // normal = (nx, ny, nz)
    var constant = plane.constant; // d

    var x, y;

    if (normal.y !== 0) {
        // Set x = 0, solve for y
        x = 0;
        y = constant / normal.y;
    } else if (normal.x !== 0) {
        // Set y = 0, solve for x
        y = 0;
        x = constant / normal.x;
    } else {
        // The plane is parallel to the XY plane
        // Handle this case as needed (no intersection)
        return;
    }

    return new THREE.Vector3(x, y, 0);
}

function rotation(normal){
    normal = normal.clone().normalize();
    var pitch = Math.atan2(normal.y, Math.sqrt(normal.x * normal.x + normal.z * normal.z));

    // Yaw (rotation around Y-axis)
    var yaw = Math.atan2(normal.x, normal.z);

    return {x: pitch, y: yaw};
}

function angleBetweenNormals(vector1, vector2) {
    vector1.normalize();
    vector2.normalize();

    // Calculate the dot product
    var dot = vector1.dot(vector2);

    // Calculate the angle in radians
    return Math.acos(dot);
}