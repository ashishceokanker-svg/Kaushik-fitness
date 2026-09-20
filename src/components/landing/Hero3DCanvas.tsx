import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCw, Move } from 'lucide-react';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const goldLight = new THREE.DirectionalLight(0xf59e0b, 3.5);
    goldLight.position.set(5, 5, 4);
    scene.add(goldLight);

    const cyanLight = new THREE.DirectionalLight(0x06b6d4, 3.0);
    cyanLight.position.set(-5, -3, 3);
    scene.add(cyanLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.0, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // 5. Build 3D Olympic Dumbbell Group
    const dumbbellGroup = new THREE.Group();
    scene.add(dumbbellGroup);

    // Materials
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      metalness: 0.95,
      roughness: 0.15,
    });

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x181e2b,
      metalness: 0.7,
      roughness: 0.3,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
    });

    // Handle (Central Bar)
    const handleGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.6, 32);
    const handle = new THREE.Mesh(handleGeo, chromeMat);
    handle.rotation.z = Math.PI / 2;
    dumbbellGroup.add(handle);

    // Center Grip Ring
    const gripGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 32);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x242d3d,
      metalness: 0.4,
      roughness: 0.8,
    });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.rotation.z = Math.PI / 2;
    dumbbellGroup.add(grip);

    // Plates Assembly function
    const createPlateSet = (xPos: number) => {
      const setGroup = new THREE.Group();
      setGroup.position.x = xPos;

      // Inner Collar
      const collarGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24);
      const collar = new THREE.Mesh(collarGeo, goldAccentMat);
      collar.rotation.z = Math.PI / 2;
      setGroup.add(collar);

      // Large Outer Plate (25KG)
      const bigPlateGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.18, 48);
      const bigPlate = new THREE.Mesh(bigPlateGeo, plateMat);
      bigPlate.rotation.z = Math.PI / 2;
      bigPlate.position.x = xPos > 0 ? 0.2 : -0.2;
      setGroup.add(bigPlate);

      // Outer Gold Rim
      const rimGeo = new THREE.TorusGeometry(0.9, 0.04, 16, 48);
      const rim = new THREE.Mesh(rimGeo, goldAccentMat);
      rim.rotation.y = Math.PI / 2;
      rim.position.x = xPos > 0 ? 0.2 : -0.2;
      setGroup.add(rim);

      // Medium Plate (10KG)
      const medPlateGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.16, 48);
      const medPlate = new THREE.Mesh(medPlateGeo, plateMat);
      medPlate.rotation.z = Math.PI / 2;
      medPlate.position.x = xPos > 0 ? 0.4 : -0.4;
      setGroup.add(medPlate);

      // Small Plate (5KG)
      const smPlateGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 48);
      const smPlate = new THREE.Mesh(smPlateGeo, plateMat);
      smPlate.rotation.z = Math.PI / 2;
      smPlate.position.x = xPos > 0 ? 0.58 : -0.58;
      setGroup.add(smPlate);

      // Outer End Cap / Nut
      const nutGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.15, 24);
      const nut = new THREE.Mesh(nutGeo, goldAccentMat);
      nut.rotation.z = Math.PI / 2;
      nut.position.x = xPos > 0 ? 0.75 : -0.75;
      setGroup.add(nut);

      dumbbellGroup.add(setGroup);
    };

    createPlateSet(1.0);
    createPlateSet(-1.0);

    // 6. Glowing Orbital Energy Rings
    const ring1Geo = new THREE.TorusGeometry(1.6, 0.02, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.9, 0.015, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    scene.add(ring2);

    // 7. Floating Chalk / Energy Particles
    const particlesCount = 180;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 8;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.7,
    });
    const particleMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleMesh);

    // Initial slight angle tilt for aesthetic presentation
    dumbbellGroup.rotation.x = 0.35;
    dumbbellGroup.rotation.y = 0.45;
    dumbbellGroup.rotation.z = 0.2;

    // 8. Mouse / Pointer Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const rect = container.getBoundingClientRect();
      mouseX = ((clientX - rect.left) / width) * 2 - 1;
      mouseY = -(((clientY - rect.top) / height) * 2 - 1);
      setIsInteracting(true);
    };

    const handlePointerLeave = () => {
      setIsInteracting(false);
      mouseX = 0;
      mouseY = 0;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handlePointerMove, { passive: true });
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('touchend', handlePointerLeave);

    // 9. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse follow interpolation
      targetX += (mouseX * 0.8 - targetX) * 0.05;
      targetY += (mouseY * 0.8 - targetY) * 0.05;

      // Dumbbell rotation & floating oscillation
      dumbbellGroup.rotation.y += 0.007;
      dumbbellGroup.rotation.z = Math.sin(elapsed * 0.8) * 0.15 + targetX * 0.4;
      dumbbellGroup.rotation.x = Math.cos(elapsed * 0.6) * 0.15 + targetY * 0.4;
      dumbbellGroup.position.y = Math.sin(elapsed * 1.5) * 0.1;

      // Rings dynamic rotation
      ring1.rotation.x = elapsed * 0.3;
      ring1.rotation.y = elapsed * 0.4;
      ring2.rotation.x = -elapsed * 0.25;
      ring2.rotation.z = elapsed * 0.35;

      // Particle subtle drifting
      particleMesh.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Responsive resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 450;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('touchend', handlePointerLeave);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center select-none">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Badge Overlay */}
      <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-gym-border px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-mono text-gym-gold shadow-xl pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-gym-gold animate-spin-slow" />
        <span>3D Interactive • WebGL 60FPS</span>
      </div>

      {/* Touch / Mouse Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/75 backdrop-blur-sm border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 pointer-events-none">
        <Move className="w-3 h-3 text-gym-cyan animate-pulse" />
        <span>Hover or drag to rotate 3D equipment</span>
      </div>
    </div>
  );
};
