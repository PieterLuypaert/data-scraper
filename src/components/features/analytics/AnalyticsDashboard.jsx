import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalytics, getMostScrapedWebsites, getSuccessRate } from '@/utils/storage';
import { BarChart3, TrendingUp, CheckCircle, XCircle, Globe } from 'lucide-react';
import { PageShell, PageHeader } from '@/components/ui/page-shell';
import { t } from '@/i18n';

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [mostScraped, setMostScraped] = useState([]);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const data = getAnalytics();
    const topSites = getMostScrapedWebsites(5);
    const rate = getSuccessRate();

    setAnalytics(data);
    setMostScraped(topSites);
    setSuccessRate(rate);
  };

  if (!analytics) {
    return null;
  }

  const stats = [
    {
      title: 'Totaal Scrapes',
      value: analytics.totalScrapes,
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Succesvol',
      value: analytics.successfulScrapes,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Gefaald',
      value: analytics.failedScrapes,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <PageShell size="wide">
      <PageHeader
        title={t('tabs.analytics')}
        description={t('tooltips.analytics')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 space-y-6">
      {mostScraped.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Meest Gescrapede Websites
            </CardTitle>
            <CardDescription>Top 5 meest gescrapede URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostScraped.map((site, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-indigo-200/40 bg-indigo-50/30 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {site.url}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-sm font-semibold text-indigo-600">
                      {site.count}x
                    </span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-indigo-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                        style={{
                          width: `${(site.count / mostScraped[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(analytics.dailyStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dagelijkse Statistieken</CardTitle>
            <CardDescription>Laatste 7 dagen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.dailyStats)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 7)
                .map(([date, stats]) => (
                  <div
                    key={date}
                    className="flex items-center justify-between rounded-xl border border-indigo-200/40 bg-indigo-50/30 p-3"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(date).toLocaleDateString('nl-NL', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" /> {stats.successful}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-red-600">
                        <XCircle className="h-4 w-4" /> {stats.failed}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </PageShell>
  );
}

