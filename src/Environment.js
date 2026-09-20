import * as THREE from 'three';

export default class Environment {
  constructor(scene) {
    this.scene = scene;
    
    this.obstacles = []; // Meteors
    this.coins = []; // Fuel coins
    this.planets = []; // Static background planets
    this.magnets = []; // Magnet powerups
    
    // Materials
    this.matMeteor = new THREE.MeshStandardMaterial({ 
      color: 0x111111, // Pitch black rock
      roughness: 1.0, 
      flatShading: true
    });
    this.matLava = new THREE.MeshBasicMaterial({
      color: 0xff3300 // Glowing orange lava
    });
    
    // Meteor Shapes
    this.geoMeteorBase = new THREE.DodecahedronGeometry(8, 0);
    this.geoLavaCore = new THREE.IcosahedronGeometry(7.5, 0); // Pokes through to create cracks

    // Fuel Coin Shape (Glowing cyan diamond)
    this.geoCoin = new THREE.SphereGeometry(1.5, 16, 16);
    this.matCoin = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // glowing cyan
    
    // Spawn tracking
    this.spawnZ = -100;
    this.despawnDistance = 200;
    
    // Create Starfield
    this.createStarfield();
  }

  reset() {
    for (let obs of this.obstacles) this.scene.remove(obs.mesh);
    for (let coin of this.coins) this.scene.remove(coin.mesh);
    for (let planet of this.planets) this.scene.remove(planet);
    for (let mag of this.magnets) this.scene.remove(mag.mesh);
    
    this.obstacles = [];
    this.coins = [];
    this.planets = [];
    this.magnets = [];
    this.spawnZ = -100;
    
    // Initial spawn
    for (let i = 0; i < 5; i++) {
      this.spawnMeteorRow();
      this.spawnZ -= 60;
    }
  }

  createStarfield() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const posArray = new Float32Array(starCount * 3);
    
