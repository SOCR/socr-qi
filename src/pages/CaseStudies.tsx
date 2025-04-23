
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NoDataMessage from "@/components/NoDataMessage";
import { useToast } from "@/components/ui/use-toast";
import { Database, Users, User } from "lucide-react";
import ParticipantProfile from "@/components/ParticipantProfile";
import CohortCaseStudy from "@/components/CohortCaseStudy";

const CaseStudies = () => {
  const { data, isDataLoaded } = useData();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("individual");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [selectedCohortType, setSelectedCohortType] = useState<string>("condition");

  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  // Get the selected participant
  const selectedParticipant = data.find(p => p.id === selectedParticipantId);

  // Auto-select first participant if none selected
  if (data.length > 0 && !selectedParticipantId) {
    setSelectedParticipantId(data[0].id);
  }

  // Create cohort groups based on selected type
  const getCohortGroups = () => {
    switch (selectedCohortType) {
      case "condition":
        return data.reduce((groups: Record<string, any[]>, participant) => {
          const key = participant.condition;
          if (!groups[key]) groups[key] = [];
          groups[key].push(participant);
          return groups;
        }, {});
      case "age":
        return data.reduce((groups: Record<string, any[]>, participant) => {
          let ageGroup = "";
          if (participant.age < 30) ageGroup = "Under 30";
          else if (participant.age < 50) ageGroup = "30-49";
          else if (participant.age < 70) ageGroup = "50-69";
          else ageGroup = "70+";
          
          if (!groups[ageGroup]) groups[ageGroup] = [];
          groups[ageGroup].push(participant);
          return groups;
        }, {});
      case "risk":
        return data.reduce((groups: Record<string, any[]>, participant) => {
          let riskGroup = "";
          if (participant.riskScore < 30) riskGroup = "Low Risk";
          else if (participant.riskScore < 70) riskGroup = "Medium Risk";
          else riskGroup = "High Risk";
          
          if (!groups[riskGroup]) groups[riskGroup] = [];
          groups[riskGroup].push(participant);
          return groups;
        }, {});
      case "outcome":
        return data.reduce((groups: Record<string, any[]>, participant) => {
          const key = participant.outcome;
          if (!groups[key]) groups[key] = [];
          groups[key].push(participant);
          return groups;
        }, {});
      default:
        return {};
    }
  };

  const cohortGroups = getCohortGroups();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Case Studies</h1>
          <Badge variant="outline" className="text-xs">
            {data.length} Participants
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Individual Profiles</span>
          </TabsTrigger>
          <TabsTrigger value="cohort" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Cohort Analysis</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Participant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a participant" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.map(participant => (
                      <SelectItem key={participant.id} value={participant.id}>
                        ID: {participant.id} - {participant.gender}, {participant.age}, {participant.condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedParticipant && <ParticipantProfile participant={selectedParticipant} />}
        </TabsContent>

        <TabsContent value="cohort" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cohort Grouping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <Select value={selectedCohortType} onValueChange={setSelectedCohortType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Group by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="condition">By Condition</SelectItem>
                    <SelectItem value="age">By Age Group</SelectItem>
                    <SelectItem value="risk">By Risk Level</SelectItem>
                    <SelectItem value="outcome">By Outcome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {Object.entries(cohortGroups).map(([groupName, participants]) => (
              <CohortCaseStudy 
                key={groupName} 
                groupName={groupName} 
                groupType={selectedCohortType}
                participants={participants}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseStudies;
