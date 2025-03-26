
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData, Participant } from "@/context/DataContext";
import { LineChart } from "@/components/ui/charts";
import MultiParticipantChartControls from "./MultiParticipantChartControls";
import { useParticipantTimeSeriesData } from "@/hooks/useParticipantTimeSeriesData";
import { ScrollArea } from "@/components/ui/scroll-area";

const ParticipantTimeSeriesChart = () => {
  const { data } = useData();
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("heartRate");
  const [compareToConditionMean, setCompareToConditionMean] = useState<boolean>(false);
  const [compareToUnitMean, setCompareToUnitMean] = useState<boolean>(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [showConfidenceBands, setShowConfidenceBands] = useState<boolean>(false);

  // Get time series data based on selections
  const timeSeriesData = useParticipantTimeSeriesData(data, {
    selectedParticipantIds,
    compareToConditionMean,
    compareToUnitMean,
    showConfidenceBands,
    confidenceLevel: 0.95,
    selectedConditions,
    selectedUnits,
  });

  // Map metric to chart field
  const metricMapping: Record<string, { displayName: string; dataKey: string; meanKey: string; unit: string }> = {
    heartRate: { 
      displayName: "Heart Rate", 
      dataKey: "heartRate", 
      meanKey: "heartRate_mean", 
      unit: "bpm" 
    },
    systolic: { 
      displayName: "Systolic Blood Pressure", 
      dataKey: "systolic", 
      meanKey: "systolic_mean", 
      unit: "mmHg" 
    },
    diastolic: { 
      displayName: "Diastolic Blood Pressure", 
      dataKey: "diastolic", 
      meanKey: "diastolic_mean", 
      unit: "mmHg" 
    },
    oxygenSaturation: { 
      displayName: "Oxygen Saturation", 
      dataKey: "oxygenSaturation", 
      meanKey: "oxygenSaturation_mean", 
      unit: "%" 
    },
    temperature: { 
      displayName: "Temperature", 
      dataKey: "temperature", 
      meanKey: "temperature_mean", 
      unit: "°C" 
    },
  };

  // Generate categories (lines) for the chart
  const getChartCategories = () => {
    const categories: string[] = [];
    
    // If we have selected participants, add their data
    if (selectedParticipantIds.length > 0) {
      selectedParticipantIds.forEach(id => {
        categories.push(`${metricMapping[selectedMetric].dataKey}_${id}`);
      });
    }
    
    // If we are comparing to condition mean, add it
    if (compareToConditionMean) {
      categories.push(metricMapping[selectedMetric].meanKey);
    }
    
    // If we are comparing to unit mean, add it
    if (compareToUnitMean) {
      categories.push(metricMapping[selectedMetric].meanKey);
    }
    
    // If no categories have been added (no selections), add the metric itself as a fallback
    if (categories.length === 0) {
      categories.push(metricMapping[selectedMetric].dataKey);
    }
    
    return categories;
  };

  // Generate confidence band categories if needed
  const getConfidenceBandCategories = () => {
    if (!showConfidenceBands) return [];
    
    const baseCat = metricMapping[selectedMetric].dataKey;
    
    // Fix: Return array of ConfidenceBandCategory objects instead of strings
    return [{
      upper: `${baseCat}_upper`,
      lower: `${baseCat}_lower`,
      target: baseCat
    }];
  };

  // Get participant details for legend
  const getParticipantDetails = (id: string) => {
    const participant = data.find(p => p.id === id);
    if (!participant) return { condition: "Unknown", unit: "Unknown" };
    return { condition: participant.condition, unit: participant.unit };
  };

  // Generate colors for the chart
  const getChartColors = () => {
    const colors = [];
    
    // Participant lines (blue variations)
    for (let i = 0; i < selectedParticipantIds.length; i++) {
      colors.push(`hsl(${210 + i * 30}, 80%, 50%)`);
    }
    
    // Condition mean (red)
    if (compareToConditionMean) {
      colors.push("hsl(0, 80%, 50%)");
    }
    
    // Unit mean (green)
    if (compareToUnitMean) {
      colors.push("hsl(120, 80%, 50%)");
    }
    
    // Fallback
    if (colors.length === 0) {
      colors.push("hsl(210, 80%, 50%)");
    }
    
    return colors;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant Time Series Data</CardTitle>
        <CardDescription>
          Visualize measurements over time for selected participants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <MultiParticipantChartControls
              selectedParticipantIds={selectedParticipantIds}
              setSelectedParticipantIds={setSelectedParticipantIds}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              compareToConditionMean={compareToConditionMean}
              setCompareToConditionMean={setCompareToConditionMean}
              compareToUnitMean={compareToUnitMean}
              setCompareToUnitMean={setCompareToUnitMean}
              selectedConditions={selectedConditions}
              setSelectedConditions={setSelectedConditions}
              selectedUnits={selectedUnits}
              setSelectedUnits={setSelectedUnits}
              showConfidenceBands={showConfidenceBands}
              setShowConfidenceBands={setShowConfidenceBands}
              data={data}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="h-[400px]">
              {timeSeriesData.length > 0 ? (
                <LineChart
                  data={timeSeriesData}
                  index="displayDate"
                  categories={getChartCategories()}
                  colors={getChartColors()}
                  showConfidenceBands={showConfidenceBands}
                  confidenceBandCategories={getConfidenceBandCategories()}
                  valueFormatter={(value) => `${value} ${metricMapping[selectedMetric].unit}`}
                  height={350}
                  yAxisLabel={metricMapping[selectedMetric].unit}
                />
              ) : (
                <div className="h-full flex items-center justify-center border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">
                    {selectedParticipantIds.length === 0 && selectedConditions.length === 0 && selectedUnits.length === 0
                      ? "Select participants, conditions, or units to display data"
                      : "No data available for the selected criteria"}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Chart Legend</h4>
              <ScrollArea className="h-[120px]">
                <div className="space-y-1">
                  {selectedParticipantIds.map((id, index) => {
                    const details = getParticipantDetails(id);
                    return (
                      <div key={id} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: `hsl(${210 + index * 30}, 80%, 50%)` }}
                        />
                        <span className="text-sm">
                          Participant {id} - {details.condition} (Unit: {details.unit})
                        </span>
                      </div>
                    );
                  })}
                  
                  {compareToConditionMean && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm">
                        Condition Mean {selectedConditions.length > 0 ? `(${selectedConditions.join(', ')})` : '(All Conditions)'}
                      </span>
                    </div>
                  )}
                  
                  {compareToUnitMean && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">
                        Unit Mean {selectedUnits.length > 0 ? `(${selectedUnits.join(', ')})` : '(All Units)'}
                      </span>
                    </div>
                  )}
                  
                  {selectedConditions.length > 0 && !compareToConditionMean && !compareToUnitMean && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">
                        Selected Conditions: {selectedConditions.join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {selectedUnits.length > 0 && !compareToConditionMean && !compareToUnitMean && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">
                        Selected Units: {selectedUnits.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>
            This chart displays {metricMapping[selectedMetric].displayName} measurements over time 
            {selectedParticipantIds.length > 0 ? ` for ${selectedParticipantIds.length} selected participants` : ''}
            {compareToConditionMean ? ` compared to condition mean` : ''}
            {compareToUnitMean ? ` compared to unit mean` : ''}
            {selectedConditions.length > 0 && !compareToConditionMean && !compareToUnitMean ? ` for conditions: ${selectedConditions.join(', ')}` : ''}
            {selectedUnits.length > 0 && !compareToConditionMean && !compareToUnitMean ? ` for units: ${selectedUnits.join(', ')}` : ''}
            .
            {showConfidenceBands ? ' 95% confidence bands are shown for mean values.' : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantTimeSeriesChart;
