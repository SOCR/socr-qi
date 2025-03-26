
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const DataImportUpload = () => {
  const { importData } = useData();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

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
  );
};

export default DataImportUpload;
