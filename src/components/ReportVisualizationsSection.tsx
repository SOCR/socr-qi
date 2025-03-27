
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/charts/BarChart";
import { PieChart } from "@/components/ui/charts/PieChart";

interface ReportVisualizationsSectionProps {
  data: any[];
}

const ReportVisualizationsSection: React.FC<ReportVisualizationsSectionProps> = ({ data }) => {
  // Prepare visualization data
  const outcomeData = Object.entries(data.reduce((acc, p) => {
    acc[p.outcome] = (acc[p.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  const genderData = Object.entries(data.reduce((acc, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

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

  const losData = [
    { name: "Improved", value: getAvgLOSImproved() },
    { name: "Non-Improved", value: getAvgLOSNonImproved() }
  ];

  const riskByConditionData = Array.from(
    new Set(data.map(p => p.condition))
  ).map(condition => {
    const patientsWithCondition = data.filter(p => p.condition === condition);
    const avgRisk = patientsWithCondition.reduce((sum, p) => sum + p.riskScore, 0) / patientsWithCondition.length;
    return {
      name: condition,
      value: parseFloat(avgRisk.toFixed(1))
    };
  });

  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Visualizations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Outcome Distribution</h3>
            <div className="h-[300px]">
              <PieChart
                data={outcomeData}
                index="name"
                categoryKey="value"
                valueFormatter={(value) => `${value} patients`}
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Gender Distribution</h3>
            <div className="h-[300px]">
              <PieChart
                data={genderData}
                index="name"
                categoryKey="value"
                valueFormatter={(value) => `${value} patients`}
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Avg. Length of Stay by Outcome</h3>
            <div className="h-[300px]">
              <BarChart
                data={losData}
                index="name"
                categories={["value"]}
                valueFormatter={(value) => `${value} days`}
                colors={["blue"]}
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Risk Score by Condition</h3>
            <div className="h-[300px]">
              <BarChart
                data={riskByConditionData}
                index="name"
                categories={["value"]}
                valueFormatter={(value) => `${value}`}
                colors={["indigo"]}
                layout="vertical"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportVisualizationsSection;
