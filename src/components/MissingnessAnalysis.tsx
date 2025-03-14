
import React from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { useMissingnessData } from "@/hooks/useMissingnessData";

const MissingnessAnalysis = () => {
  const { data } = useData();
  const missingData = useMissingnessData(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Completeness Analysis</CardTitle>
        <CardDescription>
          Percentage of missing values for each measurement type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart
          data={missingData}
          index="field"
          categories={["missingPercentage"]}
          valueFormatter={(value) => `${value}%`}
          height={250}
        />

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            This chart shows the percentage of missing values for each type of measurement.
            Missing data can affect the quality of analysis and should be considered when interpreting results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissingnessAnalysis;
