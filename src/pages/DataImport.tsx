
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataImportForm from "@/components/DataImportForm";
import DataImportUpload from "@/components/DataImportUpload";
import DataImportNextSteps from "@/components/DataImportNextSteps";

const DataImport = () => {
  const { isDataLoaded, clearData } = useData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Import</h1>
        {isDataLoaded && (
          <Button variant="outline" onClick={clearData}>
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
