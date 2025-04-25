
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, DatabaseIcon, PlusIcon, MinusIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SimulationConfig, DependencyRelation } from "@/lib/dataSimulation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const DataImportForm = () => {
  const { generateSimulatedData, simulationOptions, setSimulationOptions } = useData();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const [localOptions, setLocalOptions] = useState<SimulationConfig>(simulationOptions);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showDeepPhenotyping, setShowDeepPhenotyping] = useState(false);
  const [showCustomDependencies, setShowCustomDependencies] = useState(false);

  // Predefined variable options for dependencies
  const variableOptions = [
    { value: "age", label: "Age" },
    { value: "riskScore", label: "Risk Score" },
    { value: "lengthOfStay", label: "Length of Stay" },
    { value: "readmissionRisk", label: "Readmission Risk" },
    { value: "bloodPressureSystolic", label: "Blood Pressure (Systolic)" },
    { value: "bloodPressureDiastolic", label: "Blood Pressure (Diastolic)" },
    { value: "heartRate", label: "Heart Rate" },
    { value: "temperature", label: "Temperature" },
    { value: "oxygenSaturation", label: "Oxygen Saturation" },
    { value: "pain", label: "Pain Level" },
  ];

  // Update local options when the context options change
  useEffect(() => {
    setLocalOptions(simulationOptions);
  }, [simulationOptions]);

  const handleSimulateData = () => {
    try {
      console.log("Generating data with options:", localOptions);
      generateSimulatedData(localOptions);
      toast({
        title: "Data generated successfully",
        description: `Generated data for ${localOptions.numParticipants} participants`,
      });
    } catch (error) {
      console.error("Error in handleSimulateData:", error);
      toast({
        variant: "destructive",
        title: "Error generating data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const updateLocalOption = <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => {
    setLocalOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Add a new empty dependency relation
  const addDependencyRelation = () => {
    const newDependency: DependencyRelation = {
      targetVariable: "",
      dependsOn: [],
      coefficients: [],
      noiseLevel: 0.1
    };
    
    const updatedDependencies = localOptions.customDependencies 
      ? [...localOptions.customDependencies, newDependency]
      : [newDependency];
    
    updateLocalOption('customDependencies', updatedDependencies);
    setShowCustomDependencies(true);
  };

  // Remove a dependency relation by index
  const removeDependencyRelation = (indexToRemove: number) => {
    if (!localOptions.customDependencies) return;
    
    const updatedDependencies = localOptions.customDependencies.filter((_, index) => index !== indexToRemove);
    updateLocalOption('customDependencies', updatedDependencies);
  };

  // Update a property of a specific dependency relation
  const updateDependencyRelation = (index: number, key: keyof DependencyRelation, value: any) => {
    if (!localOptions.customDependencies) return;
    
    const updatedDependencies = [...localOptions.customDependencies];
    updatedDependencies[index] = {
      ...updatedDependencies[index],
      [key]: value
    };
    
    updateLocalOption('customDependencies', updatedDependencies);
  };

  // Add a predictor variable to a dependency relation
  const addPredictorVariable = (dependencyIndex: number) => {
    if (!localOptions.customDependencies) return;
    
    const updatedDependencies = [...localOptions.customDependencies];
    const currentDependency = updatedDependencies[dependencyIndex];
    
    updatedDependencies[dependencyIndex] = {
      ...currentDependency,
      dependsOn: [...currentDependency.dependsOn, ""],
      coefficients: [...currentDependency.coefficients, 1.0]
    };
    
    updateLocalOption('customDependencies', updatedDependencies);
  };

  // Remove a predictor variable from a dependency relation
  const removePredictorVariable = (dependencyIndex: number, predictorIndex: number) => {
    if (!localOptions.customDependencies) return;
    
    const updatedDependencies = [...localOptions.customDependencies];
    const currentDependency = updatedDependencies[dependencyIndex];
    
    updatedDependencies[dependencyIndex] = {
      ...currentDependency,
      dependsOn: currentDependency.dependsOn.filter((_, i) => i !== predictorIndex),
      coefficients: currentDependency.coefficients.filter((_, i) => i !== predictorIndex)
    };
    
    updateLocalOption('customDependencies', updatedDependencies);
  };

  // Update a specific predictor variable or coefficient
  const updatePredictorVariable = (dependencyIndex: number, predictorIndex: number, variable: string) => {
    if (!localOptions.customDependencies) return;
    
    const updatedDependencies = [...localOptions.customDependencies];
    updatedDependencies[dependencyIndex].dependsOn[predictorIndex] = variable;
    
    updateLocalOption('customDependencies', updatedDependencies);
  };

  const updateCoefficient = (dependencyIndex: number, predictorIndex: number, value: number) => {
    if (!localOptions.customDependencies) return;
    
    const updatedDependencies = [...localOptions.customDependencies];
    updatedDependencies[dependencyIndex].coefficients[predictorIndex] = value;
    
    updateLocalOption('customDependencies', updatedDependencies);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulate Health QI Data</CardTitle>
        <CardDescription>
          Generate simulated healthcare quality improvement data with various participant phenotypes,
          clinical units, and longitudinal measurements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="num-participants">Number of Participants: {localOptions.numParticipants}</Label>
          </div>
          <Slider
            id="num-participants"
            min={10}
            max={500}
            step={10}
            value={[localOptions.numParticipants]}
            onValueChange={(values) => updateLocalOption('numParticipants', values[0])}
            className="py-4"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(localOptions.startDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localOptions.startDate}
                  onSelect={(date) => date && updateLocalOption('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Data End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(localOptions.endDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localOptions.endDate}
                  onSelect={(date) => date && updateLocalOption('endDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-comorbidities" 
              checked={localOptions.includeComorbidities}
              onCheckedChange={(checked) => 
                updateLocalOption('includeComorbidities', checked === true)
              }
            />
            <Label htmlFor="include-comorbidities">Include patient comorbidities</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-missing-data" 
              checked={localOptions.includeMissingData}
              onCheckedChange={(checked) => 
                updateLocalOption('includeMissingData', checked === true)
              }
            />
            <Label htmlFor="include-missing-data">Include missing data (for realism)</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enable-deep-phenotyping" 
              checked={localOptions.enableDeepPhenotyping}
              onCheckedChange={(checked) => {
                updateLocalOption('enableDeepPhenotyping', checked === true);
                if (checked === true) {
                  setShowDeepPhenotyping(true);
                }
              }}
            />
            <Label htmlFor="enable-deep-phenotyping" className="font-medium">Enable Deep Patient Phenotyping</Label>
          </div>
          
          {localOptions.enableDeepPhenotyping && (
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
                  onClick={() => setShowDeepPhenotyping(!showDeepPhenotyping)}
                >
                  {showDeepPhenotyping ? "Hide details" : "Show details"}
                </Button>
              </div>
              
              {showDeepPhenotyping && (
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
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
          </Button>
        </div>
        
        {showAdvancedOptions && (
          <div className="space-y-6 border rounded-md p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="missing-data-probability">Missing Data Probability</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="missing-data-probability"
                    min={0.01}
                    max={0.3}
                    step={0.01}
                    value={[localOptions.missingDataProbability]}
                    onValueChange={(values) => updateLocalOption('missingDataProbability', values[0])}
                    disabled={!localOptions.includeMissingData}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{(localOptions.missingDataProbability * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="measurement-frequency">Measurement Frequency</Label>
                <Select
                  value={localOptions.measurementFrequency}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    updateLocalOption('measurementFrequency', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (3-7 measurements)</SelectItem>
                    <SelectItem value="medium">Medium (7-14 measurements)</SelectItem>
                    <SelectItem value="high">High (14-30 measurements)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time-patterns">Time Patterns</Label>
                <Select
                  value={localOptions.timePatterns}
                  onValueChange={(value: 'random' | 'realistic') => 
                    updateLocalOption('timePatterns', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random (varied patterns)</SelectItem>
                    <SelectItem value="realistic">Realistic (outcome-based)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data-variability">Data Variability</Label>
                <Select
                  value={localOptions.dataVariability}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    updateLocalOption('dataVariability', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (subtle changes)</SelectItem>
                    <SelectItem value="medium">Medium (moderate changes)</SelectItem>
                    <SelectItem value="high">High (dramatic changes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outcome-distribution">Outcome Distribution</Label>
              <Select
                value={localOptions.outcomeDistribution}
                onValueChange={(value: 'balanced' | 'positive' | 'negative') => 
                  updateLocalOption('outcomeDistribution', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome distribution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced (mixed outcomes)</SelectItem>
                  <SelectItem value="positive">Positive (better outcomes)</SelectItem>
                  <SelectItem value="negative">Negative (worse outcomes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* New Variable Dependencies Section */}
            <Accordion
              type="single"
              collapsible
              value={showCustomDependencies ? "dependencies" : ""}
              onValueChange={(val) => setShowCustomDependencies(val === "dependencies")}
            >
              <AccordionItem value="dependencies">
                <AccordionTrigger className="font-medium text-blue-600">
                  Custom Variable Dependencies
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="text-sm">
                      Define explicit dependencies between variables in the simulated data.
                      For example, create risk scores that depend on specific vital signs or demographic factors.
                    </div>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={addDependencyRelation}
                      className="flex items-center gap-1"
                    >
                      <PlusIcon size={14} />
                      Add Variable Dependency
                    </Button>
                    
                    {localOptions.customDependencies?.map((dependency, dependencyIndex) => (
                      <div key={dependencyIndex} className="border rounded-md p-3 bg-gray-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Dependency #{dependencyIndex + 1}</h4>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeDependencyRelation(dependencyIndex)}
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <MinusIcon size={14} />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`target-variable-${dependencyIndex}`}>Target Variable</Label>
                            <Select
                              value={dependency.targetVariable}
                              onValueChange={(value) => updateDependencyRelation(dependencyIndex, 'targetVariable', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select target variable" />
                              </SelectTrigger>
                              <SelectContent>
                                {variableOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Predictor Variables</Label>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => addPredictorVariable(dependencyIndex)}
                                className="h-6 flex items-center gap-1 text-blue-600"
                              >
                                <PlusIcon size={12} />
                                Add
                              </Button>
                            </div>
                            
                            {dependency.dependsOn.map((predictor, predictorIndex) => (
                              <div key={predictorIndex} className="flex items-end gap-2 bg-white p-2 rounded border">
                                <div className="flex-1">
                                  <Label htmlFor={`predictor-${dependencyIndex}-${predictorIndex}`} className="text-xs">
                                    Variable
                                  </Label>
                                  <Select
                                    value={predictor}
                                    onValueChange={(value) => updatePredictorVariable(dependencyIndex, predictorIndex, value)}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select variable" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {variableOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="w-24">
                                  <Label htmlFor={`coefficient-${dependencyIndex}-${predictorIndex}`} className="text-xs">
                                    Coefficient
                                  </Label>
                                  <Input
                                    id={`coefficient-${dependencyIndex}-${predictorIndex}`}
                                    type="number"
                                    value={dependency.coefficients[predictorIndex]}
                                    onChange={(e) => updateCoefficient(
                                      dependencyIndex,
                                      predictorIndex,
                                      parseFloat(e.target.value) || 0
                                    )}
                                    className="mt-1"
                                    step="0.1"
                                  />
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePredictorVariable(dependencyIndex, predictorIndex)}
                                  className="h-8 w-8 text-red-500 mb-1"
                                >
                                  <MinusIcon size={14} />
                                </Button>
                              </div>
                            ))}
                            
                            {dependency.dependsOn.length === 0 && (
                              <div className="text-sm text-gray-500 italic p-1">
                                No predictor variables defined yet
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor={`noise-level-${dependencyIndex}`}>
                              Noise Level: {(dependency.noiseLevel * 100).toFixed(0)}%
                            </Label>
                            <Slider
                              id={`noise-level-${dependencyIndex}`}
                              min={0}
                              max={1}
                              step={0.05}
                              value={[dependency.noiseLevel]}
                              onValueChange={(values) => 
                                updateDependencyRelation(dependencyIndex, 'noiseLevel', values[0])
                              }
                            />
                          </div>
                          
                          {dependency.targetVariable && dependency.dependsOn.length > 0 && (
                            <div className="text-xs bg-gray-100 p-2 rounded border mt-2">
                              <span className="font-medium">Formula:</span> {dependency.targetVariable} = 
                              {dependency.dependsOn.map((variable, idx) => (
                                <Badge key={idx} variant="outline" className="mx-1">
                                  {dependency.coefficients[idx]} × {variable || "?"}
                                </Badge>
                              ))}
                              {dependency.noiseLevel > 0 && (
                                <span> + noise({(dependency.noiseLevel * 100).toFixed(0)}%)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(localOptions.customDependencies?.length || 0) === 0 && (
                      <div className="text-sm text-gray-500 italic">
                        No custom dependencies defined yet. Click "Add Variable Dependency" to create one.
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
        
        <Button onClick={handleSimulateData} className="w-full flex items-center justify-center gap-2">
          <DatabaseIcon size={16} />
          Generate Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataImportForm;
