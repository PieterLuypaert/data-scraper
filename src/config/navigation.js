import {
  Globe,
  BarChart3,
  History,
  FileDown,
  GitCompare,
  Code,
  Network,
  Search,
  TrendingUp,
  Server,
  Brain,
  Languages,
} from "lucide-react";
import { t } from "../i18n";

// Tab definitions. Labels/tooltips are functions so they re-resolve through
// t() whenever the active language changes.
export const tabs = [
  {
    id: "scrape",
    getLabel: () => t("tabs.scrape"),
    getShortLabel: () => t("tabs.scrape"),
    icon: Globe,
    getTooltip: () => t("tooltips.scrape"),
  },
  {
    id: "crawl",
    getLabel: () => t("tabs.crawl"),
    getShortLabel: () => t("tabs.crawl"),
    icon: Network,
    getTooltip: () => t("tooltips.crawl"),
  },
  {
    id: "custom",
    getLabel: () => t("tabs.custom"),
    getShortLabel: () => t("tabs.custom"),
    icon: Code,
    getTooltip: () => t("tooltips.custom"),
  },
  {
    id: "bulk",
    getLabel: () => t("tabs.bulk"),
    getShortLabel: () => t("tabs.bulk"),
    icon: FileDown,
    getTooltip: () => t("tooltips.bulk"),
  },
  {
    id: "history",
    getLabel: () => t("tabs.history"),
    getShortLabel: () => t("tabs.history"),
    icon: History,
    getTooltip: () => t("tooltips.history"),
  },
  {
    id: "changes",
    getLabel: () => t("tabs.changes"),
    getShortLabel: () => t("tabs.changes"),
    icon: GitCompare,
    getTooltip: () => t("tooltips.changes"),
  },
  {
    id: "seo",
    getLabel: () => t("tabs.seo"),
    getShortLabel: () => t("tabs.seo"),
    icon: Search,
    getTooltip: () => t("tooltips.seo"),
  },
  {
    id: "visualization",
    getLabel: () => t("tabs.visualization"),
    getShortLabel: () => t("tabs.visualization"),
    icon: TrendingUp,
    getTooltip: () => t("tooltips.visualization"),
  },
  {
    id: "insights",
    getLabel: () => t("tabs.insights"),
    getShortLabel: () => t("tabs.insights"),
    icon: Brain,
    getTooltip: () => t("tooltips.insights"),
  },
  {
    id: "analytics",
    getLabel: () => t("tabs.analytics"),
    getShortLabel: () => t("tabs.analytics"),
    icon: BarChart3,
    getTooltip: () => t("tooltips.analytics"),
  },
  {
    id: "proxy",
    getLabel: () => t("tabs.proxy"),
    getShortLabel: () => t("tabs.proxy"),
    icon: Server,
    getTooltip: () => t("tooltips.proxy"),
  },
  {
    id: "settings",
    getLabel: () => t("tabs.settings"),
    getShortLabel: () => t("tabs.settings"),
    icon: Languages,
    getTooltip: () => t("tooltips.settings"),
  },
];

export const navGroups = [
  { key: "collect", ids: ["scrape", "crawl", "custom", "bulk"] },
  { key: "analyze", ids: ["seo", "visualization", "insights", "analytics"] },
  { key: "manage", ids: ["history", "changes", "proxy", "settings"] },
];

// Capabilities shown on the landing (scrape) page so it's visually clear
// what each part of the app does.
export const featureIds = [
  "crawl",
  "custom",
  "bulk",
  "seo",
  "visualization",
  "insights",
];

export const tabById = (id) => tabs.find((tab) => tab.id === id);
