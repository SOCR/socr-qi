
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";
import { exportToCSV } from "@/utils/exportUtils";

const DataImportNextSteps = () => {
  const { data } = useData();
  const { toast } = useToast();

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
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/data-summary">Go to Data Summary</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/data-visualization">Go to Data Visualization</Link>
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can also export the generated dataset for future use:
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Basic Data (CSV)
              </Button>
              <Button variant="outline" onClick={handleExportFullData} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Full Dataset (JSON)
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataImportNextSteps;
