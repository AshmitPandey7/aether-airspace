import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FlightModel3DProps {
  scrollProgress: number; // 0 (top) to 1 (bottom)
}

export const FlightModel3D: React.FC<FlightModel3DProps> = ({ scrollProgress }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080D16, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x1C2A3E, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x55DDF5, 3.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xFFB454, 2.0);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    // Afterburner Point Lights
    const engineGlowLeft = new THREE.PointLight(0x55DDF5, 4, 6);
    const engineGlowRight = new THREE.PointLight(0x55DDF5, 4, 6);
    scene.add(engineGlowLeft);
    scene.add(engineGlowRight);

    // 3. Build Procedural Supersonic Surveillance Jet Model
    const jetGroup = new THREE.Group();

    // Dark titanium metallic material
    const fuselageMat = new THREE.MeshStandardMaterial({
      color: 0x0E1624,
      metalness: 0.85,
      roughness: 0.25,
      flatShading: false
    });

    // Dark composite wing material
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x131F30,
      metalness: 0.9,
      roughness: 0.2
    });

    // Neon Cyan glow accent
    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x55DDF5,
      wireframe: true
    });

    // Cockpit glass
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x55DDF5,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9
    });

    // Fuselage Core (Elongated faceted aerodynamic body)
    const noseGeo = new THREE.ConeGeometry(0.5, 2.2, 8);
    noseGeo.rotateX(Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo, fuselageMat);
    noseMesh.position.set(0, 0, 1.6);
    jetGroup.add(noseMesh);

    const bodyGeo = new THREE.CylinderGeometry(0.48, 0.6, 3.2, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeo, fuselageMat);
    bodyMesh.position.set(0, 0, -0.6);
    jetGroup.add(bodyMesh);

    // Cockpit Canopy
    const canopyGeo = new THREE.SphereGeometry(0.35, 16, 12);
    canopyGeo.scale(0.8, 0.6, 2.0);
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.set(0, 0.32, 0.6);
    jetGroup.add(canopyMesh);

    // Main Delta Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 1.2);
    wingShape.lineTo(3.2, -1.8);
    wingShape.lineTo(2.8, -2.1);
    wingShape.lineTo(0.5, -1.2);
    wingShape.lineTo(-0.5, -1.2);
    wingShape.lineTo(-2.8, -2.1);
    wingShape.lineTo(-3.2, -1.8);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.rotateX(-Math.PI / 2);
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, -0.05, 0.4);
    jetGroup.add(wingMesh);

    // Twin Cant-Angled Vertical Stabilizers
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.6, 1.4);
    finShape.lineTo(1.1, 1.3);
    finShape.lineTo(0.9, 0);
    finShape.closePath();

    const finExtrude = { depth: 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 };
    const finLeftGeo = new THREE.ExtrudeGeometry(finShape, finExtrude);
    finLeftGeo.rotateY(Math.PI / 2);
    const finLeft = new THREE.Mesh(finLeftGeo, wingMat);
    finLeft.position.set(-0.55, 0.2, -1.2);
    finLeft.rotation.z = -0.22;
    jetGroup.add(finLeft);

    const finRightGeo = new THREE.ExtrudeGeometry(finShape, finExtrude);
    finRightGeo.rotateY(Math.PI / 2);
    const finRight = new THREE.Mesh(finRightGeo, wingMat);
    finRight.position.set(0.55, 0.2, -1.2);
    finRight.rotation.z = 0.22;
    jetGroup.add(finRight);

    // Twin Jet Engine Exhaust Nozzles with Glowing Flame
    const nozzleGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.8, 16);
    nozzleGeo.rotateX(Math.PI / 2);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x05080F, roughness: 0.4, metalness: 0.9 });

    const nozzleLeft = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleLeft.position.set(-0.35, -0.05, -2.2);
    jetGroup.add(nozzleLeft);

    const nozzleRight = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleRight.position.set(0.35, -0.05, -2.2);
    jetGroup.add(nozzleRight);

    // Glowing Flame Cones (Afterburner)
    const flameGeo = new THREE.ConeGeometry(0.18, 1.4, 16);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x55DDF5,
      transparent: true,
      opacity: 0.85
    });

    const flameLeft = new THREE.Mesh(flameGeo, flameMat);
    flameLeft.position.set(-0.35, -0.05, -2.9);
    jetGroup.add(flameLeft);

    const flameRight = new THREE.Mesh(flameGeo, flameMat);
    flameRight.position.set(0.35, -0.05, -2.9);
    jetGroup.add(flameRight);

    // 4. Orbiting Tactical HUD Wireframe Rings
    const ringGeo1 = new THREE.RingGeometry(3.6, 3.65, 48);
    const ring1 = new THREE.Mesh(ringGeo1, cyanGlowMat);
    ring1.rotation.x = Math.PI / 2;
    jetGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.4, 2.44, 36);
    const ring2 = new THREE.Mesh(ringGeo2, cyanGlowMat);
    ring2.rotation.x = Math.PI / 2;
    jetGroup.add(ring2);

    scene.add(jetGroup);

    // 5. Starfield / Altitude Speed Particle Stream
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
      speeds[i] = 0.08 + Math.random() * 0.15;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x55DDF5,
      size: 0.07,
      transparent: true,
      opacity: 0.65
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Tracking for dynamic tilt
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const p = scrollRef.current; // 0 to 1

      // Rotate HUD rings
      ring1.rotation.z = elapsed * 0.35;
      ring2.rotation.z = -elapsed * 0.5;

      // Pulse afterburners
      const pulse = 1 + Math.sin(elapsed * 12) * 0.15;
      flameLeft.scale.set(1, 1, pulse);
      flameRight.scale.set(1, 1, pulse);
      engineGlowLeft.position.set(-0.35, -0.05, -2.6);
      engineGlowRight.position.set(0.35, -0.05, -2.6);
      engineGlowLeft.intensity = 3 + pulse * 2;
      engineGlowRight.intensity = 3 + pulse * 2;

      // Scroll-driven flight dynamics and camera choreographies
      // Phase 0 -> 0.33 (Hero: High altitude cruise)
      // Phase 0.33 -> 0.66 (Feature 1 & 2: Banking turn & side vector)
      // Phase 0.66 -> 1.0 (Feature 3: Dive & Approach toward target reticle)
      const targetRotX = (mouseY * 0.15) + (p * 0.4 - 0.1);
      const targetRotY = (mouseX * 0.3) + Math.sin(elapsed * 0.5) * 0.08 + (p * Math.PI * 0.85);
      const targetRotZ = (-mouseX * 0.35) + Math.cos(elapsed * 0.8) * 0.05 - (p * 0.8);

      jetGroup.rotation.x += (targetRotX - jetGroup.rotation.x) * 0.08;
      jetGroup.rotation.y += (targetRotY - jetGroup.rotation.y) * 0.08;
      jetGroup.rotation.z += (targetRotZ - jetGroup.rotation.z) * 0.08;

      // Scroll-driven position translation
      const targetX = Math.sin(p * Math.PI) * 1.5;
      const targetY = -p * 1.8 + Math.sin(elapsed * 1.5) * 0.12;
      const targetZ = p * 1.2;

      jetGroup.position.x += (targetX - jetGroup.position.x) * 0.08;
      jetGroup.position.y += (targetY - jetGroup.position.y) * 0.08;
      jetGroup.position.z += (targetZ - jetGroup.position.z) * 0.08;

      // Camera parallax
      camera.position.x = mouseX * 0.4;
      camera.position.y = 2 + mouseY * 0.25 - p * 0.5;

      // Stream particles past jet
      const posArr = particleGeo.attributes.position.array as Float32Array;
      const speedMultiplier = 1 + p * 2.5; // accelerates on scroll
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 2] += speeds[i] * speedMultiplier;
        if (posArr[i * 3 + 2] > 20) {
          posArr[i * 3 + 2] = -25;
          posArr[i * 3] = (Math.random() - 0.5) * 35;
          posArr[i * 3 + 1] = (Math.random() - 0.5) * 25;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      noseGeo.dispose();
      bodyGeo.dispose();
      wingGeo.dispose();
      fuselageMat.dispose();
      wingMat.dispose();
      canopyMat.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
      aria-hidden="true"
    />
  );
};
