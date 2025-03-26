
import React, { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScatterChart from "@/components/ScatterChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface CorrelationAnalysisProps {
  xVariable: string;
  yVariable: string;
  variableOptions: { value: string; label: string }[];
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({
  xVariable,
  yVariable,
  variableOptions
}) => {
  const { data } = useData();
  
  // Get label for selected variables
  const xLabel = variableOptions.find(o => o.value === xVariable)?.label || xVariable;
  const yLabel = variableOptions.find(o => o.value === yVariable)?.label || yVariable;
  
  // Prepare data for scatter chart
  const scatterData = useMemo(() => {
    return data.map(p => ({
      id: p.id,
      x: p[xVariable as keyof typeof p],
      y: p[yVariable as keyof typeof p],
      outcome: p.outcome,
      condition: p.condition,
      gender: p.gender,
      unit: p.unit
    }));
  }, [data, xVariable, yVariable]);
  
  // Calculate correlation coefficient
  const correlation = useMemo(() => {
    const validData = scatterData.filter(d => 
      d.x !== undefined && d.y !== undefined && 
      d.x !== null && d.y !== null
    );
    
    if (validData.length < 3) return null;
    
    const n = validData.length;
    const sumX = validData.reduce((sum, d) => sum + d.x, 0);
    const sumY = validData.reduce((sum, d) => sum + d.y, 0);
    const sumXY = validData.reduce((sum, d) => sum + (d.x * d.y), 0);
    const sumXX = validData.reduce((sum, d) => sum + (d.x * d.x), 0);
    const sumYY = validData.reduce((sum, d) => sum + (d.y * d.y), 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }, [scatterData]);
  
  // Calculate linear regression
  const regression = useMemo(() => {
    const validData = scatterData.filter(d => 
      d.x !== undefined && d.y !== undefined && 
      d.x !== null && d.y !== null
    );
    
    if (validData.length < 2) return { slope: 0, intercept: 0 };
    
    const n = validData.length;
    const sumX = validData.reduce((sum, d) => sum + d.x, 0);
    const sumY = validData.reduce((sum, d) => sum + d.y, 0);
    const sumXY = validData.reduce((sum, d) => sum + (d.x * d.y), 0);
    const sumXX = validData.reduce((sum, d) => sum + (d.x * d.x), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }, [scatterData]);
  
  // Generate regression line points
  const regressionLineData = useMemo(() => {
    if (scatterData.length < 2) return [];
    
    // Find min and max X values
    const xValues = scatterData
      .filter(d => d.x !== undefined && d.x !== null)
      .map(d => d.x);
    
    if (xValues.length < 2) return [];
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    
    // Create two points for the regression line
    return [
      { x: minX, y: regression.slope * minX + regression.intercept },
      { x: maxX, y: regression.slope * maxX + regression.intercept }
    ];
  }, [scatterData, regression]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Correlation coefficient (r): {correlation !== null ? correlation.toFixed(3) : 'N/A'}</strong>
              <br />
              {correlation !== null && (
                <span className="text-sm">
                  {Math.abs(correlation) < 0.3 ? 'Weak correlation' :
                   Math.abs(correlation) < 0.7 ? 'Moderate correlation' :
                   'Strong correlation'} 
                  {correlation > 0 ? ' (positive)' : ' (negative)'}
                </span>
              )}
            </AlertDescription>
          </Alert>
          
          <div>
            <ScatterChart
              data={scatterData}
              xAxisKey="x"
              yAxisKey="y"
              xAxisLabel={xLabel}
              yAxisLabel={yLabel}
              tooltipLabel={`${xLabel} vs ${yLabel}`}
              height={350}
            />
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">
              This scatter plot shows the relationship between {xLabel} and {yLabel}.
              {correlation !== null && correlation !== 0 && (
                <> The correlation coefficient (r = {correlation.toFixed(3)}) indicates 
                a {Math.abs(correlation) < 0.3 ? 'weak' : Math.abs(correlation) < 0.7 ? 'moderate' : 'strong'} 
                {correlation > 0 ? ' positive' : ' negative'} relationship.</>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationAnalysis;
