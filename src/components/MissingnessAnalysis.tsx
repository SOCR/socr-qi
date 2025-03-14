
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

const MissingnessAnalysis = () => {
  const { data } = useData();

  // Calculate missing data percentages by field
  const calculateMissingData = () => {
    const fields = [
      { name: "Blood Pressure", key: "bloodPressureSystolic" },
      { name: "Heart Rate", key: "heartRate" },
      { name: "Temperature", key: "temperature" },
      { name: "Oxygen Saturation", key: "oxygenSaturation" },
      { name: "Pain Level", key: "pain" }
    ];

    const missingCounts = fields.map(field => {
      const totalMeasurements = data.flatMap(p => p.measurements).length;
      const missingCount = data.flatMap(p => p.measurements)
        .filter(m => m[field.key] === null || m[field.key] === undefined).length;
      
      const percentage = totalMeasurements > 0 
        ? (missingCount / totalMeasurements) * 100 
        : 0;
          
      return {
        field: field.name,
        missingPercentage: parseFloat(percentage.toFixed(2))
      };
    });

    return missingCounts;
  };

  const missingData = calculateMissingData();

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
