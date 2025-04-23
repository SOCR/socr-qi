
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataSummaryDemographicsProps {
  genderCounts: Record<string, number>;
  unitCounts: Record<string, number>;
  totalParticipants: number;
}

const DataSummaryDemographics: React.FC<DataSummaryDemographicsProps> = ({
  genderCounts,
  unitCounts,
  totalParticipants,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(genderCounts).map(([gender, count]) => (
              <div key={gender} className="flex justify-between items-center">
                <span>{gender}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(count / totalParticipants) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {count} ({Math.round((count / totalParticipants) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unit Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(unitCounts).map(([unit, count]) => (
              <div key={unit} className="flex justify-between items-center">
                <span>{unit}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(count / totalParticipants) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {count} ({Math.round((count / totalParticipants) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSummaryDemographics;
