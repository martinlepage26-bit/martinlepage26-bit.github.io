import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { UI_STRINGS } from '../data/gaia.js';

const LangContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = useCallback(
    (key) => UI_STRINGS[lang]?.[key] ?? UI_STRINGS.en[key] ?? key,
    [lang],
  );

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'fr' : 'en')), []);

  const value = useMemo(() => ({ lang, setLang, t, toggle }), [lang, t, toggle]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
