
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NoDataMessage from "@/components/NoDataMessage";
import MissingnessAnalysis from "@/components/MissingnessAnalysis";
import TemporalTrends from "@/components/TemporalTrends";
import DataCodeBook from "@/components/DataCodeBook";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

// Helper to safely access nested properties
const getNestedValue = (obj: any, path: string) => {
  try {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  } catch (e) {
    return undefined;
  }
};

const DataSummary = () => {
  const { data, isDataLoaded } = useData();
  const [selectedCategory, setSelectedCategory] = useState("basic");

  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  // Check if we have deep phenotype data
  const hasDeepPhenotype = data.some(participant => participant.deepPhenotype);

  // Calculate summary statistics for basic variables
  const totalParticipants = data.length;
  
  // Count by unit
  const unitCounts = data.reduce((acc, participant) => {
    acc[participant.unit] = (acc[participant.unit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by gender
  const genderCounts = data.reduce((acc, participant) => {
    acc[participant.gender] = (acc[participant.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by condition
  const conditionCounts = data.reduce((acc, participant) => {
    acc[participant.condition] = (acc[participant.condition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by outcome
  const outcomeCounts = data.reduce((acc, participant) => {
    acc[participant.outcome] = (acc[participant.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Age statistics
  const ages = data.map(p => p.age);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  const avgAge = Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);

  // Length of stay statistics
  const losValues = data.map(p => p.lengthOfStay);
  const minLOS = Math.min(...losValues);
  const maxLOS = Math.max(...losValues);
  const avgLOS = Math.round(losValues.reduce((sum, los) => sum + los, 0) / losValues.length);

  // Risk score statistics
  const riskScores = data.map(p => p.riskScore);
  const avgRiskScore = Math.round(riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length);

  // Average number of measurements per patient
  const avgMeasurements = Math.round(
    data.reduce((sum, p) => sum + p.measurements.length, 0) / data.length
  );

  // Average number of treatments per patient
  const avgTreatments = Math.round(
    data.reduce((sum, p) => sum + p.treatments.length, 0) / data.length
  );

  // Deep phenotype category calculations
  const calculateDeepPhenotypeStats = (path: string) => {
    const values = data
      .map(p => getNestedValue(p.deepPhenotype, path))
      .filter(val => val !== undefined && val !== null);
    
    if (values.length === 0) return null;
    
    // If the values are numeric
    if (typeof values[0] === 'number') {
      const numericValues = values as number[];
      return {
        count: numericValues.length,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        avg: Math.round((numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length) * 100) / 100,
        type: 'numeric'
      };
    } 
    
    // If the values are categorical
    if (typeof values[0] === 'string') {
      const categoricalValues = values as string[];
      const categories = categoricalValues.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        count: categoricalValues.length,
        categories,
        type: 'categorical'
      };
    }
    
    return {
      count: values.length,
      type: 'unknown'
    };
  };
  
  // Define deep phenotype categories
  const deepPhenotypeCategories = [
    { id: "patientReported", label: "Patient-Reported Outcomes", 
      variables: ["qualityOfLifeScore", "patientSatisfactionScore", "symptomBurden", "adlScore", "mentalHealthScore"] },
    { id: "healthcare", label: "Healthcare Utilization", 
      variables: ["edVisitsPerYear", "hospitalizationsPerYear", "primaryCareVisitsPerYear"] },
    { id: "treatment", label: "Treatment & Medication", 
      variables: ["medicationAdherenceRate", "adverseDrugEventRisk", "treatmentCompletionRate"] },
    { id: "functionalStatus", label: "Functional Status", 
      variables: ["functionalStatus.physicalFunction", "functionalStatus.mobility", "functionalStatus.adlIndependence", 
                 "functionalStatus.cognitiveFunction", "functionalStatus.frailtyIndex"] },
    { id: "diseaseSpecific", label: "Disease-Specific Measures", 
      variables: ["diseaseSpecificMeasures.hba1c", "diseaseSpecificMeasures.lipidProfileLDL", 
                 "diseaseSpecificMeasures.lipidProfileHDL", "diseaseSpecificMeasures.depressionPHQ9"] },
    { id: "cost", label: "Cost & Resources", 
      variables: ["totalCostOfCare", "costPerEpisode"] }
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Summary</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalParticipants}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Age Range</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{minAge} - {maxAge}</p>
            <p className="text-sm text-muted-foreground">Avg: {avgAge}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Length of Stay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgLOS} days</p>
            <p className="text-sm text-muted-foreground">Range: {minLOS} - {maxLOS}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgRiskScore}</p>
            <p className="text-sm text-muted-foreground">Scale: 0-100</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demographics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          {hasDeepPhenotype && (
            <TabsTrigger value="deepPhenotype">Deep Phenotyping</TabsTrigger>
          )}
          <TabsTrigger value="dataCodeBook">Data Code Book</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(genderCounts).map(([gender, count]) => (
                    <div key={gender} className="flex justify-between items-center">
                      <span>{gender}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / totalParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / totalParticipants) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unit Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(unitCounts).map(([unit, count]) => (
                    <div key={unit} className="flex justify-between items-center">
                      <span>{unit}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / totalParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / totalParticipants) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Condition Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(conditionCounts).map(([condition, count]) => (
                    <div key={condition} className="flex justify-between items-center">
                      <span>{condition}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / totalParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / totalParticipants) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outcome Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(outcomeCounts).map(([outcome, count]) => (
                    <div key={outcome} className="flex justify-between items-center">
                      <span>{outcome}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / totalParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / totalParticipants) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {hasDeepPhenotype && (
          <TabsContent value="deepPhenotype">
            <Card>
              <CardHeader>
                <CardTitle>Deep Phenotype Data Summary</CardTitle>
                <CardDescription>
                  Explore enhanced patient phenotyping variables across multiple domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {deepPhenotypeCategories.map((category) => {
                    const availableVars = category.variables.filter(v => 
                      data.some(p => p.deepPhenotype && getNestedValue(p.deepPhenotype, v) !== undefined)
                    );
                    
                    if (availableVars.length === 0) return null;
                    
                    return (
                      <AccordionItem key={category.id} value={category.id}>
                        <AccordionTrigger className="hover:bg-gray-50 px-4">
                          {category.label}
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-4">
                            {availableVars.map((varPath) => {
                              const stats = calculateDeepPhenotypeStats(varPath);
                              if (!stats) return null;
                              
                              // Get the variable label (last part of the path)
                              const varLabel = varPath.split('.').pop() || varPath;
                              const formattedLabel = varLabel
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase());
                              
                              return (
                                <div key={varPath} className="border rounded-md p-4">
                                  <h4 className="font-medium mb-2">{formattedLabel}</h4>
                                  {stats.type === 'numeric' && (
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                      <div>
                                        <p className="text-gray-500">Min</p>
                                        <p className="font-medium">{stats.min}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Average</p>
                                        <p className="font-medium">{stats.avg}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Max</p>
                                        <p className="font-medium">{stats.max}</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {stats.type === 'categorical' && (
                                    <div className="space-y-2">
                                      {Object.entries(stats.categories).map(([value, count]) => (
                                        <div key={value} className="flex justify-between items-center">
                                          <span>{value}</span>
                                          <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-indigo-500 rounded-full" 
                                                style={{ width: `${(count / stats.count) * 100}%` }}
                                              />
                                            </div>
                                            <span className="text-xs font-medium">
                                              {Math.round((count / stats.count) * 100)}%
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="dataCodeBook">
          <DataCodeBook />
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="space-y-6">
            <MissingnessAnalysis />
            <TemporalTrends />
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
          <CardDescription>Overall statistics about the dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium">Demographics</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Total Participants: {totalParticipants}</li>
                <li>Gender Groups: {Object.keys(genderCounts).length}</li>
                <li>Age Range: {minAge} - {maxAge} years (avg: {avgAge})</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Clinical</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Clinical Units: {Object.keys(unitCounts).length}</li>
                <li>Conditions: {Object.keys(conditionCounts).length}</li>
                <li>Outcome Types: {Object.keys(outcomeCounts).length}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Measurements</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Avg. Measurements/Patient: {avgMeasurements}</li>
                <li>Avg. Treatments/Patient: {avgTreatments}</li>
                <li>Avg. Length of Stay: {avgLOS} days</li>
              </ul>
            </div>
          </div>
          
          {hasDeepPhenotype && (
            <Alert className="mt-4">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Deep Phenotyping Data Available</AlertTitle>
              <AlertDescription>
                This dataset includes enhanced patient phenotyping data. Go to the "Deep Phenotyping" tab to explore these variables.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSummary;
