
import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

const TemporalTrends = () => {
  const { data, getParticipantsByCondition, getParticipantsByUnit } = useData();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showIndividualSeries, setShowIndividualSeries] = useState<boolean>(false);
  const [isAggregating, setIsAggregating] = useState<boolean>(true);
  
  // Get unique conditions, units, and participant IDs
  const conditions = Array.from(new Set(data.map(p => p.condition))).sort();
  const units = Array.from(new Set(data.map(p => p.unit))).sort();
  const participantIds = data.map(p => p.id).slice(0, 20); // Limit to first 20 for UI simplicity
  
  // Handle condition selection
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };
  
  // Handle unit selection
  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev => 
      prev.includes(unit) 
        ? prev.filter(u => u !== unit)
        : [...prev, unit]
    );
  };
  
  // Handle participant selection
  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };
  
  // Reset selections when filter type changes
  useEffect(() => {
    setSelectedConditions([]);
    setSelectedUnits([]);
    setSelectedParticipants([]);
  }, [filterType]);
  
  // Filter data based on selection
  let filteredData = data;
  let individualDataKeys: string[] = [];
  
  if (filterType === 'condition' && selectedConditions.length > 0) {
    filteredData = data.filter(p => selectedConditions.includes(p.condition));
    individualDataKeys = selectedConditions.map(c => `${c}_avgHeartRate`);
  } else if (filterType === 'unit' && selectedUnits.length > 0) {
    filteredData = data.filter(p => selectedUnits.includes(p.unit));
    individualDataKeys = selectedUnits.map(u => `${u}_avgHeartRate`);
  } else if (filterType === 'participant' && selectedParticipants.length > 0) {
    filteredData = data.filter(p => selectedParticipants.includes(p.id));
    // Individual participants will use their IDs in the temporal data
  }
  
  const temporalData = useTemporalData(filteredData);
  
  // Determine which categories to display based on filter type and selections
  const getCategories = (metricBase: string) => {
    // If aggregating, always show the overall average
    const baseCategories = isAggregating ? [`avg${metricBase}`] : [];
    
    // Add individual series if requested
    if (showIndividualSeries) {
      if (filterType === 'condition' && selectedConditions.length > 0) {
        return [...baseCategories, ...selectedConditions.map(c => `${c}_avg${metricBase}`)];
      } else if (filterType === 'unit' && selectedUnits.length > 0) {
        return [...baseCategories, ...selectedUnits.map(u => `${u}_avg${metricBase}`)];
      } else if (filterType === 'participant' && selectedParticipants.length > 0) {
        // For participants, we would need a different approach as individual data isn't in this format
        return baseCategories;
      }
    }
    
    return baseCategories;
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
                  <SelectItem value="participant">By Participant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filterType === 'condition' && (
              <div className="space-y-2">
                <Label>Select Conditions</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {conditions.map(condition => (
                    <div key={condition} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={`condition-${condition}`} 
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={() => toggleCondition(condition)}
                      />
                      <label 
                        htmlFor={`condition-${condition}`}
                        className="text-sm cursor-pointer"
                      >
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {filterType === 'unit' && (
              <div className="space-y-2">
                <Label>Select Units</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {units.map(unit => (
                    <div key={unit} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={`unit-${unit}`} 
                        checked={selectedUnits.includes(unit)}
                        onCheckedChange={() => toggleUnit(unit)}
                      />
                      <label 
                        htmlFor={`unit-${unit}`}
                        className="text-sm cursor-pointer"
                      >
                        {unit}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {filterType === 'participant' && (
              <div className="space-y-2">
                <Label>Select Participants</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {participantIds.map(id => (
                    <div key={id} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={`participant-${id}`} 
                        checked={selectedParticipants.includes(id)}
                        onCheckedChange={() => toggleParticipant(id)}
                      />
                      <label 
                        htmlFor={`participant-${id}`}
                        className="text-sm cursor-pointer"
                      >
                        {id}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Display Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-individual" 
                    checked={showIndividualSeries}
                    onCheckedChange={(checked) => setShowIndividualSeries(checked === true)}
                  />
                  <label 
                    htmlFor="show-individual"
                    className="text-sm cursor-pointer"
                  >
                    Show Individual Series
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-aggregate" 
                    checked={isAggregating}
                    onCheckedChange={(checked) => setIsAggregating(checked === true)}
                  />
                  <label 
                    htmlFor="show-aggregate"
                    className="text-sm cursor-pointer"
                  >
                    Show Aggregate Average
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
              categories={getCategories("HeartRate")}
              valueFormatter={(value) => `${Math.round(value)}`}
              height={350}
              showIndividualSeries={showIndividualSeries}
              individualSeriesPattern={filterType !== 'all' ? (
                filterType === 'condition' ? '_avgHeartRate' :
                filterType === 'unit' ? '_avgHeartRate' : ''
              ) : ''}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgHeartRate: Average Heart Rate</p>
              {filterType !== 'all' && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {filterType === 'condition' && selectedConditions.length > 0 && (
                    <p>Filtered by Conditions: {selectedConditions.join(', ')}</p>
                  )}
                  {filterType === 'unit' && selectedUnits.length > 0 && (
                    <p>Filtered by Units: {selectedUnits.join(', ')}</p>
                  )}
                  {filterType === 'participant' && selectedParticipants.length > 0 && (
                    <p>Filtered by Participants: {selectedParticipants.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bloodPressure">
            <LineChart
              data={temporalData}
              index="month"
              categories={getCategories("BpSystolic").concat(getCategories("BpDiastolic"))}
              valueFormatter={(value) => `${Math.round(value)}`}
              height={350}
              showIndividualSeries={showIndividualSeries}
              individualSeriesPattern={filterType !== 'all' ? (
                filterType === 'condition' ? '_avgBp' :
                filterType === 'unit' ? '_avgBp' : ''
              ) : ''}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgBpSystolic: Average Systolic Blood Pressure</p>
              <p className="text-green-500">● avgBpDiastolic: Average Diastolic Blood Pressure</p>
              {filterType !== 'all' && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {filterType === 'condition' && selectedConditions.length > 0 && (
                    <p>Filtered by Conditions: {selectedConditions.join(', ')}</p>
                  )}
                  {filterType === 'unit' && selectedUnits.length > 0 && (
                    <p>Filtered by Units: {selectedUnits.join(', ')}</p>
                  )}
                  {filterType === 'participant' && selectedParticipants.length > 0 && (
                    <p>Filtered by Participants: {selectedParticipants.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="oxygen">
            <LineChart
              data={temporalData}
              index="month"
              categories={getCategories("OxygenSaturation").concat(getCategories("Temperature"))}
              valueFormatter={(value) => `${value.toFixed(1)}`}
              height={350}
              showIndividualSeries={showIndividualSeries}
              individualSeriesPattern={filterType !== 'all' ? (
                filterType === 'condition' ? '_avg' :
                filterType === 'unit' ? '_avg' : ''
              ) : ''}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgOxygenSaturation: Average Oxygen Saturation (%)</p>
              <p className="text-green-500">● avgTemperature: Average Temperature (°C)</p>
              {filterType !== 'all' && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {filterType === 'condition' && selectedConditions.length > 0 && (
                    <p>Filtered by Conditions: {selectedConditions.join(', ')}</p>
                  )}
                  {filterType === 'unit' && selectedUnits.length > 0 && (
                    <p>Filtered by Units: {selectedUnits.join(', ')}</p>
                  )}
                  {filterType === 'participant' && selectedParticipants.length > 0 && (
                    <p>Filtered by Participants: {selectedParticipants.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            These charts display how key health indicators have changed over time
            {filterType !== 'all' 
              ? filterType === 'condition' && selectedConditions.length > 0
                ? ` for patients with ${selectedConditions.join(', ')}`
                : filterType === 'unit' && selectedUnits.length > 0
                ? ` in the ${selectedUnits.join(', ')} units`
                : filterType === 'participant' && selectedParticipants.length > 0
                ? ` for participants ${selectedParticipants.join(', ')}`
                : " across all participants"
              : " across all participants"
            }.
            {showIndividualSeries && " Individual series are shown alongside aggregates."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemporalTrends;