    for(let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 2000;
    }
    
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({ size: 2, color: 0xffffff });
    const stars = new THREE.Points(starGeo, starMat);
    this.scene.add(stars);
  }

  update(dt, playerZ, difficultyMultiplier = 1.0) {
    // Spawn new meteors ahead
    if (this.spawnZ > playerZ - 800) {
      this.spawnMeteorRow();
      
      // Decrease spacing as difficulty increases, but base spacing increased by ~50% 
      // to reduce total obstacle density by 35%
      const spacing = Math.max(30, 90 / difficultyMultiplier);
      this.spawnZ -= spacing; 
    }

    // Clean up and animate meteors
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      
      // Meteor comes towards the player!
      obs.mesh.position.z += obs.moveSpeedZ * dt;
      
      // Spin the meteor
      obs.mesh.rotation.x += obs.spinSpeed.x * dt;
      obs.mesh.rotation.y += obs.spinSpeed.y * dt;
      obs.mesh.rotation.z += obs.spinSpeed.z * dt;

      if (obs.mesh.position.z > playerZ + this.despawnDistance) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // Animate and clean up coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      // Spin animation
      coin.mesh.rotation.y += 2 * dt;
      coin.mesh.rotation.z += 1 * dt;
      
      if (coin.mesh.position.z > playerZ + this.despawnDistance) {
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
      }
    }
    
    // Clean up background planets
    for (let i = this.planets.length - 1; i >= 0; i--) {
        const planet = this.planets[i];
        if (planet.position.z > playerZ + 500) {
            this.scene.remove(planet);
            this.planets.splice(i, 1);
        }
    }
  }

  spawnMeteorRow() {
    // Decreased meteor count by ~20% (Spawn 2 to 4 instead of 3 to 6)
    const numObstacles = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numObstacles; i++) {
      const meteorGroup = new THREE.Group();
      
      // Simple dark rock colors
      const rockColors = [0x111111, 0x222222, 0x1a1a1a]; 
      const rColor = rockColors[Math.floor(Math.random() * rockColors.length)];
      
      const rockMat = new THREE.MeshStandardMaterial({ color: rColor, roughness: 1.0, flatShading: true });
      const rockMesh = new THREE.Mesh(this.geoMeteorBase, rockMat);
      rockMesh.castShadow = true;
      rockMesh.receiveShadow = true;
      meteorGroup.add(rockMesh);
      
      // Random position across a wider space track
      const xPos = (Math.random() - 0.5) * 50;
      const yPos = (Math.random() - 0.5) * 30; // Random height
      
      // Meteors spawn far ahead
      meteorGroup.position.set(xPos, yPos, this.spawnZ);
      
      // Random rotation
      meteorGroup.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      // Reduce overall size of obstacles
      const scale = 0.4 + Math.random() * 0.6; // Much smaller
      meteorGroup.scale.set(scale, scale, scale);
      
      this.scene.add(meteorGroup);
      
      this.obstacles.push({
        mesh: meteorGroup,
        box: new THREE.Box3().setFromObject(meteorGroup),
        moveSpeedZ: 50 + Math.random() * 50,
        spinSpeed: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
        }
      });
    }
    
    // Spawn a planet occasionally in the background
    if (Math.random() < 0.05) {
        this.spawnPlanet();
    }

    // 2. Spawn Fuel Coins
    if (Math.random() > 0.5) { // 50% chance to spawn a coin cluster
      const numCoins = Math.floor(Math.random() * 3) + 1;
      const startX = (Math.random() - 0.5) * 40;
      const startY = (Math.random() - 0.5) * 20;
      
      const coinMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      
      for(let i=0; i < numCoins; i++) {
        const mesh = new THREE.Mesh(this.geoCoin, coinMat);
        mesh.position.set(startX, startY, this.spawnZ - (i * 10)); // Line them up
        this.scene.add(mesh);
        
        this.coins.push({
           mesh: mesh,
           box: new THREE.Box3().setFromObject(mesh)
        });
      }
    }
  }

  spawnPlanet() {
      // Big background planets to avoid visually, but they are too far to hit
      const radius = 50 + Math.random() * 100;
      const planetGeo = new THREE.SphereGeometry(radius, 32, 32);
      
      // Random planet color
      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.5);
      const planetMat = new THREE.MeshStandardMaterial({ 
          color: color,
          roughness: 0.8,
      });
      
      const planet = new THREE.Mesh(planetGeo, planetMat);
      
      // Place far off to the side, and deep in Z
      const side = Math.random() > 0.5 ? 1 : -1;
      planet.position.set(side * (100 + Math.random() * 200), (Math.random() - 0.5) * 100, this.spawnZ - 500);
      
      this.scene.add(planet);
      this.planets.push(planet);
  }

  createCoinMesh() {
    const coinGroup = new THREE.Group();
    
    // Inner glowing core
    const coreGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(coreGeo, coreMat);
    coinGroup.add(core);

    // Outer cyan halo/ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.2, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    coinGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = 0;
    coinGroup.add(ring2);

    return coinGroup;
  }

  checkCollisions(playerBox) {
    for (let obs of this.obstacles) {
      obs.box.setFromObject(obs.mesh);
      
      // Shrink hitbox slightly for fair gameplay
      const size = new THREE.Vector3();
      obs.box.getSize(size);
      obs.box.expandByVector(size.multiplyScalar(-0.15));
      
      if (playerBox.intersectsBox(obs.box)) {
        return true;
      }
    }
    return false;
  }

  checkCoinCollisions(playerBox) {
    let collected = 0;
    // Make the coin's hitbox much larger than its visual size so it's easy to grab
    // and stretch it heavily in the Z axis to prevent "tunneling" right through it at high speeds!
    const magneticReach = new THREE.Vector3(5, 5, 20); 
    
    for (let i = this.coins.length - 1; i >= 0; i--) {
      this.coins[i].box.setFromObject(this.coins[i].mesh);
      this.coins[i].box.expandByVector(magneticReach);
      
      if (playerBox.intersectsBox(this.coins[i].box)) {
        // Collect!
        this.scene.remove(this.coins[i].mesh);
        this.coins.splice(i, 1);
        collected++;
      }
    }
    return collected;
  }
  
  checkMagnetCollisions(playerBox) {
    let collected = 0;
    for (let i = this.magnets.length - 1; i >= 0; i--) {
      this.magnets[i].box.setFromObject(this.magnets[i].mesh);
      if (playerBox.intersectsBox(this.magnets[i].box)) {
        this.scene.remove(this.magnets[i].mesh);
        this.magnets.splice(i, 1);
        collected++;
      }
    }
    return collected;
  }

  reset() {
    for (let obs of this.obstacles) {
      this.scene.remove(obs.mesh);
    }
    this.obstacles = [];
    
    for (let coin of this.coins) {
      this.scene.remove(coin.mesh);
    }
    this.coins = [];
    
    for (let planet of this.planets) {
      this.scene.remove(planet);
    }
    this.planets = [];

    this.spawnZ = -100;
  }
}
