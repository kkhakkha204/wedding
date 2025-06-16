import { Text, useScroll, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { usePortalStore } from "@stores";
import { useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from 'three';

const Experience = () => {
  const titleRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const leftImageRef = useRef<THREE.Mesh>(null);
  const rightImageRef = useRef<THREE.Mesh>(null);
  const leftTitleRef = useRef<THREE.Mesh>(null);
  const rightTitleRef = useRef<THREE.Mesh>(null);
  const data = useScroll();
  const { camera, scene } = useThree();
  const isActive = usePortalStore((state) => !!state.activePortalId);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Hover states for sophisticated animations
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  // Load textures for the images
  const leftTexture = useTexture('./a4.jpeg');
  const rightTexture = useTexture('./a4.jpeg');

  const fontProps = {
    font: "./soria-font.ttf",
    fontSize: 0.4,
    color: 'white',
  };

  // Font props cho title trên ảnh
  const imageTitleProps = {
    font: "./a2.otf",
    fontSize: isMobile ? 0.15 : 0.2,
    color: 'white',
    anchorX: 'center' as const,
    anchorY: 'middle' as const,
  };

  useFrame((state, delta) => {
    const d = data.range(0.8, 0.2);
    const e = data.range(0.7, 0.2);
    const scrollProgress = data.scroll.current;
    const time = state.clock.elapsedTime;

    if (groupRef.current && !isActive) {
      groupRef.current.position.y = d > 0 ? -1 : -30;
      groupRef.current.visible = d > 0;
    }

    if (titleRef.current) {
      titleRef.current.children.forEach((text, i) => {
        const y = Math.max(Math.min((1 - d) * (10 - i), 10), 0.5);
        text.position.y = THREE.MathUtils.damp(text.position.y, y, 7, delta);
        (text as any).fillOpacity = e;
      });
    }

    // Image scroll animations
    if (leftImageRef.current && rightImageRef.current && d > 0) {
      const imageScrollEffect = Math.sin(scrollProgress * Math.PI * 2) * 0.5;
      
      // Base vertical movement - up/down animation
      const baseLeftY = imageScrollEffect;
      const baseRightY = -imageScrollEffect;
      
      // Enhanced hover animations for left image
      const leftTargetY = leftHovered ? baseLeftY + Math.sin(time * 2) * 0.1 : baseLeftY;
      const leftTargetZ = leftHovered ? 0.3 + Math.sin(time * 3) * 0.05 : 0;
      const leftRotationX = leftHovered ? Math.sin(time * 1.5) * 0.05 : 0;
      const leftRotationY = leftHovered ? Math.cos(time * 1.2) * 0.03 : 0;
      const leftScale = leftHovered ? 1.05 + Math.sin(time * 4) * 0.02 : 1;

      // Enhanced hover animations for right image  
      const rightTargetY = rightHovered ? baseRightY + Math.cos(time * 2.2) * 0.1 : baseRightY;
      const rightTargetZ = rightHovered ? 0.3 + Math.cos(time * 2.8) * 0.05 : 0;
      const rightRotationX = rightHovered ? Math.cos(time * 1.8) * 0.05 : 0;
      const rightRotationY = rightHovered ? Math.sin(time * 1.4) * 0.03 : 0;
      const rightScale = rightHovered ? 1.05 + Math.cos(time * 3.8) * 0.02 : 1;

      // Apply smooth damped animations
      leftImageRef.current.position.y = THREE.MathUtils.damp(
        leftImageRef.current.position.y, 
        leftTargetY, 
        leftHovered ? 8 : 3, 
        delta
      );
      
      leftImageRef.current.position.z = THREE.MathUtils.damp(
        leftImageRef.current.position.z,
        leftTargetZ,
        6,
        delta
      );

      leftImageRef.current.rotation.x = THREE.MathUtils.damp(
        leftImageRef.current.rotation.x,
        leftRotationX,
        8,
        delta
      );

      leftImageRef.current.rotation.y = THREE.MathUtils.damp(
        leftImageRef.current.rotation.y,
        leftRotationY,
        8,
        delta
      );

      leftImageRef.current.scale.setScalar(THREE.MathUtils.damp(
        leftImageRef.current.scale.x,
        leftScale,
        10,
        delta
      ));
      
      rightImageRef.current.position.y = THREE.MathUtils.damp(
        rightImageRef.current.position.y, 
        rightTargetY, 
        rightHovered ? 8 : 3, 
        delta
      );

      rightImageRef.current.position.z = THREE.MathUtils.damp(
        rightImageRef.current.position.z,
        rightTargetZ,
        6,
        delta
      );

      rightImageRef.current.rotation.x = THREE.MathUtils.damp(
        rightImageRef.current.rotation.x,
        rightRotationX,
        8,
        delta
      );

      rightImageRef.current.rotation.y = THREE.MathUtils.damp(
        rightImageRef.current.rotation.y,
        rightRotationY,
        8,
        delta
      );

      rightImageRef.current.scale.setScalar(THREE.MathUtils.damp(
        rightImageRef.current.scale.x,
        rightScale,
        10,
        delta
      ));

      // Horizontal movement - images move closer together as user scrolls
      const initialGap = isMobile ? 1 : 1.5;
      const scrollInfluence = Math.min(d, 1);
      const horizontalOffset = initialGap * (1 - scrollInfluence);
      
      // Add subtle horizontal sway on hover
      const leftHoverOffsetX = leftHovered ? Math.sin(time * 1.5) * 0.05 : 0;
      const rightHoverOffsetX = rightHovered ? Math.cos(time * 1.3) * 0.05 : 0;
      
      leftImageRef.current.position.x = THREE.MathUtils.damp(
        leftImageRef.current.position.x,
        -imageWidth / 2.01 - horizontalOffset + leftHoverOffsetX,
        4,
        delta
      );
      
      rightImageRef.current.position.x = THREE.MathUtils.damp(
        rightImageRef.current.position.x,
        imageWidth / 2.01 + horizontalOffset + rightHoverOffsetX,
        4,
        delta
      );

      // Sync title positions với image positions
      if (leftTitleRef.current && rightTitleRef.current) {
        leftTitleRef.current.position.x = leftImageRef.current.position.x;
        leftTitleRef.current.position.y = leftImageRef.current.position.y + containerHeight / 2 - 0.3;
        leftTitleRef.current.position.z = leftImageRef.current.position.z + 0.1;
        
        rightTitleRef.current.position.x = rightImageRef.current.position.x;
        rightTitleRef.current.position.y = rightImageRef.current.position.y + containerHeight / 2 - 0.3;
        rightTitleRef.current.position.z = rightImageRef.current.position.z + 0.1;

        // Apply hover effects to titles
        const leftTitleScale = leftHovered ? 1.1 : 1;
        const rightTitleScale = rightHovered ? 1.1 : 1;
        
        leftTitleRef.current.scale.setScalar(THREE.MathUtils.damp(
          leftTitleRef.current.scale.x,
          leftTitleScale,
          8,
          delta
        ));

        rightTitleRef.current.scale.setScalar(THREE.MathUtils.damp(
          rightTitleRef.current.scale.x,
          rightTitleScale,
          8,
          delta
        ));
      }
    }
  });

  const handleImageClick = (imageType: 'left' | 'right') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const targetImage = imageType === 'left' ? leftImageRef.current : rightImageRef.current;
    
    if (targetImage) {
      let progress = 0;
      const animate = () => {
        progress += 0.05;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          const url = imageType === 'left' ? '/groom' : '/bride';
          window.location.href = url;
        }
      };
      
      animate();
    }
  };

  const handlePointerEnter = (imageType: 'left' | 'right') => {
    if (imageType === 'left') {
      setLeftHovered(true);
    } else {
      setRightHovered(true);
    }
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = (imageType: 'left' | 'right') => {
    if (imageType === 'left') {
      setLeftHovered(false);
    } else {
      setRightHovered(false);
    }
    document.body.style.cursor = 'default';
  };

  const getTitle = () => {
    const title = 'experience'.toUpperCase();
    return title.split('').map((char, i) => {
      const diff = isMobile ? 0.4 : 0.8;
      return (
        <Text key={i} {...fontProps} position={[i * diff, 2, 1]}>{char}</Text>
      );
    });
  };

  const containerWidth = isMobile ? 4 : 6;
  const containerHeight = isMobile ? 3 : 4;
  const imageWidth = containerWidth / 2;

  return (
    <group position={[0, -41.5, 12]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <group ref={titleRef} position={[isMobile ? -1.8 : -3.6, 1.5, -2]}>
          {getTitle()}
        </group>

        <group position={[0, -1, 0]} ref={groupRef}>
          <group position={[0, 0, 0.1]}>
            {/* Left Image with Enhanced 3D Hover Effects */}
            <mesh
              ref={leftImageRef}
              position={[-(imageWidth / 2 + (isMobile ? 1 : 1.5)), 0, 0]}
              onClick={() => handleImageClick('left')}
              onPointerEnter={() => handlePointerEnter('left')}
              onPointerLeave={() => handlePointerLeave('left')}
            >
              <planeGeometry args={[imageWidth, containerHeight]} />
              <meshBasicMaterial 
                map={leftTexture} 
                transparent 
                opacity={1}
              />
            </mesh>

            {/* Left Image Title */}
            <Text
              ref={leftTitleRef}
              {...imageTitleProps}
              position={[-(imageWidth / 2 + (isMobile ? 1 : 1.5)), containerHeight / 2 - 0.3, 0.01]}
            >
              Ngô Hồng Sơn
            </Text>

            {/* Right Image with Enhanced 3D Hover Effects */}
            <mesh
              ref={rightImageRef}
              position={[imageWidth / 2 + (isMobile ? 1 : 1.5), 0, 0]}
              onClick={() => handleImageClick('right')}
              onPointerEnter={() => handlePointerEnter('right')}
              onPointerLeave={() => handlePointerLeave('right')}
            >
              <planeGeometry args={[imageWidth, containerHeight]} />
              <meshBasicMaterial 
                map={rightTexture} 
                transparent 
                opacity={1}
              />
            </mesh>

            {/* Right Image Title */}
            <Text
              ref={rightTitleRef}
              {...imageTitleProps}
              position={[imageWidth / 2 + (isMobile ? 1 : 1.5), containerHeight / 2 - 0.3, 0.01]}
            >
              Bùi Thu Trang
            </Text>

            {/* Background */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[containerWidth, containerHeight]} />
              <meshBasicMaterial color="#000000" transparent opacity={0} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

export default Experience;