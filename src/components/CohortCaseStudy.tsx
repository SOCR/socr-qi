
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

interface CohortCaseStudyProps {
  groupName: string;
  groupType: string;
  participants: any[];
}

const CohortCaseStudy: React.FC<CohortCaseStudyProps> = ({ 
  groupName, 
  groupType,
  participants 
}) => {
  // Function to format the cohort name based on type
  const formatCohortName = () => {
    switch (groupType) {
      case "condition":
        return `Condition: ${groupName}`;
      case "age":
        return `Age Group: ${groupName}`;
      case "risk":
        return `Risk Level: ${groupName}`;
      case "outcome":
        return `Outcome: ${groupName}`;
      default:
        return groupName;
    }
  };

  // Calculate basic statistics
  const stats = useMemo(() => {
    const ages = participants.map(p => p.age);
    const riskScores = participants.map(p => p.riskScore);
    const lengthsOfStay = participants.map(p => p.lengthOfStay);
    
    return {
      count: participants.length,
      avgAge: Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length),
      minAge: Math.min(...ages),
      maxAge: Math.max(...ages),
      avgRiskScore: Math.round(riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length),
      avgLengthOfStay: Math.round(lengthsOfStay.reduce((sum, los) => sum + los, 0) / lengthsOfStay.length),
      genderDistribution: participants.reduce((acc: Record<string, number>, p) => {
        acc[p.gender] = (acc[p.gender] || 0) + 1;
        return acc;
      }, {}),
      outcomeDistribution: participants.reduce((acc: Record<string, number>, p) => {
        acc[p.outcome] = (acc[p.outcome] || 0) + 1;
        return acc;
      }, {})
    };
  }, [participants]);

  // Format gender distribution for pie chart
  const genderChartData = Object.entries(stats.genderDistribution).map(([name, value]) => ({
    name,
    value
  }));

  // Format outcome distribution for pie chart
  const outcomeChartData = Object.entries(stats.outcomeDistribution).map(([name, value]) => ({
    name,
    value
  }));

  // Check if this cohort has deep phenotype data
  const hasDeepPhenotype = participants.some(p => p.deepPhenotype);

  // Calculate average deep phenotype metrics if available
  const deepPhenotypeStats = useMemo(() => {
    if (!hasDeepPhenotype) return null;
    
    // Extract participants with deep phenotype data
    const participantsWithDP = participants.filter(p => p.deepPhenotype);
    
    // Calculate averages for different metrics
    const qolScores = participantsWithDP
      .map(p => p.deepPhenotype.qualityOfLifeScore)
      .filter(score => score !== undefined);
    
    const satisfactionScores = participantsWithDP
      .map(p => p.deepPhenotype.patientSatisfactionScore)
      .filter(score => score !== undefined);
    
    const symptomBurdens = participantsWithDP
      .map(p => p.deepPhenotype.symptomBurden)
      .filter(burden => burden !== undefined);
    
    // Get functional status metrics if available
    const functionalStatusMetrics: Record<string, number[]> = {};
    
    participantsWithDP.forEach(p => {
      if (p.deepPhenotype.functionalStatus) {
        Object.entries(p.deepPhenotype.functionalStatus).forEach(([key, value]) => {
          if (!functionalStatusMetrics[key]) functionalStatusMetrics[key] = [];
          functionalStatusMetrics[key].push(value as number);
        });
      }
    });
    
    // Calculate averages for functional status metrics
    const functionalStatusAverages: Record<string, number> = {};
    Object.entries(functionalStatusMetrics).forEach(([key, values]) => {
      functionalStatusAverages[key] = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
    });
    
    return {
      avgQualityOfLife: qolScores.length ? 
        Math.round(qolScores.reduce((sum, score) => sum + score, 0) / qolScores.length) : null,
      avgSatisfaction: satisfactionScores.length ? 
        Math.round(satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length) : null,
      avgSymptomBurden: symptomBurdens.length ? 
        Math.round(symptomBurdens.reduce((sum, burden) => sum + burden, 0) * 10 / symptomBurdens.length) / 10 : null,
      functionalStatus: functionalStatusAverages
    };
  }, [participants, hasDeepPhenotype]);

  // Prepare deep phenotype comparison data for bar chart
  const deepPhenotypeChartData = useMemo(() => {
    if (!deepPhenotypeStats || !deepPhenotypeStats.functionalStatus) return [];
    
    return Object.entries(deepPhenotypeStats.functionalStatus).map(([name, value]) => ({
      name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: value,
    }));
  }, [deepPhenotypeStats]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{formatCohortName()}</CardTitle>
          <Badge variant="outline">{stats.count} Participants</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-md font-medium mb-3">Demographics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Participants</span>
                  <span className="font-medium">{stats.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Average Age</span>
                  <span className="font-medium">{stats.avgAge} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Age Range</span>
                  <span className="font-medium">{stats.minAge} - {stats.maxAge} years</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Clinical Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Average Risk Score</span>
                  <span className="font-medium">{stats.avgRiskScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Average Length of Stay</span>
                  <span className="font-medium">{stats.avgLengthOfStay} days</span>
                </div>
              </div>
            </div>
            
            <div>
              {hasDeepPhenotype && deepPhenotypeStats && (
                <div>
                  <h3 className="text-md font-medium mb-3">Deep Phenotype</h3>
                  <div className="space-y-2 text-sm">
                    {deepPhenotypeStats.avgQualityOfLife !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quality of Life</span>
                        <span className="font-medium">{deepPhenotypeStats.avgQualityOfLife}/100</span>
                      </div>
                    )}
                    {deepPhenotypeStats.avgSatisfaction !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Patient Satisfaction</span>
                        <span className="font-medium">{deepPhenotypeStats.avgSatisfaction}/100</span>
                      </div>
                    )}
                    {deepPhenotypeStats.avgSymptomBurden !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Symptom Burden</span>
                        <span className="font-medium">{deepPhenotypeStats.avgSymptomBurden}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-3">Gender Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Outcome Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {outcomeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {hasDeepPhenotype && deepPhenotypeChartData.length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-3">Functional Status Profile</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deepPhenotypeChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {deepPhenotypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-md font-medium mb-3">Participant List</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Length of Stay</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.id}</TableCell>
                      <TableCell>{participant.gender}</TableCell>
                      <TableCell>{participant.age}</TableCell>
                      <TableCell>{participant.condition}</TableCell>
                      <TableCell>{participant.riskScore}</TableCell>
                      <TableCell>{participant.lengthOfStay} days</TableCell>
                      <TableCell>{participant.outcome}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortCaseStudy;
