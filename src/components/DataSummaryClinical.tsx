
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataSummaryClinicalProps {
  conditionCounts: Record<string, number>;
  outcomeCounts: Record<string, number>;
  totalParticipants: number;
}

const DataSummaryClinical: React.FC<DataSummaryClinicalProps> = ({
  conditionCounts,
  outcomeCounts,
  totalParticipants,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Condition Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(conditionCounts).map(([condition, count]) => (
              <div key={condition} className="flex justify-between items-center">
                <span>{condition}</span>
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
          <CardTitle>Outcome Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(outcomeCounts).map(([outcome, count]) => (
              <div key={outcome} className="flex justify-between items-center">
                <span>{outcome}</span>
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

export default DataSummaryClinical;
