"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Plus,
	Car,
	Wrench,
	Droplet,
	Bell,
	Download,
	MoreHorizontal,
} from "lucide-react";
import VehicleForm from "@/components/vehicle-form";
import MaintenanceForm from "@/components/maintenance-form";
import FuelForm from "@/components/fuel-form";
import Timeline from "@/components/timeline";
import StatsCards from "@/components/stats-cards";
import FilterControls from "@/components/filter-controls";
import type {
	Vehicle,
	MaintenanceRecord,
	FuelRecord,
	FilterOptions,
} from "@/lib/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import VehicleSelector from "@/components/vehicle-selector";

export default function Dashboard() {
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [maintenanceRecords, setMaintenanceRecords] = useState<
		MaintenanceRecord[]
	>([]);
	const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
		null
	);
	const [showVehicleForm, setShowVehicleForm] = useState(false);
	const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
	const [showFuelForm, setShowFuelForm] = useState(false);
	const [filterOptions, setFilterOptions] = useState<FilterOptions>({
		vehicleId: "all",
		recordType: "all",
		dateRange: {
			from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
			to: new Date(),
		},
	});

	// Load data from localStorage on component mount
	useEffect(() => {
		const savedVehicles = localStorage.getItem("vehicles");
		const savedMaintenance = localStorage.getItem("maintenanceRecords");
		const savedFuel = localStorage.getItem("fuelRecords");

		if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
		if (savedMaintenance)
			setMaintenanceRecords(JSON.parse(savedMaintenance));
		if (savedFuel) setFuelRecords(JSON.parse(savedFuel));
	}, []);

	// Save data to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("vehicles", JSON.stringify(vehicles));
		localStorage.setItem(
			"maintenanceRecords",
			JSON.stringify(maintenanceRecords)
		);
		localStorage.setItem("fuelRecords", JSON.stringify(fuelRecords));
	}, [vehicles, maintenanceRecords, fuelRecords]);

	const handleAddVehicle = (vehicle: Vehicle) => {
		setVehicles([...vehicles, vehicle]);
		setShowVehicleForm(false);
		if (!selectedVehicle) setSelectedVehicle(vehicle);
		toast({
			title: "Vehicle Added",
			description: `${vehicle.model} has been added to your garage.`,
		});
	};

	const handleAddMaintenance = (record: MaintenanceRecord) => {
		setMaintenanceRecords([...maintenanceRecords, record]);
		setShowMaintenanceForm(false);
		toast({
			title: "Maintenance Logged",
			description: `${record.taskType} has been recorded.`,
		});
	};

	const handleAddFuel = (record: FuelRecord) => {
		setFuelRecords([...fuelRecords, record]);
		setShowFuelForm(false);
		toast({
			title: "Fuel Purchase Logged",
			description: `${record.amount.toFixed(2)} ${
				record.fuelType === "Electricity" ? "kWh" : "L"
			} has been recorded.`,
		});
	};

	const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
		setFilterOptions({ ...filterOptions, ...newFilters });
	};

	const exportData = () => {
		const data = {
			vehicles,
			maintenanceRecords,
			fuelRecords,
			exportDate: new Date().toISOString(),
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `car-maintenance-data-${
			new Date().toISOString().split("T")[0]
		}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		toast({
			title: "Data Exported",
			description: "Your data has been exported successfully.",
		});
	};

	return (
		<div className="min-h-screen">
			<div className="container mx-auto py-6 px-4 sm:px-6">
				<div className="flex flex-col space-y-8">
					<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
						<div>
							<h1 className="text-2xl font-bold tracking-tight text-primary">
								Dashboard
							</h1>
							<p className="text-muted-foreground mt-1">
								Track your vehicle maintenance and fuel
								consumption
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<Button
								onClick={() => setShowVehicleForm(true)}
								className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
							>
								<Car className="mr-2 h-4 w-4" />
								Add Vehicle
							</Button>
							<Button
								onClick={() => setShowMaintenanceForm(true)}
								disabled={vehicles.length === 0}
								variant="outline"
								className="border-border hover:bg-accent"
							>
								<Wrench className="mr-2 h-4 w-4" />
								Log Maintenance
							</Button>
							<Button
								onClick={() => setShowFuelForm(true)}
								disabled={vehicles.length === 0}
								variant="outline"
								className="border-border hover:bg-accent"
							>
								<Droplet className="mr-2 h-4 w-4" />
								Log Fuel
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreHorizontal className="h-5 w-5" />
										<span className="sr-only">
											More options
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={exportData}>
										<Download className="mr-2 h-4 w-4" />
										<span>Export Data</span>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Bell className="mr-2 h-4 w-4" />
										<span>Set Reminders</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{vehicles.length === 0 ? (
						<Card className="border-border shadow-md overflow-hidden">
							<CardHeader className="bg-muted/50">
								<CardTitle className="text-xl text-primary">
									Welcome to Car Maintenance Tracker
								</CardTitle>
								<CardDescription className="text-muted-foreground">
									Get started by adding your first vehicle
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<div className="rounded-full bg-primary/20 p-6 mb-6 shadow-inner">
									<Car className="h-12 w-12 text-primary" />
								</div>
								<p className="text-center text-muted-foreground mb-6 max-w-md">
									Add your vehicle details to start tracking
									maintenance and fuel records. You'll be able
									to see statistics and history over time.
								</p>
								<Button
									onClick={() => setShowVehicleForm(true)}
									className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
									size="lg"
								>
									<Plus className="mr-2 h-5 w-5" />
									Add Your First Vehicle
								</Button>
							</CardContent>
						</Card>
					) : (
						<>
							<VehicleSelector
								vehicles={vehicles}
								selectedVehicle={selectedVehicle}
								onSelectVehicle={setSelectedVehicle}
							/>

							<Tabs
								defaultValue="dashboard"
								className="space-y-6"
							>
								<TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
									<TabsTrigger
										value="dashboard"
										className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
									>
										Dashboard
									</TabsTrigger>
									<TabsTrigger
										value="history"
										className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
									>
										History
									</TabsTrigger>
								</TabsList>
								<TabsContent
									value="dashboard"
									className="space-y-6 mt-6"
								>
									<StatsCards
										vehicles={vehicles}
										maintenanceRecords={maintenanceRecords}
										fuelRecords={fuelRecords}
										selectedVehicle={selectedVehicle}
										onSelectVehicle={setSelectedVehicle}
									/>
								</TabsContent>
								<TabsContent
									value="history"
									className="space-y-6 mt-6"
								>
									<FilterControls
										vehicles={vehicles}
										filterOptions={filterOptions}
										onFilterChange={handleFilterChange}
									/>
									<Timeline
										maintenanceRecords={maintenanceRecords}
										fuelRecords={fuelRecords}
										vehicles={vehicles}
										filterOptions={filterOptions}
									/>
								</TabsContent>
							</Tabs>
						</>
					)}

					{showVehicleForm && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
							<VehicleForm
								onSubmit={handleAddVehicle}
								onCancel={() => setShowVehicleForm(false)}
							/>
						</div>
					)}

					{showMaintenanceForm && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
							<MaintenanceForm
								vehicles={vehicles}
								selectedVehicle={selectedVehicle}
								onSubmit={handleAddMaintenance}
								onCancel={() => setShowMaintenanceForm(false)}
							/>
						</div>
					)}

					{showFuelForm && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
							<FuelForm
								vehicles={vehicles}
								selectedVehicle={selectedVehicle}
								onSubmit={handleAddFuel}
								onCancel={() => setShowFuelForm(false)}
							/>
						</div>
					)}

					<Toaster />
				</div>
			</div>
		</div>
	);
}
