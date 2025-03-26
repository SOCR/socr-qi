
import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemporalData } from "@/hooks/useTemporalData";
import FilterControls from "./FilterControls";
import ChartLegend from "./ChartLegend";
import { LineChart } from "@/components/ui/charts";
import { useChartCategories } from "@/hooks/useChartCategories";
import { useToast } from "@/components/ui/use-toast";

const TemporalTrends = () => {
  const { data } = useData();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showIndividualCourses, setShowIndividualCourses] = useState<boolean>(true);
  const [showAggregateAverage, setShowAggregateAverage] = useState<boolean>(true);
  const [showConfidenceBands, setShowConfidenceBands] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("vitals");
  const [error, setError] = useState<string | null>(null);
  
  // Get unique conditions, units, and participants
  const conditions = Array.from(new Set(data.map(p => p.condition))).sort();
  const units = Array.from(new Set(data.map(p => p.unit))).sort();
  const participants = data.map(p => ({ id: p.id, label: `${p.id} (${p.condition})` }));
  
  // Filter data based on selection
  const getFilteredData = () => {
    try {
      setError(null);
      if (filterType === 'condition' && selectedConditions.length > 0) {
        return data.filter(p => selectedConditions.includes(p.condition));
      } else if (filterType === 'unit' && selectedUnits.length > 0) {
        return data.filter(p => selectedUnits.includes(p.unit));
      } else if (filterType === 'participant' && selectedParticipants.length > 0) {
        return data.filter(p => selectedParticipants.includes(p.id));
      }
      return data;
    } catch (error) {
      console.error("Error filtering data:", error);
      setError("Error filtering data. Please try different selections.");
      toast({
        title: "Error filtering data",
        description: "There was a problem filtering the data. Please try again.",
        variant: "destructive"
      });
      return data;
    }
  };
  
  useEffect(() => {
    setIsLoading(true);
    // Add a small delay to allow the UI to update
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [filterType, selectedConditions, selectedUnits, selectedParticipants]);
  
  const filteredData = getFilteredData();
  const temporalData = useTemporalData(filteredData);

  // Handle filter type change
  const handleFilterTypeChange = (type: string) => {
    setFilterType(type);
    // Reset selections when changing filter type
    setSelectedConditions([]);
    setSelectedUnits([]);
    setSelectedParticipants([]);
  };

  // Get vital signs chart categories
  const vitalSignsCategories = useChartCategories({
    metric: "HeartRate",
    showAggregateAverage,
    showIndividualCourses,
    filterType,
    selectedConditions,
    selectedUnits,
    selectedParticipants,
    showConfidenceBands,
  });

  // Get blood pressure chart categories
  const bpCategories = useChartCategories({
    metric: "BpSystolic",
    showAggregateAverage,
    showIndividualCourses,
    filterType,
    selectedConditions,
    selectedUnits,
    selectedParticipants,
    showConfidenceBands,
  });

  const bpDiastolicCategories = useChartCategories({
    metric: "BpDiastolic",
    showAggregateAverage,
    showIndividualCourses,
    filterType,
    selectedConditions,
    selectedUnits,
    selectedParticipants,
    showConfidenceBands,
  });

  // Get oxygen and temperature chart categories
  const oxygenCategories = useChartCategories({
    metric: "OxygenSaturation",
    showAggregateAverage,
    showIndividualCourses,
    filterType,
    selectedConditions,
    selectedUnits,
    selectedParticipants,
    showConfidenceBands,
  });

  const temperatureCategories = useChartCategories({
    metric: "Temperature",
    showAggregateAverage,
    showIndividualCourses,
    filterType,
    selectedConditions,
    selectedUnits,
    selectedParticipants,
    showConfidenceBands,
  });

  // Generate legend items for combined charts (BP, Oxygen/Temp)
  const getBpLegendItems = () => {
    const items = [];
    if (showAggregateAverage) {
      items.push(
        { label: "avgBpSystolic: Average Systolic Blood Pressure", color: "rgb(59, 130, 246)" },
        { label: "avgBpDiastolic: Average Diastolic Blood Pressure", color: "rgb(34, 197, 94)" }
      );
    }
    
    if (showIndividualCourses) {
      if (filterType === 'condition') {
        selectedConditions.forEach((condition, index) => {
          items.push(
            { 
              label: `${condition} Systolic: ${condition} Average Systolic Blood Pressure`, 
              color: `hsl(${(index * 30) % 360}, 70%, 50%)` 
            },
            { 
              label: `${condition} Diastolic: ${condition} Average Diastolic Blood Pressure`, 
              color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` 
            }
          );
        });
      } else if (filterType === 'unit') {
        selectedUnits.forEach((unit, index) => {
          items.push(
            { 
              label: `${unit} Systolic: ${unit} Average Systolic Blood Pressure`, 
              color: `hsl(${(index * 30) % 360}, 70%, 50%)` 
            },
            { 
              label: `${unit} Diastolic: ${unit} Average Diastolic Blood Pressure`, 
              color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` 
            }
          );
        });
      } else if (filterType === 'participant') {
        selectedParticipants.forEach((participantId, index) => {
          items.push(
            { 
              label: `Patient ${participantId} Systolic BP`, 
              color: `hsl(${(index * 30) % 360}, 70%, 50%)` 
            },
            { 
              label: `Patient ${participantId} Diastolic BP`, 
              color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` 
            }
          );
        });
      }
    }
    
    return items;
  };
  
  const getOxygenTempLegendItems = () => {
    const items = [];
    if (showAggregateAverage) {
      items.push(
        { label: "avgOxygenSaturation: Average Oxygen Saturation (%)", color: "rgb(59, 130, 246)" },
        { label: "avgTemperature: Average Temperature (°C)", color: "rgb(34, 197, 94)" }
      );
    }
    
    if (showIndividualCourses) {
      if (filterType === 'condition') {
        selectedConditions.forEach((condition, index) => {
          items.push(
            { 
              label: `${condition} O₂: ${condition} Average Oxygen Saturation`, 
              color: `hsl(${(index * 30) % 360}, 70%, 50%)` 
            },
            { 
              label: `${condition} Temp: ${condition} Average Temperature`, 
              color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` 
            }
          );
        });
      } else if (filterType === 'unit') {
        selectedUnits.forEach((unit, index) => {
          items.push(
            { 
              label: `${unit} O₂: ${unit} Average Oxygen Saturation`, 
              color: `hsl(${(index * 30) % 360}, 70%, 50%)` 
            },
            { 
              label: `${unit} Temp: ${unit} Average Temperature`, 
              color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` 
            }
          );
        });
      } else if (filterType === 'participant') {
        selectedParticipants.forEach((participantId, index) => {
          items.push(
            { 
              label: `Patient ${participantId} O₂ Saturation`, 
              color: `hsl(${(index * 30) % 360}, 70%, 50%)` 
            },
            { 
              label: `Patient ${participantId} Temperature`, 
              color: `hsl(${((index * 30) + 15) % 360}, 70%, 50%)` 
            }
          );
        });
      }
    }
    
    return items;
  };

  // Check if we have any chart categories for the current selection
  const hasCategories = (tab: string) => {
    try {
      if (tab === "vitals") {
        return vitalSignsCategories.categories.length > 0;
      } else if (tab === "bloodPressure") {
        return bpCategories.categories.length > 0 || bpDiastolicCategories.categories.length > 0;
      } else if (tab === "oxygen") {
        return oxygenCategories.categories.length > 0 || temperatureCategories.categories.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error checking categories:", error);
      return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temporal Trends Analysis</CardTitle>
        <CardDescription>
          Changes in key health indicators over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <FilterControls
            filterType={filterType}
            onFilterTypeChange={handleFilterTypeChange}
            selectedConditions={selectedConditions}
            setSelectedConditions={setSelectedConditions}
            selectedUnits={selectedUnits}
            setSelectedUnits={setSelectedUnits}
            selectedParticipants={selectedParticipants}
            setSelectedParticipants={setSelectedParticipants}
            conditions={conditions}
            units={units}
            participants={participants}
            showAggregateAverage={showAggregateAverage}
            setShowAggregateAverage={setShowAggregateAverage}
            showIndividualCourses={showIndividualCourses}
            setShowIndividualCourses={setShowIndividualCourses}
            showConfidenceBands={showConfidenceBands}
            setShowConfidenceBands={setShowConfidenceBands}
          />
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] bg-red-50 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        ) : temporalData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
            <p className="text-gray-500">No data available for the selected filters</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="vitals" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                <TabsTrigger value="bloodPressure">Blood Pressure</TabsTrigger>
                <TabsTrigger value="oxygen">Oxygen & Temperature</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vitals">
                {hasCategories("vitals") ? (
                  <LineChart
                    data={temporalData}
                    index="month"
                    categories={vitalSignsCategories.categories}
                    valueFormatter={(value) => `${Math.round(value)}`}
                    height={250}
                    showConfidenceBands={showConfidenceBands}
                    confidenceBandCategories={vitalSignsCategories.confidenceBandCategories}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-md">
                    <p className="text-gray-500">No vital signs data available for the selected filters</p>
                  </div>
                )}
                <ChartLegend
                  items={vitalSignsCategories.legendItems}
                  filterType={filterType}
                  selectedConditions={selectedConditions}
                  selectedUnits={selectedUnits}
                  selectedParticipants={selectedParticipants}
                />
              </TabsContent>
              
              <TabsContent value="bloodPressure">
                {hasCategories("bloodPressure") ? (
                  <LineChart
                    data={temporalData}
                    index="month"
                    categories={[
                      ...bpCategories.categories,
                      ...bpDiastolicCategories.categories
                    ]}
                    valueFormatter={(value) => `${Math.round(value)}`}
                    height={250}
                    showConfidenceBands={showConfidenceBands}
                    confidenceBandCategories={[
                      ...bpCategories.confidenceBandCategories,
                      ...bpDiastolicCategories.confidenceBandCategories
                    ]}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-md">
                    <p className="text-gray-500">No blood pressure data available for the selected filters</p>
                  </div>
                )}
                <ChartLegend
                  items={getBpLegendItems()}
                  filterType={filterType}
                  selectedConditions={selectedConditions}
                  selectedUnits={selectedUnits}
                  selectedParticipants={selectedParticipants}
                />
              </TabsContent>
              
              <TabsContent value="oxygen">
                {hasCategories("oxygen") ? (
                  <LineChart
                    data={temporalData}
                    index="month"
                    categories={[
                      ...oxygenCategories.categories,
                      ...temperatureCategories.categories
                    ]}
                    valueFormatter={(value) => `${value.toFixed(1)}`}
                    height={250}
                    showConfidenceBands={showConfidenceBands}
                    confidenceBandCategories={[
                      ...oxygenCategories.confidenceBandCategories,
                      ...temperatureCategories.confidenceBandCategories
                    ]}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-md">
                    <p className="text-gray-500">No oxygen/temperature data available for the selected filters</p>
                  </div>
                )}
                <ChartLegend
                  items={getOxygenTempLegendItems()}
                  filterType={filterType}
                  selectedConditions={selectedConditions}
                  selectedUnits={selectedUnits}
                  selectedParticipants={selectedParticipants}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                These charts display how key health indicators have changed over time
                {filterType !== 'all' 
                  ? filterType === 'condition'
                    ? ` for patients with ${selectedConditions.length > 1 ? 'selected conditions' : selectedConditions[0] || 'any condition'}`
                    : filterType === 'unit'
                      ? ` in the ${selectedUnits.length > 1 ? 'selected units' : selectedUnits[0] || 'any unit'}`
                      : ` for ${selectedParticipants.length} selected participants`
                  : " across all participants"
                }.
                {showIndividualCourses && 
                  " Individual time courses are shown to highlight variations between entities."
                }
                {showConfidenceBands && showAggregateAverage && 
                  " Confidence bands indicate the statistical reliability of the average values."
                }
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TemporalTrends;
