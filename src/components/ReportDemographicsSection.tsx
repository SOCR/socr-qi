
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportDemographicsSectionProps {
  data: any[];
}

const ReportDemographicsSection: React.FC<ReportDemographicsSectionProps> = ({ data }) => {
  // Ensure we have valid age data for calculations
  const validAges = data.map(p => p.age).filter(age => age !== undefined && age !== null);
  
  // Calculate age statistics
  const calculateAgeStats = () => {
    if (validAges.length === 0) return { min: "N/A", max: "N/A", avg: "N/A" };
    
    const min = Math.min(...validAges);
    const max = Math.max(...validAges);
    const avg = validAges.reduce((sum, age) => sum + age, 0) / validAges.length;
    
    return {
      min: min.toString(),
      max: max.toString(),
      avg: avg.toFixed(1)
    };
  };
  
  const ageStats = calculateAgeStats();
  
  // Calculate gender distribution
  const genderCounts: Record<string, number> = {};
  
  data.forEach(p => {
    if (p.gender) {
      genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
    }
  });
  
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
                Age Range: {ageStats.min} - {ageStats.max} years
              </p>
              <p className="text-sm">
                Average Age: {ageStats.avg} years
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Gender Distribution</h3>
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(genderCounts).map(([gender, count]) => (
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
