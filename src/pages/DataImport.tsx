
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

const DataImport = () => {
  const { generateSimulatedData, clearData, importData, isDataLoaded } = useData();
  const [numParticipants, setNumParticipants] = useState<number>(50);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSimulateData = () => {
    generateSimulatedData(numParticipants);
    toast({
      title: "Data generated successfully",
      description: `Generated data for ${numParticipants} participants`,
    });
  };

  const handleClearData = () => {
    clearData();
    toast({
      title: "Data cleared",
      description: "All data has been cleared from the application",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Basic validation - check if it's an array
        if (!Array.isArray(jsonData)) {
          throw new Error("Uploaded file must contain an array of participants");
        }
        
        // Check if it has the expected structure (simple check)
        const hasValidStructure = jsonData.every((item) => 
          item.id && 
          typeof item.age === 'number' && 
          Array.isArray(item.measurements)
        );
        
        if (!hasValidStructure) {
          throw new Error("Data format is invalid. Please check the documentation for the required format.");
        }
        
        importData(jsonData);
        setUploadError(null);
        toast({
          title: "Data imported successfully",
          description: `Imported data for ${jsonData.length} participants`,
        });
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Unknown error");
        toast({
          variant: "destructive",
          title: "Error importing data",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Import</h1>
        {isDataLoaded && (
          <Button variant="outline" onClick={handleClearData}>
            Clear Data
          </Button>
        )}
      </div>

      <Tabs defaultValue="simulate">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulate">Simulate Data</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
        </TabsList>

        <TabsContent value="simulate">
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
                  <Label htmlFor="num-participants">Number of Participants: {numParticipants}</Label>
                </div>
                <Slider
                  id="num-participants"
                  min={10}
                  max={500}
                  step={10}
                  value={[numParticipants]}
                  onValueChange={(values) => setNumParticipants(values[0])}
                  className="py-4"
                />
              </div>
              <Button onClick={handleSimulateData} className="w-full">
                Generate Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Own Data</CardTitle>
              <CardDescription>
                Import your own QI dataset in JSON format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select a JSON file</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                />
                {uploadError && (
                  <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  The file should contain an array of participant objects with the required fields
                  (id, age, gender, unit, condition, etc.)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isDataLoaded && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Data has been loaded successfully. You can now proceed to the Data Summary tab to view statistics
              or the Data Visualization tab to explore the data visually.
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" asChild>
                <a href="/data-summary">Go to Data Summary</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/data-visualization">Go to Data Visualization</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataImport;
