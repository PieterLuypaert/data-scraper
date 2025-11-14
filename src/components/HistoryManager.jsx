import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  getHistory,
  deleteHistoryItem,
  bulkDeleteHistory,
  clearHistory,
} from '@/utils/storage';
import { batchExport } from '@/utils/export';
import { Trash2, Download, X, CheckSquare, Square } from 'lucide-react';

export function HistoryManager({ onSelectHistoryItem }) {
  const [history, setHistory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const hist = getHistory();
    setHistory(hist);
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === history.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(history.map((item) => item.id));
    }
  };

  const handleDelete = (id) => {
    if (confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      deleteHistoryItem(id);
      loadHistory();
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      alert('Selecteer eerst items om te verwijderen');
      return;
    }
    if (confirm(`Weet je zeker dat je ${selectedItems.length} item(s) wilt verwijderen?`)) {
      bulkDeleteHistory(selectedItems);
      loadHistory();
      setSelectedItems([]);
    }
  };

  const handleClearAll = () => {
    if (confirm('Weet je zeker dat je alle geschiedenis wilt wissen?')) {
      clearHistory();
      loadHistory();
      setSelectedItems([]);
    }
  };

  const handleExport = (format) => {
    if (selectedItems.length === 0) {
      alert('Selecteer eerst items om te exporteren');
      return;
    }
    const itemsToExport = history.filter((item) =>
      selectedItems.includes(item.id)
    );
    batchExport(itemsToExport, format, `scrape-history-${Date.now()}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-600">
          Geen geschiedenis beschikbaar
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Geschiedenis</h2>
          <p className="text-gray-600 mt-1">
            {history.length} item(s) opgeslagen
          </p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Verwijder ({selectedItems.length})
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleClearAll} size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Wis Alles
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSelectAll}
          className="p-1"
        >
          {selectedItems.length === history.length ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </Button>
        <span className="text-sm text-gray-600">
          {selectedItems.length > 0
            ? `${selectedItems.length} geselecteerd`
            : 'Selecteer alle items'}
        </span>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all ${
              selectedItems.includes(item.id)
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200'
            }`}
            onClick={() => onSelectHistoryItem?.(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                  className="p-1 mt-1"
                >
                  {selectedItems.includes(item.id) ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.data?.title || item.url}
                  </p>
                  <p className="text-sm text-gray-600 truncate">{item.url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(item.timestamp)}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      {item.data?.links?.length || 0} links
                    </span>
                    <span>
                      {item.data?.images?.length || 0} afbeeldingen
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

