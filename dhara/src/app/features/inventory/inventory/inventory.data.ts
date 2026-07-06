export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type Category = 'Plumbing' | 'Electrical' | 'Hardware' | 'Agriculture' | 'Paint' | 'Steel' | 'Sanitary' | 'Building';

export interface Product {
    id: number;
    sku: string;
    name: string;
    category: Category;
    brand: string;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    wholesalePrice: number;
    gst: number;
    stock: number;
    minStock: number;
    maxStock: number;
    warehouse: string;
    rack: string;
    barcode: string;
    status: StockStatus;
    image?: string;
}

export const CATEGORIES: { id: string; label: string; icon: string; count: number }[] = [
    { id: 'all', label: 'All Products', icon: 'apps', count: 20 },
    { id: 'plumbing', label: 'Plumbing', icon: 'plumbing', count: 5 },
    { id: 'electrical', label: 'Electrical', icon: 'bolt', count: 4 },
    { id: 'hardware', label: 'Hardware', icon: 'hardware', count: 3 },
    { id: 'agriculture', label: 'Agriculture', icon: 'grass', count: 3 },
    { id: 'paint', label: 'Paint', icon: 'format_paint', count: 2 },
    { id: 'steel', label: 'Steel', icon: 'settings_input_component', count: 2 },
    { id: 'sanitary', label: 'Sanitary', icon: 'water_drop', count: 0 },
    { id: 'building', label: 'Building', icon: 'domain', count: 1 },
];

