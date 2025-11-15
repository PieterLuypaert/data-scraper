import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import {
  getProxyStats,
  checkProxyHealth,
  addProxy,
  removeProxy,
  resetProxies,
} from '@/api/scraper';
import {
  Server,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Activity,
  AlertCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

export function ProxyManager() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newProxy, setNewProxy] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    protocol: 'http',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProxyStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const data = await checkProxyHealth();
      setSuccess(`Health check complete: ${data.healthy}/${data.total} proxies healthy`);
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProxy = async () => {
    try {
      if (!newProxy.host || !newProxy.port) {
        setError('Host en port zijn verplicht');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      const proxy = {
        host: newProxy.host,
        port: parseInt(newProxy.port),
        username: newProxy.username || undefined,
        password: newProxy.password || undefined,
        protocol: newProxy.protocol,
      };

      await addProxy(proxy);
      setSuccess('Proxy toegevoegd');
      setNewProxy({
        host: '',
        port: '',
        username: '',
        password: '',
        protocol: 'http',
      });
      setShowAddForm(false);
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProxy = async (proxyUrl) => {
    if (!confirm('Weet je zeker dat je deze proxy wilt verwijderen?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await removeProxy(proxyUrl);
      setSuccess('Proxy verwijderd');
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetProxies = async () => {
    if (!confirm('Weet je zeker dat je alle proxy health status wilt resetten?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await resetProxies();
      setSuccess('Alle proxies gereset naar healthy status');
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proxy Management</h2>
          <p className="text-gray-600 mt-1">
            Beheer proxies voor anti-bot bypass met rotatie en automatische failover
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleCheckHealth}
            disabled={loading}
            className="flex-shrink-0"
          >
            <Activity className="h-4 w-4 mr-2" />
            Health Check
          </Button>
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={loading}
            className="flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Proxy Overzicht
            </CardTitle>
            <CardDescription>
              Status: {stats.enabled ? (
                <span className="text-green-600 font-medium">Ingeschakeld</span>
              ) : (
                <span className="text-gray-500">Uitgeschakeld</span>
              )}
              {stats.total > 0 && (
                <span className="ml-2">
                  • {stats.totalRequests} totaal requests • {stats.totalSuccessful} succesvol
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="h-4 w-4 text-gray-500" />
                  <div className="text-sm text-gray-600">Totaal Proxies</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-gray-600">Gezond</div>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.healthy || 0}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div className="text-sm text-gray-600">Niet Gezond</div>
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.unhealthy || 0}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div className="text-sm text-gray-600">Succes Rate</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.overallSuccessRate || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Proxy Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Proxy Toevoegen
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (showAddForm) {
                  setError(null);
                  setSuccess(null);
                }
              }}
            >
              {showAddForm ? 'Verbergen' : 'Nieuwe Proxy'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showAddForm && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="proxy.example.com"
                    value={newProxy.host}
                    onChange={(e) =>
                      setNewProxy({ ...newProxy, host: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="8080"
                    value={newProxy.port}
                    onChange={(e) =>
                      setNewProxy({ ...newProxy, port: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protocol
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={newProxy.protocol}
                    onChange={(e) =>
                      setNewProxy({ ...newProxy, protocol: e.target.value })
                    }
                  >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-gray-400 text-xs">(optioneel)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="username"
                    value={newProxy.username}
                    onChange={(e) =>
                      setNewProxy({ ...newProxy, username: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-gray-400 text-xs">(optioneel)</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="password"
                    value={newProxy.password}
                    onChange={(e) =>
                      setNewProxy({ ...newProxy, password: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddProxy} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Proxy Toevoegen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewProxy({
                      host: '',
                      port: '',
                      username: '',
                      password: '',
                      protocol: 'http',
                    });
                    setError(null);
                  }}
                >
                  Annuleren
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Proxy List */}
      {stats && stats.proxies && stats.proxies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Proxy Lijst</CardTitle>
            <CardDescription>
              {stats.proxies.length} proxy{stats.proxies.length !== 1 ? "'s" : ''} geconfigureerd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.proxies.map((proxy, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg transition-colors ${
                    proxy.isHealthy
                      ? 'border-green-200 bg-green-50/50 hover:bg-green-50'
                      : 'border-red-200 bg-red-50/50 hover:bg-red-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 truncate">{proxy.url}</span>
                      {proxy.isHealthy ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        {proxy.isHealthy ? (
                          <span className="text-green-600 font-medium">Gezond</span>
                        ) : (
                          <span className="text-red-600 font-medium">Niet Gezond</span>
                        )}
                      </div>
                      {proxy.totalRequests > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Requests:</span>
                          <span>{proxy.totalRequests}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-green-600">{proxy.successfulRequests} succesvol</span>
                        </div>
                      )}
                      {proxy.totalRequests > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-gray-500" />
                          <span className="font-medium">Success Rate:</span>
                          <span className={proxy.successRate >= 80 ? 'text-green-600' : proxy.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                            {proxy.successRate}%
                          </span>
                        </div>
                      )}
                      {proxy.responseTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="font-medium">Response Time:</span>
                          <span>{proxy.responseTime}ms</span>
                        </div>
                      )}
                      {proxy.lastChecked && (
                        <div className="md:col-span-2 text-xs text-gray-500">
                          Laatst gecontroleerd: {new Date(proxy.lastChecked).toLocaleString('nl-NL')}
                        </div>
                      )}
                      {proxy.consecutiveFailures > 0 && (
                        <div className="md:col-span-2 flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>Opeenvolgende fouten: {proxy.consecutiveFailures}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveProxy(proxy.url)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {stats.proxies.some(p => !p.isHealthy) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleResetProxies}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Alle Proxy Health Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {stats && (!stats.proxies || stats.proxies.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Geen proxies geconfigureerd
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              Voeg proxies toe om anti-bot bypass te gebruiken met automatische rotatie en failover.
              Proxies worden automatisch geroteerd en bij falen wordt de volgende proxy geprobeerd.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Eerste Proxy Toevoegen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

