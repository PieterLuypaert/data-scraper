import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';

export function SearchAndFilter({ onSearch, onFilter, onSort, initialFilters = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    showLinks: initialFilters.showLinks ?? true,
    showImages: initialFilters.showImages ?? true,
    showText: initialFilters.showText ?? true,
    showMeta: initialFilters.showMeta ?? true,
    showHeadings: initialFilters.showHeadings ?? true,
    showTables: initialFilters.showTables ?? true,
    showForms: initialFilters.showForms ?? true,
    showVideos: initialFilters.showVideos ?? true,
    showScripts: initialFilters.showScripts ?? true,
  });
  const [sortBy, setSortBy] = useState('none');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSort?.(value);
  };

  const resetFilters = () => {
    const defaultFilters = {
      showLinks: true,
      showImages: true,
      showText: true,
      showMeta: true,
      showHeadings: true,
      showTables: true,
      showForms: true,
      showVideos: true,
      showScripts: true,
    };
    setFilters(defaultFilters);
    setSearchQuery('');
    setSortBy('none');
    onFilter?.(defaultFilters);
    onSearch?.('');
    onSort?.('none');
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Zoek in gescrapede data..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {Object.values(filters).some(v => !v) && (
                <span className="ml-2 bg-gray-900 text-white rounded-full px-2 py-0.5 text-xs">
                  {Object.values(filters).filter(v => !v).length}
                </span>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="none">Geen sortering</option>
                <option value="title-asc">Titel A-Z</option>
                <option value="title-desc">Titel Z-A</option>
                <option value="links-asc">Meeste links</option>
                <option value="links-desc">Minste links</option>
                <option value="images-asc">Meeste afbeeldingen</option>
                <option value="images-desc">Minste afbeeldingen</option>
              </select>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showLinks}
                    onChange={(e) => handleFilterChange('showLinks', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Links</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showImages}
                    onChange={(e) => handleFilterChange('showImages', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Afbeeldingen</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showText}
                    onChange={(e) => handleFilterChange('showText', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Tekst</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showMeta}
                    onChange={(e) => handleFilterChange('showMeta', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Meta Tags</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showHeadings}
                    onChange={(e) => handleFilterChange('showHeadings', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Headings</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showTables}
                    onChange={(e) => handleFilterChange('showTables', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Tabellen</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showForms}
                    onChange={(e) => handleFilterChange('showForms', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Forms</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showVideos}
                    onChange={(e) => handleFilterChange('showVideos', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Video's</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showScripts}
                    onChange={(e) => handleFilterChange('showScripts', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Scripts</span>
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

