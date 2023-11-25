import * as THREE from 'three';

export function makeGrass(){
    const bladeGeometry = new THREE.PlaneGeometry(0.1, 1, 1, 5);
    const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0x108010, side: THREE.DoubleSide });
    const numBlades = 50000; // Number of grass blades
    const instancedGrass = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, numBlades);

    for (let i = 0; i < numBlades; i++) {
        const position = new THREE.Vector3(
            7 - Math.random() * 14, // Random x position
            7 - Math.random() * 14, // y position (ground level)
            0 // Random z position
        );

        const scale = Math.random() * 0.1 + 0.1; // Random scale for variety
        const matrix = new THREE.Matrix4().makeTranslation(
            position.x, position.y, position.z
        );
    
        // Rotate each blade to stand upright and add random variation
        const rotationX = Math.PI / 2 + (Math.random() - 0.5) * 0.1;
        const rotationY = (Math.random() ) * Math.PI; // Slight rotation around Y-axis
        const rotationZ = (Math.random() ) * Math.PI; // Slight rotation around Z-axis

        const rotation = new THREE.Matrix4().makeRotationX(rotationX);
        rotation.multiply(new THREE.Matrix4().makeRotationY(rotationY));
        rotation.multiply(new THREE.Matrix4().makeRotationZ(rotationZ));

        // Apply scale and rotation
        matrix.multiply(rotation).scale(new THREE.Vector3(scale, scale, scale));

        const colorVariation = new THREE.Color(0xffffff);
        colorVariation.multiplyScalar(0.5 + Math.random() * 0.5); // Vary the green color
        instancedGrass.setColorAt(i, colorVariation);

        instancedGrass.setMatrixAt(i, matrix);
    }

    return instancedGrass;
}

export function makeGrassTexture(){
    const planeGeometry = new THREE.PlaneGeometry(12, 12);
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('./models/green-grass-1024x1024.jpg');
    const grassMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
    const grass = new THREE.Mesh(planeGeometry, grassMaterial);
    //grass.rotation.x = -Math.PI / 2; // Rotate to lay it flat
    return grass;
}