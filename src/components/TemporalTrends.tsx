
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from "@/components/ui/charts/LineChart";
import { Label } from "@/components/ui/label";
import { useTemporalData } from "@/hooks/useTemporalData";

const TemporalTrends = () => {
  const { data, getParticipantsByCondition, getParticipantsByUnit } = useData();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  
  // Get unique conditions and units
  const conditions = Array.from(new Set(data.map(p => p.condition))).sort();
  const units = Array.from(new Set(data.map(p => p.unit))).sort();
  
  // Filter data based on selection
  let filteredData = data;
  if (filterType === 'condition' && selectedCondition) {
    filteredData = getParticipantsByCondition(selectedCondition);
  } else if (filterType === 'unit' && selectedUnit) {
    filteredData = getParticipantsByUnit(selectedUnit);
  }
  
  const temporalData = useTemporalData(filteredData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temporal Trends Analysis</CardTitle>
        <CardDescription>
          Changes in key health indicators over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Filter Data</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  <SelectItem value="condition">By Condition</SelectItem>
                  <SelectItem value="unit">By Clinical Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filterType === 'condition' && (
              <div className="space-y-2">
                <Label>Select Condition</Label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {filterType === 'unit' && (
              <div className="space-y-2">
                <Label>Select Unit</Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="vitals">
          <TabsList>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="bloodPressure">Blood Pressure</TabsTrigger>
            <TabsTrigger value="oxygen">Oxygen & Temperature</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vitals">
            <LineChart
              data={temporalData}
              index="month"
              categories={["avgHeartRate"]}
              valueFormatter={(value) => `${Math.round(value)}`}
              height={250}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgHeartRate: Average Heart Rate</p>
              {filterType !== 'all' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Filtered by: {filterType === 'condition' ? `Condition: ${selectedCondition}` : `Unit: ${selectedUnit}`}
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bloodPressure">
            <LineChart
              data={temporalData}
              index="month"
              categories={["avgBpSystolic", "avgBpDiastolic"]}
              valueFormatter={(value) => `${Math.round(value)}`}
              height={250}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgBpSystolic: Average Systolic Blood Pressure</p>
              <p className="text-green-500">● avgBpDiastolic: Average Diastolic Blood Pressure</p>
              {filterType !== 'all' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Filtered by: {filterType === 'condition' ? `Condition: ${selectedCondition}` : `Unit: ${selectedUnit}`}
                </p>
              )}
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
              {filterType !== 'all' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Filtered by: {filterType === 'condition' ? `Condition: ${selectedCondition}` : `Unit: ${selectedUnit}`}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            These charts display how key health indicators have changed over time
            {filterType !== 'all' 
              ? filterType === 'condition'
                ? ` for patients with ${selectedCondition}`
                : ` in the ${selectedUnit} unit`
              : " across all participants"
            }.
            Significant changes or patterns may suggest seasonal effects or changes in care protocols.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemporalTrends;
