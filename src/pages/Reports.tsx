import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import NoDataMessage from "@/components/NoDataMessage";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { exportToPDF, exportToCSV } from "@/utils/exportUtils";
import { 
  FileText, 
  Printer, 
  Download, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  Activity 
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Reports = () => {
  const { data, isDataLoaded } = useData();
  const { toast } = useToast();
  const [reportSections, setReportSections] = useState({
    summary: true,
    demographics: true,
    clinical: true,
    outcomes: true,
    visualizations: true,
    analytics: true,
    deepPhenotyping: true
  });
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [hasDeepPhenotypingData, setHasDeepPhenotypingData] = useState(false);
  const [selectedDeepPhenotypeMetrics, setSelectedDeepPhenotypeMetrics] = useState<string[]>([
    "qualityOfLifeScore",
    "patientSatisfactionScore",
    "symptomBurden",
    "functionalStatus"
  ]);

  useEffect(() => {
    // Check if deep phenotyping data is available
    if (isDataLoaded && data.length > 0) {
      setHasDeepPhenotypingData(data.some(participant => participant.deepPhenotype));
    }
  }, [data, isDataLoaded]);

  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  const handleSectionToggle = (section: string) => {
    setReportSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleDeepPhenotypeMetricToggle = (metric: string) => {
    if (selectedDeepPhenotypeMetrics.includes(metric)) {
      setSelectedDeepPhenotypeMetrics(selectedDeepPhenotypeMetrics.filter(m => m !== metric));
    } else {
      setSelectedDeepPhenotypeMetrics([...selectedDeepPhenotypeMetrics, metric]);
    }
  };

  const generateReport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === "pdf") {
        await exportToPDF("report-content", "SOCR-QI_Report.pdf");
      } else {
        // For CSV export, we'll create a simplified dataset including deep phenotyping if available
        let csvData;
        
        if (hasDeepPhenotypingData) {
          csvData = data.map(patient => {
            const baseData = {
              id: patient.id,
              gender: patient.gender,
              age: patient.age,
              condition: patient.condition,
              unit: patient.unit,
              riskScore: patient.riskScore,
              lengthOfStay: patient.lengthOfStay,
              readmissionRisk: patient.readmissionRisk,
              outcome: patient.outcome
            };
            
            // Add deep phenotype data if available
            if (patient.deepPhenotype) {
              const deepData: Record<string, any> = {};
              
              if (selectedDeepPhenotypeMetrics.includes('qualityOfLifeScore')) {
                deepData.qualityOfLifeScore = patient.deepPhenotype.qualityOfLifeScore;
              }
              
              if (selectedDeepPhenotypeMetrics.includes('patientSatisfactionScore')) {
                deepData.patientSatisfactionScore = patient.deepPhenotype.patientSatisfactionScore;
              }
              
              if (selectedDeepPhenotypeMetrics.includes('symptomBurden')) {
                deepData.symptomBurden = patient.deepPhenotype.symptomBurden;
              }
              
              if (selectedDeepPhenotypeMetrics.includes('adlScore')) {
                deepData.adlScore = patient.deepPhenotype.adlScore;
              }
              
              if (selectedDeepPhenotypeMetrics.includes('mentalHealthScore')) {
                deepData.mentalHealthScore = patient.deepPhenotype.mentalHealthScore;
              }
              
              if (selectedDeepPhenotypeMetrics.includes('functionalStatus') && patient.deepPhenotype.functionalStatus) {
                deepData.physicalFunction = patient.deepPhenotype.functionalStatus.physicalFunction;
                deepData.mobility = patient.deepPhenotype.functionalStatus.mobility;
                deepData.adlIndependence = patient.deepPhenotype.functionalStatus.adlIndependence;
                deepData.cognitiveFunction = patient.deepPhenotype.functionalStatus.cognitiveFunction;
                deepData.frailtyIndex = patient.deepPhenotype.functionalStatus.frailtyIndex;
              }
              
              return { ...baseData, ...deepData };
            }
            
            return baseData;
          });
        } else {
          csvData = data.map(patient => ({
            id: patient.id,
            gender: patient.gender,
            age: patient.age,
            condition: patient.condition,
            unit: patient.unit,
            riskScore: patient.riskScore,
            lengthOfStay: patient.lengthOfStay,
            readmissionRisk: patient.readmissionRisk,
            outcome: patient.outcome
          }));
        }
        
        exportToCSV(csvData, "SOCR-QI_Data.csv");
      }
      
      toast({
        title: "Report Generated",
        description: `Report has been ${exportFormat === "pdf" ? "saved as PDF" : "exported as CSV"} successfully.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const printReport = () => {
    window.print();
  };
  
  // Helper functions for analytics
  const getBestPerformingUnit = () => {
    return data.reduce((prev, current) => {
      const prevCount = data.filter(p => p.unit === prev && p.outcome === "Improved").length / 
                      data.filter(p => p.unit === prev).length;
      const currCount = data.filter(p => p.unit === current.unit && p.outcome === "Improved").length / 
                      data.filter(p => p.unit === current.unit).length;
      return prevCount > currCount ? prev : current.unit;
    }, data[0].unit);
  };
  
  const getLongestStayCondition = () => {
    const avgLOSByCondition = Object.entries(data.reduce((acc, p) => {
      if (!acc[p.condition]) {
        acc[p.condition] = { total: 0, count: 0 };
      }
      acc[p.condition].total += p.lengthOfStay;
      acc[p.condition].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>))
      .map(([condition, data]) => ({ 
        condition, 
        avgLOS: data.total / data.count 
      }))
      .sort((a, b) => b.avgLOS - a.avgLOS);
    
    return avgLOSByCondition.length > 0 ? avgLOSByCondition[0].condition : "N/A";
  };
  
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
  
  // Helper function to safely access nested properties
  const safelyGetNestedValue = (obj: any, path: string) => {
    try {
      return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    } catch (e) {
      return undefined;
    }
  };
  
  // Calculate deep phenotype metrics if available
  const getDeepPhenotypeMetrics = () => {
    if (!hasDeepPhenotypingData) return null;
    
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
        
        if (fs.frailtyIndex !== undefined) {
          if (!acc.frailtyIndex) acc.frailtyIndex = { total: 0, count: 0 };
          acc.frailtyIndex.total += fs.frailtyIndex;
          acc.frailtyIndex.count++;
        }
      }
      return acc;
    }, {} as Record<string, { total: number, count: number }>);
    
    return {
      qualityOfLifeByUnit: Object.entries(qualityOfLifeByUnit).map(([unit, data]) => ({
        unit,
        value: (data.total / data.count).toFixed(1)
      })),
      satisfactionByOutcome: Object.entries(satisfactionByOutcome).map(([outcome, data]) => ({
        outcome,
        value: (data.total / data.count).toFixed(1)
      })),
      functionalStatus: {
        avgPhysicalFunction: functionalStatusMetrics.physicalFunction ? 
          (functionalStatusMetrics.physicalFunction.total / functionalStatusMetrics.physicalFunction.count).toFixed(1) : "N/A",
        avgMobility: functionalStatusMetrics.mobility ? 
          (functionalStatusMetrics.mobility.total / functionalStatusMetrics.mobility.count).toFixed(1) : "N/A",
        avgFrailty: functionalStatusMetrics.frailtyIndex ? 
          (functionalStatusMetrics.frailtyIndex.total / functionalStatusMetrics.frailtyIndex.count).toFixed(1) : "N/A"
      }
    };
  };

  // Prepare visualization data
  const outcomeData = Object.entries(data.reduce((acc, p) => {
    acc[p.outcome] = (acc[p.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  const genderData = Object.entries(data.reduce((acc, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  const losData = [
    { group: "Improved", value: getAvgLOSImproved() },
    { group: "Non-Improved", value: getAvgLOSNonImproved() }
  ];

  const riskByConditionData = Array.from(
    new Set(data.map(p => p.condition))
  ).map(condition => {
    const patientsWithCondition = data.filter(p => p.condition === condition);
    const avgRisk = patientsWithCondition.reduce((sum, p) => sum + p.riskScore, 0) / patientsWithCondition.length;
    return {
      condition,
      avgRisk: parseFloat(avgRisk.toFixed(1))
    };
  });

  // Prepare deep phenotype visualization data if available
  const deepPhenotypeData = hasDeepPhenotypingData ? {
    qualityOfLife: data
      .filter(p => p.deepPhenotype?.qualityOfLifeScore !== undefined)
      .map(p => ({
        unit: p.unit,
        value: p.deepPhenotype!.qualityOfLifeScore
      }))
      .reduce((acc, { unit, value }) => {
        if (!acc[unit]) {
          acc[unit] = { total: 0, count: 0 };
        }
        acc[unit].total += value;
        acc[unit].count++;
        return acc;
      }, {} as Record<string, { total: number, count: number }>),
    
    patientSatisfaction: data
      .filter(p => p.deepPhenotype?.patientSatisfactionScore !== undefined)
      .map(p => ({
        outcome: p.outcome,
        value: p.deepPhenotype!.patientSatisfactionScore
      }))
      .reduce((acc, { outcome, value }) => {
        if (!acc[outcome]) {
          acc[outcome] = { total: 0, count: 0 };
        }
        acc[outcome].total += value;
        acc[outcome].count++;
        return acc;
      }, {} as Record<string, { total: number, count: number }>)
  } : null;

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printReport} className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Select 
            value={exportFormat} 
            onValueChange={(value: "pdf" | "csv") => setExportFormat(value)}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generateReport} 
            disabled={isExporting}
            className="flex items-center gap-1"
          >
            {isExporting ? (
              <span>Exporting...</span>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
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

      <div className="space-y-6" id="report-content">
        {/* Report Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold">SOCR-QI Health Quality Improvement Report</h1>
          <p className="text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Data Summary Section */}
        {reportSections.summary && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium">Dataset Overview</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Total Participants: {data.length}</li>
                    <li>Data Collection Period: {new Date().toLocaleDateString()}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Clinical Units</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {Array.from(new Set(data.map(p => p.unit))).map(unit => (
                      <li key={unit}>{unit}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Conditions</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {Array.from(new Set(data.map(p => p.condition))).map(condition => (
                      <li key={condition}>{condition}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demographics Section */}
        {reportSections.demographics && (
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
                      Age Range: {Math.min(...data.map(p => p.age))} - {Math.max(...data.map(p => p.age))} years
                    </p>
                    <p className="text-sm">
                      Average Age: {Math.round(data.reduce((sum, p) => sum + p.age, 0) / data.length)} years
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Gender Distribution</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(data.reduce((acc, p) => {
                      acc[p.gender] = (acc[p.gender] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)).map(([gender, count]) => (
                      <p key={gender}>
                        {gender}: {count} ({Math.round((count / data.length) * 100)}%)
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinical Data Section */}
        {reportSections.clinical && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Clinical Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Condition Distribution</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(data.reduce((acc, p) => {
                      acc[p.condition] = (acc[p.condition] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)).map(([condition, count]) => (
                      <p key={condition}>
                        {condition}: {count} ({Math.round((count / data.length) * 100)}%)
                      </p>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Unit Distribution</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(data.reduce((acc, p) => {
                      acc[p.unit] = (acc[p.unit] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)).map(([unit, count]) => (
                      <p key={unit}>
                        {unit}: {count} ({Math.round((count / data.length) * 100)}%)
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Risk Scores</h3>
                  <div className="mt-2">
                    <p className="text-sm">
                      Average Risk Score: {Math.round(data.reduce((sum, p) => sum + p.riskScore, 0) / data.length)}
                    </p>
                    <p className="text-sm">
                      High Risk Patients (Score &gt; 70): {data.filter(p => p.riskScore > 70).length} 
                      ({Math.round((data.filter(p => p.riskScore > 70).length / data.length) * 100)}%)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Outcomes Section */}
        {reportSections.outcomes && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Outcome Distribution</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(data.reduce((acc, p) => {
                      acc[p.outcome] = (acc[p.outcome] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)).map(([outcome, count]) => (
                      <p key={outcome}>
                        {outcome}: {count} ({Math.round((count / data.length) * 100)}%)
                      </p>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Length of Stay</h3>
                  <div className="mt-2">
                    <p className="text-sm">
                      Average Length of Stay: {Math.round(data.reduce((sum, p) => sum + p.lengthOfStay, 0) / data.length)} days
                    </p>
                    <p className="text-sm">
                      Range: {Math.min(...data.map(p => p.lengthOfStay))} - {Math.max(...data.map(p => p.lengthOfStay))} days
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Readmission Risk</h3>
                  <div className="mt-2">
                    <p className="text-sm">
                      Average Readmission Risk: {Math.round(data.reduce((sum, p) => sum + p.readmissionRisk, 0) / data.length)}%
                    </p>
                    <p className="text-sm">
                      High Readmission Risk (&gt; 50%): {data.filter(p => p.readmissionRisk > 50).length} patients
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deep Phenotyping Section */}
        {reportSections.deepPhenotyping && hasDeepPhenotypingData && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Deep Phenotyping Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="patientReported">
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
                                }.toFixed(1)
                              </p>
                              
                              <div className="h-48">
                                <BarChart
                                  data={Object.entries(deepPhenotypeData?.qualityOfLife || {}).map(([unit, data]) => ({
                                    name: unit,
                                    value: parseFloat((data.total / data.count).toFixed(1))
                                  }))}
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
                                Average Patient Satisfaction Score: {
                                  data
                                    .filter(p => p.deepPhenotype?.patientSatisfactionScore !== undefined)
                                    .reduce((sum, p) => sum + p.deepPhenotype!.patientSatisfactionScore, 0) / 
                                    data.filter(p => p.deepPhenotype?.patientSatisfactionScore !== undefined).length
                                }.toFixed(1)
                              </p>
                              
                              <div className="h-48">
                                <BarChart
                                  data={Object.entries(deepPhenotypeData?.patientSatisfaction || {}).map(([outcome, data]) => ({
                                    name: outcome,
                                    value: parseFloat((data.total / data.count).toFixed(1))
                                  }))}
                                  index="name"
                                  categories={["value"]}
                                  valueFormatter={(value) => `${value}`}
                                  colors={["blue"]}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="symptom">
                          <AccordionTrigger>Symptom Burden</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3">
                              <p className="text-sm">
                                Average Symptom Burden: {
                                  data
                                    .filter(p => p.deepPhenotype?.symptomBurden !== undefined)
                                    .reduce((sum, p) => sum + p.deepPhenotype!.symptomBurden, 0) / 
                                    data.filter(p => p.deepPhenotype?.symptomBurden !== undefined).length
                                }.toFixed(1)
                              </p>
                              
                              <p className="text-sm">
                                Patients with High Symptom Burden (&gt; 70): {
                                  data.filter(p => p.deepPhenotype?.symptomBurden !== undefined &&
