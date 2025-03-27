
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "@/components/ui/charts/BarChart";

// Helper to safely access nested properties
const getNestedValue = (obj: any, path: string) => {
  try {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  } catch (e) {
    return undefined;
  }
};

interface DeepPhenotypeReportSectionProps {
  data: any[];
  hasDeepPhenotypingData: boolean;
}

const DeepPhenotypeReportSection: React.FC<DeepPhenotypeReportSectionProps> = ({
  data,
  hasDeepPhenotypingData
}) => {
  if (!hasDeepPhenotypingData) {
    return null;
  }

  // Calculate deep phenotype metrics
  const getDeepPhenotypeMetrics = () => {
    // Quality of life score by unit
    const qualityOfLifeByUnit = data.reduce((acc, p) => {
      if (p.deepPhenotype?.qualityOfLifeScore !== undefined) {
        const unit = p.unit;
        if (!acc[unit]) {
          acc[unit] = { total: 0, count: 0 };
        }
        acc[unit].total += p.deepPhenotype.qualityOfLifeScore;
        acc[unit].count++;
      }
      return acc;
    }, {} as Record<string, { total: number, count: number }>);
    
    // Patient satisfaction by outcome
    const satisfactionByOutcome = data.reduce((acc, p) => {
      if (p.deepPhenotype?.patientSatisfactionScore !== undefined) {
        const outcome = p.outcome;
        if (!acc[outcome]) {
          acc[outcome] = { total: 0, count: 0 };
        }
        acc[outcome].total += p.deepPhenotype.patientSatisfactionScore;
        acc[outcome].count++;
      }
      return acc;
    }, {} as Record<string, { total: number, count: number }>);
    
    // Symptom burden by condition
    const symptomBurdenByCondition = data.reduce((acc, p) => {
      if (p.deepPhenotype?.symptomBurden !== undefined) {
        const condition = p.condition;
        if (!acc[condition]) {
          acc[condition] = { total: 0, count: 0 };
        }
        acc[condition].total += p.deepPhenotype.symptomBurden;
        acc[condition].count++;
      }
      return acc;
    }, {} as Record<string, { total: number, count: number }>);
    
    // Functional status metrics
    const functionalStatusMetrics = data.reduce((acc, p) => {
      if (p.deepPhenotype?.functionalStatus) {
        const fs = p.deepPhenotype.functionalStatus;
        
        if (fs.physicalFunction !== undefined) {
          if (!acc.physicalFunction) acc.physicalFunction = { total: 0, count: 0 };
          acc.physicalFunction.total += fs.physicalFunction;
          acc.physicalFunction.count++;
        }
        
        if (fs.mobility !== undefined) {
          if (!acc.mobility) acc.mobility = { total: 0, count: 0 };
          acc.mobility.total += fs.mobility;
          acc.mobility.count++;
        }
        
        if (fs.adlIndependence !== undefined) {
          if (!acc.adlIndependence) acc.adlIndependence = { total: 0, count: 0 };
          acc.adlIndependence.total += fs.adlIndependence;
          acc.adlIndependence.count++;
        }
        
        if (fs.cognitiveFunction !== undefined) {
          if (!acc.cognitiveFunction) acc.cognitiveFunction = { total: 0, count: 0 };
          acc.cognitiveFunction.total += fs.cognitiveFunction;
          acc.cognitiveFunction.count++;
        }
        
        if (fs.frailtyIndex !== undefined) {
          if (!acc.frailtyIndex) acc.frailtyIndex = { total: 0, count: 0 };
          acc.frailtyIndex.total += fs.frailtyIndex;
          acc.frailtyIndex.count++;
        }
      }
      return acc;
    }, {} as Record<string, { total: number, count: number }>);
    
    // Disease-specific measures
    const diseaseSpecificMeasures = data.reduce((acc, p) => {
      if (p.deepPhenotype?.diseaseSpecificMeasures) {
        const dsm = p.deepPhenotype.diseaseSpecificMeasures;
        
        if (dsm.hba1c !== undefined) {
          if (!acc.hba1c) acc.hba1c = { total: 0, count: 0 };
          acc.hba1c.total += dsm.hba1c;
          acc.hba1c.count++;
        }
        
        if (dsm.lipidProfileLDL !== undefined) {
          if (!acc.lipidProfileLDL) acc.lipidProfileLDL = { total: 0, count: 0 };
          acc.lipidProfileLDL.total += dsm.lipidProfileLDL;
          acc.lipidProfileLDL.count++;
        }
        
        if (dsm.lipidProfileHDL !== undefined) {
          if (!acc.lipidProfileHDL) acc.lipidProfileHDL = { total: 0, count: 0 };
          acc.lipidProfileHDL.total += dsm.lipidProfileHDL;
          acc.lipidProfileHDL.count++;
        }
        
        if (dsm.depressionPHQ9 !== undefined) {
          if (!acc.depressionPHQ9) acc.depressionPHQ9 = { total: 0, count: 0 };
          acc.depressionPHQ9.total += dsm.depressionPHQ9;
          acc.depressionPHQ9.count++;
        }
      }
      return acc;
    }, {} as Record<string, { total: number, count: number }>);
    
    // Healthcare utilization
    const healthcareUtilization = data.reduce((acc, p) => {
      if (p.deepPhenotype) {
        if (p.deepPhenotype.edVisitsPerYear !== undefined) {
          if (!acc.edVisits) acc.edVisits = { total: 0, count: 0 };
          acc.edVisits.total += p.deepPhenotype.edVisitsPerYear;
          acc.edVisits.count++;
        }
        
        if (p.deepPhenotype.hospitalizationsPerYear !== undefined) {
          if (!acc.hospitalizations) acc.hospitalizations = { total: 0, count: 0 };
          acc.hospitalizations.total += p.deepPhenotype.hospitalizationsPerYear;
          acc.hospitalizations.count++;
        }
        
        if (p.deepPhenotype.primaryCareVisitsPerYear !== undefined) {
          if (!acc.primaryCareVisits) acc.primaryCareVisits = { total: 0, count: 0 };
          acc.primaryCareVisits.total += p.deepPhenotype.primaryCareVisitsPerYear;
          acc.primaryCareVisits.count++;
        }
      }
      return acc;
    }, {} as Record<string, { total: number, count: number }>);
    
    return {
      qualityOfLifeByUnit: Object.entries(qualityOfLifeByUnit).map(([unit, data]) => ({
        name: unit,
        value: parseFloat((data.total / data.count).toFixed(1))
      })),
      satisfactionByOutcome: Object.entries(satisfactionByOutcome).map(([outcome, data]) => ({
        name: outcome,
        value: parseFloat((data.total / data.count).toFixed(1))
      })),
      symptomBurdenByCondition: Object.entries(symptomBurdenByCondition).map(([condition, data]) => ({
        name: condition,
        value: parseFloat((data.total / data.count).toFixed(1))
      })),
      functionalStatus: {
        metrics: Object.entries(functionalStatusMetrics).map(([metric, data]) => ({
          name: metric,
          value: parseFloat((data.total / data.count).toFixed(1))
        })),
        avgPhysicalFunction: functionalStatusMetrics.physicalFunction ? 
          (functionalStatusMetrics.physicalFunction.total / functionalStatusMetrics.physicalFunction.count).toFixed(1) : "N/A",
        avgMobility: functionalStatusMetrics.mobility ? 
          (functionalStatusMetrics.mobility.total / functionalStatusMetrics.mobility.count).toFixed(1) : "N/A",
        avgAdlIndependence: functionalStatusMetrics.adlIndependence ? 
          (functionalStatusMetrics.adlIndependence.total / functionalStatusMetrics.adlIndependence.count).toFixed(1) : "N/A",
        avgCognitiveFunction: functionalStatusMetrics.cognitiveFunction ? 
          (functionalStatusMetrics.cognitiveFunction.total / functionalStatusMetrics.cognitiveFunction.count).toFixed(1) : "N/A", 
        avgFrailty: functionalStatusMetrics.frailtyIndex ? 
          (functionalStatusMetrics.frailtyIndex.total / functionalStatusMetrics.frailtyIndex.count).toFixed(1) : "N/A"
      },
      diseaseSpecificMeasures: {
        metrics: Object.entries(diseaseSpecificMeasures).map(([metric, data]) => ({
          name: metric,
          value: parseFloat((data.total / data.count).toFixed(1))
        }))
      },
      healthcareUtilization: {
        metrics: Object.entries(healthcareUtilization).map(([metric, data]) => ({
          name: metric,
          value: parseFloat((data.total / data.count).toFixed(1))
        }))
      }
    };
  };

  const metrics = getDeepPhenotypeMetrics();

  return (
    <Tabs defaultValue="patientReported" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="patientReported">Patient-Reported</TabsTrigger>
        <TabsTrigger value="functional">Functional Status</TabsTrigger>
        <TabsTrigger value="healthcare">Healthcare Utilization</TabsTrigger>
        <TabsTrigger value="diseaseSpecific">Disease-Specific</TabsTrigger>
      </TabsList>
      
      <TabsContent value="patientReported" className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Patient-Reported Outcomes</h3>
          <div className="space-y-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="qol">
                <AccordionTrigger>Quality of Life Scores</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Average Quality of Life Score: {
                        data
                          .filter(p => p.deepPhenotype?.qualityOfLifeScore !== undefined)
                          .reduce((sum, p) => sum + p.deepPhenotype!.qualityOfLifeScore, 0) / 
                          data.filter(p => p.deepPhenotype?.qualityOfLifeScore !== undefined).length
                      }
                    </p>
                    
                    <div className="h-48">
                      <BarChart
                        data={metrics.qualityOfLifeByUnit}
                        index="name"
                        categories={["value"]}
                        valueFormatter={(value) => `${value}`}
                        colors={["green"]}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="satisfaction">
                <AccordionTrigger>Patient Satisfaction</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Average Patient Satisfaction: {
                        data
                          .filter(p => p.deepPhenotype?.patientSatisfactionScore !== undefined)
                          .reduce((sum, p) => sum + p.deepPhenotype!.patientSatisfactionScore, 0) / 
                          data.filter(p => p.deepPhenotype?.patientSatisfactionScore !== undefined).length
                      }
                    </p>
                    
                    <div className="h-48">
                      <BarChart
                        data={metrics.satisfactionByOutcome}
                        index="name"
                        categories={["value"]}
                        valueFormatter={(value) => `${value}`}
                        colors={["blue"]}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="symptoms">
                <AccordionTrigger>Symptom Burden</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Average Symptom Burden: {
                        data
                          .filter(p => p.deepPhenotype?.symptomBurden !== undefined)
                          .reduce((sum, p) => sum + p.deepPhenotype!.symptomBurden, 0) / 
                          data.filter(p => p.deepPhenotype?.symptomBurden !== undefined).length
                      }
                    </p>
                    
                    <div className="h-48">
                      <BarChart
                        data={metrics.symptomBurdenByCondition}
                        index="name"
                        categories={["value"]}
                        valueFormatter={(value) => `${value}`}
                        colors={["orange"]}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="functional" className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Functional Status Measures</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border rounded-md">
              <h4 className="font-medium mb-2">Physical Function</h4>
              <p className="text-2xl font-bold">{metrics.functionalStatus.avgPhysicalFunction}</p>
              <p className="text-sm text-gray-500">Average score across participants</p>
            </div>
            <div className="p-4 border rounded-md">
              <h4 className="font-medium mb-2">Mobility</h4>
              <p className="text-2xl font-bold">{metrics.functionalStatus.avgMobility}</p>
              <p className="text-sm text-gray-500">Average score across participants</p>
            </div>
            <div className="p-4 border rounded-md">
              <h4 className="font-medium mb-2">ADL Independence</h4>
              <p className="text-2xl font-bold">{metrics.functionalStatus.avgAdlIndependence}</p>
              <p className="text-sm text-gray-500">Average score across participants</p>
            </div>
            <div className="p-4 border rounded-md">
              <h4 className="font-medium mb-2">Cognitive Function</h4>
              <p className="text-2xl font-bold">{metrics.functionalStatus.avgCognitiveFunction}</p>
              <p className="text-sm text-gray-500">Average score across participants</p>
            </div>
          </div>
          
          <div className="h-60">
            <BarChart
              data={metrics.functionalStatus.metrics}
              index="name"
              categories={["value"]}
              valueFormatter={(value) => `${value}`}
              colors={["indigo"]}
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="healthcare" className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Healthcare Utilization</h3>
          <div className="h-60">
            <BarChart
              data={metrics.healthcareUtilization.metrics}
              index="name" 
              categories={["value"]}
              valueFormatter={(value) => `${value}`}
              colors={["purple"]}
            />
          </div>
          
          <div className="mt-4 space-y-4">
            {metrics.healthcareUtilization.metrics.map((metric) => (
              <div key={metric.name} className="p-4 border rounded-md">
                <h4 className="font-medium mb-1">{metric.name === "edVisits" ? "ED Visits" : 
                                                metric.name === "hospitalizations" ? "Hospitalizations" : 
                                                "Primary Care Visits"}</h4>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-gray-500">Average per year across participants</p>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="diseaseSpecific" className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Disease-Specific Measures</h3>
          <div className="h-60">
            <BarChart
              data={metrics.diseaseSpecificMeasures.metrics}
              index="name"
              categories={["value"]}
              valueFormatter={(value) => `${value}`}
              colors={["teal"]}
            />
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.diseaseSpecificMeasures.metrics.map((metric) => (
              <div key={metric.name} className="p-4 border rounded-md">
                <h4 className="font-medium mb-1">
                  {metric.name === "hba1c" ? "HbA1c" : 
                   metric.name === "lipidProfileLDL" ? "LDL Cholesterol" : 
                   metric.name === "lipidProfileHDL" ? "HDL Cholesterol" : 
                   "Depression PHQ-9"}
                </h4>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-gray-500">Average value across participants</p>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DeepPhenotypeReportSection;
