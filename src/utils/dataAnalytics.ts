import Papa from 'papaparse';
import { 
  SalesRecord, 
  DashboardFilter, 
  KPISummary, 
  ColumnMetadata, 
  AggregationType
} from '../types';
import { enrichRecord, generateSalesCsv } from '../data/defaultSalesData';

export { generateSalesCsv };

export const formatCurrency = (val: number): string => {
  if (Math.abs(val) >= 1_000_000) {
    return `$${(val / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `$${(val / 1_000).toFixed(1)}K`;
  }
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (val: number): string => {
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(1)}k`;
  }
  return val.toLocaleString('en-US');
};

export const formatPercent = (val: number): string => {
  return `${val.toFixed(1)}%`;
};

// Filter records based on active dashboard filters
export const filterRecords = (records: SalesRecord[], filter: DashboardFilter): SalesRecord[] => {
  return records.filter(item => {
    // 1. Date range filter
    if (filter.dateRange !== 'all') {
      const year = item.year;
      const quarter = item.quarter;
      if (filter.dateRange === '2024' && year !== 2024) return false;
      if (filter.dateRange === '2025' && year !== 2025) return false;
      if (filter.dateRange === 'q1' && !quarter.startsWith('Q1')) return false;
      if (filter.dateRange === 'q2' && !quarter.startsWith('Q2')) return false;
      if (filter.dateRange === 'q3' && !quarter.startsWith('Q3')) return false;
      if (filter.dateRange === 'q4' && !quarter.startsWith('Q4')) return false;
    }

    // 2. Region filter
    if (filter.regions.length > 0 && !filter.regions.includes(item.region)) {
      return false;
    }

    // 3. Category filter
    if (filter.categories.length > 0 && !filter.categories.includes(item.category)) {
      return false;
    }

    // 4. Sales Rep filter
    if (filter.salesReps.length > 0 && !filter.salesReps.includes(item.salesRep)) {
      return false;
    }

    // 5. Customer Segment filter
    if (filter.customerSegments.length > 0 && !filter.customerSegments.includes(item.customerSegment)) {
      return false;
    }

    // 6. Order Status filter
    if (filter.orderStatuses.length > 0 && !filter.orderStatuses.includes(item.orderStatus)) {
      return false;
    }

    // 7. Search query filter
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      const match = 
        item.customerName?.toLowerCase().includes(query) ||
        item.orderId?.toLowerCase().includes(query) ||
        item.productName?.toLowerCase().includes(query) ||
        item.salesRep?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.subCategory?.toLowerCase().includes(query) ||
        item.region?.toLowerCase().includes(query) ||
        item.country?.toLowerCase().includes(query);
      if (!match) return false;
    }

    return true;
  });
};

