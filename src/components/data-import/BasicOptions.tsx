
import { SimulationConfig } from "@/lib/dataSimulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BasicOptionsProps {
  options: SimulationConfig;
  updateOption: <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => void;
}

const BasicOptions = ({ options, updateOption }: BasicOptionsProps) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="num-participants">Number of Participants: {options.numParticipants}</Label>
        </div>
        <Slider
          id="num-participants"
          min={10}
          max={500}
          step={10}
          value={[options.numParticipants]}
          onValueChange={(values) => updateOption('numParticipants', values[0])}
          className="py-4"
        />
      </div>
        
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(options.startDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={options.startDate}
                onSelect={(date) => date && updateOption('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
          
        <div className="space-y-2">
          <Label>Data End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(options.endDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={options.endDate}
                onSelect={(date) => date && updateOption('endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
        
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-comorbidities" 
            checked={options.includeComorbidities}
            onCheckedChange={(checked) => 
              updateOption('includeComorbidities', checked === true)
            }
          />
          <Label htmlFor="include-comorbidities">Include patient comorbidities</Label>
        </div>
          
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-missing-data" 
            checked={options.includeMissingData}
            onCheckedChange={(checked) => 
              updateOption('includeMissingData', checked === true)
            }
          />
          <Label htmlFor="include-missing-data">Include missing data (for realism)</Label>
        </div>
      </div>
    </>
  );
};

export default BasicOptions;
