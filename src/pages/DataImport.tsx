
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";

const DataImport = () => {
  const { generateSimulatedData, clearData, importData, isDataLoaded, simulationOptions, setSimulationOptions } = useData();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSimulateData = () => {
    generateSimulatedData(simulationOptions);
    toast({
      title: "Data generated successfully",
      description: `Generated data for ${simulationOptions.numParticipants} participants`,
    });
  };

  const handleClearData = () => {
    clearData();
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

  const updateSimulationOption = (key: keyof typeof simulationOptions, value: any) => {
    setSimulationOptions(prev => ({
      ...prev,
      [key]: value
    }));
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
                  <Label htmlFor="num-participants">Number of Participants: {simulationOptions.numParticipants}</Label>
                </div>
                <Slider
                  id="num-participants"
                  min={10}
                  max={500}
                  step={10}
                  value={[simulationOptions.numParticipants]}
                  onValueChange={(values) => updateSimulationOption('numParticipants', values[0])}
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
                        {format(simulationOptions.startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={simulationOptions.startDate}
                        onSelect={(date) => date && updateSimulationOption('startDate', date)}
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
                        {format(new Date(simulationOptions.endDate), "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(simulationOptions.endDate)}
                        onSelect={(date) => date && updateSimulationOption('endDate', date)}
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
                    checked={simulationOptions.includeComorbidities}
                    onCheckedChange={(checked) => 
                      updateSimulationOption('includeComorbidities', checked === true)
                    }
                  />
                  <Label htmlFor="include-comorbidities">Include patient comorbidities</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-missing-data" 
                    checked={simulationOptions.includeMissingData}
                    onCheckedChange={(checked) => 
                      updateSimulationOption('includeMissingData', checked === true)
                    }
                  />
                  <Label htmlFor="include-missing-data">Include missing data (for realism)</Label>
                </div>
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
                <Link to="/data-summary">Go to Data Summary</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/data-visualization">Go to Data Visualization</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataImport;
