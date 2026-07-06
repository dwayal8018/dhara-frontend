// ─── Sales / POS — Data Types & Mock Data ───────────────────────────────────

export type PaymentMode = 'Cash' | 'UPI' | 'Credit' | 'Cheque';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Partial';

export interface SaleProduct {
  id: number;
  sku: string;
  name: string;
  unit: string;
  sellingPrice: number;
  wholesalePrice: number;
  gst: number;
  stock: number;
}

export interface CartItem {
  product: SaleProduct;
  qty: number;
  price: number;       // editable selling price
  discount: number;    // % discount on line
}

export interface SavedInvoice {
  id: number;
  invoice: string;
  customer: string;
  phone: string;
  items: number;
  subtotal: number;
  gstAmt: number;
  discount: number;
  total: number;
  paid: number;
  paymentMode: PaymentMode;
  status: InvoiceStatus;
  date: string;
  time: string;
}

// ─── Catalogue (mirrors inventory products) ─────────────────────────────────

export const SALE_PRODUCTS: SaleProduct[] = [
  { id: 1,  sku: 'PLB-001', name: 'PVC Pipe 1 inch',        unit: 'Piece',  sellingPrice: 110,  wholesalePrice: 95,   gst: 18, stock: 6  },
  { id: 2,  sku: 'PLB-002', name: 'PVC Elbow 1 inch',       unit: 'Piece',  sellingPrice: 18,   wholesalePrice: 14,   gst: 18, stock: 9  },
  { id: 3,  sku: 'PLB-003', name: 'GI Pipe 1.5 inch',       unit: 'Foot',   sellingPrice: 125,  wholesalePrice: 108,  gst: 18, stock: 4  },
  { id: 4,  sku: 'PLB-004', name: 'PVC Ball Valve 1 inch',  unit: 'Piece',  sellingPrice: 195,  wholesalePrice: 165,  gst: 18, stock: 4  },
  { id: 5,  sku: 'PLB-005', name: 'Sanitary T-Trap 32mm',   unit: 'Piece',  sellingPrice: 75,   wholesalePrice: 62,   gst: 18, stock: 5  },
  { id: 6,  sku: 'ELE-001', name: 'LED Bulb 9W',            unit: 'Piece',  sellingPrice: 90,   wholesalePrice: 75,   gst: 12, stock: 12 },
  { id: 7,  sku: 'ELE-002', name: 'Electrical Switch 6A',   unit: 'Piece',  sellingPrice: 42,   wholesalePrice: 34,   gst: 18, stock: 14 },
  { id: 8,  sku: 'ELE-003', name: 'Cable 2.5mm',            unit: 'Meter',  sellingPrice: 52,   wholesalePrice: 44,   gst: 18, stock: 6  },
  { id: 9,  sku: 'ELE-004', name: 'Float Switch',           unit: 'Piece',  sellingPrice: 450,  wholesalePrice: 380,  gst: 18, stock: 7  },
  { id: 10, sku: 'HRD-001', name: 'Drill Bit Set (13 pcs)', unit: 'Set',    sellingPrice: 580,  wholesalePrice: 500,  gst: 18, stock: 3  },
  { id: 11, sku: 'HRD-002', name: 'Hex Bolt M10',           unit: 'Kg',     sellingPrice: 120,  wholesalePrice: 100,  gst: 18, stock: 15 },
  { id: 12, sku: 'HRD-003', name: 'Welding Rod 6013',       unit: 'Kg',     sellingPrice: 155,  wholesalePrice: 135,  gst: 18, stock: 8  },
  { id: 13, sku: 'AGR-001', name: 'Shade Net Green',        unit: 'Sq.Mtr', sellingPrice: 40,   wholesalePrice: 33,   gst: 5,  stock: 3  },
  { id: 14, sku: 'AGR-002', name: 'Drip Irrigation Tube',   unit: 'Meter',  sellingPrice: 12,   wholesalePrice: 10,   gst: 5,  stock: 7  },
  { id: 15, sku: 'AGR-003', name: 'Tarpaulin 15x20 ft',     unit: 'Piece',  sellingPrice: 780,  wholesalePrice: 660,  gst: 12, stock: 2  },
  { id: 16, sku: 'PNT-001', name: 'Paint White Exterior 20L', unit: 'Bucket', sellingPrice: 3500, wholesalePrice: 3100, gst: 18, stock: 5  },
  { id: 17, sku: 'PNT-002', name: 'Paint Brush 2 inch',     unit: 'Piece',  sellingPrice: 35,   wholesalePrice: 28,   gst: 12, stock: 10 },
  { id: 18, sku: 'STL-001', name: 'MS Wire 12 Gauge',       unit: 'Kg',     sellingPrice: 98,   wholesalePrice: 84,   gst: 18, stock: 8  },
  { id: 19, sku: 'STL-002', name: 'Barbed Wire 50m Roll',   unit: 'Roll',   sellingPrice: 1250, wholesalePrice: 1100, gst: 18, stock: 3  },
  { id: 20, sku: 'BLD-001', name: 'Cement Bag OPC 50kg',    unit: 'Bag',    sellingPrice: 390,  wholesalePrice: 365,  gst: 28, stock: 11 },
];

