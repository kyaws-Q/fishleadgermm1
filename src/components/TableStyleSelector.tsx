
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { TableStyle } from "@/types";

export function TableStyleSelector() {
  const { tableStyle, setTableStyle } = useApp();
  
  const styles: { label: string; value: TableStyle }[] = [
    { label: "Default", value: "default" },
    { label: "Bordered", value: "bordered" },
    { label: "Striped", value: "striped" },
    { label: "Compact", value: "compact" },
    { label: "Modern", value: "modern" },
    { label: "Excel", value: "excel" }
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {styles.map((style) => (
        <Button
          key={style.value}
          size="sm"
          variant={tableStyle === style.value ? "default" : "outline"}
          onClick={() => setTableStyle(style.value)}
        >
          {style.label}
        </Button>
      ))}
    </div>
  );
}
