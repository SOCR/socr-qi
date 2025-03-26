
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SimulationConfig } from "@/lib/dataSimulation";

const DataImportForm = () => {
  const { generateSimulatedData, simulationOptions, setSimulationOptions } = useData();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const [localOptions, setLocalOptions] = useState<SimulationConfig>(simulationOptions);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Update local options when the context options change
  useEffect(() => {
    setLocalOptions(simulationOptions);
  }, [simulationOptions]);

  const handleSimulateData = () => {
    try {
      console.log("Generating data with options:", localOptions);
      generateSimulatedData(localOptions);
      toast({
        title: "Data generated successfully",
        description: `Generated data for ${localOptions.numParticipants} participants`,
      });
    } catch (error) {
      console.error("Error in handleSimulateData:", error);
      toast({
        variant: "destructive",
        title: "Error generating data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const updateLocalOption = <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => {
    setLocalOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulate Health QI Data</CardTitle>
        <CardDescription>
          Generate simulated healthcare quality improvement data with various participant phenotypes,
          clinical units, and longitudinal measurements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="num-participants">Number of Participants: {localOptions.numParticipants}</Label>
          </div>
          <Slider
            id="num-participants"
            min={10}
            max={500}
            step={10}
            value={[localOptions.numParticipants]}
            onValueChange={(values) => updateLocalOption('numParticipants', values[0])}
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
                  {format(localOptions.startDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localOptions.startDate}
                  onSelect={(date) => date && updateLocalOption('startDate', date)}
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
                  {format(localOptions.endDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localOptions.endDate}
                  onSelect={(date) => date && updateLocalOption('endDate', date)}
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
              checked={localOptions.includeComorbidities}
              onCheckedChange={(checked) => 
                updateLocalOption('includeComorbidities', checked === true)
              }
            />
            <Label htmlFor="include-comorbidities">Include patient comorbidities</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-missing-data" 
              checked={localOptions.includeMissingData}
              onCheckedChange={(checked) => 
                updateLocalOption('includeMissingData', checked === true)
              }
            />
            <Label htmlFor="include-missing-data">Include missing data (for realism)</Label>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
          </Button>
        </div>
        
        {showAdvancedOptions && (
          <div className="space-y-6 border rounded-md p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="missing-data-probability">Missing Data Probability</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="missing-data-probability"
                    min={0.01}
                    max={0.3}
                    step={0.01}
                    value={[localOptions.missingDataProbability]}
                    onValueChange={(values) => updateLocalOption('missingDataProbability', values[0])}
                    disabled={!localOptions.includeMissingData}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{(localOptions.missingDataProbability * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="measurement-frequency">Measurement Frequency</Label>
                <Select
                  value={localOptions.measurementFrequency}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    updateLocalOption('measurementFrequency', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (3-7 measurements)</SelectItem>
                    <SelectItem value="medium">Medium (7-14 measurements)</SelectItem>
                    <SelectItem value="high">High (14-30 measurements)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time-patterns">Time Patterns</Label>
                <Select
                  value={localOptions.timePatterns}
                  onValueChange={(value: 'random' | 'realistic') => 
                    updateLocalOption('timePatterns', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random (varied patterns)</SelectItem>
                    <SelectItem value="realistic">Realistic (outcome-based)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data-variability">Data Variability</Label>
                <Select
                  value={localOptions.dataVariability}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    updateLocalOption('dataVariability', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (subtle changes)</SelectItem>
                    <SelectItem value="medium">Medium (moderate changes)</SelectItem>
                    <SelectItem value="high">High (dramatic changes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outcome-distribution">Outcome Distribution</Label>
              <Select
                value={localOptions.outcomeDistribution}
                onValueChange={(value: 'balanced' | 'positive' | 'negative') => 
                  updateLocalOption('outcomeDistribution', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome distribution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced (mixed outcomes)</SelectItem>
                  <SelectItem value="positive">Positive (better outcomes)</SelectItem>
                  <SelectItem value="negative">Negative (worse outcomes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <Button onClick={handleSimulateData} className="w-full">
          Generate Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataImportForm;
