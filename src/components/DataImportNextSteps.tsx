
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Download, FileDown, Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";
import { exportToCSV } from "@/utils/exportUtils";

const DataImportNextSteps = () => {
  const { data } = useData();
  const { toast } = useToast();
  const hasDeepPhenotype = data.some(participant => participant.deepPhenotype);

  const handleExportData = () => {
    try {
      // Flatten the data for CSV export
      const flattenedData = data.map(participant => {
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
        description: "The dataset has been exported as a CSV file",
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
      // Export the full JSON data
      const jsonStr = JSON.stringify(data, null, 2);
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
        description: "The complete dataset has been exported as a JSON file",
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

      // Extract and flatten deep phenotype data
      const deepPhenotypeData = data.map(participant => {
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
        description: "The deep phenotyping dataset has been exported as a CSV file",
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
            <p className="text-sm text-muted-foreground">
              Export options for your generated dataset:
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Basic Data (CSV)
              </Button>
              <Button variant="outline" onClick={handleExportFullData} className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Full Dataset (JSON)
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
