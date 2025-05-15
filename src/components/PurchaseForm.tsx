import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useApp } from "@/contexts/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FishPurchase, COMMON_FISH_NAMES, COMMON_FISH_SIZES } from "@/types";
import { Plus, Trash, Info, Save, ArrowDown, Copy, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Local storage keys
const SAVED_COMPANY_NAMES_KEY = 'savedCompanyNames';
const SAVED_BUYER_NAMES_KEY = 'savedBuyerNames';

interface PurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  // For passing down companyName from a potential parent context/page
  initialCompanyName?: string; 
}

// Updated to closely match the FishPurchase interface
interface FormFishEntry {
  fishName: string;
  sizeKg: number;
  quantity: number;
  pricePerUnit: number;
  // Track if this field is inherited from the row above
  inherited?: {
    fishName?: boolean;
    sizeKg?: boolean;
    quantity?: boolean;
    pricePerUnit?: boolean;
  };
}

export function PurchaseForm({ isOpen, onClose, initialCompanyName }: PurchaseFormProps) {
  const { addMultiplePurchases } = useApp();
  const [companyName, setCompanyName] = useState(initialCompanyName || "");
  const [buyerName, setBuyerName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  // Start with 3 empty rows
  const [fishEntries, setFishEntries] = useState<FormFishEntry[]>([
    {
      fishName: "",
      sizeKg: 0,
      quantity: 0,
      pricePerUnit: 0,
      inherited: {}
    },
    {
      fishName: "",
      sizeKg: 0,
      quantity: 0,
      pricePerUnit: 0,
      inherited: {}
    },
    {
      fishName: "",
      sizeKg: 0,
      quantity: 0,
      pricePerUnit: 0,
      inherited: {}
    }
  ]);

  // State for saved company/buyer names
  const [savedCompanyNames, setSavedCompanyNames] = useState<string[]>([]);
  const [savedBuyerNames, setSavedBuyerNames] = useState<string[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [buyerSearchTerm, setBuyerSearchTerm] = useState("");
  const [filteredCompanyNames, setFilteredCompanyNames] = useState<string[]>([]);
  const [filteredBuyerNames, setFilteredBuyerNames] = useState<string[]>([]);
  const [activeCell, setActiveCell] = useState<{row: number, col: string} | null>(null);

  // State for Fish Name Combobox
  const [fishNamePopoverOpen, setFishNamePopoverOpen] = useState<boolean[]>(fishEntries.map(() => false));
  const [fishNameSearchValue, setFishNameSearchValue] = useState("");

  const lastEntryRef = useRef<HTMLTableRowElement>(null);
  const cellRefs = useRef<{[key: string]: HTMLElement}>({});
  const companyInputRef = useRef<HTMLInputElement>(null);
  const buyerInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Load saved names on component mount
  useEffect(() => {
    const loadSavedNames = () => {
      try {
        const companiesJson = localStorage.getItem(SAVED_COMPANY_NAMES_KEY);
        const buyersJson = localStorage.getItem(SAVED_BUYER_NAMES_KEY);

        if (companiesJson) {
          const companies = JSON.parse(companiesJson);
          if (Array.isArray(companies)) {
            setSavedCompanyNames(companies);
            setShowCompanyDropdown(companies.length > 0);
          }
        }

        if (buyersJson) {
          const buyers = JSON.parse(buyersJson);
          if (Array.isArray(buyers)) {
            setSavedBuyerNames(buyers);
            setShowBuyerDropdown(buyers.length > 0);
          }
        }
      } catch (error) {
        console.error("Error loading saved names:", error);
      }
    };

    loadSavedNames();
  }, []);

  // Scroll to the new entry when added
  useEffect(() => {
    if (lastEntryRef.current) {
      lastEntryRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [fishEntries.length]);

  const saveNameToLocalStorage = (name: string, key: string, setter: React.Dispatch<React.SetStateAction<string[]>>, setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!name.trim()) return;

    try {
      const existingJson = localStorage.getItem(key);
      let existing: string[] = [];

      if (existingJson) {
        existing = JSON.parse(existingJson);
      }

      if (!Array.isArray(existing)) existing = [];

      // Add name if it doesn't already exist
      if (!existing.includes(name)) {
        const updated = [...existing, name];
        localStorage.setItem(key, JSON.stringify(updated));
        setter(updated);
        setShowDropdown(true);
        toast.success(`Saved "${name}" for future use`);
      }
    } catch (error) {
      console.error(`Error saving to ${key}:`, error);
    }
  };

  const saveCompanyName = () => {
    saveNameToLocalStorage(companyName, SAVED_COMPANY_NAMES_KEY, setSavedCompanyNames, setShowCompanyDropdown);
  };

  const saveBuyerName = () => {
    saveNameToLocalStorage(buyerName, SAVED_BUYER_NAMES_KEY, setSavedBuyerNames, setShowBuyerDropdown);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
  };

  const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyerName(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPurchaseDate(e.target.value);
  };

  // Handle filtering for autocomplete
  useEffect(() => {
    if (companySearchTerm) {
      const filtered = savedCompanyNames.filter(name =>
        name.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
      setFilteredCompanyNames(filtered);
    } else {
      setFilteredCompanyNames(savedCompanyNames);
    }
  }, [companySearchTerm, savedCompanyNames]);

  useEffect(() => {
    if (buyerSearchTerm) {
      const filtered = savedBuyerNames.filter(name =>
        name.toLowerCase().includes(buyerSearchTerm.toLowerCase())
      );
      setFilteredBuyerNames(filtered);
    } else {
      setFilteredBuyerNames(savedBuyerNames);
    }
  }, [buyerSearchTerm, savedBuyerNames]);

  // Register cell ref for keyboard navigation
  const registerCellRef = (row: number, col: string, el: HTMLElement | null) => {
    if (el) {
      cellRefs.current[`${row}-${col}`] = el;
    } else {
      // Clean up ref if element is removed
      delete cellRefs.current[`${row}-${col}`];
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, row: number, col: string) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();

      // Define column order for navigation
      const columns = ['fishName', 'sizeKg', 'quantity', 'pricePerUnit'];
      let nextCol = columns[columns.indexOf(col) + 1];
      let nextRow = row;

      // If at the end of a row, move to the next row
      if (!nextCol) {
        nextCol = columns[0];
        nextRow = row + 1;
      }

      // If at the end of the table, add a new row
      if (nextRow >= fishEntries.length) {
        addNewEntry();
        // Wait for state update before focusing
        setTimeout(() => {
          const nextCell = cellRefs.current[`${nextRow}-${nextCol}`];
          if (nextCell) {
            if ('focus' in nextCell) {
              (nextCell as HTMLElement & { focus: () => void }).focus();
            }
          }
        }, 50);
      } else {
        // Focus the next cell
        const nextCell = cellRefs.current[`${nextRow}-${nextCol}`];
        if (nextCell) {
          if ('focus' in nextCell) {
            (nextCell as HTMLElement & { focus: () => void }).focus();
          }
        }
      }
    }
  };

  const handleEntryChange = (
    index: number,
    field: Exclude<keyof FormFishEntry, 'inherited'>,
    value: string | number
  ) => {
    const updatedEntries = [...fishEntries];
    const targetEntry = updatedEntries[index];

    // Clear inheritance for this field since user is explicitly setting it
    if (targetEntry.inherited) {
      targetEntry.inherited = {
        ...targetEntry.inherited,
        [field]: false
      };
    }

    // Type-safe assignment based on the field
    if (field === 'fishName') {
      // Ensure the value assigned to fishName is always a string
      targetEntry.fishName = String(value);
    } else {
      // Handle numeric fields: sizeKg, quantity, pricePerUnit
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      if (field === 'sizeKg') {
        targetEntry.sizeKg = numValue;
      } else if (field === 'quantity') {
        targetEntry.quantity = numValue;
      } else if (field === 'pricePerUnit') {
        targetEntry.pricePerUnit = numValue;
      }
    }

    // Update entries below this one if they were inheriting from this entry
    if (index < updatedEntries.length - 1) {
      for (let i = index + 1; i < updatedEntries.length; i++) {
        const currentEntryForPropagation = updatedEntries[i];
        const previousEntryForPropagation = updatedEntries[i-1]; // The one that might have just been updated or sourced from

        if (currentEntryForPropagation.inherited?.[field]) {
          // Check if the field in the previous entry has a value to propagate
          // and if the current field is empty (or 0 for numbers) to accept propagation
          const prevValue = previousEntryForPropagation[field];

          if (field === 'fishName') {
            if (typeof prevValue === 'string' && !currentEntryForPropagation.fishName) {
              currentEntryForPropagation.fishName = prevValue;
            }
          } else { // Numeric fields
            if (typeof prevValue === 'number' && currentEntryForPropagation[field] === 0) {
              currentEntryForPropagation[field] = prevValue;
            }
          }
        }
      }
    }

    setFishEntries(updatedEntries);
  };

  // Process entries before submission
  const processEntriesForSubmission = (entries: FormFishEntry[]): FormFishEntry[] => {
    return entries.map((entry, index) => {
      const processedEntry = { ...entry };

      // No automatic inheritance of fish names
      // Each row must have its own explicitly selected fish name

      return processedEntry;
    });
  };

  const addNewEntry = () => {
    const lastEntry = fishEntries[fishEntries.length - 1];
    // Default new entry based on the last one, if available and non-empty
    const newEntryDefaults = lastEntry && lastEntry.fishName
      ? { fishName: lastEntry.fishName, sizeKg: lastEntry.sizeKg, quantity: 0, pricePerUnit: lastEntry.pricePerUnit, inherited: { fishName: true, sizeKg: true, pricePerUnit: true} }
      : { fishName: "", sizeKg: 0, quantity: 0, pricePerUnit: 0, inherited: {} };

    setFishEntries([...fishEntries, newEntryDefaults]);
  };

  const removeEntry = (index: number) => {
    if (fishEntries.length > 1) {
      const updatedEntries = [...fishEntries];
      updatedEntries.splice(index, 1);
      setFishEntries(updatedEntries);
    }
  };

  const calculateTotalForEntry = (entry: FormFishEntry) => {
    return entry.sizeKg * entry.quantity * entry.pricePerUnit;
  };

  const calculateGrandTotal = () => {
    return fishEntries.reduce((total, entry) => total + calculateTotalForEntry(entry), 0);
  };

  // Handle paste from clipboard (e.g., from Excel)
  const handlePaste = (
  e: React.ClipboardEvent<HTMLInputElement>,
  index: number,
  field: Exclude<keyof FormFishEntry, 'inherited'>
) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    // Check if it's a multi-line paste (tab or newline separated)
    if (pastedText.includes('\t') || pastedText.includes('\n')) {
      const rows = pastedText.split('\n').filter(row => row.trim());

      if (rows.length > 0) {
        // Create new entries from pasted data
        const newEntries = [...fishEntries];

        rows.forEach((row, rowIndex) => {
          const currentIndex = index + rowIndex;
          const columns = row.split('\t');

          // Create a new entry if needed
          if (currentIndex >= newEntries.length) {
            newEntries.push({
              fishName: "",
              sizeKg: 0,
              quantity: 1,
              pricePerUnit: 0,
              inherited: {}
            });
          }

          // Map columns to fields based on the starting field
          const fieldOrder: (keyof FormFishEntry)[] = ['fishName', 'sizeKg', 'quantity', 'pricePerUnit'];
          const startFieldIndex = fieldOrder.indexOf(field);

          columns.forEach((value, colIndex) => {
            const fieldIndex = (startFieldIndex + colIndex) % fieldOrder.length;
            const currentField = fieldOrder[fieldIndex];

            if (currentField === 'fishName') {
              newEntries[currentIndex][currentField] = value.trim();
            } else if (value.trim()) {
              const numValue = parseFloat(value.trim().replace(/,/g, ''));
              if (!isNaN(numValue)) {
                newEntries[currentIndex][currentField] = numValue;
              }
            }

            // Mark as not inherited since we're explicitly setting it
            if (!newEntries[currentIndex].inherited) {
              newEntries[currentIndex].inherited = {};
            }
            newEntries[currentIndex].inherited![currentField] = false;
          });
        });

        setFishEntries(newEntries);
        toast.success(`Pasted ${rows.length} rows of data`);
      }
    } else {
      // Single value paste
      if (field === 'fishName') {
        handleEntryChange(index, field, pastedText.trim());
      } else {
        const numValue = parseFloat(pastedText.trim().replace(/,/g, ''));
        if (!isNaN(numValue)) {
          handleEntryChange(index, field, numValue);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    if (!buyerName.trim()) {
      toast.error("Buyer name is required");
      return;
    }

    if (!purchaseDate) {
      toast.error("Purchase date is required");
      return;
    }

    // Process entries to handle inheritance
    const processedEntries = processEntriesForSubmission(fishEntries);

    // Validate entries
    const validEntries = processedEntries.filter(entry =>
      entry.fishName && entry.sizeKg > 0 && entry.quantity > 0 && entry.pricePerUnit > 0
    );

    if (validEntries.length === 0) {
      toast.error("Please add at least one valid fish entry with all fields completed");
      return;
    }

    // Invalid entries warning
    if (validEntries.length < processedEntries.length) {
      const invalidCount = processedEntries.length - validEntries.length;
      toast.warning(`${invalidCount} invalid entries will be skipped`);
    }

    // Save the company and buyer names for future use
    saveCompanyName();
    saveBuyerName();

    // Show loading toast
    toast.loading("Adding purchases...");

    // Convert FormFishEntry to match what addMultiplePurchases expects
    addMultiplePurchases(companyName, buyerName, purchaseDate, validEntries)
      .then(() => {
        // Reset form
        setCompanyName("");
        setBuyerName("");
        setPurchaseDate(new Date().toISOString().split("T")[0]);
        setFishEntries([
          {
            fishName: "",
            sizeKg: 0,
            quantity: 0,
            pricePerUnit: 0,
            inherited: {}
          },
          {
            fishName: "",
            sizeKg: 0,
            quantity: 0,
            pricePerUnit: 0,
            inherited: {}
          },
          {
            fishName: "",
            sizeKg: 0,
            quantity: 0,
            pricePerUnit: 0,
            inherited: {}
          }
        ]);

        // Close the form
        onClose();
      })
      .catch((error) => {
        console.error("Error in form submission:", error);
      });
  };

  // Initialize fishNamePopoverOpen based on current fishEntries length
  useEffect(() => {
    setFishNamePopoverOpen(fishEntries.map(() => false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fishEntries.length]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl xl:max-w-4xl p-0 flex flex-col overflow-hidden h-screen sm:h-[90vh] sm:max-h-[900px] rounded-2xl bg-white shadow-2xl border border-gray-100 w-full sm:w-auto" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-semibold">Add New Purchase(s)</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Fill in the details below. Use Tab to navigate, ArrowDown to copy from above in the table.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Company Information Section */}
              <Card className="rounded-2xl shadow-xl border border-gray-100">
                <CardContent className="p-3 sm:p-4 pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Company & Buyer Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-start">
                    <div className="space-y-1 sm:space-y-1.5 relative">
                      <Label htmlFor="companyName" className="text-xs sm:text-sm font-sans">Company Name</Label>
                      <Input
                        id="companyName"
                        ref={companyInputRef}
                        value={companyName}
                        onChange={handleCompanyChange}
                        onFocus={() => { setCompanySearchTerm(companyName); setShowCompanyDropdown(true); }}
                        onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 150)}
                        placeholder="e.g., Ocean Exports Ltd."
                        className="h-9 sm:h-10 text-sm sm:text-base font-sans"
                      />
                      {showCompanyDropdown && filteredCompanyNames.length > 0 && (
                        <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-32 sm:max-h-40 overflow-y-auto rounded-2xl border border-gray-100">
                          <CardContent className="p-0.5 sm:p-1">
                            {filteredCompanyNames.map(name => (
                              <Button
                                key={name}
                                variant="ghost"
                                className="w-full justify-start h-7 sm:h-8 text-xs sm:text-sm font-sans"
                                onClick={() => {
                                  setCompanyName(name);
                                  setShowCompanyDropdown(false);
                                  companyInputRef.current?.focus();
                                }}
                              >
                                {name}
                              </Button>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={saveCompanyName} className="mt-1 text-xs h-7 w-full sm:w-auto font-sans">
                        <Save className="w-3 h-3 mr-1.5" /> Save Company
                      </Button>
                    </div>

                    <div className="space-y-1 sm:space-y-1.5 relative">
                      <Label htmlFor="buyerName" className="text-xs sm:text-sm font-sans">Buyer Name</Label>
                      <Input
                        id="buyerName"
                        ref={buyerInputRef}
                        value={buyerName}
                        onChange={handleBuyerChange}
                        onFocus={() => { setBuyerSearchTerm(buyerName); setShowBuyerDropdown(true); }}
                        onBlur={() => setTimeout(() => setShowBuyerDropdown(false), 150)}
                        placeholder="e.g., John Doe"
                        className="h-9 sm:h-10 text-sm sm:text-base font-sans"
                      />
                      {showBuyerDropdown && filteredBuyerNames.length > 0 && (
                        <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-32 sm:max-h-40 overflow-y-auto rounded-2xl border border-gray-100">
                          <CardContent className="p-0.5 sm:p-1">
                            {filteredBuyerNames.map(name => (
                              <Button
                                key={name}
                                variant="ghost"
                                className="w-full justify-start h-7 sm:h-8 text-xs sm:text-sm font-sans"
                                onClick={() => {
                                  setBuyerName(name);
                                  setShowBuyerDropdown(false);
                                  buyerInputRef.current?.focus();
                                }}
                              >
                                {name}
                              </Button>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={saveBuyerName} className="mt-1 text-xs h-7 w-full sm:w-auto font-sans">
                        <Save className="w-3 h-3 mr-1.5" /> Save Buyer
                      </Button>
                    </div>

                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="purchaseDate" className="text-xs sm:text-sm font-sans">Purchase Date</Label>
                      <Input
                        id="purchaseDate"
                        ref={dateInputRef}
                        type="date"
                        value={purchaseDate}
                        onChange={handleDateChange}
                        className="h-9 sm:h-10 text-sm sm:text-base font-sans"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fish Entries Section */}
              <Card className="rounded-2xl shadow-xl border border-gray-100">
                <CardContent className="p-3 sm:p-4 pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                    <h3 className="text-base sm:text-lg font-medium">Fish Entries</h3>
                    <Button type="button" variant="outline" onClick={addNewEntry} size="sm" className="h-8 text-xs sm:text-sm self-start sm:self-center font-sans">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Fish
                    </Button>
                  </div>
                  <Alert variant="default" className="mb-3 sm:mb-4 bg-blue-50 border-blue-200 text-blue-700 text-xs font-sans">
                    <Info className="h-4 w-4 !text-blue-700" />
                    <AlertDescription>
                      Use <kbd className="kbd-sm">Tab</kbd> to navigate, <kbd className="kbd-sm">ArrowDown</kbd> to copy from above.
                    </AlertDescription>
                  </Alert>
                  {/* Mobile swipe hint */}
                  <div className="sm:hidden text-center text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1 font-sans">
                    <ArrowRight className="inline-block h-4 w-4 animate-bounce-x" />
                    Swipe table to see more
                  </div>
                  {/* Table with gradient overlay for mobile */}
                  <div className="relative overflow-x-auto rounded-md border">
                    <div className="sm:hidden pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white/90 to-transparent z-10" />
                    <Table className="min-w-full whitespace-nowrap font-sans">
                      <TableHeader className="sticky top-0 z-20 bg-muted/80 backdrop-blur-sm">
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="w-10 px-1 sm:px-2 text-center text-xs">#</TableHead>
                          <TableHead className="min-w-[150px] sm:min-w-[180px] px-1.5 sm:px-3 text-xs">Fish Name</TableHead>
                          <TableHead className="min-w-[80px] sm:min-w-[100px] px-1.5 sm:px-3 text-xs">Size (kg)</TableHead>
                          <TableHead className="min-w-[80px] sm:min-w-[100px] px-1.5 sm:px-3 text-xs">Quantity</TableHead>
                          <TableHead className="min-w-[100px] sm:min-w-[120px] px-1.5 sm:px-3 text-xs">Price/Unit</TableHead>
                          <TableHead className="min-w-[80px] sm:min-w-[100px] px-1.5 sm:px-3 text-right text-xs">Total</TableHead>
                          <TableHead className="w-10 px-1 sm:px-2 text-center text-xs">
                            <span className="sm:hidden"><Trash className="h-3.5 w-3.5 mx-auto"/></span>
                            <span className="hidden sm:inline">Del</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fishEntries.map((entry, index) => (
                          <TableRow 
                            key={index} 
                            ref={index === fishEntries.length - 1 ? lastEntryRef : null}
                            className={cn("text-xs", entry.inherited?.fishName || entry.inherited?.sizeKg || entry.inherited?.pricePerUnit ? "bg-green-50/30 hover:bg-green-50/50" : "hover:bg-slate-50/50")}
                          >
                            <TableCell className="px-1 sm:px-2 text-center text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="p-0.5 sm:p-1 align-top min-w-[150px] sm:min-w-[180px]">
                              <Popover open={fishNamePopoverOpen[index]} onOpenChange={(isOpen) => {
                                const newOpenState = [...fishNamePopoverOpen];
                                newOpenState[index] = isOpen;
                                setFishNamePopoverOpen(newOpenState);
                              }}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={fishNamePopoverOpen[index]}
                                    className={cn(
                                      "h-8 sm:h-9 w-full justify-between font-normal text-xs",
                                      entry.inherited?.fishName && "border-green-400 focus:border-green-600",
                                      !entry.fishName && "text-muted-foreground"
                                    )}
                                    ref={(el) => registerCellRef(index, 'fishName', el)}
                                    onKeyDownCapture={(e) => handleKeyDown(e, index, 'fishName')}
                                  >
                                    <span className="truncate">
                                    {entry.fishName
                                      ? COMMON_FISH_NAMES.find(
                                          (fish) => fish.toLowerCase() === entry.fishName.toLowerCase()
                                        ) || "Select..."
                                      : "Select..."}
                                    </span>
                                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--trigger-width] p-0" side="bottom" align="start">
                                  <Command shouldFilter={true}>
                                    <CommandInput 
                                      placeholder="Search fish..." 
                                      value={fishNameSearchValue}
                                      onValueChange={setFishNameSearchValue}
                                      className="h-8 sm:h-9 text-xs"
                                    />
                                    <CommandList>
                                      <CommandEmpty className="text-xs p-2">No fish found.</CommandEmpty>
                                      <CommandGroup>
                                        {COMMON_FISH_NAMES.map((fish) => (
                                          <CommandItem
                                            key={fish}
                                            value={fish}
                                            onSelect={(currentValue) => {
                                              handleEntryChange(index, 'fishName', currentValue === entry.fishName ? "" : currentValue);
                                              const newOpenState = [...fishNamePopoverOpen];
                                              newOpenState[index] = false;
                                              setFishNamePopoverOpen(newOpenState);
                                              setFishNameSearchValue("");
                                              const nextCell = cellRefs.current[`${index}-sizeKg`];
                                              if (nextCell && 'focus' in nextCell) {
                                                (nextCell as HTMLElement & { focus: () => void }).focus();
                                              }
                                            }}
                                            className="text-xs"
                                          >
                                            <Check
                                              className={cn(
                                                "mr-1.5 h-3 w-3",
                                                entry.fishName && entry.fishName.toLowerCase() === fish.toLowerCase() ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {fish}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell className="p-0.5 sm:p-1 align-top">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                value={entry.sizeKg || ""}
                                onChange={(e) => handleEntryChange(index, 'sizeKg', e.target.value)}
                                onPaste={(e) => handlePaste(e, index, 'sizeKg')}
                                onKeyDownCapture={(e) => handleKeyDown(e, index, 'sizeKg')}
                                onFocus={() => setActiveCell({row: index, col: 'sizeKg'})}
                                ref={(el) => registerCellRef(index, 'sizeKg', el)}
                                placeholder="e.g., 1.5"
                                className={cn("h-8 sm:h-9 w-full text-xs", entry.inherited?.sizeKg && "border-green-400 focus:border-green-600")}
                              />
                            </TableCell>
                            <TableCell className="p-0.5 sm:p-1 align-top">
                              <Input
                                type="number"
                                min="0"
                                value={entry.quantity || ""}
                                onChange={(e) => handleEntryChange(index, 'quantity', e.target.value)}
                                onPaste={(e) => handlePaste(e, index, 'quantity')}
                                onKeyDownCapture={(e) => handleKeyDown(e, index, 'quantity')}
                                onFocus={() => setActiveCell({row: index, col: 'quantity'})}
                                ref={(el) => registerCellRef(index, 'quantity', el)}
                                placeholder="e.g., 10"
                                className="h-8 sm:h-9 w-full text-xs"
                              />
                            </TableCell>
                            <TableCell className="p-0.5 sm:p-1 align-top">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={entry.pricePerUnit || ""}
                                onChange={(e) => handleEntryChange(index, 'pricePerUnit', e.target.value)}
                                onPaste={(e) => handlePaste(e, index, 'pricePerUnit')}
                                onKeyDownCapture={(e) => handleKeyDown(e, index, 'pricePerUnit')}
                                onFocus={() => setActiveCell({row: index, col: 'pricePerUnit'})}
                                ref={(el) => registerCellRef(index, 'pricePerUnit', el)}
                                placeholder="e.g., 5.75"
                                className={cn("h-8 sm:h-9 w-full text-xs", entry.inherited?.pricePerUnit && "border-green-400 focus:border-green-600")}
                              />
                            </TableCell>
                            <TableCell className="px-1.5 sm:px-3 py-1 text-right align-middle font-medium">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalForEntry(entry))}
                            </TableCell>
                            <TableCell className="p-0.5 sm:p-1 text-center align-middle">
                              {fishEntries.length > 1 && (
                                <TooltipProvider delayDuration={100}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeEntry(index)}
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash className="h-3.5 w-3.5" />
                                        <span className="sr-only">Remove row</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="bg-destructive text-destructive-foreground text-xs">
                                      <p>Remove this entry</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {fishEntries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                                    No fish entries added yet. Click "Add Fish" to begin.
                                </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                      {fishEntries.filter(e => e.fishName).length > 0 && (
                        <TableFooter className="bg-muted/50 sticky bottom-0 text-xs">
                            <TableRow>
                                <TableCell colSpan={5} className="text-right font-semibold px-1.5 sm:px-3 py-1.5 sm:py-2">Subtotal:</TableCell>
                                <TableCell className="text-right font-semibold px-1.5 sm:px-3 py-1.5 sm:py-2">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateGrandTotal())}
                                </TableCell>
                                <TableCell className="p-0.5 sm:p-1"></TableCell>
                            </TableRow>
                        </TableFooter>
                      )}
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="p-3 sm:p-6 pt-3 sm:pt-4 border-t bg-slate-50/50 shrink-0">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <div className="order-2 sm:order-1 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Items: {fishEntries.filter(entry => entry.fishName).length}</p>
                    <p className="text-base sm:text-lg font-semibold">Grand Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateGrandTotal())}</p>
                </div>
                <div className="order-1 sm:order-2 w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-end">
                  <Button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 shadow-xl text-base font-sans w-full sm:w-auto"
                  >
                    <Save className="mr-2 h-5 w-5" /> Save Purchase(s)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="rounded-full border-gray-300 text-gray-700 bg-white hover:bg-gray-100 font-semibold px-6 py-2 shadow text-base font-sans w-full sm:w-auto"
                  >
                        Cancel
                    </Button>
                </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
