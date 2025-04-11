"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { FilterOptions, Vehicle } from "@/lib/types"
import { DatePicker } from "@/components/date-picker"
import { Filter, Car, Calendar, RefreshCw } from "lucide-react"

interface FilterControlsProps {
  vehicles: Vehicle[]
  filterOptions: FilterOptions
  onFilterChange: (filters: Partial<FilterOptions>) => void
}

export default function FilterControls({ vehicles, filterOptions, onFilterChange }: FilterControlsProps) {
  const resetFilters = () => {
    onFilterChange({
      vehicleId: "all",
      recordType: "all",
      dateRange: {
        from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        to: new Date(),
      },
    })
  }

  return (
    <Card className="border-border shadow-md bg-card/50 overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center text-primary font-medium">
            <Filter className="mr-2 h-4 w-4 text-primary" />
            Filter Records
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="ml-auto text-muted-foreground hover:text-primary"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Reset
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleFilter" className="flex items-center text-muted-foreground text-sm">
              <Car className="mr-1 h-3.5 w-3.5" />
              Vehicle
            </Label>
            <Select value={filterOptions.vehicleId} onValueChange={(value) => onFilterChange({ vehicleId: value })}>
              <SelectTrigger id="vehicleFilter" className="border-input focus-visible:ring-ring bg-background">
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordTypeFilter" className="flex items-center text-muted-foreground text-sm">
              <Filter className="mr-1 h-3.5 w-3.5" />
              Record Type
            </Label>
            <Select
              value={filterOptions.recordType}
              onValueChange={(value) =>
                onFilterChange({
                  recordType: value as FilterOptions["recordType"],
                })
              }
            >
              <SelectTrigger id="recordTypeFilter" className="border-input focus-visible:ring-ring bg-background">
                <SelectValue placeholder="All Records" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="maintenance">Maintenance Only</SelectItem>
                <SelectItem value="fuel">Fuel Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center text-muted-foreground text-sm">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              From Date
            </Label>
            <DatePicker
              date={filterOptions.dateRange.from}
              onSelect={(date) =>
                onFilterChange({
                  dateRange: {
                    ...filterOptions.dateRange,
                    from: date || new Date(),
                  },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center text-muted-foreground text-sm">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              To Date
            </Label>
            <DatePicker
              date={filterOptions.dateRange.to}
              onSelect={(date) =>
                onFilterChange({
                  dateRange: {
                    ...filterOptions.dateRange,
                    to: date || new Date(),
                  },
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

