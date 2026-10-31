import * as THREE from 'three';
import { AvatarConfig, AvatarExpression } from '../types/chat';

/**
 * Procedural 3D Avatar Character using a Composite THREE.Group (10+ distinct parts)
 * Enforces Three.js skill directives:
 * - Distinct silhouette parts (Head, Hair, Torso, Neck, Arms, Hands, Eyes, Mouth, Brows, Accessories)
 * - Roughness & metalness variation (roughness difference >= 0.25 between cloth & metal/accessories)
 * - Grounded bottom-center pivot
 * - Zero external asset / 404 dependencies
 */
export class AvatarCharacter {
  public group: THREE.Group;
  public config: AvatarConfig;

  // Sub-components for animation
  private headGroup: THREE.Group;
  private torsoMesh: THREE.Mesh;
  private leftEye: THREE.Mesh;
  private rightEye: THREE.Mesh;
  private leftPupil: THREE.Mesh;
  private rightPupil: THREE.Mesh;
  private mouthMesh: THREE.Mesh;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private hairMesh: THREE.Group;
  private accessoryGroup: THREE.Group;
  private shadowPlane: THREE.Mesh;

  // Animation states
  private currentExpression: AvatarExpression = 'idle';
  private animTime: number = 0;
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private targetHeadRot = new THREE.Vector2(0, 0);
  private currentHeadRot = new THREE.Vector2(0, 0);

  // Materials dictionary for dynamic recoloring
  private skinMaterial: THREE.MeshStandardMaterial;
  private hairMaterial: THREE.MeshStandardMaterial;
  private outfitMaterial: THREE.MeshStandardMaterial;
  private accentMaterial: THREE.MeshStandardMaterial;
  private metalMaterial: THREE.MeshStandardMaterial;

