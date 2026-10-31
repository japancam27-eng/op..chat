import * as THREE from 'three';

export class HoloGlobeScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animId: number | null = null;
  private clock: THREE.Clock;

  private globeGroup: THREE.Group;
  private ringsGroup: THREE.Group;
  private particles: THREE.Points;
  private badgesGroup: THREE.Group;

  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private targetRotation = { x: 0.2, y: 0 };
  private currentRotation = { x: 0.2, y: 0 };

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00ffcc, 2.5, 20);
    cyanLight.position.set(5, 5, 5);
    this.scene.add(cyanLight);

    const greenLight = new THREE.PointLight(0x00d293, 2.5, 20);
    greenLight.position.set(-5, -3, 3);
    this.scene.add(greenLight);

    // Groups
    this.globeGroup = new THREE.Group();
    this.ringsGroup = new THREE.Group();
    this.badgesGroup = new THREE.Group();
    this.scene.add(this.globeGroup);
    this.scene.add(this.ringsGroup);
    this.scene.add(this.badgesGroup);

    // 1. Central Holographic Sphere
    this.createHoloSphere();

    // 2. Orbital Glowing Rings
    this.createOrbitalRings();

    // 3. Constellation Particles
    this.particles = this.createParticleCloud();
    this.scene.add(this.particles);

    // 4. Floating 3D Message Badges
    this.createFloatingBadges();

    // Interaction Listeners
    this.setupInteractions();

    // Animation Loop
    this.animate();
  }

  private createHoloSphere() {
    const radius = 2.0;

    // Inner translucent glass glow sphere
    const innerGeo = new THREE.SphereGeometry(radius * 0.98, 36, 36);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x073b30,
      transmission: 0.85,
      opacity: 0.7,
      transparent: true,
      roughness: 0.2,
      ior: 1.3,
      emissive: 0x032820,
      emissiveIntensity: 0.4,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    this.globeGroup.add(innerMesh);

    // Outer Wireframe Grid Sphere
    const wireGeo = new THREE.SphereGeometry(radius, 28, 20);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    this.globeGroup.add(wireMesh);

    // Latitude & Longitude glow lines
    for (let i = -3; i <= 3; i++) {
      const latRadius = Math.sqrt(radius * radius - (i * 0.5) * (i * 0.5));
      if (latRadius > 0.2) {
        const ringGeo = new THREE.RingGeometry(latRadius - 0.015, latRadius + 0.015, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x00d293,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
        });
        const latRing = new THREE.Mesh(ringGeo, ringMat);
        latRing.rotation.x = Math.PI / 2;
        latRing.position.y = i * 0.5;
        this.globeGroup.add(latRing);
      }
    }
  }

  private createOrbitalRings() {
    const ringConfigs = [
      { radius: 3.2, rotX: 1.1, rotY: 0.4, color: 0x00ffcc, width: 0.035, opacity: 0.7 },
      { radius: 3.5, rotX: -0.8, rotY: 0.9, color: 0x00d293, width: 0.025, opacity: 0.6 },
      { radius: 2.8, rotX: 0.5, rotY: -1.2, color: 0x38ef7d, width: 0.03, opacity: 0.5 },
    ];

    ringConfigs.forEach((cfg) => {
      const ringGeo = new THREE.RingGeometry(cfg.radius - cfg.width, cfg.radius + cfg.width, 128);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: cfg.opacity,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.set(cfg.rotX, cfg.rotY, 0);
      this.ringsGroup.add(ring);

      // Add a couple glowing orbiting node beads along each ring
      for (let j = 0; j < 3; j++) {
        const angle = (j / 3) * Math.PI * 2;
        const beadGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const bead = new THREE.Mesh(beadGeo, beadMat);
        bead.position.set(Math.cos(angle) * cfg.radius, Math.sin(angle) * cfg.radius, 0);
        ring.add(bead);
      }
    });
  }

  private createParticleCloud(): THREE.Points {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0x00ffcc);
    const c2 = new THREE.Color(0x00d293);
    const c3 = new THREE.Color(0x25d366);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 2.2;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const mixed = Math.random() < 0.4 ? c1 : Math.random() < 0.7 ? c2 : c3;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    return new THREE.Points(geometry, material);
  }

  // Generate canvas-drawn 3D floating texture sprites for message bubbles
  private createFloatingBadges() {
    const badgeConfigs = [
      {
        text: 'Encrypted message received ✨',
        sub: 'Sophia: Let’s meet in 3D Lounge!',
        bgColor: '#00a884',
        accentColor: '#25d366',
        pos: new THREE.Vector3(1.7, 0.9, 1.4),
        scale: 1.5,
      },
      {
        text: 'Alex Rivera',
        sub: 'Ready for 3D spatial call? 🚀',
        bgColor: '#0f3830',
        accentColor: '#00ffcc',
        pos: new THREE.Vector3(-1.8, -0.6, 1.2),
        scale: 1.4,
      },
      {
        text: 'OP Haider AI',
        sub: 'Smart Assistant online 🤖',
        bgColor: '#052e25',
        accentColor: '#38ef7d',
        pos: new THREE.Vector3(1.2, -1.5, 1.3),
        scale: 1.3,
      },
      {
        icon: 'phone',
        pos: new THREE.Vector3(2.4, -0.3, 0.8),
        scale: 0.8,
      },
    ];

    badgeConfigs.forEach((cfg) => {
      const canvas = document.createElement('canvas');
      canvas.width = cfg.icon === 'phone' ? 128 : 380;
      canvas.height = cfg.icon === 'phone' ? 128 : 130;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (cfg.icon === 'phone') {
          // Circular glowing cyan call button
          ctx.beginPath();
          ctx.arc(64, 64, 56, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(64, 64, 46, 0, Math.PI * 2);
          ctx.fillStyle = '#00ffcc';
          ctx.fill();

          ctx.font = '36px sans-serif';
          ctx.fillStyle = '#07241e';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('📞', 64, 64);
        } else {
          // Rounded rectangular glassmorphic card
          ctx.beginPath();
          ctx.roundRect(10, 10, 360, 110, 20);
          ctx.fillStyle = cfg.bgColor || 'rgba(5, 46, 37, 0.85)';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = cfg.accentColor || '#00ffcc';
          ctx.stroke();

          // Avatar circle
          ctx.beginPath();
          ctx.arc(52, 65, 26, 0, Math.PI * 2);
          ctx.fillStyle = cfg.accentColor || '#00ffcc';
          ctx.fill();

          ctx.font = '24px sans-serif';
          ctx.fillStyle = '#041d18';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👤', 52, 65);

          // Header Text
          ctx.textAlign = 'left';
          ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(cfg.text || '', 92, 52);

          // Subtext
          ctx.font = '16px Plus Jakarta Sans, sans-serif';
          ctx.fillStyle = '#a7f3d0';
          ctx.fillText(cfg.sub || '', 92, 84);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(cfg.pos);
      sprite.scale.set(cfg.scale, (cfg.scale * canvas.height) / canvas.width, 1);
      (sprite as any).userData = { originalY: cfg.pos.y, seed: Math.random() * 5 };
      this.badgesGroup.add(sprite);
    });
  }

  private setupInteractions() {
    const dom = this.renderer.domElement;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      this.isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      this.previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - this.previousMousePosition.x;
      const deltaY = clientY - this.previousMousePosition.y;

      this.targetRotation.y += deltaX * 0.006;
      this.targetRotation.x += deltaY * 0.006;

      this.previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  public resize(width: number, height: number) {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Smooth rotation damping
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;

    // Automatic slow rotation if not dragging
    if (!this.isDragging) {
      this.targetRotation.y += delta * 0.25;
    }

    this.globeGroup.rotation.y = this.currentRotation.y;
    this.globeGroup.rotation.x = this.currentRotation.x;

    // Rotate rings independently
    this.ringsGroup.children.forEach((ring, idx) => {
      ring.rotation.z += delta * (0.15 + idx * 0.08);
    });

    // Rotate particle cloud gently
    if (this.particles) {
      this.particles.rotation.y += delta * 0.05;
    }

    // Floating bobbing motion on message badges
    this.badgesGroup.children.forEach((child) => {
      const sprite = child as THREE.Sprite;
      const seed = sprite.userData?.seed || 0;
      const origY = sprite.userData?.originalY || 0;
      sprite.position.y = origY + Math.sin(elapsed * 1.6 + seed) * 0.12;
    });

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
    }
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
