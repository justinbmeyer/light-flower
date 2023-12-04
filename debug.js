import * as THREE from 'three';
import { init_cube } from './objects/cube.js';
import { getOrientation, getFirstEvent, addEventListener } from './orientation.js';
import { subtractAngles } from './geometry-helpers.js';



export function debug(scene, camera){

    

    init_grid(scene, camera);

    const axesEventHandlers = init_axes(scene, camera);

    const phoneTopDirectionEventHandlers = init_userPhoneTopDirection(scene, camera);

    const phoneOrientationData = init_phoneOrientationData(scene, camera);


    let lastOrientationData;
    addEventListener((orientationData)=>{
        lastOrientationData = orientationData;
    });
    
    let thereWasAKeyddown = false;
    window.addEventListener("keydown", function(event){
        thereWasAKeyddown = true;
    })

    return {
        animate(){

            axesEventHandlers.onCameraChange();
            phoneTopDirectionEventHandlers.onCameraChange();


            if(lastOrientationData) {
                phoneTopDirectionEventHandlers.onPhoneOrientationChange(lastOrientationData);
                phoneOrientationData.onPhoneOrientationChange(lastOrientationData);
            }
            /*
            if(thereWasAKeyddown) {
                console.log({
                    directionAndLeft: arePerpendicular(cameraDirection, left),
                    directionAndUp: arePerpendicular(cameraDirection,camera.up.clone() ),
                    upAndLeft: arePerpendicular(left, camera.up.clone()),
                    pos: camera.position.clone(), 
                    up: camera.up.clone(), 
                    direction: cameraDirection.clone(), 
                    left: left.clone(),
                    movement
                })
                thereWasAKeyddown = false;
            }*/

            /* 
            // The old way we used to position helpers visible to the person
            var cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);

            const left = new THREE.Vector3().crossVectors(camera.up, cameraDirection).normalize(),
                right = left.clone().negate(),
                movement = cameraDirection.clone().multiplyScalar(distanceInFrontOfCamera).add( camera.up.clone().multiplyScalar(distanceInFrontOfCamera) )
                    .add( left.multiplyScalar( distanceInFrontOfCamera * .5 * camera.aspect ))
            */
        }
    }
}

function init_grid(scene, camera){
    const size = 25; // The size of the grid (10x10 in this example)
    const divisions = 25; // How many divisions (lines) the grid will have

    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.rotation.x = Math.PI / 2; 
    gridHelper.position.x = 0;
    gridHelper.position.y = 0;
    gridHelper.position.z = 0;
    scene.add(gridHelper);

    const gridHelper2 = new THREE.GridHelper(size, divisions);
    gridHelper2.position.x = 0;
    gridHelper2.position.y = 0;
    gridHelper2.position.z = 0;
    scene.add(gridHelper2);


    // DEBUG
    scene.add( init_cube({x: 5, y: 5, color: 0xff8080}) )
    scene.add( init_cube({x: 5, y: -5, color: 0x800000}) )
    scene.add( init_cube({x: -5, y: 5, color: 0x8080ff}) )
    scene.add( init_cube({x: -5, y: -5, color: 0x000080}) )
    //scene.add( init_cube({x: 0, y: 0, color: 0xffffff}) )
}

function init_userPhoneTopDirection(scene, camera) {
    const userTopDirection = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 0.5, 0xffff00);

    // Add the arrow to the scene
    scene.add(userTopDirection);

    return {
        onPhoneOrientationChange(orientationData){
            userTopDirection.setDirection(orientationData.userTopDirection);
        },
        onCameraChange(){
            const corners = getCameraFrustrumCorners(camera);
            const topLeft = getUnitsFromCorner(corners, "top-left", 4, 0.2);
            userTopDirection.position.copy(topLeft.position)
        }
    }
}


function init_axes(scene, camera) {
    var axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper);

    return {
        onCameraChange(){
            const corners = getCameraFrustrumCorners(camera);
            const topLeft = getUnitsFromCorner(corners, "top-left", 4, 0.2);
            axesHelper.position.copy(topLeft.position);
        }
    }
}

