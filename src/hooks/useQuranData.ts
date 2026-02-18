import { useState, useEffect } from "react";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  page: number;
}

export interface TranslatedAyah extends Ayah {
  translation: string;
}

export function useSurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((data) => {
        setSurahs(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { surahs, loading };
}

export function useSurahVerses(surahNumber: number) {
  const [verses, setVerses] = useState<TranslatedAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [surahInfo, setSurahInfo] = useState<Surah | null>(null);

  useEffect(() => {
    setLoading(true);
    setVerses([]);

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`).then((r) => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`).then((r) => r.json()),
    ])
      .then(([arabic, english]) => {
        setSurahInfo(arabic.data);
        const merged: TranslatedAyah[] = arabic.data.ayahs.map((a: Ayah, i: number) => ({
          ...a,
          translation: english.data.ayahs[i]?.text || "",
        }));
        setVerses(merged);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [surahNumber]);

  return { verses, loading, surahInfo };
}
