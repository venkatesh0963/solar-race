import * as THREE from 'three';

export default class Player {
  constructor(scene) {
    this.scene = scene;
    
    this.mesh = new THREE.Group();
    
    // Space Ship Materials (Dark Stealth)
    const hullMat = new THREE.MeshStandardMaterial({ 
      color: 0x0a0a0c, // Very dark grey/black
      metalness: 0.9, 
      roughness: 0.3,
      flatShading: true
    });
    const cockpitMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff // Glowing cyan for bloom
    });
    const engineGlow = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.7 
    }); 

    // 1. Main Fuselage (Sharp stealth body)
    // ConeGeometry(radius, height, radialSegments)
    const fuselageGeo = new THREE.ConeGeometry(1, 4, 4);
    fuselageGeo.rotateX(Math.PI / 2);
    fuselageGeo.rotateZ(Math.PI / 4); // Rotate 45deg so it's a diamond shape
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.castShadow = true;
    this.mesh.add(fuselage);

    // 2. Cockpit Window
    const canopyGeo = new THREE.ConeGeometry(0.5, 2, 4);
    canopyGeo.rotateX(Math.PI / 2);
    canopyGeo.rotateZ(Math.PI / 4);
    const canopy = new THREE.Mesh(canopyGeo, cockpitMat);
    canopy.position.set(0, 0.5, -0.5);
    this.mesh.add(canopy);

    // 3. Main Wings (Delta Wing style)
    const wingGeo = new THREE.ConeGeometry(3.5, 2.5, 3);
    wingGeo.rotateX(Math.PI / 2);
    const wings = new THREE.Mesh(wingGeo, hullMat);
    wings.position.set(0, -0.2, 0.5);
    wings.scale.set(1, 0.1, 1); // Flatten it
    wings.castShadow = true;
    this.mesh.add(wings);

    // 4. Tail Fins
    const tailFinGeo = new THREE.ConeGeometry(0.8, 1.5, 3);
    tailFinGeo.rotateX(Math.PI / 2);
    
    const leftFin = new THREE.Mesh(tailFinGeo, hullMat);
    leftFin.position.set(-0.8, 0.5, 1.5);
    leftFin.scale.set(0.1, 1, 1);
    leftFin.rotation.z = -0.3;
    this.mesh.add(leftFin);

    const rightFin = new THREE.Mesh(tailFinGeo, hullMat);
    rightFin.position.set(0.8, 0.5, 1.5);
    rightFin.scale.set(0.1, 1, 1);
    rightFin.rotation.z = 0.3;
    this.mesh.add(rightFin);

    // 5. Engine Exhaust Trails (Massive Cyan Glow)
    const trailGeo = new THREE.ConeGeometry(0.4, 15, 8);
    trailGeo.rotateX(-Math.PI / 2); // Point backwards
    // Move geometry so origin is at the top of the cone (attaches to ship)
    trailGeo.translate(0, 0, 7.5); 
    
    this.leftTrail = new THREE.Mesh(trailGeo, engineGlow);
    this.leftTrail.position.set(-0.5, 0, 2);
    this.mesh.add(this.leftTrail);

    this.rightTrail = new THREE.Mesh(trailGeo, engineGlow);
    this.rightTrail.position.set(0.5, 0, 2);
    this.mesh.add(this.rightTrail);

    // 7. Dynamic Lights
    // Headlight (Powerful SpotLight pointing forward into the void)
    const headLight = new THREE.SpotLight(0xffffff, 400, 400, Math.PI / 6, 0.3, 1.5);
    headLight.position.set(0, 0, -2.5);
    
    // The SpotLight needs a target to aim at
    const headLightTarget = new THREE.Object3D();
    headLightTarget.position.set(0, 0, -100); // Point far ahead
    this.mesh.add(headLightTarget);
    headLight.target = headLightTarget;
    
    this.mesh.add(headLight);

    // Engine Point Light
    const engineLight = new THREE.PointLight(0x00ffff, 100, 25);
    engineLight.position.set(0, 0, 3.0);
    this.mesh.add(engineLight);

    // Start position and Scale
    this.mesh.position.set(0, 0, 0);
    this.mesh.scale.set(0.8, 0.8, 0.8); // Significantly increased plane size
    this.scene.add(this.mesh);

    // Collision Box
    this.boundingBox = new THREE.Box3();
    
    // Magnet Aura (Hidden by default, shown when powerup is active)
    const auraGeo = new THREE.TorusGeometry(3.5, 0.3, 8, 32);
    const auraMat = new THREE.MeshBasicMaterial({ 
        color: 0xaa00ff, // Purple 
        transparent: true, 
        opacity: 0.8, 
        blending: THREE.AdditiveBlending 
    });
    this.magnetAura = new THREE.Mesh(auraGeo, auraMat);
    this.magnetAura.rotation.x = Math.PI / 2;
    this.magnetAura.visible = false;
    this.mesh.add(this.magnetAura);

    // Physics
    this.forwardSpeed = 100;
    this.lateralSpeed = 45;
    this.verticalSpeed = 40;
    
    // Boundaries
    this.trackWidth = 25; // Wider in space
    this.trackHeightMin = -15;
    this.trackHeightMax = 15;
    
    this.update(0, 0, 0, 1.0);
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
