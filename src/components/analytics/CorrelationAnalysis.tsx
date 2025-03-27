
import React, { useMemo } from "react";
import { calculateCorrelation, linearRegression } from "@/utils/analyticsUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ScatterChart from "@/components/ScatterChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, RadarChart } from "@/components/ui/chart";

// Helper to safely access nested properties
const getNestedValue = (obj: any, path: string) => {
  try {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  } catch (e) {
    return undefined;
  }
};

interface CorrelationAnalysisProps {
  data: any[];
  xVariable: string;
  yVariable: string;
  variableOptions: { value: string; label: string; group?: string }[];
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({
  data,
  xVariable,
  yVariable,
  variableOptions
}) => {
  // Memoize computations for performance
  const analysisResults = useMemo(() => {
    // Check if we're dealing with deep phenotype variables
    const isXDeepPhenotype = xVariable.includes('deepPhenotype');
    const isYDeepPhenotype = yVariable.includes('deepPhenotype');
    
    // Extract the variables from data
    const xValues = data.map(p => 
      isXDeepPhenotype ? getNestedValue(p, xVariable) : p[xVariable]
    ).filter(Boolean);
    
    const yValues = data.map(p => 
      isYDeepPhenotype ? getNestedValue(p, yVariable) : p[yVariable]
    ).filter(Boolean);
    
    // We need to get the data points where both values exist
    const validDataPoints = data.map(p => {
      const xVal = isXDeepPhenotype ? getNestedValue(p, xVariable) : p[xVariable];
      const yVal = isYDeepPhenotype ? getNestedValue(p, yVariable) : p[yVariable];
      
      if (xVal !== undefined && yVal !== undefined && xVal !== null && yVal !== null) {
        return {
          x: xVal,
          y: yVal,
          id: p.id,
          outcome: p.outcome
        };
      }
      
      return null;
    }).filter(Boolean);
    
    // Run correlation and regression on the filtered values
    const validXValues = validDataPoints.map(p => p!.x);
    const validYValues = validDataPoints.map(p => p!.y);
    
    const correlationValue = calculateCorrelation(validXValues, validYValues);
    const regression = linearRegression(validXValues, validYValues);
    
    // Calculate correlations for other pairs
    const allCorrelations = variableOptions.map(xOpt => {
      return variableOptions.map(yOpt => {
        if (xOpt.value === yOpt.value) return { x: xOpt.value, y: yOpt.value, correlation: 1 };
        
        const isXOptDeep = xOpt.value.includes('deepPhenotype');
        const isYOptDeep = yOpt.value.includes('deepPhenotype');
        
        const validPairs = data
          .map(p => {
            const xVal = isXOptDeep ? getNestedValue(p, xOpt.value) : p[xOpt.value];
            const yVal = isYOptDeep ? getNestedValue(p, yOpt.value) : p[yOpt.value];
            
            if (xVal !== undefined && yVal !== undefined && xVal !== null && yVal !== null) {
              return { x: xVal, y: yVal };
            }
            
            return null;
          })
          .filter(Boolean);
        
        if (validPairs.length < 5) return { x: xOpt.value, y: yOpt.value, correlation: 0 };
        
        const xVals = validPairs.map(p => p!.x);
        const yVals = validPairs.map(p => p!.y);
        const corr = calculateCorrelation(xVals, yVals);
        
        return {
          x: xOpt.value,
          y: yOpt.value,
          correlation: corr
        };
      });
    }).flat();
    
    // Generate regression line points
    const minX = Math.min(...validXValues);
    const maxX = Math.max(...validXValues);
    const regressionPoints = [
      { x: minX, y: regression.slope * minX + regression.intercept },
      { x: maxX, y: regression.slope * maxX + regression.intercept }
    ];
    
    // Calculate strengths of relationship with other variables
    const relationshipStrengths = variableOptions
      .filter(opt => opt.value !== xVariable)
      .map(opt => {
        const isOptDeep = opt.value.includes('deepPhenotype');
        
        const validPairs = data
          .map(p => {
            const xVal = isXDeepPhenotype ? getNestedValue(p, xVariable) : p[xVariable];
            const yVal = isOptDeep ? getNestedValue(p, opt.value) : p[opt.value];
            
            if (xVal !== undefined && yVal !== undefined && xVal !== null && yVal !== null) {
              return { x: xVal, y: yVal };
            }
            
            return null;
          })
          .filter(Boolean);
        
        if (validPairs.length < 5) return { variable: opt.label, strength: 0 };
        
        const xVals = validPairs.map(p => p!.x);
        const yVals = validPairs.map(p => p!.y);
        const corr = Math.abs(calculateCorrelation(xVals, yVals));
        
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
      scatterData: validDataPoints as any[],
      regressionPoints,
      relationshipStrengths,
      radarData,
      dataCount: validDataPoints.length
    };
  }, [data, xVariable, yVariable, variableOptions]);
  
  const getVariableLabel = (variableValue: string) => {
    return variableOptions.find(v => v.value === variableValue)?.label || variableValue;
  };
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Correlation Analysis Results</AlertTitle>
        <AlertDescription>
          The correlation between {getVariableLabel(xVariable)} and {" "}
          {getVariableLabel(yVariable)} is{" "}
          <strong>{analysisResults.correlationValue.toFixed(3)}</strong> 
          {" (based on "}{analysisResults.dataCount}{" data points)."}
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
              xAxis={getVariableLabel(xVariable)}
              yAxis={getVariableLabel(yVariable)}
              regressionLine={analysisResults.regressionPoints}
              height={300}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Variable Relationship Strengths</CardTitle>
            <CardDescription>
              Absolute correlation values with {getVariableLabel(xVariable)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analysisResults.relationshipStrengths.slice(0, 10)}
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
            data={analysisResults.radarData.slice(0, 8)}
            dataKey="variable"
            categories={variableOptions
              .map(opt => opt.label)
              .filter(label => label !== getVariableLabel(xVariable))
              .slice(0, 7)
            }
            valueFormatter={(value) => value.toFixed(2)}
            height={320}
          />
        </CardContent>
      </Card>
      
      <div className="text-sm">
        <p>
          <strong>Regression Equation:</strong>{" "}
          {getVariableLabel(yVariable)} = {analysisResults.regression.slope.toFixed(3)} × {getVariableLabel(xVariable)} {analysisResults.regression.intercept >= 0 ? "+" : ""} {analysisResults.regression.intercept.toFixed(3)}
        </p>
        <p className="mt-2">
          This suggests that for each unit increase in {getVariableLabel(xVariable)}, 
          {getVariableLabel(yVariable)} changes by approximately {analysisResults.regression.slope.toFixed(3)} units.
        </p>
        <p className="mt-2">
          <strong>R-squared value:</strong> {(analysisResults.correlationValue * analysisResults.correlationValue).toFixed(3)}. 
          This indicates that approximately {Math.round(analysisResults.correlationValue * analysisResults.correlationValue * 100)}% of the 
          variation in {getVariableLabel(yVariable)} can be explained by {" "}
          {getVariableLabel(xVariable)}.
        </p>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;
