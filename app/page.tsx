'use client';

import { useEffect } from "react";
import AudioPlayer from "./components/audio/AudioPlayer";
import CanvasLoader from "./components/common/CanvasLoader";
import ScrollWrapper from "./components/common/ScrollWrapper";
import Experience from "./components/experience";
import Hero from "./components/hero";
import { useNavigationStore, useScrollStore } from "./stores";

const Home = () => {
  const targetSection = useNavigationStore((state) => state.targetSection);
  const setTargetSection = useNavigationStore((state) => state.setTargetSection);
  const setTargetScrollProgress = useScrollStore((state) => state.setTargetScrollProgress);

  useEffect(() => {
    if (targetSection === 'experience') {
      console.log('🎯 Setting target scroll progress for experience');
      
      // ✅ Add delay để đợi Canvas và ScrollControls khởi tạo
      setTimeout(() => {
        console.log('⏰ Delayed scroll trigger');
        setTargetScrollProgress(0.85);
        setTargetSection(null);
      }, 1000); // 2 giây delay để đảm bảo Canvas đã load
    }
  }, [targetSection, setTargetSection, setTargetScrollProgress]);

  return (
    <>
      <CanvasLoader>
        <ScrollWrapper>
          <Hero />
          <Experience />
        </ScrollWrapper>
      </CanvasLoader>
      <AudioPlayer />
    </>
  );
};

export default Home;