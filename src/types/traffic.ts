export type TrafficPeriod = "today" | "7d" | "30d" | "all" | "custom";

export interface TrafficSummary {
  total_pageviews: number;
  pageviews_change: number;
  unique_visitors: number;
  visitors_change: number;
  today_pageviews: number;
  daily_avg_pageviews: number;
}

export interface TrafficTimeSeriesPoint {
  date: string;
  formatted_date: string;
  pageviews: number;
  unique_visitors: number;
}

export interface TrafficTopTool {
  tool_id: number;
  tool_name: string;
  tool_slug: string;
  icon: string;
  category_name: string;
  category_slug: string;
  pageviews: number;
  unique_visitors: number;
  percentage: number;
}

export interface TrafficPopularPage {
  path: string;
  page_title: string;
  page_type: string;
  category_name: string | null;
  tool_name: string | null;
  pageviews: number;
  percentage: number;
}

export interface BreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

export interface SourceBreakdownItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TopReferrerItem {
  referrer_host: string;
  count: number;
}

export interface TrafficDemographics {
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  operating_systems: BreakdownItem[];
}

export interface TrafficSources {
  breakdown: SourceBreakdownItem[];
  top_referrers: TopReferrerItem[];
}

export interface TrafficRecentActivity {
  id: number;
  visitor_id: string;
  path: string;
  page_title: string;
  page_type: string;
  tool_name: string | null;
  category_name: string | null;
  device_type: string;
  browser: string;
  os: string;
  referrer_type: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  time_ago: string;
}

export interface TrafficActivityPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface TrafficStatsData {
  period: {
    type: TrafficPeriod;
    start_date: string;
    end_date: string;
    num_days: number;
  };
  summary: TrafficSummary;
  time_series: TrafficTimeSeriesPoint[];
  top_tools: TrafficTopTool[];
  total_tool_views: number;
  popular_pages: TrafficPopularPage[];
  demographics: TrafficDemographics;
  sources: TrafficSources;
  recent_activity: {
    items: TrafficRecentActivity[];
    pagination: TrafficActivityPagination;
  };
}

export interface TrafficStatsResponse {
  success: boolean;
  message?: string;
  data?: TrafficStatsData;
}
