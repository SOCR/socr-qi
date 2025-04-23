
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataSummaryHeaderProps {
  totalParticipants: number;
  minAge: number;
  maxAge: number;
  avgAge: number;
  minLOS: number;
  maxLOS: number;
  avgLOS: number;
  avgRiskScore: number;
}

const DataSummaryHeader: React.FC<DataSummaryHeaderProps> = ({
  totalParticipants,
  minAge,
  maxAge,
  avgAge,
  minLOS,
  maxLOS,
  avgLOS,
  avgRiskScore,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalParticipants}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Age Range</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{minAge} - {maxAge}</p>
          <p className="text-sm text-muted-foreground">Avg: {avgAge}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Avg. Length of Stay</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{avgLOS} days</p>
          <p className="text-sm text-muted-foreground">Range: {minLOS} - {maxLOS}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Avg. Risk Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{avgRiskScore}</p>
          <p className="text-sm text-muted-foreground">Scale: 0-100</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSummaryHeader;
