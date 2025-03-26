
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { RegressionResult } from "@/utils/analyticsUtils";

interface RegressionAnalysisProps {
  regressionResults: RegressionResult;
  outcomeVariable: string;
  selectedPredictors: string[];
  variableOptions: { value: string; label: string }[];
}

// Function to format p-values with significance stars
const formatPValue = (pValue: number) => {
  let stars = '';
  if (pValue < 0.001) stars = '***';
  else if (pValue < 0.01) stars = '**';
  else if (pValue < 0.05) stars = '*';
  
  return `${pValue.toFixed(4)}${stars}`;
};

// Function to format coefficient values
const formatCoef = (value: number) => {
  return value.toFixed(4);
};

const RegressionAnalysis: React.FC<RegressionAnalysisProps> = ({
  regressionResults,
  outcomeVariable,
  selectedPredictors,
  variableOptions
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Linear Regression Model</CardTitle>
          <CardDescription>
            Modeling {variableOptions.find(v => v.value === outcomeVariable)?.label || outcomeVariable} 
            using {selectedPredictors.length} predictor{selectedPredictors.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Model Summary</h3>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">R²</p>
                  <p className="text-lg font-medium">{regressionResults.rSquared.toFixed(3)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Adjusted R²</p>
                  <p className="text-lg font-medium">{regressionResults.adjustedRSquared.toFixed(3)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">F-statistic</p>
                  <p className="text-lg font-medium">{regressionResults.fStat.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Observations</p>
                  <p className="text-lg font-medium">{regressionResults.observations}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Model Equation</h3>
              <p className="mt-2 p-3 bg-gray-100 rounded font-mono text-sm overflow-x-auto">
                {outcomeVariable} = {regressionResults.intercept.toFixed(2)}
                {regressionResults.coefficients.map(coef => 
                  ` ${coef.value >= 0 ? '+' : ''} ${coef.value.toFixed(2)} × ${coef.name}`
                )}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Coefficients</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coefficient</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Std. Error</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">t-statistic</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">p-value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">(Intercept)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCoef(regressionResults.intercept)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                    </tr>
                    {regressionResults.coefficients.map((coef, index) => (
                      <tr key={index} className={coef.pValue < 0.05 ? "bg-blue-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {variableOptions.find(v => v.value === coef.name)?.label || coef.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCoef(coef.value)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCoef(coef.standardError)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCoef(coef.tStat)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatPValue(coef.pValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-gray-500">Significance codes: *** p&lt;0.001, ** p&lt;0.01, * p&lt;0.05</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Interpretation</h3>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    The model explains <strong>{(regressionResults.rSquared * 100).toFixed(1)}%</strong> of 
                    the variance in {variableOptions.find(v => v.value === outcomeVariable)?.label || outcomeVariable} 
                    (R² = {regressionResults.rSquared.toFixed(3)}).
                  </li>
                  <li>
                    The overall model is 
                    {regressionResults.fStatPValue < 0.05 ? 
                      <strong className="text-green-600"> statistically significant</strong> :
                      <strong className="text-red-600"> not statistically significant</strong>}
                    {regressionResults.fStatPValue < 0.05 ? 
                      ` (F = ${regressionResults.fStat.toFixed(2)}, p < 0.05).` :
                      ` (F = ${regressionResults.fStat.toFixed(2)}, p > 0.05).`}
                  </li>
                  {regressionResults.coefficients
                    .filter(coef => coef.pValue < 0.05)
                    .map((coef, index) => (
                      <li key={index}>
                        <strong>{variableOptions.find(v => v.value === coef.name)?.label || coef.name}</strong> has a 
                        {coef.value > 0 ? " positive" : " negative"} and statistically significant effect 
                        (β = {coef.value.toFixed(3)}, p {coef.pValue < 0.001 ? "< 0.001" : coef.pValue < 0.01 ? "< 0.01" : "< 0.05"}).
                      </li>
                  ))}
                  {regressionResults.coefficients
                    .filter(coef => coef.pValue >= 0.05)
                    .length > 0 && (
                      <li>
                        The following variables did not have a statistically significant effect: 
                        {regressionResults.coefficients
                          .filter(coef => coef.pValue >= 0.05)
                          .map(coef => variableOptions.find(v => v.value === coef.name)?.label || coef.name)
                          .join(", ")}.
                      </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegressionAnalysis;
