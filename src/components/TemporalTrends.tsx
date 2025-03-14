
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

const TemporalTrends = () => {
  const { data } = useData();

  // Group measurements by month for temporal analysis
  const getTemporalData = () => {
    // Get all measurements from all participants
    const allMeasurements = data.flatMap(p => 
      p.measurements.map(m => ({
        ...m,
        participantId: p.id,
        participantOutcome: p.outcome
      }))
    );

    // Sort by date
    allMeasurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by month
    const measurementsByMonth: Record<string, any> = {};
    
    allMeasurements.forEach(m => {
      const date = new Date(m.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!measurementsByMonth[monthKey]) {
        measurementsByMonth[monthKey] = {
          month: monthKey,
          count: 0,
          avgBpSystolic: 0,
          avgBpDiastolic: 0,
          avgHeartRate: 0,
          avgTemperature: 0,
          avgOxygenSaturation: 0,
          sumBpSystolic: 0,
          sumBpDiastolic: 0,
          sumHeartRate: 0,
          sumTemperature: 0,
          sumOxygenSaturation: 0,
        };
      }
      
      const entry = measurementsByMonth[monthKey];
      
      // Only include non-null values in averages
      if (m.bloodPressureSystolic !== null) {
        entry.sumBpSystolic += m.bloodPressureSystolic;
      }
      
      if (m.bloodPressureDiastolic !== null) {
        entry.sumBpDiastolic += m.bloodPressureDiastolic;
      }
      
      if (m.heartRate !== null) {
        entry.sumHeartRate += m.heartRate;
      }
      
      if (m.temperature !== null) {
        entry.sumTemperature += m.temperature;
      }
      
      if (m.oxygenSaturation !== null) {
        entry.sumOxygenSaturation += m.oxygenSaturation;
      }
      
      entry.count += 1;
    });
    
    // Calculate averages
    Object.values(measurementsByMonth).forEach((entry: any) => {
      if (entry.count > 0) {
        entry.avgBpSystolic = entry.sumBpSystolic / entry.count;
        entry.avgBpDiastolic = entry.sumBpDiastolic / entry.count;
        entry.avgHeartRate = entry.sumHeartRate / entry.count;
        entry.avgTemperature = entry.sumTemperature / entry.count;
        entry.avgOxygenSaturation = entry.sumOxygenSaturation / entry.count;
      }
      
      // Delete sum fields
      delete entry.sumBpSystolic;
      delete entry.sumBpDiastolic;
      delete entry.sumHeartRate;
      delete entry.sumTemperature;
      delete entry.sumOxygenSaturation;
    });
    
    return Object.values(measurementsByMonth);
  };

  const temporalData = getTemporalData();

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