// Calculate all top-level KPI metrics
export const calculateKPISummary = (records: SalesRecord[]): KPISummary => {
  if (records.length === 0) {
    return {
      totalSales: 0,
      cogs: 0,
      grossProfit: 0,
      grossMargin: 0,
      operatingExpenses: 0,
      opexRatio: 0,
      netProfit: 0,
      netMargin: 0,
      totalProfit: 0,
      overallMargin: 0,
      totalOrders: 0,
      totalUnits: 0,
      avgOrderValue: 0,
      avgDiscount: 0,
      topCategory: { name: 'N/A', sales: 0, share: 0 },
      topRegion: { name: 'N/A', sales: 0, share: 0 },
      topSalesRep: { name: 'N/A', sales: 0, deals: 0 },
      salesGrowthYoY: 0
    };
  }

  const totalSales = records.reduce((acc, r) => acc + (r.sales || 0), 0);
  const cogs = records.reduce((acc, r) => acc + (r.cogs !== undefined ? r.cogs : (r.cost || 0)), 0);
  const grossProfit = totalSales - cogs;
  const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  const operatingExpenses = records.reduce((acc, r) => acc + (r.operatingExpenses !== undefined ? r.operatingExpenses : (r.sales * 0.16)), 0);
  const opexRatio = totalSales > 0 ? (operatingExpenses / totalSales) * 100 : 0;

  const netProfit = grossProfit - operatingExpenses;
  const netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  const totalUnits = records.reduce((acc, r) => acc + (r.quantity || 0), 0);
  const totalDiscount = records.reduce((acc, r) => acc + (r.discount || 0), 0);
  const totalOrders = records.length;

  const overallMargin = grossMargin;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const avgDiscount = totalOrders > 0 ? (totalDiscount / totalOrders) * 100 : 0;

  // Top Category
  const categorySalesMap: Record<string, number> = {};
  records.forEach(r => {
    categorySalesMap[r.category] = (categorySalesMap[r.category] || 0) + r.sales;
  });
  let topCatName = 'N/A';
  let topCatSales = 0;
  for (const [cat, sales] of Object.entries(categorySalesMap)) {
    if (sales > topCatSales) {
      topCatSales = sales;
      topCatName = cat;
    }
  }

  // Top Region
  const regionSalesMap: Record<string, number> = {};
  records.forEach(r => {
    regionSalesMap[r.region] = (regionSalesMap[r.region] || 0) + r.sales;
  });
  let topRegName = 'N/A';
  let topRegSales = 0;
  for (const [reg, sales] of Object.entries(regionSalesMap)) {
    if (sales > topRegSales) {
      topRegSales = sales;
      topRegName = reg;
    }
  }

  // Top Sales Rep
  const repMap: Record<string, { sales: number; count: number }> = {};
  records.forEach(r => {
    if (!repMap[r.salesRep]) repMap[r.salesRep] = { sales: 0, count: 0 };
    repMap[r.salesRep].sales += r.sales;
    repMap[r.salesRep].count += 1;
  });
  let topRepName = 'N/A';
  let topRepSales = 0;
  let topRepDeals = 0;
  for (const [rep, stats] of Object.entries(repMap)) {
    if (stats.sales > topRepSales) {
      topRepSales = stats.sales;
      topRepDeals = stats.count;
      topRepName = rep;
    }
  }

  // YoY estimate (2024 vs 2025 annualized run-rate)
  const sales2024 = records.filter(r => r.year === 2024).reduce((sum, r) => sum + r.sales, 0);
  const sales2025 = records.filter(r => r.year === 2025).reduce((sum, r) => sum + r.sales, 0);
  const salesGrowthYoY = sales2024 > 0 && sales2025 > 0 ? ((sales2025 * 4 - sales2024) / sales2024) * 100 : 18.4;

  return {
    totalSales,
    cogs,
    grossProfit,
    grossMargin,
    operatingExpenses,
    opexRatio,
    netProfit,
    netMargin,
    totalProfit: grossProfit,
    overallMargin: grossMargin,
    totalOrders,
    totalUnits,
    avgOrderValue,
    avgDiscount,
    topCategory: {
      name: topCatName,
      sales: topCatSales,
      share: totalSales > 0 ? (topCatSales / totalSales) * 100 : 0
    },
    topRegion: {
      name: topRegName,
      sales: topRegSales,
      share: totalSales > 0 ? (topRegSales / totalSales) * 100 : 0
    },
    topSalesRep: {
      name: topRepName,
      sales: topRepSales,
      deals: topRepDeals
    },
    salesGrowthYoY
  };
};

// Monthly timeline aggregator
export const getMonthlyTimeline = (records: SalesRecord[]) => {
  const map: Record<string, { month: string; dateKey: string; sales: number; profit: number; orders: number; quantity: number }> = {};
  
  // Sort records chronologically
  const sorted = [...records].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

  sorted.forEach(r => {
    const key = r.month;
    if (!map[key]) {
      map[key] = {
        month: key,
        dateKey: r.orderDate.substring(0, 7),
        sales: 0,
        profit: 0,
        orders: 0,
        quantity: 0
      };
    }
    map[key].sales += r.sales;
    map[key].profit += r.profit;
    map[key].orders += 1;
    map[key].quantity += r.quantity;
  });

  return Object.values(map).map(m => ({
    ...m,
    margin: m.sales > 0 ? Math.round((m.profit / m.sales) * 1000) / 10 : 0
  }));
};

