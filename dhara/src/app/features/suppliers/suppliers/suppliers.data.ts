// ─── Suppliers — Data Types & Mock Data ─────────────────────────────────────

export type SupplierStatus  = 'Active' | 'Inactive';
export type TransactionType = 'Purchase' | 'Payment' | 'Return' | 'Debit Note';
export type PaymentMode     = 'Cash' | 'UPI' | 'Cheque' | 'Bank Transfer' | 'Credit';

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address: string;
  area: string;
  state: string;
  gst: string;
  pan?: string;
  creditDays: number;       // payment terms in days
  creditLimit: number;
  outstanding: number;      // current dues payable
  totalPurchases: number;
  totalPaid: number;
  totalOrders: number;
  joinDate: string;
  lastOrder: string;
  status: SupplierStatus;
  avatar: string;
  categories: string[];     // product categories supplied
  rating: number;           // 1-5
}

export interface SupplierTransaction {
  id: number;
  supplierId: number;
  date: string;
  time: string;
  type: TransactionType;
  poNumber?: string;
  invoiceRef?: string;
  description: string;
  debit: number;            // amount we owe (purchase / debit note)
  credit: number;           // amount we paid
  balance: number;          // running balance
  paymentMode?: PaymentMode;
  notes?: string;
}

export interface SupplierStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const SUPPLIERS: Supplier[] = [
  {
    id: 1, name: 'Ganesh Tiles & Plumbing', contactPerson: 'Ganesh Raut',
    phone: '9821100234', altPhone: '9821100235', email: 'ganesh.raut@gtp.in',
    address: 'Plot 5, MIDC Industrial Area', area: 'Nashik', state: 'Maharashtra',
    gst: '27ABCDE1234F1Z5', pan: 'ABCDE1234F',
    creditDays: 30, creditLimit: 500000, outstanding: 28600,
    totalPurchases: 842000, totalPaid: 813400, totalOrders: 42,
    joinDate: 'Jan 2020', lastOrder: '29 Jun 2026', status: 'Active', avatar: 'blue',
    categories: ['Plumbing', 'Sanitary'], rating: 4
  },
  {
    id: 2, name: 'Supreme Industries Ltd', contactPerson: 'Rahul Mehta',
    phone: '9876543210', email: 'rahul.mehta@supreme.in',
    address: 'Supreme House, Andheri East', area: 'Pune', state: 'Maharashtra',
    gst: '27XYZPQ5678G2Z9', pan: 'XYZPQ5678G',
    creditDays: 45, creditLimit: 1000000, outstanding: 45200,
    totalPurchases: 1240000, totalPaid: 1194800, totalOrders: 31,
    joinDate: 'Mar 2019', lastOrder: '03 Jul 2026', status: 'Active', avatar: 'purple',
    categories: ['Plumbing', 'Building'], rating: 5
  },
  {
    id: 3, name: 'Tata Steel Distributors', contactPerson: 'Vikram Singh',
    phone: '9823456789', email: 'vikram.singh@tatasteel.in',
    address: '12 Steel House, Parel', area: 'Mumbai', state: 'Maharashtra',
    gst: '27TATAS1234H3Z7', pan: 'TATAS1234H',
    creditDays: 30, creditLimit: 2000000, outstanding: 68200,
    totalPurchases: 2180000, totalPaid: 2111800, totalOrders: 28,
    joinDate: 'Jun 2018', lastOrder: '04 Jul 2026', status: 'Active', avatar: 'teal',
    categories: ['Steel', 'Hardware'], rating: 5
  },
  {
    id: 4, name: 'Polycab Electricals', contactPerson: 'Sunil Kapoor',
    phone: '9765001122', email: 'sunil.k@polycab.in',
    address: 'Polycab Showroom, CBS Road', area: 'Nashik', state: 'Maharashtra',
    gst: '27POLYC9876K4Z2', pan: 'POLYC9876K',
    creditDays: 21, creditLimit: 600000, outstanding: 12400,
    totalPurchases: 698000, totalPaid: 685600, totalOrders: 19,
    joinDate: 'Sep 2020', lastOrder: '01 Jul 2026', status: 'Active', avatar: 'orange',
    categories: ['Electrical'], rating: 4
  },
  {
    id: 5, name: 'Asian Paints Depot', contactPerson: 'Pradeep Joshi',
    phone: '9845670011', email: 'pradeep.j@asianpaints.in',
    address: 'Asian Paints Complex, CIDCO', area: 'Aurangabad', state: 'Maharashtra',
    gst: '27ASIAN4321L5Z8', pan: 'ASIAN4321L',
    creditDays: 30, creditLimit: 800000, outstanding: 21800,
    totalPurchases: 921000, totalPaid: 899200, totalOrders: 24,
    joinDate: 'Apr 2019', lastOrder: '02 Jul 2026', status: 'Active', avatar: 'red',
    categories: ['Paint'], rating: 4
  },
  {
    id: 6, name: 'UltraTech Cement Agency', contactPerson: 'Mahendra Patil',
    phone: '9900112233', altPhone: '9900112244',
    address: 'NH-60, Cement Nagar', area: 'Nashik', state: 'Maharashtra',
    gst: '27ULTRA6543M6Z1', pan: 'ULTRA6543M',
    creditDays: 15, creditLimit: 1500000, outstanding: 38400,
    totalPurchases: 1860000, totalPaid: 1821600, totalOrders: 36,
    joinDate: 'Feb 2018', lastOrder: '05 Jul 2026', status: 'Active', avatar: 'green',
    categories: ['Building'], rating: 5
  },
  {
    id: 7, name: 'Jain Irrigation Systems', contactPerson: 'Anand Jain',
    phone: '9712340099', email: 'anand.jain@jainirrigation.in',
    address: 'Jain Plastic Park, Bambhori', area: 'Jalgaon', state: 'Maharashtra',
    gst: '27JAINS2109N7Z3', pan: 'JAINS2109N',
    creditDays: 30, creditLimit: 400000, outstanding: 9600,
    totalPurchases: 412000, totalPaid: 402400, totalOrders: 15,
    joinDate: 'Jul 2021', lastOrder: '27 Jun 2026', status: 'Active', avatar: 'blue',
    categories: ['Agriculture'], rating: 4
  },
  {
    id: 8, name: 'Finolex Industries', contactPerson: 'Deepak Wagh',
    phone: '9833456700', email: 'deepak.wagh@finolex.in',
    address: '14 Finolex Colony, Pimpri', area: 'Pune', state: 'Maharashtra',
    gst: '27FINOL3456P8Z6', pan: 'FINOL3456P',
    creditDays: 21, creditLimit: 700000, outstanding: 17200,
    totalPurchases: 584000, totalPaid: 566800, totalOrders: 22,
    joinDate: 'Nov 2020', lastOrder: '25 Jun 2026', status: 'Active', avatar: 'purple',
    categories: ['Electrical', 'Plumbing'], rating: 4
  },
];