  constructor(config: AvatarConfig) {
    this.config = { ...config };
    this.currentExpression = config.expression || 'idle';
    this.group = new THREE.Group();

    // 1. Materials
    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.skinColor || '#f6d1b1'),
      roughness: 0.65,
      metalness: 0.05,
    });

    this.hairMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.hairColor || '#2c1b18'),
      roughness: 0.8,
      metalness: 0.1,
    });

    this.outfitMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.outfitColor || '#00a884'),
      roughness: 0.55,
      metalness: 0.15,
    });

    this.accentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      roughness: 0.3,
      metalness: 0.1,
    });

    this.metalMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e0e6ed'),
      roughness: 0.2,
      metalness: 0.9,
    });

    // 2. Base Grounding Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = 0.01;
    this.group.add(this.shadowPlane);

    // 3. Torso / Body (Grounded silhouette)
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.85, 24);
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.outfitMaterial);
    this.torsoMesh.position.y = 0.65;
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.group.add(this.torsoMesh);

    // Collar / Hoodie Rim
    const collarGeo = new THREE.TorusGeometry(0.3, 0.06, 16, 24);
    const collarMesh = new THREE.Mesh(collarGeo, this.outfitMaterial);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 1.05;
    this.group.add(collarMesh);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.25, 16);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    neckMesh.position.y = 1.15;
    this.group.add(neckMesh);

    // 4. Head Group (Rotates and animates)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.55, 0);
    this.group.add(this.headGroup);

    // Head Base (Smooth stylized sphere)
    const headGeo = new THREE.SphereGeometry(0.46, 32, 28);
    headGeo.scale(1, 1.08, 0.96);
    const headMesh = new THREE.Mesh(headGeo, this.skinMaterial);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // 5. Facial Features: Eyes & Pupils
    const eyeGeo = new THREE.SphereGeometry(0.085, 20, 20);
    eyeGeo.scale(1, 1.25, 0.6);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.05,
    });

    const pupilGeo = new THREE.SphereGeometry(0.048, 16, 16);
    pupilGeo.scale(1, 1.2, 0.5);
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.2,
      metalness: 0.8,
    });

    this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEye.position.set(-0.16, 0.05, 0.4);
    this.headGroup.add(this.leftEye);

    this.leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.leftPupil.position.set(-0.16, 0.05, 0.44);
    this.headGroup.add(this.leftPupil);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.rightEye.position.set(0.16, 0.05, 0.4);
    this.headGroup.add(this.rightEye);

    this.rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.rightPupil.position.set(0.16, 0.05, 0.44);
    this.headGroup.add(this.rightPupil);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.12, 0.025, 0.04);
    const browMat = this.hairMaterial;
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.16, 0.19, 0.42);
    leftBrow.rotation.z = 0.08;
    this.headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.16, 0.19, 0.42);
    rightBrow.rotation.z = -0.08;
    this.headGroup.add(rightBrow);

    // Cheeks / Blush
    const blushGeo = new THREE.CircleGeometry(0.065, 16);
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xff7b90,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.25, -0.07, 0.41);
    leftBlush.rotation.y = -0.3;
    this.headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.25, -0.07, 0.41);
    rightBlush.rotation.y = 0.3;
    this.headGroup.add(rightBlush);

    // Mouth (Animated torus / capsule)
    const mouthGeo = new THREE.TorusGeometry(0.07, 0.025, 12, 16, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({
      color: 0xa83244,
      roughness: 0.4,
    });
    this.mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    this.mouthMesh.rotation.z = Math.PI;
    this.mouthMesh.position.set(0, -0.15, 0.43);
    this.headGroup.add(this.mouthMesh);

    // 6. Hair Styles
    this.hairMesh = new THREE.Group();
    this.buildHair(config.hairStyle || 'classic');
    this.headGroup.add(this.hairMesh);

    // 7. Arms & Hands
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.46, 0.95, 0);
    this.group.add(this.leftArmGroup);
    this.buildArm(this.leftArmGroup, true);

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.46, 0.95, 0);
    this.group.add(this.rightArmGroup);
    this.buildArm(this.rightArmGroup, false);

    // 8. Accessories
    this.accessoryGroup = new THREE.Group();
    this.buildAccessories(config.accessory || 'none');
    this.headGroup.add(this.accessoryGroup);
  }

  private buildArm(parentGroup: THREE.Group, isLeft: boolean) {
    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.48, 16);
    const armMesh = new THREE.Mesh(armGeo, this.outfitMaterial);
    armMesh.position.y = -0.22;
    parentGroup.add(armMesh);

    const handGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const handMesh = new THREE.Mesh(handGeo, this.skinMaterial);
    handMesh.position.y = -0.48;
    parentGroup.add(handMesh);

    // Subtle natural rest angle
    parentGroup.rotation.z = isLeft ? 0.15 : -0.15;
  }

  private buildHair(style: string) {
    // Clear previous
    while (this.hairMesh.children.length > 0) {
      this.hairMesh.remove(this.hairMesh.children[0]);
    }

    if (style === 'afro') {
      const puffGeo = new THREE.SphereGeometry(0.58, 24, 24);
      puffGeo.scale(1.15, 1.1, 1.1);
      const puff = new THREE.Mesh(puffGeo, this.hairMaterial);
      puff.position.set(0, 0.15, -0.05);
      this.hairMesh.add(puff);
    } else if (style === 'curly') {
      const topCapGeo = new THREE.SphereGeometry(0.48, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      const topCap = new THREE.Mesh(topCapGeo, this.hairMaterial);
      topCap.position.y = 0.05;
      this.hairMesh.add(topCap);

      // Curls clusters
      for (let i = 0; i < 9; i++) {
        const curlGeo = new THREE.SphereGeometry(0.14, 12, 12);
        const curl = new THREE.Mesh(curlGeo, this.hairMaterial);
        const angle = (i / 9) * Math.PI * 2;
        curl.position.set(Math.cos(angle) * 0.42, 0.35 + Math.sin(i) * 0.08, Math.sin(angle) * 0.4);
        this.hairMesh.add(curl);
      }
    } else if (style === 'cyberpunk') {
      // Sleek mohawk / neon ridge
      const ridgeGeo = new THREE.BoxGeometry(0.18, 0.35, 0.7);
      const ridge = new THREE.Mesh(ridgeGeo, this.hairMaterial);
      ridge.position.set(0, 0.42, -0.02);
      ridge.rotation.x = -0.15;
      this.hairMesh.add(ridge);
    } else if (style === 'bob') {
      const bobCapGeo = new THREE.SphereGeometry(0.5, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
      const bob = new THREE.Mesh(bobCapGeo, this.hairMaterial);
      bob.position.set(0, 0.08, -0.05);
      this.hairMesh.add(bob);

      const sideLGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.35, 12);
      const sideL = new THREE.Mesh(sideLGeo, this.hairMaterial);
      sideL.position.set(-0.42, -0.1, 0.1);
      this.hairMesh.add(sideL);

      const sideR = new THREE.Mesh(sideLGeo, this.hairMaterial);
      sideR.position.set(0.42, -0.1, 0.1);
      this.hairMesh.add(sideR);
    } else {
      // Classic sleek parted
      const hairCapGeo = new THREE.SphereGeometry(0.49, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.8);
      const cap = new THREE.Mesh(hairCapGeo, this.hairMaterial);
      cap.position.set(0, 0.08, -0.04);
      this.hairMesh.add(cap);

      // Front swoosh
      const swoopGeo = new THREE.CylinderGeometry(0.1, 0.05, 0.4, 12);
      const swoop = new THREE.Mesh(swoopGeo, this.hairMaterial);
      swoop.rotation.z = Math.PI / 2.5;
      swoop.position.set(-0.15, 0.4, 0.32);
      this.hairMesh.add(swoop);
    }
  }

  private buildAccessories(acc: string) {
    while (this.accessoryGroup.children.length > 0) {
      this.accessoryGroup.remove(this.accessoryGroup.children[0]);
    }

    if (acc === 'headphones') {
      // Modern studio DJ headphones (beats style)
      const bandGeo = new THREE.TorusGeometry(0.48, 0.04, 12, 32, Math.PI);
      const band = new THREE.Mesh(bandGeo, this.metalMaterial);
      band.position.set(0, 0.1, 0);
      this.accessoryGroup.add(band);

      // Ear cups
      const cupGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.09, 20);
      const cupL = new THREE.Mesh(cupGeo, this.outfitMaterial);
      cupL.rotation.z = Math.PI / 2;
      cupL.position.set(-0.48, 0.08, 0);
      this.accessoryGroup.add(cupL);

      const cupR = new THREE.Mesh(cupGeo, this.outfitMaterial);
      cupR.rotation.z = Math.PI / 2;
      cupR.position.set(0.48, 0.08, 0);
      this.accessoryGroup.add(cupR);
    } else if (acc === 'glasses') {
      // Sleek modern cyber frames
      const frameGeo = new THREE.BoxGeometry(0.55, 0.12, 0.03);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.2,
        metalness: 0.9,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(0, 0.06, 0.45);
      this.accessoryGroup.add(frame);

      const lensGeo = new THREE.PlaneGeometry(0.18, 0.1);
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.8,
      });
      const lensL = new THREE.Mesh(lensGeo, lensMat);
      lensL.position.set(-0.14, 0.06, 0.47);
      this.accessoryGroup.add(lensL);

      const lensR = new THREE.Mesh(lensGeo, lensMat);
      lensR.position.set(0.14, 0.06, 0.47);
      this.accessoryGroup.add(lensR);
    } else if (acc === 'cap') {
      // Baseball cap
      const domeGeo = new THREE.SphereGeometry(0.5, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2.2);
      const capDome = new THREE.Mesh(domeGeo, this.outfitMaterial);
      capDome.position.set(0, 0.1, -0.02);
      this.accessoryGroup.add(capDome);

      const visorGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.04, 16, 1, false, -Math.PI / 4, Math.PI / 2);
      const visor = new THREE.Mesh(visorGeo, this.outfitMaterial);
      visor.position.set(0, 0.12, 0.35);
      this.accessoryGroup.add(visor);
    } else if (acc === 'gold_chain') {
      // Gold chain necklace
      const chainGeo = new THREE.TorusGeometry(0.32, 0.03, 12, 32);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.18,
        metalness: 0.95,
      });
      const chain = new THREE.Mesh(chainGeo, goldMat);
      chain.rotation.x = Math.PI / 2.2;
      chain.position.set(0, -0.48, 0.05);
      this.accessoryGroup.add(chain);
    }
  }

  // Update visual style in real-time
  public updateConfig(newConfig: Partial<AvatarConfig>) {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.skinColor) {
      this.skinMaterial.color.set(newConfig.skinColor);
    }
    if (newConfig.hairColor) {
      this.hairMaterial.color.set(newConfig.hairColor);
    }
    if (newConfig.outfitColor) {
      this.outfitMaterial.color.set(newConfig.outfitColor);
    }
    if (newConfig.hairStyle) {
      this.buildHair(newConfig.hairStyle);
    }
    if (newConfig.accessory) {
      this.buildAccessories(newConfig.accessory);
    }
    if (newConfig.expression) {
      this.setExpression(newConfig.expression);
    }
  }

  public setExpression(exp: AvatarExpression) {
    this.currentExpression = exp;
    this.animTime = 0;
  }

  public setTargetLookAt(x: number, y: number) {
    // Normalised [-1, 1] screen offset
    this.targetHeadRot.set(
      THREE.MathUtils.clamp(-y * 0.3, -0.3, 0.3),
      THREE.MathUtils.clamp(x * 0.45, -0.6, 0.6)
    );
  }

  // Per-frame animation tick
  public update(delta: number) {
    this.animTime += delta;

    // Smooth head follow using exponential damping
    this.currentHeadRot.x = THREE.MathUtils.damp(this.currentHeadRot.x, this.targetHeadRot.x, 6, delta);
    this.currentHeadRot.y = THREE.MathUtils.damp(this.currentHeadRot.y, this.targetHeadRot.y, 6, delta);

    // Natural breathing bob
    const breath = Math.sin(this.animTime * 2.2) * 0.015;
    this.group.position.y = breath;

    // Eye blinking logic
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.5) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.65) {
        this.isBlinking = false;
        this.blinkTimer = Math.random() * 0.8;
      }
    }
    const blinkScaleY = this.isBlinking ? 0.08 : 1.0;
    this.leftEye.scale.y = blinkScaleY * 1.25;
    this.rightEye.scale.y = blinkScaleY * 1.25;
    this.leftPupil.visible = !this.isBlinking;
    this.rightPupil.visible = !this.isBlinking;

    // Handle Expression Animations
    const t = this.animTime;

    switch (this.currentExpression) {
      case 'talking': {
        // Mouth opening and moving rapidly with speech cadence
        const speechMouth = 0.6 + Math.abs(Math.sin(t * 12)) * 0.8;
        this.mouthMesh.scale.set(1.2, speechMouth, 1.2);
        this.headGroup.rotation.x = this.currentHeadRot.x + Math.sin(t * 6) * 0.04;
        this.headGroup.rotation.y = this.currentHeadRot.y + Math.cos(t * 3) * 0.06;
        // Subtle hand gesture
        this.rightArmGroup.rotation.x = -0.4 + Math.sin(t * 5) * 0.2;
        this.rightArmGroup.rotation.z = -0.3 + Math.cos(t * 4) * 0.15;
        this.leftArmGroup.rotation.z = 0.15;
        break;
      }

      case 'waving': {
        // Enthusiastic high wave
        this.rightArmGroup.rotation.x = -Math.PI * 0.65;
        this.rightArmGroup.rotation.z = -0.4 + Math.sin(t * 10) * 0.35;
        this.leftArmGroup.rotation.z = 0.15;
        this.headGroup.rotation.z = -0.08;
        this.mouthMesh.scale.set(1.4, 1.2, 1);
        break;
      }

      case 'happy': {
        // Joyful bounce & tilt
        const bounce = Math.abs(Math.sin(t * 4)) * 0.08;
        this.group.position.y = bounce;
        this.headGroup.rotation.z = Math.sin(t * 3) * 0.1;
        this.mouthMesh.scale.set(1.5, 1.4, 1);
        this.leftArmGroup.rotation.z = 0.35;
        this.rightArmGroup.rotation.z = -0.35;
        break;
      }

      case 'laughing': {
        // Chest heave & head thrown back slightly
        const heave = Math.sin(t * 14) * 0.06;
        this.headGroup.rotation.x = -0.15 + heave;
        this.mouthMesh.scale.set(1.6, 1.6, 1.2);
        this.rightArmGroup.rotation.z = -0.4 + heave;
        this.leftArmGroup.rotation.z = 0.4 - heave;
        break;
      }

      case 'thinking': {
        // Hand to chin, head tilted up and away
        this.rightArmGroup.rotation.x = -Math.PI * 0.55;
        this.rightArmGroup.rotation.z = -0.6;
        this.headGroup.rotation.y = 0.25;
        this.headGroup.rotation.x = -0.18;
        this.headGroup.rotation.z = 0.12;
        this.mouthMesh.scale.set(0.7, 0.7, 1);
        break;
      }

      case 'dance': {
        // Rhythmic groove side-to-side
        const groove = Math.sin(t * 6);
        this.group.position.x = groove * 0.12;
        this.group.rotation.y = groove * 0.25;
        this.headGroup.rotation.z = -groove * 0.15;
        this.leftArmGroup.rotation.z = 0.3 + Math.sin(t * 6) * 0.4;
        this.rightArmGroup.rotation.z = -0.3 - Math.sin(t * 6) * 0.4;
        this.mouthMesh.scale.set(1.3, 1.1, 1);
        break;
      }

      case 'surprised': {
        // Jolt back and wide eyes
        this.headGroup.position.z = -0.08;
        this.headGroup.position.y = 1.6;
        this.leftEye.scale.set(1.3, 1.5, 1);
        this.rightEye.scale.set(1.3, 1.5, 1);
        this.mouthMesh.scale.set(1.1, 2.2, 1);
        this.leftArmGroup.rotation.z = 0.5;
        this.rightArmGroup.rotation.z = -0.5;
        break;
      }

      case 'idle':
      default: {
        // Peaceful relaxed idle
        this.mouthMesh.scale.set(1, 1, 1);
        this.headGroup.rotation.x = this.currentHeadRot.x;
        this.headGroup.rotation.y = this.currentHeadRot.y;
        this.headGroup.rotation.z = 0;
        this.leftArmGroup.rotation.set(0, 0, 0.15);
        this.rightArmGroup.rotation.set(0, 0, -0.15);
        this.group.position.x = 0;
        this.group.rotation.y = 0;
        break;
      }
    }
  }

  public dispose() {
    // Dispose geometries and materials
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });
  }
}
