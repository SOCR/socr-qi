
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import DataImportForm from "@/components/DataImportForm";
import DataImportUpload from "@/components/DataImportUpload";
import DataImportNextSteps from "@/components/DataImportNextSteps";

const DataImport = () => {
  const { isDataLoaded, clearData, data } = useData();
  const { toast } = useToast();
  const [tabValue, setTabValue] = useState("simulate");
  
  const handleClearData = () => {
    if (clearData) {
      clearData();
      toast({
        title: "Data Cleared",
        description: "All imported data has been successfully cleared."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Data Import</h1>
          {isDataLoaded && (
            <Badge variant="outline" className="py-1">
              {data.length} participants loaded
            </Badge>
          )}
        </div>
        {isDataLoaded && (
          <Button variant="outline" onClick={handleClearData}>
            Clear Data
          </Button>
        )}
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulate">Simulate Data</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
        </TabsList>

        <TabsContent value="simulate">
          <DataImportForm />
        </TabsContent>

        <TabsContent value="upload">
          <DataImportUpload />
        </TabsContent>
      </Tabs>

      {isDataLoaded && <DataImportNextSteps />}
    </div>
  );
};

export default DataImport;
