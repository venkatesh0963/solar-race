import * as THREE from 'three';

export default class Player {
  constructor(scene) {
    this.scene = scene;
    
    this.mesh = new THREE.Group();
    
    // Space Ship Materials
    const hullMat = new THREE.MeshStandardMaterial({ 
      color: 0x88aacc, // Slightly bluish space metal
      metalness: 0.9, 
      roughness: 0.2 
    });
    const darkMetal = new THREE.MeshStandardMaterial({ 
      color: 0x223344, 
      metalness: 0.9, 
      roughness: 0.4 
    });
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const engineGlow = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Cyan space exhaust

    // 1. Fuselage
    const fuselageGeo = new THREE.CapsuleGeometry(0.5, 3, 4, 16);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.castShadow = true;
    this.mesh.add(fuselage);

    // 2. Cockpit Canopy
    const canopyGeo = new THREE.CapsuleGeometry(0.3, 1.5, 4, 16);
    canopyGeo.rotateX(Math.PI / 2);
    const canopy = new THREE.Mesh(canopyGeo, glassMaterial);
    canopy.position.set(0, 0.3, -0.5);
    canopy.rotation.x = -0.1;
    this.mesh.add(canopy);

    // 3. Main Wings (swept forward for space fighter look)
    const wingGeo = new THREE.BoxGeometry(5, 0.1, 1.5);
    const wings = new THREE.Mesh(wingGeo, darkMetal);
    wings.position.set(0, 0, 0.5);
    wings.rotation.y = Math.PI; // Sweep forward
    wings.castShadow = true;
    this.mesh.add(wings);

    // 4. Tail Fin
    const tailFinGeo = new THREE.BoxGeometry(0.1, 1.2, 1);
    const tailFin = new THREE.Mesh(tailFinGeo, darkMetal);
    tailFin.position.set(0, 0.6, 1.5);
    tailFin.rotation.x = -0.2;
    tailFin.castShadow = true;
    this.mesh.add(tailFin);

    // 6. Engine
    const engineGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 16);
    engineGeo.rotateX(Math.PI / 2);
    const engine = new THREE.Mesh(engineGeo, darkMetal);
    engine.position.set(0, 0, 2.2);
    this.mesh.add(engine);

    // Engine Glow
    const glowGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.2, 16);
    glowGeo.rotateX(Math.PI / 2);
    this.thrusterGlow = new THREE.Mesh(glowGeo, engineGlow);
    this.thrusterGlow.position.set(0, 0, 2.5);
    this.mesh.add(this.thrusterGlow);

    // 7. Dynamic Lights
    // Engine Point Light
    const engineLight = new THREE.PointLight(0x00ffff, 50, 15);
    engineLight.position.set(0, 0, 3.0);
    this.mesh.add(engineLight);

    // Headlight SpotLight
    const headLight = new THREE.SpotLight(0xffffff, 200, 200, Math.PI / 5, 0.5, 1);
    headLight.position.set(0, 0, -2.5);
    
    // The SpotLight needs a target to point at
    this.headLightTarget = new THREE.Object3D();
    this.headLightTarget.position.set(0, 0, -50);
    this.mesh.add(this.headLightTarget);
    headLight.target = this.headLightTarget;
    
    this.mesh.add(headLight);

    // Start position and Scale
    this.mesh.position.set(0, 0, 0);
    this.mesh.scale.set(0.4, 0.4, 0.4); // Scaled down size
    this.scene.add(this.mesh);

    // Collision Box
    this.boundingBox = new THREE.Box3();
    
    // Physics
    this.forwardSpeed = 100;
    this.lateralSpeed = 45;
    this.verticalSpeed = 40;
    
    // Boundaries
    this.trackWidth = 25; // Wider in space
    this.trackHeightMin = -15;
    this.trackHeightMax = 15;
  }

  update(dt, inputAxis, verticalAxis, difficultyMultiplier = 1.0) {
    // Move Forward
    this.mesh.position.z -= (this.forwardSpeed * difficultyMultiplier) * dt;

    // Move Lateral
    this.mesh.position.x += inputAxis * (this.lateralSpeed * (1 + (difficultyMultiplier - 1) * 0.5)) * dt;
    
    // Move Vertical
    this.mesh.position.y += verticalAxis * (this.verticalSpeed * (1 + (difficultyMultiplier - 1) * 0.5)) * dt;
    
    // Clamp Movement
    if (this.mesh.position.x > this.trackWidth) this.mesh.position.x = this.trackWidth;
    if (this.mesh.position.x < -this.trackWidth) this.mesh.position.x = -this.trackWidth;
    
    if (this.mesh.position.y > this.trackHeightMax) this.mesh.position.y = this.trackHeightMax;
    if (this.mesh.position.y < this.trackHeightMin) this.mesh.position.y = this.trackHeightMin;

    // Bank (tilt) the ship when steering
    const targetBank = -inputAxis * Math.PI * 0.25;
    this.mesh.rotation.z += (targetBank - this.mesh.rotation.z) * 10 * dt;
    
    // Pitch the ship slightly when moving up/down
    const targetPitch = verticalAxis * Math.PI * 0.15;
    this.mesh.rotation.x += (targetPitch - this.mesh.rotation.x) * 10 * dt;

    // Update Bounding Box
    this.boundingBox.setFromObject(this.mesh);
    // Make the player's hitbox 10% smaller than the visual mesh to feel fair but accurate
    const pSize = new THREE.Vector3();
    this.boundingBox.getSize(pSize);
    this.boundingBox.expandByVector(pSize.multiplyScalar(-0.1));
  }

  reset() {
    this.mesh.position.set(0, 0, 0);
    this.mesh.rotation.set(0, 0, 0);
  }
}
