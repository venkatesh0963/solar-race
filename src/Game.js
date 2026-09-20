import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import Player from './Player.js';
import Environment from './Environment.js';
import InputManager from './InputManager.js';

export default class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.scoreText = document.getElementById('score-text');
    this.solarFill = document.getElementById('solar-fill');
    
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.solarEnergy = 100;
    this.difficultyMultiplier = 1.0;
    
    // New Life System
    this.lives = 3;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.hearts = [
      document.getElementById('life-1'),
      document.getElementById('life-2'),
      document.getElementById('life-3')
    ];
    
    this.clock = new THREE.Clock();

    // Scene Setup (Space Theme)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Pitch black space
    // No fog in space, or very dark distant fog
    this.scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Camera Setup
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    // Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Set tone mapping for bloom
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Post-Processing Setup
    const renderScene = new RenderPass(this.scene, this.camera);
    // UnrealBloomPass(resolution, strength, radius, threshold)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2.0, 0.5, 0.1);
    
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);

    // Lighting (Colorful Ambient)
    this.ambientLight = new THREE.AmbientLight(0x442266, 1.5); // Rich purple ambient
    this.scene.add(this.ambientLight);
    
    this.dirLight = new THREE.DirectionalLight(0xffddaa, 1.5); // Warm starlight
    this.dirLight.position.set(200, 300, -500); 
    this.dirLight.castShadow = true;
    this.dirLight.shadow.camera.top = 200;
    this.dirLight.shadow.camera.bottom = -200;
    this.dirLight.shadow.camera.left = -200;
    this.dirLight.shadow.camera.right = 200;
    this.dirLight.shadow.camera.near = 0.1;
    this.dirLight.shadow.camera.far = 1000;
    this.scene.add(this.dirLight);

    // Create a procedural soft glowing texture for particles (fixes the "square box" issue)
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const ctx = particleCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    // Starfield Background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for(let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 2000; // Spread over 2000 units
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.5,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false
    });
    this.starfield = new THREE.Points(starGeometry, starMaterial);
    this.starfield.frustumCulled = false; // Prevents disappearing when moving far from origin
    this.scene.add(this.starfield);

    // Colorful Nebula Dust
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 500;
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    
    const colorPalette = [
      new THREE.Color(0xff0066), // Hot Pink
      new THREE.Color(0x00ffff), // Cyan
      new THREE.Color(0xffaa00), // Gold
      new THREE.Color(0x7700ff), // Purple
      new THREE.Color(0x00ff88)  // Mint Green
    ];

    for(let i = 0; i < dustCount; i++) {
      dustPos[i*3] = (Math.random() - 0.5) * 1500;
      dustPos[i*3+1] = (Math.random() - 0.5) * 1500;
      dustPos[i*3+2] = (Math.random() - 0.5) * 1500;
      
      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      dustColors[i*3] = c.r;
      dustColors[i*3+1] = c.g;
      dustColors[i*3+2] = c.b;
    }
    
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    
    const dustMat = new THREE.PointsMaterial({
      size: 100, // Massive soft clouds
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.15, // Soft ambient glow
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.nebula = new THREE.Points(dustGeo, dustMat);
    this.nebula.frustumCulled = false; // Prevents disappearing
    this.scene.add(this.nebula);

    // Components
    this.player = new Player(this.scene);
    this.environment = new Environment(this.scene);
    this.input = new InputManager();

    window.addEventListener('resize', () => this.onWindowResize(), false);

    this.tick = this.tick.bind(this);
    this.cameraMode = 3; // 1: Nose Cam (1st), 2: Close Chase, 3: Far Chase
    
    // Bind Camera Button
    const camBtn = document.getElementById('btn-camera');
    if (camBtn) {
        const handleCamToggle = (e) => {
          if (e) e.preventDefault();
          this.toggleCamera();
        };
        camBtn.addEventListener('click', handleCamToggle);
        camBtn.addEventListener('touchstart', handleCamToggle);
    }

    // Bind Keyboard 'C' key
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyC' || e.key.toLowerCase() === 'c') {
            this.toggleCamera();
        }
    });
  }

  toggleCamera() {
    this.cameraMode++;
    if (this.cameraMode > 3) this.cameraMode = 1;
    console.log("Camera toggled to mode:", this.cameraMode);
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.solarEnergy = 100;
    this.difficultyMultiplier = 1.0;
    
    // Reset Lives
    this.lives = 3;
    this.isInvincible = false;
    this.player.mesh.visible = true;
    
    if (this.hearts) {
      this.hearts.forEach(h => {
        if (h) {
          h.style.opacity = '1.0';
          h.style.filter = 'none';
        }
      });
    }
    
    this.player.reset();
    this.environment.reset();
    
    this.clock.start();
    this.lastTime = 0;
    this.renderer.setAnimationLoop((time) => this.tick(time));
  }

  pause() {
    this.isPaused = true;
    this.clock.stop();
  }

  resume() {
    this.isPaused = false;
    this.clock.start();
  }

  stop() {
    this.isRunning = false;
    this.renderer.setAnimationLoop(null);
  }

  tick(time) {
    if (!this.isRunning || this.isPaused) return;
    
    // Ignore the engine's time parameter completely to guarantee no NaN values on weird mobile browsers
    const currentTime = performance.now();

    // Calculate Delta Time safely
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Increase difficulty over time
    this.difficultyMultiplier += dt * 0.005;

    // 1. Update Player
    const hAxis = this.input.getHorizontalAxis();
    const vAxis = this.input.getVerticalAxis(); // Now handles W/S Up/Down
    this.player.update(dt, hAxis, vAxis, this.difficultyMultiplier);

    // 2. Update Camera (Cinematic Follow based on mode)
    let targetCamX = this.player.mesh.position.x;
    let targetCamY = this.player.mesh.position.y;
    let targetCamZ = this.player.mesh.position.z;
    
    if (this.cameraMode === 3) {
      // Far 3rd Person (Default)
      targetCamY += 15; // Drone view (very high)
      targetCamZ += 22; // Pulled back
      this.camera.position.x += (targetCamX - this.camera.position.x) * 5 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 5 * dt;
      this.camera.position.z = targetCamZ;
      
      // Look sharply down ahead. This pushes the ship into the top 30% of the screen.
      const lookTarget = new THREE.Vector3(targetCamX * 0.5, -15, targetCamZ - 100);
      this.camera.lookAt(lookTarget);
      
    } else if (this.cameraMode === 2) {
      // Close 3rd Person
      targetCamY += 8;
      targetCamZ += 12;
      this.camera.position.x += (targetCamX - this.camera.position.x) * 10 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 10 * dt;
      this.camera.position.z = targetCamZ;
      
      // Look sharply down
      const lookTarget = new THREE.Vector3(targetCamX, -8, targetCamZ - 50);
      this.camera.lookAt(lookTarget);
      
    } else if (this.cameraMode === 1) {
      // 1st Person (Nose Cam)
      targetCamY += 0.2; // Slightly above center
      targetCamZ -= 1.5; // In front of the ship to avoid seeing the inside mesh
      
      // Hard lock to ship position
      this.camera.position.set(targetCamX, targetCamY, targetCamZ);
      
      // Inherit the ship's rotation so you feel every bank and pitch!
      this.camera.rotation.copy(this.player.mesh.rotation);
      // Because we copied rotation, the camera looks forward down -Z automatically!
    }

    // Camera Shake on Hit (First 0.5 seconds of invincibility)
    if (this.isInvincible && this.invincibleTimer > 1.5) {
      const shakeIntensity = (this.invincibleTimer - 1.5) * 4.0; // Scales from 2.0 down to 0.0
      this.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
    }

    // Update Sun shadow camera to follow player so shadows always render
    this.dirLight.position.z = this.player.mesh.position.z - 500;
    this.dirLight.target.position.set(0, 0, this.player.mesh.position.z);
    this.dirLight.target.updateMatrixWorld();

    // 3b. Infinite Space (Bidirectional Wrap Background Particles)
    const starPos = this.starfield.geometry.attributes.position.array;
    let starsNeedUpdate = false;
    for(let i=0; i<3000; i++) {
        // If a star falls behind the camera, wrap it far ahead
        if(starPos[i*3+2] > this.camera.position.z + 500) {
            starPos[i*3+2] -= 2000;
            starsNeedUpdate = true;
        } 
        // If the camera resets to 0 (game over), pull stars back
        else if (starPos[i*3+2] < this.camera.position.z - 1500) {
            starPos[i*3+2] += 2000;
            starsNeedUpdate = true;
        }
    }
    if(starsNeedUpdate) this.starfield.geometry.attributes.position.needsUpdate = true;

    const dustPos = this.nebula.geometry.attributes.position.array;
    let dustNeedUpdate = false;
    for(let i=0; i<500; i++) {
        if(dustPos[i*3+2] > this.camera.position.z + 500) {
            dustPos[i*3+2] -= 2000;
            dustNeedUpdate = true;
        }
        else if (dustPos[i*3+2] < this.camera.position.z - 1500) {
            dustPos[i*3+2] += 2000;
            dustNeedUpdate = true;
        }
    }
    if(dustNeedUpdate) this.nebula.geometry.attributes.position.needsUpdate = true;

    // 4. Update Environment
    this.environment.update(dt, this.player.mesh.position.z, this.difficultyMultiplier);
    // 5. Update Invincibility
    if (this.isInvincible) {
      this.invincibleTimer -= dt;
      // Blink the ship rapidly (every 0.1s)
      this.player.mesh.visible = Math.floor(time / 100) % 2 === 0;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.player.mesh.visible = true; // Ensure it's visible when invincibility ends
      }
    }
    // 5c. Update Explosions
    if (this.explosions) {
      for (let i = this.explosions.length - 1; i >= 0; i--) {
        const exp = this.explosions[i];
        exp.life -= dt;
        
        if (exp.life <= 0) {
          this.scene.remove(exp.mesh);
          exp.mesh.geometry.dispose();
          exp.mesh.material.dispose();
          this.explosions.splice(i, 1);
          continue;
        }
        
        // Update particle positions based on velocity
        const positions = exp.mesh.geometry.attributes.position.array;
        for (let j = 0; j < exp.velocities.length; j++) {
          positions[j * 3] += exp.velocities[j].x * dt;
          positions[j * 3 + 1] += exp.velocities[j].y * dt;
          positions[j * 3 + 2] += exp.velocities[j].z * dt;
          
          // Add some drag to slow particles down smoothly
          exp.velocities[j].x *= 0.95;
          exp.velocities[j].y *= 0.95;
          exp.velocities[j].z *= 0.95;
        }
        exp.mesh.geometry.attributes.position.needsUpdate = true;
        
        // Fade out
        exp.mesh.material.opacity = exp.life;
      }
    }

    // 5d. Check Meteor Collisions
    if (this.environment.checkCollisions(this.player.boundingBox)) {
      if (!this.isInvincible) {
        this.lives--;
        
        // Trigger Massive Explosion
        this.createExplosion(this.player.mesh.position);
        
        // Update Heart UI
        if (this.hearts && this.hearts[this.lives]) {
          this.hearts[this.lives].style.opacity = '0.2'; // Gray out the lost heart
          this.hearts[this.lives].style.filter = 'grayscale(100%)';
        }
        
        if (this.lives <= 0) {
          this.triggerGameOver();
          return;
        } else {
          // Take damage, become invincible briefly
          this.isInvincible = true;
          this.invincibleTimer = 2.0; // 2 seconds of I-frames
        }
      }
    }

    // 5b. Check Coin Collisions
    const coinsCollected = this.environment.checkCoinCollisions(this.player.boundingBox);
    if (coinsCollected > 0) {
      this.solarEnergy = Math.min(100, this.solarEnergy + (coinsCollected * 15)); // Restore 15% per coin
      this.score += coinsCollected * 500; // Bonus score
    }

    // 6. Update Score and Energy
    // Score increases faster as difficulty goes up
    this.score += (dt * 100) * this.difficultyMultiplier;
    
    // Energy drains FASTER as difficulty goes up
    this.solarEnergy -= (dt * 3.5) * this.difficultyMultiplier; 
    
    if (this.solarEnergy <= 0) {
      this.solarEnergy = 0;
      this.triggerGameOver(); // Out of fuel
      return;
    }

    this.updateUI();

    // 7. Render
    this.composer.render();
  }

  updateUI() {
    this.scoreText.innerText = Math.floor(this.score).toString();
    this.solarFill.style.width = `${this.solarEnergy}%`;
    
    // UI color reflects danger
    if (this.solarEnergy < 20) {
      this.solarFill.style.background = 'linear-gradient(90deg, #ff0000, #ff5500)';
    } else {
      this.solarFill.style.background = 'linear-gradient(90deg, #00ffff, #0088ff)'; // Space theme
    }
  }

  triggerGameOver() {
    this.stop();
    // Fire one last explosion when you die completely!
    this.createExplosion(this.player.mesh.position);
    
    // Force one final render frame so the explosion actually draws on the screen!
    this.composer.render();
    
    window.dispatchEvent(new CustomEvent('gameover', { detail: { score: Math.floor(this.score) } }));
  }

  createExplosion(position) {
    const particleCount = 150; // Huge burst
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];
    
    const colorPalette = [
      new THREE.Color(0xff2200), // Red
      new THREE.Color(0xff8800), // Orange
      new THREE.Color(0xffff00)  // Yellow
    ];

    for (let i = 0; i < particleCount; i++) {
      // Start exactly at the player's ship
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      
      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const speed = 30 + Math.random() * 50; // Extremely fast initial burst
      
      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed
      });
      
      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Using a simple square point since it's an explosion spark, 
    // additive blending will make it look like a glowing beam of light
    const material = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    
    if (!this.explosions) this.explosions = [];
    this.explosions.push({
      mesh: points,
      velocities: velocities,
      life: 1.2 // 1.2 seconds before disappearing
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}
