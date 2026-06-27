import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { audioManager } from '../lib/audioManager';

interface StudyBuddy3DProps {
  stressLevel: number;
}

export const StudyBuddy3D: React.FC<StudyBuddy3DProps> = ({ stressLevel }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const robotRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const hoverRingRef = useRef<THREE.Mesh | null>(null);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const spinAngleRef = useRef(0);
  const isSpinningRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup ThreeJS Scene
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    
    // Transparent background to blend with CSS nebula background
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    // Dynamic accent mood light corresponding to state
    const colorTheme = stressLevel > 0.7 ? 0xf97316 : 0x06b6d4; // Orange vs Cyan
    const accentLight = new THREE.PointLight(colorTheme, 2.5, 12);
    accentLight.position.set(-3, -2, 2);
    scene.add(accentLight);

    // 3. Construct Robotic "Study Buddy" Procedurally
    const robotGroup = new THREE.Group();

    // High fidelity physical materials
    const metallicWhite = new THREE.MeshPhysicalMaterial({
      color: 0xf3f4f6,
      metalness: 0.8,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const glossyDark = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.1,
    });

    const glowColor = stressLevel > 0.7 ? 0xff5722 : 0x00e5ff;
    const glowingNeon = new THREE.MeshBasicMaterial({
      color: glowColor,
    });

    const goldAccent = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.2,
    });

    // Torso: Capsule shape
    const bodyGeom = new THREE.CylinderGeometry(0.7, 0.6, 1.4, 32);
    // Round out the top and bottom of cylinder using sphere caps
    const capGeom = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    
    const bodyMesh = new THREE.Mesh(bodyGeom, metallicWhite);
    bodyMesh.position.y = 0;
    
    const topCap = new THREE.Mesh(capGeom, metallicWhite);
    topCap.position.y = 0.7;
    
    const bottomCap = new THREE.Mesh(capGeom, metallicWhite);
    bottomCap.rotation.x = Math.PI;
    bottomCap.position.y = -0.7;

    const bodyGroup = new THREE.Group();
    bodyGroup.add(bodyMesh, topCap, bottomCap);
    robotGroup.add(bodyGroup);

    // Neck: metal cylinder connector
    const neckGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 16);
    const neck = new THREE.Mesh(neckGeom, glossyDark);
    neck.position.y = 1.25;
    robotGroup.add(neck);

    // Head Assembly
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.7;

    const headGeom = new THREE.SphereGeometry(0.75, 32, 32);
    const headMesh = new THREE.Mesh(headGeom, metallicWhite);
    headGroup.add(headMesh);

    // Visor Glass plate
    const visorGeom = new THREE.SphereGeometry(0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const visor = new THREE.Mesh(visorGeom, glossyDark);
    visor.rotation.x = Math.PI / 2;
    visor.scale.set(1, 0.6, 1.15);
    visor.position.set(0, 0, 0.2);
    headGroup.add(visor);

    // visor glowing digital eyes
    const eyeGeomLeft = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeLeft = new THREE.Mesh(eyeGeomLeft, glowingNeon);
    eyeLeft.position.set(-0.25, 0.05, 0.72);
    eyeLeft.scale.set(1.4, stressLevel > 0.7 ? 0.35 : 1.4, 0.5); // make squinty when stressed
    headGroup.add(eyeLeft);

    const eyeGeomRight = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeRight = new THREE.Mesh(eyeGeomRight, glowingNeon);
    eyeRight.position.set(0.25, 0.05, 0.72);
    eyeRight.scale.set(1.4, stressLevel > 0.7 ? 0.35 : 1.4, 0.5);
    headGroup.add(eyeRight);

    // Ear Antennas with gold cores and glowing bulbs
    const antennaStemL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), goldAccent);
    antennaStemL.rotation.z = Math.PI / 3;
    antennaStemL.position.set(-0.85, 0.2, 0);
    headGroup.add(antennaStemL);
    
    const antennaBulbL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), glowingNeon);
    antennaBulbL.position.set(-1.05, 0.35, 0);
    headGroup.add(antennaBulbL);

    const antennaStemR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), goldAccent);
    antennaStemR.rotation.z = -Math.PI / 3;
    antennaStemR.position.set(0.85, 0.2, 0);
    headGroup.add(antennaStemR);

    const antennaBulbR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), glowingNeon);
    antennaBulbR.position.set(1.05, 0.35, 0);
    headGroup.add(antennaBulbR);

    robotGroup.add(headGroup);
    headRef.current = headGroup;

    // Hover core ring (Antigravity propulsion)
    const hoverRingGeom = new THREE.TorusGeometry(0.8, 0.12, 16, 48);
    const hoverRing = new THREE.Mesh(hoverRingGeom, glossyDark);
    hoverRing.rotation.x = Math.PI / 2;
    hoverRing.position.y = -1.2;
    robotGroup.add(hoverRing);
    hoverRingRef.current = hoverRing;

    // Add smaller inner glowing core inside the hover ring
    const coreGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const core = new THREE.Mesh(coreGeom, glowingNeon);
    core.position.y = -1.15;
    robotGroup.add(core);

    // Scale down robot slightly to fit viewport nicely and prevent clipping
    robotGroup.scale.set(0.9, 0.9, 0.9);
    robotGroup.position.y = -0.15; // anchor
    scene.add(robotGroup);
    robotRef.current = robotGroup;

    // 4. Mouse Tracking Handler (on window to match viewport action)
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to spectrum [-1, 1]
      const nX = (e.clientX / window.innerWidth) * 2 - 1;
      const nY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseTargetRef.current = { x: nX, y: nY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 5. Animation Engine
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Zero-gravity bobbing float cycle
      if (robotGroup) {
        robotGroup.position.y = -0.15 + Math.sin(elapsed * 2.2) * 0.16;
        
        // Spin animation trigger controller
        if (isSpinningRef.current) {
          spinAngleRef.current += 0.2;
          robotGroup.rotation.y = spinAngleRef.current;
          if (spinAngleRef.current >= Math.PI * 2) {
            spinAngleRef.current = 0;
            isSpinningRef.current = false;
          }
        } else {
          // Soft lag easing interpolation back to neutral
          robotGroup.rotation.y += (0 - robotGroup.rotation.y) * 0.1;
        }

        // Subtly sway body with float phase
        robotGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.05;
        robotGroup.rotation.x = Math.cos(elapsed * 1.2) * 0.03;
      }

      // Smooth Head Swivel tracking
      if (headGroup && !isSpinningRef.current) {
        // Rotates on Y axis depending on normalized mouse X coordinate
        const targetRotY = mouseTargetRef.current.x * 0.65; // cap angle
        const targetRotX = mouseTargetRef.current.y * 0.4; // cap altitude look
        
        headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.08;
        headGroup.rotation.x += (-targetRotX - headGroup.rotation.x) * 0.08;
      }

      // Spin the hover anti-gravity ring rapidly
      if (hoverRing) {
        hoverRing.rotation.z = elapsed * 5.0;
        // Ripple scales
        const ringScale = 1.0 + Math.sin(elapsed * 4.0) * 0.04;
        hoverRing.scale.set(ringScale, ringScale, 1.0);
      }

      // Slowly shift colors of accent glows in stress state based on sine wave
      if (stressLevel > 0.7) {
        accentLight.intensity = 2.0 + Math.sin(elapsed * 6) * 0.6;
      } else {
        accentLight.intensity = 2.2 + Math.sin(elapsed * 2) * 0.4;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stressLevel]);

  // Cheerful Spin Click trigger
  const handleOnClick = () => {
    audioManager.playInterfaceClick();
    if (!isSpinningRef.current) {
      isSpinningRef.current = true;
      spinAngleRef.current = 0;
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleOnClick}
      className="w-full h-44 sm:h-48 md:h-52 relative cursor-pointer group active:scale-95 transition-transform duration-150"
      title="Click robotic Study Buddy to execute custom barrel roll spin!"
      id="study-buddy-3d-canvas-container"
    >
      <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-mono tracking-widest text-[#06b6d4] uppercase border border-slate-700/50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Click to Spin
      </div>
    </div>
  );
};
