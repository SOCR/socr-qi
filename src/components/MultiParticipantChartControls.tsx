
import React, { useState } from "react";
import { Participant } from "@/context/DataContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

interface MultiParticipantChartControlsProps {
  data: Participant[];
  selectedParticipantIds: string[];
  setSelectedParticipantIds: (ids: string[]) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  compareToConditionMean: boolean;
  setCompareToConditionMean: (compare: boolean) => void;
  compareToUnitMean: boolean;
  setCompareToUnitMean: (compare: boolean) => void;
  showConfidenceBands: boolean;
  setShowConfidenceBands: (show: boolean) => void;
}

const MultiParticipantChartControls: React.FC<MultiParticipantChartControlsProps> = ({
  data,
  selectedParticipantIds,
  setSelectedParticipantIds,
  selectedMetric,
  setSelectedMetric,
  compareToConditionMean,
  setCompareToConditionMean,
  compareToUnitMean,
  setCompareToUnitMean,
  showConfidenceBands,
  setShowConfidenceBands
}) => {
  const [filterCriteria, setFilterCriteria] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // Get unique conditions and units for filtering
  const uniqueConditions = Array.from(new Set(data.map(p => p.condition))).sort();
  const uniqueUnits = Array.from(new Set(data.map(p => p.unit))).sort();

  // Toggle selection of a participant
  const toggleParticipant = (id: string) => {
    if (selectedParticipantIds.includes(id)) {
      setSelectedParticipantIds(selectedParticipantIds.filter(pid => pid !== id));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, id]);
    }
  };

  // Select all participants (or limit to a reasonable number)
  const selectAll = () => {
    // Limit to 10 participants for performance reasons
    const maxParticipants = 10; 
    setSelectedParticipantIds(data.slice(0, maxParticipants).map(p => p.id));
  };

  // Clear all selected participants
  const clearAll = () => {
    setSelectedParticipantIds([]);
  };

  // Filter participants based on selected criteria
  const getFilteredParticipants = () => {
    let filteredData = [...data];
    
    if (filterCriteria === 'condition' && selectedCondition) {
      filteredData = filteredData.filter(p => p.condition === selectedCondition);
    } else if (filterCriteria === 'unit' && selectedUnit) {
      filteredData = filteredData.filter(p => p.unit === selectedUnit);
    }
    
    return filteredData;
  };

  // Handle applying the filter
  const handleFilterChange = (criteria: string) => {
    setFilterCriteria(criteria);
    if (criteria === 'all') {
      setSelectedCondition('');
      setSelectedUnit('');
    }
  };

  // Get filtered participants
  const filteredParticipants = getFilteredParticipants();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Filter Participants</Label>
          <div className="flex gap-2">
            <Select
              value={filterCriteria}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="condition">By Condition</SelectItem>
                <SelectItem value="unit">By Clinical Unit</SelectItem>
              </SelectContent>
            </Select>
            
            {filterCriteria === 'condition' && (
              <Select
                value={selectedCondition}
                onValueChange={setSelectedCondition}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select condition..." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueConditions.map(condition => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {filterCriteria === 'unit' && (
              <Select
                value={selectedUnit}
                onValueChange={setSelectedUnit}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select unit..." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="participant-select">Select Participants</Label>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedParticipantIds.length === 0 
                  ? "Select participants" 
                  : `${selectedParticipantIds.length} participant(s) selected`}
                <span>▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full max-h-[300px] overflow-auto">
              {filteredParticipants.slice(0, 20).map((participant) => (
                <DropdownMenuCheckboxItem
                  key={participant.id}
                  checked={selectedParticipantIds.includes(participant.id)}
                  onCheckedChange={() => toggleParticipant(participant.id)}
                >
                  {participant.id} - {participant.condition}
                </DropdownMenuCheckboxItem>
              ))}
              {filteredParticipants.length > 20 && (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Showing 20 of {filteredParticipants.length} participants
                </div>
              )}
              <DropdownMenuSeparator />
              <div className="flex p-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={selectAll}
                >
                  Select Sample
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={clearAll}
                >
                  Clear All
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {selectedParticipantIds.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Selected Metric</Label>
            <Tabs 
              value={selectedMetric} 
              onValueChange={setSelectedMetric}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="vitals" className="flex-1">Vital Signs</TabsTrigger>
                <TabsTrigger value="bloodPressure" className="flex-1">Blood Pressure</TabsTrigger>
                <TabsTrigger value="oxygenation" className="flex-1">Oxygenation</TabsTrigger>
                <TabsTrigger value="temperature" className="flex-1">Temperature</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="compare-condition">Compare to Condition Mean</Label>
              <Switch 
                id="compare-condition" 
                checked={compareToConditionMean}
                onCheckedChange={setCompareToConditionMean}
                disabled={compareToUnitMean}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="compare-unit">Compare to Unit Mean</Label>
              <Switch 
                id="compare-unit" 
                checked={compareToUnitMean}
                onCheckedChange={setCompareToUnitMean}
                disabled={compareToConditionMean}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="confidence-bands">Show Confidence Bands</Label>
              <Switch 
                id="confidence-bands" 
                checked={showConfidenceBands}
                onCheckedChange={setShowConfidenceBands}
                disabled={!compareToConditionMean && !compareToUnitMean}
              />
            </div>
          </div>
        </div>
      )}

      {selectedParticipantIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedParticipantIds.map(id => {
            const participant = data.find(p => p.id === id);
            return (
              <div 
                key={id}
                className="px-2 py-1 bg-primary/10 rounded-md flex items-center gap-2 text-sm"
              >
                <span>{participant?.id} - {participant?.condition}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4" 
                  onClick={() => toggleParticipant(id)}
                >
                  <span className="sr-only">Remove</span>
                  ✕
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiParticipantChartControls;
