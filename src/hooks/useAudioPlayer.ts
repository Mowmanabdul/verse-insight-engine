import { useState, useRef, useCallback, useEffect } from "react";

const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlayingAyah(null);
    setIsLoading(false);
  }, []);

  const play = useCallback((globalAyahNumber: number) => {
    // If same ayah, toggle off
    if (playingAyah === globalAyahNumber) {
      stop();
      return;
    }

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      audioRef.current = new Audio();
    }

    setIsLoading(true);
    setPlayingAyah(globalAyahNumber);

    const audio = audioRef.current;
    audio.src = `${AUDIO_BASE}/${globalAyahNumber}.mp3`;

    audio.oncanplaythrough = () => setIsLoading(false);
    audio.onended = () => {
      setPlayingAyah(null);
      setIsLoading(false);
    };
    audio.onerror = () => {
      setPlayingAyah(null);
      setIsLoading(false);
    };

    audio.play().catch(() => {
      setPlayingAyah(null);
      setIsLoading(false);
    });
  }, [playingAyah, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return { playingAyah, isLoading, play, stop };
}
