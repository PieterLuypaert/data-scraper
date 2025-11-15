import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tooltip } from './ui/tooltip';
import { Languages, Check, Globe } from 'lucide-react';
import { getLanguage, setLanguage, getAvailableLanguages, t } from '../i18n';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          {t('tabs.settings')}
        </CardTitle>
        <CardDescription>
          {t('common.selectLanguage')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isChanging}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                currentLang === lang.code
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
              {currentLang === lang.code && (
                <Check className="h-5 w-5 text-gray-900" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Language Settings</p>
              <p className="text-blue-700">
                Changing the language will update the UI immediately. Your preference is saved in your browser.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

