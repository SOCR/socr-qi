
import React, { useMemo } from "react";
import { calculateCorrelation, linearRegression } from "@/utils/analyticsUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ScatterChart from "@/components/ScatterChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, RadarChart } from "@/components/ui/chart";

interface CorrelationAnalysisProps {
  data: any[];
  xVariable: string;
  yVariable: string;
  variableOptions: { value: string; label: string }[];
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({
  data,
  xVariable,
  yVariable,
  variableOptions
}) => {
  // Memoize computations for performance
  const analysisResults = useMemo(() => {
    // Extract the variables from data
    const xValues = data.map(p => p[xVariable]);
    const yValues = data.map(p => p[yVariable]);
    
    // Run correlation and regression
    const correlationValue = calculateCorrelation(xValues, yValues);
    const regression = linearRegression(xValues, yValues);
    
    // Calculate correlations for other pairs
    const allCorrelations = variableOptions.map(xOpt => {
      return variableOptions.map(yOpt => {
        if (xOpt.value === yOpt.value) return { x: xOpt.value, y: yOpt.value, correlation: 1 };
        
        const xVals = data.map(p => p[xOpt.value]);
        const yVals = data.map(p => p[yOpt.value]);
        const corr = calculateCorrelation(xVals, yVals);
        
        return {
          x: xOpt.value,
          y: yOpt.value,
          correlation: corr
        };
      });
    }).flat();
    
    // Prepare scatter plot data
    const scatterData = data.map(p => ({
      x: p[xVariable],
      y: p[yVariable],
      id: p.id,
      outcome: p.outcome
    }));
    
    // Generate regression line points
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const regressionPoints = [
      { x: minX, y: regression.slope * minX + regression.intercept },
      { x: maxX, y: regression.slope * maxX + regression.intercept }
    ];
    
    // Calculate strengths of relationship with other variables
    const relationshipStrengths = variableOptions
      .filter(opt => opt.value !== xVariable)
      .map(opt => {
        const vals = data.map(p => p[opt.value]);
        const corr = Math.abs(calculateCorrelation(xValues, vals));
        return {
          variable: opt.label,
          strength: parseFloat(corr.toFixed(3))
        };
      })
      .sort((a, b) => b.strength - a.strength);
    
    // Calculate correlation matrix data for radar chart
    const radarData = variableOptions.map(opt => {
      const result: Record<string, any> = { variable: opt.label };
      
      variableOptions.forEach(innerOpt => {
        if (innerOpt.value !== opt.value) {
          const correlation = allCorrelations.find(
            c => (c.x === opt.value && c.y === innerOpt.value) || 
                (c.x === innerOpt.value && c.y === opt.value)
          );
          
          result[innerOpt.label] = correlation ? Math.abs(correlation.correlation) : 0;
        }
      });
      
      return result;
    });
    
    return {
      correlationValue,
      regression,
      scatterData,
      regressionPoints,
      relationshipStrengths,
      radarData
    };
  }, [data, xVariable, yVariable, variableOptions]);
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Correlation Analysis Results</AlertTitle>
        <AlertDescription>
          The correlation between {variableOptions.find(v => v.value === xVariable)?.label} and {" "}
          {variableOptions.find(v => v.value === yVariable)?.label} is{" "}
          <strong>{analysisResults.correlationValue.toFixed(3)}</strong>.
          {Math.abs(analysisResults.correlationValue) > 0.7 && " This indicates a strong relationship."}
          {Math.abs(analysisResults.correlationValue) > 0.4 && Math.abs(analysisResults.correlationValue) <= 0.7 && " This indicates a moderate relationship."}
          {Math.abs(analysisResults.correlationValue) <= 0.4 && " This indicates a weak relationship."}
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scatter Plot with Regression Line</CardTitle>
            <CardDescription>
              Visual representation of the relationship between variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScatterChart
              data={analysisResults.scatterData}
              xAxisKey="x"
              yAxisKey="y"
              xAxisLabel={variableOptions.find(v => v.value === xVariable)?.label || xVariable}
              yAxisLabel={variableOptions.find(v => v.value === yVariable)?.label || yVariable}
              regressionLine={analysisResults.regressionPoints}
              height={300}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Variable Relationship Strengths</CardTitle>
            <CardDescription>
              Absolute correlation values with {variableOptions.find(v => v.value === xVariable)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analysisResults.relationshipStrengths}
              index="variable"
              categories={["strength"]}
              valueFormatter={(value) => value.toFixed(3)}
              layout="vertical"
              height={300}
            />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Multi-Variable Correlation Network</CardTitle>
          <CardDescription>
            Relationships between all variables in the dataset
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <RadarChart
            data={analysisResults.radarData}
            dataKey="variable"
            categories={variableOptions.map(opt => opt.label).filter(
              label => label !== variableOptions.find(v => v.value === xVariable)?.label
            )}
            valueFormatter={(value) => value.toFixed(2)}
            height={320}
          />
        </CardContent>
      </Card>
      
      <div className="text-sm">
        <p>
          <strong>Regression Equation:</strong>{" "}
          {variableOptions.find(v => v.value === yVariable)?.label} = {analysisResults.regression.slope.toFixed(3)} × {variableOptions.find(v => v.value === xVariable)?.label} {analysisResults.regression.intercept >= 0 ? "+" : ""} {analysisResults.regression.intercept.toFixed(3)}
        </p>
        <p className="mt-2">
          This suggests that for each unit increase in {variableOptions.find(v => v.value === xVariable)?.label}, 
          {variableOptions.find(v => v.value === yVariable)?.label} changes by approximately {analysisResults.regression.slope.toFixed(3)} units.
        </p>
        <p className="mt-2">
          <strong>R-squared value:</strong> {(analysisResults.correlationValue * analysisResults.correlationValue).toFixed(3)}. 
          This indicates that approximately {Math.round(analysisResults.correlationValue * analysisResults.correlationValue * 100)}% of the 
          variation in {variableOptions.find(v => v.value === yVariable)?.label} can be explained by 
          {variableOptions.find(v => v.value === xVariable)?.label}.
        </p>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;
