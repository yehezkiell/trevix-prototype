"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { MaintenanceRecord, Vehicle } from "@/lib/types"
import { generateId, getVehicleCurrentOdometer } from "@/lib/utils"
import { Wrench, X, AlertCircle, CheckCircle2, Car, Calendar, DollarSign, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface MaintenanceFormProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSubmit: (record: MaintenanceRecord) => void
  onCancel: () => void
  existingRecord?: MaintenanceRecord
}

const MAINTENANCE_TYPES = [
  "Oil Change",
  "Air Filter Replacement",
  "Brake Pad Replacement",
  "Tire Rotation",
  "Spark Plug Replacement",
  "Battery Replacement",
  "Timing Belt Replacement",
  "Coolant Flush",
  "Transmission Service",
  "Other",
]

export default function MaintenanceForm({
  vehicles,
  selectedVehicle,
  onSubmit,
  onCancel,
  existingRecord,
}: MaintenanceFormProps) {
  const [step, setStep] = useState(1)
  const [vehicleId, setVehicleId] = useState(existingRecord?.vehicleId || selectedVehicle?.id || "")
  const [taskType, setTaskType] = useState(existingRecord?.taskType || MAINTENANCE_TYPES[0])
  const [date, setDate] = useState(
    existingRecord?.date
      ? new Date(existingRecord.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  )
  const [odometer, setOdometer] = useState(existingRecord?.odometer || 0)
  const [cost, setCost] = useState(existingRecord?.cost || 0)
  const [notes, setNotes] = useState(existingRecord?.notes || "")
  const [error, setError] = useState("")

  const [vehicleTouched, setVehicleTouched] = useState(false)
  const [odometerTouched, setOdometerTouched] = useState(false)
  const [costTouched, setCostTouched] = useState(false)

  // Set initial odometer reading based on selected vehicle
  useState(() => {
    if (!existingRecord && selectedVehicle) {
      setOdometer(getVehicleCurrentOdometer(selectedVehicle, [], []))
    }
  })

  const isVehicleValid = vehicleId !== ""
  const isOdometerValid = odometer >= 0
  const isCostValid = cost >= 0

  const validateStep1 = () => {
    setVehicleTouched(true)
    if (!isVehicleValid) {
      setError("Please select a vehicle")
      return false
    }
    setError("")
    return true
  }

  const validateStep2 = () => {
    setOdometerTouched(true)
    setCostTouched(true)

    if (!isOdometerValid) {
      setError("Odometer reading cannot be negative")
      return false
    }

    if (!isCostValid) {
      setError("Cost cannot be negative")
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
    if (!isVehicleValid || !isOdometerValid || !isCostValid) {
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

    const record: MaintenanceRecord = {
      id: existingRecord?.id || generateId(),
      vehicleId,
      taskType,
      date: new Date(date),
      odometer,
      cost,
      notes: notes.trim() || undefined,
    }

    onSubmit(record)
  }

  return (
    <Card className="w-full max-w-md mx-auto border-slate-200 shadow-lg dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onCancel}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-blue-500" />
          <CardTitle>{existingRecord ? "Edit Maintenance Record" : "Log Maintenance"}</CardTitle>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-1 mt-2" />
      </CardHeader>

      <CardContent className="pt-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-700 dark:text-blue-300 font-medium">1/2</span>
              </div>
            </div>

            <h3 className="text-center text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Basic Information
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
              <Label htmlFor="taskType" className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-slate-500" />
                Maintenance Type
              </Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger
                  id="taskType"
                  className="border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
                >
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select the type of maintenance performed</p>
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Date when the maintenance was performed</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-700 dark:text-blue-300 font-medium">2/2</span>
              </div>
            </div>

            <h3 className="text-center text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Details</h3>

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
                Current odometer reading at the time of maintenance
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  Cost ($)
                </span>
                {costTouched &&
                  (isCostValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ))}
              </Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                onBlur={() => setCostTouched(true)}
                className={`border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${
                  costTouched && !isCostValid ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {costTouched && !isCostValid && <p className="text-xs text-red-500">Cost cannot be negative</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400">Total cost of the maintenance service</p>
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
                Any additional information about the maintenance
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
            <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
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
            <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
              {existingRecord ? "Update Record" : "Save Record"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

