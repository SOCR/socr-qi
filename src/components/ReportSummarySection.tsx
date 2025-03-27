
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportSummarySectionProps {
  data: any[];
}

const ReportSummarySection: React.FC<ReportSummarySectionProps> = ({ data }) => {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Data Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium">Dataset Overview</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Total Participants: {data.length}</li>
              <li>Data Collection Period: {new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Clinical Units</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {Array.from(new Set(data.map(p => p.unit))).map(unit => (
                <li key={unit}>{unit}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Conditions</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {Array.from(new Set(data.map(p => p.condition))).map(condition => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSummarySection;
