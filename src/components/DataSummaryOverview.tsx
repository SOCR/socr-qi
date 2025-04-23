
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface DataSummaryOverviewProps {
  totalParticipants: number;
  genderCounts: Record<string, number>;
  unitCounts: Record<string, number>;
  conditionCounts: Record<string, number>;
  outcomeCounts: Record<string, number>;
  minAge: number;
  maxAge: number;
  avgAge: number;
  avgMeasurements: number;
  avgTreatments: number;
  avgLOS: number;
  hasDeepPhenotype: boolean;
}

const DataSummaryOverview: React.FC<DataSummaryOverviewProps> = ({
  totalParticipants,
  genderCounts,
  unitCounts,
  conditionCounts,
  outcomeCounts,
  minAge,
  maxAge,
  avgAge,
  avgMeasurements,
  avgTreatments,
  avgLOS,
  hasDeepPhenotype,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Overview</CardTitle>
        <CardDescription>Overall statistics about the dataset</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium">Demographics</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Total Participants: {totalParticipants}</li>
              <li>Gender Groups: {Object.keys(genderCounts).length}</li>
              <li>Age Range: {minAge} - {maxAge} years (avg: {avgAge})</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Clinical</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Clinical Units: {Object.keys(unitCounts).length}</li>
              <li>Conditions: {Object.keys(conditionCounts).length}</li>
              <li>Outcome Types: {Object.keys(outcomeCounts).length}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Measurements</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Avg. Measurements/Patient: {avgMeasurements}</li>
              <li>Avg. Treatments/Patient: {avgTreatments}</li>
              <li>Avg. Length of Stay: {avgLOS} days</li>
            </ul>
          </div>
        </div>
        
        {hasDeepPhenotype && (
          <Alert className="mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Deep Phenotyping Data Available</AlertTitle>
            <AlertDescription>
              This dataset includes enhanced patient phenotyping data. Go to the "Deep Phenotyping" tab to explore these variables.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DataSummaryOverview;
