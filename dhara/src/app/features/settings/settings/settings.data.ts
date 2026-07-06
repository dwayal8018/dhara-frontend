// ─── Settings — Data Types & Mock Data ──────────────────────────────────────

export type UserRole   = 'Owner' | 'Manager' | 'Cashier' | 'Storekeeper';
export type UserStatus = 'Active' | 'Inactive';
export type ThemeMode  = 'light' | 'dark' | 'system';
export type Language   = 'English' | 'Marathi' | 'Hindi';

export interface ShopProfile {
  shopName: string;
  ownerName: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst: string;
  pan: string;
  udyam: string;          // MSME registration
  bankName: string;
  accountNo: string;
  ifsc: string;
  upiId: string;
}

export interface StaffUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastLogin: string;
  avatar: string;
  permissions: string[];
}

export interface TaxConfig {
  gstRegistered: boolean;
  gstNumber: string;
  gstFiling: string;         // quarterly / monthly
  inclusivePricing: boolean; // prices include GST by default
  defaultGstRate: number;
  enableCess: boolean;
  roundOffAmount: boolean;
}

export interface NotificationPref {
  id: string;
  label: string;
  description: string;
  sms: boolean;
  whatsapp: boolean;
  inApp: boolean;
}

// ─── Shop Profile ─────────────────────────────────────────────────────────────

export const SHOP_PROFILE: ShopProfile = {
  shopName:  'DHARA Business',
  ownerName: 'Dnyaneshwari Patil',
  phone:     '9822011234',
  altPhone:  '9822011235',
  email:     'dhara.business@gmail.com',
  address:   'Plot 14, Indira Nagar, Near Bus Stand',
  city:      'Nashik',
  state:     'Maharashtra',
  pincode:   '422001',
  gst:       '27ABCPD1234F1Z5',
  pan:       'ABCPD1234F',
  udyam:     'UDYAM-MH-07-0012345',
  bankName:  'State Bank of India',
  accountNo: '12345678901234',
  ifsc:      'SBIN0001234',
  upiId:     'dhara.business@sbi',
};

// ─── Staff Users ──────────────────────────────────────────────────────────────

export const STAFF_USERS: StaffUser[] = [
  {
    id: 1, name: 'Dnyaneshwari Patil', phone: '9822011234', email: 'dhara.business@gmail.com',
    role: 'Owner', status: 'Active', joinDate: 'Jan 2020', lastLogin: 'Today, 09:14 AM',
    avatar: 'purple',
    permissions: ['All Access']
  },
  {
    id: 2, name: 'Sunil Kamble', phone: '9856781234', email: 'sunil.k@dhara.in',
    role: 'Manager', status: 'Active', joinDate: 'Mar 2021', lastLogin: 'Today, 08:42 AM',
    avatar: 'blue',
    permissions: ['Sales', 'Inventory', 'Purchases', 'Reports', 'Customers']
  },
  {
    id: 3, name: 'Pooja Shinde', phone: '9867001122', email: 'pooja.s@dhara.in',
    role: 'Cashier', status: 'Active', joinDate: 'Jun 2022', lastLogin: 'Today, 10:05 AM',
    avatar: 'pink',
    permissions: ['Sales', 'Customers']
  },
  {
    id: 4, name: 'Ravi Gaikwad', phone: '9712340011', email: 'ravi.g@dhara.in',
    role: 'Storekeeper', status: 'Active', joinDate: 'Sep 2022', lastLogin: 'Yesterday, 05:30 PM',
    avatar: 'green',
    permissions: ['Inventory', 'Purchases']
  },
  {
    id: 5, name: 'Anjali More', phone: '9934561200', email: 'anjali.m@dhara.in',
    role: 'Cashier', status: 'Inactive', joinDate: 'Jan 2023', lastLogin: '15 Jun 2026',
    avatar: 'orange',
    permissions: ['Sales']
  },
];

// ─── Tax Config ───────────────────────────────────────────────────────────────

export const TAX_CONFIG: TaxConfig = {
  gstRegistered:    true,
  gstNumber:        '27ABCPD1234F1Z5',
  gstFiling:        'quarterly',
  inclusivePricing: false,
  defaultGstRate:   18,
  enableCess:       false,
  roundOffAmount:   true,
};

// ─── Notification Preferences ────────────────────────────────────────────────

export const NOTIFICATION_PREFS: NotificationPref[] = [
  { id: 'low_stock',       label: 'Low Stock Alert',         description: 'When a product falls below minimum stock level',        sms: true,  whatsapp: true,  inApp: true  },
  { id: 'new_sale',        label: 'New Sale Completed',      description: 'When a new invoice is created and saved',               sms: false, whatsapp: false, inApp: true  },
  { id: 'payment_recv',    label: 'Payment Received',        description: 'When a customer payment is recorded',                   sms: true,  whatsapp: true,  inApp: true  },
  { id: 'due_reminder',    label: 'Customer Due Reminder',   description: 'Daily reminder for overdue customer balances',          sms: true,  whatsapp: true,  inApp: true  },
  { id: 'supplier_due',    label: 'Supplier Payment Due',    description: 'Reminder before supplier invoice due date',             sms: false, whatsapp: true,  inApp: true  },
  { id: 'daily_summary',   label: 'Daily Sales Summary',     description: 'End-of-day sales, profit and cash summary',             sms: false, whatsapp: true,  inApp: true  },
  { id: 'purchase_recv',   label: 'Purchase Order Received', description: 'When goods are received from a supplier',               sms: false, whatsapp: false, inApp: true  },
  { id: 'staff_login',     label: 'Staff Login Alert',       description: 'When a staff member logs into the system',              sms: false, whatsapp: false, inApp: false },
];
