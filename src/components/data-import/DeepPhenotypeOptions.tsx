
import { useState } from "react";
import { SimulationConfig } from "@/lib/dataSimulation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DeepPhenotypeOptionsProps {
  options: SimulationConfig;
  updateOption: <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => void;
}

const DeepPhenotypeOptions = ({ options, updateOption }: DeepPhenotypeOptionsProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="enable-deep-phenotyping" 
          checked={options.enableDeepPhenotyping}
          onCheckedChange={(checked) => {
            updateOption('enableDeepPhenotyping', checked === true);
          }}
        />
        <Label htmlFor="enable-deep-phenotyping" className="font-medium">Enable Deep Patient Phenotyping</Label>
      </div>
      
      {options.enableDeepPhenotyping && (
        <div className="ml-6 pl-2 border-l-2 border-blue-300">
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-blue-600">Expanded patient data will include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Demographics (race, SES, insurance, education)</li>
              <li>Clinical measures (mortality, readmission, complications)</li>
              <li>Process measures (treatment time, compliance, adherence)</li>
              <li>Patient-reported outcomes (QoL, satisfaction, engagement)</li>
              <li>Treatment data (medication adherence, adverse events)</li>
              <li>Healthcare utilization patterns and costs</li>
              <li>Longitudinal tracking of disease-specific measures</li>
              <li>Social determinants of health indicators</li>
            </ul>
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide details" : "Show details"}
            </Button>
          </div>
          
          {showDetails && (
            <div className="mt-2 text-sm border rounded-md p-3 bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-1">Deep Phenotyping Variables</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700">Patient Demographics</h4>
                  <p className="text-xs text-gray-600">Age, gender, race/ethnicity, SES, insurance, language, education, location</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Clinical Measures</h4>
                  <p className="text-xs text-gray-600">Mortality, readmission, complications, infections, LOS, functional status, pain scores</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Process Measures</h4>
                  <p className="text-xs text-gray-600">Treatment timing, medication reconciliation, guideline adherence, preventive care</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Patient-Reported Outcomes</h4>
                  <p className="text-xs text-gray-600">Quality of life, satisfaction, engagement, symptoms, ADLs, mental health</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Longitudinal Tracking</h4>
                  <p className="text-xs text-gray-600">Disease-specific measures, functional status, healthcare utilization, treatment adherence</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Social & System Factors</h4>
                  <p className="text-xs text-gray-600">Housing, food security, employment, transportation, provider factors, system metrics</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeepPhenotypeOptions;
