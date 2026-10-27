import React from 'react';

export type Lang = 'uz' | 'ru' | 'en';

interface Props {
  activeTab: Lang;
  onTabChange: (lang: Lang) => void;
}

const NAMES: Record<Lang, string> = { uz: 'Oʻzbekcha', ru: 'Русский', en: 'English' };

export const AdminLangTabs: React.FC<Props> = ({ activeTab, onTabChange }) => (
  <div className="a-tabs" role="tablist" aria-label="Kontent tili">
    {(['uz', 'ru', 'en'] as Lang[]).map(lang => (
      <button
        key={lang}
        type="button"
        role="tab"
        aria-selected={activeTab === lang}
        aria-label={NAMES[lang]}
        title={NAMES[lang]}
        onClick={(e) => { e.preventDefault(); onTabChange(lang); }}
        className="a-tab uppercase"
        style={{ minWidth: 52, letterSpacing: '.04em' }}
      >
        {lang}
      </button>
    ))}
  </div>
);
