
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TableStyle } from "@/types";
import { Check, Table as TableIcon } from "lucide-react";

export function TableStyleSelector() {
  const { tableStyle, setTableStyle } = useApp();
  
  const styles: { value: TableStyle; label: string; description: string }[] = [
    { value: "default", label: "Default", description: "Standard table view" },
    { value: "striped", label: "Striped", description: "Alternating row colors" },
    { value: "bordered", label: "Bordered", description: "Clear borders between cells" },
    { value: "compact", label: "Compact", description: "Reduced padding for dense data" },
    { value: "modern", label: "Modern", description: "Excel-like appearance" },
  ];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <TableIcon className="h-4 w-4 mr-2" />
          Table Style
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h3 className="font-medium mb-2">Choose Table Style</h3>
          <div className="space-y-1">
            {styles.map(style => (
              <Button
                key={style.value}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setTableStyle(style.value)}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col items-start">
                    <span>{style.label}</span>
                    <span className="text-xs text-muted-foreground">{style.description}</span>
                  </div>
                  {tableStyle === style.value && <Check className="h-4 w-4" />}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
