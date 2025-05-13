
import { SimulationConfig } from "@/lib/dataSimulation";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AdvancedOptionsProps {
  options: SimulationConfig;
  updateOption: <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => void;
}

const AdvancedOptions = ({ options, updateOption }: AdvancedOptionsProps) => {
  return (
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
              value={[options.missingDataProbability]}
              onValueChange={(values) => updateOption('missingDataProbability', values[0])}
              disabled={!options.includeMissingData}
              className="flex-1"
            />
            <span className="w-12 text-right">{(options.missingDataProbability * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="measurement-frequency">Measurement Frequency</Label>
          <Select
            value={options.measurementFrequency}
            onValueChange={(value: 'low' | 'medium' | 'high') => 
              updateOption('measurementFrequency', value)
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
            value={options.timePatterns}
            onValueChange={(value: 'random' | 'realistic') => 
              updateOption('timePatterns', value)
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
            value={options.dataVariability}
            onValueChange={(value: 'low' | 'medium' | 'high') => 
              updateOption('dataVariability', value)
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
          value={options.outcomeDistribution}
          onValueChange={(value: 'balanced' | 'positive' | 'negative') => 
            updateOption('outcomeDistribution', value)
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
  );
};

export default AdvancedOptions;
