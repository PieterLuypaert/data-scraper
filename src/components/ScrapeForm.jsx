import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { scrapeWebsite } from '@/api/scraper';
import { validateUrl } from '@/utils/validation';
import { saveToHistory, updateAnalytics } from '@/utils/storage';
import { Loader2 } from 'lucide-react';

export function ScrapeForm({ onScrapeSuccess, onScrapeError }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateUrl(url);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const data = await scrapeWebsite(validation.normalizedUrl);
      
      // Save to history and update analytics
      saveToHistory(data, validation.normalizedUrl);
      updateAnalytics(true, validation.normalizedUrl);
      
      onScrapeSuccess(data);
      setUrl('');
    } catch (err) {
      const errorMessage = err.message || 'Er is een fout opgetreden';
      updateAnalytics(false, validation.normalizedUrl);
      setError(errorMessage);
      onScrapeError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="https://voorbeeld.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Laden...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}

