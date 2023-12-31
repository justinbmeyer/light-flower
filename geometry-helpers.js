import * as THREE from 'three';

export function rotation(normal){
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

export function alignToNormal(vector1){
    //
}


function getNormalFromMesh(mesh){
    var normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    return new THREE.Vector3(0, 0, 1).applyMatrix3(normalMatrix).normalize();
}

const up = new THREE.Vector3(0,0,1);
export function moveToSurfaceOfSphere({radius, object3d}) {
    const position = randomPointOnSphere(radius);
    /*console.log(position)
    object3d.position.set(...position);
    return;*/
    const matrix = new THREE.Matrix4().makeTranslation(
        position.x, position.y, position.z
    );
    const normalized = position.normalize();

    const up = new THREE.Vector3(0,1,0).normalize()

    var quaternion = new THREE.Quaternion().setFromUnitVectors( up, normalized  );
    const rotation = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);

    matrix.multiply(rotation);

    var finalPosition = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3(5,5,5);
    matrix.decompose(finalPosition, quaternion, scale);

    // Apply the decomposed components to the group
    object3d.position.copy(finalPosition);
    object3d.quaternion.copy(quaternion);
    object3d.scale.copy(scale);
}

export function randomPointOnSphere(radius){
    const u = Math.random();
    const v = Math.random();

    const theta = Math.acos(2 * v - 1); // Inclination angle
    const phi = 2 * Math.PI * u; // Azimuthal angle

    // Convert spherical coordinates to Cartesian coordinates
    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(theta);

    // The point (x, y, z) is a random point on the surface of the sphere
    return new THREE.Vector3(x,y,z)
}



export function addAngles(angle1, angle2) {
    var sum = angle1 + angle2;
    // Normalize the sum to be within 0 to 360 degrees
    sum = sum % 360;
    if (sum < 0) {
        sum += 360;
    }
    return sum;
}

export function subtractAngles(angle1, angle2) {
    var difference = angle2 - angle1;

    // Adjusting for angles greater than 360 or less than -360
    difference = (difference + 360) % 360;

    if (difference > 180) {
        difference -= 360;
    }
    
    return difference;
}




export function getNormalOfScreen(event, orientationType = getOrientation()){
    let {alpha, beta, gamma, absolute} = event;
    if(report === true) {
        
        console.log(orientationType, "("+[alpha, beta, gamma].join(", ")+")", absolute);
        report = false;
    }
    alpha = THREE.MathUtils.degToRad(alpha);
    beta = THREE.MathUtils.degToRad(beta);
    gamma = THREE.MathUtils.degToRad(-gamma);
    

    // Create Euler object
    var euler = new THREE.Euler(beta,alpha , gamma, 'YXZ'); // The order might vary depending on your use case

    // Apply rotation to a base vector
    var baseVector = new THREE.Vector3(0, 1, 0); // Z-axis unit vector
    return baseVector.applyEuler(euler);
}


export function tween(startValue = 0, endValue = 1, time = 5000){
    let startTime = new Date().getTime();
    return {
        getValue() {
            const curTime = new Date().getTime();
            const fractionOfTime = Math.min( (curTime - startTime ) / time, 1);
            return startValue + (endValue - startValue) * fractionOfTime;
        },
        newEndValue(newEndValue){
            startValue = this.getValue();
            startTime = new Date().getTime();
            endValue = newEndValue
        }
    }
}