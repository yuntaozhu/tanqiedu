/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement, css, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {Analyser} from './analyser';

import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * 3D visual character "Xiao Yi" with external model support.
 */
@customElement('gdm-live-audio-visuals-3d')
export class GdmLiveAudioVisuals3D extends LitElement {
  private inputAnalyser!: Analyser;
  private outputAnalyser!: Analyser;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  
  private characterGroup!: THREE.Group;
  private head!: THREE.Mesh;
  private body!: THREE.Mesh;
  private leftEye!: THREE.Mesh;
  private rightEye!: THREE.Mesh;
  private leftBlush!: THREE.Mesh;
  private rightBlush!: THREE.Mesh;

  private clouds: THREE.Group[] = [];
  private bubbles: THREE.Mesh[] = [];

  private prevTime = 0;

  private _outputNode!: AudioNode;
  @property()
  set outputNode(node: AudioNode) {
    this._outputNode = node;
    if (node && node.context.state !== 'closed') {
      this.outputAnalyser = new Analyser(this._outputNode);
    }
  }
  get outputNode() {
    return this._outputNode;
  }

  private _inputNode!: AudioNode;
  @property()
  set inputNode(node: AudioNode) {
    this._inputNode = node;
    if (node && node.context.state !== 'closed') {
      this.inputAnalyser = new Analyser(this._inputNode);
    }
  }
  get inputNode() {
    return this._inputNode;
  }

