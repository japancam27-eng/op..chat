import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AvatarCharacter } from './AvatarCharacter';
import { AvatarConfig, AvatarExpression } from '../types/chat';

export class CompanionScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private avatar: AvatarCharacter | null = null;
  private animFrameId: number = 0;
  private isDestroyed: boolean = false;
  private clock: THREE.Clock;
  private isSoftwareGl: boolean = false;

  // Interaction tracking
  private isDragging: boolean = false;
  private prevPointerX: number = 0;
  private avatarRotationY: number = 0;
  private targetRotationY: number = 0;
  private pointerNorm = new THREE.Vector2(0, 0);

  constructor(container: HTMLDivElement, initialConfig: AvatarConfig) {
    this.container = container;
    this.clock = new THREE.Clock();

    // Check Software WebGL guard
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 360;
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.camera.position.set(0, 1.45, 3.2);
    this.camera.lookAt(0, 1.35, 0);

    // 3. Environment Reflection (Mandatory Studio Environment per Three.js guidelines)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x25d366, 1.2); // WhatsApp green rim glow
    rimLight.position.set(-3, 2, -2);
    this.scene.add(rimLight);

    const fillLight = new THREE.HemisphereLight(0xe8f5e9, 0x111b21, 0.8);
    this.scene.add(fillLight);

    // 5. Build Procedural Avatar
    this.avatar = new AvatarCharacter(initialConfig);
    this.scene.add(this.avatar.group);

    // 6. Event Listeners
    this.setupInteractions();

    // 7. Start Render Loop
    this.startLoop();
  }

  private setupInteractions() {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevPointerX = e.clientX;
    });

    window.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        this.pointerNorm.set(nx, ny);
        if (this.avatar) {
          this.avatar.setTargetLookAt(nx, ny);
        }
      }

      if (this.isDragging) {
        const deltaX = e.clientX - this.prevPointerX;
        this.prevPointerX = e.clientX;
        this.targetRotationY += deltaX * 0.012;
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    el.addEventListener('click', () => {
      // Trigger wave when user clicks directly on avatar
      this.setExpression('waving');
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.setExpression('idle');
        }
      }, 2600);
    });
  }

  public updateConfig(config: Partial<AvatarConfig>) {
    if (this.avatar) {
      this.avatar.updateConfig(config);
    }
  }

  public setExpression(expression: AvatarExpression) {
    if (this.avatar) {
      this.avatar.setExpression(expression);
    }
  }

  public resize(width: number, height: number) {
    if (this.isDestroyed || width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;

      const delta = Math.min(this.clock.getDelta(), 0.1);

      // Smooth avatar rotation damping
      this.avatarRotationY = THREE.MathUtils.damp(this.avatarRotationY, this.targetRotationY, 8, delta);
      if (this.avatar) {
        this.avatar.group.rotation.y = this.avatarRotationY;
        this.avatar.update(delta);
      }

      this.renderer.render(this.scene, this.camera);

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);

    if (this.avatar) {
      this.scene.remove(this.avatar.group);
      this.avatar.dispose();
      this.avatar = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
