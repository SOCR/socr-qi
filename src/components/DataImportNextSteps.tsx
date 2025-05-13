
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Download, FileDown, Database, Table } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";
import { exportToCSV } from "@/utils/exportUtils";
import { 
  ImputationStrategy, 
  imputeData, 
  getStrategyDescription 
} from "@/utils/imputationUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoIcon } from "lucide-react";

const DataImportNextSteps = () => {
  const { data } = useData();
  const { toast } = useToast();
  const hasDeepPhenotype = data.some(participant => participant.deepPhenotype);
  const [imputeMissing, setImputeMissing] = useState(false);
  const [imputationStrategy, setImputationStrategy] = useState<ImputationStrategy>("mean");
  
  // Check if the dataset has any missing values
  const hasMissingValues = data.some(participant => 
    participant.measurements.some(measurement => 
      Object.values(measurement).some(value => value === null)
    )
  );

  const handleExportData = () => {
    try {
      // Determine which dataset to use (original or imputed)
      const datasetToExport = imputeMissing && hasMissingValues ? 
        imputeData(data, { strategy: imputationStrategy, applyToAll: true }) : 
        data;
      
      // Flatten the data for CSV export
      const flattenedData = datasetToExport.map(participant => {
        const { measurements, treatments, ...basicInfo } = participant;
        return {
          ...basicInfo,
          numMeasurements: measurements.length,
          numTreatments: treatments.length
        };
      });
      
      exportToCSV(flattenedData, "socr_qi_simulated_data.csv");
      
      toast({
        title: "Data exported successfully",
        description: imputeMissing && hasMissingValues ? 
          "The dataset has been exported with imputed missing values" : 
          "The dataset has been exported as a CSV file",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        variant: "destructive",
        title: "Error exporting data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleExportFullData = () => {
    try {
      // Determine which dataset to use (original or imputed)
      const datasetToExport = imputeMissing && hasMissingValues ? 
        imputeData(data, { strategy: imputationStrategy, applyToAll: true }) : 
        data;
      
      // Export the full JSON data
      const jsonStr = JSON.stringify(datasetToExport, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "socr_qi_full_dataset.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Full dataset exported successfully",
        description: imputeMissing && hasMissingValues ?
          "The complete dataset has been exported with imputed missing values as a JSON file" :
          "The complete dataset has been exported as a JSON file",
      });
    } catch (error) {
      console.error("Error exporting full data:", error);
      toast({
        variant: "destructive",
        title: "Error exporting data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleExportDeepPhenotypeData = () => {
    try {
      if (!hasDeepPhenotype) {
        toast({
          variant: "destructive",
          title: "No deep phenotype data",
          description: "This dataset does not include deep phenotyping data."
        });
        return;
      }

      // Determine which dataset to use (original or imputed)
      const datasetToExport = imputeMissing && hasMissingValues ? 
        imputeData(data, { strategy: imputationStrategy, applyToAll: true }) : 
        data;

      // Extract and flatten deep phenotype data
      const deepPhenotypeData = datasetToExport.map(participant => {
        if (!participant.deepPhenotype) return null;
        
        // Extract basic info
        const { id, age, gender, condition, outcome } = participant;
        const baseData = { id, age, gender, condition, outcome };
        
        // Flatten deep phenotype data
        const flattenObject = (obj: Record<string, any>, prefix = '') => {
          return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
            const prefixedKey = prefix ? `${prefix}_${key}` : key;
            
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              Object.assign(acc, flattenObject(obj[key], prefixedKey));
            } else {
              acc[prefixedKey] = obj[key];
            }
            
            return acc;
          }, {});
        };
        
        const flattenedDeepPhenotype = flattenObject(participant.deepPhenotype);
        
        return {
          ...baseData,
          ...flattenedDeepPhenotype
        };
      }).filter(Boolean);
      
      exportToCSV(deepPhenotypeData as Record<string, any>[], "socr_qi_deep_phenotype_data.csv");
      
      toast({
        title: "Deep phenotype data exported successfully",
        description: imputeMissing && hasMissingValues ?
          "The deep phenotyping dataset has been exported with imputed missing values as a CSV file" :
          "The deep phenotyping dataset has been exported as a CSV file",
      });
    } catch (error) {
      console.error("Error exporting deep phenotype data:", error);
      toast({
        variant: "destructive",
        title: "Error exporting data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleExportMeasurementsData = () => {
    try {
      // Determine which dataset to use (original or imputed)
      const datasetToExport = imputeMissing && hasMissingValues ? 
        imputeData(data, { strategy: imputationStrategy, applyToAll: true }) : 
        data;
      
      // Flatten measurements across all participants
      const measurementsData: Record<string, any>[] = [];
      
      datasetToExport.forEach(participant => {
        participant.measurements.forEach(measurement => {
          measurementsData.push({
            participant_id: participant.id,
            date: measurement.date,
            bloodPressureSystolic: measurement.bloodPressureSystolic,
            bloodPressureDiastolic: measurement.bloodPressureDiastolic,
            heartRate: measurement.heartRate,
            temperature: measurement.temperature,
            oxygenSaturation: measurement.oxygenSaturation,
            pain: measurement.pain
          });
        });
      });
      
      exportToCSV(measurementsData, "socr_qi_measurements_data.csv");
      
      toast({
        title: "Measurements data exported successfully",
        description: imputeMissing && hasMissingValues ?
          "The measurements dataset has been exported with imputed missing values as a CSV file" :
          "The measurements dataset has been exported as a CSV file",
      });
    } catch (error) {
      console.error("Error exporting measurements data:", error);
      toast({
        variant: "destructive",
        title: "Error exporting data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Data has been loaded successfully. You can now proceed to the Data Summary tab to view statistics
          or the Data Visualization tab to explore the data visually.
        </p>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/data-summary">Go to Data Summary</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/data-visualization">Go to Data Visualization</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/analytics">Advanced Analytics</Link>
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Export options for your generated dataset:
            </p>
            
            {hasMissingValues && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="impute-missing" 
                      checked={imputeMissing}
                      onCheckedChange={(checked) => setImputeMissing(checked === true)}
                    />
                    <Label htmlFor="impute-missing" className="font-medium text-blue-600">
                      Impute missing values when exporting
                    </Label>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-blue-400 cursor-help" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Missing Data Imputation</h4>
                          <p className="text-sm text-gray-500">
                            This option will fill in missing values in the exported data 
                            using the selected imputation strategy. This does not modify 
                            the original dataset stored in the application.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {imputeMissing && (
                  <div className="ml-6">
                    <Label htmlFor="imputation-strategy" className="text-sm block mb-1">
                      Imputation strategy
                    </Label>
                    <Select
                      value={imputationStrategy}
                      onValueChange={(value: ImputationStrategy) => setImputationStrategy(value)}
                    >
                      <SelectTrigger className="w-full md:w-72">
                        <SelectValue placeholder="Select imputation method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mean">{getStrategyDescription("mean")}</SelectItem>
                        <SelectItem value="median">{getStrategyDescription("median")}</SelectItem>
                        <SelectItem value="mode">{getStrategyDescription("mode")}</SelectItem>
                        <SelectItem value="zero">{getStrategyDescription("zero")}</SelectItem>
                        <SelectItem value="lastObservation">{getStrategyDescription("lastObservation")}</SelectItem>
                        <SelectItem value="nextObservation">{getStrategyDescription("nextObservation")}</SelectItem>
                        <SelectItem value="linearInterpolation">{getStrategyDescription("linearInterpolation")}</SelectItem>
                        <SelectItem value="randomForest">{getStrategyDescription("randomForest")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Basic Data (CSV)
              </Button>
              <Button variant="outline" onClick={handleExportFullData} className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Full Dataset (JSON)
              </Button>
              <Button variant="outline" onClick={handleExportMeasurementsData} className="flex items-center gap-2">
                <Table className="w-4 h-4" />
                Measurements (CSV)
              </Button>
              {hasDeepPhenotype && (
                <Button variant="outline" onClick={handleExportDeepPhenotypeData} className="flex items-center gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100">
                  <Download className="w-4 h-4" />
                  Deep Phenotype Data (CSV)
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataImportNextSteps;
