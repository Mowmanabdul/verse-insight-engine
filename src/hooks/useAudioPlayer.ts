import { useState, useRef, useCallback, useEffect } from "react";

const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

export type PlayMode = "ayah" | "surah";

interface SurahRange {
  firstGlobal: number; // global ayah number of first ayah in surah
  lastGlobal: number;  // global ayah number of last ayah in surah
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("ayah");
  const [isPlayingSurah, setIsPlayingSurah] = useState(false);

  // Store surah range for continuous playback
  const surahRangeRef = useRef<SurahRange | null>(null);
  const playModeRef = useRef<PlayMode>("ayah");
  playModeRef.current = playMode;

  const playAyah = useCallback((globalAyahNumber: number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.pause();

    setIsLoading(true);
    setPlayingAyah(globalAyahNumber);

    audio.src = `${AUDIO_BASE}/${globalAyahNumber}.mp3`;

    audio.oncanplaythrough = () => setIsLoading(false);
    audio.onerror = () => {
      setPlayingAyah(null);
      setIsLoading(false);
      setIsPlayingSurah(false);
    };

    audio.onended = () => {
      // In surah mode, auto-advance to next ayah
      const range = surahRangeRef.current;
      if (playModeRef.current === "surah" && range && globalAyahNumber < range.lastGlobal) {
        playAyah(globalAyahNumber + 1);
      } else {
        setPlayingAyah(null);
        setIsLoading(false);
        setIsPlayingSurah(false);
      }
    };

    audio.play().catch(() => {
      setPlayingAyah(null);
      setIsLoading(false);
      setIsPlayingSurah(false);
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.src = "";
    }
    setPlayingAyah(null);
    setIsLoading(false);
    setIsPlayingSurah(false);
  }, []);

  const play = useCallback((globalAyahNumber: number) => {
    // If same ayah, toggle off
    if (playingAyah === globalAyahNumber) {
      stop();
      return;
    }
    playAyah(globalAyahNumber);
  }, [playingAyah, stop, playAyah]);

  const playSurah = useCallback((firstGlobal: number, lastGlobal: number) => {
    if (isPlayingSurah) {
      stop();
      return;
    }
    surahRangeRef.current = { firstGlobal, lastGlobal };
    setIsPlayingSurah(true);
    playAyah(firstGlobal);
  }, [isPlayingSurah, stop, playAyah]);

  // Update surah range when verses change
  const setSurahRange = useCallback((firstGlobal: number, lastGlobal: number) => {
    surahRangeRef.current = { firstGlobal, lastGlobal };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.src = "";
      }
    };
  }, []);

  return {
    playingAyah,
    isLoading,
    playMode,
    setPlayMode,
    isPlayingSurah,
    play,
    playSurah,
    stop,
    setSurahRange,
  };
}
