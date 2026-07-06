// ─── Customers (Khata) — Data Types & Mock Data ─────────────────────────────

export type CustomerStatus = 'Active' | 'Inactive';
export type EntryType = 'Sale' | 'Payment' | 'Return' | 'Adjustment';
export type PaymentMode = 'Cash' | 'UPI' | 'Cheque' | 'Bank Transfer';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  area: string;
  gst?: string;
  creditLimit: number;
  outstanding: number;   // current balance owed
  totalPurchases: number;
  totalPaid: number;
  lastActivity: string;
  joinDate: string;
  status: CustomerStatus;
  avatar: string;        // initials colour key
  overduedays: number;
}

export interface KhataEntry {
  id: number;
  customerId: number;
  date: string;
  time: string;
  type: EntryType;
  invoice?: string;
  description: string;
  debit: number;         // amount added to outstanding (sale / return)
  credit: number;        // amount reduced from outstanding (payment)
  balance: number;       // running balance after this entry
  paymentMode?: PaymentMode;
  notes?: string;
}

export interface CustomerStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

// ─── Customers ───────────────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
  { id: 1,  name: 'Mahesh Bhosale',    phone: '9845001122', address: 'Plot 12, Shivaji Nagar',    area: 'Nashik',     creditLimit: 100000, outstanding: 47800,  totalPurchases: 312400, totalPaid: 264600, lastActivity: '05 Jul 2026', joinDate: 'Jan 2023', status: 'Active',   avatar: 'blue',   overduedays: 42 },
  { id: 2,  name: 'Rajendra Gaikwad',  phone: '9867890012', address: 'Gaikwad Wada, Near Mandir', area: 'Pune',       creditLimit: 80000,  outstanding: 52400,  totalPurchases: 280100, totalPaid: 227700, lastActivity: '03 Jul 2026', joinDate: 'Mar 2022', status: 'Active',   avatar: 'purple', overduedays: 45 },
  { id: 3,  name: 'Kiran Chavan',      phone: '9932100988', address: 'Flat 4B, Chavan Heights',   area: 'Nashik',     creditLimit: 60000,  outstanding: 23700,  totalPurchases: 198200, totalPaid: 174500, lastActivity: '02 Jul 2026', joinDate: 'Jun 2023', status: 'Active',   avatar: 'green',  overduedays: 31 },
  { id: 4,  name: 'Akash Karande',     phone: '9834561200', address: '22 MG Road',                area: 'Aurangabad', creditLimit: 75000,  outstanding: 35600,  totalPurchases: 241000, totalPaid: 205400, lastActivity: '01 Jul 2026', joinDate: 'Aug 2022', status: 'Active',   avatar: 'orange', overduedays: 38 },
  { id: 5,  name: 'Suresh Shinde',     phone: '9812345670', address: 'Shinde Bungalow, Katraj',   area: 'Pune',       creditLimit: 90000,  outstanding: 31000,  totalPurchases: 189600, totalPaid: 158600, lastActivity: '04 Jul 2026', joinDate: 'Feb 2023', status: 'Active',   avatar: 'teal',   overduedays: 35 },
  { id: 6,  name: 'Ramesh Patil',      phone: '9822011234', address: 'Patil Nagar, Ambad',        area: 'Nashik',     creditLimit: 50000,  outstanding: 18500,  totalPurchases: 156800, totalPaid: 138300, lastActivity: '06 Jul 2026', joinDate: 'Apr 2022', status: 'Active',   avatar: 'red',    overduedays: 21 },
  { id: 7,  name: 'Anil Kambli',       phone: '9856234501', address: 'Kambli Estate, Satara',     area: 'Satara',     creditLimit: 70000,  outstanding: 28300,  totalPurchases: 167400, totalPaid: 139100, lastActivity: '30 Jun 2026', joinDate: 'Sep 2022', status: 'Active',   avatar: 'blue',   overduedays: 26 },
  { id: 8,  name: 'Sanjay Jadhav',     phone: '9765432101', address: 'Jadhav Complex, Camp',      area: 'Pune',       creditLimit: 55000,  outstanding: 15400,  totalPurchases: 132000, totalPaid: 116600, lastActivity: '05 Jul 2026', joinDate: 'Nov 2022', status: 'Active',   avatar: 'purple', overduedays: 29 },
  { id: 9,  name: 'Priya Kulkarni',    phone: '9881122334', address: '8 Laxmi Road',              area: 'Nashik',     creditLimit: 45000,  outstanding: 22000,  totalPurchases: 98600,  totalPaid: 76600,  lastActivity: '06 Jul 2026', joinDate: 'Jan 2024', status: 'Active',   avatar: 'pink',   overduedays: 7  },
  { id: 10, name: 'Tushar Lokhande',   phone: '9788900123', address: 'Lokhande Farm, Shirdi Rd',  area: 'Ahmednagar', creditLimit: 40000,  outstanding: 16400,  totalPurchases: 87200,  totalPaid: 70800,  lastActivity: '03 Jul 2026', joinDate: 'Mar 2024', status: 'Active',   avatar: 'green',  overduedays: 17 },
  { id: 11, name: 'Dnyanesh Sawant',   phone: '9773210045', address: 'Sawant Chawl, Kalyan',      area: 'Thane',      creditLimit: 35000,  outstanding: 19200,  totalPurchases: 74100,  totalPaid: 54900,  lastActivity: '29 Jun 2026', joinDate: 'May 2024', status: 'Active',   avatar: 'orange', overduedays: 9  },
  { id: 12, name: 'Vijay Deshmukh',    phone: '9700998877', address: 'Deshmukh Niwas, Solapur',   area: 'Solapur',    creditLimit: 30000,  outstanding: 8750,   totalPurchases: 61800,  totalPaid: 53050,  lastActivity: '04 Jul 2026', joinDate: 'Jul 2024', status: 'Active',   avatar: 'teal',   overduedays: 14 },
  { id: 13, name: 'Ganesh More',       phone: '9823044512', address: 'More Vasti, Hadapsar',      area: 'Pune',       creditLimit: 25000,  outstanding: 9200,   totalPurchases: 54300,  totalPaid: 45100,  lastActivity: '06 Jul 2026', joinDate: 'Aug 2024', status: 'Active',   avatar: 'red',    overduedays: 12 },
  { id: 14, name: 'Rekha Thakur',      phone: '9666123400', address: 'Thakur Apt, Bandra',        area: 'Mumbai',     creditLimit: 20000,  outstanding: 6800,   totalPurchases: 38400,  totalPaid: 31600,  lastActivity: '03 Jul 2026', joinDate: 'Oct 2024', status: 'Active',   avatar: 'pink',   overduedays: 3  },
  { id: 15, name: 'Anita Pawar',       phone: '9934560012', address: 'Pawar Wadi, Chakan',        area: 'Pune',       creditLimit: 30000,  outstanding: 12600,  totalPurchases: 47900,  totalPaid: 35300,  lastActivity: '04 Jul 2026', joinDate: 'Dec 2024', status: 'Active',   avatar: 'blue',   overduedays: 18 },
  { id: 16, name: 'Raju Nair',         phone: '9754321098', address: 'Nair Quarters, Vashi',      area: 'Mumbai',     creditLimit: 15000,  outstanding: 5400,   totalPurchases: 29100,  totalPaid: 23700,  lastActivity: '05 Jul 2026', joinDate: 'Feb 2025', status: 'Active',   avatar: 'purple', overduedays: 5  },
  { id: 17, name: 'Pooja Ghuge',       phone: '9712340987', address: 'Ghuge Nagar, Latur',        area: 'Latur',      creditLimit: 20000,  outstanding: 7500,   totalPurchases: 33200,  totalPaid: 25700,  lastActivity: '02 Jul 2026', joinDate: 'Mar 2025', status: 'Active',   avatar: 'green',  overduedays: 8  },
  { id: 18, name: 'Neeta Salve',       phone: '9923456711', address: '15 Civil Lines',            area: 'Nagpur',     creditLimit: 25000,  outstanding: 14900,  totalPurchases: 52600,  totalPaid: 37700,  lastActivity: '01 Jul 2026', joinDate: 'Jan 2025', status: 'Active',   avatar: 'orange', overduedays: 22 },
  { id: 19, name: 'Sunita Wagh',       phone: '9745678901', address: 'Wagh Colony, Baramati',     area: 'Pune',       creditLimit: 10000,  outstanding: 6100,   totalPurchases: 24800,  totalPaid: 18700,  lastActivity: '06 Jul 2026', joinDate: 'Apr 2025', status: 'Active',   avatar: 'teal',   overduedays: 4  },
  { id: 20, name: 'Shivaji Mane',      phone: '9988001122', address: 'Mane Farm, Kopargaon',      area: 'Ahmednagar', creditLimit: 50000,  outstanding: 11000,  totalPurchases: 68900,  totalPaid: 57900,  lastActivity: '06 Jul 2026', joinDate: 'Jun 2023', status: 'Inactive', avatar: 'red',    overduedays: 15 },
];

