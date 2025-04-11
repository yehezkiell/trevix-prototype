export interface Vehicle {
  id: string
  model: string
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid"
  initialOdometer: number
  dateAdded: Date
}

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  taskType: string
  date: Date
  odometer: number
  cost: number
  notes?: string
}

export interface FuelRecord {
  id: string
  vehicleId: string
  fuelType: string
  amount: number
  pricePerUnit: number
  totalCost: number
  date: Date
  odometer: number
  notes?: string
}

export interface FilterOptions {
  vehicleId: string
  recordType: "all" | "maintenance" | "fuel"
  dateRange: {
    from: Date
    to: Date
  }
}

export type TimelineEvent = (MaintenanceRecord | FuelRecord) & {
  type: "maintenance" | "fuel"
}

