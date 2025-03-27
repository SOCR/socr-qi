
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportDemographicsSectionProps {
  data: any[];
}

const ReportDemographicsSection: React.FC<ReportDemographicsSectionProps> = ({ data }) => {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Age Distribution</h3>
            <div className="mt-2">
              <p className="text-sm">
                Age Range: {Math.min(...data.map(p => p.age))} - {Math.max(...data.map(p => p.age))} years
              </p>
              <p className="text-sm">
                Average Age: {Math.round(data.reduce((sum, p) => sum + p.age, 0) / data.length)} years
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Gender Distribution</h3>
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(data.reduce((acc, p) => {
                acc[p.gender] = (acc[p.gender] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)).map(([gender, count]) => (
                <p key={gender}>
                  {gender}: {count} ({Math.round((count / data.length) * 100)}%)
                </p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportDemographicsSection;
