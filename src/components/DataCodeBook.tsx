
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "@/context/DataContext";

const DataCodeBook = () => {
  const { data } = useData();
  
  // Define the data dictionary based on the structure of the data
  const dataElements = [
    { 
      name: "id", 
      type: "String", 
      description: "Unique identifier for each participant",
      range: "Alphanumeric",
      unit: "N/A",
      reference: "Generated as unique values for each participant"
    },
    { 
      name: "gender", 
      type: "Categorical", 
      description: "Gender of the participant",
      range: "Male, Female, Other",
      unit: "N/A",
      reference: "Self-reported demographic data"
    },
    { 
      name: "age", 
      type: "Numeric", 
      description: "Age of the participant",
      range: "18-100",
      unit: "Years",
      reference: "Age at the time of data collection"
    },
    { 
      name: "condition", 
      type: "Categorical", 
      description: "Clinical condition/diagnosis",
      range: "Multiple values based on ICD-10 codes",
      unit: "N/A",
      reference: "Primary clinical diagnosis"
    },
    { 
      name: "unit", 
      type: "Categorical", 
      description: "Clinical unit/department",
      range: "ICU, General, Emergency, etc.",
      unit: "N/A",
      reference: "Hospital unit where patient received care"
    },
    { 
      name: "riskScore", 
      type: "Numeric", 
      description: "Clinical risk assessment score",
      range: "0-100",
      unit: "Score",
      reference: "Computed based on clinical parameters, higher values indicate greater risk"
    },
    { 
      name: "lengthOfStay", 
      type: "Numeric", 
      description: "Duration of hospital stay",
      range: "0-365",
      unit: "Days",
      reference: "Calendar days from admission to discharge"
    },
    { 
      name: "readmissionRisk", 
      type: "Numeric", 
      description: "Probability of readmission",
      range: "0-100",
      unit: "Percentage",
      reference: "Predicted probability based on historical data and clinical parameters"
    },
    { 
      name: "outcome", 
      type: "Categorical", 
      description: "Clinical outcome",
      range: "Recovered, Transferred, Deceased, etc.",
      unit: "N/A",
      reference: "Status at discharge or end of study period"
    },
    { 
      name: "measurements", 
      type: "Array", 
      description: "Clinical measurements",
      range: "Collection of time series data",
      unit: "Various",
      reference: "Array of measurement objects with timestamp, type, and value properties"
    },
    { 
      name: "treatments", 
      type: "Array", 
      description: "Treatment interventions",
      range: "Collection of treatment records",
      unit: "Various",
      reference: "Array of treatment objects with name, startDate, endDate, and dosage properties"
    }
  ];
  
  // Add deep phenotype variables if they exist in the data
  const hasDeepPhenotype = data.some(p => p.deepPhenotype);
  
  const deepPhenotypeElements = [
    { 
      name: "deepPhenotype.qualityOfLifeScore", 
      type: "Numeric", 
      description: "Patient-reported quality of life assessment",
      range: "0-100",
      unit: "Score",
      reference: "Standardized quality of life instrument, higher scores indicate better QoL"
    },
    { 
      name: "deepPhenotype.patientSatisfactionScore", 
      type: "Numeric", 
      description: "Patient satisfaction with care",
      range: "0-100",
      unit: "Score",
      reference: "Patient satisfaction survey, higher scores indicate greater satisfaction"
    },
    { 
      name: "deepPhenotype.symptomBurden", 
      type: "Numeric", 
      description: "Level of symptom burden experienced",
      range: "0-10",
      unit: "Score",
      reference: "Composite score based on symptom intensity and frequency, higher scores indicate greater burden"
    },
    { 
      name: "deepPhenotype.adlScore", 
      type: "Numeric", 
      description: "Activities of Daily Living score",
      range: "0-100",
      unit: "Score",
      reference: "Measure of functional independence, higher scores indicate greater independence"
    },
    { 
      name: "deepPhenotype.mentalHealthScore", 
      type: "Numeric", 
      description: "Mental health assessment",
      range: "0-100",
      unit: "Score",
      reference: "Standardized mental health instrument, higher scores indicate better mental health"
    },
    { 
      name: "deepPhenotype.functionalStatus.physicalFunction", 
      type: "Numeric", 
      description: "Physical function capability",
      range: "0-100",
      unit: "Score",
      reference: "Assessment of physical capabilities, higher scores indicate better function"
    },
    { 
      name: "deepPhenotype.functionalStatus.mobility", 
      type: "Numeric", 
      description: "Mobility assessment",
      range: "0-100",
      unit: "Score",
      reference: "Measure of movement capability, higher scores indicate better mobility"
    },
    { 
      name: "deepPhenotype.functionalStatus.adlIndependence", 
      type: "Numeric", 
      description: "Independence in activities of daily living",
      range: "0-100",
      unit: "Score",
      reference: "Assessment of independence in daily activities, higher scores indicate greater independence"
    },
    { 
      name: "deepPhenotype.functionalStatus.cognitiveFunction", 
      type: "Numeric", 
      description: "Cognitive function assessment",
      range: "0-100",
      unit: "Score",
      reference: "Standardized cognitive assessment, higher scores indicate better cognitive function"
    },
    { 
      name: "deepPhenotype.functionalStatus.frailtyIndex", 
      type: "Numeric", 
      description: "Frailty assessment",
      range: "0-1",
      unit: "Index",
      reference: "Validated frailty scale, higher values indicate greater frailty"
    }
  ];

  // Combined elements based on data availability
  const allDataElements = hasDeepPhenotype 
    ? [...dataElements, ...deepPhenotypeElements]
    : dataElements;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Data Dictionary</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive reference of all variables in the dataset, including types, ranges, and descriptions.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Range/Values</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Reference/Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDataElements.map((element) => (
                <TableRow key={element.name}>
                  <TableCell className="font-medium">{element.name}</TableCell>
                  <TableCell>{element.type}</TableCell>
                  <TableCell>{element.description}</TableCell>
                  <TableCell>{element.range}</TableCell>
                  <TableCell>{element.unit}</TableCell>
                  <TableCell className="max-w-xs">{element.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataCodeBook;
