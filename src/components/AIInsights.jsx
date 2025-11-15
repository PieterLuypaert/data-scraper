import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Tooltip } from "./ui/tooltip";
import {
  Brain,
  Sparkles,
  Tag,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { generateAIInsights } from "../utils/aiInsights";
import { t } from "../i18n";

export function AIInsights({ data }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) {
      generateInsights();
    }
  }, [data]);

  const generateInsights = async () => {
    if (!data) return;

    setLoading(true);
    setError(null);

    try {
      // Use frontend utility for now (can switch to API call)
      const result = generateAIInsights(data);
      setInsights(result);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("insights.title")}
          </CardTitle>
          <CardDescription>{t("insights.noData")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("insights.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">
              {t("insights.generating")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("insights.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("insights.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={generateInsights} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getSentimentColor = (sentiment) => {
    if (sentiment === "positive") return "text-green-600";
    if (sentiment === "negative") return "text-red-600";
    return "text-gray-600";
  };

  const getSentimentBgColor = (sentiment) => {
    if (sentiment === "positive") return "bg-green-100";
    if (sentiment === "negative") return "bg-red-100";
    return "bg-gray-100";
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      {insights.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("insights.summary")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {insights.categories && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {t("insights.categories")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium capitalize">
                    {insights.categories.primary}
                  </span>
                  <span className="text-sm text-gray-600">
                    {insights.categories.primaryConfidence}%{" "}
                    {t("insights.confidence")}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full"
                    style={{
                      width: `${insights.categories.primaryConfidence}%`,
                    }}
                  />
                </div>
              </div>
              {insights.categories.secondary && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {insights.categories.secondary}
                    </span>
                    <span className="text-xs text-gray-500">
                      {insights.categories.secondaryConfidence}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-gray-400 h-1 rounded-full"
                      style={{
                        width: `${insights.categories.secondaryConfidence}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topics */}
      {insights.topics && insights.topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("insights.topics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.topics.map((topic, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                >
                  <span>{topic.name}</span>
                  <span className="text-xs text-gray-500">
                    ({topic.relevance}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Sentiment */}
      {insights.sentiment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("insights.sentiment")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">
                  {t(`insights.${insights.sentiment.sentiment}`)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentBgColor(
                    insights.sentiment.sentiment
                  )} ${getSentimentColor(insights.sentiment.sentiment)}`}
                >
                  {insights.sentiment.score > 0 ? "+" : ""}
                  {insights.sentiment.score}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-medium">
                    {insights.sentiment.positive}
                  </div>
                  <div className="text-gray-600">{t("insights.positive")}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 font-medium">
                    {insights.sentiment.neutral}
                  </div>
                  <div className="text-gray-600">{t("insights.neutral")}</div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 font-medium">
                    {insights.sentiment.negative}
                  </div>
                  <div className="text-gray-600">{t("insights.negative")}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment by Section */}
      {insights.sentimentBySection &&
        Object.keys(insights.sentimentBySection).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("insights.sentimentBySection")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(insights.sentimentBySection).map(
                  ([section, sentiment]) => (
                    <div
                      key={section}
                      className="border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">
                          {section}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getSentimentBgColor(
                            sentiment.sentiment
                          )} ${getSentimentColor(sentiment.sentiment)}`}
                        >
                          {sentiment.sentiment} (
                          {sentiment.score > 0 ? "+" : ""}
                          {sentiment.score})
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
