import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Languages, Search, FileText, Mail, Phone, ShoppingCart, Rss } from 'lucide-react';

export function AnalysisSections({ data }) {
  return (
    <>
      {/* Sentiment Analysis */}
      {data.sentiment && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4" />
              Sentiment Analyse
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className={`px-4 py-3 rounded-lg text-center ${
                data.sentiment.sentiment === 'positive' ? 'bg-green-100 text-green-900' :
                data.sentiment.sentiment === 'negative' ? 'bg-red-100 text-red-900' :
                'bg-gray-100 text-gray-900'
              }`}>
                <div className="text-sm font-medium mb-1">
                  {data.sentiment.sentiment === 'positive' ? 'Positief' :
                   data.sentiment.sentiment === 'negative' ? 'Negatief' :
                   'Neutraal'}
                </div>
                <div className="text-2xl font-bold">{data.sentiment.score}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-green-50 rounded border border-green-200 text-center">
                  <div className="text-xs text-gray-600">Positieve Woorden</div>
                  <div className="text-lg font-bold text-gray-900">{data.sentiment.positive}</div>
                </div>
                <div className="p-2 bg-red-50 rounded border border-red-200 text-center">
                  <div className="text-xs text-gray-600">Negatieve Woorden</div>
                  <div className="text-lg font-bold text-gray-900">{data.sentiment.negative}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Detection */}
      {data.languageDetection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-4 w-4" />
              Taal Detectie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{data.languageDetection.language}</div>
              <div className="text-sm text-gray-600">Code: {data.languageDetection.code}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-900 h-2 rounded-full"
                  style={{ width: `${data.languageDetection.confidence}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">Vertrouwen: {data.languageDetection.confidence}%</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Analysis */}
      {data.seoAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-4 w-4" />
              SEO Analyse
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`rounded-full w-20 h-20 flex items-center justify-center ${
                  data.seoAnalysis.score >= 85 ? 'bg-green-100' :
                  data.seoAnalysis.score >= 70 ? 'bg-blue-100' :
                  data.seoAnalysis.score >= 50 ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  <span className={`text-2xl font-bold ${
                    data.seoAnalysis.score >= 85 ? 'text-green-600' :
                    data.seoAnalysis.score >= 70 ? 'text-blue-600' :
                    data.seoAnalysis.score >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {data.seoAnalysis.score}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{data.seoAnalysis.rating}</div>
                  <div className="text-sm text-gray-600">
                    {data.seoAnalysis.issues.length} problemen • {data.seoAnalysis.warnings.length} waarschuwingen
                  </div>
                </div>
              </div>
              {data.seoAnalysis.issues.length > 0 && (
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-sm font-medium text-red-900 mb-1">Kritieke Problemen:</div>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {data.seoAnalysis.issues.slice(0, 3).map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Type */}
      {data.contentType && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4" />
              Content Type
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900">{data.contentType.primaryType}</div>
              <div className="flex flex-wrap gap-2">
                {data.contentType.isBlog && <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded text-xs">Blog</span>}
                {data.contentType.isNews && <span className="px-2 py-1 bg-purple-100 text-purple-900 rounded text-xs">News</span>}
                {data.contentType.isEcommerce && <span className="px-2 py-1 bg-green-100 text-green-900 rounded text-xs">E-commerce</span>}
                {data.contentType.isPortfolio && <span className="px-2 py-1 bg-yellow-100 text-yellow-900 rounded text-xs">Portfolio</span>}
                {data.contentType.isCorporate && <span className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs">Corporate</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {data.contactInfo && (data.contactInfo.emails?.length > 0 || data.contactInfo.phoneNumbers?.length > 0 || Object.keys(data.contactInfo.socialMedia || {}).length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-4 w-4" />
              Contact Informatie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.contactInfo.emails && data.contactInfo.emails.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email ({data.contactInfo.emails.length})
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {data.contactInfo.emails.map((email, i) => (
                      <a key={i} href={`mailto:${email}`} className="block text-sm text-gray-900 hover:underline break-all">
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {data.contactInfo.phoneNumbers && data.contactInfo.phoneNumbers.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Telefoon ({data.contactInfo.phoneNumbers.length})
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {data.contactInfo.phoneNumbers.map((phone, i) => (
                      <a key={i} href={`tel:${phone}`} className="block text-sm text-gray-900 hover:underline">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {data.contactInfo.socialMedia && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-2">Social Media Links</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {data.contactInfo.socialMedia.facebook?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">Facebook:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.facebook.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.twitter?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">Twitter:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.twitter.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.linkedin?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">LinkedIn:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.linkedin.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.instagram?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">Instagram:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.instagram.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.youtube?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">YouTube:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.youtube.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.github?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">GitHub:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.github.length} links</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* E-commerce Data */}
      {data.ecommerce && data.ecommerce.prices && data.ecommerce.prices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-4 w-4" />
              E-commerce Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900">{data.ecommerce.priceCount} Prijzen</div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {data.ecommerce.prices.map((price, i) => (
                  <span key={i} className="px-2 py-1 bg-green-100 text-green-900 rounded text-sm font-medium">
                    {price}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RSS & Sitemap */}
      {(data.rssFeeds?.length > 0 || data.sitemaps?.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rss className="h-4 w-4" />
              RSS Feeds & Sitemaps
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.rssFeeds && data.rssFeeds.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">RSS Feeds ({data.rssFeeds.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {data.rssFeeds.map((feed, i) => (
                    <a key={i} href={feed} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-900 hover:underline break-all">
                      {feed}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {data.sitemaps && data.sitemaps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Sitemaps ({data.sitemaps.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {data.sitemaps.map((sitemap, i) => (
                    <a key={i} href={sitemap} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-900 hover:underline break-all">
                      {sitemap}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Analysis */}
      {data.contentAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Content Analyse</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Woorden</div>
                  <div className="text-lg font-bold text-gray-900">{data.contentAnalysis.wordCount}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Karakters</div>
                  <div className="text-lg font-bold text-gray-900">{data.contentAnalysis.characterCount}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Zinnen</div>
                  <div className="text-lg font-bold text-gray-900">{data.contentAnalysis.readability?.sentences || 0}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Lees Tijd</div>
                  <div className="text-lg font-bold text-gray-900">{data.contentAnalysis.readability?.estimatedReadingTime || 0} min</div>
                </div>
              </div>
              {data.contentAnalysis.mostCommonWords && data.contentAnalysis.mostCommonWords.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2">Meest Voorkomende Woorden ({data.contentAnalysis.mostCommonWords.length})</div>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {data.contentAnalysis.mostCommonWords.map((item, i) => (
                      <div key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        <span className="font-medium text-gray-900">{item.word}</span>
                        <span className="text-gray-600 ml-1">({item.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
