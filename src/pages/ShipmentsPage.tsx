
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Ship, Box, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ShipmentForm } from "@/components/ShipmentForm";

export default function ShipmentsPage() {
  const [isShipmentFormOpen, setIsShipmentFormOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterBuyer, setFilterBuyer] = useState("");
  const [filterVessel, setFilterVessel] = useState("");
  
  // Mock data for now 
  const mockShipments = [
    {
      id: "ship-1",
      buyerName: "XYZ Fish Traders",
      date: "2025-05-01",
      vesselName: "Pacific Star",
      containerNumber: "CONT123456",
      totalValue: 12580.75,
      entriesCount: 5
    },
    {
      id: "ship-2",
      buyerName: "ABC Seafood Co",
      date: "2025-04-28",
      vesselName: "Ocean Voyager",
      containerNumber: "CONT789012",
      totalValue: 8930.50,
      entriesCount: 3
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Shipments</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage fish shipments
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsShipmentFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Shipment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFilter">Shipment Date</Label>
              <div className="mt-1">
                <DatePicker date={filterDate} onSelect={setFilterDate} />
              </div>
            </div>
            <div>
              <Label htmlFor="buyerFilter">Buyer</Label>
              <Input 
                id="buyerFilter"
                value={filterBuyer}
                onChange={(e) => setFilterBuyer(e.target.value)}
                placeholder="Filter by buyer name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vesselFilter">Vessel/Container</Label>
              <Input 
                id="vesselFilter"
                value={filterVessel}
                onChange={(e) => setFilterVessel(e.target.value)}
                placeholder="Filter by vessel or container"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Shipments List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Vessel/Container</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell>{new Date(shipment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{shipment.buyerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {shipment.vesselName && (
                          <span className="flex items-center mr-2">
                            <Ship className="h-4 w-4 mr-1" />
                            {shipment.vesselName}
                          </span>
                        )}
                        {shipment.containerNumber && (
                          <span className="flex items-center">
                            <Box className="h-4 w-4 mr-1" />
                            {shipment.containerNumber}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{shipment.entriesCount} items</TableCell>
                    <TableCell className="font-medium">${shipment.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Export</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {mockShipments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No shipments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Shipment Form Dialog */}
      <ShipmentForm 
        open={isShipmentFormOpen} 
        onClose={() => setIsShipmentFormOpen(false)} 
      />
    </DashboardLayout>
  );
}
