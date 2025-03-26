
import { useState } from "react";
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
import StatisticalAnalysis from "@/components/analytics/StatisticalAnalysis";
import RiskFactorAnalysis from "@/components/analytics/RiskFactorAnalysis";
import QualityImprovementMetrics from "@/components/analytics/QualityImprovementMetrics";
import NoDataMessage from "@/components/NoDataMessage";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { exportToPDF, exportToCSV } from "@/utils/exportUtils";
import { 
  FileText, 
  Printer, 
  Download, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon 
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  });
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  const handleSectionToggle = (section: string) => {
    setReportSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const generateReport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === "pdf") {
        await exportToPDF("report-content", "SOCR-QI_Report.pdf");
      } else {
        // For CSV export, we'll create a simplified dataset of patient outcomes
        const csvData = data.map(patient => ({
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
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6" id="report-content">
        {/* Report Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold">SOCR-QI Health Quality Improvement Report</h1>
          <p className="text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Analytics Section */}
        {reportSections.analytics && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Quantitative Analytics</h2>
            <StatisticalAnalysis />
            <RiskFactorAnalysis />
            <QualityImprovementMetrics />
          </div>
        )}

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

        {/* Visualizations Section */}
        {reportSections.visualizations && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Data Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Outcome Distribution</h3>
                  <div className="h-64">
                    <PieChart
                      data={outcomeData}
                      index="name"
                      categoryKey="value"
                      valueFormatter={(value) => `${value} patients`}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Gender Distribution</h3>
                  <div className="h-64">
                    <PieChart
                      data={genderData}
                      index="name"
                      categoryKey="value"
                      valueFormatter={(value) => `${value} patients`}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Average Length of Stay by Outcome</h3>
                  <div className="h-64">
                    <BarChart
                      data={losData}
                      index="group"
                      categories={["value"]}
                      valueFormatter={(value) => `${value} days`}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Risk Score by Condition</h3>
                  <div className="h-64">
                    <BarChart
                      data={riskByConditionData}
                      index="condition"
                      categories={["avgRisk"]}
                      valueFormatter={(value) => `${value}`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Footer */}
        <div className="border-t pt-4 text-sm text-gray-500 text-center">
          <p>Report generated by SOCR-QI Health Quality Improvement Application</p>
          <p>&copy; {new Date().getFullYear()} SOCR - Statistics Online Computational Resource</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
