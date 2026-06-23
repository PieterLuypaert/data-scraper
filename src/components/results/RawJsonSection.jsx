import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export function RawJsonSection({ data, expandedSections, toggleSection }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => toggleSection('details')}
          className="w-full justify-between p-0 h-auto"
        >
          <CardTitle className="text-lg">Raw JSON</CardTitle>
          <span className="text-sm text-gray-600">
            {expandedSections.details ? 'Verberg' : 'Toon'} Details
          </span>
        </Button>
      </CardHeader>
      {expandedSections.details && (
        <CardContent className="pt-0">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-auto max-h-96 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
