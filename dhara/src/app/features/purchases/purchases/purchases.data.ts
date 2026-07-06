// ─── Purchases — Data Types & Mock Data ─────────────────────────────────────

export type PurchaseStatus = 'Received' | 'Pending' | 'Partial' | 'Cancelled';
export type PaymentStatus  = 'Paid' | 'Unpaid' | 'Partial';
export type PaymentMode    = 'Cash' | 'UPI' | 'Cheque' | 'Bank Transfer' | 'Credit';

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  area: string;
  gst?: string;
  avatar: string;
  outstanding: number;
  totalOrders: number;
}

export interface PurchaseItem {
  productId: number;
  sku: string;
  name: string;
  unit: string;
  qty: number;
  rate: number;       // purchase price per unit
  gst: number;        // GST %
  total: number;      // qty * rate (before GST)
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: string;
  supplierId: number;
  supplierPhone: string;
  date: string;
  dueDate: string;
  items: PurchaseItem[];
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  paid: number;
  paymentMode: PaymentMode;
  status: PurchaseStatus;
  paymentStatus: PaymentStatus;
  notes: string;
  invoiceRef: string;
}

export interface PurchaseStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const SUPPLIERS: Supplier[] = [
  { id: 1, name: 'Ganesh Tiles & Plumbing',   phone: '9821100234', area: 'Nashik',     gst: '27ABCDE1234F1Z5', avatar: 'blue',   outstanding: 28600,  totalOrders: 42 },
  { id: 2, name: 'Supreme Industries Ltd',    phone: '9876543210', area: 'Pune',       gst: '27XYZPQ5678G2Z9', avatar: 'purple', outstanding: 45200,  totalOrders: 31 },
  { id: 3, name: 'Tata Steel Distributors',   phone: '9823456789', area: 'Mumbai',     gst: '27TATAS1234H3Z7', avatar: 'teal',   outstanding: 68200,  totalOrders: 28 },
  { id: 4, name: 'Polycab Electricals',       phone: '9765001122', area: 'Nashik',     gst: '27POLYC9876K4Z2', avatar: 'orange', outstanding: 12400,  totalOrders: 19 },
  { id: 5, name: 'Asian Paints Depot',        phone: '9845670011', area: 'Aurangabad', gst: '27ASIAN4321L5Z8', avatar: 'red',    outstanding: 21800,  totalOrders: 24 },
  { id: 6, name: 'UltraTech Cement Agency',   phone: '9900112233', area: 'Nashik',     gst: '27ULTRA6543M6Z1', avatar: 'green',  outstanding: 38400,  totalOrders: 36 },
  { id: 7, name: 'Jain Irrigation Systems',   phone: '9712340099', area: 'Jalgaon',    gst: '27JAINS2109N7Z3', avatar: 'blue',   outstanding: 9600,   totalOrders: 15 },
  { id: 8, name: 'Finolex Industries',        phone: '9833456700', area: 'Pune',       gst: '27FINOL3456P8Z6', avatar: 'purple', outstanding: 17200,  totalOrders: 22 },
];

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 1, poNumber: 'PUR-0241', supplier: 'UltraTech Cement Agency', supplierId: 6,
    supplierPhone: '9900112233', date: '05 Jul 2026', dueDate: '15 Jul 2026',
    items: [
      { productId: 20, sku: 'BLD-001', name: 'Cement Bag OPC 50kg', unit: 'Bag', qty: 50, rate: 340, gst: 28, total: 17000 },
    ],
    subtotal: 17000, gstAmount: 4760, grandTotal: 21760, paid: 0,
    paymentMode: 'Credit', status: 'Received', paymentStatus: 'Unpaid',
    notes: 'Urgent restock for ongoing project orders.', invoiceRef: 'UTC-8821'
  },
  {
    id: 2, poNumber: 'PUR-0240', supplier: 'Tata Steel Distributors', supplierId: 3,
    supplierPhone: '9823456789', date: '04 Jul 2026', dueDate: '14 Jul 2026',
    items: [
      { productId: 18, sku: 'STL-001', name: 'MS Wire 12 Gauge',    unit: 'Kg',   qty: 100, rate: 72, gst: 18, total: 7200  },
      { productId: 19, sku: 'STL-002', name: 'Barbed Wire 50m Roll', unit: 'Roll', qty: 20,  rate: 980, gst: 18, total: 19600 },
    ],
    subtotal: 26800, gstAmount: 4824, grandTotal: 31624, paid: 31624,
    paymentMode: 'Bank Transfer', status: 'Received', paymentStatus: 'Paid',
    notes: '', invoiceRef: 'TSD-4410'
  },
  {
    id: 3, poNumber: 'PUR-0239', supplier: 'Supreme Industries Ltd', supplierId: 2,
    supplierPhone: '9876543210', date: '03 Jul 2026', dueDate: '13 Jul 2026',
    items: [
      { productId: 1, sku: 'PLB-001', name: 'PVC Pipe 1 inch',       unit: 'Piece', qty: 200, rate: 85, gst: 18, total: 17000 },
      { productId: 2, sku: 'PLB-002', name: 'PVC Elbow 1 inch',      unit: 'Piece', qty: 500, rate: 12, gst: 18, total: 6000  },
      { productId: 4, sku: 'PLB-004', name: 'PVC Ball Valve 1 inch', unit: 'Piece', qty: 50,  rate: 145, gst: 18, total: 7250 },
    ],
    subtotal: 30250, gstAmount: 5445, grandTotal: 35695, paid: 20000,
    paymentMode: 'Cheque', status: 'Received', paymentStatus: 'Partial',
    notes: 'Balance ₹15,695 due by 13 Jul.', invoiceRef: 'SUP-2290'
  },
  {
    id: 4, poNumber: 'PUR-0238', supplier: 'Asian Paints Depot', supplierId: 5,
    supplierPhone: '9845670011', date: '02 Jul 2026', dueDate: '12 Jul 2026',
    items: [
      { productId: 16, sku: 'PNT-001', name: 'Paint White Exterior 20L', unit: 'Bucket', qty: 20, rate: 2800, gst: 18, total: 56000 },
      { productId: 17, sku: 'PNT-002', name: 'Paint Brush 2 inch',       unit: 'Piece',  qty: 100, rate: 22, gst: 12, total: 2200 },
    ],
    subtotal: 58200, gstAmount: 10332, grandTotal: 68532, paid: 68532,
    paymentMode: 'Bank Transfer', status: 'Received', paymentStatus: 'Paid',
    notes: '', invoiceRef: 'APD-7733'
  },
  {
    id: 5, poNumber: 'PUR-0237', supplier: 'Polycab Electricals', supplierId: 4,
    supplierPhone: '9765001122', date: '01 Jul 2026', dueDate: '11 Jul 2026',
    items: [
      { productId: 6,  sku: 'ELE-001', name: 'LED Bulb 9W',         unit: 'Piece', qty: 100, rate: 65, gst: 12, total: 6500  },
      { productId: 8,  sku: 'ELE-003', name: 'Cable 2.5mm',         unit: 'Meter', qty: 300, rate: 38, gst: 18, total: 11400 },
      { productId: 9,  sku: 'ELE-004', name: 'Float Switch',        unit: 'Piece', qty: 20,  rate: 320, gst: 18, total: 6400 },
    ],
    subtotal: 24300, gstAmount: 4050, grandTotal: 28350, paid: 0,
    paymentMode: 'Credit', status: 'Pending', paymentStatus: 'Unpaid',
    notes: 'Awaiting delivery from Nashik warehouse.', invoiceRef: ''
  },
  {
    id: 6, poNumber: 'PUR-0236', supplier: 'Ganesh Tiles & Plumbing', supplierId: 1,
    supplierPhone: '9821100234', date: '29 Jun 2026', dueDate: '09 Jul 2026',
    items: [
      { productId: 3, sku: 'PLB-003', name: 'GI Pipe 1.5 inch',    unit: 'Foot',  qty: 150, rate: 95, gst: 18, total: 14250 },
      { productId: 5, sku: 'PLB-005', name: 'Sanitary T-Trap 32mm', unit: 'Piece', qty: 80,  rate: 55, gst: 18, total: 4400 },
    ],
    subtotal: 18650, gstAmount: 3357, grandTotal: 22007, paid: 22007,
    paymentMode: 'Cash', status: 'Received', paymentStatus: 'Paid',
    notes: '', invoiceRef: 'GTP-1190'
  },
  {
    id: 7, poNumber: 'PUR-0235', supplier: 'Jain Irrigation Systems', supplierId: 7,
    supplierPhone: '9712340099', date: '27 Jun 2026', dueDate: '07 Jul 2026',
    items: [
      { productId: 13, sku: 'AGR-001', name: 'Shade Net Green',       unit: 'Sq.Mtr', qty: 200, rate: 28, gst: 5, total: 5600 },
      { productId: 14, sku: 'AGR-002', name: 'Drip Irrigation Tube',  unit: 'Meter',  qty: 500, rate: 8,  gst: 5, total: 4000 },
      { productId: 15, sku: 'AGR-003', name: 'Tarpaulin 15x20 ft',    unit: 'Piece',  qty: 20,  rate: 580, gst: 12, total: 11600 },
    ],
    subtotal: 21200, gstAmount: 1636, grandTotal: 22836, paid: 22836,
    paymentMode: 'UPI', status: 'Received', paymentStatus: 'Paid',
    notes: '', invoiceRef: 'JIS-5521'
  },
  {
    id: 8, poNumber: 'PUR-0234', supplier: 'Finolex Industries', supplierId: 8,
    supplierPhone: '9833456700', date: '25 Jun 2026', dueDate: '05 Jul 2026',
    items: [
      { productId: 7,  sku: 'ELE-002', name: 'Electrical Switch 6A', unit: 'Piece', qty: 200, rate: 28, gst: 18, total: 5600 },
    ],
    subtotal: 5600, gstAmount: 1008, grandTotal: 6608, paid: 3000,
    paymentMode: 'Cheque', status: 'Received', paymentStatus: 'Partial',
    notes: 'Remaining ₹3,608 overdue since 05 Jul.', invoiceRef: 'FIN-8812'
  },
  {
    id: 9, poNumber: 'PUR-0233', supplier: 'UltraTech Cement Agency', supplierId: 6,
    supplierPhone: '9900112233', date: '20 Jun 2026', dueDate: '30 Jun 2026',
    items: [
      { productId: 20, sku: 'BLD-001', name: 'Cement Bag OPC 50kg', unit: 'Bag', qty: 80, rate: 340, gst: 28, total: 27200 },
    ],
    subtotal: 27200, gstAmount: 7616, grandTotal: 34816, paid: 34816,
    paymentMode: 'Bank Transfer', status: 'Received', paymentStatus: 'Paid',
    notes: '', invoiceRef: 'UTC-8790'
  },
  {
    id: 10, poNumber: 'PUR-0232', supplier: 'Tata Steel Distributors', supplierId: 3,
    supplierPhone: '9823456789', date: '18 Jun 2026', dueDate: '28 Jun 2026',
    items: [
      { productId: 11, sku: 'HRD-002', name: 'Hex Bolt M10',         unit: 'Kg',  qty: 50,  rate: 85, gst: 18, total: 4250 },
      { productId: 12, sku: 'HRD-003', name: 'Welding Rod 6013',     unit: 'Kg',  qty: 30,  rate: 115, gst: 18, total: 3450 },
      { productId: 10, sku: 'HRD-001', name: 'Drill Bit Set (13pcs)', unit: 'Set', qty: 10, rate: 420, gst: 18, total: 4200 },
    ],
    subtotal: 11900, gstAmount: 2142, grandTotal: 14042, paid: 14042,
    paymentMode: 'Cash', status: 'Received', paymentStatus: 'Paid',
    notes: '', invoiceRef: 'TSD-4380'
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

export const PURCHASE_STATS: PurchaseStat[] = [
  { label: 'Total Orders',        value: '10',          icon: 'shopping_bag',           color: '#2563eb' },
  { label: 'This Month Value',    value: '₹2,41,926',   icon: 'currency_rupee',         color: '#7c3aed' },
  { label: 'Supplier Dues',       value: '₹68,200',     icon: 'account_balance_wallet', color: '#dc2626' },
  { label: 'Pending Deliveries',  value: '1 Order',     icon: 'local_shipping',         color: '#ea580c' },
];

// ─── Product catalogue for new order ─────────────────────────────────────────

export interface CatProduct { id: number; sku: string; name: string; unit: string; lastRate: number; gst: number; }

export const CATALOGUE: CatProduct[] = [
  { id: 1,  sku: 'PLB-001', name: 'PVC Pipe 1 inch',          unit: 'Piece',  lastRate: 85,   gst: 18 },
  { id: 2,  sku: 'PLB-002', name: 'PVC Elbow 1 inch',         unit: 'Piece',  lastRate: 12,   gst: 18 },
  { id: 3,  sku: 'PLB-003', name: 'GI Pipe 1.5 inch',         unit: 'Foot',   lastRate: 95,   gst: 18 },
  { id: 4,  sku: 'PLB-004', name: 'PVC Ball Valve 1 inch',    unit: 'Piece',  lastRate: 145,  gst: 18 },
  { id: 5,  sku: 'PLB-005', name: 'Sanitary T-Trap 32mm',     unit: 'Piece',  lastRate: 55,   gst: 18 },
  { id: 6,  sku: 'ELE-001', name: 'LED Bulb 9W',              unit: 'Piece',  lastRate: 65,   gst: 12 },
  { id: 7,  sku: 'ELE-002', name: 'Electrical Switch 6A',     unit: 'Piece',  lastRate: 28,   gst: 18 },
  { id: 8,  sku: 'ELE-003', name: 'Cable 2.5mm',              unit: 'Meter',  lastRate: 38,   gst: 18 },
  { id: 9,  sku: 'ELE-004', name: 'Float Switch',             unit: 'Piece',  lastRate: 320,  gst: 18 },
  { id: 10, sku: 'HRD-001', name: 'Drill Bit Set (13 pcs)',   unit: 'Set',    lastRate: 420,  gst: 18 },
  { id: 11, sku: 'HRD-002', name: 'Hex Bolt M10',             unit: 'Kg',     lastRate: 85,   gst: 18 },
  { id: 12, sku: 'HRD-003', name: 'Welding Rod 6013',         unit: 'Kg',     lastRate: 115,  gst: 18 },
  { id: 13, sku: 'AGR-001', name: 'Shade Net Green',          unit: 'Sq.Mtr', lastRate: 28,   gst: 5  },
  { id: 14, sku: 'AGR-002', name: 'Drip Irrigation Tube',     unit: 'Meter',  lastRate: 8,    gst: 5  },
  { id: 15, sku: 'AGR-003', name: 'Tarpaulin 15x20 ft',       unit: 'Piece',  lastRate: 580,  gst: 12 },
  { id: 16, sku: 'PNT-001', name: 'Paint White Exterior 20L', unit: 'Bucket', lastRate: 2800, gst: 18 },
  { id: 17, sku: 'PNT-002', name: 'Paint Brush 2 inch',       unit: 'Piece',  lastRate: 22,   gst: 12 },
  { id: 18, sku: 'STL-001', name: 'MS Wire 12 Gauge',         unit: 'Kg',     lastRate: 72,   gst: 18 },
  { id: 19, sku: 'STL-002', name: 'Barbed Wire 50m Roll',     unit: 'Roll',   lastRate: 980,  gst: 18 },
  { id: 20, sku: 'BLD-001', name: 'Cement Bag OPC 50kg',      unit: 'Bag',    lastRate: 340,  gst: 28 },
];