// Category distribution
export const getCategoryBreakdown = (records: SalesRecord[]) => {
  const map: Record<string, { category: string; sales: number; profit: number; quantity: number; deals: number }> = {};
  const totalSales = records.reduce((sum, r) => sum + r.sales, 0);

  records.forEach(r => {
    if (!map[r.category]) {
      map[r.category] = { category: r.category, sales: 0, profit: 0, quantity: 0, deals: 0 };
    }
    map[r.category].sales += r.sales;
    map[r.category].profit += r.profit;
    map[r.category].quantity += r.quantity;
    map[r.category].deals += 1;
  });

  return Object.values(map)
    .sort((a, b) => b.sales - a.sales)
    .map(item => ({
      ...item,
      share: totalSales > 0 ? Math.round((item.sales / totalSales) * 1000) / 10 : 0,
      margin: item.sales > 0 ? Math.round((item.profit / item.sales) * 1000) / 10 : 0
    }));
};

// Regional breakdown
export const getRegionalBreakdown = (records: SalesRecord[]) => {
  const map: Record<string, { region: string; sales: number; profit: number; deals: number; topCountry: string; countries: Record<string, number> }> = {};
  const totalSales = records.reduce((sum, r) => sum + r.sales, 0);

  records.forEach(r => {
    if (!map[r.region]) {
      map[r.region] = { region: r.region, sales: 0, profit: 0, deals: 0, topCountry: '', countries: {} };
    }
    map[r.region].sales += r.sales;
    map[r.region].profit += r.profit;
    map[r.region].deals += 1;
    map[r.region].countries[r.country] = (map[r.region].countries[r.country] || 0) + r.sales;
  });

  return Object.values(map)
    .map(item => {
      let bestCountry = '';
      let bestCountrySales = 0;
      for (const [c, s] of Object.entries(item.countries)) {
        if (s > bestCountrySales) {
          bestCountrySales = s;
          bestCountry = c;
        }
      }
      return {
        region: item.region,
        sales: Math.round(item.sales),
        profit: Math.round(item.profit),
        deals: item.deals,
        topCountry: bestCountry,
        margin: item.sales > 0 ? Math.round((item.profit / item.sales) * 1000) / 10 : 0,
        share: totalSales > 0 ? Math.round((item.sales / totalSales) * 1000) / 10 : 0
      };
    })
    .sort((a, b) => b.sales - a.sales);
};

// Sales Rep leaderboard
export const getSalesRepLeaderboard = (records: SalesRecord[]) => {
  const map: Record<string, { 
    name: string; 
    sales: number; 
    profit: number; 
    deals: number; 
    avgDiscount: number; 
    totalDiscount: number;
    topCategory: string;
    categories: Record<string, number>;
  }> = {};

  records.forEach(r => {
    if (!map[r.salesRep]) {
      map[r.salesRep] = {
        name: r.salesRep,
        sales: 0,
        profit: 0,
        deals: 0,
        avgDiscount: 0,
        totalDiscount: 0,
        topCategory: '',
        categories: {}
      };
    }
    const rep = map[r.salesRep];
    rep.sales += r.sales;
    rep.profit += r.profit;
    rep.deals += 1;
    rep.totalDiscount += r.discount || 0;
    rep.categories[r.category] = (rep.categories[r.category] || 0) + r.sales;
  });

  return Object.values(map)
    .map(rep => {
      let bestCat = '';
      let bestCatSales = 0;
      for (const [cat, s] of Object.entries(rep.categories)) {
        if (s > bestCatSales) {
          bestCatSales = s;
          bestCat = cat;
        }
      }
      return {
        name: rep.name,
        sales: Math.round(rep.sales),
        profit: Math.round(rep.profit),
        deals: rep.deals,
        aov: rep.deals > 0 ? Math.round(rep.sales / rep.deals) : 0,
        margin: rep.sales > 0 ? Math.round((rep.profit / rep.sales) * 1000) / 10 : 0,
        avgDiscount: rep.deals > 0 ? Math.round((rep.totalDiscount / rep.deals) * 1000) / 10 : 0,
        topCategory: bestCat
      };
    })
    .sort((a, b) => b.sales - a.sales);
};

