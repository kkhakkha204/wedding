'use client';

import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { useRef } from "react";
import gsap from "gsap"; // ✅ Import gsap

import { usePortalStore, useScrollStore } from "@stores";

const ScrollWrapper = (props: { children: React.ReactNode | React.ReactNode[]}) => {
  const { camera } = useThree();
  const data = useScroll();
  const isActive = usePortalStore((state) => !!state.activePortalId);
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  
  // Target scroll logic
  const targetScrollProgress = useScrollStore((state) => state.targetScrollProgress);
  const setTargetScrollProgress = useScrollStore((state) => state.setTargetScrollProgress);
  const isAnimating = useRef(false);
  const animationAttempts = useRef(0);

  useFrame((state, delta) => {
    if (data) {
      // Handle target scroll animation với safety checks
      if (targetScrollProgress !== null && !isAnimating.current && data.el) {
        // ✅ Check if scroll element is ready
        if (data.el.scrollHeight === 0) {
          console.log('⏳ Waiting for scroll element to initialize...');
          return; // Wait for next frame
        }

        console.log('🎯 Animating to target scroll:', targetScrollProgress);
        isAnimating.current = true;
        animationAttempts.current = 0;

        const targetScrollTop = data.el.scrollHeight * targetScrollProgress;
        
        console.log('📊 Scroll animation info:', {
          currentScrollTop: data.el.scrollTop,
          targetScrollTop,
          scrollHeight: data.el.scrollHeight,
          targetProgress: targetScrollProgress
        });

        // Method 1: Multiple instant scroll attempts
        const performScroll = () => {
          if (data.el && animationAttempts.current < 5) {
            data.el.scrollTop = targetScrollTop;
            animationAttempts.current++;
            console.log(`📍 Scroll attempt ${animationAttempts.current}, position:`, data.el.scrollTop);
            
            // Check if scroll was successful
            setTimeout(() => {
              if (data.el && Math.abs(data.el.scrollTop - targetScrollTop) > 50) {
                performScroll(); // Try again if not close enough
              }
            }, 100);
          }
        };

        // Start immediate scroll
        performScroll();
        
        // Method 2: GSAP smooth animation (with try-catch)
        try {
          gsap.to(data.el, {
            scrollTop: targetScrollTop,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
              if (data.el) {
                console.log('📊 GSAP scroll progress:', data.el.scrollTop);
              }
            },
            onComplete: () => {
              console.log('✅ GSAP scroll animation completed');
              isAnimating.current = false;
              setTargetScrollProgress(null);
            }
          });
        } catch (error) {
          console.error('❌ GSAP animation error:', error);
          // Fallback: Reset animation state
          isAnimating.current = false;
          setTargetScrollProgress(null);
        }
      }

      // Original camera animation logic
      const a = data.range(0, 0.3);
      const b = data.range(0.3, 0.5);
      const d = data.range(0.85, 0.18);

      if (!isActive) {
        camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, -0.5 * Math.PI * a, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, -37 * b, 7, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 5 + 10 * d, 7, delta);

        setScrollProgress(data.range(0, 1));
      }

      // Move camera slightly on mouse movement.
      if (!isMobile && !isActive) {
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -(state.pointer.x * Math.PI) / 90, 0.05);
      }
    }
  });

  const children = Array.isArray(props.children) ? props.children : [props.children];

  return <>
    {children.map((child, index) => {
      return <group key={index}>
        {child}
      </group>
    })}
  </>
}

export default ScrollWrapper;