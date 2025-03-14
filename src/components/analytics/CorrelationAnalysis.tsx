
import React from "react";
import { calculateCorrelation, linearRegression } from "@/utils/analyticsUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ScatterChart from "@/components/ScatterChart";

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
  // Extract the variables from data
  const xValues = data.map(p => p[xVariable]);
  const yValues = data.map(p => p[yVariable]);
  
  // Run correlation and regression
  const correlationValue = calculateCorrelation(xValues, yValues);
  const regression = linearRegression(xValues, yValues);
  
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
  
  return (
    <>
      <Alert>
        <AlertTitle>Correlation Analysis Results</AlertTitle>
        <AlertDescription>
          The correlation between {variableOptions.find(v => v.value === xVariable)?.label} and {" "}
          {variableOptions.find(v => v.value === yVariable)?.label} is{" "}
          <strong>{correlationValue.toFixed(3)}</strong>.
          {Math.abs(correlationValue) > 0.7 && " This indicates a strong relationship."}
          {Math.abs(correlationValue) > 0.4 && Math.abs(correlationValue) <= 0.7 && " This indicates a moderate relationship."}
          {Math.abs(correlationValue) <= 0.4 && " This indicates a weak relationship."}
        </AlertDescription>
      </Alert>
      
      <ScatterChart
        data={scatterData}
        xAxis={variableOptions.find(v => v.value === xVariable)?.label || xVariable}
        yAxis={variableOptions.find(v => v.value === yVariable)?.label || yVariable}
        regressionLine={regressionPoints}
        height={350}
      />
      
      <div className="text-sm">
        <p>
          <strong>Regression Equation:</strong>{" "}
          {variableOptions.find(v => v.value === yVariable)?.label} = {regression.slope.toFixed(3)} × {variableOptions.find(v => v.value === xVariable)?.label} {regression.intercept >= 0 ? "+" : ""} {regression.intercept.toFixed(3)}
        </p>
        <p className="mt-2">
          This suggests that for each unit increase in {variableOptions.find(v => v.value === xVariable)?.label}, 
          {variableOptions.find(v => v.value === yVariable)?.label} changes by approximately {regression.slope.toFixed(3)} units.
        </p>
      </div>
    </>
  );
};

export default CorrelationAnalysis;
