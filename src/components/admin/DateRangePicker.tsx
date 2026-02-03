import { useState } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
}

const presets = [
  { label: "7 dias", days: 7 },
  { label: "14 dias", days: 14 },
  { label: "30 dias", days: 30 },
  { label: "60 dias", days: 60 },
];

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    onDateChange(start, end);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    onDateChange(range?.from, range?.to);
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Presets rápidos */}
      <div className="hidden sm:flex gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.days)}
            className={cn(
              "text-xs",
              startDate && 
              endDate && 
              Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) === preset.days &&
              "bg-primary/10 border-primary"
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Date Picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "w-[200px] sm:w-[240px] justify-start text-left font-normal",
              !startDate && !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate && endDate ? (
              <span className="truncate">
                {format(startDate, "dd/MM", { locale: ptBR })} - {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
              </span>
            ) : (
              <span>Selecionar período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={handleRangeSelect}
            locale={ptBR}
            numberOfMonths={1}
            disabled={(date) => date > new Date()}
            initialFocus
            className="pointer-events-auto"
          />
          {/* Presets para mobile dentro do popover */}
          <div className="flex sm:hidden gap-1 p-3 border-t flex-wrap justify-center">
            {presets.map((preset) => (
              <Button
                key={preset.days}
                variant="ghost"
                size="sm"
                onClick={() => {
                  handlePresetClick(preset.days);
                  setIsOpen(false);
                }}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
