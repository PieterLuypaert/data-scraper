import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/utils/clipboard';

export function ScrapeResults({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!data) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Scraped Data</h2>
        <Button onClick={handleCopy} variant="outline">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Gekopieerd!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Kopieer
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Titel</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{data.title || 'Geen titel'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL</CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-gray-600 hover:underline break-all"
          >
            {data.url}
          </a>
        </CardContent>
      </Card>

      {Object.keys(data.metaTags || {}).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Meta Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.metaTags).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <strong className="text-gray-900">{key}:</strong> <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(data.headings?.h1?.length > 0 ||
        data.headings?.h2?.length > 0 ||
        data.headings?.h3?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Headings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.headings.h1?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">H1 Headings:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {data.headings.h1.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.headings.h2?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">H2 Headings:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {data.headings.h2.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.headings.h3?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">H3 Headings:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {data.headings.h3.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {data.links?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>Eerste 50 links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.links.slice(0, 50).map((link, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-gray-600 hover:underline break-all"
                  >
                    {link.text || link.href}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.images?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Afbeeldingen</CardTitle>
            <CardDescription>Eerste 20 afbeeldingen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.images.slice(0, 20).map((img, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="mb-2 text-gray-900">
                    <strong>Alt:</strong> <span className="text-gray-700">{img.alt || 'Geen alt tekst'}</span>
                  </p>
                  <a
                    href={img.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-gray-600 hover:underline break-all text-sm block mb-2"
                  >
                    {img.src}
                  </a>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="max-w-xs max-h-48 rounded border border-gray-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tekst Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 border border-gray-200 p-4 rounded overflow-auto max-h-64 text-sm text-gray-900">
            {data.textPreview || 'Geen tekst gevonden'}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded border border-gray-800 overflow-auto max-h-96 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

