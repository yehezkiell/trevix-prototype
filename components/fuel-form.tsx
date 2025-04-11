"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { FuelRecord, Vehicle } from "@/lib/types"
import { generateId, getVehicleCurrentOdometer } from "@/lib/utils"
import { Droplet, X, AlertCircle, CheckCircle2, Car, Calendar, DollarSign, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface FuelFormProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSubmit: (record: FuelRecord) => void
  onCancel: () => void
  existingRecord?: FuelRecord
}

export default function FuelForm({ vehicles, selectedVehicle, onSubmit, onCancel, existingRecord }: FuelFormProps) {
  const [step, setStep] = useState(1)
  const [vehicleId, setVehicleId] = useState(existingRecord?.vehicleId || selectedVehicle?.id || "")
  const [fuelType, setFuelType] = useState(existingRecord?.fuelType || "")
  const [amount, setAmount] = useState(existingRecord?.amount || 0)
  const [pricePerUnit, setPricePerUnit] = useState(existingRecord?.pricePerUnit || 0)
  const [date, setDate] = useState(
    existingRecord?.date
      ? new Date(existingRecord.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  )
  const [odometer, setOdometer] = useState(existingRecord?.odometer || 0)
  const [notes, setNotes] = useState(existingRecord?.notes || "")
  const [error, setError] = useState("")

  const [vehicleTouched, setVehicleTouched] = useState(false)
  const [fuelTypeTouched, setFuelTypeTouched] = useState(false)
  const [amountTouched, setAmountTouched] = useState(false)
  const [priceTouched, setPriceTouched] = useState(false)
  const [odometerTouched, setOdometerTouched] = useState(false)

  // Set initial values based on selected vehicle
  useState(() => {
    if (!existingRecord && selectedVehicle) {
      setOdometer(getVehicleCurrentOdometer(selectedVehicle, [], []))
      setFuelType(selectedVehicle.fuelType === "Electric" ? "Electricity" : selectedVehicle.fuelType)
    }
  })

  // Calculate total cost
  const totalCost = amount * pricePerUnit

  const isVehicleValid = vehicleId !== ""
  const isFuelTypeValid = fuelType !== ""
  const isAmountValid = amount > 0
  const isPriceValid = pricePerUnit > 0
  const isOdometerValid = odometer >= 0

  const validateStep1 = () => {
    setVehicleTouched(true)
    setFuelTypeTouched(true)

    if (!isVehicleValid) {
      setError("Please select a vehicle")
      return false
    }

    if (!isFuelTypeValid) {
      setError("Please select a fuel type")
      return false
    }

    setError("")
    return true
  }

  const validateStep2 = () => {
    setAmountTouched(true)
    setPriceTouched(true)

    if (!isAmountValid) {
      setError("Fuel amount must be greater than zero")
      return false
    }

    if (!isPriceValid) {
      setError("Price per unit must be greater than zero")
      return false
    }

    setError("")
    return true
  }

  const validateStep3 = () => {
    setOdometerTouched(true)

    if (!isOdometerValid) {
      setError("Odometer reading cannot be negative")
      return false
    }

    const selectedVeh = vehicles.find((v) => v.id === vehicleId)
    if (selectedVeh && odometer < selectedVeh.initialOdometer) {
      setError(`Odometer reading cannot be less than the initial reading (${selectedVeh.initialOdometer})`)
      return false
    }

    setError("")
    return true
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    } else if (step === 3 && validateStep3()) {
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
    if (!isVehicleValid || !isFuelTypeValid || !isAmountValid || !isPriceValid || !isOdometerValid) {
      return
    }

    const selectedVeh = vehicles.find((v) => v.id === vehicleId)
    if (!selectedVeh) {
      setError("Invalid vehicle selected")
      return
    }

    if (odometer < selectedVeh.initialOdometer) {
      setError(`Odometer reading cannot be less than the initial reading (${selectedVeh.initialOdometer})`)
      return
    }

    const record: FuelRecord = {
      id: existingRecord?.id || generateId(),
      vehicleId,
      fuelType,
      amount,
      pricePerUnit,
      totalCost,
      date: new Date(date),
      odometer,
      notes: notes.trim() || undefined,
    }

    onSubmit(record)
  }

  // Get fuel type options based on selected vehicle
  const getFuelTypeOptions = () => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return ["Petrol", "Diesel"]

    switch (vehicle.fuelType) {
      case "Electric":
        return ["Electricity"]
      case "Hybrid":
        return ["Petrol", "Electricity"]
      default:
        return [vehicle.fuelType]
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-slate-200 shadow-lg dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onCancel}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-green-500" />
          <CardTitle>{existingRecord ? "Edit Fuel Record" : "Log Fuel Purchase"}</CardTitle>
        </div>
        <Progress value={step * 33.33} className="h-1 mt-2" />
      </CardHeader>

      <CardContent className="pt-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-700 dark:text-green-300 font-medium">1/3</span>
              </div>
            </div>

            <h3 className="text-center text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Vehicle & Fuel Type
            </h3>

            <div className="space-y-2">
              <Label htmlFor="vehicle" className="flex items-center gap-2">
                <Car className="h-4 w-4 text-slate-500" />
                Vehicle
                {vehicleTouched &&
                  (isVehicleValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 ml-auto" />
                  ))}
              </Label>
              <Select
                value={vehicleId}
                onValueChange={(value) => {
                  setVehicleId(value)
                  setVehicleTouched(true)

                  // Reset fuel type when vehicle changes
                  const vehicle = vehicles.find((v) => v.id === value)
                  if (vehicle) {
                    setFuelType(vehicle.fuelType === "Electric" ? "Electricity" : vehicle.fuelType)
                    setFuelTypeTouched(true)
                  }
                }}
              >
                <SelectTrigger
                  id="vehicle"
                  className={`border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${
                    vehicleTouched && !isVehicleValid ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {vehicleTouched && !isVehicleValid && <p className="text-xs text-red-500">Please select a vehicle</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType" className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-slate-500" />
                Fuel Type
                {fuelTypeTouched &&
                  (isFuelTypeValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 ml-auto" />
                  ))}
              </Label>
              <Select
                value={fuelType}
                onValueChange={(value) => {
                  setFuelType(value)
                  setFuelTypeTouched(true)
                }}
              >
                <SelectTrigger
                  id="fuelType"
                  className={`border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${
                    fuelTypeTouched && !isFuelTypeValid ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {getFuelTypeOptions().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fuelTypeTouched && !isFuelTypeValid && <p className="text-xs text-red-500">Please select a fuel type</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400">Select the type of fuel purchased</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Date when the fuel was purchased</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-700 dark:text-green-300 font-medium">2/3</span>
              </div>
            </div>

            <h3 className="text-center text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Fuel Details</h3>

            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-slate-500" />
                  Amount ({fuelType === "Electricity" ? "kWh" : "liters"})
                </span>
                {amountTouched &&
                  (isAmountValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ))}
              </Label>
              <Input
                id="amount"
                type="number"
                min="0.1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                onBlur={() => setAmountTouched(true)}
                className={`border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${
                  amountTouched && !isAmountValid ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {amountTouched && !isAmountValid && (
                <p className="text-xs text-red-500">Amount must be greater than zero</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">The amount of fuel purchased</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerUnit" className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  Price per {fuelType === "Electricity" ? "kWh" : "liter"} ($)
                </span>
                {priceTouched &&
                  (isPriceValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ))}
              </Label>
              <Input
                id="pricePerUnit"
                type="number"
                min="0.01"
                step="0.01"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                onBlur={() => setPriceTouched(true)}
                className={`border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${
                  priceTouched && !isPriceValid ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {priceTouched && !isPriceValid && <p className="text-xs text-red-500">Price must be greater than zero</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400">The price per unit of fuel</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCost" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                Total Cost ($)
              </Label>
              <Input
                id="totalCost"
                type="number"
                value={totalCost.toFixed(2)}
                disabled
                className="bg-slate-50 dark:bg-slate-800"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated automatically based on amount and price
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-700 dark:text-green-300 font-medium">3/3</span>
              </div>
            </div>

            <h3 className="text-center text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Additional Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="odometer" className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-500" />
                  Odometer Reading (km)
                </span>
                {odometerTouched &&
                  (isOdometerValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ))}
              </Label>
              <Input
                id="odometer"
                type="number"
                min="0"
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                onBlur={() => setOdometerTouched(true)}
                className={`border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${
                  odometerTouched && !isOdometerValid ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {odometerTouched && !isOdometerValid && (
                <p className="text-xs text-red-500">Odometer reading cannot be negative</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current odometer reading at the time of fuel purchase
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 min-h-[80px]"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Any additional information about the fuel purchase
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-100 dark:border-green-800/30">
              <p className="text-sm text-green-700 dark:text-green-300 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Accurate odometer readings help calculate your vehicle's fuel efficiency over time.
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
            <Button type="button" onClick={nextStep} className="bg-green-600 hover:bg-green-700 text-white">
              Next
            </Button>
          </>
        ) : step === 2 ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Back
            </Button>
            <Button type="button" onClick={nextStep} className="bg-green-600 hover:bg-green-700 text-white">
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
            <Button type="button" onClick={nextStep} className="bg-green-600 hover:bg-green-700 text-white">
              {existingRecord ? "Update Record" : "Save Record"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

