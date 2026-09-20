import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Dumbbell,
  RotateCw,
  Flame,
  Zap,
  Activity,
  Maximize2,
  ChevronRight,
  Eye,
  Sliders,
  Check,
  Play
} from 'lucide-react';

export type WorkoutExercise = 'curls' | 'squats' | 'press' | 'flex' | 'breathing';

interface ExerciseDetail {
  id: WorkoutExercise;
  nameEn: string;
  nameHi: string;
  targetMuscle: string;
  tempo: string;
  calorieBurn: string;
  description: string;
}

const EXERCISES: ExerciseDetail[] = [
  {
    id: 'curls',
    nameEn: 'Bicep Dumbbell Curls',
    nameHi: 'बाईसेप्स कर्ल (डोले)',
    targetMuscle: 'Biceps Brachii & Brachialis',
    tempo: '2s Concentric • 2s Eccentric',
    calorieBurn: '480 kcal/hr',
    description: 'Isolation movement focusing on the bicep peak. Full elbow flexion with supination at the top of the lift.',
  },
  {
    id: 'squats',
    nameEn: 'Olympic Free Squats',
    nameHi: 'स्क्वॉट (जांघ व लेग्स)',
    targetMuscle: 'Quadriceps, Glutes & Hamstrings',
    tempo: '3s Down • 1s Explosive Up',
    calorieBurn: '650 kcal/hr',
    description: 'King of all compound movements. Deep 90-degree hip hinge recruiting maximum lower body muscle fibers.',
  },
  {
    id: 'press',
    nameEn: 'Overhead Shoulder Press',
    nameHi: 'शोल्डर प्रेस (कंधे)',
    targetMuscle: 'Anterior & Lateral Deltoids',
    tempo: '2s Up • 2s Controlled Down',
    calorieBurn: '520 kcal/hr',
    description: 'Vertical push mechanics building 3D rounded shoulders and upper chest clavicular fullness.',
  },
  {
    id: 'flex',
    nameEn: 'Double Biceps Champion Flex',
    nameHi: 'बॉडीबिल्डिंग पोज़ (फ्लेक्स)',
    targetMuscle: 'Full Upper Body Isometric',
    tempo: 'Isometric Peak Hold',
    calorieBurn: '350 kcal/hr',
    description: 'Classic IFBB championship pose displaying bicep peaks, latissimus V-taper flare, and abdominal vacuum.',
  },
  {
    id: 'breathing',
    nameEn: 'Athletic Stance & Cardio Recovery',
    nameHi: 'एथलेटिक स्टेंस व ब्रीदिंग',
    targetMuscle: 'Diaphragm, Intercostals & Core',
    tempo: 'Rhythmic Deep Respiration',
    calorieBurn: '250 kcal/hr',
    description: 'Post-set heart rate regulation through diaphragmatic ribcage expansion and neural recovery.',
  },
];

