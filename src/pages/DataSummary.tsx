
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoDataMessage from "@/components/NoDataMessage";
import MissingnessAnalysis from "@/components/MissingnessAnalysis";
import TemporalTrends from "@/components/TemporalTrends";
import DataCodeBook from "@/components/DataCodeBook";
import DataSummaryHeader from "@/components/DataSummaryHeader";
import DataSummaryDemographics from "@/components/DataSummaryDemographics";
import DataSummaryClinical from "@/components/DataSummaryClinical";
import DataSummaryDeepPhenotype from "@/components/DataSummaryDeepPhenotype";
import DataSummaryOverview from "@/components/DataSummaryOverview";

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

  // Helper to safely access nested properties
  const getNestedValue = (obj: any, path: string) => {
    try {
      return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    } catch (e) {
      return undefined;
    }
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
      
      <DataSummaryHeader 
        totalParticipants={totalParticipants}
        minAge={minAge}
        maxAge={maxAge}
        avgAge={avgAge}
        minLOS={minLOS}
        maxLOS={maxLOS}
        avgLOS={avgLOS}
        avgRiskScore={avgRiskScore}
      />

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
          <DataSummaryDemographics 
            genderCounts={genderCounts}
            unitCounts={unitCounts}
            totalParticipants={totalParticipants}
          />
        </TabsContent>

        <TabsContent value="clinical">
          <DataSummaryClinical 
            conditionCounts={conditionCounts}
            outcomeCounts={outcomeCounts}
            totalParticipants={totalParticipants}
          />
        </TabsContent>
        
        {hasDeepPhenotype && (
          <TabsContent value="deepPhenotype">
            <DataSummaryDeepPhenotype 
              deepPhenotypeCategories={deepPhenotypeCategories}
              data={data}
              calculateDeepPhenotypeStats={calculateDeepPhenotypeStats}
            />
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

      <DataSummaryOverview 
        totalParticipants={totalParticipants}
        genderCounts={genderCounts}
        unitCounts={unitCounts}
        conditionCounts={conditionCounts}
        outcomeCounts={outcomeCounts}
        minAge={minAge}
        maxAge={maxAge}
        avgAge={avgAge}
        avgMeasurements={avgMeasurements}
        avgTreatments={avgTreatments}
        avgLOS={avgLOS}
        hasDeepPhenotype={hasDeepPhenotype}
      />
    </div>
  );
};

export default DataSummary;
