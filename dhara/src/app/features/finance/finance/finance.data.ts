// ─── Finance — Data Types & Mock Data ───────────────────────────────────────

export type ExpenseCategory =
  | 'Purchases' | 'Salaries' | 'Rent' | 'Electricity' | 'Transport'
  | 'Packaging' | 'Maintenance' | 'Marketing' | 'Miscellaneous';

export type TxType = 'Income' | 'Expense' | 'Transfer';

export interface FinanceStat {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  color: string;
  sub?: string;
}

export interface MonthlyFlow {
  month: string;
  shortMonth: string;
  revenue: number;
  purchases: number;
  expenses: number;      // overheads (non-purchase)
  grossProfit: number;
  netProfit: number;
  openingCash: number;
  closingCash: number;
}

export interface ExpenseLine {
  id: number;
  category: ExpenseCategory;
  amount: number;
  pct: number;           // % of total expenses
  icon: string;
  color: string;
  lastMonth: number;
  change: number;        // % change vs last month
}

export interface FinanceTx {
  id: number;
  date: string;
  type: TxType;
  category: ExpenseCategory | 'Sales Revenue' | 'Customer Payment' | 'Loan';
  description: string;
  amount: number;
  mode: string;
  ref?: string;
}

// ─── KPI Stats ───────────────────────────────────────────────────────────────

export const FINANCE_STATS: FinanceStat[] = [
  { label: 'Monthly Revenue',   value: '₹14,82,300', change: 22.1, trend: 'up',   icon: 'trending_up',            color: '#2563eb', sub: 'Jul 2026' },
  { label: 'Monthly Purchases', value: '₹8,41,966',  change: 8.4,  trend: 'up',   icon: 'shopping_bag',           color: '#7c3aed', sub: 'Cost of goods' },
  { label: 'Gross Profit',      value: '₹6,40,334',  change: 18.2, trend: 'up',   icon: 'show_chart',             color: '#16a34a', sub: '43.2% margin' },
  { label: 'Overheads',         value: '₹2,27,534',  change: 3.1,  trend: 'up',   icon: 'receipt_long',           color: '#ea580c', sub: 'Excl. purchases' },
  { label: 'Net Profit',        value: '₹4,12,800',  change: 15.3, trend: 'up',   icon: 'account_balance',        color: '#0f766e', sub: '27.8% margin' },
  { label: 'Cash Available',    value: '₹3,24,500',  change: 8.2,  trend: 'up',   icon: 'local_atm',              color: '#9333ea', sub: 'Bank + Hand' },
  { label: 'Receivables',       value: '₹3,92,550',  change: 4.6,  trend: 'down', icon: 'account_balance_wallet', color: '#dc2626', sub: 'Customer dues' },
  { label: 'Payables',          value: '₹2,41,200',  change: 1.8,  trend: 'down', icon: 'local_shipping',         color: '#b45309', sub: 'Supplier dues' },
];

// ─── 12-month cash flow ───────────────────────────────────────────────────────

export const MONTHLY_FLOW: MonthlyFlow[] = [
  { month: 'August 2025',    shortMonth: 'Aug',  revenue: 980200,  purchases: 612000, expenses: 188400, grossProfit: 368200, netProfit: 179800, openingCash: 180000, closingCash: 210000 },
  { month: 'September 2025', shortMonth: 'Sep',  revenue: 1042000, purchases: 648000, expenses: 196200, grossProfit: 394000, netProfit: 197800, openingCash: 210000, closingCash: 248000 },
  { month: 'October 2025',   shortMonth: 'Oct',  revenue: 1124000, purchases: 698000, expenses: 202000, grossProfit: 426000, netProfit: 224000, openingCash: 248000, closingCash: 302000 },
  { month: 'November 2025',  shortMonth: 'Nov',  revenue: 1089000, purchases: 671000, expenses: 198000, grossProfit: 418000, netProfit: 220000, openingCash: 302000, closingCash: 354000 },
  { month: 'December 2025',  shortMonth: 'Dec',  revenue: 1348000, purchases: 842000, expenses: 214000, grossProfit: 506000, netProfit: 292000, openingCash: 354000, closingCash: 486000 },
  { month: 'January 2026',   shortMonth: 'Jan',  revenue: 1102000, purchases: 680000, expenses: 206000, grossProfit: 422000, netProfit: 216000, openingCash: 486000, closingCash: 546000 },
  { month: 'February 2026',  shortMonth: 'Feb',  revenue: 1044000, purchases: 640000, expenses: 194000, grossProfit: 404000, netProfit: 210000, openingCash: 546000, closingCash: 600000 },
  { month: 'March 2026',     shortMonth: 'Mar',  revenue: 1480000, purchases: 920000, expenses: 228000, grossProfit: 560000, netProfit: 332000, openingCash: 600000, closingCash: 776000 },
  { month: 'April 2026',     shortMonth: 'Apr',  revenue: 1186000, purchases: 734000, expenses: 210000, grossProfit: 452000, netProfit: 242000, openingCash: 776000, closingCash: 848000 },
  { month: 'May 2026',       shortMonth: 'May',  revenue: 1248000, purchases: 776000, expenses: 218000, grossProfit: 472000, netProfit: 254000, openingCash: 848000, closingCash: 942000 },
  { month: 'June 2026',      shortMonth: 'Jun',  revenue: 1214000, purchases: 752000, expenses: 212000, grossProfit: 462000, netProfit: 250000, openingCash: 942000, closingCash: 1024000 },
  { month: 'July 2026',      shortMonth: 'Jul',  revenue: 1482300, purchases: 841966, expenses: 227534, grossProfit: 640334, netProfit: 412800, openingCash: 1024000, closingCash: 1280000 },
];

