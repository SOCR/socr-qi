
import { useState } from "react";
import { SimulationConfig, DependencyRelation } from "@/lib/dataSimulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PlusIcon, MinusIcon } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CustomDependenciesProps {
  options: SimulationConfig;
  updateOption: <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => void;
}

const CustomDependencies = ({ options, updateOption }: CustomDependenciesProps) => {
  const [showDependencies, setShowDependencies] = useState(false);
  
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

  // Add a new empty dependency relation
  const addDependencyRelation = () => {
    const newDependency: DependencyRelation = {
      targetVariable: "",
      dependsOn: [],
      coefficients: [],
      noiseLevel: 0.1
    };
    
    const updatedDependencies = options.customDependencies 
      ? [...options.customDependencies, newDependency]
      : [newDependency];
    
    updateOption('customDependencies', updatedDependencies);
    setShowDependencies(true);
  };

  // Remove a dependency relation by index
  const removeDependencyRelation = (indexToRemove: number) => {
    if (!options.customDependencies) return;
    
    const updatedDependencies = options.customDependencies.filter((_, index) => index !== indexToRemove);
    updateOption('customDependencies', updatedDependencies);
  };

  // Update a property of a specific dependency relation
  const updateDependencyRelation = (index: number, key: keyof DependencyRelation, value: any) => {
    if (!options.customDependencies) return;
    
    const updatedDependencies = [...options.customDependencies];
    updatedDependencies[index] = {
      ...updatedDependencies[index],
      [key]: value
    };
    
    updateOption('customDependencies', updatedDependencies);
  };

  // Add a predictor variable to a dependency relation
  const addPredictorVariable = (dependencyIndex: number) => {
    if (!options.customDependencies) return;
    
    const updatedDependencies = [...options.customDependencies];
    const currentDependency = updatedDependencies[dependencyIndex];
    
    updatedDependencies[dependencyIndex] = {
      ...currentDependency,
      dependsOn: [...currentDependency.dependsOn, ""],
      coefficients: [...currentDependency.coefficients, 1.0]
    };
    
    updateOption('customDependencies', updatedDependencies);
  };

  // Remove a predictor variable from a dependency relation
  const removePredictorVariable = (dependencyIndex: number, predictorIndex: number) => {
    if (!options.customDependencies) return;
    
    const updatedDependencies = [...options.customDependencies];
    const currentDependency = updatedDependencies[dependencyIndex];
    
    updatedDependencies[dependencyIndex] = {
      ...currentDependency,
      dependsOn: currentDependency.dependsOn.filter((_, i) => i !== predictorIndex),
      coefficients: currentDependency.coefficients.filter((_, i) => i !== predictorIndex)
    };
    
    updateOption('customDependencies', updatedDependencies);
  };

  // Update a specific predictor variable or coefficient
  const updatePredictorVariable = (dependencyIndex: number, predictorIndex: number, variable: string) => {
    if (!options.customDependencies) return;
    
    const updatedDependencies = [...options.customDependencies];
    updatedDependencies[dependencyIndex].dependsOn[predictorIndex] = variable;
    
    updateOption('customDependencies', updatedDependencies);
  };

  const updateCoefficient = (dependencyIndex: number, predictorIndex: number, value: number) => {
    if (!options.customDependencies) return;
    
    const updatedDependencies = [...options.customDependencies];
    updatedDependencies[dependencyIndex].coefficients[predictorIndex] = value;
    
    updateOption('customDependencies', updatedDependencies);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={showDependencies ? "dependencies" : ""}
      onValueChange={(val) => setShowDependencies(val === "dependencies")}
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
            
            {options.customDependencies?.map((dependency, dependencyIndex) => (
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
            
            {(options.customDependencies?.length || 0) === 0 && (
              <div className="text-sm text-gray-500 italic">
                No custom dependencies defined yet. Click "Add Variable Dependency" to create one.
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CustomDependencies;
