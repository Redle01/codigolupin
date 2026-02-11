import { useState } from "react";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, isSameDay } from "date-fns";
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
  { label: "Hoje", getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: "Ontem", getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: "Últimos 7 dias", getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Últimos 15 dias", getValue: () => ({ from: subDays(new Date(), 14), to: new Date() }) },
  { label: "Últimos 30 dias", getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "Este mês", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Mês passado", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
];

function isPresetActive(startDate: Date | undefined, endDate: Date | undefined, preset: typeof presets[number]) {
  if (!startDate || !endDate) return false;
  const { from, to } = preset.getValue();
  return isSameDay(startDate, from) && isSameDay(endDate, to);
}

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: typeof presets[number]) => {
    const { from, to } = preset.getValue();
    onDateChange(from, to);
    setIsOpen(false);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    onDateChange(range?.from, range?.to);
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const PresetButtons = ({ className }: { className?: string }) => (
    <div className={className}>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="ghost"
          size="sm"
          onClick={() => handlePresetClick(preset)}
          className={cn(
            "justify-start text-xs w-full",
            isPresetActive(startDate, endDate, preset) &&
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          )}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-[220px] sm:w-[260px] justify-start text-left font-normal",
            !startDate && !endDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate ? (
            <span className="truncate text-sm">
              {format(startDate, "dd/MM", { locale: ptBR })} – {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          ) : (
            <span>Selecionar período</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {/* Desktop: sidebar + calendar */}
        <div className="hidden sm:flex">
          <PresetButtons className="flex flex-col gap-0.5 border-r p-2 min-w-[140px]" />
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={handleRangeSelect}
            locale={ptBR}
            numberOfMonths={1}
            disabled={(date) => date > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </div>
        {/* Mobile: calendar + presets grid */}
        <div className="flex flex-col sm:hidden">
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={handleRangeSelect}
            locale={ptBR}
            numberOfMonths={1}
            disabled={(date) => date > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          <div className="grid grid-cols-2 gap-1 p-3 border-t">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "text-xs",
                  isPresetActive(startDate, endDate, preset) &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
