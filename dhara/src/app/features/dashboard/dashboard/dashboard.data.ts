export interface StatCard {
  id: number;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface QuickAction {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export interface LowStock {
  id: number;
  product: string;
  category: string;
  stock: number;
  threshold: number;
}

export interface Borrower {
  id: number;
  name: string;
  phone: string;
  amount: number;
  dueDays: number;
}

export interface Transaction {
  id: number;
  customer: string;
  invoice: string;
  amount: number;
  status: 'Paid' | 'Pending';
  type: 'Sale' | 'Return' | 'Purchase';
  date: string;
}

export const DASHBOARD_STATS: StatCard[] = [
  { id: 1,  title: "Today's Sales",    value: '₹48,520',      change: 18.4, trend: 'up',   icon: 'shopping_cart',         color: '#2563eb' },
  { id: 2,  title: "Today's Profit",   value: '₹13,850',      change: 12.8, trend: 'up',   icon: 'payments',              color: '#16a34a' },
  { id: 3,  title: 'Outstanding',      value: '₹1,82,430',    change: 4.6,  trend: 'down', icon: 'account_balance_wallet', color: '#ea580c' },
  { id: 4,  title: 'Low Stock',        value: '12 Items',     change: 3.0,  trend: 'down', icon: 'inventory_2',           color: '#dc2626' },
  { id: 5,  title: 'Cash Available',   value: '₹32,450',      change: 8.2,  trend: 'up',   icon: 'local_atm',             color: '#9333ea' },
  { id: 6,  title: 'Pending Invoices', value: '7 Bills',      change: 2.1,  trend: 'down', icon: 'receipt_long',          color: '#0ea5e9' },
  { id: 7,  title: "Today's Purchases",value: '₹28,600',      change: 6.4,  trend: 'up',   icon: 'shopping_bag',          color: '#f59e0b' },
  { id: 8,  title: 'Monthly Revenue',  value: '₹14,82,300',   change: 22.1, trend: 'up',   icon: 'trending_up',           color: '#06b6d4' },
  { id: 9,  title: 'Monthly Profit',   value: '₹4,12,800',    change: 15.3, trend: 'up',   icon: 'bar_chart',             color: '#8b5cf6' },
  { id: 10, title: 'Supplier Dues',    value: '₹68,200',      change: 1.2,  trend: 'down', icon: 'local_shipping',        color: '#ef4444' }
];

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 1, title: 'New Sale',        subtitle: 'Create invoice',  icon: 'point_of_sale', color: '#2563eb' },
  { id: 2, title: 'Add Product',     subtitle: 'Inventory',       icon: 'inventory',     color: '#16a34a' },
  { id: 3, title: 'Receive Payment', subtitle: 'Borrowers',       icon: 'payments',      color: '#ea580c' },
  { id: 4, title: 'Purchase',        subtitle: 'Stock Refill',    icon: 'shopping_bag',  color: '#9333ea' }
];

export const LOW_STOCK: LowStock[] = [
  { id: 1,  product: 'PVC Pipe 1 inch',      category: 'Plumbing',    stock: 6,  threshold: 20 },
  { id: 2,  product: 'LED Bulb 9W',          category: 'Electrical',  stock: 12, threshold: 30 },
  { id: 3,  product: 'Shade Net Green',      category: 'Agriculture', stock: 3,  threshold: 10 },
  { id: 4,  product: 'MS Wire 12 Gauge',     category: 'Steel',       stock: 8,  threshold: 25 },
  { id: 5,  product: 'Paint White 20L',      category: 'Paint',       stock: 5,  threshold: 15 },
  { id: 6,  product: 'Cement Bag OPC',       category: 'Hardware',    stock: 11, threshold: 50 },
  { id: 7,  product: 'GI Pipe 1.5 inch',     category: 'Plumbing',    stock: 4,  threshold: 20 },
  { id: 8,  product: 'Electrical Switch',    category: 'Electrical',  stock: 14, threshold: 40 },
  { id: 9,  product: 'PVC Elbow 1 inch',     category: 'Plumbing',    stock: 9,  threshold: 30 },
  { id: 10, product: 'Tarpaulin 15x20',      category: 'Agriculture', stock: 2,  threshold: 10 },
  { id: 11, product: 'Drip Irrigation Tube', category: 'Agriculture', stock: 7,  threshold: 20 },
  { id: 12, product: 'Barbed Wire 50m',      category: 'Steel',       stock: 3,  threshold: 15 },
  { id: 13, product: 'Paint Brush 2 inch',   category: 'Paint',       stock: 10, threshold: 30 },
  { id: 14, product: 'Hex Bolt M10',         category: 'Hardware',    stock: 15, threshold: 50 },
  { id: 15, product: 'Cable 2.5mm',          category: 'Electrical',  stock: 6,  threshold: 25 },
  { id: 16, product: 'PVC Ball Valve',       category: 'Plumbing',    stock: 4,  threshold: 20 },
  { id: 17, product: 'Welding Rod 6013',     category: 'Steel',       stock: 8,  threshold: 30 },
  { id: 18, product: 'Sanitary T-Trap',      category: 'Plumbing',    stock: 5,  threshold: 20 },
  { id: 19, product: 'Drill Bit Set',        category: 'Hardware',    stock: 3,  threshold: 12 },
  { id: 20, product: 'Float Switch',         category: 'Electrical',  stock: 7,  threshold: 25 }
];

