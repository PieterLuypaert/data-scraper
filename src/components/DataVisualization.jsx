import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BarChart3, TrendingUp, Link as LinkIcon, FileText } from 'lucide-react';
import { getAnalytics } from '@/utils/storage';

// Import recharts components
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function DataVisualization({ scrapedData }) {
  const [selectedView, setSelectedView] = useState('statistics');
  
  // Safely get analytics data
  const analytics = useMemo(() => {
    try {
      return getAnalytics();
    } catch (error) {
      console.error('Error loading analytics:', error);
      return {
        totalScrapes: 0,
        successfulScrapes: 0,
        failedScrapes: 0,
        urls: {},
        dailyStats: {},
      };
    }
  }, []);

  // Prepare statistics chart data
  const statisticsData = scrapedData ? [
    { name: 'Links', value: scrapedData.statistics?.totalLinks || 0 },
    { name: 'Afbeeldingen', value: scrapedData.statistics?.totalImages || 0 },
    { name: 'Headings', value: scrapedData.statistics?.totalHeadings || 0 },
    { name: 'Paragrafen', value: scrapedData.statistics?.totalParagraphs || 0 },
    { name: 'Tabellen', value: scrapedData.statistics?.totalTables || 0 },
    { name: 'Forms', value: scrapedData.statistics?.totalForms || 0 },
  ] : [];

  // Prepare daily stats chart data
  const dailyStatsData = useMemo(() => {
    const stats = analytics.dailyStats || {};
    return Object.entries(stats)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-30) // Last 30 days
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
        Succesvol: data.successful || 0,
        Gefaald: data.failed || 0,
      }));
  }, [analytics]);

  // Prepare word cloud data
  const wordCloudData = useMemo(() => {
    if (!scrapedData?.contentAnalysis?.mostCommonWords) return [];
    return scrapedData.contentAnalysis.mostCommonWords.slice(0, 50).map(item => ({
      text: item.word,
      value: item.count,
    }));
  }, [scrapedData]);

  // Prepare link graph data
  const linkGraphData = useMemo(() => {
    try {
      if (!scrapedData?.links || !Array.isArray(scrapedData.links)) {
        return { nodes: [], links: [] };
      }
      
      let domain = '';
      try {
        if (scrapedData.url) {
          domain = new URL(scrapedData.url).hostname;
        }
      } catch {
        // Invalid URL, continue without domain
      }
      
      const domains = new Map();
      let nodeId = 0;

      scrapedData.links.forEach(link => {
        try {
          if (!link || !link.href) return;
          const linkUrl = new URL(link.href);
          const linkDomain = linkUrl.hostname;
          
          if (!domains.has(linkDomain)) {
            domains.set(linkDomain, {
              id: nodeId++,
              name: linkDomain,
              value: 1,
              isInternal: domain && (linkDomain === domain || linkDomain === `www.${domain}` || `www.${linkDomain}` === domain),
            });
          } else {
            domains.get(linkDomain).value++;
          }
        } catch {
          // Skip invalid URLs
        }
      });

      const nodes = Array.from(domains.values()).slice(0, 20); // Top 20 domains
      const links = nodes.map((node) => ({
        source: 0, // Current page
        target: node.id,
        value: node.value,
      }));

      return { nodes, links };
    } catch (error) {
      console.error('Error preparing link graph data:', error);
      return { nodes: [], links: [] };
    }
  }, [scrapedData]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* View Selector */}
      <div className="flex gap-2 border-b border-gray-200">
        <Button
          variant={selectedView === 'statistics' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('statistics')}
          className="rounded-none"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Statistieken
        </Button>
        <Button
          variant={selectedView === 'wordcloud' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('wordcloud')}
          className="rounded-none"
        >
          <FileText className="h-4 w-4 mr-2" />
          Word Cloud
        </Button>
        <Button
          variant={selectedView === 'links' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('links')}
          className="rounded-none"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Link Graph
        </Button>
        <Button
          variant={selectedView === 'analytics' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('analytics')}
          className="rounded-none"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Statistics Chart */}
      {selectedView === 'statistics' && (
        <div className="space-y-4">
          {scrapedData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Element Statistieken</CardTitle>
                  <CardDescription>Overzicht van alle gescrapede elementen</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={statisticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Element Distributie</CardTitle>
                  <CardDescription>Verdeling van element types</CardDescription>
                </CardHeader>
                <CardContent>
                  {statisticsData.filter(d => d.value > 0).length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={statisticsData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statisticsData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="p-6 text-center text-gray-600">
                      Geen data beschikbaar voor pie chart
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-600">
                Scrape eerst een website om statistieken te zien
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Word Cloud */}
      {selectedView === 'wordcloud' && (
        <Card>
          <CardHeader>
            <CardTitle>Word Cloud</CardTitle>
            <CardDescription>Meest voorkomende woorden in de content</CardDescription>
          </CardHeader>
          <CardContent>
            {wordCloudData.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[400px] items-center justify-center">
                {wordCloudData.map((item, index) => {
                  const size = Math.max(12, Math.min(48, item.value * 2));
                  const opacity = Math.max(0.5, Math.min(1, item.value / 10));
                  return (
                    <span
                      key={index}
                      className="inline-block m-1 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        fontSize: `${size}px`,
                        fontWeight: item.value > 5 ? 'bold' : 'normal',
                        opacity,
                        color: COLORS[index % COLORS.length],
                      }}
                      title={`${item.text}: ${item.value} keer`}
                    >
                      {item.text}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-600">
                Scrape eerst een website om word cloud te zien
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Link Graph */}
      {selectedView === 'links' && (
        <Card>
          <CardHeader>
            <CardTitle>Link Graph</CardTitle>
            <CardDescription>Verdeling van interne en externe links</CardDescription>
          </CardHeader>
          <CardContent>
            {linkGraphData.nodes && linkGraphData.nodes.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={linkGraphData.nodes.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6">
                      {linkGraphData.nodes.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isInternal ? '#10b981' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Interne Links</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Externe Links</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {linkGraphData.nodes.slice(0, 8).map((node, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="text-xs text-gray-600 truncate">{node.name}</div>
                      <div className="text-lg font-bold text-gray-900">{node.value} links</div>
                      <div className={`text-xs ${node.isInternal ? 'text-green-600' : 'text-blue-600'}`}>
                        {node.isInternal ? 'Intern' : 'Extern'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-600">
                Scrape eerst een website om link graph te zien
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics Chart */}
      {selectedView === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Scraping Activiteit</CardTitle>
            <CardDescription>Dagelijkse scraping statistieken</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyStatsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyStatsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Succesvol" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Gefaald" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="p-6 text-center text-gray-600">
                Nog geen analytics data beschikbaar. Start met scrapen!
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

