import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarConfig } from '../types/chat';

interface MiniAvatarHeadProps {
  config: AvatarConfig;
  size?: number;
}

export const MiniAvatarHead: React.FC<MiniAvatarHeadProps> = ({ config, size = 32 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let headGroup: THREE.Group | null = null;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
      camera.position.set(0, 0.1, 1.6);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      containerRef.current.appendChild(renderer.domElement);

      // Studio Lighting
      const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xfffaed, 1.6);
      dirLight.position.set(1.5, 2, 2);
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0x25d366, 1.2);
      rimLight.position.set(-2, 1, -1);
      scene.add(rimLight);

      // Build Mini Head
      headGroup = new THREE.Group();
      scene.add(headGroup);

      const skinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.skinColor || '#f6d1b1'),
        roughness: 0.6,
      });

      const hairMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.hairColor || '#2c1b18'),
        roughness: 0.8,
      });

      // Head Base
      const headGeo = new THREE.SphereGeometry(0.38, 20, 20);
      headGeo.scale(1, 1.05, 0.95);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headGroup.add(headMesh);

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.13, 0.04, 0.34);
      headGroup.add(eyeL);

      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.13, 0.04, 0.34);
      headGroup.add(eyeR);

      // Smile mouth
      const mouthGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 12, Math.PI);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.rotation.z = Math.PI;
      mouth.position.set(0, -0.12, 0.36);
      headGroup.add(mouth);

      // Hair
      if (config.hairStyle === 'afro') {
        const afroGeo = new THREE.SphereGeometry(0.46, 16, 16);
        const afro = new THREE.Mesh(afroGeo, hairMat);
        afro.position.set(0, 0.12, -0.04);
        headGroup.add(afro);
      } else {
        const hairCapGeo = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
        const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
        hairCap.position.set(0, 0.06, -0.02);
        headGroup.add(hairCap);
      }

      // Glasses accessory if equipped
      if (config.accessory === 'glasses') {
        const frameGeo = new THREE.BoxGeometry(0.44, 0.1, 0.03);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(0, 0.04, 0.38);
        headGroup.add(frame);
      } else if (config.accessory === 'headphones') {
        const bandGeo = new THREE.TorusGeometry(0.4, 0.035, 8, 20, Math.PI);
        const bandMat = new THREE.MeshBasicMaterial({ color: 0x25d366 });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.position.set(0, 0.08, 0);
        headGroup.add(band);
      }

      // Subtle animate loop: head nodding/bobbing while typing
      let clock = 0;
      const tick = () => {
        clock += 0.06;
        if (headGroup) {
          headGroup.rotation.y = Math.sin(clock * 1.5) * 0.18;
          headGroup.rotation.x = Math.sin(clock * 2.5) * 0.08;
          headGroup.position.y = Math.sin(clock * 3) * 0.03;
        }
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
        animId = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Fallback silently if WebGL fails
    }

    return () => {
      cancelAnimationFrame(animId);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      }
    };
  }, [config, size]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-full overflow-hidden flex items-center justify-center bg-[#111b21] border border-[#25d366]/40 shadow-inner"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
