
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
import { useToast } from "@/components/ui/use-toast";
import { SimulationConfig } from "@/lib/dataSimulation";
import { DatabaseIcon } from "lucide-react";

// Import refactored components
import BasicOptions from "@/components/data-import/BasicOptions";
import DeepPhenotypeOptions from "@/components/data-import/DeepPhenotypeOptions";
import AdvancedOptions from "@/components/data-import/AdvancedOptions";
import CustomDependencies from "@/components/data-import/CustomDependencies";

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
        {/* Basic Options Section */}
        <BasicOptions options={localOptions} updateOption={updateLocalOption} />
        
        {/* Deep Phenotyping Options Section */}
        <DeepPhenotypeOptions options={localOptions} updateOption={updateLocalOption} />
        
        {/* Advanced Options Toggle */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
          </Button>
        </div>
        
        {/* Advanced Options Section */}
        {showAdvancedOptions && (
          <>
            <AdvancedOptions options={localOptions} updateOption={updateLocalOption} />
            <CustomDependencies options={localOptions} updateOption={updateLocalOption} />
          </>
        )}
        
        {/* Generate Button */}
        <Button onClick={handleSimulateData} className="w-full flex items-center justify-center gap-2">
          <DatabaseIcon size={16} />
          Generate Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataImportForm;
