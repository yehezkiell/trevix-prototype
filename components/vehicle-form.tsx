"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Vehicle } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { Car, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface VehicleFormProps {
  onSubmit: (vehicle: Vehicle) => void
  onCancel: () => void
  existingVehicle?: Vehicle
}

export default function VehicleForm({ onSubmit, onCancel, existingVehicle }: VehicleFormProps) {
  const [step, setStep] = useState(1)
  const [model, setModel] = useState(existingVehicle?.model || "")
  const [fuelType, setFuelType] = useState<Vehicle["fuelType"]>(existingVehicle?.fuelType || "Petrol")
  const [initialOdometer, setInitialOdometer] = useState(existingVehicle?.initialOdometer || 0)
  const [error, setError] = useState("")
  const [modelTouched, setModelTouched] = useState(false)
  const [odometerTouched, setOdometerTouched] = useState(false)

  const isModelValid = model.trim().length > 0
  const isOdometerValid = initialOdometer >= 0

  const validateStep1 = () => {
    setModelTouched(true)
    if (!isModelValid) {
      setError("Please enter a vehicle model")
      return false
    }
    setError("")
    return true
  }

  const validateStep2 = () => {
    setOdometerTouched(true)
    if (!isOdometerValid) {
      setError("Odometer reading cannot be negative")
      return false
    }
    setError("")
    return true
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setError("")
    }
  }

  const handleSubmit = () => {
    if (!isModelValid || !isOdometerValid) {
      return
    }

    const vehicle: Vehicle = {
      id: existingVehicle?.id || generateId(),
      model: model.trim(),
      fuelType,
      initialOdometer,
      dateAdded: existingVehicle?.dateAdded || new Date(),
    }

    onSubmit(vehicle)
  }

  return (
    <Card className="w-full max-w-md mx-auto border-slate-200 shadow-lg dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onCancel}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <CardTitle>{existingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</CardTitle>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-1 mt-2" />
      </CardHeader>

      <CardContent className="pt-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-slate-700 dark:text-slate-300 font-medium">1/2</span>
              </div>
            </div>

            <h3 className="text-center text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Vehicle Details</h3>

            <div className="space-y-2">
              <Label htmlFor="model" className="flex items-center justify-between">
                Vehicle Model
                {modelTouched &&
                  (isModelValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ))}
              </Label>
              <Input
                id="model"
                placeholder="e.g. Toyota Corolla"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                onBlur={() => setModelTouched(true)}
                className={`border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${
                  modelTouched && !isModelValid ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {modelTouched && !isModelValid && <p className="text-xs text-red-500">Please enter a vehicle model</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400">Enter the make and model of your vehicle</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select value={fuelType} onValueChange={(value) => setFuelType(value as Vehicle["fuelType"])}>
                <SelectTrigger
                  id="fuelType"
                  className="border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
                >
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select the type of fuel your vehicle uses</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-slate-700 dark:text-slate-300 font-medium">2/2</span>
              </div>
            </div>

            <h3 className="text-center text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Odometer Reading
            </h3>

            <div className="space-y-2">
              <Label htmlFor="initialOdometer" className="flex items-center justify-between">
                Initial Odometer Reading (km)
                {odometerTouched &&
                  (isOdometerValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ))}
              </Label>
              <Input
                id="initialOdometer"
                type="number"
                min="0"
                value={initialOdometer}
                onChange={(e) => setInitialOdometer(Number(e.target.value))}
                onBlur={() => setOdometerTouched(true)}
                className={`border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${
                  odometerTouched && !isOdometerValid ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {odometerTouched && !isOdometerValid && (
                <p className="text-xs text-red-500">Odometer reading cannot be negative</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the current odometer reading of your vehicle in kilometers
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                This reading will be used as the starting point for tracking your vehicle's mileage.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-6 py-4">
        {step === 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={nextStep}
              className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Next
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={nextStep}
              className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              {existingVehicle ? "Update Vehicle" : "Add Vehicle"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

