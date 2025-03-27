
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, LineChart } from "@/components/ui/chart";
import { calculateCorrelation, linearRegression } from "@/utils/analyticsUtils";

interface ReportAnalyticsSectionProps {
  data: any[];
}

const ReportAnalyticsSection: React.FC<ReportAnalyticsSectionProps> = ({ data }) => {
  // Calculate correlations
  const riskScores = data.map(p => p.riskScore);
  const lengthsOfStay = data.map(p => p.lengthOfStay);
  const readmissionRisks = data.map(p => p.readmissionRisk);
  
  // Convert outcomes to numerical values for correlation calculation
  const outcomeValues = data.map(p => {
    switch(p.outcome) {
      case "Improved": return 1;
      case "Stable": return 2;
      case "Deteriorated": return 3;
      case "Transferred": return 4;
      case "Deceased": return 5;
      default: return 0;
    }
  });
  
  // Calculate correlations
  const riskScoreOutcomeCorr = calculateCorrelation(riskScores, outcomeValues);
  const riskScoreLOSCorr = calculateCorrelation(riskScores, lengthsOfStay);
  const readmissionRiskOutcomeCorr = calculateCorrelation(readmissionRisks, outcomeValues);
  
  // Calculate regression
  const regression = linearRegression(riskScores, lengthsOfStay);
  
  // Treatment effectiveness by condition
  const treatmentByCondition: Record<string, { total: number; count: number }> = {};
  
  data.forEach(p => {
    if (!treatmentByCondition[p.condition]) {
      treatmentByCondition[p.condition] = { total: 0, count: 0 };
    }
    
    p.treatments.forEach((t: any) => {
      treatmentByCondition[p.condition].total += t.effectiveness;
      treatmentByCondition[p.condition].count++;
    });
  });
  
  const treatmentEffectiveness = Object.entries(treatmentByCondition).map(([condition, data]) => ({
    condition,
    effectiveness: data.count > 0 ? data.total / data.count : 0
  }));
  
  // Risk by condition
  const riskByCondition: Record<string, { total: number; count: number }> = {};
  
  data.forEach(p => {
    if (!riskByCondition[p.condition]) {
      riskByCondition[p.condition] = { total: 0, count: 0 };
    }
    
    riskByCondition[p.condition].total += p.readmissionRisk;
    riskByCondition[p.condition].count++;
  });
  
  const conditionRisks = Object.entries(riskByCondition).map(([condition, data]) => ({
    condition,
    risk: data.count > 0 ? data.total / data.count : 0
  }));

  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium">Key Correlations</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variables</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correlation</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strength</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Risk Score vs Outcome</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{riskScoreOutcomeCorr.toFixed(3)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {Math.abs(riskScoreOutcomeCorr) < 0.3 ? "Weak" : 
                       Math.abs(riskScoreOutcomeCorr) < 0.7 ? "Moderate" : "Strong"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Risk Score vs Length of Stay</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{riskScoreLOSCorr.toFixed(3)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {Math.abs(riskScoreLOSCorr) < 0.3 ? "Weak" : 
                       Math.abs(riskScoreLOSCorr) < 0.7 ? "Moderate" : "Strong"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Readmission Risk vs Outcome</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{readmissionRiskOutcomeCorr.toFixed(3)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {Math.abs(readmissionRiskOutcomeCorr) < 0.3 ? "Weak" : 
                       Math.abs(readmissionRiskOutcomeCorr) < 0.7 ? "Moderate" : "Strong"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Treatment Effectiveness by Condition</h3>
              <div className="h-64">
                <BarChart
                  data={treatmentEffectiveness}
                  index="condition"
                  categories={["effectiveness"]}
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                  layout="vertical"
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Readmission Risk by Condition</h3>
              <div className="h-64">
                <BarChart
                  data={conditionRisks}
                  index="condition"
                  categories={["risk"]}
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                  layout="vertical"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Regression Analysis</h3>
            <div className="mt-2">
              <p className="text-sm">
                <strong>Relationship between Risk Score and Length of Stay:</strong>
              </p>
              <p className="text-sm mt-1 font-mono bg-gray-50 p-2 rounded">
                Length of Stay = {regression.slope.toFixed(2)} × Risk Score + {regression.intercept.toFixed(2)}
              </p>
              <p className="text-sm mt-2">
                For each point increase in risk score, length of stay increases by approximately {regression.slope.toFixed(2)} days.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportAnalyticsSection;
