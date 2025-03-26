
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { LineChart } from "@/components/ui/charts/LineChart";
import MultiParticipantChartControls from "@/components/MultiParticipantChartControls";
import { useParticipantTimeSeriesData } from "@/hooks/useParticipantTimeSeriesData";
import { ChartTooltip } from "@/components/ChartTooltip";

const ParticipantTimeSeriesChart = () => {
  const { data } = useData();
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("vitals");
  const [compareToConditionMean, setCompareToConditionMean] = useState(false);
  const [compareToUnitMean, setCompareToUnitMean] = useState(false);
  const [showConfidenceBands, setShowConfidenceBands] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  
  // Get the time series data for selected participants
  const timeSeriesData = useParticipantTimeSeriesData(data, {
    selectedParticipantIds,
    compareToConditionMean,
    compareToUnitMean,
    showConfidenceBands,
    selectedConditions,
    selectedUnits
  });

  // Define chart categories based on selected metric
  const getChartCategories = () => {
    if (selectedParticipantIds.length === 0) return [];
    
    // Base categories
    let categories: string[] = [];
    
    if (selectedParticipantIds.length === 1) {
      switch (selectedMetric) {
        case "vitals":
          categories = ["heartRate"];
          break;
        case "bloodPressure":
          categories = ["systolic", "diastolic"];
          break;
        case "oxygenation":
          categories = ["oxygenSaturation"];
          break;
        case "temperature":
          categories = ["temperature"];
          break;
        default:
          categories = ["heartRate"];
      }
    } else {
      // For multiple participants, create categories with participant IDs
      switch (selectedMetric) {
        case "vitals":
          categories = selectedParticipantIds.map(id => `heartRate_${id}`);
          break;
        case "bloodPressure":
          // Add systolic and diastolic for each participant
          selectedParticipantIds.forEach(id => {
            categories.push(`systolic_${id}`);
            categories.push(`diastolic_${id}`);
          });
          break;
        case "oxygenation":
          categories = selectedParticipantIds.map(id => `oxygenSaturation_${id}`);
          break;
        case "temperature":
          categories = selectedParticipantIds.map(id => `temperature_${id}`);
          break;
      }
    }
    
    return categories;
  };
  
  // Get confidence band categories if needed
  const getConfidenceBands = () => {
    if (!showConfidenceBands) return [];
    
    let mainMetric = "";
    switch (selectedMetric) {
      case "vitals": mainMetric = "heartRate"; break;
      case "bloodPressure": mainMetric = "systolic"; break;
      case "oxygenation": mainMetric = "oxygenSaturation"; break;
      case "temperature": mainMetric = "temperature"; break;
      default: mainMetric = "heartRate";
    }
    
    return [{
      main: `${mainMetric}_mean`,
      upper: `${mainMetric}_upper`,
      lower: `${mainMetric}_lower` 
    }];
  };

  // Get chart title based on selected metric
  const getChartTitle = () => {
    switch (selectedMetric) {
      case "vitals":
        return "Heart Rate Over Time";
      case "bloodPressure":
        return "Blood Pressure Over Time";
      case "oxygenation":
        return "Oxygen Saturation Over Time";
      case "temperature":
        return "Temperature Over Time";
      default:
        return "Vital Signs Over Time";
    }
  };

  // Generate dynamic chart legend based on selected participants and metric
  const getLegendLabels = () => {
    if (selectedParticipantIds.length === 0) return [];
    
    const labels: Record<string, string> = {};
    
    selectedParticipantIds.forEach(id => {
      const participant = data.find(p => p.id === id);
      const shortId = id.substring(0, 6);
      
      switch (selectedMetric) {
        case "vitals":
          labels[`heartRate_${id}`] = `HR - ${shortId}`;
          break;
        case "bloodPressure":
          labels[`systolic_${id}`] = `Sys - ${shortId}`;
          labels[`diastolic_${id}`] = `Dia - ${shortId}`;
          break;
        case "oxygenation":
          labels[`oxygenSaturation_${id}`] = `O2 - ${shortId}`;
          break;
        case "temperature":
          labels[`temperature_${id}`] = `Temp - ${shortId}`;
          break;
      }
    });
    
    // Add mean labels if comparing
    if (compareToConditionMean || compareToUnitMean) {
      const compareType = compareToConditionMean ? "Condition" : "Unit";
      switch (selectedMetric) {
        case "vitals":
          labels[`heartRate_mean`] = `HR - ${compareType} Mean`;
          break;
        case "bloodPressure":
          labels[`systolic_mean`] = `Sys - ${compareType} Mean`;
          labels[`diastolic_mean`] = `Dia - ${compareType} Mean`;
          break;
        case "oxygenation":
          labels[`oxygenSaturation_mean`] = `O2 - ${compareType} Mean`;
          break;
        case "temperature":
          labels[`temperature_mean`] = `Temp - ${compareType} Mean`;
          break;
      }
    }
    
    return labels;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant Time Series Data</CardTitle>
        <CardDescription>
          Longitudinal measurements for selected participants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MultiParticipantChartControls
          data={data}
          selectedParticipantIds={selectedParticipantIds}
          setSelectedParticipantIds={setSelectedParticipantIds}
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
          compareToConditionMean={compareToConditionMean}
          setCompareToConditionMean={setCompareToConditionMean}
          compareToUnitMean={compareToUnitMean}
          setCompareToUnitMean={setCompareToUnitMean}
          showConfidenceBands={showConfidenceBands}
          setShowConfidenceBands={setShowConfidenceBands}
          selectedConditions={selectedConditions}
          setSelectedConditions={setSelectedConditions}
          selectedUnits={selectedUnits}
          setSelectedUnits={setSelectedUnits}
        />

        {selectedParticipantIds.length > 0 ? (
          <div className="h-[400px]">
            <LineChart
              data={timeSeriesData}
              index="displayDate"
              categories={getChartCategories()}
              title={getChartTitle()}
              valueFormatter={(value) => `${value}`}
              customTooltip={ChartTooltip}
              showConfidenceBands={showConfidenceBands && (compareToConditionMean || compareToUnitMean)}
              confidenceBandCategories={getConfidenceBands()}
              customTooltipParams={{
                formatter: (value: number) => {
                  if (selectedMetric === "temperature") {
                    return `${value.toFixed(1)}°C`;
                  } else if (selectedMetric === "oxygenation") {
                    return `${value.toFixed(1)}%`;
                  } else {
                    return `${Math.round(value)}`;
                  }
                }
              }}
            />
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                {selectedParticipantIds.length === 1 
                  ? "This chart shows the time series data for the selected participant."
                  : "This chart shows the time series data for multiple participants, allowing comparison of trends."}
                {(compareToConditionMean || compareToUnitMean) && 
                  ` The ${compareToConditionMean ? 'condition' : 'unit'} mean is included for comparison.`}
                {showConfidenceBands && " Confidence bands show the 95% confidence interval around the mean."}
              </p>
            </div>
            
            <div className="mt-2 space-y-1">
              {Object.entries(getLegendLabels()).map(([key, label]) => {
                // Check if it's a mean label
                if (key.includes('_mean')) {
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>{label}</span>
                    </div>
                  );
                }
                
                // For regular participant entries
                const participantId = key.split('_')[1];
                const participant = data.find(p => p.id === participantId);
                const metricName = key.split('_')[0];
                
                return (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>{label} - {participant?.condition} ({metricName})</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-md">
            <p>Select at least one participant to view time series data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantTimeSeriesChart;
