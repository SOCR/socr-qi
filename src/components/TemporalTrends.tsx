
import React from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from "@/components/ui/chart";
import { useTemporalData } from "@/hooks/useTemporalData";

const TemporalTrends = () => {
  const { data } = useData();
  const temporalData = useTemporalData(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temporal Trends Analysis</CardTitle>
        <CardDescription>
          Changes in key health indicators over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vitals">
          <TabsList>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="oxygen">Oxygen & Temperature</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vitals">
            <LineChart
              data={temporalData}
              index="month"
              categories={["avgBpSystolic", "avgBpDiastolic", "avgHeartRate"]}
              valueFormatter={(value) => `${Math.round(value)}`}
              height={250}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgBpSystolic: Average Systolic Blood Pressure</p>
              <p className="text-green-500">● avgBpDiastolic: Average Diastolic Blood Pressure</p>
              <p className="text-orange-500">● avgHeartRate: Average Heart Rate</p>
            </div>
          </TabsContent>
          
          <TabsContent value="oxygen">
            <LineChart
              data={temporalData}
              index="month"
              categories={["avgOxygenSaturation", "avgTemperature"]}
              valueFormatter={(value) => `${value.toFixed(1)}`}
              height={250}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgOxygenSaturation: Average Oxygen Saturation (%)</p>
              <p className="text-green-500">● avgTemperature: Average Temperature (°C)</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            These charts display how key health indicators have changed over time across all participants.
            Significant changes or patterns may suggest seasonal effects or changes in care protocols.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemporalTrends;
