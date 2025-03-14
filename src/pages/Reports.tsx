
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
import NoDataMessage from "@/components/NoDataMessage";
import { useToast } from "@/components/ui/use-toast";

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

  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  const handleSectionToggle = (section: string) => {
    setReportSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const generateReport = () => {
    // In a real application, this would generate a PDF or HTML report
    toast({
      title: "Report Generation",
      description: "Report generation functionality would export the selected sections as PDF or HTML in a real application.",
    });
    
    // Here we're just showing what would be included
    const sections = Object.entries(reportSections)
      .filter(([_, included]) => included)
      .map(([section]) => section);
    
    console.log("Generating report with sections:", sections);
    console.log("Data included in report:", data.length, "participants");
    
    // In a real implementation, we would use a library like jsPDF, html2canvas,
    // or a server-side generation service to create the actual report
  };

  const printReport = () => {
    window.print();
  };
  
  // Helper function to find the best performing unit
  const getBestPerformingUnit = () => {
    return data.reduce((prev, current) => {
      const prevCount = data.filter(p => p.unit === prev && p.outcome === "Improved").length / 
                      data.filter(p => p.unit === prev).length;
      const currCount = data.filter(p => p.unit === current.unit && p.outcome === "Improved").length / 
                      data.filter(p => p.unit === current.unit).length;
      return prevCount > currCount ? prev : current.unit;
    }, data[0].unit);
  };
  
  // Helper function to get the condition with the longest average length of stay
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
  
  // Calculate average length of stay for improved patients
  const getAvgLOSImproved = () => {
    const improvedPatients = data.filter(p => p.outcome === "Improved");
    return improvedPatients.length > 0 
      ? Math.round(improvedPatients.reduce((sum, p) => sum + p.lengthOfStay, 0) / improvedPatients.length)
      : 0;
  };
  
  // Calculate average length of stay for non-improved patients
  const getAvgLOSNonImproved = () => {
    const nonImprovedPatients = data.filter(p => p.outcome !== "Improved");
    return nonImprovedPatients.length > 0 
      ? Math.round(nonImprovedPatients.reduce((sum, p) => sum + p.lengthOfStay, 0) / nonImprovedPatients.length)
      : 0;
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printReport}>
            Print
          </Button>
          <Button onClick={generateReport}>
            Export Report
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

        {/* Analytics Insights Section */}
        {reportSections.analytics && (
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Analytical Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Key Findings</h3>
                  <ul className="mt-2 space-y-2 text-sm list-disc pl-5">
                    <li>
                      There appears to be a correlation between higher risk scores and longer lengths of stay, 
                      suggesting that early risk assessment may help predict resource needs.
                    </li>
                    <li>
                      Patients in the {getBestPerformingUnit()} unit showed the highest improvement rates.
                    </li>
                    <li>
                      The average length of stay for improved patients is {getAvgLOSImproved()} days, 
                      compared to {getAvgLOSNonImproved()} days for others.
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Quality Improvement Recommendations</h3>
                  <ul className="mt-2 space-y-2 text-sm list-disc pl-5">
                    <li>
                      Implement standardized risk assessment procedures across all units to identify high-risk patients early.
                    </li>
                    <li>
                      Investigate successful practices in the {getBestPerformingUnit()} unit for potential implementation in other units.
                    </li>
                    <li>
                      Focus on reducing length of stay for {getLongestStayCondition()} patients through standardized care pathways.
                    </li>
                  </ul>
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
