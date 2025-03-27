
import { useState, useMemo, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import NoDataMessage from "@/components/NoDataMessage";
import { AreaChart, BarChart, PieChart } from "@/components/ui/chart";
import ParticipantTimeSeriesChart from "@/components/ParticipantTimeSeriesChart";
import RiskScoreDistribution from "@/components/RiskScoreDistribution";

// Deep phenotype variable groups
const deepPhenotypeGroups = [
  { value: "patientReported", label: "Patient-Reported Outcomes" },
  { value: "healthcare", label: "Healthcare Utilization" },
  { value: "treatment", label: "Treatment & Medication" },
  { value: "functional", label: "Functional Status" },
  { value: "diseaseSpecific", label: "Disease-Specific Measures" }
];

// Deep phenotype variables by group
const deepPhenotypeVariables = {
  patientReported: [
    { path: "qualityOfLifeScore", label: "Quality of Life" },
    { path: "patientSatisfactionScore", label: "Patient Satisfaction" },
    { path: "symptomBurden", label: "Symptom Burden" },
    { path: "adlScore", label: "ADL Score" },
    { path: "mentalHealthScore", label: "Mental Health" }
  ],
  healthcare: [
    { path: "edVisitsPerYear", label: "ED Visits" },
    { path: "hospitalizationsPerYear", label: "Hospitalizations" },
    { path: "primaryCareVisitsPerYear", label: "PCP Visits" }
  ],
  treatment: [
    { path: "medicationAdherenceRate", label: "Medication Adherence" },
    { path: "adverseDrugEventRisk", label: "Adverse Event Risk" },
    { path: "treatmentCompletionRate", label: "Treatment Completion" }
  ],
  functional: [
    { path: "functionalStatus.physicalFunction", label: "Physical Function" },
    { path: "functionalStatus.mobility", label: "Mobility" },
    { path: "functionalStatus.adlIndependence", label: "ADL Independence" },
    { path: "functionalStatus.cognitiveFunction", label: "Cognitive Function" },
    { path: "functionalStatus.frailtyIndex", label: "Frailty Index" }
  ],
  diseaseSpecific: [
    { path: "diseaseSpecificMeasures.hba1c", label: "HbA1c" },
    { path: "diseaseSpecificMeasures.lipidProfileLDL", label: "LDL Cholesterol" },
    { path: "diseaseSpecificMeasures.lipidProfileHDL", label: "HDL Cholesterol" },
    { path: "diseaseSpecificMeasures.depressionPHQ9", label: "Depression PHQ-9" }
  ]
};

// Helper to safely access nested properties
const getNestedValue = (obj: any, path: string) => {
  try {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  } catch (e) {
    return undefined;
  }
};

const DataVisualization = () => {
  const { data, isDataLoaded } = useData();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  
  // Check if we have deep phenotype data
  const hasDeepPhenotype = useMemo(() => {
    return data.some(participant => participant.deepPhenotype);
  }, [data]);
  
  // If we have deep phenotype data and no group is selected, set the first group
  useEffect(() => {
    if (hasDeepPhenotype && !selectedGroup && deepPhenotypeGroups.length > 0) {
      setSelectedGroup(deepPhenotypeGroups[0].value);
      
      if (deepPhenotypeVariables[deepPhenotypeGroups[0].value as keyof typeof deepPhenotypeVariables].length > 0) {
        setSelectedVariable(deepPhenotypeVariables[deepPhenotypeGroups[0].value as keyof typeof deepPhenotypeVariables][0].path);
      }
    }
  }, [hasDeepPhenotype, selectedGroup]);
  
  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  // Prepare data for charts
  // Unit distribution for pie chart
  const unitCounts = data.reduce((acc, participant) => {
    acc[participant.unit] = (acc[participant.unit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const unitPieData = Object.entries(unitCounts).map(([name, value]) => ({ name, value }));
  
  // Outcome distribution for bar chart
  const outcomeCounts = data.reduce((acc, participant) => {
    acc[participant.outcome] = (acc[participant.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const outcomeBarData = Object.entries(outcomeCounts).map(([name, value]) => ({ name, value }));
  
  // Generate data for the currently selected deep phenotype variable
  const deepPhenotypeData = useMemo(() => {
    if (!selectedVariable || !hasDeepPhenotype) return [];
    
    const variableData = data
      .filter(p => p.deepPhenotype)
      .map(p => {
        const value = getNestedValue(p.deepPhenotype, selectedVariable);
        if (value === undefined || value === null) return null;
        
        return {
          id: p.id,
          value: typeof value === 'number' ? value : NaN,
          category: typeof value === 'string' ? value : null
        };
      })
      .filter(Boolean);
    
    // Handle numeric data
    if (variableData.some(d => !isNaN(d!.value))) {
      // Group by ranges for histogram-like visualization
      const numericValues = variableData
        .filter(d => !isNaN(d!.value))
        .map(d => d!.value);
      
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const range = max - min;
      const bucketSize = range / 10;
      
      const buckets: Record<string, number> = {};
      
      numericValues.forEach(value => {
        const bucketIndex = Math.floor((value - min) / bucketSize);
        const bucketLabel = `${(min + bucketIndex * bucketSize).toFixed(1)} - ${(min + (bucketIndex + 1) * bucketSize).toFixed(1)}`;
        buckets[bucketLabel] = (buckets[bucketLabel] || 0) + 1;
      });
      
      return Object.entries(buckets).map(([name, value]) => ({ name, value }));
    }
    
    // Handle categorical data
    if (variableData.some(d => d!.category)) {
      const categoryCounts: Record<string, number> = {};
      
      variableData
        .filter(d => d!.category)
        .forEach(d => {
          const category = d!.category as string;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      
      return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    }
    
    return [];
  }, [data, selectedVariable, hasDeepPhenotype]);
  
  const selectedVariableLabel = useMemo(() => {
    if (!selectedGroup || !selectedVariable) return "";
    
    const variableGroup = deepPhenotypeVariables[selectedGroup as keyof typeof deepPhenotypeVariables];
    const variable = variableGroup.find(v => v.path === selectedVariable);
    return variable ? variable.label : selectedVariable;
  }, [selectedGroup, selectedVariable]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Visualization</h1>
      
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary Charts</TabsTrigger>
          <TabsTrigger value="table">Data Table</TabsTrigger>
          <TabsTrigger value="timeseries">Time Series</TabsTrigger>
          {hasDeepPhenotype && (
            <TabsTrigger value="deepPhenotype">Deep Phenotype</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Unit Distribution</CardTitle>
                <CardDescription>Distribution of participants across clinical units</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart
                  data={unitPieData}
                  index="name"
                  categoryKey="value"
                  valueFormatter={(value) => `${value} patients`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outcome Distribution</CardTitle>
                <CardDescription>Distribution of clinical outcomes</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart
                  data={outcomeBarData}
                  index="name"
                  categories={["value"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} patients`}
                  layout="vertical"
                />
              </CardContent>
            </Card>
          </div>

          <RiskScoreDistribution />
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Participant Data</CardTitle>
              <CardDescription>Tabular view of all participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-2 text-left font-medium">ID</th>
                        <th className="px-4 py-2 text-left font-medium">Age</th>
                        <th className="px-4 py-2 text-left font-medium">Gender</th>
                        <th className="px-4 py-2 text-left font-medium">Unit</th>
                        <th className="px-4 py-2 text-left font-medium">Condition</th>
                        <th className="px-4 py-2 text-left font-medium">Outcome</th>
                        <th className="px-4 py-2 text-left font-medium">Risk Score</th>
                        <th className="px-4 py-2 text-left font-medium">Length of Stay</th>
                        {hasDeepPhenotype && (
                          <th className="px-4 py-2 text-left font-medium">Deep Phenotype</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 50).map((participant) => (
                        <tr key={participant.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{participant.id}</td>
                          <td className="px-4 py-2">{participant.age}</td>
                          <td className="px-4 py-2">{participant.gender}</td>
                          <td className="px-4 py-2">{participant.unit}</td>
                          <td className="px-4 py-2">{participant.condition}</td>
                          <td className="px-4 py-2">{participant.outcome}</td>
                          <td className="px-4 py-2">{participant.riskScore.toFixed(1)}</td>
                          <td className="px-4 py-2">{participant.lengthOfStay}</td>
                          {hasDeepPhenotype && (
                            <td className="px-4 py-2">
                              {participant.deepPhenotype ? (
                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                  Available
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                                  None
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.length > 50 && (
                  <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-t">
                    Showing 50 of {data.length} participants
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeseries">
          <ParticipantTimeSeriesChart />
        </TabsContent>
        
        {hasDeepPhenotype && (
          <TabsContent value="deepPhenotype">
            <Card>
              <CardHeader>
                <CardTitle>Deep Phenotype Data Visualization</CardTitle>
                <CardDescription>Explore advanced patient phenotyping variables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phenotype-group">Variable Group</Label>
                    <Select
                      value={selectedGroup || ""}
                      onValueChange={setSelectedGroup}
                    >
                      <SelectTrigger id="phenotype-group" className="mt-1">
                        <SelectValue placeholder="Select variable group" />
                      </SelectTrigger>
                      <SelectContent>
                        {deepPhenotypeGroups.map(group => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="phenotype-variable">Variable</Label>
                    <Select
                      value={selectedVariable || ""}
                      onValueChange={setSelectedVariable}
                      disabled={!selectedGroup}
                    >
                      <SelectTrigger id="phenotype-variable" className="mt-1">
                        <SelectValue placeholder="Select variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedGroup && deepPhenotypeVariables[selectedGroup as keyof typeof deepPhenotypeVariables]?.map(variable => (
                          <SelectItem key={variable.path} value={variable.path}>
                            {variable.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {selectedVariable && deepPhenotypeData.length > 0 && (
                  <div>
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>{selectedVariableLabel} Distribution</CardTitle>
                        <CardDescription>
                          Distribution of values across participants
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-[400px]">
                        <BarChart
                          data={deepPhenotypeData}
                          index="name"
                          categories={["value"]}
                          colors={["indigo"]}
                          valueFormatter={(value) => `${value} participants`}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {(!selectedVariable || deepPhenotypeData.length === 0) && (
                  <div className="p-12 text-center text-gray-500">
                    {!selectedVariable 
                      ? "Please select a variable to visualize" 
                      : "No data available for this variable"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DataVisualization;
