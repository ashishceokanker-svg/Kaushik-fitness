import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sparkles, Layers, Sliders } from 'lucide-react';

interface BodyVisualizer3DProps {
  currentStats: {
    heightCm: number;
    weightKg: number;
    bodyFatPercentage: number;
    gender: 'male' | 'female' | 'other';
    muscleLevel?: number; // 1 to 10
  };
  targetStats?: {
    weightKg: number;
    bodyFatPercentage: number;
    muscleLevel?: number;
  };
}

export const BodyVisualizer3D: React.FC<BodyVisualizer3DProps> = ({
  currentStats,
  targetStats = {
    weightKg: Math.max(50, currentStats.weightKg - 5),
    bodyFatPercentage: Math.max(12, currentStats.bodyFatPercentage - 8),
    muscleLevel: 8,
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'current' | 'target' | 'morph'>('current');
  const [morphValue, setMorphValue] = useState<number>(0); // 0 = current, 100 = target
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showMuscles, setShowMuscles] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // References to Three.js objects for real-time updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bodyGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Calculate interpolated physique parameters based on morphValue
  const currentBF = currentStats.bodyFatPercentage;
  const targetBF = targetStats.bodyFatPercentage;
  const effectiveBF =
    viewMode === 'current'
      ? currentBF
      : viewMode === 'target'
      ? targetBF
      : currentBF + ((targetBF - currentBF) * morphValue) / 100;

  const currentMuscle = currentStats.muscleLevel || 5;
  const targetMuscle = targetStats.muscleLevel || 8;
  const effectiveMuscle =
    viewMode === 'current'
      ? currentMuscle
      : viewMode === 'target'
      ? targetMuscle
      : currentMuscle + ((targetMuscle - currentMuscle) * morphValue) / 100;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Dramatic fitness studio rim lights
    const frontGoldLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
    frontGoldLight.position.set(2, 3, 3);
    scene.add(frontGoldLight);

    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 2.8);
    cyanRimLight.position.set(-3, 2, -2);
    scene.add(cyanRimLight);

    const topFill = new THREE.PointLight(0xffffff, 1.2, 10);
    topFill.position.set(0, 4, 1);
    scene.add(topFill);

    // Ground platform grid with neon ring
    const gridHelper = new THREE.GridHelper(4, 16, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -1.6;
    scene.add(gridHelper);

    const ringGeometry = new THREE.RingGeometry(0.8, 0.85, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.59;
    scene.add(ringMesh);

    // Build Procedural Humanoid Body Avatar
    const bodyGroup = new THREE.Group();
    bodyGroupRef.current = bodyGroup;
    bodyGroup.position.y = -0.3;
    scene.add(bodyGroup);

    // Materials
    materialsRef.current = [];
    const skinColor = currentStats.gender === 'female' ? 0xd4a373 : 0xc68642;
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.45,
      metalness: 0.15,
      wireframe: isWireframe,
    });
    materialsRef.current.push(bodyMaterial);

    const muscleHighlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.35,
      metalness: 0.2,
      wireframe: isWireframe,
      transparent: true,
      opacity: showMuscles ? 0.75 : 0.0,
    });
    materialsRef.current.push(muscleHighlightMaterial);

    // 1. Head & Neck
    const headGeom = new THREE.SphereGeometry(0.22, 24, 24);
    headGeom.scale(1, 1.2, 1);
    const head = new THREE.Mesh(headGeom, bodyMaterial);
    head.position.y = 1.45;
    bodyGroup.add(head);

    const neckGeom = new THREE.CylinderGeometry(0.09, 0.11, 0.18, 16);
    const neck = new THREE.Mesh(neckGeom, bodyMaterial);
    neck.position.y = 1.22;
    bodyGroup.add(neck);

    // 2. Chest & Ribcage (Scales with muscularity)
    const chestGeom = new THREE.CylinderGeometry(0.38, 0.3, 0.42, 24);
    chestGeom.scale(1.2, 1, 0.8);
    const chest = new THREE.Mesh(chestGeom, bodyMaterial);
    chest.name = 'chest';
    chest.position.y = 0.95;
    bodyGroup.add(chest);

    // Pectoral definition plates (left & right)
    const pecGeom = new THREE.BoxGeometry(0.24, 0.18, 0.12);
    const pecLeft = new THREE.Mesh(pecGeom, muscleHighlightMaterial);
    pecLeft.name = 'pecLeft';
    pecLeft.position.set(-0.15, 0.98, 0.18);
    pecLeft.rotation.z = 0.08;
    bodyGroup.add(pecLeft);

    const pecRight = new THREE.Mesh(pecGeom, muscleHighlightMaterial);
    pecRight.name = 'pecRight';
    pecRight.position.set(0.15, 0.98, 0.18);
    pecRight.rotation.z = -0.08;
    bodyGroup.add(pecRight);

    // 3. Deltoids / Shoulders
    const deltGeom = new THREE.SphereGeometry(0.16, 18, 18);
    deltGeom.scale(1, 1.2, 1);
    const deltLeft = new THREE.Mesh(deltGeom, muscleHighlightMaterial);
    deltLeft.name = 'deltLeft';
    deltLeft.position.set(-0.52, 1.05, 0);
    bodyGroup.add(deltLeft);

    const deltRight = new THREE.Mesh(deltGeom, muscleHighlightMaterial);
    deltRight.name = 'deltRight';
    deltRight.position.set(0.52, 1.05, 0);
    bodyGroup.add(deltRight);

    // 4. Arms (Biceps & Forearms)
    const bicepGeom = new THREE.CylinderGeometry(0.09, 0.08, 0.38, 16);
    const bicepLeft = new THREE.Mesh(bicepGeom, bodyMaterial);
    bicepLeft.name = 'bicepLeft';
    bicepLeft.position.set(-0.54, 0.72, 0);
    bicepLeft.rotation.z = -0.15;
    bodyGroup.add(bicepLeft);

    const bicepRight = new THREE.Mesh(bicepGeom, bodyMaterial);
    bicepRight.name = 'bicepRight';
    bicepRight.position.set(0.54, 0.72, 0);
    bicepRight.rotation.z = 0.15;
    bodyGroup.add(bicepRight);

    const armGeom = new THREE.CylinderGeometry(0.075, 0.06, 0.36, 16);
    const armLeft = new THREE.Mesh(armGeom, bodyMaterial);
    armLeft.position.set(-0.6, 0.35, 0);
    armLeft.rotation.z = -0.1;
    bodyGroup.add(armLeft);

    const armRight = new THREE.Mesh(armGeom, bodyMaterial);
    armRight.position.set(0.6, 0.35, 0);
    armRight.rotation.z = 0.1;
    bodyGroup.add(armRight);

    // 5. Waist & Abdominals (Dynamic morphing with body fat & waist)
    const waistGeom = new THREE.CylinderGeometry(0.3, 0.32, 0.38, 20);
    const waist = new THREE.Mesh(waistGeom, bodyMaterial);
    waist.name = 'waist';
    waist.position.y = 0.58;
    bodyGroup.add(waist);

    // 6-pack abs highlight
    const absGeom = new THREE.BoxGeometry(0.24, 0.32, 0.08);
    const abs = new THREE.Mesh(absGeom, muscleHighlightMaterial);
    abs.name = 'abs';
    abs.position.set(0, 0.58, 0.16);
    bodyGroup.add(abs);

    // 6. Pelvis / Hips
    const hipsGeom = new THREE.CylinderGeometry(0.32, 0.28, 0.24, 20);
    const hips = new THREE.Mesh(hipsGeom, bodyMaterial);
    hips.name = 'hips';
    hips.position.y = 0.28;
    bodyGroup.add(hips);

    // 7. Thighs / Quadriceps
    const thighGeom = new THREE.CylinderGeometry(0.16, 0.11, 0.65, 20);
    const thighLeft = new THREE.Mesh(thighGeom, bodyMaterial);
    thighLeft.name = 'thighLeft';
    thighLeft.position.set(-0.19, -0.16, 0);
    thighLeft.rotation.z = 0.05;
    bodyGroup.add(thighLeft);

    const thighRight = new THREE.Mesh(thighGeom, bodyMaterial);
    thighRight.name = 'thighRight';
    thighRight.position.set(0.19, -0.16, 0);
    thighRight.rotation.z = -0.05;
    bodyGroup.add(thighRight);

    // 8. Calves & Feet
    const calfGeom = new THREE.CylinderGeometry(0.11, 0.08, 0.62, 16);
    const calfLeft = new THREE.Mesh(calfGeom, bodyMaterial);
    calfLeft.position.set(-0.21, -0.78, 0);
    bodyGroup.add(calfLeft);

    const calfRight = new THREE.Mesh(calfGeom, bodyMaterial);
    calfRight.position.set(0.21, -0.78, 0);
    bodyGroup.add(calfRight);

    // Interactive mouse rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      bodyGroup.rotation.y += deltaX * 0.01;
      camera.position.y = Math.max(-0.5, Math.min(1.5, camera.position.y - deltaY * 0.005));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        bodyGroup.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [currentStats.gender]);

  // Dynamically update body morphing when effectiveBF or effectiveMuscle changes
  useEffect(() => {
    if (!bodyGroupRef.current) return;
    const group = bodyGroupRef.current;

    // Muscularity scale factor (1.0 to 1.45)
    const muscleFactor = 0.85 + (effectiveMuscle / 10) * 0.45;
    // Body fat scale factor for waist/belly (0.85 for 10% BF to 1.55 for 35% BF)
    const fatFactor = 0.75 + (effectiveBF / 25) * 0.45;

    // Morph Chest
    const chest = group.getObjectByName('chest');
    if (chest) {
      chest.scale.set(1.15 * muscleFactor, 1, 0.8 * muscleFactor * (1 + (effectiveBF - 15) * 0.01));
    }

    // Morph Pecs
    const pecLeft = group.getObjectByName('pecLeft');
    const pecRight = group.getObjectByName('pecRight');
    if (pecLeft && pecRight) {
      const pecScale = 0.8 + (effectiveMuscle / 10) * 0.5;
      pecLeft.scale.set(pecScale, pecScale, pecScale);
      pecRight.scale.set(pecScale, pecScale, pecScale);
    }

    // Morph Deltoids / Shoulders
    const deltLeft = group.getObjectByName('deltLeft');
    const deltRight = group.getObjectByName('deltRight');
    if (deltLeft && deltRight) {
      const deltScale = 0.8 + (effectiveMuscle / 10) * 0.45;
      deltLeft.scale.set(deltScale, deltScale * 1.1, deltScale);
      deltRight.scale.set(deltScale, deltScale * 1.1, deltScale);
      deltLeft.position.x = -0.48 - (muscleFactor - 1) * 0.12;
      deltRight.position.x = 0.48 + (muscleFactor - 1) * 0.12;
    }

    // Morph Biceps
    const bicepLeft = group.getObjectByName('bicepLeft');
    const bicepRight = group.getObjectByName('bicepRight');
    if (bicepLeft && bicepRight) {
      const armScale = 0.85 + (effectiveMuscle / 10) * 0.4;
      bicepLeft.scale.set(armScale, 1, armScale);
      bicepRight.scale.set(armScale, 1, armScale);
    }

    // Morph Waist / Midsection (Increases with fat, tightens with lean muscle)
    const waist = group.getObjectByName('waist');
    if (waist) {
      waist.scale.set(fatFactor, 1, fatFactor * 1.1);
    }

    // Abs visibility and definition
    const abs = group.getObjectByName('abs');
    if (abs) {
      const absVisible = effectiveBF < 20;
      abs.scale.set(absVisible ? 1.0 : 0.7, 1.0, absVisible ? 1.0 : 0.4);
    }

    // Morph Quadriceps
    const thighLeft = group.getObjectByName('thighLeft');
    const thighRight = group.getObjectByName('thighRight');
    if (thighLeft && thighRight) {
      const quadScale = (muscleFactor * 0.7) + (fatFactor * 0.3);
      thighLeft.scale.set(quadScale, 1, quadScale);
      thighRight.scale.set(quadScale, 1, quadScale);
    }
  }, [effectiveBF, effectiveMuscle]);

  // Update wireframe & muscle highlights
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      mat.wireframe = isWireframe;
    });
  }, [isWireframe]);

  useEffect(() => {
    if (materialsRef.current[1]) {
      materialsRef.current[1].opacity = showMuscles ? 0.75 : 0.0;
    }
  }, [showMuscles]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">3D Body Avatar & Transformation Visualizer</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive biomechanical avatar morphing dynamically with stats & fitness goals
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('current')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'current'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current Body
          </button>
          <button
            onClick={() => setViewMode('target')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'target'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Target Physique
          </button>
          <button
            onClick={() => setViewMode('morph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'morph'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transformation Slider
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-[#0B0F1D] to-[#080B14] border border-slate-800 flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* On-canvas Stats Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 text-xs space-y-1.5 pointer-events-none">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <span className={`w-2 h-2 rounded-full ${viewMode === 'target' ? 'bg-gym-cyan' : 'bg-gym-gold'}`} />
            <span>
              {viewMode === 'current'
                ? 'Current Status'
                : viewMode === 'target'
                ? 'Target Transformation'
                : `Morphing: ${morphValue}% Reached`}
            </span>
          </div>
          <div className="text-slate-400">
            Est. Body Fat: <strong className="text-slate-200">{Math.round(effectiveBF)}%</strong>
          </div>
          <div className="text-slate-400">
            Muscularity Index: <strong className="text-slate-200">{effectiveMuscle.toFixed(1)} / 10</strong>
          </div>
          <div className="text-slate-400">
            V-Taper Ratio: <strong className="text-emerald-400">{((effectiveMuscle / (effectiveBF * 0.3)) || 1.4).toFixed(2)}</strong>
          </div>
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 360 Auto-Rotation"
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              autoRotate
                ? 'bg-amber-500/20 border-amber-500/40 text-gym-gold'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          </button>
          <button
            onClick={() => setShowMuscles(!showMuscles)}
            title="Toggle Muscle Activation Group"
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              showMuscles
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            title="Toggle Wireframe Biometrics Mode"
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              isWireframe
                ? 'bg-cyan-500/20 border-cyan-500/40 text-gym-cyan'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Instruction Hint */}
        <div className="absolute bottom-3 left-4 text-[11px] text-slate-500 pointer-events-none hidden sm:block">
          💡 Click & drag to rotate 360° • Scroll to zoom
        </div>
      </div>

      {/* Interactive Morph Slider Bar (Visible when in Morph mode or always accessible) */}
      {viewMode === 'morph' && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-purple-500/30">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Interactive Transformation Progress:
            </span>
            <span className="font-mono font-bold text-purple-400">{morphValue}% Complete</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={morphValue}
            onChange={(e) => setMorphValue(Number(e.target.value))}
            className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
            <span>Current (Day 1)</span>
            <span>50% Milestone</span>
            <span>Target Goal (100%)</span>
          </div>
        </div>
      )}

      {/* Comparison Legend Cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
            <span>Current Baseline</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Body Fat:</span>
            <strong className="text-slate-900">{currentStats.bodyFatPercentage}%</strong>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Weight:</span>
            <strong className="text-slate-900">{currentStats.weightKg} kg</strong>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs shadow-xs">
          <div className="flex items-center justify-between text-cyan-800 font-semibold mb-1">
            <span>Target Milestone</span>
            <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Target BF:</span>
            <strong className="text-cyan-800">{targetStats.bodyFatPercentage}%</strong>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Target Weight:</span>
            <strong className="text-cyan-800">{targetStats.weightKg} kg</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
