// ─── Reports — Data Types & Mock Data ───────────────────────────────────────

export interface ReportStat {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface DailySale {
  day: string;         // short day label e.g. '01', '02'
  date: string;        // full date
  revenue: number;
  orders: number;
  profit: number;
}

export interface CategorySale {
  category: string;
  revenue: number;
  units: number;
  profit: number;
  margin: number;
  pct: number;         // % of total revenue
  color: string;
  icon: string;
}

export interface PaymentSplit {
  mode: string;
  amount: number;
  pct: number;
  color: string;
  icon: string;
}

export interface TopProduct {
  rank: number;
  sku: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  margin: number;
  stock: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TopCustomer {
  rank: number;
  name: string;
  phone: string;
  area: string;
  totalPurchases: number;
  invoices: number;
  outstanding: number;
  avgBill: number;
  lastVisit: string;
  avatar: string;
}

export interface StockAlert {
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  status: 'Critical' | 'Low' | 'Overstock';
  daysLeft: number;
  reorderQty: number;
  lastPurchaseRate: number;
  reorderValue: number;
}

// ─── KPI Stats ────────────────────────────────────────────────────────────────

export const REPORT_STATS: ReportStat[] = [
  { label: 'Monthly Revenue',  value: '₹14,82,300', change: 22.1, trend: 'up',   icon: 'trending_up',   color: '#2563eb' },
  { label: 'Total Orders',     value: '841',         change: 14.8, trend: 'up',   icon: 'receipt_long',  color: '#7c3aed' },
  { label: 'Avg Bill Value',   value: '₹1,762',      change: 6.4,  trend: 'up',   icon: 'payments',      color: '#16a34a' },
  { label: 'New Customers',    value: '24',          change: 20.0, trend: 'up',   icon: 'person_add',    color: '#ea580c' },
  { label: 'Units Sold',       value: '4,280',       change: 11.2, trend: 'up',   icon: 'inventory_2',   color: '#0f766e' },
  { label: 'Returns',          value: '18 Items',    change: 3.1,  trend: 'down', icon: 'assignment_return', color: '#dc2626' },
];

// ─── Daily sales — July 2026 (1–6 Jul) ───────────────────────────────────────

export const DAILY_SALES: DailySale[] = [
  { day: '01', date: '01 Jul', revenue: 38900,  orders: 22, profit: 10892 },
  { day: '02', date: '02 Jul', revenue: 44260,  orders: 27, profit: 12393 },
  { day: '03', date: '03 Jul', revenue: 41800,  orders: 24, profit: 11704 },
  { day: '04', date: '04 Jul', revenue: 52180,  orders: 31, profit: 14610 },
  { day: '05', date: '05 Jul', revenue: 48520,  orders: 29, profit: 13586 },
  { day: '06', date: '06 Jul', revenue: 31200,  orders: 18, profit: 8736  },
];

// ─── Sales by category ────────────────────────────────────────────────────────

export const CATEGORY_SALES: CategorySale[] = [
  { category: 'Plumbing',   revenue: 412800, units: 1240, profit: 102400, margin: 24.8, pct: 27.8, color: '#2563eb', icon: 'plumbing'              },
  { category: 'Electrical', revenue: 298600, units: 890,  profit: 74200,  margin: 24.8, pct: 20.1, color: '#f59e0b', icon: 'bolt'                  },
  { category: 'Building',   revenue: 252400, units: 480,  profit: 52600,  margin: 20.8, pct: 17.0, color: '#64748b', icon: 'domain'                },
  { category: 'Steel',      revenue: 198200, units: 320,  profit: 42800,  margin: 21.6, pct: 13.4, color: '#475569', icon: 'settings_input_component'},
  { category: 'Paint',      revenue: 148600, units: 210,  profit: 38200,  margin: 25.7, pct: 10.0, color: '#db2777', icon: 'format_paint'           },
  { category: 'Agriculture',revenue: 96800,  units: 680,  profit: 22400,  margin: 23.1, pct: 6.5,  color: '#16a34a', icon: 'grass'                  },
  { category: 'Hardware',   revenue: 54200,  units: 290,  profit: 14600,  margin: 26.9, pct: 3.7,  color: '#92400e', icon: 'hardware'               },
  { category: 'Sanitary',   revenue: 20700,  units: 170,  profit: 5600,   margin: 27.1, pct: 1.4,  color: '#0f766e', icon: 'water_drop'             },
];

// ─── Payment mode split ───────────────────────────────────────────────────────

export const PAYMENT_SPLIT: PaymentSplit[] = [
  { mode: 'UPI',           amount: 534800, pct: 36.1, color: '#2563eb', icon: 'contactless'           },
  { mode: 'Cash',          amount: 430200, pct: 29.0, color: '#16a34a', icon: 'payments'              },
  { mode: 'Credit',        amount: 296400, pct: 20.0, color: '#dc2626', icon: 'account_balance_wallet' },
  { mode: 'Cheque',        amount: 148500, pct: 10.0, color: '#f59e0b', icon: 'receipt'               },
  { mode: 'Bank Transfer', amount: 72400,  pct: 4.9,  color: '#7c3aed', icon: 'account_balance'       },
];

// ─── Top products ─────────────────────────────────────────────────────────────

export const TOP_PRODUCTS: TopProduct[] = [
  { rank: 1,  sku: 'PLB-001', name: 'PVC Pipe 1 inch',          category: 'Plumbing',   unitsSold: 380, revenue: 41800,  profit: 9500,  margin: 22.7, stock: 6,  trend: 'up'     },
  { rank: 2,  sku: 'BLD-001', name: 'Cement Bag OPC 50kg',      category: 'Building',   unitsSold: 310, revenue: 120900, profit: 15500, margin: 12.8, stock: 11, trend: 'up'     },
  { rank: 3,  sku: 'STL-002', name: 'Barbed Wire 50m Roll',      category: 'Steel',      unitsSold: 48,  revenue: 60000,  profit: 13000, margin: 21.7, stock: 3,  trend: 'stable' },
  { rank: 4,  sku: 'PNT-001', name: 'Paint White Exterior 20L', category: 'Paint',      unitsSold: 36,  revenue: 126000, profit: 25200, margin: 20.0, stock: 5,  trend: 'up'     },
  { rank: 5,  sku: 'ELE-001', name: 'LED Bulb 9W',              category: 'Electrical', unitsSold: 290, revenue: 26100,  profit: 7250,  margin: 27.8, stock: 12, trend: 'up'     },
  { rank: 6,  sku: 'ELE-003', name: 'Cable 2.5mm (per meter)',  category: 'Electrical', unitsSold: 820, revenue: 42640,  profit: 11550, margin: 27.1, stock: 6,  trend: 'up'     },
  { rank: 7,  sku: 'PLB-004', name: 'PVC Ball Valve 1 inch',    category: 'Plumbing',   unitsSold: 124, revenue: 24180,  profit: 6200,  margin: 25.6, stock: 4,  trend: 'stable' },
  { rank: 8,  sku: 'AGR-003', name: 'Tarpaulin 15x20 ft',       category: 'Agriculture',unitsSold: 28,  revenue: 21840,  profit: 5600,  margin: 25.6, stock: 2,  trend: 'down'   },
  { rank: 9,  sku: 'HRD-001', name: 'Drill Bit Set (13 pcs)',   category: 'Hardware',   unitsSold: 22,  revenue: 12760,  profit: 3520,  margin: 27.6, stock: 3,  trend: 'stable' },
  { rank: 10, sku: 'ELE-004', name: 'Float Switch',             category: 'Electrical', unitsSold: 44,  revenue: 19800,  profit: 5720,  margin: 28.9, stock: 7,  trend: 'up'     },
];

// ─── Top customers ────────────────────────────────────────────────────────────

export const TOP_CUSTOMERS: TopCustomer[] = [
  { rank: 1,  name: 'Mahesh Bhosale',   phone: '9845001122', area: 'Nashik',     totalPurchases: 312400, invoices: 28, outstanding: 47800,  avgBill: 11157, lastVisit: '05 Jul 2026', avatar: 'blue'   },
  { rank: 2,  name: 'Rajendra Gaikwad', phone: '9867890012', area: 'Pune',       totalPurchases: 280100, invoices: 24, outstanding: 52400,  avgBill: 11671, lastVisit: '03 Jul 2026', avatar: 'purple' },
  { rank: 3,  name: 'Akash Karande',    phone: '9834561200', area: 'Aurangabad', totalPurchases: 241000, invoices: 21, outstanding: 35600,  avgBill: 11476, lastVisit: '01 Jul 2026', avatar: 'orange' },
  { rank: 4,  name: 'Kiran Chavan',     phone: '9932100988', area: 'Nashik',     totalPurchases: 198200, invoices: 19, outstanding: 23700,  avgBill: 10432, lastVisit: '02 Jul 2026', avatar: 'green'  },
  { rank: 5,  name: 'Suresh Shinde',    phone: '9812345670', area: 'Pune',       totalPurchases: 189600, invoices: 18, outstanding: 31000,  avgBill: 10533, lastVisit: '04 Jul 2026', avatar: 'teal'   },
  { rank: 6,  name: 'Ramesh Patil',     phone: '9822011234', area: 'Nashik',     totalPurchases: 156800, invoices: 16, outstanding: 18500,  avgBill: 9800,  lastVisit: '06 Jul 2026', avatar: 'red'    },
  { rank: 7,  name: 'Anil Kambli',      phone: '9856234501', area: 'Satara',     totalPurchases: 167400, invoices: 17, outstanding: 28300,  avgBill: 9847,  lastVisit: '30 Jun 2026', avatar: 'blue'   },
  { rank: 8,  name: 'Sanjay Jadhav',    phone: '9765432101', area: 'Pune',       totalPurchases: 132000, invoices: 14, outstanding: 15400,  avgBill: 9429,  lastVisit: '05 Jul 2026', avatar: 'purple' },
  { rank: 9,  name: 'Neeta Salve',      phone: '9923456711', area: 'Nagpur',     totalPurchases: 52600,  invoices: 8,  outstanding: 14900,  avgBill: 6575,  lastVisit: '01 Jul 2026', avatar: 'orange' },
  { rank: 10, name: 'Priya Kulkarni',   phone: '9881122334', area: 'Nashik',     totalPurchases: 98600,  invoices: 12, outstanding: 22000,  avgBill: 8217,  lastVisit: '06 Jul 2026', avatar: 'pink'   },
];

// ─── Stock alerts ─────────────────────────────────────────────────────────────

export const STOCK_ALERTS: StockAlert[] = [
  { sku: 'AGR-003', name: 'Tarpaulin 15x20 ft',     category: 'Agriculture', stock: 2,  minStock: 10,  maxStock: 50,  status: 'Critical', daysLeft: 3,  reorderQty: 30,  lastPurchaseRate: 580,  reorderValue: 17400  },
  { sku: 'PLB-003', name: 'GI Pipe 1.5 inch',        category: 'Plumbing',   stock: 4,  minStock: 20,  maxStock: 150, status: 'Critical', daysLeft: 4,  reorderQty: 100, lastPurchaseRate: 95,   reorderValue: 9500   },
  { sku: 'PLB-004', name: 'PVC Ball Valve 1 inch',   category: 'Plumbing',   stock: 4,  minStock: 20,  maxStock: 100, status: 'Critical', daysLeft: 5,  reorderQty: 60,  lastPurchaseRate: 145,  reorderValue: 8700   },
  { sku: 'STL-002', name: 'Barbed Wire 50m Roll',    category: 'Steel',      stock: 3,  minStock: 15,  maxStock: 60,  status: 'Critical', daysLeft: 5,  reorderQty: 30,  lastPurchaseRate: 980,  reorderValue: 29400  },
  { sku: 'HRD-001', name: 'Drill Bit Set (13 pcs)',  category: 'Hardware',   stock: 3,  minStock: 12,  maxStock: 50,  status: 'Critical', daysLeft: 6,  reorderQty: 25,  lastPurchaseRate: 420,  reorderValue: 10500  },
  { sku: 'AGR-001', name: 'Shade Net Green',         category: 'Agriculture',stock: 3,  minStock: 10,  maxStock: 200, status: 'Critical', daysLeft: 7,  reorderQty: 100, lastPurchaseRate: 28,   reorderValue: 2800   },
  { sku: 'PLB-001', name: 'PVC Pipe 1 inch',         category: 'Plumbing',   stock: 6,  minStock: 20,  maxStock: 200, status: 'Low',      daysLeft: 9,  reorderQty: 150, lastPurchaseRate: 85,   reorderValue: 12750  },
  { sku: 'ELE-003', name: 'Cable 2.5mm',             category: 'Electrical', stock: 6,  minStock: 25,  maxStock: 500, status: 'Low',      daysLeft: 10, reorderQty: 300, lastPurchaseRate: 38,   reorderValue: 11400  },
  { sku: 'AGR-002', name: 'Drip Irrigation Tube',    category: 'Agriculture',stock: 7,  minStock: 20,  maxStock: 500, status: 'Low',      daysLeft: 12, reorderQty: 250, lastPurchaseRate: 8,    reorderValue: 2000   },
  { sku: 'ELE-004', name: 'Float Switch',            category: 'Electrical', stock: 7,  minStock: 25,  maxStock: 100, status: 'Low',      daysLeft: 14, reorderQty: 50,  lastPurchaseRate: 320,  reorderValue: 16000  },
  { sku: 'STL-001', name: 'MS Wire 12 Gauge',        category: 'Steel',      stock: 8,  minStock: 25,  maxStock: 200, status: 'Low',      daysLeft: 14, reorderQty: 100, lastPurchaseRate: 72,   reorderValue: 7200   },
  { sku: 'PLB-005', name: 'Sanitary T-Trap 32mm',    category: 'Plumbing',   stock: 5,  minStock: 20,  maxStock: 100, status: 'Low',      daysLeft: 8,  reorderQty: 60,  lastPurchaseRate: 55,   reorderValue: 3300   },
];