function init_phoneOrientationData(scene, camera){

    // create an overlay
    const deviceOrientation = document.createElement("div");
    document.body.append(deviceOrientation);
    Object.assign(deviceOrientation.style,{
        position: "fixed",
        right: "0px",
        top: "0px",
        fontSize: "2vh",
        color: "white"
    });
    
    return {
        onPhoneOrientationChange(orientationData){
            const {adjustedOrientation, sourceOrientationEvent, deviceOrientationAtLastScreenOrientation, 
                screenOrientation, z, isOrientationRelativeToGravity} = orientationData;
            const event = sourceOrientationEvent;
            const firstEvent = deviceOrientationAtLastScreenOrientation,
                firstAlpha = firstEvent?.alpha || 0,
                dAlpha = Math.round(adjustedOrientation.alpha),
                firstBeta = firstEvent?.beta||0,
                dBeta = Math.round(adjustedOrientation.beta)
    
            deviceOrientation.innerHTML = `
                <pre style="margin: 0px">alpha (.) ${Math.round( event.alpha ) } - ${Math.round(firstAlpha)} = ${dAlpha}</pre>
                <pre style="margin: 0px">beta  (-) ${Math.round( event.beta ) }  - ${Math.round(firstBeta)} = ${dBeta}</pre>
                <pre style="margin: 0px">gamma (|) ${Math.round( event.gamma ) } - ${Math.round(firstEvent.gamma)} =${Math.round(adjustedOrientation.gamma)} </pre>
                <pre style="margin: 0px">${getOrientation()} ${isOrientationRelativeToGravity? "🌎" : "📱"}</p>
            `;
        }
    }
    
    
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
        const point = findPoint( plane );
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

export function init_orientation(){
    return new THREE.ArrowHelper(direction, origin, length, color);
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

function arePerpendicular(vector1, vector2){
    var dotProduct = vector1.dot(vector2);
    return Math.abs(dotProduct) < Number.EPSILON
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



const opposites = {
    "near": "far", "far": "near",
    "bottom": "top", "top": "bottom",
    "left": "right", "right": "left"
};

function getCameraFrustrumCorners(camera){
    // Assuming 'camera' is a THREE.PerspectiveCamera
    camera.updateMatrixWorld(); // Ensure the camera's matrixWorld is up to date

    const near = camera.near;
    const far = camera.far;
    const aspect = camera.aspect;
    const fov = camera.fov * Math.PI / 180; // Convert FOV from degrees to radians

    // Calculate heights and widths of the near and far planes
    const heightNear = 2 * Math.tan(fov / 2) * near;
    const widthNear = heightNear * aspect;
    const heightFar = 2 * Math.tan(fov / 2) * far;
    const widthFar = heightFar * aspect;

    // Function to create a corner point
    function createCorner(x, y, z) {
        const vector =  new THREE.Vector3(x, y, z)
            .unproject(camera)
        //vector.applyMatrix4(camera.matrixWorld);
        return vector;
    }

    // Create corner points in camera space
    return {
        "near-bottom-left": createCorner(-1, -1, -1), // near bottom-left
        "near-bottom-right": createCorner(1, -1, -1),  // near bottom-right
        "near-top-right": createCorner(1, 1, -1),   // near top-right
        "near-top-left": createCorner(-1, 1, -1),  // near top-left
        "far-bottom-left": createCorner(-1, -1, 1),    // far bottom-left
        "far-bottom-right": createCorner(1, -1, 1),     // far bottom-right
        "far-top-right": createCorner(1, 1, 1),      // far top-right
        "far-top-left": createCorner(-1, 1, 1)      // far top-left

        /*"near-bottom-left": createCorner(-widthNear / 2, -heightNear / 2, -near), // near bottom-left
        "near-bottom-right": createCorner(widthNear / 2, -heightNear / 2, -near),  // near bottom-right
        "near-top-right": createCorner(widthNear / 2, heightNear / 2, -near),   // near top-right
        "near-top-left": createCorner(-widthNear / 2, heightNear / 2, -near),  // near top-left
        "far-bottom-left": createCorner(-widthFar / 2, -heightFar / 2, -far),    // far bottom-left
        "far-bottom-right": createCorner(widthFar / 2, -heightFar / 2, -far),     // far bottom-right
        "far-top-right": createCorner(widthFar / 2, heightFar / 2, -far),      // far top-right
        "far-top-left": createCorner(-widthFar / 2, heightFar / 2, -far)      // far top-left*/
    }

}

/*
function getCameraFrustrumEdges(corners) {
    const nearFar = ["near", "far"],
        leftRight = ["right","left"],
        topBottom = ["top","bottom"];

    return {
        "near-bottom": createEdge(corners, "near-bottom-left", ), // near bottom-left
        "near-right": createEdge(1, -1, -1),  // near bottom-right
        "near-top": createEdge(1, 1, -1),   // near top-right
        "near-left": createEdge(-1, 1, -1),  // near top-left
        "far-bottom": createEdge(-1, -1, 1),    // far bottom-left
        "far-right": createEdge(1, -1, 1),     // far bottom-right
        "far-top": createEdge(1, 1, 1),      // far top-right
        "far-left": createEdge(-1, 1, 1)      // far top-left

    }

    for(let zPlane of nearFar) {
        for(let xPlane of leftRight) {

        }
        for(let yPlane of topBottom) {
            
        }
    }
}*/

function moveUnits(v1, v2, units=1){
    const howFarToMoveBack = new THREE.Vector3().subVectors(v2, v1).normalize().multiplyScalar(units);
    return v1.clone().add(howFarToMoveBack)
}
function moveScalarUnit(v1, v2, units=.5){
    const howFarToMoveBack = new THREE.Vector3().subVectors(v2, v1).multiplyScalar(units);
    return v1.clone().add(howFarToMoveBack)
}

function getUnitsFromCorner(corners, corner = "top-left", unitsToMoveBack = 1, howFar = 0.5){
    const cornerParts = corner.split("-");

    const startingCorner = corners["near-"+corner];
    const farCorner = corners["far-"+corner];

    const oppositeCorner = opposites[cornerParts[0]]+"-"+opposites[cornerParts[1]];
    const startingOppositeCorner = corners["near-"+oppositeCorner];
    const farOppositeCorner = corners["far-"+oppositeCorner];

    const movedBackFromStarting = moveUnits(startingCorner, farCorner, unitsToMoveBack);
    const movedBackFromOpposite = moveUnits(startingOppositeCorner, farOppositeCorner, unitsToMoveBack);

    const howFarToMoveBack = new THREE.Vector3().subVectors(movedBackFromOpposite, movedBackFromStarting).multiplyScalar(howFar);
    return {
        moved: howFarToMoveBack,
        position:  movedBackFromStarting.clone().add(howFarToMoveBack)
    }
    



    /*
    // we want everything that is different by 1 item ...
    const cornerParts = corner.split("-");
    const startingCorner = corners[corner];
    const finalPosition =  startingCorner.clone();
    for(let i = 2; i >=0; i--) {
        const cornerNameToMoveTowards = [...cornerParts]
        cornerNameToMoveTowards[i] = opposites[cornerParts[i]];
        const cornerToMoveTowards = corners[cornerNameToMoveTowards.join("-")];
        const movement = new THREE.Vector3().subVectors(cornerToMoveTowards, startingCorner).multiplyScalar(.5);
        finalPosition.add(movement);
    }
    return finalPosition;*/
}
