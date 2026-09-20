import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Dumbbell, 
  RotateCw, 
  Sparkles, 
  Flame, 
  Zap, 
  Layers, 
  Eye, 
  ChevronRight,
  Info
} from 'lucide-react';

interface MuscleGroupInfo {
  id: string;
  nameEn: string;
  nameHi: string;
  focus: string;
  keyExercises: string[];
  activationPercentage: number;
  calorieBurnPerHour: number;
  colorHex: number;
}

const MUSCLE_GROUPS: MuscleGroupInfo[] = [
  {
    id: 'chest',
    nameEn: 'Pectorals (Chest)',
    nameHi: 'सीना (चेस्ट)',
    focus: 'Upper, Mid & Lower Chest Hypertrophy',
    keyExercises: ['Flat Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Chest Flyes', 'Dips'],
    activationPercentage: 92,
    calorieBurnPerHour: 480,
    colorHex: 0xef233c, // Clemus Crimson Red
  },
  {
    id: 'arms',
    nameEn: 'Biceps & Triceps (Arms)',
    nameHi: 'डोले (बाईसेप्स व ट्राइसेप्स)',
    focus: 'Peak Arm Thickness & Grip Power',
    keyExercises: ['Preacher EZ-Bar Curls', 'Incline Dumbbell Curls', 'Rope Tricep Pushdown', 'Skull Crushers'],
    activationPercentage: 88,
    calorieBurnPerHour: 420,
    colorHex: 0xd90429, // Clemus Dark Red
  },
  {
    id: 'abs',
    nameEn: 'Abdominals & Core',
    nameHi: 'पेट व सिक्स पैक (एब्स)',
    focus: 'Core Stability & V-Cut Shred',
    keyExercises: ['Hanging Knee/Leg Raises', 'Cable Rope Crunches', 'Ab Wheel Rollouts', 'Russian Twists'],
    activationPercentage: 85,
    calorieBurnPerHour: 400,
    colorHex: 0xff4d6d, // Bright Crimson
  },
  {
    id: 'shoulders',
    nameEn: 'Deltoids (Shoulders)',
    nameHi: 'कंधे (शोल्डर्स)',
    focus: 'Broad 3D Boulder Shoulders',
    keyExercises: ['Overhead Barbell Press', 'Dumbbell Lateral Raises', 'Rear Delt Reverse Flyes', 'Front Raises'],
    activationPercentage: 90,
    calorieBurnPerHour: 450,
    colorHex: 0xef233c, // Clemus Crimson
  },
  {
    id: 'back',
    nameEn: 'Latissimus & Traps (Back)',
    nameHi: 'चौड़ी पीठ (V-Taper बैक)',
    focus: 'Wide V-Taper Wings & Spinal Strength',
    keyExercises: ['Wide-Grip Lat Pulldowns', 'Barbell Bent-Over Rows', 'Conventional Deadlifts', 'Seated Cable Row'],
    activationPercentage: 95,
    calorieBurnPerHour: 550,
    colorHex: 0xd90429, // Clemus Dark Red
  },
  {
    id: 'legs',
    nameEn: 'Quadriceps & Glutes (Legs)',
    nameHi: 'जांघ व लेग्स (क्वाड्स)',
    focus: 'Total Lower Body Power & Explosiveness',
    keyExercises: ['Olympic Barbell Back Squats', '45° Heavy Leg Press', 'Walking Dumbbell Lunges', 'Leg Extensions'],
    activationPercentage: 98,
    calorieBurnPerHour: 620,
    colorHex: 0xef233c, // Clemus Crimson
  },
];

