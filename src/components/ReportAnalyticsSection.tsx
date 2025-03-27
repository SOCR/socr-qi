
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportAnalyticsSectionProps {
  data: any[];
}

const ReportAnalyticsSection: React.FC<ReportAnalyticsSectionProps> = ({ data }) => {
  // Helper functions for analytics
  const getBestPerformingUnit = () => {
    return data.reduce((prev, current) => {
      const prevCount = data.filter(p => p.unit === prev && p.outcome === "Improved").length / 
                      data.filter(p => p.unit === prev).length;
      const currCount = data.filter(p => p.unit === current.unit && p.outcome === "Improved").length / 
                      data.filter(p => p.unit === current.unit).length;
      return prevCount > currCount ? prev : current.unit;
    }, data[0].unit);
  };
  
  const getLongestStayCondition = () => {
    const avgLOSByCondition = Object.entries(data.reduce((acc, p) => {
      if (!acc[p.condition]) {
        acc[p.condition] = { total: 0, count: 0 };
      }
      acc[p.condition].total += p.lengthOfStay;
      acc[p.condition].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>))
      .map(([condition, data]) => ({ 
        condition, 
        avgLOS: data.total / data.count 
      }))
      .sort((a, b) => b.avgLOS - a.avgLOS);
    
    return avgLOSByCondition.length > 0 ? avgLOSByCondition[0].condition : "N/A";
  };
  
  const getAvgLOSImproved = () => {
    const improvedPatients = data.filter(p => p.outcome === "Improved");
    return improvedPatients.length > 0 
      ? Math.round(improvedPatients.reduce((sum, p) => sum + p.lengthOfStay, 0) / improvedPatients.length)
      : 0;
  };
  
  const getAvgLOSNonImproved = () => {
    const nonImprovedPatients = data.filter(p => p.outcome !== "Improved");
    return nonImprovedPatients.length > 0 
      ? Math.round(nonImprovedPatients.reduce((sum, p) => sum + p.lengthOfStay, 0) / nonImprovedPatients.length)
      : 0;
  };

  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Best Performing Unit</h3>
              <p className="text-xl font-bold">{getBestPerformingUnit()}</p>
              <p className="text-sm text-gray-500">
                Highest rate of improved outcomes
              </p>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Condition with Longest Stay</h3>
              <p className="text-xl font-bold">{getLongestStayCondition()}</p>
              <p className="text-sm text-gray-500">
                Highest average length of stay
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Avg. Length of Stay (Improved)</h3>
              <p className="text-xl font-bold">{getAvgLOSImproved()} days</p>
              <p className="text-sm text-gray-500">
                For patients with improved outcomes
              </p>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Avg. Length of Stay (Non-Improved)</h3>
              <p className="text-xl font-bold">{getAvgLOSNonImproved()} days</p>
              <p className="text-sm text-gray-500">
                For patients with non-improved outcomes
              </p>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Key Insights</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                Patients with improved outcomes stay an average of {Math.abs(getAvgLOSImproved() - getAvgLOSNonImproved())} days 
                {getAvgLOSImproved() < getAvgLOSNonImproved() ? " less " : " more "} 
                than those with non-improved outcomes
              </li>
              <li>
                {getBestPerformingUnit()} has the highest rate of improved outcomes among all units
              </li>
              <li>
                {getLongestStayCondition()} patients require the longest hospital stays on average
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportAnalyticsSection;
