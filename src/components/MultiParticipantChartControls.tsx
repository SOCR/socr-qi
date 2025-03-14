
import React from "react";
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

interface MultiParticipantChartControlsProps {
  data: Participant[];
  selectedParticipantIds: string[];
  setSelectedParticipantIds: (ids: string[]) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
}

const MultiParticipantChartControls: React.FC<MultiParticipantChartControlsProps> = ({
  data,
  selectedParticipantIds,
  setSelectedParticipantIds,
  selectedMetric,
  setSelectedMetric
}) => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="w-full sm:w-1/2">
          <Label htmlFor="participant-select">Add Participant</Label>
          <Select 
            onValueChange={(value) => toggleParticipant(value)}
            value=""
          >
            <SelectTrigger id="participant-select">
              <SelectValue placeholder="Select a participant" />
            </SelectTrigger>
            <SelectContent>
              {data.map((participant) => (
                <SelectItem 
                  key={participant.id} 
                  value={participant.id}
                  disabled={selectedParticipantIds.includes(participant.id)}
                >
                  {participant.id} - {participant.condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={selectAll}
          >
            Select Sample
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearAll}
          >
            Clear All
          </Button>
        </div>
      </div>

      {selectedParticipantIds.length > 0 && (
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
                <span>{participant?.id}</span>
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