export const Anatomy3DCanvas: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupInfo>(MUSCLE_GROUPS[0]);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // References to dynamic meshes to highlight
  const muscleMeshesRef = useRef<Record<string, THREE.Mesh>>({});

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.4);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(0x06b6d4, 3.0);
    rimLight1.position.set(-4, 2, -2);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xf59e0b, 2.5);
    rimLight2.position.set(4, -2, -2);
    scene.add(rimLight2);

    // 5. Build 3D Athletic Figure
    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    // Base materials
    const defaultBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a2333,
      metalness: 0.6,
      roughness: 0.35,
      wireframe: isWireframe,
    });

    const createMuscleMaterial = (color: number) => {
      return new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
        wireframe: isWireframe,
      });
    };

    // Head & Neck
    const headGeo = new THREE.SphereGeometry(0.24, 32, 32);
    headGeo.scale(1, 1.2, 1.05);
    const head = new THREE.Mesh(headGeo, defaultBodyMat);
    head.position.y = 1.55;
    bodyGroup.add(head);

    const neckGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.2, 24);
    const neck = new THREE.Mesh(neckGeo, defaultBodyMat);
    neck.position.y = 1.25;
    bodyGroup.add(neck);

    // Torso / Chest
    const chestGeo = new THREE.BoxGeometry(0.85, 0.45, 0.4, 16, 16, 16);
    const chestMat = createMuscleMaterial(MUSCLE_GROUPS[0].colorHex);
    const chestMesh = new THREE.Mesh(chestGeo, chestMat);
    chestMesh.position.set(0, 0.95, 0.05);
    bodyGroup.add(chestMesh);
    muscleMeshesRef.current['chest'] = chestMesh;

    // Abdominals (Core)
    const absGeo = new THREE.BoxGeometry(0.65, 0.5, 0.35, 16, 16, 16);
    const absMat = defaultBodyMat.clone();
    const absMesh = new THREE.Mesh(absGeo, absMat);
    absMesh.position.set(0, 0.5, 0.02);
    bodyGroup.add(absMesh);
    muscleMeshesRef.current['abs'] = absMesh;

    // Back / Lats
    const backGeo = new THREE.BoxGeometry(0.95, 0.75, 0.3, 16, 16, 16);
    const backMat = defaultBodyMat.clone();
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.set(0, 0.85, -0.15);
    bodyGroup.add(backMesh);
    muscleMeshesRef.current['back'] = backMesh;

    // Shoulders (Deltoids)
    const shoulderGeo = new THREE.SphereGeometry(0.2, 24, 24);
    const shoulderMat = defaultBodyMat.clone();
    const leftShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    leftShoulder.position.set(-0.55, 1.05, 0);
    bodyGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    rightShoulder.position.set(0.55, 1.05, 0);
    bodyGroup.add(rightShoulder);
    muscleMeshesRef.current['shoulders'] = leftShoulder;

    // Arms / Biceps
    const armGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.55, 24);
    const armMat = defaultBodyMat.clone();
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.62, 0.65, 0);
    bodyGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.62, 0.65, 0);
    bodyGroup.add(rightArm);
    muscleMeshesRef.current['arms'] = leftArm;

    // Forearms
    const forearmGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 24);
    const leftForearm = new THREE.Mesh(forearmGeo, defaultBodyMat);
    leftForearm.position.set(-0.62, 0.1, 0);
    bodyGroup.add(leftForearm);

    const rightForearm = new THREE.Mesh(forearmGeo, defaultBodyMat);
    rightForearm.position.set(0.62, 0.1, 0);
    bodyGroup.add(rightForearm);

    // Hips
    const hipsGeo = new THREE.BoxGeometry(0.68, 0.25, 0.35, 16, 16, 16);
    const hips = new THREE.Mesh(hipsGeo, defaultBodyMat);
    hips.position.set(0, 0.12, 0);
    bodyGroup.add(hips);

    // Legs / Thighs
    const thighGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.75, 24);
    const legMat = defaultBodyMat.clone();
    const leftThigh = new THREE.Mesh(thighGeo, legMat);
    leftThigh.position.set(-0.22, -0.38, 0);
    bodyGroup.add(leftThigh);

    const rightThigh = new THREE.Mesh(thighGeo, legMat);
    rightThigh.position.set(0.22, -0.38, 0);
    bodyGroup.add(rightThigh);
    muscleMeshesRef.current['legs'] = leftThigh;

    // Calves
    const calfGeo = new THREE.CylinderGeometry(0.13, 0.09, 0.7, 24);
    const leftCalf = new THREE.Mesh(calfGeo, defaultBodyMat);
    leftCalf.position.set(-0.22, -1.05, 0);
    bodyGroup.add(leftCalf);

    const rightCalf = new THREE.Mesh(calfGeo, defaultBodyMat);
    rightCalf.position.set(0.22, -1.05, 0);
    bodyGroup.add(rightCalf);

    // 6. Glowing Holographic Grid Floor Platform
    const platformGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.08, 48);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -1.45;
    scene.add(platform);

    const floorRingGeo = new THREE.TorusGeometry(1.6, 0.02, 16, 64);
    const floorRingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const floorRing = new THREE.Mesh(floorRingGeo, floorRingMat);
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = -1.41;
    scene.add(floorRing);

    // 7. Ambient Particle Field
    const pCount = 140;
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
      pPositions[i] = (Math.random() - 0.5) * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.025, color: 0x06b6d4, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 8. Animation & Interaction Loop
    let animId: number;
    let isDragging = false;
    let prevMouseX = 0;
    let rotSpeed = 0.006;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        bodyGroup.rotation.y += deltaX * 0.01;
        prevMouseX = e.clientX;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        bodyGroup.rotation.y += deltaX * 0.01;
        prevMouseX = e.touches[0].clientX;
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (autoRotate && !isDragging) {
        bodyGroup.rotation.y += rotSpeed;
      }

      floorRing.rotation.z = elapsed * 0.2;
      particles.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 500;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isWireframe]);

  // Handle active muscle selection to change mesh colors
  useEffect(() => {
    Object.keys(muscleMeshesRef.current).forEach((key) => {
      const mesh = muscleMeshesRef.current[key];
      if (mesh) {
        const isTarget = key === selectedMuscle.id;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (isTarget) {
          mat.color.setHex(selectedMuscle.colorHex);
          mat.emissive.setHex(selectedMuscle.colorHex);
          mat.emissiveIntensity = 0.75;
          mat.roughness = 0.2;
        } else {
          mat.color.setHex(0x1a2333);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.roughness = 0.4;
        }
      }
    });
  }, [selectedMuscle]);

  return (
    <div className="bg-gradient-to-br from-gym-card via-slate-900 to-gym-dark border border-gym-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-gym-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gym-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-gym-cyan text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive 3D Muscle Anatomy • 3D बॉडी एनाटॉमी
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-100 uppercase tracking-tight">
          Target Every Muscle Group <span className="text-gym-gold">in 3D</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Click any muscle group below to highlight it on the real-time 3D athletic avatar, view biomechanics, and discover Kanker's targeted workout splits.
        </p>
      </div>

      {/* Main 3D Canvas + Info Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left Column: Interactive 3D Canvas */}
        <div className="lg:col-span-7 relative h-[420px] sm:h-[500px] rounded-2xl bg-slate-950/60 border border-slate-800/80 overflow-hidden flex flex-col justify-between">
          {/* Top Canvas Controls Bar */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[11px] text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Three.js WebGL Engine</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWireframe(!isWireframe)}
                title="Toggle Wireframe Shader"
                className={`p-1.5 rounded-lg border text-xs transition-all ${
                  isWireframe
                    ? 'bg-gym-cyan text-black border-gym-cyan font-bold'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                title="Toggle 360° Auto-Rotation"
                className={`p-1.5 rounded-lg border text-xs transition-all ${
                  autoRotate
                    ? 'bg-gym-gold text-black border-gym-gold font-bold'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Three.js Canvas Mount */}
          <div ref={canvasContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Drag instruction overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-y-0 -translate-x-1/2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400 font-semibold pointer-events-none">
            Drag mouse/finger to rotate model 360°
          </div>
        </div>

        {/* Right Column: Muscle Selector Tabs & Exercise Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Muscle Selector Button Chips */}
          <div className="grid grid-cols-3 gap-2">
            {MUSCLE_GROUPS.map((mg) => {
              const isSelected = mg.id === selectedMuscle.id;
              return (
                <button
                  key={mg.id}
                  onClick={() => setSelectedMuscle(mg)}
                  className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#1A1D2E] border-[#EF233C] text-white shadow-lg shadow-[#EF233C]/20'
                      : 'bg-[#11131C] border-[#2B2F48] text-[#8D99AE] hover:text-white hover:border-[#8D99AE]/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isSelected ? '#ef233c' : '#8d99ae' }}
                    />
                    <span className="text-xs font-black truncate">{mg.nameEn.split(' ')[0]}</span>
                  </div>
                  <div className="text-[10px] text-[#8D99AE] truncate">{mg.nameHi.split(' ')[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Selected Muscle Deep-Dive Card */}
          <div className="bg-[#11131C] border border-[#2B2F48] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-[#2B2F48] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#EF233C] tracking-wider">
                  Active 3D Focus
                </span>
                <h3 className="text-xl font-black font-exo text-white mt-0.5">
                  {selectedMuscle.nameEn}
                </h3>
                <div className="text-xs text-[#8D99AE] font-semibold">{selectedMuscle.nameHi}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-[#8D99AE] font-bold block">Burn Rate</span>
                <span className="text-base font-black font-mono text-[#EF233C] flex items-center justify-end gap-1">
                  <Flame className="w-4 h-4 text-[#EF233C]" />
                  ~{selectedMuscle.calorieBurnPerHour} <span className="text-[10px] font-normal text-[#8D99AE]">kcal/hr</span>
                </span>
              </div>
            </div>

            {/* Muscle Activation Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#8D99AE] font-medium">Neural Hypertrophy Activation:</span>
                <span className="font-bold font-mono text-[#EF233C]">{selectedMuscle.activationPercentage}% Peak</span>
              </div>
              <div className="w-full bg-[#1A1D2E] h-2 rounded-full overflow-hidden border border-[#2B2F48]">
                <div
                  className="bg-gradient-to-r from-[#D90429] to-[#EF233C] h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedMuscle.activationPercentage}%` }}
                />
              </div>
            </div>

            {/* Targeted Exercises Recommended by Coach Vikram */}
            <div>
              <span className="text-xs font-bold font-exo text-white uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Dumbbell className="w-3.5 h-3.5 text-[#EF233C]" />
                Kaushik Gym Target Exercises:
              </span>
              <ul className="space-y-1.5 text-xs">
                {selectedMuscle.keyExercises.map((ex, idx) => (
                  <li
                    key={idx}
                    className="p-2 rounded-lg bg-[#1A1D2E] border border-[#2B2F48] flex items-center justify-between text-slate-200"
                  >
                    <span className="font-semibold">{ex}</span>
                    <span className="text-[10px] font-mono text-[#EF233C] bg-[#EF233C]/10 px-2 py-0.5 rounded border border-[#EF233C]/30">
                      4 Sets x 10-12
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
