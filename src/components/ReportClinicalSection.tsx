
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportClinicalSectionProps {
  data: any[];
}

const ReportClinicalSection: React.FC<ReportClinicalSectionProps> = ({ data }) => {
  // Calculate average measurements
  const calculateAverages = () => {
    let totalBP = 0;
    let totalHR = 0;
    let totalO2 = 0;
    let countBP = 0;
    let countHR = 0;
    let countO2 = 0;
    
    data.forEach(p => {
      p.measurements.forEach((m: any) => {
        if (m.bloodPressureSystolic !== undefined) {
          totalBP += m.bloodPressureSystolic;
          countBP++;
        }
        if (m.heartRate !== undefined) {
          totalHR += m.heartRate;
          countHR++;
        }
        if (m.oxygenSaturation !== undefined) {
          totalO2 += m.oxygenSaturation;
          countO2++;
        }
      });
    });
    
    return {
      avgBP: countBP > 0 ? (totalBP / countBP).toFixed(1) : "N/A",
      avgHR: countHR > 0 ? (totalHR / countHR).toFixed(1) : "N/A",
      avgO2: countO2 > 0 ? (totalO2 / countO2).toFixed(1) : "N/A"
    };
  };
  
  const averages = calculateAverages();
  
  // Calculate risk score distribution
  const riskCategories = {
    low: data.filter(p => p.riskScore < 30).length,
    medium: data.filter(p => p.riskScore >= 30 && p.riskScore < 70).length,
    high: data.filter(p => p.riskScore >= 70).length
  };
  
  // Get most common treatments
  const treatmentCounts: Record<string, number> = {};
  
  data.forEach(p => {
    p.treatments.forEach((t: any) => {
      treatmentCounts[t.name] = (treatmentCounts[t.name] || 0) + 1;
    });
  });
  
  const mostCommonTreatments = Object.entries(treatmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle>Clinical Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium">Vital Signs</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Avg. Blood Pressure:</span>
                <span className="font-semibold">{averages.avgBP} mmHg</span>
              </li>
              <li className="flex justify-between">
                <span>Avg. Heart Rate:</span>
                <span className="font-semibold">{averages.avgHR} bpm</span>
              </li>
              <li className="flex justify-between">
                <span>Avg. Oxygen Saturation:</span>
                <span className="font-semibold">{averages.avgO2}%</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">Risk Score Distribution</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Low Risk (&lt;30):</span>
                <span className="font-semibold">{riskCategories.low} patients ({Math.round((riskCategories.low / data.length) * 100)}%)</span>
              </li>
              <li className="flex justify-between">
                <span>Medium Risk (30-70):</span>
                <span className="font-semibold">{riskCategories.medium} patients ({Math.round((riskCategories.medium / data.length) * 100)}%)</span>
              </li>
              <li className="flex justify-between">
                <span>High Risk (&gt;70):</span>
                <span className="font-semibold">{riskCategories.high} patients ({Math.round((riskCategories.high / data.length) * 100)}%)</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">Most Common Treatments</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {mostCommonTreatments.map((treatment, i) => (
                <li key={i} className="flex justify-between">
                  <span>{treatment.name}:</span>
                  <span className="font-semibold">{treatment.count} patients</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportClinicalSection;
