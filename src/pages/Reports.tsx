
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NoDataMessage from "@/components/NoDataMessage";
import { useToast } from "@/components/ui/use-toast";
import { exportToPDF, exportToCSV } from "@/utils/exportUtils";
import { FileText, Printer, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import refactored components
import ReportConfigSection from "@/components/ReportConfigSection";
import ReportSummarySection from "@/components/ReportSummarySection";
import ReportDemographicsSection from "@/components/ReportDemographicsSection";
import ReportClinicalSection from "@/components/ReportClinicalSection";
import ReportOutcomesSection from "@/components/ReportOutcomesSection";
import ReportVisualizationsSection from "@/components/ReportVisualizationsSection";
import ReportAnalyticsSection from "@/components/ReportAnalyticsSection";
import DeepPhenotypeReportSection from "@/components/DeepPhenotypeReportSection";

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
      
      <ReportConfigSection 
        reportSections={reportSections}
        hasDeepPhenotypingData={hasDeepPhenotypingData}
        handleSectionToggle={handleSectionToggle}
        selectedDeepPhenotypeMetrics={selectedDeepPhenotypeMetrics}
        handleDeepPhenotypeMetricToggle={handleDeepPhenotypeMetricToggle}
        exportFormat={exportFormat}
      />

      <div className="space-y-6" id="report-content">
        {/* Report Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold">SOCR-QI Health Quality Improvement Report</h1>
          <p className="text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Data Summary Section */}
        {reportSections.summary && <ReportSummarySection data={data} />}

        {/* Demographics Section */}
        {reportSections.demographics && <ReportDemographicsSection data={data} />}

        {/* Clinical Data Section */}
        {reportSections.clinical && <ReportClinicalSection data={data} />}

        {/* Outcomes Section */}
        {reportSections.outcomes && <ReportOutcomesSection data={data} />}

        {/* Visualizations Section */}
        {reportSections.visualizations && <ReportVisualizationsSection data={data} />}

        {/* Analytics Section */}
        {reportSections.analytics && <ReportAnalyticsSection data={data} />}

        {/* Deep Phenotyping Section */}
        {reportSections.deepPhenotyping && hasDeepPhenotypingData && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Deep Phenotyping Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DeepPhenotypeReportSection data={data} hasDeepPhenotypingData={hasDeepPhenotypingData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