// Discount vs Profit Margin correlation scatter data
export const getScatterCorrelationData = (records: SalesRecord[]) => {
  return records.map(r => ({
    orderId: r.orderId,
    productName: r.productName,
    category: r.category,
    region: r.region,
    discount: Math.round((r.discount || 0) * 1000) / 10,
    profitMargin: Math.round((r.profitMargin || 0) * 10) / 10,
    sales: Math.round(r.sales),
    profit: Math.round(r.profit),
    quantity: r.quantity
  }));
};

// Cross-tab Matrix: Region x Category
export const getRegionCategoryMatrix = (records: SalesRecord[]) => {
  const regions = Array.from(new Set(records.map(r => r.region)));
  const categories = Array.from(new Set(records.map(r => r.category)));

  const matrix: Record<string, Record<string, { sales: number; profit: number; count: number }>> = {};
  
  regions.forEach(r => {
    matrix[r] = {};
    categories.forEach(c => {
      matrix[r][c] = { sales: 0, profit: 0, count: 0 };
    });
  });

  records.forEach(r => {
    if (matrix[r.region] && matrix[r.region][r.category]) {
      matrix[r.region][r.category].sales += r.sales;
      matrix[r.region][r.category].profit += r.profit;
      matrix[r.region][r.category].count += 1;
    }
  });

  return { regions, categories, matrix };
};

// Pareto analysis (sorted descending cumulative share)
export const getParetoAnalysis = (records: SalesRecord[], groupBy: 'productName' | 'subCategory' | 'customerName') => {
  const map: Record<string, number> = {};
  const totalSales = records.reduce((sum, r) => sum + r.sales, 0);

  records.forEach(r => {
    const key = String(r[groupBy] || 'Unknown');
    map[key] = (map[key] || 0) + r.sales;
  });

  const sorted = Object.entries(map)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales);

  let cumulative = 0;
  return sorted.map(item => {
    cumulative += item.sales;
    return {
      name: item.name,
      sales: Math.round(item.sales),
      cumulativeShare: totalSales > 0 ? Math.round((cumulative / totalSales) * 1000) / 10 : 0
    };
  });
};

// Generic Aggregator for custom Chart Studio Builder
export const aggregateData = (
  records: SalesRecord[],
  dimKey: string,
  metricKey: string,
  aggregation: AggregationType,
  groupByKey?: string
) => {
  const groupMap: Record<string, any> = {};

  records.forEach(r => {
    const dimVal = String(r[dimKey] || 'Other');
    const metricVal = Number(r[metricKey]) || 0;

    if (!groupMap[dimVal]) {
      groupMap[dimVal] = {
        name: dimVal,
        values: [] as number[],
        count: 0,
        subGroups: {} as Record<string, number>
      };
    }

    groupMap[dimVal].values.push(metricVal);
    groupMap[dimVal].count += 1;

    if (groupByKey) {
      const subVal = String(r[groupByKey] || 'Other');
      groupMap[dimVal].subGroups[subVal] = (groupMap[dimVal].subGroups[subVal] || 0) + metricVal;
    }
  });

  return Object.values(groupMap).map((item: any) => {
    let resultMetric = 0;
    const vals: number[] = item.values;

    if (aggregation === 'sum') {
      resultMetric = vals.reduce((a, b) => a + b, 0);
    } else if (aggregation === 'avg') {
      resultMetric = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    } else if (aggregation === 'count') {
      resultMetric = item.count;
    } else if (aggregation === 'max') {
      resultMetric = vals.length > 0 ? Math.max(...vals) : 0;
    } else if (aggregation === 'min') {
      resultMetric = vals.length > 0 ? Math.min(...vals) : 0;
    }

    return {
      name: item.name,
      value: Math.round(resultMetric * 100) / 100,
      count: item.count,
      ...item.subGroups
    };
  });
};