export const HumanAthlete3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentExercise, setCurrentExercise] = useState<WorkoutExercise>('curls');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [repCount, setRepCount] = useState<number>(0);
  const [autoRotateCamera, setAutoRotateCamera] = useState<boolean>(false);

  const activeExerciseRef = useRef<WorkoutExercise>('curls');
  const speedRef = useRef<number>(1.0);
  const heatmapRef = useRef<boolean>(true);
  const repCountRef = useRef<number>(0);

  useEffect(() => {
    activeExerciseRef.current = currentExercise;
  }, [currentExercise]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    heatmapRef.current = showHeatmap;
  }, [showHeatmap]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f111a, 0.04);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 4.2);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting (Clemus Crimson & Soft Rim Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key front light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
    keyLight.position.set(2, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Clemus Signature Crimson Red Accent Rim Light (#EF233C)
    const crimsonRimLight = new THREE.DirectionalLight(0xef233c, 4.0);
    crimsonRimLight.position.set(-4, 3, -2);
    scene.add(crimsonRimLight);

    // Dark Charcoal / Blue Back Rim (#2B2D42)
    const blueRimLight = new THREE.DirectionalLight(0x4a5578, 2.0);
    blueRimLight.position.set(3, 2, -3);
    scene.add(blueRimLight);

    // Top gym ceiling spot
    const topSpot = new THREE.PointLight(0xffffff, 1.8, 10);
    topSpot.position.set(0, 4, 1.5);
    scene.add(topSpot);

    // 5. Training Floor Grid (Clemus styled dark floor with crimson accents)
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x11131c,
      roughness: 0.85,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Circular neon ring on floor in Clemus red
    const ringGeo = new THREE.RingGeometry(1.6, 1.66, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef233c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    scene.add(ring);

    // 6. Realistic Human Athlete Model Construction
    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xd69974, // Natural warm athletic skin tone
      roughness: 0.55,
      metalness: 0.08,
    });

    const muscleHeatmapMaterial = new THREE.MeshStandardMaterial({
      color: 0xef233c, // Clemus red heat glow
      emissive: 0xef233c,
      emissiveIntensity: 0.65,
      roughness: 0.4,
    });

    const shortsMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c2033, // Dark charcoal gym shorts
      roughness: 0.8,
      metalness: 0.1,
    });

    const stripeMaterial = new THREE.MeshBasicMaterial({
      color: 0xef233c, // Clemus crimson stripe
    });

    const shoesMaterial = new THREE.MeshStandardMaterial({
      color: 0x11131c,
      roughness: 0.5,
      metalness: 0.3,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.95,
      roughness: 0.15,
    });

    const weightPlateMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2430,
      metalness: 0.7,
      roughness: 0.35,
    });

    // Root Group
    const athleteRoot = new THREE.Group();
    athleteRoot.position.set(0, 0, 0);
    scene.add(athleteRoot);

    // Dynamic Nodes for Kinematics & Animation
    const pelvisNode = new THREE.Group();
    pelvisNode.position.set(0, 1.0, 0);
    athleteRoot.add(pelvisNode);

    // Torso / Spine Group (attached to pelvis)
    const spineNode = new THREE.Group();
    pelvisNode.add(spineNode);

    // --- PELVIS & SHORTS ---
    const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.26, 16);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, shortsMaterial);
    pelvisMesh.position.y = 0;
    pelvisNode.add(pelvisMesh);

    // Shorts Clemus Stripe
    const stripeGeo = new THREE.BoxGeometry(0.02, 0.26, 0.46);
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMaterial);
    pelvisMesh.add(stripeMesh);

    // --- TORSO (MUSCULAR CHEST, ABS, LATS) ---
    // Lower Torso / Core (Abs)
    const lowerTorsoGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.28, 16);
    const lowerTorsoMesh = new THREE.Mesh(lowerTorsoGeo, skinMaterial);
    lowerTorsoMesh.position.y = 0.26;
    spineNode.add(lowerTorsoMesh);

    // 6-Pack Rectus Abdominis Detail Meshes
    const absGroup = new THREE.Group();
    lowerTorsoMesh.add(absGroup);
    const abCubeGeo = new THREE.BoxGeometry(0.08, 0.06, 0.04);
    const absMeshes: THREE.Mesh[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        const abMesh = new THREE.Mesh(abCubeGeo, skinMaterial);
        abMesh.position.set(c === 0 ? -0.05 : 0.05, 0.08 - r * 0.08, 0.21);
        absGroup.add(abMesh);
        absMeshes.push(abMesh);
      }
    }

    // Upper Torso / Chest & Ribcage
    const upperTorsoGeo = new THREE.CylinderGeometry(0.32, 0.25, 0.36, 16);
    const upperTorsoMesh = new THREE.Mesh(upperTorsoGeo, skinMaterial);
    upperTorsoMesh.position.y = 0.54;
    spineNode.add(upperTorsoMesh);

    // Defined Pectoralis Major Plates (Left & Right Chest)
    const chestGeo = new THREE.BoxGeometry(0.18, 0.16, 0.12);
    const leftChestMesh = new THREE.Mesh(chestGeo, skinMaterial);
    leftChestMesh.position.set(-0.11, 0.06, 0.18);
    leftChestMesh.rotation.y = 0.12;
    upperTorsoMesh.add(leftChestMesh);

    const rightChestMesh = new THREE.Mesh(chestGeo, skinMaterial);
    rightChestMesh.position.set(0.11, 0.06, 0.18);
    rightChestMesh.rotation.y = -0.12;
    upperTorsoMesh.add(rightChestMesh);

    // --- NECK & SCULPTED HEAD ---
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.14, 16);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.y = 0.24;
    upperTorsoMesh.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.16;
    neckMesh.add(headGroup);

    // Cranium
    const headGeo = new THREE.SphereGeometry(0.13, 20, 20);
    headGeo.scale(0.9, 1.15, 1.0);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headGroup.add(headMesh);

    // Jaw / Chin
    const jawGeo = new THREE.BoxGeometry(0.12, 0.1, 0.14);
    const jawMesh = new THREE.Mesh(jawGeo, skinMaterial);
    jawMesh.position.set(0, -0.06, 0.06);
    headGroup.add(jawMesh);

    // Athletic Haircut
    const hairGeo = new THREE.SphereGeometry(0.136, 16, 16);
    hairGeo.scale(0.92, 1.0, 1.02);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.04, -0.02);
    headGroup.add(hairMesh);

    // --- SHOULDERS & ARMS (KINEMATIC CHAIN) ---
    // Helper to build Dumbbell
    const createDumbbell = () => {
      const dbGroup = new THREE.Group();
      // Handle
      const handleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.28, 12);
      const handle = new THREE.Mesh(handleGeo, chromeMaterial);
      handle.rotation.z = Math.PI / 2;
      dbGroup.add(handle);

      // Plates Left & Right
      [-0.12, 0.12].forEach((offset) => {
        const plateGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.035, 16);
        const plate = new THREE.Mesh(plateGeo, weightPlateMaterial);
        plate.rotation.z = Math.PI / 2;
        plate.position.x = offset;
        dbGroup.add(plate);

        // Gold/Red Accent Ring on plate
        const ringAccentGeo = new THREE.TorusGeometry(0.075, 0.005, 8, 24);
        const ringAccent = new THREE.Mesh(ringAccentGeo, stripeMaterial);
        ringAccent.rotation.y = Math.PI / 2;
        ringAccent.position.x = offset + (offset > 0 ? 0.02 : -0.02);
        dbGroup.add(ringAccent);
      });
      return dbGroup;
    };

    // Left Arm Hierarchy
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.35, 0.12, 0);
    upperTorsoMesh.add(leftShoulder);

    const leftDeltoidMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), skinMaterial);
    leftShoulder.add(leftDeltoidMesh);

    const leftUpperArm = new THREE.Group();
    leftUpperArm.position.set(-0.04, -0.08, 0);
    leftShoulder.add(leftUpperArm);

    // Upper arm mesh
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.26, 16);
    const leftUpperArmMesh = new THREE.Mesh(armGeo, skinMaterial);
    leftUpperArmMesh.position.y = -0.13;
    leftUpperArm.add(leftUpperArmMesh);

    // Left Bicep Peak Muscle (scalable on curl contraction)
    const leftBicepGeo = new THREE.SphereGeometry(0.075, 16, 16);
    leftBicepGeo.scale(1.0, 1.4, 1.1);
    const leftBicepMesh = new THREE.Mesh(leftBicepGeo, skinMaterial);
    leftBicepMesh.position.set(0, -0.11, 0.04);
    leftUpperArm.add(leftBicepMesh);

    // Left Forearm & Hand
    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.27, 0);
    leftUpperArm.add(leftElbow);

    const forearmGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.25, 16);
    const leftForearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
    leftForearmMesh.position.y = -0.12;
    leftElbow.add(leftForearmMesh);

    const leftHand = new THREE.Group();
    leftHand.position.set(0, -0.25, 0);
    leftElbow.add(leftHand);

    const leftHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.05), skinMaterial);
    leftHand.add(leftHandMesh);

    const leftDumbbell = createDumbbell();
    leftHand.add(leftDumbbell);

    // Right Arm Hierarchy
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.35, 0.12, 0);
    upperTorsoMesh.add(rightShoulder);

    const rightDeltoidMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), skinMaterial);
    rightShoulder.add(rightDeltoidMesh);

    const rightUpperArm = new THREE.Group();
    rightUpperArm.position.set(0.04, -0.08, 0);
    rightShoulder.add(rightUpperArm);

    const rightUpperArmMesh = new THREE.Mesh(armGeo, skinMaterial);
    rightUpperArmMesh.position.y = -0.13;
    rightUpperArm.add(rightUpperArmMesh);

    const rightBicepGeo = new THREE.SphereGeometry(0.075, 16, 16);
    rightBicepGeo.scale(1.0, 1.4, 1.1);
    const rightBicepMesh = new THREE.Mesh(rightBicepGeo, skinMaterial);
    rightBicepMesh.position.set(0, -0.11, 0.04);
    rightUpperArm.add(rightBicepMesh);

    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.27, 0);
    rightUpperArm.add(rightElbow);

    const rightForearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
    rightForearmMesh.position.y = -0.12;
    rightElbow.add(rightForearmMesh);

    const rightHand = new THREE.Group();
    rightHand.position.set(0, -0.25, 0);
    rightElbow.add(rightHand);

    const rightHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.05), skinMaterial);
    rightHand.add(rightHandMesh);

    const rightDumbbell = createDumbbell();
    rightHand.add(rightDumbbell);

    // --- LEGS & FEET ---
    // Left Leg
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.14, -0.12, 0);
    pelvisNode.add(leftHip);

    const thighGeo = new THREE.CylinderGeometry(0.11, 0.08, 0.44, 16);
    const leftThighMesh = new THREE.Mesh(thighGeo, skinMaterial);
    leftThighMesh.position.y = -0.22;
    leftHip.add(leftThighMesh);

    // Vastus Medialis (Teardrop quad contour)
    const quadTeardrop = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), skinMaterial);
    quadTeardrop.position.set(0.04, -0.32, 0.08);
    leftHip.add(quadTeardrop);

    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -0.44, 0);
    leftHip.add(leftKnee);

    const calfGeo = new THREE.CylinderGeometry(0.085, 0.06, 0.42, 16);
    const leftCalfMesh = new THREE.Mesh(calfGeo, skinMaterial);
    leftCalfMesh.position.y = -0.21;
    leftKnee.add(leftCalfMesh);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), shoesMaterial);
    leftFoot.position.set(0, -0.42, 0.05);
    leftKnee.add(leftFoot);

    // Right Leg
    const rightHip = new THREE.Group();
    rightHip.position.set(0.14, -0.12, 0);
    pelvisNode.add(rightHip);

    const rightThighMesh = new THREE.Mesh(thighGeo, skinMaterial);
    rightThighMesh.position.y = -0.22;
    rightHip.add(rightThighMesh);

    const rightQuadTeardrop = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), skinMaterial);
    rightQuadTeardrop.position.set(-0.04, -0.32, 0.08);
    rightHip.add(rightQuadTeardrop);

    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -0.44, 0);
    rightHip.add(rightKnee);

    const rightCalfMesh = new THREE.Mesh(calfGeo, skinMaterial);
    rightCalfMesh.position.y = -0.21;
    rightKnee.add(rightCalfMesh);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), shoesMaterial);
    rightFoot.position.set(0, -0.42, 0.05);
    rightKnee.add(rightFoot);

    // 7. Mouse Orbit Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.004;
      targetRotationX = Math.max(-0.4, Math.min(0.5, targetRotationX));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.004;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 8. Kinetic Workout Animation Engine (60 FPS Procedural Loop)
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let prevCyclePhase = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime() * speedRef.current;
      const exercise = activeExerciseRef.current;
      const isHeatmapOn = heatmapRef.current;

      // Camera Orbit Interpolation
      athleteRoot.rotation.y += (targetRotationY - athleteRoot.rotation.y) * 0.08;
      athleteRoot.rotation.x += (targetRotationX - athleteRoot.rotation.x) * 0.08;

      if (autoRotateCamera && !isDragging) {
        targetRotationY += 0.005;
      }

      // Reset base poses
      pelvisNode.position.y = 1.0;
      pelvisNode.rotation.set(0, 0, 0);
      spineNode.rotation.set(0, 0, 0);
      leftHip.rotation.set(0, 0, 0);
      rightHip.rotation.set(0, 0, 0);
      leftKnee.rotation.set(0, 0, 0);
      rightKnee.rotation.set(0, 0, 0);
      leftShoulder.rotation.set(0, 0, 0);
      rightShoulder.rotation.set(0, 0, 0);
      leftUpperArm.rotation.set(0, 0, 0);
      rightUpperArm.rotation.set(0, 0, 0);
      leftElbow.rotation.set(0, 0, 0);
      rightElbow.rotation.set(0, 0, 0);
      leftHand.rotation.set(0, 0, 0);
      rightHand.rotation.set(0, 0, 0);

      // Default material resets
      leftBicepMesh.material = skinMaterial;
      rightBicepMesh.material = skinMaterial;
      leftDeltoidMesh.material = skinMaterial;
      rightDeltoidMesh.material = skinMaterial;
      leftThighMesh.material = skinMaterial;
      rightThighMesh.material = skinMaterial;
      leftChestMesh.material = skinMaterial;
      rightChestMesh.material = skinMaterial;

      // Reset bicep scale
      leftBicepMesh.scale.set(1.0, 1.4, 1.1);
      rightBicepMesh.scale.set(1.0, 1.4, 1.1);

      // Animation Cycles
      if (exercise === 'curls') {
        // --- 1. BICEP DUMBBELL CURLS ---
        const cycleSpeed = 2.4;
        const phase = (Math.sin(time * cycleSpeed) + 1) / 2; // 0 (bottom) to 1 (peak top)

        // Rep Counter logic (at bottom of stroke)
        if (phase < 0.1 && prevCyclePhase >= 0.1) {
          repCountRef.current += 1;
          setRepCount(repCountRef.current);
        }
        prevCyclePhase = phase;

        // Arm posture
        leftUpperArm.rotation.x = 0.1;
        rightUpperArm.rotation.x = 0.1;

        // Elbow curl angle up to 135 degrees (2.35 rad)
        const curlAngle = 0.2 + phase * 2.15;
        leftElbow.rotation.x = curlAngle;
        rightElbow.rotation.x = curlAngle;

        // Supination rotation on forearms
        leftElbow.rotation.y = phase * 0.4;
        rightElbow.rotation.y = -phase * 0.4;

        // Dynamic Bicep Bulge contraction!
        const bicepBulge = 1.0 + phase * 0.35;
        leftBicepMesh.scale.set(bicepBulge, 1.4 * bicepBulge, 1.1 * bicepBulge);
        rightBicepMesh.scale.set(bicepBulge, 1.4 * bicepBulge, 1.1 * bicepBulge);

        // Slight torso stabilization sway
        spineNode.rotation.x = -phase * 0.06;

        // Heatmap glow on active biceps
        if (isHeatmapOn) {
          leftBicepMesh.material = muscleHeatmapMaterial;
          rightBicepMesh.material = muscleHeatmapMaterial;
          muscleHeatmapMaterial.emissiveIntensity = 0.4 + phase * 0.6;
        }

      } else if (exercise === 'squats') {
        // --- 2. OLYMPIC SQUATS ---
        const cycleSpeed = 1.8;
        const phase = (Math.sin(time * cycleSpeed) + 1) / 2; // 0 (standing) to 1 (deep bottom)

        if (phase < 0.1 && prevCyclePhase >= 0.1) {
          repCountRef.current += 1;
          setRepCount(repCountRef.current);
        }
        prevCyclePhase = phase;

        // Pelvis drops down
        pelvisNode.position.y = 1.0 - phase * 0.42;

        // Hips hinge back, knees bend forward to 90 degrees
        const hipFlex = phase * 1.5;
        const kneeFlex = phase * 1.55;

        leftHip.rotation.x = -hipFlex;
        rightHip.rotation.x = -hipFlex;
        leftKnee.rotation.x = kneeFlex;
        rightKnee.rotation.x = kneeFlex;

        // Torso counter-balance lean forward
        spineNode.rotation.x = phase * 0.42;

        // Arms holding dumbbells at side or forward for balance
        leftShoulder.rotation.x = phase * 0.6;
        rightShoulder.rotation.x = phase * 0.6;
        leftElbow.rotation.x = 0.3;
        rightElbow.rotation.x = 0.3;

        // Heatmap glow on quads
        if (isHeatmapOn) {
          leftThighMesh.material = muscleHeatmapMaterial;
          rightThighMesh.material = muscleHeatmapMaterial;
          muscleHeatmapMaterial.emissiveIntensity = 0.4 + phase * 0.6;
        }

      } else if (exercise === 'press') {
        // --- 3. OVERHEAD SHOULDER PRESS ---
        const cycleSpeed = 2.0;
        const phase = (Math.sin(time * cycleSpeed) + 1) / 2; // 0 (at clavicle) to 1 (lockout overhead)

        if (phase < 0.1 && prevCyclePhase >= 0.1) {
          repCountRef.current += 1;
          setRepCount(repCountRef.current);
        }
        prevCyclePhase = phase;

        // Shoulder abduction and overhead press rotation
        leftShoulder.rotation.z = -(1.2 + phase * 0.5);
        rightShoulder.rotation.z = 1.2 + phase * 0.5;

        leftUpperArm.rotation.x = phase * 0.4;
        rightUpperArm.rotation.x = phase * 0.4;

        // Elbow extending from 90 degrees to overhead extension
        leftElbow.rotation.x = 1.5 - phase * 1.25;
        rightElbow.rotation.x = 1.5 - phase * 1.25;

        // Heatmap on deltoids & upper chest
        if (isHeatmapOn) {
          leftDeltoidMesh.material = muscleHeatmapMaterial;
          rightDeltoidMesh.material = muscleHeatmapMaterial;
          leftChestMesh.material = muscleHeatmapMaterial;
          rightChestMesh.material = muscleHeatmapMaterial;
          muscleHeatmapMaterial.emissiveIntensity = 0.3 + phase * 0.7;
        }

      } else if (exercise === 'flex') {
        // --- 4. DOUBLE BICEPS CHAMPION FLEX POSE ---
        const pulse = Math.sin(time * 3.5) * 0.05;

        // Raise arms to 90 degrees
        leftShoulder.rotation.z = -1.55;
        rightShoulder.rotation.z = 1.55;

        // Elbows at 90 degrees flexion
        leftElbow.rotation.x = 1.55 + pulse;
        rightElbow.rotation.x = 1.55 + pulse;

        // Peak bicep contract scale
        leftBicepMesh.scale.set(1.4, 1.8, 1.4);
        rightBicepMesh.scale.set(1.4, 1.8, 1.4);

        // Chest proud & expanded
        spineNode.rotation.x = -0.12;
        leftChestMesh.scale.set(1.15, 1.15, 1.2);
        rightChestMesh.scale.set(1.15, 1.15, 1.2);

        if (isHeatmapOn) {
          leftBicepMesh.material = muscleHeatmapMaterial;
          rightBicepMesh.material = muscleHeatmapMaterial;
          leftChestMesh.material = muscleHeatmapMaterial;
          rightChestMesh.material = muscleHeatmapMaterial;
          muscleHeatmapMaterial.emissiveIntensity = 0.85;
        }

      } else if (exercise === 'breathing') {
        // --- 5. ATHLETIC STANCE & CARDIO BREATHING ---
        const breathCycle = Math.sin(time * 1.8);
        const breathPhase = (breathCycle + 1) / 2;

        // Arms resting naturally at sides with dumbbells
        leftShoulder.rotation.z = -0.18;
        rightShoulder.rotation.z = 0.18;
        leftElbow.rotation.x = 0.15;
        rightElbow.rotation.x = 0.15;

        // Chest expanding on inhalation
        const chestScale = 1.0 + breathPhase * 0.12;
        upperTorsoMesh.scale.set(chestScale, 1.0, chestScale);

        // Subtle head scan
        headGroup.rotation.y = Math.sin(time * 0.8) * 0.15;
        spineNode.position.y = Math.sin(time * 1.5) * 0.02;

        if (isHeatmapOn) {
          absMeshes.forEach((m) => {
            m.material = muscleHeatmapMaterial;
          });
          muscleHeatmapMaterial.emissiveIntensity = 0.2 + breathPhase * 0.4;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, [autoRotateCamera]);

  const activeDetail = EXERCISES.find((e) => e.id === currentExercise) || EXERCISES[0];

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#161926] to-[#0F111A] border border-[#2B2F48] overflow-hidden shadow-2xl">
      
      {/* Top Banner & Telemetry Header */}
      <div className="p-4 sm:p-5 border-b border-[#2B2F48] flex flex-wrap items-center justify-between gap-3 bg-[#11131C]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EF233C]/20 border border-[#EF233C]/40 flex items-center justify-center text-[#EF233C] shadow-lg shadow-[#EF233C]/20">
            <Flame className="w-5 h-5 fill-[#EF233C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-exo font-black text-sm sm:text-base tracking-wider uppercase text-white">
                REALISTIC 3D ATHLETE MOTION ENGINE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EF233C] text-white">
                LIVE 60 FPS
              </span>
            </div>
            <p className="text-[11px] text-[#8D99AE] font-mono">
              Biomechanical Kinematics • Dynamic Muscle Contraction & Hypertrophy
            </p>
          </div>
        </div>

        {/* Repetition Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#1A1D2E] border border-[#2B2F48] flex items-center gap-2 font-mono text-xs">
            <span className="text-[#8D99AE]">COMPLETED REPS:</span>
            <span className="text-xl font-black font-exo text-[#EF233C]">{repCount}</span>
          </div>

          <button
            onClick={() => setAutoRotateCamera(!autoRotateCamera)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              autoRotateCamera
                ? 'bg-[#EF233C] text-white border-[#EF233C]'
                : 'bg-[#1A1D2E] border-[#2B2F48] text-[#8D99AE] hover:text-white'
            }`}
            title="Auto 360° Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative w-full h-[460px] sm:h-[520px]">
        
        {/* Three.js Container */}
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          title="Drag with mouse or touch to rotate athlete 360°"
        />

        {/* Floating Exercise Telemetry Overlay (Top Left) */}
        <div className="absolute top-4 left-4 max-w-xs p-3.5 rounded-2xl bg-[#11131C]/90 border border-[#2B2F48] backdrop-blur-md space-y-1.5 pointer-events-none shadow-xl">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#EF233C] uppercase tracking-wider">
            <Activity className="w-3 h-3" />
            <span>ACTIVE WORKOUT PROTOCOL</span>
          </div>
          <div className="font-exo font-black text-sm uppercase text-white">
            {activeDetail.nameEn}
          </div>
          <p className="text-[11px] text-[#8D99AE] leading-snug">
            {activeDetail.nameHi}
          </p>
          <div className="pt-1.5 border-t border-[#2B2F48] flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#8D99AE]">TARGET:</span>
            <span className="text-white font-bold">{activeDetail.targetMuscle}</span>
          </div>
        </div>

        {/* Floating Quick Controls Overlay (Top Right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5 ${
              showHeatmap
                ? 'bg-[#EF233C] border-[#EF233C] text-white shadow-[#EF233C]/30'
                : 'bg-[#11131C]/80 border-[#2B2F48] text-[#8D99AE] hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Muscle Heatmap</span>
          </button>

          {/* Speed Multiplier Pill */}
          <div className="flex items-center rounded-xl bg-[#11131C]/80 border border-[#2B2F48] p-0.5 text-[10px] font-mono">
            {[0.5, 1.0, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  speedMultiplier === spd
                    ? 'bg-[#EF233C] text-white'
                    : 'text-[#8D99AE] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* 360° Drag Indicator Pill (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#11131C]/80 border border-[#2B2F48] backdrop-blur-md text-[10px] font-mono text-[#8D99AE] pointer-events-none flex items-center gap-1.5">
          <RotateCw className="w-3 h-3 text-[#EF233C]" />
          <span>DRAG MOUSE TO ROTATE ATHLETE 360°</span>
        </div>

      </div>

      {/* Bottom Exercise Selector Bar */}
      <div className="p-4 sm:p-5 border-t border-[#2B2F48] bg-[#11131C] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-exo font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#EF233C]" />
            SELECT WORKOUT MOVEMENT TO ANIMATE:
          </span>
          <span className="text-[11px] font-mono text-[#8D99AE]">
            Burn Rate: <strong className="text-white">{activeDetail.calorieBurn}</strong>
          </span>
        </div>

        {/* 5 Exercise Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {EXERCISES.map((ex) => {
            const isActive = currentExercise === ex.id;
            return (
              <button
                key={ex.id}
                onClick={() => {
                  setCurrentExercise(ex.id);
                  setRepCount(0);
                  repCountRef.current = 0;
                }}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isActive
                    ? 'bg-[#EF233C] text-white border-[#EF233C] shadow-lg shadow-[#EF233C]/25 -translate-y-0.5'
                    : 'bg-[#1A1D2E] border-[#2B2F48] text-[#8D99AE] hover:text-white hover:border-[#8D99AE]/40'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className={isActive ? 'text-white/80' : 'text-[#8D99AE]'}>
                    {ex.tempo.split('•')[0]}
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="font-exo font-bold text-xs uppercase leading-tight">
                  {ex.nameEn}
                </div>
                <div className={`text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'text-[#8D99AE]'}`}>
                  {ex.nameHi}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
