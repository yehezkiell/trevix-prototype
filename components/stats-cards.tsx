"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FuelRecord, MaintenanceRecord, Vehicle } from "@/lib/types"
import { formatCurrency, getVehicleCurrentOdometer, calculateFuelEfficiency } from "@/lib/utils"
import { Gauge, Wrench, Droplet, Car, TrendingUp, Calendar, DollarSign } from "lucide-react"
import { motion } from "framer-motion"

interface StatsCardsProps {
  vehicles: Vehicle[]
  maintenanceRecords: MaintenanceRecord[]
  fuelRecords: FuelRecord[]
  selectedVehicle: Vehicle | null
  onSelectVehicle: (vehicle: Vehicle | null) => void
}

export default function StatsCards({
  vehicles,
  maintenanceRecords,
  fuelRecords,
  selectedVehicle,
  onSelectVehicle,
}: StatsCardsProps) {
  // Handle vehicle selection
  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId) || null
    onSelectVehicle(vehicle)
  }

  // Get filtered records for selected vehicle
  const getFilteredRecords = () => {
    if (!selectedVehicle) {
      return {
        maintenance: maintenanceRecords,
        fuel: fuelRecords,
      }
    }

    return {
      maintenance: maintenanceRecords.filter((r) => r.vehicleId === selectedVehicle.id),
      fuel: fuelRecords.filter((r) => r.vehicleId === selectedVehicle.id),
    }
  }

  const { maintenance, fuel } = getFilteredRecords()

  // Calculate stats
  const calculateStats = () => {
    if (!selectedVehicle) {
      return {
        totalMaintenanceCost: maintenanceRecords.reduce((sum, record) => sum + record.cost, 0),
        totalFuelCost: fuelRecords.reduce((sum, record) => sum + record.totalCost, 0),
        currentOdometer: 0,
        fuelEfficiency: null,
        lastMaintenanceDate:
          maintenanceRecords.length > 0
            ? new Date(Math.max(...maintenanceRecords.map((r) => new Date(r.date).getTime())))
            : null,
        lastFuelDate:
          fuelRecords.length > 0 ? new Date(Math.max(...fuelRecords.map((r) => new Date(r.date).getTime()))) : null,
      }
    }

    const currentOdometer = getVehicleCurrentOdometer(selectedVehicle, maintenance, fuel)
    const totalDistance = currentOdometer - selectedVehicle.initialOdometer

    // Sort fuel records by date
    const sortedFuelRecords = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate average fuel efficiency
    let totalEfficiency = 0
    let efficiencyCount = 0

    for (let i = 1; i < sortedFuelRecords.length; i++) {
      const efficiency = calculateFuelEfficiency(sortedFuelRecords[i], sortedFuelRecords[i - 1])
      if (efficiency !== null) {
        totalEfficiency += efficiency
        efficiencyCount++
      }
    }

    const avgEfficiency = efficiencyCount > 0 ? totalEfficiency / efficiencyCount : null

    const lastMaintenanceDate =
      maintenance.length > 0 ? new Date(Math.max(...maintenance.map((r) => new Date(r.date).getTime()))) : null

    const lastFuelDate = fuel.length > 0 ? new Date(Math.max(...fuel.map((r) => new Date(r.date).getTime()))) : null

    return {
      totalMaintenanceCost: maintenance.reduce((sum, record) => sum + record.cost, 0),
      totalFuelCost: fuel.reduce((sum, record) => sum + record.totalCost, 0),
      currentOdometer,
      totalDistance,
      fuelEfficiency: avgEfficiency,
      lastMaintenanceDate,
      lastFuelDate,
    }
  }

  const stats = calculateStats()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <Card className="theme-blue border-border shadow-md bg-card/50 overflow-hidden hover:shadow-lg transition-all min-h-[180px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[var(--card-gradient-from)] to-[var(--card-gradient-to)] border-b border-border">
              <CardTitle className="text-sm font-medium text-[var(--card-accent-color)]">
                Total Maintenance Cost
              </CardTitle>
              <div className="rounded-full bg-[var(--card-icon-bg)] p-2 shadow-inner">
                <Wrench className="h-4 w-4 text-[var(--card-icon-color)]" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalMaintenanceCost)}</div>
              <div className="mt-1 flex flex-col gap-1">
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-[var(--card-accent-color)]" />
                  {maintenance.length} maintenance records
                </p>
                {stats.lastMaintenanceDate && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-[var(--card-accent-color)]" />
                    Last: {stats.lastMaintenanceDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="theme-green border-border shadow-md bg-card/50 overflow-hidden hover:shadow-lg transition-all min-h-[180px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[var(--card-gradient-from)] to-[var(--card-gradient-to)] border-b border-border">
              <CardTitle className="text-sm font-medium text-[var(--card-accent-color)]">Total Fuel Cost</CardTitle>
              <div className="rounded-full bg-[var(--card-icon-bg)] p-2 shadow-inner">
                <Droplet className="h-4 w-4 text-[var(--card-icon-color)]" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalFuelCost)}</div>
              <div className="mt-1 flex flex-col gap-1">
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-[var(--card-accent-color)]" />
                  {fuel.length} fuel records
                </p>
                {stats.lastFuelDate && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-[var(--card-accent-color)]" />
                    Last: {stats.lastFuelDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="theme-amber border-border shadow-md bg-card/50 overflow-hidden hover:shadow-lg transition-all min-h-[180px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[var(--card-gradient-from)] to-[var(--card-gradient-to)] border-b border-border">
              <CardTitle className="text-sm font-medium text-[var(--card-accent-color)]">Current Odometer</CardTitle>
              <div className="rounded-full bg-[var(--card-icon-bg)] p-2 shadow-inner">
                <Car className="h-4 w-4 text-[var(--card-icon-color)]" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{stats.currentOdometer.toLocaleString()} km</div>
              {selectedVehicle && (
                <div className="mt-1 flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-[var(--card-accent-color)]" />
                    {stats.totalDistance.toLocaleString()} km since added
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-[var(--card-accent-color)]" />
                    Added: {new Date(selectedVehicle.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="theme-purple border-border shadow-md bg-card/50 overflow-hidden hover:shadow-lg transition-all min-h-[180px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[var(--card-gradient-from)] to-[var(--card-gradient-to)] border-b border-border">
              <CardTitle className="text-sm font-medium text-[var(--card-accent-color)]">
                Avg. Fuel Efficiency
              </CardTitle>
              <div className="rounded-full bg-[var(--card-icon-bg)] p-2 shadow-inner">
                <Gauge className="h-4 w-4 text-[var(--card-icon-color)]" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">
                {stats.fuelEfficiency !== null ? `${stats.fuelEfficiency.toFixed(2)} km/L` : "N/A"}
              </div>
              <div className="mt-1 flex flex-col gap-1">
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-[var(--card-accent-color)]" />
                  Based on {fuel.length} fuel records
                </p>
                {selectedVehicle && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 text-[var(--card-accent-color)]" />
                    {selectedVehicle.fuelType} vehicle
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

