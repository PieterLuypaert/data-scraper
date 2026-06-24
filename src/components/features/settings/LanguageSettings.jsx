import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Globe } from 'lucide-react';
import { getLanguage, setLanguage, getAvailableLanguages, t } from '@/i18n';
import { PageShell, PageHeader } from '@/components/ui/page-shell';

export function LanguageSettings() {
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [isChanging, setIsChanging] = useState(false);
  const languages = getAvailableLanguages();

  useEffect(() => {
    const handleLanguageChange = (e) => {
      setCurrentLang(e.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const handleLanguageChange = (langCode) => {
    setIsChanging(true);
    setLanguage(langCode);
    setTimeout(() => {
      setIsChanging(false);
      // Force re-render by updating state
      setCurrentLang(langCode);
    }, 100);
  };

  return (
    <PageShell size="wide">
      <PageHeader
        title={t('tabs.settings')}
        description={t('common.selectLanguage')}
      />
      <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isChanging}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition-all ${
                currentLang === lang.code
                  ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-200'
                  : 'border-indigo-200/40 hover:border-indigo-300 hover:bg-indigo-50/40'
              } ${isChanging ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-semibold text-gray-900">{lang.name}</span>
              </div>
              {currentLang === lang.code && (
                <Check className="h-5 w-5 text-indigo-600" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-50 to-sky-50 p-4">
          <div className="flex items-start gap-2">
            <Globe className="mt-0.5 h-5 w-5 text-indigo-600" />
            <div className="text-sm text-indigo-900/80">
              <p className="mb-1 font-semibold text-indigo-900">Language Settings</p>
              <p>
                Changing the language will update the UI immediately. Your preference is saved in your browser.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </PageShell>
  );
}