// ─── Recent Invoices ─────────────────────────────────────────────────────────

export const RECENT_INVOICES: SavedInvoice[] = [
  { id: 1,  invoice: 'INV-0241', customer: 'Ramesh Patil',      phone: '9822011234', items: 4,  subtotal: 4200,  gstAmt: 672,  discount: 0,   total: 4872,  paid: 4872,  paymentMode: 'Cash',   status: 'Paid',    date: '06 Jul 2026', time: '10:42 AM' },
  { id: 2,  invoice: 'INV-0240', customer: 'Ganesh More',       phone: '9823044512', items: 2,  subtotal: 1850,  gstAmt: 333,  discount: 5,   total: 2090,  paid: 1000,  paymentMode: 'Cash',    status: 'Partial', date: '06 Jul 2026', time: '09:15 AM' },
  { id: 3,  invoice: 'INV-0239', customer: 'Priya Kulkarni',    phone: '9881122334', items: 6,  subtotal: 8400,  gstAmt: 1512, discount: 0,   total: 9912,  paid: 9912,  paymentMode: 'UPI',    status: 'Paid',    date: '05 Jul 2026', time: '04:30 PM' },
  { id: 4,  invoice: 'INV-0238', customer: 'Vijay Deshmukh',    phone: '9700998877', items: 3,  subtotal: 2600,  gstAmt: 468,  discount: 10,  total: 2808,  paid: 0,     paymentMode: 'Credit', status: 'Pending', date: '05 Jul 2026', time: '02:10 PM' },
  { id: 5,  invoice: 'INV-0237', customer: 'Mahesh Bhosale',    phone: '9845001122', items: 8,  subtotal: 18600, gstAmt: 3348, discount: 5,   total: 21063, paid: 21063, paymentMode: 'Cheque', status: 'Paid',    date: '05 Jul 2026', time: '11:55 AM' },
  { id: 6,  invoice: 'INV-0236', customer: 'Sanjay Jadhav',     phone: '9765432101', items: 1,  subtotal: 390,   gstAmt: 109,  discount: 0,   total: 499,   paid: 499,   paymentMode: 'Cash',   status: 'Paid',    date: '04 Jul 2026', time: '03:20 PM' },
  { id: 7,  invoice: 'INV-0235', customer: 'Anita Pawar',       phone: '9934560012', items: 5,  subtotal: 5200,  gstAmt: 936,  discount: 0,   total: 6136,  paid: 3000,  paymentMode: 'UPI',     status: 'Partial', date: '04 Jul 2026', time: '01:08 PM' },
  { id: 8,  invoice: 'INV-0234', customer: 'Tushar Lokhande',   phone: '9788900123', items: 2,  subtotal: 3100,  gstAmt: 558,  discount: 2,   total: 3596,  paid: 3596,  paymentMode: 'UPI',    status: 'Paid',    date: '03 Jul 2026', time: '05:45 PM' },
  { id: 9,  invoice: 'INV-0233', customer: 'Rekha Thakur',      phone: '9666123400', items: 3,  subtotal: 1200,  gstAmt: 216,  discount: 0,   total: 1416,  paid: 0,     paymentMode: 'Credit', status: 'Pending', date: '03 Jul 2026', time: '10:30 AM' },
  { id: 10, invoice: 'INV-0232', customer: 'Kiran Chavan',      phone: '9932100988', items: 7,  subtotal: 9800,  gstAmt: 1764, discount: 8,   total: 10620, paid: 10620, paymentMode: 'Cash',   status: 'Paid',    date: '02 Jul 2026', time: '12:15 PM' },
];
