
import React, { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart } from "@/components/ui/charts/LineChart";
import { Label } from "@/components/ui/label";
import { useTemporalData } from "@/hooks/useTemporalData";
import { ScrollArea } from "@/components/ui/scroll-area";
import MultipleSelect from "@/components/ui/multiple-select";

const TemporalTrends = () => {
  const { data, getParticipantsByCondition, getParticipantsByUnit } = useData();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showIndividualCourses, setShowIndividualCourses] = useState<boolean>(true);
  const [showAggregateAverage, setShowAggregateAverage] = useState<boolean>(true);
  const [showConfidenceBands, setShowConfidenceBands] = useState<boolean>(false);
  
  // Get unique conditions, units, and participants
  const conditions = Array.from(new Set(data.map(p => p.condition))).sort();
  const units = Array.from(new Set(data.map(p => p.unit))).sort();
  const participants = data.map(p => ({ id: p.id, label: `${p.id} (${p.condition})` }));
  
  // Filter data based on selection
  let filteredData = data;
  
  if (filterType === 'condition' && selectedConditions.length > 0) {
    filteredData = data.filter(p => selectedConditions.includes(p.condition));
  } else if (filterType === 'unit' && selectedUnits.length > 0) {
    filteredData = data.filter(p => selectedUnits.includes(p.unit));
  } else if (filterType === 'participant' && selectedParticipants.length > 0) {
    filteredData = data.filter(p => selectedParticipants.includes(p.id));
  }
  
  const temporalData = useTemporalData(filteredData);

  // Generate categories for the LineChart based on selection type and visualization options
  const generateCategories = (metric: string) => {
    const categories: string[] = [];
    
    if (showAggregateAverage) {
      categories.push(`avg${metric.charAt(0).toUpperCase() + metric.slice(1)}`);
    }
    
    if (showIndividualCourses) {
      if (filterType === 'condition' && selectedConditions.length > 0) {
        selectedConditions.forEach(condition => {
          categories.push(`${condition}_avg${metric.charAt(0).toUpperCase() + metric.slice(1)}`);
        });
      } else if (filterType === 'unit' && selectedUnits.length > 0) {
        selectedUnits.forEach(unit => {
          categories.push(`${unit}_avg${metric.charAt(0).toUpperCase() + metric.slice(1)}`);
        });
      } else if (filterType === 'participant' && selectedParticipants.length > 0) {
        // For participants, we would need individual participant data
        // This would require modifying the useTemporalData hook to include per-participant data
        // For now, we'll just show the aggregate average
      }
    }
    
    return categories;
  };

  // Prepare confidence band categories if needed
  const generateConfidenceBands = (metric: string) => {
    if (!showConfidenceBands) return [];
    
    // Generate confidence band entries for the selected metric
    // This would require modifying the useTemporalData hook to calculate confidence bands
    return [];
  };

  // Handle filter type change
  const handleFilterTypeChange = (type: string) => {
    setFilterType(type);
    // Reset selections when changing filter type
    setSelectedConditions([]);
    setSelectedUnits([]);
    setSelectedParticipants([]);
  };

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filter Data</Label>
              <Select value={filterType} onValueChange={handleFilterTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  <SelectItem value="condition">By Condition</SelectItem>
                  <SelectItem value="unit">By Clinical Unit</SelectItem>
                  <SelectItem value="participant">By Participant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filterType === 'condition' && (
              <div className="space-y-2">
                <Label>Select Conditions</Label>
                <MultipleSelect
                  options={conditions.map(condition => ({ value: condition, label: condition }))}
                  selectedValues={selectedConditions}
                  onChange={setSelectedConditions}
                  placeholder="Select conditions"
                />
              </div>
            )}
            
            {filterType === 'unit' && (
              <div className="space-y-2">
                <Label>Select Units</Label>
                <MultipleSelect
                  options={units.map(unit => ({ value: unit, label: unit }))}
                  selectedValues={selectedUnits}
                  onChange={setSelectedUnits}
                  placeholder="Select units"
                />
              </div>
            )}
            
            {filterType === 'participant' && (
              <div className="space-y-2">
                <Label>Select Participants</Label>
                <MultipleSelect
                  options={participants.map(p => ({ value: p.id, label: p.label }))}
                  selectedValues={selectedParticipants}
                  onChange={setSelectedParticipants}
                  placeholder="Select participants"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Display Options</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-aggregate" 
                    checked={showAggregateAverage}
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        setShowAggregateAverage(checked);
                      }
                    }}
                  />
                  <label
                    htmlFor="show-aggregate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Aggregate Average
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-individual" 
                    checked={showIndividualCourses}
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        setShowIndividualCourses(checked);
                      }
                    }}
                  />
                  <label
                    htmlFor="show-individual"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Individual Time Courses
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-confidence" 
                    checked={showConfidenceBands}
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        setShowConfidenceBands(checked);
                      }
                    }}
                    disabled={!showAggregateAverage}
                  />
                  <label
                    htmlFor="show-confidence"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show 95% Confidence Bands
                  </label>
                </div>
              </div>
            </div>
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
              categories={generateCategories("HeartRate")}
              valueFormatter={(value) => `${Math.round(value)}`}
              height={250}
              showConfidenceBands={showConfidenceBands}
              confidenceBandCategories={generateConfidenceBands("HeartRate")}
            />
            <div className="mt-2 text-sm">
              {showAggregateAverage && (
                <p className="text-blue-500">● avgHeartRate: Average Heart Rate</p>
              )}
              {showIndividualCourses && filterType === 'condition' && selectedConditions.map((condition, index) => (
                <p key={condition} style={{ color: `hsl(${(index * 30) % 360}, 70%, 50%)` }}>
                  ● {condition}: {condition} Average Heart Rate
                </p>
              ))}
              {showIndividualCourses && filterType === 'unit' && selectedUnits.map((unit, index) => (
                <p key={unit} style={{ color: `hsl(${(index * 30) % 360}, 70%, 50%)` }}>
                  ● {unit}: {unit} Average Heart Rate
                </p>
              ))}
              {filterType !== 'all' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {filterType === 'condition' && selectedConditions.length > 0 && 
                    `Filtered by Conditions: ${selectedConditions.join(', ')}`}
                  {filterType === 'unit' && selectedUnits.length > 0 && 
                    `Filtered by Units: ${selectedUnits.join(', ')}`}
                  {filterType === 'participant' && selectedParticipants.length > 0 && 
                    `Filtered by Participants: ${selectedParticipants.length} selected`}
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bloodPressure">
            <LineChart
              data={temporalData}
              index="month"
              categories={[
                ...(showAggregateAverage ? ["avgBpSystolic", "avgBpDiastolic"] : []),
                ...(showIndividualCourses && filterType === 'condition' ? 
                  selectedConditions.flatMap(condition => [
                    `${condition}_avgBpSystolic`,
                    `${condition}_avgBpDiastolic`
                  ]) : []),
                ...(showIndividualCourses && filterType === 'unit' ? 
                  selectedUnits.flatMap(unit => [
                    `${unit}_avgBpSystolic`,
                    `${unit}_avgBpDiastolic`
                  ]) : [])
              ]}
              valueFormatter={(value) => `${Math.round(value)}`}
              height={250}
              showConfidenceBands={showConfidenceBands}
              confidenceBandCategories={generateConfidenceBands("BpSystolic").concat(generateConfidenceBands("BpDiastolic"))}
            />
            <div className="mt-2 text-sm">
              {showAggregateAverage && (
                <>
                  <p className="text-blue-500">● avgBpSystolic: Average Systolic Blood Pressure</p>
                  <p className="text-green-500">● avgBpDiastolic: Average Diastolic Blood Pressure</p>
                </>
              )}
              {showIndividualCourses && filterType === 'condition' && selectedConditions.map((condition, index) => (
                <React.Fragment key={condition}>
                  <p style={{ color: `hsl(${(index * 30) % 360}, 70%, 50%)` }}>
                    ● {condition} Systolic: {condition} Average Systolic Blood Pressure
                  </p>
                  <p style={{ color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` }}>
                    ● {condition} Diastolic: {condition} Average Diastolic Blood Pressure
                  </p>
                </React.Fragment>
              ))}
              {showIndividualCourses && filterType === 'unit' && selectedUnits.map((unit, index) => (
                <React.Fragment key={unit}>
                  <p style={{ color: `hsl(${(index * 30) % 360}, 70%, 50%)` }}>
                    ● {unit} Systolic: {unit} Average Systolic Blood Pressure
                  </p>
                  <p style={{ color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` }}>
                    ● {unit} Diastolic: {unit} Average Diastolic Blood Pressure
                  </p>
                </React.Fragment>
              ))}
              {filterType !== 'all' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {filterType === 'condition' && selectedConditions.length > 0 && 
                    `Filtered by Conditions: ${selectedConditions.join(', ')}`}
                  {filterType === 'unit' && selectedUnits.length > 0 && 
                    `Filtered by Units: ${selectedUnits.join(', ')}`}
                  {filterType === 'participant' && selectedParticipants.length > 0 && 
                    `Filtered by Participants: ${selectedParticipants.length} selected`}
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="oxygen">
            <LineChart
              data={temporalData}
              index="month"
              categories={[
                ...(showAggregateAverage ? ["avgOxygenSaturation", "avgTemperature"] : []),
                ...(showIndividualCourses && filterType === 'condition' ? 
                  selectedConditions.flatMap(condition => [
                    `${condition}_avgOxygenSaturation`,
                    `${condition}_avgTemperature`
                  ]) : []),
                ...(showIndividualCourses && filterType === 'unit' ? 
                  selectedUnits.flatMap(unit => [
                    `${unit}_avgOxygenSaturation`,
                    `${unit}_avgTemperature`
                  ]) : [])
              ]}
              valueFormatter={(value) => `${value.toFixed(1)}`}
              height={250}
              showConfidenceBands={showConfidenceBands}
              confidenceBandCategories={generateConfidenceBands("OxygenSaturation").concat(generateConfidenceBands("Temperature"))}
            />
            <div className="mt-2 text-sm">
              {showAggregateAverage && (
                <>
                  <p className="text-blue-500">● avgOxygenSaturation: Average Oxygen Saturation (%)</p>
                  <p className="text-green-500">● avgTemperature: Average Temperature (°C)</p>
                </>
              )}
              {showIndividualCourses && filterType === 'condition' && selectedConditions.map((condition, index) => (
                <React.Fragment key={condition}>
                  <p style={{ color: `hsl(${(index * 30) % 360}, 70%, 50%)` }}>
                    ● {condition} O₂: {condition} Average Oxygen Saturation
                  </p>
                  <p style={{ color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` }}>
                    ● {condition} Temp: {condition} Average Temperature
                  </p>
                </React.Fragment>
              ))}
              {showIndividualCourses && filterType === 'unit' && selectedUnits.map((unit, index) => (
                <React.Fragment key={unit}>
                  <p style={{ color: `hsl(${(index * 30) % 360}, 70%, 50%)` }}>
                    ● {unit} O₂: {unit} Average Oxygen Saturation
                  </p>
                  <p style={{ color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` }}>
                    ● {unit} Temp: {unit} Average Temperature
                  </p>
                </React.Fragment>
              ))}
              {filterType !== 'all' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {filterType === 'condition' && selectedConditions.length > 0 && 
                    `Filtered by Conditions: ${selectedConditions.join(', ')}`}
                  {filterType === 'unit' && selectedUnits.length > 0 && 
                    `Filtered by Units: ${selectedUnits.join(', ')}`}
                  {filterType === 'participant' && selectedParticipants.length > 0 && 
                    `Filtered by Participants: ${selectedParticipants.length} selected`}
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
                ? ` for patients with ${selectedConditions.length > 1 ? 'selected conditions' : selectedConditions[0] || 'any condition'}`
                : filterType === 'unit'
                  ? ` in the ${selectedUnits.length > 1 ? 'selected units' : selectedUnits[0] || 'any unit'}`
                  : ` for ${selectedParticipants.length} selected participants`
              : " across all participants"
            }.
            {showIndividualCourses && 
              " Individual time courses are shown to highlight variations between entities."
            }
            {showConfidenceBands && showAggregateAverage && 
              " Confidence bands indicate the statistical reliability of the average values."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemporalTrends;
