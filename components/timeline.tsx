"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FuelRecord, MaintenanceRecord, Vehicle, FilterOptions, TimelineEvent } from "@/lib/types"
import { formatCurrency, formatDate, combineAndSortEvents } from "@/lib/utils"
import { Wrench, Droplet, Calendar, Car, Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface TimelineProps {
  maintenanceRecords: MaintenanceRecord[]
  fuelRecords: FuelRecord[]
  vehicles: Vehicle[]
  filterOptions: FilterOptions
}

export default function Timeline({ maintenanceRecords, fuelRecords, vehicles, filterOptions }: TimelineProps) {
  // Apply filters
  const filteredMaintenanceRecords = maintenanceRecords.filter((record) => {
    const recordDate = new Date(record.date)
    const fromDate = new Date(filterOptions.dateRange.from)
    const toDate = new Date(filterOptions.dateRange.to)

    return (
      (filterOptions.vehicleId === "all" || record.vehicleId === filterOptions.vehicleId) &&
      (filterOptions.recordType === "all" || filterOptions.recordType === "maintenance") &&
      recordDate >= fromDate &&
      recordDate <= toDate
    )
  })

  const filteredFuelRecords = fuelRecords.filter((record) => {
    const recordDate = new Date(record.date)
    const fromDate = new Date(filterOptions.dateRange.from)
    const toDate = new Date(filterOptions.dateRange.to)

    return (
      (filterOptions.vehicleId === "all" || record.vehicleId === filterOptions.vehicleId) &&
      (filterOptions.recordType === "all" || filterOptions.recordType === "fuel") &&
      recordDate >= fromDate &&
      recordDate <= toDate
    )
  })

  // Combine and sort records
  const timelineEvents = combineAndSortEvents(filteredMaintenanceRecords, filteredFuelRecords)

  // Get vehicle name by ID
  const getVehicleName = (id: string): string => {
    const vehicle = vehicles.find((v) => v.id === id)
    return vehicle ? vehicle.model : "Unknown Vehicle"
  }

  // Group events by month and year
  const groupEventsByMonth = (events: TimelineEvent[]) => {
    const grouped: Record<string, TimelineEvent[]> = {}

    events.forEach((event) => {
      const date = new Date(event.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`

      if (!grouped[key]) {
        grouped[key] = []
      }

      grouped[key].push(event)
    })

    return Object.entries(grouped)
      .map(([key, events]) => {
        const [year, month] = key.split("-").map(Number)
        const date = new Date(year, month)

        return {
          date,
          label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          events,
        }
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const groupedEvents = groupEventsByMonth(timelineEvents)

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
    <Card className="border-slate-200 shadow-md dark:border-slate-700 dark:bg-slate-800/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300">
          <Calendar className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          History Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {timelineEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/30 mb-4 shadow-inner">
              <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-2">No records found for the selected filters.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Try adjusting your filters or add new maintenance and fuel records.
            </p>
          </div>
        ) : (
          <div className="relative px-6 py-8">
            {/* Vertical timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-indigo-200 dark:from-indigo-800/50 dark:via-purple-800/50 dark:to-indigo-800/50"></div>

            <motion.div variants={containerVariants} initial="hidden" animate="show">
              {groupedEvents.map((group, groupIndex) => (
                <motion.div key={group.label} className="mb-8 last:mb-0" variants={itemVariants}>
                  {/* Month/Year header */}
                  <div className="flex items-center mb-4 relative z-10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 relative z-10 shadow-md">
                      <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="ml-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {group.label}
                    </h3>
                  </div>

                  {/* Timeline events */}
                  <div className="space-y-6 ml-4">
                    {group.events.map((event, eventIndex) => {
                      const vehicleName = getVehicleName(event.vehicleId)
                      const isLast = eventIndex === group.events.length - 1 && groupIndex === groupedEvents.length - 1

                      if (event.type === "maintenance") {
                        return (
                          <motion.div className="relative pl-10" key={event.id} variants={itemVariants}>
                            {/* Timeline dot */}
                            <div className="absolute left-[-20px] top-0 flex items-center justify-center">
                              <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center z-10 border-2 border-white dark:border-slate-800 shadow-md">
                                <Wrench className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>

                            {/* Content card */}
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-md hover:shadow-lg transition-all">
                              <div className="flex items-center flex-wrap gap-2 mb-2">
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{event.taskType}</h4>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                >
                                  <Car className="h-3 w-3 mr-1" />
                                  {vehicleName}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-4 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {formatDate(event.date)}
                                </span>
                                <span className="flex items-center">
                                  <ArrowRight className="h-3.5 w-3.5 mr-1" />
                                  {event.odometer.toLocaleString()} km
                                </span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  {formatCurrency(event.cost)}
                                </span>
                              </div>
                              {event.notes && (
                                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md mt-2 border-l-2 border-blue-400 dark:border-blue-600">
                                  {event.notes}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )
                      } else {
                        return (
                          <motion.div className="relative pl-10" key={event.id} variants={itemVariants}>
                            {/* Timeline dot */}
                            <div className="absolute left-[-20px] top-0 flex items-center justify-center">
                              <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center z-10 border-2 border-white dark:border-slate-800 shadow-md">
                                <Droplet className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                            </div>

                            {/* Content card */}
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-md hover:shadow-lg transition-all">
                              <div className="flex items-center flex-wrap gap-2 mb-2">
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">Fuel Purchase</h4>
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                >
                                  <Car className="h-3 w-3 mr-1" />
                                  {vehicleName}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-4 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {formatDate(event.date)}
                                </span>
                                <span className="flex items-center">
                                  <ArrowRight className="h-3.5 w-3.5 mr-1" />
                                  {event.odometer.toLocaleString()} km
                                </span>
                                <span>
                                  {event.amount.toFixed(2)} {event.fuelType === "Electricity" ? "kWh" : "L"}
                                </span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(event.totalCost)}
                                </span>
                              </div>
                              {event.notes && (
                                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md mt-2 border-l-2 border-green-400 dark:border-green-600">
                                  {event.notes}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )
                      }
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

