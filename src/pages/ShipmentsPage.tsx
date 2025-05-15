import { useState, useEffect } from "react";
// Removed DashboardLayout import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Ship, Box, Filter, Calendar, Download, Search, ArrowUpDown } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { exportShipmentToExcel } from "@/utils/excelExport";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";
import { Shipment } from "@/types/shipment";
import { supabase } from "@/integrations/supabase/client";

export default function ShipmentsPage() {
  const { companyName } = useApp();
  const [isShipmentFormOpen, setIsShipmentFormOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterBuyer, setFilterBuyer] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Shipment>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Shipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredShipments = shipments
    .filter(shipment => {
      if (filterDate && !shipment.date.includes(format(filterDate, "yyyy-MM-dd"))) return false;
      if (filterBuyer && !shipment.buyerName.toLowerCase().includes(filterBuyer.toLowerCase())) return false;
      if (filterStatus !== "all" && shipment.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          shipment.buyerName.toLowerCase().includes(query) ||
          shipment.containerNumber?.toLowerCase().includes(query) ||
          shipment.vesselName?.toLowerCase().includes(query) ||
          shipment.tracking_number?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (!aValue || !bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleExportToExcel = async (shipmentId: string) => {
    try {
      // In a real app, you would fetch the shipment details by ID
      // For now, we'll use mock data as an example
      toast.success("Exporting shipment to Excel...");

      // This is mock data - in a real app, fetch the actual ShipmentWithDetails
      const mockShipmentDetails = {
        shipment: {
          id: shipmentId,
          userId: "user-1",
          buyerId: "buyer-1",
          date: "2025-05-01",
          status: "Processing",
          buyerName: "XYZ Fish Traders",
          tracking_number: "TRACK-123456",
          shipping_line: "Ocean Express",
          route: "Mumbai to Singapore",
          containerNumber: "CONT123456",
          createdAt: "2025-05-01",
          updatedAt: "2025-05-01"
        },
        entries: [
          {
            id: "entry-1",
            shipmentId: shipmentId,
            fishName: "ROHU-G",
            size: "2 UP",
            netKgPerMc: 20,
            qtyMc: 5,
            qtyKgs: 100,
            pricePerKg: 1.75,
            totalUsd: 175
          },
          {
            id: "entry-2",
            shipmentId: shipmentId,
            fishName: "ROHU-G",
            size: "1.5 UP",
            netKgPerMc: 15,
            qtyMc: 10,
            qtyKgs: 150,
            pricePerKg: 1.50,
            totalUsd: 225
          },
          {
            id: "entry-3",
            shipmentId: shipmentId,
            fishName: "KATLA-G",
            size: "3 UP",
            netKgPerMc: 25,
            qtyMc: 8,
            qtyKgs: 200,
            pricePerKg: 2.10,
            totalUsd: 420
          }
        ],
        groupedEntries: [
          {
            fishName: "ROHU-G",
            entries: [
              {
                id: "entry-1",
                shipmentId: shipmentId,
                fishName: "ROHU-G",
                size: "2 UP",
                netKgPerMc: 20,
                qtyMc: 5,
                qtyKgs: 100,
                pricePerKg: 1.75,
                totalUsd: 175
              },
              {
                id: "entry-2",
                shipmentId: shipmentId,
                fishName: "ROHU-G",
                size: "1.5 UP",
                netKgPerMc: 15,
                qtyMc: 10,
                qtyKgs: 150,
                pricePerKg: 1.50,
                totalUsd: 225
              }
            ],
            subtotal: 400
          },
          {
            fishName: "KATLA-G",
            entries: [
              {
                id: "entry-3",
                shipmentId: shipmentId,
                fishName: "KATLA-G",
                size: "3 UP",
                netKgPerMc: 25,
                qtyMc: 8,
                qtyKgs: 200,
                pricePerKg: 2.10,
                totalUsd: 420
              }
            ],
            subtotal: 420
          }
        ],
        grandTotal: 820
      };

      await exportShipmentToExcel(mockShipmentDetails);

    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export shipment");
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Shipments</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your seafood shipments
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsShipmentFormOpen(true)} variant="default">
            <Plus className="mr-2 h-4 w-4" /> New Shipment
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" /> Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search shipments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dateFilter">Shipment Date</Label>
              <DatePicker date={filterDate} onSelect={setFilterDate} />
            </div>
            <div>
              <Label htmlFor="buyerFilter">Buyer</Label>
              <Input
                id="buyerFilter"
                placeholder="Filter by buyer..."
                value={filterBuyer}
                onChange={(e) => setFilterBuyer(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort("date")}>
                  <div className="flex items-center">
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("buyerName")}>
                  <div className="flex items-center">
                    Buyer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Container</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading shipments...
                  </TableCell>
                </TableRow>
              ) : filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No shipments found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">
                      {format(new Date(shipment.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{shipment.buyerName}</TableCell>
                    <TableCell>{shipment.containerNumber || "—"}</TableCell>
                    <TableCell>{shipment.vesselName || "—"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shipment.status || "")}>
                        {shipment.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportToExcel(shipment.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isShipmentFormOpen && (
        <ShipmentForm
          open={isShipmentFormOpen}
          onClose={() => setIsShipmentFormOpen(false)}
          onSuccess={() => {
            setIsShipmentFormOpen(false);
            fetchShipments();
          }}
        />
      )}
    </>
  );
}