// ─── Transactions for supplier id 1 (Ganesh Tiles) ───────────────────────────

export const SUPPLIER_TRANSACTIONS: SupplierTransaction[] = [
  { id: 1,  supplierId: 1, date: '29 Jun 2026', time: '10:30 AM', type: 'Purchase',   poNumber: 'PUR-0236', invoiceRef: 'GTP-1190', description: 'GI Pipe 1.5 inch (150 ft) + Sanitary T-Trap 32mm (80 pcs)', debit: 22007, credit: 0,     balance: 28600,  paymentMode: undefined,       notes: '' },
  { id: 2,  supplierId: 1, date: '15 Jun 2026', time: '02:00 PM', type: 'Payment',    poNumber: undefined,  invoiceRef: undefined,   description: 'Payment against PUR-0229',                                debit: 0,     credit: 18000, balance: 6593,   paymentMode: 'Bank Transfer', notes: 'NEFT from HDFC A/C' },
  { id: 3,  supplierId: 1, date: '10 Jun 2026', time: '11:00 AM', type: 'Purchase',   poNumber: 'PUR-0229', invoiceRef: 'GTP-1181', description: 'PVC Ball Valve 1 inch (60 pcs) + PVC Elbow (200 pcs)',    debit: 17400, credit: 0,     balance: 24593,  paymentMode: undefined,       notes: '' },
  { id: 4,  supplierId: 1, date: '02 Jun 2026', time: '04:00 PM', type: 'Payment',    poNumber: undefined,  invoiceRef: undefined,   description: 'Payment via Cheque (SBI #772340)',                        debit: 0,     credit: 15000, balance: 7193,   paymentMode: 'Cheque',        notes: 'SBI Cheque #772340' },
  { id: 5,  supplierId: 1, date: '25 May 2026', time: '09:30 AM', type: 'Purchase',   poNumber: 'PUR-0221', invoiceRef: 'GTP-1172', description: 'PVC Pipe 1 inch (300 pcs)',                                debit: 20580, credit: 0,     balance: 22193,  paymentMode: undefined,       notes: '' },
  { id: 6,  supplierId: 1, date: '12 May 2026', time: '03:30 PM', type: 'Return',     poNumber: 'PUR-0215', invoiceRef: 'GTP-1165', description: 'Return: 10 pcs defective PVC Elbows',                     debit: 0,     credit: 120,   balance: 1613,   paymentMode: undefined,       notes: 'Defective batch — credit note issued' },
  { id: 7,  supplierId: 1, date: '05 May 2026', time: '11:30 AM', type: 'Payment',    poNumber: undefined,  invoiceRef: undefined,   description: 'Payment via Cash',                                        debit: 0,     credit: 12000, balance: 1733,   paymentMode: 'Cash',          notes: '' },
  { id: 8,  supplierId: 1, date: '28 Apr 2026', time: '10:00 AM', type: 'Purchase',   poNumber: 'PUR-0215', invoiceRef: 'GTP-1165', description: 'GI Pipe 2 inch (80 ft) + Sanitary Fittings assorted',    debit: 13400, credit: 0,     balance: 13733,  paymentMode: undefined,       notes: '' },
  { id: 9,  supplierId: 1, date: '18 Apr 2026', time: '02:45 PM', type: 'Payment',    poNumber: undefined,  invoiceRef: undefined,   description: 'Payment via UPI (GPay)',                                  debit: 0,     credit: 10000, balance: 333,    paymentMode: 'UPI',           notes: 'GPay ref: GPAY2026041800' },
  { id: 10, supplierId: 1, date: '10 Apr 2026', time: '09:00 AM', type: 'Debit Note', poNumber: 'PUR-0208', invoiceRef: 'GTP-1155', description: 'Debit note: Price revision on PVC Pipes (rate correction)', debit: 850, credit: 0,    balance: 10333,  paymentMode: undefined,       notes: 'Rate corrected from ₹88 to ₹85/pc' },
  { id: 11, supplierId: 1, date: '01 Apr 2026', time: '11:15 AM', type: 'Purchase',   poNumber: 'PUR-0208', invoiceRef: 'GTP-1155', description: 'PVC Pipe 1 inch (220 pcs) + PVC Elbow (300 pcs)',         debit: 22860, credit: 0,     balance: 9483,   paymentMode: undefined,       notes: '' },
  { id: 12, supplierId: 1, date: '20 Mar 2026', time: '03:00 PM', type: 'Payment',    poNumber: undefined,  invoiceRef: undefined,   description: 'Payment via Bank Transfer',                               debit: 0,     credit: 20000, balance: -13377,  paymentMode: 'Bank Transfer', notes: '' },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

export const SUPPLIER_STATS: SupplierStat[] = [
  { label: 'Total Suppliers',    value: '8',            icon: 'local_shipping',         color: '#2563eb' },
  { label: 'Total Dues Payable', value: '₹2,41,200',    icon: 'account_balance_wallet', color: '#dc2626' },
  { label: 'Purchases This Month', value: '₹1,84,966',  icon: 'shopping_bag',           color: '#7c3aed' },
  { label: 'Active Suppliers',   value: '8 Active',     icon: 'verified',               color: '#16a34a' },
];
