
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataImportForm from "@/components/DataImportForm";
import DataImportUpload from "@/components/DataImportUpload";
import DataImportNextSteps from "@/components/DataImportNextSteps";
import { InfoIcon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const DataImport = () => {
  const { isDataLoaded, clearData } = useData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Data Import</h1>
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-5 w-5 text-gray-400 cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">New Features Available!</h4>
                <p className="text-sm text-gray-500">
                  You can now create custom variable dependencies in the Advanced Options section. 
                  This allows you to explicitly model relationships between variables with controlled noise levels.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
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