// ─── Khata Ledger Entries (for customer id 1 — Mahesh Bhosale) ──────────────

export const KHATA_ENTRIES: KhataEntry[] = [
  { id: 1,  customerId: 1, date: '05 Jul 2026', time: '11:55 AM', type: 'Sale',       invoice: 'INV-0237', description: 'Sale: PVC Pipes, Valves, Elbow fittings (8 items)',   debit: 21063, credit: 0,     balance: 47800,  paymentMode: undefined,          notes: '' },
  { id: 2,  customerId: 1, date: '28 Jun 2026', time: '03:20 PM', type: 'Payment',    invoice: undefined,  description: 'Payment received via Cheque (SBI #441209)',           debit: 0,     credit: 15000, balance: 26737,  paymentMode: 'Cheque',           notes: 'SBI Cheque No. 441209' },
  { id: 3,  customerId: 1, date: '22 Jun 2026', time: '10:00 AM', type: 'Sale',       invoice: 'INV-0219', description: 'Sale: Cement Bags, MS Wire, Barbed Wire (5 items)',    debit: 18400, credit: 0,     balance: 41737,  paymentMode: undefined,          notes: '' },
  { id: 4,  customerId: 1, date: '18 Jun 2026', time: '02:15 PM', type: 'Payment',    invoice: undefined,  description: 'Payment received via Cash',                           debit: 0,     credit: 20000, balance: 23337,  paymentMode: 'Cash',             notes: '' },
  { id: 5,  customerId: 1, date: '12 Jun 2026', time: '09:30 AM', type: 'Sale',       invoice: 'INV-0208', description: 'Sale: Paint White 20L, Brushes, Drill Bit Set',       debit: 12800, credit: 0,     balance: 43337,  paymentMode: undefined,          notes: '' },
  { id: 6,  customerId: 1, date: '05 Jun 2026', time: '04:00 PM', type: 'Return',     invoice: 'INV-0198', description: 'Return: Damaged Float Switch (1 pc)',                 debit: 0,     credit: 450,   balance: 30537,  paymentMode: undefined,          notes: 'Defective unit returned' },
  { id: 7,  customerId: 1, date: '01 Jun 2026', time: '11:00 AM', type: 'Payment',    invoice: undefined,  description: 'Payment received via UPI (GPay)',                     debit: 0,     credit: 10000, balance: 30987,  paymentMode: 'UPI',              notes: 'UPI ref: GPAY2026060100' },
  { id: 8,  customerId: 1, date: '24 May 2026', time: '03:45 PM', type: 'Sale',       invoice: 'INV-0191', description: 'Sale: GI Pipes, Tata MS Wire, Welding Rods (6 items)', debit: 15600, credit: 0,     balance: 40987,  paymentMode: undefined,          notes: '' },
  { id: 9,  customerId: 1, date: '15 May 2026', time: '10:30 AM', type: 'Payment',    invoice: undefined,  description: 'Payment received via Bank Transfer (NEFT)',           debit: 0,     credit: 25000, balance: 25387,  paymentMode: 'Bank Transfer',    notes: 'NEFT from HDFC A/C' },
  { id: 10, customerId: 1, date: '08 May 2026', time: '02:00 PM', type: 'Sale',       invoice: 'INV-0180', description: 'Sale: Shade Net, Drip Tube, Tarpaulin (3 items)',     debit: 9800,  credit: 0,     balance: 50387,  paymentMode: undefined,          notes: '' },
  { id: 11, customerId: 1, date: '28 Apr 2026', time: '09:15 AM', type: 'Payment',    invoice: undefined,  description: 'Payment received via Cash',                           debit: 0,     credit: 18000, balance: 40587,  paymentMode: 'Cash',             notes: '' },
  { id: 12, customerId: 1, date: '20 Apr 2026', time: '04:30 PM', type: 'Adjustment', invoice: undefined,  description: 'Credit adjustment: Price correction on INV-0168',     debit: 0,     credit: 800,   balance: 58587,  paymentMode: undefined,          notes: 'Price was entered incorrectly' },
];

// ─── Stats Cards ─────────────────────────────────────────────────────────────

export const CUSTOMER_STATS: CustomerStat[] = [
  { label: 'Total Customers',    value: '20',          icon: 'people',                  color: '#2563eb' },
  { label: 'Total Outstanding',  value: '₹3,92,550',   icon: 'account_balance_wallet',  color: '#dc2626' },
  { label: 'Collected This Month', value: '₹2,14,300', icon: 'payments',                color: '#16a34a' },
  { label: 'Overdue (>30 days)', value: '5 Accounts',  icon: 'warning',                 color: '#ea580c' },
];
