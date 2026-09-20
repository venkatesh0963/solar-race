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

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Low ambient for space
    this.scene.add(this.ambientLight);
    
    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.0); // Bright star light
    this.dirLight.position.set(200, 300, -500); 
    this.dirLight.castShadow = true;
    this.dirLight.shadow.camera.top = 200;
    this.dirLight.shadow.camera.bottom = -200;
    this.dirLight.shadow.camera.left = -200;
    this.dirLight.shadow.camera.right = 200;
    this.dirLight.shadow.camera.near = 0.1;
    this.dirLight.shadow.camera.far = 1000;
    this.scene.add(this.dirLight);

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
      size: 1.5,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    this.starfield = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starfield);

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

    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

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
      targetCamY += 5;
      targetCamZ += 12;
      this.camera.position.x += (targetCamX - this.camera.position.x) * 5 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 5 * dt;
      this.camera.position.z = targetCamZ;
      
      const lookTarget = new THREE.Vector3(targetCamX * 0.5, targetCamY * 0.5, targetCamZ - 100);
      this.camera.lookAt(lookTarget);
      
    } else if (this.cameraMode === 2) {
      // Close 3rd Person
      targetCamY += 2.5;
      targetCamZ += 6;
      this.camera.position.x += (targetCamX - this.camera.position.x) * 10 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 10 * dt;
      this.camera.position.z = targetCamZ;
      
      const lookTarget = new THREE.Vector3(targetCamX, targetCamY, targetCamZ - 50);
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

    // Update Sun shadow camera to follow player so shadows always render
    this.dirLight.position.z = this.player.mesh.position.z - 500;
    this.dirLight.target.position.set(0, 0, this.player.mesh.position.z);
    this.dirLight.target.updateMatrixWorld();

    // 4. Update Environment (pass dt and difficulty)
    this.environment.update(dt, this.player.mesh.position.z, this.difficultyMultiplier);

    // 5. Check Collisions
    if (this.environment.checkCollisions(this.player.boundingBox)) {
      this.triggerGameOver();
      return;
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
    window.dispatchEvent(new CustomEvent('gameover', { detail: { score: Math.floor(this.score) } }));
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}
