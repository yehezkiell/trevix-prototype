import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FuelRecord, MaintenanceRecord, TimelineEvent, Vehicle } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function calculateFuelEfficiency(currentRecord: FuelRecord, previousRecord: FuelRecord | null): number | null {
  if (!previousRecord) return null

  const distanceTraveled = currentRecord.odometer - previousRecord.odometer
  if (distanceTraveled <= 0) return null

  // Calculate efficiency in km/L or mpg
  return distanceTraveled / currentRecord.amount
}

export function getVehicleCurrentOdometer(
  vehicle: Vehicle,
  maintenanceRecords: MaintenanceRecord[],
  fuelRecords: FuelRecord[],
): number {
  const vehicleMaintenanceRecords = maintenanceRecords.filter((record) => record.vehicleId === vehicle.id)

  const vehicleFuelRecords = fuelRecords.filter((record) => record.vehicleId === vehicle.id)

  const allRecords = [...vehicleMaintenanceRecords, ...vehicleFuelRecords]

  if (allRecords.length === 0) {
    return vehicle.initialOdometer
  }

  const latestRecord = allRecords.reduce((latest, current) => {
    const currentOdometer = "odometer" in current ? current.odometer : 0
    const latestOdometer = "odometer" in latest ? latest.odometer : 0

    return currentOdometer > latestOdometer ? current : latest
  })

  return "odometer" in latestRecord ? latestRecord.odometer : vehicle.initialOdometer
}

export function combineAndSortEvents(
  maintenanceRecords: MaintenanceRecord[],
  fuelRecords: FuelRecord[],
): TimelineEvent[] {
  const maintenanceEvents = maintenanceRecords.map((record) => ({
    ...record,
    type: "maintenance" as const,
  }))

  const fuelEvents = fuelRecords.map((record) => ({
    ...record,
    type: "fuel" as const,
  }))

  return [...maintenanceEvents, ...fuelEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