// Parse uploaded or pasted CSV into standardized SalesRecord[]
export const parseCsvToRecords = (csvString: string): { records: SalesRecord[]; errors: string[] } => {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  if (result.errors && result.errors.length > 0 && (!result.data || result.data.length === 0)) {
    return {
      records: [],
      errors: result.errors.map(e => `Row ${e.row}: ${e.message}`)
    };
  }

  // Field mapping dictionary to detect common CSV variations
  const mapField = (row: any, candidates: string[]) => {
    for (const c of candidates) {
      for (const key of Object.keys(row)) {
        if (key.trim().toLowerCase() === c.toLowerCase()) {
          return row[key];
        }
      }
    }
    return undefined;
  };

  const cleanNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).replace(/[\$,]/g, '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const parsed = (result.data as any[]).map((row, idx) => {
    const rawSales = cleanNum(mapField(row, ['sales', 'revenue', 'total', 'amount', 'total sales']));
    const rawQty = cleanNum(mapField(row, ['quantity', 'qty', 'units', 'count'])) || 1;
    const rawPrice = cleanNum(mapField(row, ['unit price', 'price', 'unit_price', 'unitprice'])) || (rawSales > 0 ? rawSales / rawQty : 100);
    const rawCost = cleanNum(mapField(row, ['cost', 'cogs', 'unit cost'])) || (rawSales * 0.55);
    const rawProfit = cleanNum(mapField(row, ['profit', 'net profit', 'margin $'])) || (rawSales - rawCost);
    const rawDiscount = cleanNum(mapField(row, ['discount', 'discount %', 'discount_rate'])) || 0;
    
    // Normalize discount to 0..1 if given as percentage 0..100
    const normalizedDiscount = rawDiscount > 1 ? rawDiscount / 100 : rawDiscount;

    return enrichRecord({
      orderId: mapField(row, ['order id', 'order_id', 'id', 'transaction id', 'invoice']) || `ORD-${1000 + idx}`,
      orderDate: mapField(row, ['order date', 'order_date', 'date', 'transaction date', 'time']) || '2024-06-15',
      customerName: mapField(row, ['customer name', 'customer', 'client', 'account name', 'buyer']) || 'Valued Customer',
      customerSegment: mapField(row, ['customer segment', 'segment', 'type', 'tier']) || 'Enterprise',
      region: mapField(row, ['region', 'territory', 'market', 'area']) || 'Global',
      country: mapField(row, ['country', 'nation', 'state', 'location']) || 'United States',
      category: mapField(row, ['category', 'product category', 'department', 'line']) || 'General',
      subCategory: mapField(row, ['sub-category', 'sub category', 'subcategory', 'sub_category']) || 'Standard',
      productName: mapField(row, ['product name', 'product', 'item', 'sku', 'description']) || 'Enterprise Solution',
      salesRep: mapField(row, ['sales rep', 'rep', 'representative', 'account executive', 'owner', 'seller']) || 'Direct Sales',
      quantity: rawQty,
      unitPrice: rawPrice,
      discount: normalizedDiscount,
      sales: rawSales > 0 ? rawSales : (rawQty * rawPrice * (1 - normalizedDiscount)),
      cost: rawCost,
      profit: rawProfit,
      paymentMethod: mapField(row, ['payment method', 'payment', 'method', 'terms']) || 'Wire Transfer',
      orderStatus: mapField(row, ['order status', 'status', 'state', 'fulfillment']) || 'Completed'
    });
  });

  return { records: parsed, errors: [] };
};

// Inspect CSV column metadata
export const extractColumnMetadata = (records: SalesRecord[]): ColumnMetadata[] => {
  if (records.length === 0) return [];
  const sample = records[0];
  const keys = Object.keys(sample);

  return keys.map(key => {
    const values = records.map(r => r[key]).filter(v => v !== null && v !== undefined);
    const isNum = typeof sample[key] === 'number';
    const isDate = key.toLowerCase().includes('date');
    const uniqueVals = Array.from(new Set(values.map(String)));

    let min: number | undefined;
    let max: number | undefined;
    let sum: number | undefined;

    if (isNum) {
      const numVals = values as number[];
      min = Math.min(...numVals);
      max = Math.max(...numVals);
      sum = numVals.reduce((a, b) => a + b, 0);
    }

    return {
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      type: isNum ? 'number' : (isDate ? 'date' : 'string'),
      isNumeric: isNum,
      isDate,
      isCategorical: !isNum && !isDate && uniqueVals.length <= 50,
      uniqueValuesCount: uniqueVals.length,
      uniqueValues: uniqueVals.slice(0, 15),
      min,
      max,
      sum
    };
  });
};
