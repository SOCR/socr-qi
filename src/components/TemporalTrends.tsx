
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

const TemporalTrends = () => {
  const { data, getParticipantsByCondition, getParticipantsByUnit } = useData();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
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

  // Helper functions for selecting/deselecting items
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition) 
        : [...prev, condition]
    );
  };

  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev => 
      prev.includes(unit) 
        ? prev.filter(u => u !== unit) 
        : [...prev, unit]
    );
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };

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
                <div className="flex flex-wrap gap-2">
                  {selectedConditions.map(condition => (
                    <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                      {condition}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => toggleCondition(condition)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <ScrollArea className="h-40 border rounded-md">
                  <div className="p-2 space-y-1">
                    {conditions.map(condition => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`condition-${condition}`} 
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={() => toggleCondition(condition)}
                        />
                        <label
                          htmlFor={`condition-${condition}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            {filterType === 'unit' && (
              <div className="space-y-2">
                <Label>Select Units</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUnits.map(unit => (
                    <Badge key={unit} variant="secondary" className="flex items-center gap-1">
                      {unit}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => toggleUnit(unit)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <ScrollArea className="h-40 border rounded-md">
                  <div className="p-2 space-y-1">
                    {units.map(unit => (
                      <div key={unit} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`unit-${unit}`} 
                          checked={selectedUnits.includes(unit)}
                          onCheckedChange={() => toggleUnit(unit)}
                        />
                        <label
                          htmlFor={`unit-${unit}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {unit}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            {filterType === 'participant' && (
              <div className="space-y-2">
                <Label>Select Participants</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedParticipants.map(id => {
                    const participant = participants.find(p => p.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {participant?.label || id}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => toggleParticipant(id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
                <ScrollArea className="h-40 border rounded-md">
                  <div className="p-2 space-y-1">
                    {participants.map(participant => (
                      <div key={participant.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`participant-${participant.id}`} 
                          checked={selectedParticipants.includes(participant.id)}
                          onCheckedChange={() => toggleParticipant(participant.id)}
                        />
                        <label
                          htmlFor={`participant-${participant.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {participant.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
              categories={["avgBpSystolic", "avgBpDiastolic"]}
              valueFormatter={(value) => `${Math.round(value)}`}
              height={250}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgBpSystolic: Average Systolic Blood Pressure</p>
              <p className="text-green-500">● avgBpDiastolic: Average Diastolic Blood Pressure</p>
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
              categories={["avgOxygenSaturation", "avgTemperature"]}
              valueFormatter={(value) => `${value.toFixed(1)}`}
              height={250}
            />
            <div className="mt-2 text-sm">
              <p className="text-blue-500">● avgOxygenSaturation: Average Oxygen Saturation (%)</p>
              <p className="text-green-500">● avgTemperature: Average Temperature (°C)</p>
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
            Significant changes or patterns may suggest seasonal effects or changes in care protocols.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemporalTrends;
