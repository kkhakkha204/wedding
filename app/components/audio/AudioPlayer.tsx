'use client';

import { useState, useEffect } from 'react';
import useSound from 'use-sound';
import { Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [play, { stop }] = useSound('/audio/a.mp3', {
    volume: 0.5,
    loop: true,
  });

  useEffect(() => {
    if (isPlaying) {
      play();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [isPlaying, play, stop]);

  const toggleSound = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed top-[10px] right-[40px] md:top-[26px] md:right-16 z-50">
      <button
        onClick={toggleSound}
        className=" rounded-full text-white transition-colors duration-200"
        aria-label={isPlaying ? 'Tắt âm thanh' : 'Bật âm thanh'}
      >
        {isPlaying ? <Volume2 size={21  } /> : <VolumeX size={21} />}
      </button>
    </div>
  );
};

export default AudioPlayer;