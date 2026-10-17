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

    // 1. Scene, Camera, Renderer (Pure black background, NO fog so model never vanishes)
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting (Pure clean white and neutral silver)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(6, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x888888, 1.5);
    fillLight.position.set(-6, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, -4, -6);
    scene.add(rimLight);

    // 3. Build Realistic, Elegant Jet Model
    const jetGroup = new THREE.Group();

    // Matte graphite aerospace skin
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      metalness: 0.8,
      roughness: 0.25,
      flatShading: false
    });

    // Dark composite surfaces (wings & tails)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f1f,
      metalness: 0.85,
      roughness: 0.2
    });

    // Brushed titanium trim
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.95,
      roughness: 0.15
    });

    // Smoked cockpit glass
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.9
    });

    // Fuselage (Streamlined nose & body)
    const noseGeo = new THREE.ConeGeometry(0.42, 2.0, 32);
    noseGeo.rotateX(Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
    noseMesh.position.set(0, 0, 1.5);
    jetGroup.add(noseMesh);

    const bodyGeo = new THREE.CylinderGeometry(0.42, 0.42, 3.2, 32);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0, -0.6);
    jetGroup.add(bodyMesh);

    // Cockpit Canopy (Smooth aerodynamic profile)
    const canopyGeo = new THREE.SphereGeometry(0.28, 24, 16);
    canopyGeo.scale(0.85, 0.65, 2.2);
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.set(0, 0.28, 0.65);
    jetGroup.add(canopyMesh);

    // Main Wings (Subtle swept wings)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.8);
    wingShape.lineTo(3.4, -1.2);
    wingShape.lineTo(3.2, -1.5);
    wingShape.lineTo(0.4, -0.8);
    wingShape.lineTo(-0.4, -0.8);
    wingShape.lineTo(-3.2, -1.5);
    wingShape.lineTo(-3.4, -1.2);
    wingShape.closePath();

    const wingExtrude = { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, steps: 1 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrude);
    wingGeo.rotateX(-Math.PI / 2);
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, -0.05, 0.2);
    jetGroup.add(wingMesh);

    // Wingtips (Subtle vertical winglets)
    const wingletGeo = new THREE.BoxGeometry(0.04, 0.35, 0.4);
    const wingletL = new THREE.Mesh(wingletGeo, titaniumMat);
    wingletL.position.set(3.35, 0.12, -1.35);
    jetGroup.add(wingletL);

    const wingletR = new THREE.Mesh(wingletGeo, titaniumMat);
    wingletR.position.set(-3.35, 0.12, -1.35);
    jetGroup.add(wingletR);

    // Vertical Stabilizer (Tail Fin)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.4, 1.3);
    finShape.lineTo(0.9, 1.2);
    finShape.lineTo(0.7, 0);
    finShape.closePath();

    const finExtrude = { depth: 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 };
    const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrude);
    finGeo.rotateY(Math.PI / 2);
    const fin = new THREE.Mesh(finGeo, wingMat);
    fin.position.set(0, 0.2, -1.6);
    jetGroup.add(fin);

    // Horizontal Stabilizers (Rear Tail Elevators)
    const hTailShape = new THREE.Shape();
    hTailShape.moveTo(0, 0.3);
    hTailShape.lineTo(1.3, -0.5);
    hTailShape.lineTo(1.1, -0.65);
    hTailShape.lineTo(0, -0.3);
    hTailShape.lineTo(-1.1, -0.65);
    hTailShape.lineTo(-1.3, -0.5);
    hTailShape.closePath();

    const hTailGeo = new THREE.ExtrudeGeometry(hTailShape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01 });
    hTailGeo.rotateX(-Math.PI / 2);
    const hTailMesh = new THREE.Mesh(hTailGeo, wingMat);
    hTailMesh.position.set(0, 0.1, -1.7);
    jetGroup.add(hTailMesh);

    // Twin Jet Turbofan Engines
    const engineGeo = new THREE.CylinderGeometry(0.22, 0.24, 1.1, 24);
    engineGeo.rotateX(Math.PI / 2);

    const engineL = new THREE.Mesh(engineGeo, titaniumMat);
    engineL.position.set(-0.75, -0.15, -0.5);
    jetGroup.add(engineL);

    const engineR = new THREE.Mesh(engineGeo, titaniumMat);
    engineR.position.set(0.75, -0.15, -0.5);
    jetGroup.add(engineR);

    // Exhaust rings (Pure titanium glow)
    const ringGeo = new THREE.TorusGeometry(0.2, 0.02, 16, 32);
    const ringL = new THREE.Mesh(ringGeo, titaniumMat);
    ringL.position.set(-0.75, -0.15, -1.06);
    jetGroup.add(ringL);

    const ringR = new THREE.Mesh(ringGeo, titaniumMat);
    ringR.position.set(0.75, -0.15, -1.06);
    jetGroup.add(ringR);

    // Scale jet to be clean and prominent, always visible in center
    jetGroup.scale.set(1.1, 1.1, 1.1);
    scene.add(jetGroup);

    // 4. Subtle, Minimal Particle Stream (dim neutral points, not loud colors)
    const particleCount = 250;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x444444,
      size: 0.04,
      transparent: true,
      opacity: 0.5
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking for subtle interactive responsiveness
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

    // Render loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const p = scrollRef.current; // 0 to 1

      // KEY FIX: The jet stays perfectly centered on screen!
      // Instead of flying away, scrolling smoothly rotates the aircraft 360 degrees to showcase its architecture!
      const targetRotY = (p * Math.PI * 2) + (mouseX * 0.25) + Math.sin(elapsed * 0.4) * 0.04;
      const targetRotX = 0.2 + (mouseY * 0.15) - Math.sin(p * Math.PI) * 0.2;
      const targetRotZ = (-mouseX * 0.2) + Math.cos(elapsed * 0.6) * 0.03;

      jetGroup.rotation.y += (targetRotY - jetGroup.rotation.y) * 0.06;
      jetGroup.rotation.x += (targetRotX - jetGroup.rotation.x) * 0.06;
      jetGroup.rotation.z += (targetRotZ - jetGroup.rotation.z) * 0.06;

      // Keep position firmly centered in screen with subtle floating motion
      jetGroup.position.set(0, Math.sin(elapsed * 1.2) * 0.06, 0);

      // Subtle particle drift
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 2] += 0.04;
        if (posArr[i * 3 + 2] > 15) {
          posArr[i * 3 + 2] = -15;
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
      bodyGeo.dispose();
      noseGeo.dispose();
      wingGeo.dispose();
      finGeo.dispose();
      hTailGeo.dispose();
      engineGeo.dispose();
      ringGeo.dispose();
      particleGeo.dispose();
      bodyMat.dispose();
      wingMat.dispose();
      titaniumMat.dispose();
      canopyMat.dispose();
      particleMat.dispose();
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
