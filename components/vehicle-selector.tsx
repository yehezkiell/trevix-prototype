"use client"

import { useState } from "react"
import type { Vehicle } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Car, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VehicleSelectorProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSelectVehicle: (vehicle: Vehicle | null) => void
}

export default function VehicleSelector({ vehicles, selectedVehicle, onSelectVehicle }: VehicleSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (vehicles.length === 0) return null

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1))
    onSelectVehicle(vehicles[activeIndex === 0 ? vehicles.length - 1 : activeIndex - 1])
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1))
    onSelectVehicle(vehicles[activeIndex === vehicles.length - 1 ? 0 : activeIndex + 1])
  }

  const handleSelect = (index: number) => {
    setActiveIndex(index)
    onSelectVehicle(vehicles[index])
  }

  return (
    <Card className="border-border shadow-md bg-card/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Vehicle carousel */}
          <div className="flex items-center justify-center py-6 px-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background shadow-md"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous vehicle</span>
            </Button>

            <div className="text-center px-12">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center shadow-inner">
                  <Car className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-1">{vehicles[activeIndex].model}</h2>
              <p className="text-sm text-muted-foreground">
                {vehicles[activeIndex].fuelType} • {vehicles[activeIndex].initialOdometer.toLocaleString()} km initial
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background shadow-md"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next vehicle</span>
            </Button>
          </div>

          {/* Dots indicator */}
          {vehicles.length > 1 && (
            <div className="flex justify-center gap-1 pb-4">
              {vehicles.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    index === activeIndex ? "bg-primary w-6" : "bg-muted hover:bg-muted-foreground/50",
                  )}
                  onClick={() => handleSelect(index)}
                >
                  <span className="sr-only">Vehicle {index + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

