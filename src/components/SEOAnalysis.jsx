import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Smartphone, Globe, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export function SEOAnalysis({ data }) {
  if (!data || !data.seoAnalysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-600">
          Geen SEO data beschikbaar. Scrape eerst een website.
        </CardContent>
      </Card>
    );
  }

  const seo = data.seoAnalysis;
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-blue-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* SEO Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className={`${getScoreBgColor(seo.score)} rounded-full w-32 h-32 flex items-center justify-center`}>
              <span className={`text-4xl font-bold ${getScoreColor(seo.score)}`}>
                {seo.score}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{seo.rating}</h3>
              <p className="text-gray-600 mt-1">
                {seo.score >= 85 && 'Uitstekende SEO score!'}
                {seo.score >= 70 && seo.score < 85 && 'Goede SEO score, maar er is ruimte voor verbetering.'}
                {seo.score >= 50 && seo.score < 70 && 'SEO score heeft verbetering nodig.'}
                {seo.score < 50 && 'SEO score heeft veel verbetering nodig.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      {seo.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Kritieke Problemen ({seo.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {seo.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 text-red-700">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {seo.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Waarschuwingen ({seo.warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {seo.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {seo.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
              Aanbevelingen ({seo.recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {seo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-700">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* SEO Meta Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title & Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4" />
              Title & Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Title Lengte</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      seo.meta.titleLength >= 30 && seo.meta.titleLength <= 60 
                        ? 'bg-green-500' 
                        : seo.meta.titleLength > 0 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (seo.meta.titleLength / 60) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{seo.meta.titleLength} / 60</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Description Lengte</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      seo.meta.descriptionLength >= 120 && seo.meta.descriptionLength <= 160 
                        ? 'bg-green-500' 
                        : seo.meta.descriptionLength > 0 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (seo.meta.descriptionLength / 160) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{seo.meta.descriptionLength} / 160</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Headings Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4" />
              Heading Structuur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">H1 Headings</span>
              <span className={`font-medium ${seo.meta.h1Count === 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                {seo.meta.h1Count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">H2 Headings</span>
              <span className="font-medium text-gray-700">{seo.meta.h2Count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">H3 Headings</span>
              <span className="font-medium text-gray-700">{seo.meta.h3Count}</span>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-4 w-4" />
              Afbeeldingen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Totaal Afbeeldingen</span>
              <span className="font-medium text-gray-700">{seo.meta.totalImages}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Met Alt Tekst</span>
              <span className={`font-medium ${seo.meta.imagesWithAlt === seo.meta.totalImages ? 'text-green-600' : 'text-yellow-600'}`}>
                {seo.meta.imagesWithAlt}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Zonder Alt Tekst</span>
              <span className={`font-medium ${seo.meta.imagesWithoutAlt === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {seo.meta.imagesWithoutAlt}
              </span>
            </div>
            {seo.meta.totalImages > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">
                  Alt Tekst Percentage: {Math.round((seo.meta.imagesWithAlt / seo.meta.totalImages) * 100)}%
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (seo.meta.imagesWithAlt / seo.meta.totalImages) >= 0.8 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${(seo.meta.imagesWithAlt / seo.meta.totalImages) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LinkIcon className="h-4 w-4" />
              Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Interne Links</span>
              <span className="font-medium text-gray-700">{seo.meta.internalLinks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Externe Links</span>
              <span className="font-medium text-gray-700">{seo.meta.externalLinks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Canonical URL</span>
              <span className={seo.meta.hasCanonical ? 'text-green-600' : 'text-yellow-600'}>
                {seo.meta.hasCanonical ? '✓' : '✗'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mobile & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-4 w-4" />
              Mobile & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Viewport Meta Tag</span>
              <span className={seo.meta.hasViewport ? 'text-green-600' : 'text-red-600'}>
                {seo.meta.hasViewport ? '✓ Mobile-friendly' : '✗ Niet mobile-friendly'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">HTTPS</span>
              <span className={seo.meta.usesHTTPS ? 'text-green-600' : 'text-red-600'}>
                {seo.meta.usesHTTPS ? '✓ Veilig' : '✗ Onveilig'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">URL Lengte</span>
              <span className={seo.meta.urlLength < 100 ? 'text-green-600' : 'text-yellow-600'}>
                {seo.meta.urlLength} karakters
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">URL Diepte</span>
              <span className={seo.meta.urlDepth <= 3 ? 'text-green-600' : 'text-yellow-600'}>
                {seo.meta.urlDepth} niveaus
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-4 w-4" />
              Social Media Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Open Graph Tags</span>
              <span className={seo.meta.hasOGTags ? 'text-green-600' : 'text-yellow-600'}>
                {seo.meta.hasOGTags ? '✓ Compleet' : '✗ Onvolledig'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Twitter Card</span>
              <span className={seo.meta.hasTwitterCard ? 'text-green-600' : 'text-yellow-600'}>
                {seo.meta.hasTwitterCard ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Schema.org Data</span>
              <span className={seo.meta.hasSchema ? 'text-green-600' : 'text-yellow-600'}>
                {seo.meta.hasSchema ? '✓' : '✗'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

