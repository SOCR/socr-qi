
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

// Mock quality trend data - in a real app, this would come from an API or context
const mockQualityData = [
  { month: "Jan", score: 72, ICU_score: 76, Cardiology_score: 70, Neurology_score: 71 },
  { month: "Feb", score: 75, ICU_score: 78, Cardiology_score: 73, Neurology_score: 74 },
  { month: "Mar", score: 79, ICU_score: 81, Cardiology_score: 77, Neurology_score: 79 },
  { month: "Apr", score: 76, ICU_score: 79, Cardiology_score: 74, Neurology_score: 75 },
  { month: "May", score: 82, ICU_score: 86, Cardiology_score: 80, Neurology_score: 80 },
  { month: "Jun", score: 85, ICU_score: 88, Cardiology_score: 83, Neurology_score: 84 },
];

const QualityScoreTrend = () => {
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
  
  // Determine which categories to display
  const getCategories = () => {
    // If aggregating, always show the overall average
    const baseCategories = isAggregating ? ["score"] : [];
    
    // Add individual series if requested
    if (showIndividualSeries) {
      if (filterType === 'condition' && selectedConditions.length > 0) {
        // For demo purposes, we don't have real condition-specific data
        // In a real app, you would have actual data for this
        return baseCategories;
      } else if (filterType === 'unit' && selectedUnits.length > 0) {
        const unitCategories = selectedUnits
          .filter(unit => ["ICU", "Cardiology", "Neurology"].includes(unit))
          .map(unit => `${unit}_score`);
        return [...baseCategories, ...unitCategories];
      }
    }
    
    return baseCategories;
  };
  
  const categories = getCategories();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Score Trend</CardTitle>
        <CardDescription>Changes in quality metrics over time</CardDescription>
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
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="unit">By Clinical Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filterType === 'unit' && (
              <div className="space-y-2">
                <Label>Select Units</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {units
                    .filter(unit => ["ICU", "Cardiology", "Neurology"].includes(unit))
                    .map(unit => (
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
          data={mockQualityData}
          index="month"
          categories={categories}
          valueFormatter={(value) => `${value}`}
          height={250}
        />
        
        <div className="mt-2 text-sm">
          <p className="text-blue-500">● score: Overall Quality Score</p>
          {filterType === 'unit' && showIndividualSeries && selectedUnits.length > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              <p>Individual lines represent quality scores for each selected unit: {selectedUnits.join(', ')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QualityScoreTrend;
