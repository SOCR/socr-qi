
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

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
              {data.slice(0, 20).map((participant) => (
                <DropdownMenuCheckboxItem
                  key={participant.id}
                  checked={selectedParticipantIds.includes(participant.id)}
                  onCheckedChange={() => toggleParticipant(participant.id)}
                >
                  {participant.id} - {participant.condition}
                </DropdownMenuCheckboxItem>
              ))}
              {data.length > 20 && (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Showing 20 of {data.length} participants
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
