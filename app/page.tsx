'use client';

import AudioPlayer from "./components/audio/AudioPlayer";
import CanvasLoader from "./components/common/CanvasLoader";
import ScrollWrapper from "./components/common/ScrollWrapper";
import Experience from "./components/experience";
import Hero from "./components/hero";

const Home = () => {
  return (
    <group>
    <CanvasLoader>
      <ScrollWrapper>
        <Hero/>
        <Experience/>
        
      </ScrollWrapper>
    </CanvasLoader>
    <AudioPlayer />
    </group>
  );
};
export default Home;
