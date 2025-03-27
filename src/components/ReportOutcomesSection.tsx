
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportOutcomesSectionProps {
  data: any[];
}

const ReportOutcomesSection: React.FC<ReportOutcomesSectionProps> = ({ data }) => {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Outcomes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Outcome Distribution</h3>
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(data.reduce((acc, p) => {
                acc[p.outcome] = (acc[p.outcome] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)).map(([outcome, count]) => (
                <p key={outcome}>
                  {outcome}: {count} ({Math.round((count / data.length) * 100)}%)
                </p>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Length of Stay</h3>
            <div className="mt-2">
              <p className="text-sm">
                Average Length of Stay: {Math.round(data.reduce((sum, p) => sum + p.lengthOfStay, 0) / data.length)} days
              </p>
              <p className="text-sm">
                Range: {Math.min(...data.map(p => p.lengthOfStay))} - {Math.max(...data.map(p => p.lengthOfStay))} days
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Readmission Risk</h3>
            <div className="mt-2">
              <p className="text-sm">
                Average Readmission Risk: {Math.round(data.reduce((sum, p) => sum + p.readmissionRisk, 0) / data.length)}%
              </p>
              <p className="text-sm">
                High Readmission Risk (&gt; 50%): {data.filter(p => p.readmissionRisk > 50).length} patients
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportOutcomesSection;