export const PRODUCTS: Product[] = [
    { id: 1, sku: 'PLB-001', name: 'PVC Pipe 1 inch (per piece)', category: 'Plumbing', brand: 'Supreme', unit: 'Piece', purchasePrice: 85, sellingPrice: 110, wholesalePrice: 95, gst: 18, stock: 6, minStock: 20, maxStock: 200, warehouse: 'WH-A', rack: 'R-01', barcode: '8901234560011', status: 'Low Stock' },
    { id: 2, sku: 'PLB-002', name: 'PVC Elbow 1 inch', category: 'Plumbing', brand: 'Finolex', unit: 'Piece', purchasePrice: 12, sellingPrice: 18, wholesalePrice: 14, gst: 18, stock: 9, minStock: 30, maxStock: 500, warehouse: 'WH-A', rack: 'R-02', barcode: '8901234560012', status: 'Low Stock' },
    { id: 3, sku: 'PLB-003', name: 'GI Pipe 1.5 inch (per foot)', category: 'Plumbing', brand: 'Tata Steel', unit: 'Foot', purchasePrice: 95, sellingPrice: 125, wholesalePrice: 108, gst: 18, stock: 4, minStock: 20, maxStock: 150, warehouse: 'WH-B', rack: 'R-03', barcode: '8901234560013', status: 'Low Stock' },
    { id: 4, sku: 'PLB-004', name: 'PVC Ball Valve 1 inch', category: 'Plumbing', brand: 'Zoloto', unit: 'Piece', purchasePrice: 145, sellingPrice: 195, wholesalePrice: 165, gst: 18, stock: 4, minStock: 20, maxStock: 100, warehouse: 'WH-A', rack: 'R-04', barcode: '8901234560014', status: 'Low Stock' },
    { id: 5, sku: 'PLB-005', name: 'Sanitary T-Trap 32mm', category: 'Plumbing', brand: 'Astral', unit: 'Piece', purchasePrice: 55, sellingPrice: 75, wholesalePrice: 62, gst: 18, stock: 5, minStock: 20, maxStock: 100, warehouse: 'WH-A', rack: 'R-05', barcode: '8901234560015', status: 'Low Stock' },
    { id: 6, sku: 'ELE-001', name: 'LED Bulb 9W', category: 'Electrical', brand: 'Philips', unit: 'Piece', purchasePrice: 65, sellingPrice: 90, wholesalePrice: 75, gst: 12, stock: 12, minStock: 30, maxStock: 300, warehouse: 'WH-C', rack: 'R-10', barcode: '8901234560021', status: 'Low Stock' },
    { id: 7, sku: 'ELE-002', name: 'Electrical Switch 6A', category: 'Electrical', brand: 'Anchor', unit: 'Piece', purchasePrice: 28, sellingPrice: 42, wholesalePrice: 34, gst: 18, stock: 14, minStock: 40, maxStock: 400, warehouse: 'WH-C', rack: 'R-11', barcode: '8901234560022', status: 'Low Stock' },
    { id: 8, sku: 'ELE-003', name: 'Cable 2.5mm (per meter)', category: 'Electrical', brand: 'Polycab', unit: 'Meter', purchasePrice: 38, sellingPrice: 52, wholesalePrice: 44, gst: 18, stock: 6, minStock: 25, maxStock: 500, warehouse: 'WH-C', rack: 'R-12', barcode: '8901234560023', status: 'Low Stock' },
    { id: 9, sku: 'ELE-004', name: 'Float Switch', category: 'Electrical', brand: 'Havells', unit: 'Piece', purchasePrice: 320, sellingPrice: 450, wholesalePrice: 380, gst: 18, stock: 7, minStock: 25, maxStock: 100, warehouse: 'WH-C', rack: 'R-13', barcode: '8901234560024', status: 'Low Stock' },
    { id: 10, sku: 'HRD-001', name: 'Drill Bit Set (13 pcs)', category: 'Hardware', brand: 'Bosch', unit: 'Set', purchasePrice: 420, sellingPrice: 580, wholesalePrice: 500, gst: 18, stock: 3, minStock: 12, maxStock: 50, warehouse: 'WH-B', rack: 'R-20', barcode: '8901234560031', status: 'Low Stock' },
    { id: 11, sku: 'HRD-002', name: 'Hex Bolt M10 (per kg)', category: 'Hardware', brand: 'Unbranded', unit: 'Kg', purchasePrice: 85, sellingPrice: 120, wholesalePrice: 100, gst: 18, stock: 15, minStock: 50, maxStock: 200, warehouse: 'WH-B', rack: 'R-21', barcode: '8901234560032', status: 'Low Stock' },
    { id: 12, sku: 'HRD-003', name: 'Welding Rod 6013 (per kg)', category: 'Hardware', brand: 'D&H', unit: 'Kg', purchasePrice: 115, sellingPrice: 155, wholesalePrice: 135, gst: 18, stock: 8, minStock: 30, maxStock: 150, warehouse: 'WH-B', rack: 'R-22', barcode: '8901234560033', status: 'Low Stock' },
    { id: 13, sku: 'AGR-001', name: 'Shade Net Green (per sqm)', category: 'Agriculture', brand: 'Garware', unit: 'Sq.Mtr', purchasePrice: 28, sellingPrice: 40, wholesalePrice: 33, gst: 5, stock: 3, minStock: 10, maxStock: 200, warehouse: 'WH-D', rack: 'R-30', barcode: '8901234560041', status: 'Low Stock' },
    { id: 14, sku: 'AGR-002', name: 'Drip Irrigation Tube 16mm', category: 'Agriculture', brand: 'Jain', unit: 'Meter', purchasePrice: 8, sellingPrice: 12, wholesalePrice: 10, gst: 5, stock: 7, minStock: 20, maxStock: 500, warehouse: 'WH-D', rack: 'R-31', barcode: '8901234560042', status: 'Low Stock' },
    { id: 15, sku: 'AGR-003', name: 'Tarpaulin 15x20 ft', category: 'Agriculture', brand: 'Singhal', unit: 'Piece', purchasePrice: 580, sellingPrice: 780, wholesalePrice: 660, gst: 12, stock: 2, minStock: 10, maxStock: 50, warehouse: 'WH-D', rack: 'R-32', barcode: '8901234560043', status: 'Low Stock' },
    { id: 16, sku: 'PNT-001', name: 'Paint White Exterior 20L', category: 'Paint', brand: 'Asian Paints', unit: 'Bucket', purchasePrice: 2800, sellingPrice: 3500, wholesalePrice: 3100, gst: 18, stock: 5, minStock: 15, maxStock: 60, warehouse: 'WH-E', rack: 'R-40', barcode: '8901234560051', status: 'Low Stock' },
    { id: 17, sku: 'PNT-002', name: 'Paint Brush 2 inch', category: 'Paint', brand: 'Cello', unit: 'Piece', purchasePrice: 22, sellingPrice: 35, wholesalePrice: 28, gst: 12, stock: 10, minStock: 30, maxStock: 200, warehouse: 'WH-E', rack: 'R-41', barcode: '8901234560052', status: 'Low Stock' },
    { id: 18, sku: 'STL-001', name: 'MS Wire 12 Gauge (per kg)', category: 'Steel', brand: 'Tata Steel', unit: 'Kg', purchasePrice: 72, sellingPrice: 98, wholesalePrice: 84, gst: 18, stock: 8, minStock: 25, maxStock: 200, warehouse: 'WH-B', rack: 'R-50', barcode: '8901234560061', status: 'Low Stock' },
    { id: 19, sku: 'STL-002', name: 'Barbed Wire 50m Roll', category: 'Steel', brand: 'Tata Steel', unit: 'Roll', purchasePrice: 980, sellingPrice: 1250, wholesalePrice: 1100, gst: 18, stock: 3, minStock: 15, maxStock: 60, warehouse: 'WH-B', rack: 'R-51', barcode: '8901234560062', status: 'Low Stock' },
    { id: 20, sku: 'BLD-001', name: 'Cement Bag OPC 50kg', category: 'Building', brand: 'UltraTech', unit: 'Bag', purchasePrice: 340, sellingPrice: 390, wholesalePrice: 365, gst: 28, stock: 11, minStock: 50, maxStock: 500, warehouse: 'WH-F', rack: 'R-60', barcode: '8901234560071', status: 'Low Stock' },
];

export const INVENTORY_STATS = [
    { label: 'Total Products', value: '20', icon: 'inventory_2', color: '#2563eb' },
    { label: 'Low Stock', value: '18', icon: 'warning', color: '#f59e0b' },
    { label: 'Out of Stock', value: '0', icon: 'block', color: '#dc2626' },
    { label: 'Total Value', value: '₹2,84,650', icon: 'payments', color: '#16a34a' },
];