// ─── Expense breakdown (current month) ───────────────────────────────────────

export const EXPENSE_LINES: ExpenseLine[] = [
  { id: 1, category: 'Purchases',     amount: 841966, pct: 78.7, icon: 'shopping_bag',    color: '#7c3aed', lastMonth: 752000, change: 12.0  },
  { id: 2, category: 'Salaries',      amount: 92000,  pct: 8.6,  icon: 'people',          color: '#2563eb', lastMonth: 92000,  change: 0     },
  { id: 3, category: 'Rent',          amount: 48000,  pct: 4.5,  icon: 'home_work',       color: '#ea580c', lastMonth: 48000,  change: 0     },
  { id: 4, category: 'Electricity',   amount: 18200,  pct: 1.7,  icon: 'bolt',            color: '#f59e0b', lastMonth: 16400,  change: 11.0  },
  { id: 5, category: 'Transport',     amount: 24800,  pct: 2.3,  icon: 'local_shipping',  color: '#0f766e', lastMonth: 22600,  change: 9.7   },
  { id: 6, category: 'Packaging',     amount: 14200,  pct: 1.3,  icon: 'inventory',       color: '#db2777', lastMonth: 13800,  change: 2.9   },
  { id: 7, category: 'Maintenance',   amount: 11400,  pct: 1.1,  icon: 'build',           color: '#64748b', lastMonth: 9800,   change: 16.3  },
  { id: 8, category: 'Marketing',     amount: 8800,   pct: 0.8,  icon: 'campaign',        color: '#0369a1', lastMonth: 7200,   change: 22.2  },
  { id: 9, category: 'Miscellaneous', amount: 10134,  pct: 0.9,  icon: 'more_horiz',      color: '#94a3b8', lastMonth: 12200,  change: -16.9 },
];

// ─── Recent finance transactions ──────────────────────────────────────────────

export const FINANCE_TRANSACTIONS: FinanceTx[] = [
  { id: 1,  date: '06 Jul 2026', type: 'Income',   category: 'Sales Revenue',     description: 'Daily sales collection',                  amount: 48520,  mode: 'Cash + UPI',      ref: 'DAY-060726' },
  { id: 2,  date: '06 Jul 2026', type: 'Expense',  category: 'Transport',         description: 'Delivery van fuel + toll charges',        amount: 1840,   mode: 'Cash',            ref: '' },
  { id: 3,  date: '05 Jul 2026', type: 'Income',   category: 'Customer Payment',  description: 'Mahesh Bhosale — partial payment',        amount: 21063,  mode: 'Cheque',          ref: 'SBI-441209' },
  { id: 4,  date: '05 Jul 2026', type: 'Expense',  category: 'Purchases',         description: 'UltraTech Cement — PUR-0241',             amount: 21760,  mode: 'Credit',          ref: 'PUR-0241' },
  { id: 5,  date: '04 Jul 2026', type: 'Expense',  category: 'Purchases',         description: 'Tata Steel — PUR-0240',                   amount: 31624,  mode: 'Bank Transfer',   ref: 'PUR-0240' },
  { id: 6,  date: '04 Jul 2026', type: 'Income',   category: 'Sales Revenue',     description: 'Daily sales collection',                  amount: 52180,  mode: 'Cash + UPI',      ref: 'DAY-040726' },
  { id: 7,  date: '03 Jul 2026', type: 'Income',   category: 'Customer Payment',  description: 'Akash Karande — outstanding settled',     amount: 35600,  mode: 'Bank Transfer',   ref: 'NEFT-2026070301' },
  { id: 8,  date: '03 Jul 2026', type: 'Expense',  category: 'Electricity',       description: 'MSEB electricity bill — July',           amount: 18200,  mode: 'UPI',             ref: 'MSEB-JUL26' },
  { id: 9,  date: '02 Jul 2026', type: 'Expense',  category: 'Purchases',         description: 'Asian Paints Depot — PUR-0238',           amount: 68532,  mode: 'Bank Transfer',   ref: 'PUR-0238' },
  { id: 10, date: '02 Jul 2026', type: 'Income',   category: 'Sales Revenue',     description: 'Daily sales collection',                  amount: 44260,  mode: 'Cash + UPI',      ref: 'DAY-020726' },
  { id: 11, date: '01 Jul 2026', type: 'Expense',  category: 'Salaries',          description: 'Staff salaries — July 2026',             amount: 92000,  mode: 'Bank Transfer',   ref: 'SAL-JUL26' },
  { id: 12, date: '01 Jul 2026', type: 'Expense',  category: 'Rent',              description: 'Shop + warehouse rent — July 2026',      amount: 48000,  mode: 'Cheque',          ref: 'RENT-JUL26' },
  { id: 13, date: '01 Jul 2026', type: 'Income',   category: 'Sales Revenue',     description: 'Daily sales collection',                  amount: 38900,  mode: 'Cash + UPI',      ref: 'DAY-010726' },
  { id: 14, date: '30 Jun 2026', type: 'Expense',  category: 'Marketing',         description: 'Pamphlet printing + local ads',          amount: 8800,   mode: 'Cash',            ref: '' },
  { id: 15, date: '29 Jun 2026', type: 'Expense',  category: 'Maintenance',       description: 'Shop AC servicing + shelving repair',    amount: 11400,  mode: 'Cash',            ref: '' },
];