export const BORROWERS: Borrower[] = [
  { id: 1,  name: 'Ramesh Patil',       phone: '9822011234', amount: 18500, dueDays: 21 },
  { id: 2,  name: 'Ganesh More',        phone: '9823044512', amount: 9200,  dueDays: 12 },
  { id: 3,  name: 'Sanjay Jadhav',      phone: '9765432101', amount: 15400, dueDays: 29 },
  { id: 4,  name: 'Priya Kulkarni',     phone: '9881122334', amount: 22000, dueDays: 7  },
  { id: 5,  name: 'Vijay Deshmukh',     phone: '9700998877', amount: 8750,  dueDays: 14 },
  { id: 6,  name: 'Suresh Shinde',      phone: '9812345670', amount: 31000, dueDays: 35 },
  { id: 7,  name: 'Anita Pawar',        phone: '9934560012', amount: 12600, dueDays: 18 },
  { id: 8,  name: 'Raju Nair',          phone: '9754321098', amount: 5400,  dueDays: 5  },
  { id: 9,  name: 'Mahesh Bhosale',     phone: '9845001122', amount: 47800, dueDays: 42 },
  { id: 10, name: 'Dnyanesh Sawant',    phone: '9773210045', amount: 19200, dueDays: 9  },
  { id: 11, name: 'Rekha Thakur',       phone: '9666123400', amount: 6800,  dueDays: 3  },
  { id: 12, name: 'Anil Kambli',        phone: '9856234501', amount: 28300, dueDays: 26 },
  { id: 13, name: 'Shivaji Mane',       phone: '9988001122', amount: 11000, dueDays: 15 },
  { id: 14, name: 'Pooja Ghuge',        phone: '9712340987', amount: 7500,  dueDays: 8  },
  { id: 15, name: 'Akash Karande',      phone: '9834561200', amount: 35600, dueDays: 38 },
  { id: 16, name: 'Neeta Salve',        phone: '9923456711', amount: 14900, dueDays: 22 },
  { id: 17, name: 'Rajendra Gaikwad',   phone: '9867890012', amount: 52400, dueDays: 45 },
  { id: 18, name: 'Sunita Wagh',        phone: '9745678901', amount: 6100,  dueDays: 4  },
  { id: 19, name: 'Kiran Chavan',       phone: '9932100988', amount: 23700, dueDays: 31 },
  { id: 20, name: 'Tushar Lokhande',    phone: '9788900123', amount: 16400, dueDays: 17 }
];

export const TRANSACTIONS: Transaction[] = [
  { id: 1,  customer: 'Mahesh Traders',    invoice: 'INV-1045', amount: 8450,  status: 'Paid',    type: 'Sale',     date: '09:30 AM' },
  { id: 2,  customer: 'Sai Hardware',      invoice: 'INV-1046', amount: 12600, status: 'Pending', type: 'Sale',     date: '10:12 AM' },
  { id: 3,  customer: 'Patil Agro',        invoice: 'INV-1047', amount: 5200,  status: 'Paid',    type: 'Sale',     date: '11:48 AM' },
  { id: 4,  customer: 'Om Electrical',     invoice: 'INV-1048', amount: 16900, status: 'Pending', type: 'Sale',     date: '01:20 PM' },
  { id: 5,  customer: 'Krishna Agro',      invoice: 'INV-1049', amount: 7300,  status: 'Paid',    type: 'Sale',     date: '01:55 PM' },
  { id: 6,  customer: 'Durga Hardware',    invoice: 'INV-1050', amount: 3900,  status: 'Paid',    type: 'Return',   date: '02:10 PM' },
  { id: 7,  customer: 'Shree Steel',       invoice: 'INV-1051', amount: 21500, status: 'Pending', type: 'Sale',     date: '02:40 PM' },
  { id: 8,  customer: 'Ravi Plumbing',     invoice: 'INV-1052', amount: 6100,  status: 'Paid',    type: 'Sale',     date: '03:05 PM' },
  { id: 9,  customer: 'Ganesh Tiles',      invoice: 'PUR-0211', amount: 28600, status: 'Paid',    type: 'Purchase', date: '08:00 AM' },
  { id: 10, customer: 'Vishnu Electricals',invoice: 'INV-1053', amount: 9850,  status: 'Pending', type: 'Sale',     date: '03:30 PM' },
  { id: 11, customer: 'Mauli Traders',     invoice: 'INV-1054', amount: 4400,  status: 'Paid',    type: 'Sale',     date: '04:00 PM' },
  { id: 12, customer: 'Siddhi Paints',     invoice: 'INV-1055', amount: 13700, status: 'Pending', type: 'Sale',     date: '04:15 PM' },
  { id: 13, customer: 'Kripa Mart',        invoice: 'INV-1056', amount: 2200,  status: 'Paid',    type: 'Return',   date: '04:45 PM' },
  { id: 14, customer: 'Balaji Agro',       invoice: 'INV-1057', amount: 8800,  status: 'Paid',    type: 'Sale',     date: '05:00 PM' },
  { id: 15, customer: 'Samarth Hardware',  invoice: 'PUR-0212', amount: 15200, status: 'Pending', type: 'Purchase', date: '08:30 AM' },
  { id: 16, customer: 'Param Traders',     invoice: 'INV-1058', amount: 17400, status: 'Pending', type: 'Sale',     date: '05:30 PM' },
  { id: 17, customer: 'Ashtavinayak Co',   invoice: 'INV-1059', amount: 6600,  status: 'Paid',    type: 'Sale',     date: '05:45 PM' },
  { id: 18, customer: 'Vitthal Stores',    invoice: 'INV-1060', amount: 11300, status: 'Paid',    type: 'Sale',     date: '06:00 PM' },
  { id: 19, customer: 'Nandai Hardware',   invoice: 'INV-1061', amount: 3800,  status: 'Pending', type: 'Return',   date: '06:20 PM' },
  { id: 20, customer: 'Jai Hind Metals',   invoice: 'INV-1062', amount: 24700, status: 'Paid',    type: 'Sale',     date: '06:50 PM' }
];
