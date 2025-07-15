import { useEffect } from 'react';

export default function TTSOutput({ text, lang }) {
  useEffect(() => {
    if (!text) return;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = lang;
    window.speechSynthesis.speak(utter);
  }, [text, lang]);
  return null;
}