  @query('canvas')
  private canvas!: HTMLCanvasElement;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }
  `;

  private async init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFF8E1); 
    this.scene.fog = new THREE.Fog(0xFFF8E1, 5, 25);

    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    // Initial position will be set by onWindowResize called below

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    
    const rect = (this as unknown as HTMLElement).getBoundingClientRect();
    this.renderer.setSize(Math.max(1, rect.width || 1), Math.max(1, rect.height || 1));
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.setupEnvironment();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    this.scene.add(mainLight);

    this.characterGroup = new THREE.Group();
    this.scene.add(this.characterGroup);

    this.buildProceduralCharacter();
    this.createClouds();
    this.createBubbles();

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(10, 32),
      new THREE.ShadowMaterial({ opacity: 0.1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3, 0.4, 0.9
    );
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);

    window.addEventListener('resize', () => this.onWindowResize());
    
    // Set initial size and camera position
    this.onWindowResize();
    
    this.animation();
  }

  private setupEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const renderTarget = pmremGenerator.fromScene(new THREE.Scene()); 
    this.scene.environment = renderTarget.texture;
  }

  private buildProceduralCharacter() {
    const matSkin = new THREE.MeshStandardMaterial({ color: 0xFFE0B2, roughness: 0.2 });
    const matBody = new THREE.MeshStandardMaterial({ color: 0xFF7043, roughness: 0.4 });
    const matEye = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.1 });
    const matBlush = new THREE.MeshStandardMaterial({ color: 0xff8a80, transparent: true, opacity: 0.5 });

    this.body = new THREE.Mesh(new THREE.CapsuleGeometry(0.85, 1, 4, 16), matBody);
    this.body.position.y = -0.4;
    this.body.castShadow = true;
    this.characterGroup.add(this.body);

    this.head = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32), matSkin);
    this.head.position.y = 1.0;
    this.head.castShadow = true;
    this.characterGroup.add(this.head);

    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    this.leftEye = new THREE.Mesh(eyeGeo, matEye);
    this.leftEye.position.set(-0.4, 1.1, 1.0);
    this.characterGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, matEye);
    this.rightEye.position.set(0.4, 1.1, 1.0);
    this.characterGroup.add(this.rightEye);

    const blushGeo = new THREE.SphereGeometry(0.2, 16, 16);
    this.leftBlush = new THREE.Mesh(blushGeo, matBlush);
    this.leftBlush.position.set(-0.6, 0.7, 0.9);
    this.leftBlush.scale.set(1, 0.6, 0.3);
    this.characterGroup.add(this.leftBlush);

    this.rightBlush = new THREE.Mesh(blushGeo, matBlush.clone());
    this.rightBlush.position.set(0.6, 0.7, 0.9);
    this.rightBlush.scale.set(1, 0.6, 0.3);
    this.characterGroup.add(this.rightBlush);
  }

  private createClouds() {
    const cloudGeo = new THREE.SphereGeometry(1, 12, 12);
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group();
      const p = new THREE.Mesh(cloudGeo, cloudMat);
      g.add(p);
      g.position.set((Math.random()-0.5)*20, 2 + Math.random()*4, -10 - Math.random()*5);
      g.userData = { speed: 0.005 + Math.random()*0.01 };
      this.scene.add(g);
      this.clouds.push(g);
    }
  }

  private createBubbles() {
    const bubbleGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transmission: 0.9, thickness: 0.5, ior: 1.5, transparent: true, opacity: 0.3
    });
    for (let i = 0; i < 15; i++) {
      const b = new THREE.Mesh(bubbleGeo, bubbleMat.clone());
      const x = (Math.random() - 0.5) * 12;
      b.position.set(x, -5 + Math.random() * 10, (Math.random()-0.5)*6);
      b.userData = { speed: 0.4 + Math.random() * 0.6, wobble: Math.random() * 2, xBase: x };
      this.scene.add(b);
      this.bubbles.push(b);
    }
  }

  private animation() {
    requestAnimationFrame(() => this.animation());
    if (this.inputAnalyser) this.inputAnalyser.update();
    if (this.outputAnalyser) this.outputAnalyser.update();

    const t = performance.now() * 0.001;
    const dt = t - this.prevTime;
    this.prevTime = t;

    const outVol = this.outputAnalyser ? this.outputAnalyser.data[2] / 255 : 0;
    const inVol = this.inputAnalyser ? this.inputAnalyser.data[2] / 255 : 0;

    // Character floating and squash/stretch
    const bounce = Math.sin(t * 1.2);
    this.characterGroup.position.y = bounce * 0.15;
    
    // Squash and stretch based on bounce velocity
    const squash = 1 - Math.abs(Math.cos(t * 1.2)) * 0.05;
    const stretch = 1 + Math.abs(Math.cos(t * 1.2)) * 0.05;
    this.body.scale.set(stretch, squash, stretch);

    // Head movement
    this.head.rotation.y = Math.sin(t * 0.5) * 0.1;
    this.head.rotation.z = Math.sin(t * 0.3) * 0.05;
    
    const headS = 1 + outVol * 0.15;
    this.head.scale.setScalar(THREE.MathUtils.lerp(this.head.scale.x, headS, 0.15));

    // Blinking logic
    const blink = Math.sin(t * 10) > 0.98 ? 0.1 : 1;
    this.leftEye.scale.y = THREE.MathUtils.lerp(this.leftEye.scale.y, blink, 0.4);
    this.rightEye.scale.y = THREE.MathUtils.lerp(this.rightEye.scale.y, blink, 0.4);

    // Blush glow based on volume
    const blushIntensity = 0.3 + outVol * 0.7 + inVol * 0.3;
    (this.leftBlush.material as THREE.MeshStandardMaterial).opacity = blushIntensity;
    (this.rightBlush.material as THREE.MeshStandardMaterial).opacity = blushIntensity;
    this.leftBlush.scale.setScalar(0.8 + blushIntensity * 0.4);
    this.rightBlush.scale.setScalar(0.8 + blushIntensity * 0.4);
    this.leftBlush.scale.z = 0.3; // Keep it flat
    this.rightBlush.scale.z = 0.3;

    this.clouds.forEach(c => {
      c.position.x += c.userData.speed;
      if(c.position.x > 15) c.position.x = -15;
    });

    this.bubbles.forEach(b => {
      b.position.y += b.userData.speed * dt;
      if(b.position.y > 8) b.position.y = -5;
    });

    if (this.composer) this.composer.render();
  }

  private onWindowResize() {
    const rect = (this as unknown as HTMLElement).getBoundingClientRect();
    const w = Math.max(1, rect.width || 1);
    const h = Math.max(1, rect.height || 1);
    if (!this.camera || !this.renderer || !this.composer) return;
    
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    
    // Adjust camera distance based on aspect ratio (Portrait vs Landscape)
    if (w < h) {
      // Portrait mode: Move camera back so the character fits in width
      this.camera.position.set(0, 1.5, 14);
    } else {
      // Landscape mode: Default position
      this.camera.position.set(0, 1.5, 9);
    }
  }

  protected firstUpdated() {
    if (this.canvas) {
      this.init();
    }
  }

  protected render() {
    return html`<canvas></canvas>`;
  }
}
