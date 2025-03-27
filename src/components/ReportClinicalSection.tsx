
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportClinicalSectionProps {
  data: any[];
}

const ReportClinicalSection: React.FC<ReportClinicalSectionProps> = ({ data }) => {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Clinical Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Condition Distribution</h3>
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(data.reduce((acc, p) => {
                acc[p.condition] = (acc[p.condition] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)).map(([condition, count]) => (
                <p key={condition}>
                  {condition}: {count} ({Math.round((count / data.length) * 100)}%)
                </p>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Unit Distribution</h3>
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(data.reduce((acc, p) => {
                acc[p.unit] = (acc[p.unit] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)).map(([unit, count]) => (
                <p key={unit}>
                  {unit}: {count} ({Math.round((count / data.length) * 100)}%)
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium">Risk Scores</h3>
            <div className="mt-2">
              <p className="text-sm">
                Average Risk Score: {Math.round(data.reduce((sum, p) => sum + p.riskScore, 0) / data.length)}
              </p>
              <p className="text-sm">
                High Risk Patients (Score &gt; 70): {data.filter(p => p.riskScore > 70).length} 
                ({Math.round((data.filter(p => p.riskScore > 70).length / data.length) * 100)}%)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportClinicalSection;
