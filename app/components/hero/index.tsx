'use client';

import { Text } from "@react-three/drei";

import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import CloudContainer from "../models/Cloud";
import WindowModel from "../models/WindowModel";
import TextWindow from "./TextWindow";

const Hero = () => {
  const titleRef = useRef<THREE.Mesh>(null);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100 && titleRef.current) {
      gsap.fromTo(titleRef.current.position, {
        y: -10,
        duration: 1,
        // delay: 1.5,
      }, {
        y: 1.4,
        duration: 3
      });
    }
  }, [progress]);

  const fontProps = {
    font: "./a2.otf",
    fontSize: 0.9,
  };

  const subFontProps = {
    font: "./mon.ttf",
    fontSize: 0.6,
  };

  return (
    <>
      <Text position={[0, 2.7, -10]} {...fontProps} ref={titleRef}>Xin chào, Tụi mình sắp cưới rồi !</Text>
      <Text position={[0, 2, -10]} {...subFontProps} ref={titleRef}>(Bạn vui lòng kéo xuống nhé)</Text>
      <CloudContainer/>
      <group position={[0, -25, 5.69]}>
        <pointLight castShadow position={[1, 1, -2.5]} intensity={60} distance={10}/>
        <WindowModel receiveShadow/>
        <TextWindow/>
      </group>
    </>
  );
};

export default Hero;
