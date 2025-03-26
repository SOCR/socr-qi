
import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LineChart } from "@/components/ui/charts/LineChart";

const RiskScoreDistribution = () => {
  const { data } = useData();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [showIndividualSeries, setShowIndividualSeries] = useState<boolean>(false);
  const [isAggregating, setIsAggregating] = useState<boolean>(true);
  
  // Get unique conditions and units
  const conditions = Array.from(new Set(data.map(p => p.condition))).sort();
  const units = Array.from(new Set(data.map(p => p.unit))).sort();
  
  // Handle condition selection
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };
  
  // Handle unit selection
  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev => 
      prev.includes(unit) 
        ? prev.filter(u => u !== unit)
        : [...prev, unit]
    );
  };
  
  // Reset selections when filter type changes
  useEffect(() => {
    setSelectedConditions([]);
    setSelectedUnits([]);
  }, [filterType]);
  
  // Prepare data for visualization
  const prepareRiskScoreData = () => {
    // Default risk score ranges
    const riskGroups = ["0-20", "21-40", "41-60", "61-80", "81-100"];
    let filteredData = data;
    
    // Filter data based on selection
    if (filterType === 'condition' && selectedConditions.length > 0) {
      filteredData = data.filter(p => selectedConditions.includes(p.condition));
    } else if (filterType === 'unit' && selectedUnits.length > 0) {
      filteredData = data.filter(p => selectedUnits.includes(p.unit));
    }
    
    // Calculate overall distribution
    const riskDistribution = filteredData.reduce((acc, participant) => {
      const score = participant.riskScore;
      if (score <= 20) acc["0-20"] = (acc["0-20"] || 0) + 1;
      else if (score <= 40) acc["21-40"] = (acc["21-40"] || 0) + 1;
      else if (score <= 60) acc["41-60"] = (acc["41-60"] || 0) + 1;
      else if (score <= 80) acc["61-80"] = (acc["61-80"] || 0) + 1;
      else acc["81-100"] = (acc["81-100"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate individual distributions by condition or unit
    const individualDistributions: Record<string, Record<string, number>> = {};
    
    if (filterType === 'condition' && selectedConditions.length > 0) {
      selectedConditions.forEach(condition => {
        const conditionData = data.filter(p => p.condition === condition);
        individualDistributions[condition] = conditionData.reduce((acc, participant) => {
          const score = participant.riskScore;
          if (score <= 20) acc["0-20"] = (acc["0-20"] || 0) + 1;
          else if (score <= 40) acc["21-40"] = (acc["21-40"] || 0) + 1;
          else if (score <= 60) acc["41-60"] = (acc["41-60"] || 0) + 1;
          else if (score <= 80) acc["61-80"] = (acc["61-80"] || 0) + 1;
          else acc["81-100"] = (acc["81-100"] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      });
    } else if (filterType === 'unit' && selectedUnits.length > 0) {
      selectedUnits.forEach(unit => {
        const unitData = data.filter(p => p.unit === unit);
        individualDistributions[unit] = unitData.reduce((acc, participant) => {
          const score = participant.riskScore;
          if (score <= 20) acc["0-20"] = (acc["0-20"] || 0) + 1;
          else if (score <= 40) acc["21-40"] = (acc["21-40"] || 0) + 1;
          else if (score <= 60) acc["41-60"] = (acc["41-60"] || 0) + 1;
          else if (score <= 80) acc["61-80"] = (acc["61-80"] || 0) + 1;
          else acc["81-100"] = (acc["81-100"] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      });
    }
    
    // Convert to chart format
    const chartData = riskGroups.map(group => {
      const dataPoint: Record<string, any> = {
        name: group,
        value: riskDistribution[group] || 0
      };
      
      // Add individual series data if needed
      if (showIndividualSeries) {
        if (filterType === 'condition') {
          selectedConditions.forEach(condition => {
            dataPoint[`${condition}_value`] = individualDistributions[condition]?.[group] || 0;
          });
        } else if (filterType === 'unit') {
          selectedUnits.forEach(unit => {
            dataPoint[`${unit}_value`] = individualDistributions[unit]?.[group] || 0;
          });
        }
      }
      
      return dataPoint;
    });
    
    return chartData;
  };
  
  const riskData = prepareRiskScoreData();
  
  // Determine which categories to display
  const getCategories = () => {
    // If aggregating, always show the overall average
    const baseCategories = isAggregating ? ["value"] : [];
    
    // Add individual series if requested
    if (showIndividualSeries) {
      if (filterType === 'condition' && selectedConditions.length > 0) {
        return [...baseCategories, ...selectedConditions.map(c => `${c}_value`)];
      } else if (filterType === 'unit' && selectedUnits.length > 0) {
        return [...baseCategories, ...selectedUnits.map(u => `${u}_value`)];
      }
    }
    
    return baseCategories;
  };
  
  const categories = getCategories();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Score Distribution</CardTitle>
        <CardDescription>Number of participants by risk score range</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Filter Data</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  <SelectItem value="condition">By Condition</SelectItem>
                  <SelectItem value="unit">By Clinical Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filterType === 'condition' && (
              <div className="space-y-2">
                <Label>Select Conditions</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {conditions.map(condition => (
                    <div key={condition} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={`condition-${condition}`} 
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={() => toggleCondition(condition)}
                      />
                      <label 
                        htmlFor={`condition-${condition}`}
                        className="text-sm cursor-pointer"
                      >
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {filterType === 'unit' && (
              <div className="space-y-2">
                <Label>Select Units</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {units.map(unit => (
                    <div key={unit} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={`unit-${unit}`} 
                        checked={selectedUnits.includes(unit)}
                        onCheckedChange={() => toggleUnit(unit)}
                      />
                      <label 
                        htmlFor={`unit-${unit}`}
                        className="text-sm cursor-pointer"
                      >
                        {unit}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Display Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-individual" 
                    checked={showIndividualSeries}
                    onCheckedChange={(checked) => setShowIndividualSeries(checked === true)}
                  />
                  <label 
                    htmlFor="show-individual"
                    className="text-sm cursor-pointer"
                  >
                    Show Individual Series
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-aggregate" 
                    checked={isAggregating}
                    onCheckedChange={(checked) => setIsAggregating(checked === true)}
                  />
                  <label 
                    htmlFor="show-aggregate"
                    className="text-sm cursor-pointer"
                  >
                    Show Aggregate Average
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <LineChart
          data={riskData}
          index="name"
          categories={categories}
          valueFormatter={(value) => `${value} patients`}
          height={300}
        />
        
        <div className="mt-2 text-sm">
          <p className="text-blue-500">● value: All Participants</p>
          {filterType !== 'all' && showIndividualSeries && (
            <div className="mt-1 text-xs text-muted-foreground">
              {filterType === 'condition' && selectedConditions.length > 0 && (
                <p>Individual lines represent each selected condition: {selectedConditions.join(', ')}</p>
              )}
              {filterType === 'unit' && selectedUnits.length > 0 && (
                <p>Individual lines represent each selected unit: {selectedUnits.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskScoreDistribution;
