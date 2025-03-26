
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterControlsProps {
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  selectedConditions: string[];
  setSelectedConditions: (conditions: string[]) => void;
  selectedUnits: string[];
  setSelectedUnits: (units: string[]) => void;
  selectedParticipants: string[];
  setSelectedParticipants: (participants: string[]) => void;
  conditions: string[];
  units: string[];
  participants: { id: string; label: string }[];
  showAggregateAverage: boolean;
  setShowAggregateAverage: (show: boolean) => void;
  showIndividualCourses: boolean;
  setShowIndividualCourses: (show: boolean) => void;
  showConfidenceBands?: boolean;
  setShowConfidenceBands?: (show: boolean) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filterType,
  onFilterTypeChange,
  selectedConditions,
  setSelectedConditions,
  selectedUnits,
  setSelectedUnits,
  selectedParticipants,
  setSelectedParticipants,
  conditions,
  units,
  participants,
  showAggregateAverage,
  setShowAggregateAverage,
  showIndividualCourses,
  setShowIndividualCourses,
  showConfidenceBands = false,
  setShowConfidenceBands
}) => {
  // Toggle condition selection
  const toggleCondition = (condition: string) => {
    setSelectedConditions(
      selectedConditions.includes(condition)
        ? selectedConditions.filter(c => c !== condition)
        : [...selectedConditions, condition]
    );
  };
  
  // Toggle unit selection
  const toggleUnit = (unit: string) => {
    setSelectedUnits(
      selectedUnits.includes(unit)
        ? selectedUnits.filter(u => u !== unit)
        : [...selectedUnits, unit]
    );
  };
  
  // Toggle participant selection
  const toggleParticipant = (participant: string) => {
    setSelectedParticipants(
      selectedParticipants.includes(participant)
        ? selectedParticipants.filter(p => p !== participant)
        : [...selectedParticipants, participant]
    );
  };
  
  // Sanitize participant ids to ensure they're valid strings
  const sanitizedParticipants = participants.map(p => ({
    value: p.id.toString(),
    label: p.label
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Filter Data By</Label>
        <RadioGroup
          value={filterType}
          onValueChange={onFilterTypeChange}
          className="flex flex-col space-y-1 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">All Data</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="condition" id="condition" />
            <Label htmlFor="condition">Conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unit" id="unit" />
            <Label htmlFor="unit">Units</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="participant" id="participant" />
            <Label htmlFor="participant">Participants</Label>
          </div>
        </RadioGroup>
      </div>
      
      {filterType === 'condition' && (
        <div>
          <Label className="text-base font-medium">Select Conditions</Label>
          <ScrollArea className="h-[100px] border rounded-md p-2 mt-1">
            <div className="space-y-1">
              {conditions.map(condition => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={selectedConditions.includes(condition)}
                    onCheckedChange={() => toggleCondition(condition)}
                  />
                  <Label htmlFor={`condition-${condition}`}>{condition}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {filterType === 'unit' && (
        <div>
          <Label className="text-base font-medium">Select Units</Label>
          <ScrollArea className="h-[100px] border rounded-md p-2 mt-1">
            <div className="space-y-1">
              {units.map(unit => (
                <div key={unit} className="flex items-center space-x-2">
                  <Checkbox
                    id={`unit-${unit}`}
                    checked={selectedUnits.includes(unit)}
                    onCheckedChange={() => toggleUnit(unit)}
                  />
                  <Label htmlFor={`unit-${unit}`}>{unit}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {filterType === 'participant' && (
        <div>
          <Label className="text-base font-medium">Select Participants</Label>
          <ScrollArea className="h-[100px] border rounded-md p-2 mt-1">
            <div className="space-y-1">
              {sanitizedParticipants.map(participant => (
                <div key={participant.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`participant-${participant.value}`}
                    checked={selectedParticipants.includes(participant.value)}
                    onCheckedChange={() => toggleParticipant(participant.value)}
                  />
                  <Label htmlFor={`participant-${participant.value}`}>{participant.label}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      <div className="space-y-2">
        <Label className="text-base font-medium">Display Options</Label>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-average"
              checked={showAggregateAverage}
              onCheckedChange={() => setShowAggregateAverage(!showAggregateAverage)}
            />
            <Label htmlFor="show-average">Show Aggregate Average</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-individual"
              checked={showIndividualCourses}
              onCheckedChange={() => setShowIndividualCourses(!showIndividualCourses)}
            />
            <Label htmlFor="show-individual">Show Individual Time Courses</Label>
          </div>
          {setShowConfidenceBands && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-confidence"
                checked={showConfidenceBands}
                onCheckedChange={() => setShowConfidenceBands(!showConfidenceBands)}
              />
              <Label htmlFor="show-confidence">Show Confidence Bands</Label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
