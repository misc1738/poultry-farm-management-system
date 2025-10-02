export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  createdAt: string
}

export interface BirdSale {
  id: string
  date: string
  quantity: number
  pricePerBird: number
  totalAmount: number
  buyer: string
  notes?: string
  createdBy: string
  createdAt: string
}

export interface EggSale {
  id: string
  date: string
  quantity: number
  pricePerCrate: number
  totalAmount: number
  buyer: string
  notes?: string
  createdBy: string
  createdAt: string
}

export interface Mortality {
  id: string
  date: string
  quantity: number
  cause: string
  notes?: string
  createdBy: string
  createdAt: string
}

export interface Purchase {
  id: string
  date: string
  item: string
  quantity: number
  unitPrice: number
  totalAmount: number
  supplier: string
  notes?: string
  createdBy: string
  createdAt: string
}

export interface Batch {
  id: string
  batchNumber: string
  batchName: string
  initialQuantity: number
  currentQuantity: number
  dateReceived: string
  breed: string
  ageInWeeks: number
  status: "active" | "sold" | "completed"
  notes?: string
  createdBy: string
  createdAt: string
}

export interface InventoryItem {
  id: string
  name: string
  category: "feed" | "medication" | "equipment" | "other"
  quantity: number
  unit: string
  reorderLevel: number
  unitPrice: number
  supplier: string
  lastRestocked: string
  expiryDate?: string
  notes?: string
  createdBy: string
  createdAt: string
}

export interface InventoryTransaction {
  id: string
  itemId: string
  itemName: string
  type: "in" | "out"
  quantity: number
  reason: string
  date: string
  notes?: string
  createdBy: string
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  customerType: "individual" | "business"
  taxId?: string
  notes?: string
  createdBy: string
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  date: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  taxRate: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  notes?: string
  createdBy: string
  createdAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  details: string
  timestamp: string
}
