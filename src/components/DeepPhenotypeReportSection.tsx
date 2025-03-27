
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, LineChart } from "@/components/ui/chart";

interface DeepPhenotypeReportSectionProps {
  data: any[];
  hasDeepPhenotypingData: boolean;
}

const DeepPhenotypeReportSection: React.FC<DeepPhenotypeReportSectionProps> = ({ 
  data,
  hasDeepPhenotypingData
}) => {
  if (!hasDeepPhenotypingData) {
    return (
      <Alert>
        <AlertDescription>
          No deep phenotyping data is available for this dataset.
        </AlertDescription>
      </Alert>
    );
  }

  // Count participants with deep phenotype data
  const participantsWithDeepData = data.filter(p => p.deepPhenotype).length;

  // Get participants with functional status data
  const participantsWithFunctionalStatus = data.filter(
    p => p.deepPhenotype && p.deepPhenotype.functionalStatus
  );

  // Calculate average functional status scores
  const functionalStatusScores = {
    physicalFunction: { total: 0, count: 0 },
    mobility: { total: 0, count: 0 },
    adlIndependence: { total: 0, count: 0 },
    cognitiveFunction: { total: 0, count: 0 },
    frailtyIndex: { total: 0, count: 0 }
  };

  participantsWithFunctionalStatus.forEach(p => {
    if (p.deepPhenotype.functionalStatus.physicalFunction !== undefined) {
      functionalStatusScores.physicalFunction.total += p.deepPhenotype.functionalStatus.physicalFunction;
      functionalStatusScores.physicalFunction.count++;
    }
    if (p.deepPhenotype.functionalStatus.mobility !== undefined) {
      functionalStatusScores.mobility.total += p.deepPhenotype.functionalStatus.mobility;
      functionalStatusScores.mobility.count++;
    }
    if (p.deepPhenotype.functionalStatus.adlIndependence !== undefined) {
      functionalStatusScores.adlIndependence.total += p.deepPhenotype.functionalStatus.adlIndependence;
      functionalStatusScores.adlIndependence.count++;
    }
    if (p.deepPhenotype.functionalStatus.cognitiveFunction !== undefined) {
      functionalStatusScores.cognitiveFunction.total += p.deepPhenotype.functionalStatus.cognitiveFunction;
      functionalStatusScores.cognitiveFunction.count++;
    }
    if (p.deepPhenotype.functionalStatus.frailtyIndex !== undefined) {
      functionalStatusScores.frailtyIndex.total += p.deepPhenotype.functionalStatus.frailtyIndex;
      functionalStatusScores.frailtyIndex.count++;
    }
  });

  // Calculate patient-reported outcome measures
  const patientReportedScores = {
    qualityOfLifeScore: { total: 0, count: 0 },
    patientSatisfactionScore: { total: 0, count: 0 },
    symptomBurden: { total: 0, count: 0 },
    adlScore: { total: 0, count: 0 },
    mentalHealthScore: { total: 0, count: 0 }
  };

  data.forEach(p => {
    if (p.deepPhenotype) {
      if (p.deepPhenotype.qualityOfLifeScore !== undefined) {
        patientReportedScores.qualityOfLifeScore.total += p.deepPhenotype.qualityOfLifeScore;
        patientReportedScores.qualityOfLifeScore.count++;
      }
      if (p.deepPhenotype.patientSatisfactionScore !== undefined) {
        patientReportedScores.patientSatisfactionScore.total += p.deepPhenotype.patientSatisfactionScore;
        patientReportedScores.patientSatisfactionScore.count++;
      }
      if (p.deepPhenotype.symptomBurden !== undefined) {
        patientReportedScores.symptomBurden.total += p.deepPhenotype.symptomBurden;
        patientReportedScores.symptomBurden.count++;
      }
      if (p.deepPhenotype.adlScore !== undefined) {
        patientReportedScores.adlScore.total += p.deepPhenotype.adlScore;
        patientReportedScores.adlScore.count++;
      }
      if (p.deepPhenotype.mentalHealthScore !== undefined) {
        patientReportedScores.mentalHealthScore.total += p.deepPhenotype.mentalHealthScore;
        patientReportedScores.mentalHealthScore.count++;
      }
    }
  });

  // Calculate healthcare utilization metrics
  const healthcareUtilization = {
    edVisitsPerYear: { total: 0, count: 0 },
    hospitalizationsPerYear: { total: 0, count: 0 },
    primaryCareVisitsPerYear: { total: 0, count: 0 }
  };

  data.forEach(p => {
    if (p.deepPhenotype) {
      if (p.deepPhenotype.edVisitsPerYear !== undefined) {
        healthcareUtilization.edVisitsPerYear.total += p.deepPhenotype.edVisitsPerYear;
        healthcareUtilization.edVisitsPerYear.count++;
      }
      if (p.deepPhenotype.hospitalizationsPerYear !== undefined) {
        healthcareUtilization.hospitalizationsPerYear.total += p.deepPhenotype.hospitalizationsPerYear;
        healthcareUtilization.hospitalizationsPerYear.count++;
      }
      if (p.deepPhenotype.primaryCareVisitsPerYear !== undefined) {
        healthcareUtilization.primaryCareVisitsPerYear.total += p.deepPhenotype.primaryCareVisitsPerYear;
        healthcareUtilization.primaryCareVisitsPerYear.count++;
      }
    }
  });

  // Calculate treatment-related metrics
  const treatmentMetrics = {
    medicationAdherenceRate: { total: 0, count: 0 },
    adverseDrugEventRisk: { total: 0, count: 0 },
    treatmentCompletionRate: { total: 0, count: 0 }
  };

  data.forEach(p => {
    if (p.deepPhenotype) {
      if (p.deepPhenotype.medicationAdherenceRate !== undefined) {
        treatmentMetrics.medicationAdherenceRate.total += p.deepPhenotype.medicationAdherenceRate;
        treatmentMetrics.medicationAdherenceRate.count++;
      }
      if (p.deepPhenotype.adverseDrugEventRisk !== undefined) {
        treatmentMetrics.adverseDrugEventRisk.total += p.deepPhenotype.adverseDrugEventRisk;
        treatmentMetrics.adverseDrugEventRisk.count++;
      }
      if (p.deepPhenotype.treatmentCompletionRate !== undefined) {
        treatmentMetrics.treatmentCompletionRate.total += p.deepPhenotype.treatmentCompletionRate;
        treatmentMetrics.treatmentCompletionRate.count++;
      }
    }
  });

  // Calculate averages for visualization
  const functionalStatusData = [
    { 
      name: "Physical Function", 
      value: functionalStatusScores.physicalFunction.count > 0 
        ? functionalStatusScores.physicalFunction.total / functionalStatusScores.physicalFunction.count 
        : 0 
    },
    { 
      name: "Mobility", 
      value: functionalStatusScores.mobility.count > 0 
        ? functionalStatusScores.mobility.total / functionalStatusScores.mobility.count 
        : 0 
    },
    { 
      name: "ADL Independence", 
      value: functionalStatusScores.adlIndependence.count > 0 
        ? functionalStatusScores.adlIndependence.total / functionalStatusScores.adlIndependence.count 
        : 0 
    },
    { 
      name: "Cognitive Function", 
      value: functionalStatusScores.cognitiveFunction.count > 0 
        ? functionalStatusScores.cognitiveFunction.total / functionalStatusScores.cognitiveFunction.count 
        : 0 
    },
    { 
      name: "Frailty Index", 
      value: functionalStatusScores.frailtyIndex.count > 0 
        ? functionalStatusScores.frailtyIndex.total / functionalStatusScores.frailtyIndex.count 
        : 0 
    }
  ];

  const patientReportedData = [
    { 
      name: "Quality of Life", 
      value: patientReportedScores.qualityOfLifeScore.count > 0 
        ? patientReportedScores.qualityOfLifeScore.total / patientReportedScores.qualityOfLifeScore.count 
        : 0 
    },
    { 
      name: "Patient Satisfaction", 
      value: patientReportedScores.patientSatisfactionScore.count > 0 
        ? patientReportedScores.patientSatisfactionScore.total / patientReportedScores.patientSatisfactionScore.count 
        : 0 
    },
    { 
      name: "Symptom Burden", 
      value: patientReportedScores.symptomBurden.count > 0 
        ? patientReportedScores.symptomBurden.total / patientReportedScores.symptomBurden.count 
        : 0 
    },
    { 
      name: "ADL Score", 
      value: patientReportedScores.adlScore.count > 0 
        ? patientReportedScores.adlScore.total / patientReportedScores.adlScore.count 
        : 0 
    },
    { 
      name: "Mental Health Score", 
      value: patientReportedScores.mentalHealthScore.count > 0 
        ? patientReportedScores.mentalHealthScore.total / patientReportedScores.mentalHealthScore.count 
        : 0 
    }
  ];

  const healthcareUtilizationData = [
    { 
      name: "ED Visits Per Year", 
      value: healthcareUtilization.edVisitsPerYear.count > 0 
        ? healthcareUtilization.edVisitsPerYear.total / healthcareUtilization.edVisitsPerYear.count 
        : 0 
    },
    { 
      name: "Hospitalizations Per Year", 
      value: healthcareUtilization.hospitalizationsPerYear.count > 0 
        ? healthcareUtilization.hospitalizationsPerYear.total / healthcareUtilization.hospitalizationsPerYear.count 
        : 0 
    },
    { 
      name: "Primary Care Visits Per Year", 
      value: healthcareUtilization.primaryCareVisitsPerYear.count > 0 
        ? healthcareUtilization.primaryCareVisitsPerYear.total / healthcareUtilization.primaryCareVisitsPerYear.count 
        : 0 
    }
  ];

  const treatmentMetricsData = [
    { 
      name: "Medication Adherence Rate", 
      value: treatmentMetrics.medicationAdherenceRate.count > 0 
        ? treatmentMetrics.medicationAdherenceRate.total / treatmentMetrics.medicationAdherenceRate.count 
        : 0 
    },
    { 
      name: "Adverse Drug Event Risk", 
      value: treatmentMetrics.adverseDrugEventRisk.count > 0 
        ? treatmentMetrics.adverseDrugEventRisk.total / treatmentMetrics.adverseDrugEventRisk.count 
        : 0 
    },
    { 
      name: "Treatment Completion Rate", 
      value: treatmentMetrics.treatmentCompletionRate.count > 0 
        ? treatmentMetrics.treatmentCompletionRate.total / treatmentMetrics.treatmentCompletionRate.count 
        : 0 
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Deep phenotype data available for {participantsWithDeepData} out of {data.length} participants ({Math.round((participantsWithDeepData / data.length) * 100)}%).
      </p>
      
      <Tabs defaultValue="functional">
        <TabsList className="w-full">
          <TabsTrigger value="functional">Functional Status</TabsTrigger>
          <TabsTrigger value="patient-reported">Patient-Reported</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare Utilization</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="functional" className="space-y-4">
          <div className="h-80">
            <BarChart
              data={functionalStatusData}
              index="name"
              categories={["value"]}
              valueFormatter={(value) => value.toFixed(1)}
              layout="vertical"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-sm font-medium">Physical Function</h4>
              <p className="text-2xl font-bold">
                {functionalStatusScores.physicalFunction.count > 0 
                  ? (functionalStatusScores.physicalFunction.total / functionalStatusScores.physicalFunction.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average score (0-100)</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Mobility</h4>
              <p className="text-2xl font-bold">
                {functionalStatusScores.mobility.count > 0 
                  ? (functionalStatusScores.mobility.total / functionalStatusScores.mobility.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average score (0-100)</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">ADL Independence</h4>
              <p className="text-2xl font-bold">
                {functionalStatusScores.adlIndependence.count > 0 
                  ? (functionalStatusScores.adlIndependence.total / functionalStatusScores.adlIndependence.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average score (0-100)</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Cognitive Function</h4>
              <p className="text-2xl font-bold">
                {functionalStatusScores.cognitiveFunction.count > 0 
                  ? (functionalStatusScores.cognitiveFunction.total / functionalStatusScores.cognitiveFunction.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average score (0-100)</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="patient-reported" className="space-y-4">
          <div className="h-80">
            <BarChart
              data={patientReportedData}
              index="name"
              categories={["value"]}
              valueFormatter={(value) => value.toFixed(1)}
              layout="vertical"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-sm font-medium">Quality of Life Score</h4>
              <p className="text-2xl font-bold">
                {patientReportedScores.qualityOfLifeScore.count > 0 
                  ? (patientReportedScores.qualityOfLifeScore.total / patientReportedScores.qualityOfLifeScore.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average score (0-100)</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Patient Satisfaction</h4>
              <p className="text-2xl font-bold">
                {patientReportedScores.patientSatisfactionScore.count > 0 
                  ? (patientReportedScores.patientSatisfactionScore.total / patientReportedScores.patientSatisfactionScore.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average score (0-100)</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Symptom Burden</h4>
              <p className="text-2xl font-bold">
                {patientReportedScores.symptomBurden.count > 0 
                  ? (patientReportedScores.symptomBurden.total / patientReportedScores.symptomBurden.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average score (0-100)</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Mental Health Score</h4>
              <p className="text-2xl font-bold">
                {patientReportedScores.mentalHealthScore.count > 0 
                  ? (patientReportedScores.mentalHealthScore.total / patientReportedScores.mentalHealthScore.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average score (0-100)</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="healthcare" className="space-y-4">
          <div className="h-80">
            <BarChart
              data={healthcareUtilizationData}
              index="name"
              categories={["value"]}
              valueFormatter={(value) => value.toFixed(1)}
              layout="vertical"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <h4 className="text-sm font-medium">ED Visits</h4>
              <p className="text-2xl font-bold">
                {healthcareUtilization.edVisitsPerYear.count > 0 
                  ? (healthcareUtilization.edVisitsPerYear.total / healthcareUtilization.edVisitsPerYear.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average per year</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Hospitalizations</h4>
              <p className="text-2xl font-bold">
                {healthcareUtilization.hospitalizationsPerYear.count > 0 
                  ? (healthcareUtilization.hospitalizationsPerYear.total / healthcareUtilization.hospitalizationsPerYear.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average per year</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Primary Care Visits</h4>
              <p className="text-2xl font-bold">
                {healthcareUtilization.primaryCareVisitsPerYear.count > 0 
                  ? (healthcareUtilization.primaryCareVisitsPerYear.total / healthcareUtilization.primaryCareVisitsPerYear.count).toFixed(1) 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average per year</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="treatment" className="space-y-4">
          <div className="h-80">
            <BarChart
              data={treatmentMetricsData}
              index="name"
              categories={["value"]}
              valueFormatter={(value) => value.toFixed(1) + "%"}
              layout="vertical"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <h4 className="text-sm font-medium">Medication Adherence</h4>
              <p className="text-2xl font-bold">
                {treatmentMetrics.medicationAdherenceRate.count > 0 
                  ? (treatmentMetrics.medicationAdherenceRate.total / treatmentMetrics.medicationAdherenceRate.count).toFixed(1) + "%" 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average rate</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Adverse Drug Event Risk</h4>
              <p className="text-2xl font-bold">
                {treatmentMetrics.adverseDrugEventRisk.count > 0 
                  ? (treatmentMetrics.adverseDrugEventRisk.total / treatmentMetrics.adverseDrugEventRisk.count).toFixed(1) + "%" 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average risk</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Treatment Completion</h4>
              <p className="text-2xl font-bold">
                {treatmentMetrics.treatmentCompletionRate.count > 0 
                  ? (treatmentMetrics.treatmentCompletionRate.total / treatmentMetrics.treatmentCompletionRate.count).toFixed(1) + "%" 
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Average rate</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeepPhenotypeReportSection;
