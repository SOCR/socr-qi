
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReportConfigSectionProps {
  reportSections: {
    summary: boolean;
    demographics: boolean;
    clinical: boolean;
    outcomes: boolean;
    visualizations: boolean;
    analytics: boolean;
    deepPhenotyping: boolean;
  };
  hasDeepPhenotypingData: boolean;
  handleSectionToggle: (section: string) => void;
  selectedDeepPhenotypeMetrics: string[];
  handleDeepPhenotypeMetricToggle: (metric: string) => void;
  exportFormat: "pdf" | "csv";
}

const ReportConfigSection: React.FC<ReportConfigSectionProps> = ({
  reportSections,
  hasDeepPhenotypingData,
  handleSectionToggle,
  selectedDeepPhenotypeMetrics,
  handleDeepPhenotypeMetricToggle,
  exportFormat
}) => {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader className="print:pb-2">
        <CardTitle>Report Configuration</CardTitle>
        <CardDescription className="print:hidden">
          Select which sections to include in your report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="summary" 
              checked={reportSections.summary}
              onCheckedChange={() => handleSectionToggle("summary")}
            />
            <Label htmlFor="summary">Data Summary</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="demographics" 
              checked={reportSections.demographics}
              onCheckedChange={() => handleSectionToggle("demographics")}
            />
            <Label htmlFor="demographics">Demographics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="clinical" 
              checked={reportSections.clinical}
              onCheckedChange={() => handleSectionToggle("clinical")}
            />
            <Label htmlFor="clinical">Clinical Data</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="outcomes" 
              checked={reportSections.outcomes}
              onCheckedChange={() => handleSectionToggle("outcomes")}
            />
            <Label htmlFor="outcomes">Outcomes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="visualizations" 
              checked={reportSections.visualizations}
              onCheckedChange={() => handleSectionToggle("visualizations")}
            />
            <Label htmlFor="visualizations">Visualizations</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="analytics" 
              checked={reportSections.analytics}
              onCheckedChange={() => handleSectionToggle("analytics")}
            />
            <Label htmlFor="analytics">Analytics</Label>
          </div>
          {hasDeepPhenotypingData && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="deepPhenotyping" 
                checked={reportSections.deepPhenotyping}
                onCheckedChange={() => handleSectionToggle("deepPhenotyping")}
              />
              <Label htmlFor="deepPhenotyping">Deep Phenotyping</Label>
            </div>
          )}
        </div>
        
        {hasDeepPhenotypingData && reportSections.deepPhenotyping && exportFormat === "csv" && (
          <div className="mt-4 print:hidden">
            <Label className="block mb-2">Select Deep Phenotype Metrics for CSV Export</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="quality-of-life" 
                  checked={selectedDeepPhenotypeMetrics.includes("qualityOfLifeScore")}
                  onCheckedChange={() => handleDeepPhenotypeMetricToggle("qualityOfLifeScore")}
                />
                <Label htmlFor="quality-of-life">Quality of Life</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="patient-satisfaction" 
                  checked={selectedDeepPhenotypeMetrics.includes("patientSatisfactionScore")}
                  onCheckedChange={() => handleDeepPhenotypeMetricToggle("patientSatisfactionScore")}
                />
                <Label htmlFor="patient-satisfaction">Patient Satisfaction</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="symptom-burden" 
                  checked={selectedDeepPhenotypeMetrics.includes("symptomBurden")}
                  onCheckedChange={() => handleDeepPhenotypeMetricToggle("symptomBurden")}
                />
                <Label htmlFor="symptom-burden">Symptom Burden</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="adl-score" 
                  checked={selectedDeepPhenotypeMetrics.includes("adlScore")}
                  onCheckedChange={() => handleDeepPhenotypeMetricToggle("adlScore")}
                />
                <Label htmlFor="adl-score">ADL Score</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mental-health" 
                  checked={selectedDeepPhenotypeMetrics.includes("mentalHealthScore")}
                  onCheckedChange={() => handleDeepPhenotypeMetricToggle("mentalHealthScore")}
                />
                <Label htmlFor="mental-health">Mental Health</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="functional-status" 
                  checked={selectedDeepPhenotypeMetrics.includes("functionalStatus")}
                  onCheckedChange={() => handleDeepPhenotypeMetricToggle("functionalStatus")}
                />
                <Label htmlFor="functional-status">Functional Status</Label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportConfigSection;
