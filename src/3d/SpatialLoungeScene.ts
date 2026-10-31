import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AvatarCharacter } from './AvatarCharacter';
import { Contact, Message } from '../types/chat';

export interface SpatialLoungeOptions {
  contacts: Contact[];
  userConfig: Contact['avatarConfig'];
  onSelectContact?: (contact: Contact) => void;
}

export class SpatialLoungeScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private animFrameId: number = 0;
  private isDestroyed: boolean = false;
  private clock: THREE.Clock;
  private isSoftwareGl: boolean = false;

  private avatarMap: Map<string, { avatar: AvatarCharacter; contact: Contact; labelMesh: THREE.Sprite; bubbleMesh?: THREE.Sprite }> = new Map();
  private userAvatar: AvatarCharacter | null = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  constructor(container: HTMLDivElement, options: SpatialLoungeOptions) {
    this.container = container;
    this.clock = new THREE.Clock();

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b141a);
    this.scene.fog = new THREE.FogExp2(0x0b141a, 0.05);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 3.8, 6.5);

    // 3. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't clip through floor
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 14;
    this.controls.target.set(0, 1.2, 0);

    // 4. Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambLight);

    const mainLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    mainLight.position.set(4, 7, 5);
    mainLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.bias = -0.0005;
    }
    this.scene.add(mainLight);

    const greenPointLight = new THREE.PointLight(0x25d366, 2.5, 8);
    greenPointLight.position.set(0, 0.8, 0);
    this.scene.add(greenPointLight);

    // 6. Build the Lounge Room Environment
    this.buildLoungeArchitecture();

    // 7. Place Avatars around the circle
    this.buildLoungeAvatars(options);

    // 8. Interaction Setup (Raycasting)
    this.setupLoungeInteractions(options.onSelectContact);

    // 9. Loop
    this.startLoop();
  }

  private buildLoungeArchitecture() {
    // Sleek Reflective Floor
    const floorGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.2, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111b21,
      roughness: 0.2,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // WhatsApp Glowing Ring
    const ringGeo = new THREE.TorusGeometry(3.6, 0.05, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x25d366,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    this.scene.add(ring);

    // Outer boundary soft glass railing
    const railGeo = new THREE.CylinderGeometry(5.4, 5.4, 0.6, 48, 1, true);
    const railMat = new THREE.MeshPhysicalMaterial({
      color: 0x00a884,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      metalness: 0.6,
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.y = 0.3;
    this.scene.add(rail);

    // Center Hologram Table
    const tableGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.5, 32);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x202c33,
      roughness: 0.3,
      metalness: 0.7,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.25;
    this.scene.add(table);

    // Hologram Crystal Emitter
    const emitterGeo = new THREE.OctahedronGeometry(0.25, 0);
    const emitterMat = new THREE.MeshStandardMaterial({
      color: 0x25d366,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x25d366,
      emissiveIntensity: 0.8,
    });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.set(0, 0.75, 0);
    this.scene.add(emitter);
  }

  private createTextSprite(text: string, bgColor: string = '#202c33', textColor: string = '#ffffff'): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Rounded rectangle background
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(4, 4, 248, 56, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#25d366';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Text
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
  }

  private buildLoungeAvatars(options: SpatialLoungeOptions) {
    const individualContacts = options.contacts.filter((c) => !c.isGroup);
    const total = individualContacts.length + 1; // contacts + current user
    const radius = 2.6;

    // Place user at angle 0
    this.userAvatar = new AvatarCharacter(options.userConfig);
    this.userAvatar.group.position.set(0, 0, radius);
    this.userAvatar.group.rotation.y = Math.PI; // Face center
    this.scene.add(this.userAvatar.group);

    const userLabel = this.createTextSprite('You (Active)', '#005c4b', '#ffffff');
    userLabel.position.set(0, 2.3, radius);
    this.scene.add(userLabel);

    // Place contacts around the circle
    individualContacts.forEach((contact, idx) => {
      const angle = ((idx + 1) / total) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const avatar = new AvatarCharacter(contact.avatarConfig);
      avatar.group.position.set(x, 0, z);
      avatar.group.lookAt(0, 0, 0); // Look at table center
      this.scene.add(avatar.group);

      const label = this.createTextSprite(contact.name, '#111b21', '#e9edef');
      label.position.set(x, 2.3, z);
      this.scene.add(label);

      this.avatarMap.set(contact.id, {
        avatar,
        contact,
        labelMesh: label,
      });
    });
  }

  public showMessageBubble(contactId: string, text: string) {
    const item = this.avatarMap.get(contactId);
    if (!item) return;

    if (item.bubbleMesh) {
      this.scene.remove(item.bubbleMesh);
      item.bubbleMesh.material.dispose();
      item.bubbleMesh = undefined;
    }

    // Create speech bubble sprite
    const bubble = this.createTextSprite(text.length > 25 ? text.slice(0, 25) + '...' : text, '#005c4b', '#ffffff');
    bubble.position.copy(item.labelMesh.position);
    bubble.position.y += 0.45;
    this.scene.add(bubble);
    item.bubbleMesh = bubble;

    // Trigger talking animation
    item.avatar.setExpression('talking');

    // Auto remove after 4.5 seconds
    setTimeout(() => {
      if (!this.isDestroyed && item.bubbleMesh === bubble) {
        this.scene.remove(bubble);
        bubble.material.dispose();
        item.bubbleMesh = undefined;
        item.avatar.setExpression('idle');
      }
    }, 4500);
  }

  public triggerEmote(contactId: string, expression: Contact['avatarConfig']['expression']) {
    const item = this.avatarMap.get(contactId);
    if (item) {
      item.avatar.setExpression(expression);
      setTimeout(() => {
        if (!this.isDestroyed) {
          item.avatar.setExpression('idle');
        }
      }, 3500);
    }
  }

  private setupLoungeInteractions(onSelect?: (contact: Contact) => void) {
    const el = this.renderer.domElement;

    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      this.raycaster.setFromCamera(this.pointer, this.camera);

      // Check hits against avatar roots
      for (const [, item] of this.avatarMap.entries()) {
        const intersects = this.raycaster.intersectObject(item.avatar.group, true);
        if (intersects.length > 0) {
          item.avatar.setExpression('waving');
          onSelect?.(item.contact);
          break;
        }
      }
    });
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

      this.controls.update();

      if (this.userAvatar) {
        this.userAvatar.update(delta);
      }

      for (const [, item] of this.avatarMap.entries()) {
        item.avatar.update(delta);
      }

      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);

    this.controls.dispose();

    if (this.userAvatar) {
      this.scene.remove(this.userAvatar.group);
      this.userAvatar.dispose();
      this.userAvatar = null;
    }

    for (const [, item] of this.avatarMap.entries()) {
      this.scene.remove(item.avatar.group);
      item.avatar.dispose();
      if (item.labelMesh) this.scene.remove(item.labelMesh);
      if (item.bubbleMesh) this.scene.remove(item.bubbleMesh);
    }
    this.avatarMap.clear();

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
