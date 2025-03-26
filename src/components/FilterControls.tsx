
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import MultipleSelect from "@/components/ui/multiple-select";

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
  showConfidenceBands: boolean;
  setShowConfidenceBands: (show: boolean) => void;
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
  showConfidenceBands,
  setShowConfidenceBands,
}) => {
  // Convert participants from {id, label} format to {value, label} format
  const participantOptions = React.useMemo(() => {
    return participants.map(participant => ({
      value: participant.id,
      label: participant.label
    }));
  }, [participants]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Filter Data</Label>
        <Select value={filterType} onValueChange={onFilterTypeChange}>
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
            options={participantOptions}
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
  );
};

export default FilterControls;
