
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportOutcomesSectionProps {
  data: any[];
}

const ReportOutcomesSection: React.FC<ReportOutcomesSectionProps> = ({ data }) => {
  // Calculate outcome distribution
  const outcomeCounts: Record<string, number> = {};
  
  data.forEach(p => {
    if (p.outcome) {
      outcomeCounts[p.outcome] = (outcomeCounts[p.outcome] || 0) + 1;
    }
  });
  
  // Calculate length of stay statistics
  const validLOS = data.map(p => p.lengthOfStay).filter(los => los !== undefined && los !== null);
  
  const calculateLOSStats = () => {
    if (validLOS.length === 0) return { min: "N/A", max: "N/A", avg: "N/A" };
    
    const min = Math.min(...validLOS);
    const max = Math.max(...validLOS);
    const avg = validLOS.reduce((sum, los) => sum + los, 0) / validLOS.length;
    
    return {
      min: min.toString(),
      max: max.toString(),
      avg: avg.toFixed(1)
    };
  };
  
  const losStats = calculateLOSStats();
  
  // Calculate readmission risk statistics
  const calculateReadmissionStats = () => {
    const validRisks = data.map(p => p.readmissionRisk).filter(risk => risk !== undefined && risk !== null);
    
    if (validRisks.length === 0) return { avg: "N/A", highRiskCount: 0 };
    
    const avg = validRisks.reduce((sum, risk) => sum + risk, 0) / validRisks.length;
    const highRiskCount = validRisks.filter(risk => risk > 50).length;
    
    return {
      avg: avg.toFixed(1),
      highRiskCount
    };
  };
  
  const readmissionStats = calculateReadmissionStats();

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
              {Object.entries(outcomeCounts).map(([outcome, count]) => (
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
                Average Length of Stay: {losStats.avg} days
              </p>
              <p className="text-sm">
                Range: {losStats.min} - {losStats.max} days
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Readmission Risk</h3>
            <div className="mt-2">
              <p className="text-sm">
                Average Readmission Risk: {readmissionStats.avg}%
              </p>
              <p className="text-sm">
                High Readmission Risk (&gt; 50%): {readmissionStats.highRiskCount} patients
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportOutcomesSection;
