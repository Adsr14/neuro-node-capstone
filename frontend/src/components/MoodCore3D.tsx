import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MoodCore3DProps {
  stressLevel: number;
}

export const MoodCore3D: React.FC<MoodCore3DProps> = ({ stressLevel }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const faceGroupRef = useRef<THREE.Group | null>(null);
  const coreGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Initial Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // 2. Light Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const stressColor = stressLevel > 0.7 ? 0xf97316 : 0x06b6d4; // Orange vs Cyan
    const glowColor = stressLevel > 0.7 ? 0xff3d00 : 0x00f0ff;

    const pointLight = new THREE.PointLight(stressColor, 3, 10);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const coreLight = new THREE.PointLight(stressColor, 4, 3);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 3. Base Core Assembly Group (spins horizontally)
    const coreAssemblyGroup = new THREE.Group();

    // Translucent sphere material with glowing wireframe shell overlay
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: stressColor,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      transmission: 0.6, // Glassmorphic look in WebGL
      thickness: 1.0,
    });

    const sphereGeom = new THREE.SphereGeometry(1.6, 32, 32);
    const coreSphere = new THREE.Mesh(sphereGeom, coreMaterial);
    coreAssemblyGroup.add(coreSphere);
    coreMeshRef.current = coreSphere;

    // Wireframe wire grid overlay (representing advanced digital telemetry structure)
    const wireframeGeom = new THREE.SphereGeometry(1.62, 24, 24);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: stressColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireSphere = new THREE.Mesh(wireframeGeom, wireframeMat);
    coreAssemblyGroup.add(wireSphere);

    // Glowing orbital equatorial rings
    const ringGeom = new THREE.TorusGeometry(1.9, 0.05, 12, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: stressColor,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    ring1.rotation.x = Math.PI / 2;
    coreAssemblyGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeom, ringMat);
    ring2.rotation.x = Math.PI / 2.3;
    ring2.rotation.y = Math.PI / 4;
    coreAssemblyGroup.add(ring2);

    // 4. Construct DIGITAL FACIAL EXPRESSION directly using glowing objects
    const faceGroup = new THREE.Group();
    faceGroup.position.set(0, 0, 1.63); // seat perfectly on front face of core sphere

    const glowingFaceMat = new THREE.MeshBasicMaterial({
      color: glowColor,
    });

    const createFace = () => {
      // Clear old facial elements
      while (faceGroup.children.length > 0) {
        faceGroup.remove(faceGroup.children[0]);
      }

      if (stressLevel > 0.7) {
        // Stress Mode: >_< or - - (strained slits)
        // Draw Left Eye (Chevron angle >)
        const eyeL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), glowingFaceMat);
        eyeL1.rotation.z = Math.PI / 4;
        eyeL1.position.set(-0.45, 0.1, 0);

        const eyeL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), glowingFaceMat);
        eyeL2.rotation.z = -Math.PI / 4;
        eyeL2.position.set(-0.45, -0.1, 0);

        const leftEyeGroup = new THREE.Group();
        leftEyeGroup.add(eyeL1, eyeL2);
        faceGroup.add(leftEyeGroup);

        // Draw Right Eye (Chevron angle <)
        const eyeR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), glowingFaceMat);
        eyeR1.rotation.z = -Math.PI / 4;
        eyeR1.position.set(0.45, 0.1, 0);

        const eyeR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), glowingFaceMat);
        eyeR2.rotation.z = Math.PI / 4;
        eyeR2.position.set(0.45, -0.1, 0);

        const rightEyeGroup = new THREE.Group();
        rightEyeGroup.add(eyeR1, eyeR2);
        faceGroup.add(rightEyeGroup);

        // Angry/Stressed geometric mouth
        const mouthGeom = new THREE.TorusGeometry(0.2, 0.04, 8, 16, Math.PI);
        const mouth = new THREE.Mesh(mouthGeom, glowingFaceMat);
        mouth.position.set(0, -0.3, 0);
        mouth.rotation.x = Math.PI; // frown mouth
        faceGroup.add(mouth);

      } else {
        // Calm Mode: ^ ^ (happy indicators)
        // Draw active happy Left Eye
        const eyeL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.28, 8), glowingFaceMat);
        eyeL1.rotation.z = -Math.PI / 3.2;
        eyeL1.position.set(-0.48, 0.08, 0);

        const eyeL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.28, 8), glowingFaceMat);
        eyeL2.rotation.z = Math.PI / 3.2;
        eyeL2.position.set(-0.38, 0.08, 0);

        const leftEyeGroup = new THREE.Group();
        leftEyeGroup.add(eyeL1, eyeL2);
        leftEyeGroup.position.set(-0.1, 0, 0);
        faceGroup.add(leftEyeGroup);

        // Draw active happy Right Eye
        const eyeR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.28, 8), glowingFaceMat);
        eyeR1.rotation.z = -Math.PI / 3.2;
        eyeR1.position.set(0.38, 0.08, 0);

        const eyeR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.28, 8), glowingFaceMat);
        eyeR2.rotation.z = Math.PI / 3.2;
        eyeR2.position.set(0.48, 0.08, 0);

        const rightEyeGroup = new THREE.Group();
        rightEyeGroup.add(eyeR1, eyeR2);
        rightEyeGroup.position.set(0.1, 0, 0);
        faceGroup.add(rightEyeGroup);

        // Content smiling mouth
        const mouthGeom = new THREE.TorusGeometry(0.18, 0.035, 8, 16, Math.PI);
        const mouth = new THREE.Mesh(mouthGeom, glowingFaceMat);
        mouth.position.set(0, -0.22, 0);
        faceGroup.add(mouth);
      }
    };

    createFace();
    coreAssemblyGroup.add(faceGroup);
    faceGroupRef.current = faceGroup;

    scene.add(coreAssemblyGroup);
    coreGroupRef.current = coreAssemblyGroup;

    // 5. Animation Loop with stress parameters
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      
      if (coreAssemblyGroup) {
        // Revolves horizontally
        // Spins faster under high stress conditions
        const baseSpeed = stressLevel > 0.7 ? 2.4 : 1.1;
        coreAssemblyGroup.rotation.y = elapsed * baseSpeed;

        // Interactive high-stress turbulence flutter / vibration jitter
        if (stressLevel > 0.7) {
          // Generates high-frequency physical micro-vibration
          coreAssemblyGroup.position.x = (Math.random() - 0.5) * 0.05;
          coreAssemblyGroup.position.y = (Math.random() - 0.5) * 0.05;
          coreAssemblyGroup.position.z = (Math.random() - 0.5) * 0.05;
          
          // Slight wobble of orbit
          coreAssemblyGroup.rotation.x = Math.sin(elapsed * 12) * 0.15;
          coreAssemblyGroup.rotation.z = Math.cos(elapsed * 15) * 0.1;
        } else {
          // Clean smooth floating drift path
          coreAssemblyGroup.position.set(0, Math.sin(elapsed * 2.0) * 0.08, 0);
          coreAssemblyGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.05;
          coreAssemblyGroup.rotation.z = 0;
        }
      }

      // Rotate equatorial rings counter-directionally
      if (ring1) {
        ring1.rotation.z = elapsed * -0.6;
      }
      if (ring2) {
        ring2.rotation.z = elapsed * 1.2;
      }

      // Flicker intensity subtly when stressed
      if (stressLevel > 0.7) {
        pointLight.intensity = 3.0 + Math.sin(elapsed * 25) * 1.5;
        coreLight.intensity = 4.0 + Math.cos(elapsed * 30) * 2.0;
      } else {
        pointLight.intensity = 2.5 + Math.sin(elapsed * 1.5) * 0.3;
        coreLight.intensity = 3.0;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // Handle viewport resize mapping
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stressLevel]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[280px] md:h-[340px] relative rounded-3xl overflow-hidden flex items-center justify-center"
      id="mood-core-3d-canvas-container"
    />
  );
};
