export interface SalesRecord {
  orderId: string;
  orderDate: string;
  year: number;
  quarter: string;
  month: string;
  monthIndex: number; // 0-11
  customerName: string;
  customerSegment: string;
  region: string;
  country: string;
  category: string;
  subCategory: string;
  productName: string;
  salesRep: string;
  quantity: number;
  unitPrice: number;
  discount: number; // 0 to 0.30
  sales: number; // Total Sales
  cost: number;  // Cost of Goods Sold (COGS)
  cogs: number;  // Cost of Goods Sold alias
  grossProfit: number; // Total Sales - COGS
  operatingExpenses: number; // Operating Expenses (OPEX: SG&A, marketing, fulfillment)
  netProfit: number; // Gross Profit - Operating Expenses
  profit: number; // Backward-compatible profit
  profitMargin: number; // Percentage, e.g. 28.5
  paymentMethod: string;
  orderStatus: 'Completed' | 'Delivered' | 'Processing' | 'In Review';
  [key: string]: any;
}

export type DimensionColumn = 
  | 'region'
  | 'category'
  | 'subCategory'
  | 'customerSegment'
  | 'salesRep'
  | 'paymentMethod'
  | 'orderStatus'
  | 'country'
  | 'month'
  | 'quarter'
  | 'year';

export type MetricColumn = 
  | 'sales'
  | 'cogs'
  | 'grossProfit'
  | 'operatingExpenses'
  | 'netProfit'
  | 'profit'
  | 'quantity'
  | 'profitMargin'
  | 'discount'
  | 'cost';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export type ChartType = 
  | 'bar'
  | 'horizontal_bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'radar'
  | 'composed';

export type DashboardView = 
  | 'overview'
  | 'trends'
  | 'categories'
  | 'geographic'
  | 'team'
  | 'financial'
  | 'pivot'
  | 'builder'
  | 'table';

export interface DashboardFilter {
  dateRange: 'all' | '2024' | '2025' | 'q1' | 'q2' | 'q3' | 'q4' | 'last30';
  regions: string[];
  categories: string[];
  salesReps: string[];
  customerSegments: string[];
  orderStatuses: string[];
  searchQuery: string;
  minSales?: number;
  maxSales?: number;
}

export interface ChartBuilderConfig {
  xAxis: string;
  yAxis: string;
  secondaryYAxis?: string;
  groupBy?: string;
  chartType: ChartType;
  aggregation: AggregationType;
  sortBy: 'metric_desc' | 'metric_asc' | 'alpha' | 'date';
  topN: number;
}

export interface PivotConfig {
  rowField: string;
  colField: string;
  valField: string;
  aggregation: AggregationType;
}

export interface ColumnMetadata {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
  isNumeric: boolean;
  isDate: boolean;
  isCategorical: boolean;
  uniqueValuesCount: number;
  uniqueValues?: string[];
  min?: number;
  max?: number;
  sum?: number;
}

export interface KPISummary {
  totalSales: number;           // 1. Total Sales (Topline Revenue)
  cogs: number;                 // 2. Cost of Goods Sold (COGS)
  grossProfit: number;          // 3. Gross Profit (Total Sales - COGS)
  grossMargin: number;          // Gross Profit Margin %
  operatingExpenses: number;    // 4. Operating Expenses (OPEX: SG&A, marketing, logistics)
  opexRatio: number;            // OPEX % of Total Sales
  netProfit: number;            // 5. Net Profit (Gross Profit - Operating Expenses)
  netMargin: number;            // Net Profit Margin %
  totalProfit: number;          // Backward compatibility
  overallMargin: number;        // Backward compatibility
  totalOrders: number;
  totalUnits: number;
  avgOrderValue: number;
  avgDiscount: number;
  topCategory: { name: string; sales: number; share: number };
  topRegion: { name: string; sales: number; share: number };
  topSalesRep: { name: string; sales: number; deals: number };
  salesGrowthYoY?: number;
}

export interface SavedDashboard {
  id: string;
  user_id: string;
  name: string;
  data: {
    records: SalesRecord[];
    filter?: Partial<DashboardFilter>;
    view?: DashboardView;
    datasetName?: string;
  };
  created_at: string;
  updated_at?: string;
}
