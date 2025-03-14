
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">About SOCR-QI</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Overview</CardTitle>
          <CardDescription>
            Health Quality Improvement Data Simulation and Analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            SOCR-QI is a web application designed for healthcare quality improvement (QI) data simulation, 
            visualization, and analytics. The application enables users to generate or import healthcare 
            data representing a wide range of participant phenotypes across multiple clinical units.
          </p>
          <p>
            The application supports various data types, including categorical, binary, discrete, and 
            continuous variables, as well as time-varying longitudinal measurements for tracking 
            clinical progression of patients.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Data Simulation:</strong> Generate realistic healthcare QI data with various 
                participant phenotypes, measurements, and outcomes.
              </li>
              <li>
                <strong>Data Import:</strong> Upload your own healthcare quality improvement data in 
                JSON format.
              </li>
              <li>
                <strong>Data Summary:</strong> View comprehensive statistical summaries of your dataset.
              </li>
              <li>
                <strong>Visualization:</strong> Explore data through tables and interactive charts.
              </li>
              <li>
                <strong>Analytics:</strong> Perform statistical analyses, risk factor assessments, and 
                quality improvement metrics calculations.
              </li>
              <li>
                <strong>Reporting:</strong> Generate reports summarizing findings and export them for 
                presentation.
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Education:</strong> Teaching healthcare quality improvement methods and data 
                analysis to students and practitioners.
              </li>
              <li>
                <strong>Research:</strong> Exploring relationships between clinical variables and 
                patient outcomes.
              </li>
              <li>
                <strong>Healthcare Planning:</strong> Developing and testing quality improvement 
                initiatives based on data analysis.
              </li>
              <li>
                <strong>Clinical Practice:</strong> Monitoring and improving patient care quality 
                metrics across different units.
              </li>
              <li>
                <strong>Benchmarking:</strong> Comparing performance metrics across different 
                clinical settings.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Data Structure</h3>
            <p className="mb-2">
              The SOCR-QI application works with healthcare quality improvement data that includes 
              the following components:
            </p>
            <ul className="space-y-1 list-disc pl-5 text-sm">
              <li>
                <strong>Participant Demographics:</strong> ID, age, gender
              </li>
              <li>
                <strong>Clinical Information:</strong> Unit, condition, risk score, outcome
              </li>
              <li>
                <strong>Stay Information:</strong> Length of stay, readmission risk
              </li>
              <li>
                <strong>Measurements:</strong> Time series data including vital signs and other clinical measurements
              </li>
              <li>
                <strong>Treatments:</strong> Interventions applied to the participant, including effectiveness measures
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Data Import Format</h3>
            <p className="mb-2">
              When importing your own data, it should be in JSON format following this structure:
            </p>
            <div className="bg-gray-50 p-3 rounded-md text-sm overflow-auto">
              <pre>
{`[
  {
    "id": "P0001",
    "age": 65,
    "gender": "Female",
    "unit": "Cardiology",
    "condition": "Heart Disease",
    "riskScore": 75.5,
    "outcome": "Improved",
    "lengthOfStay": 8,
    "readmissionRisk": 25.3,
    "measurements": [
      {
        "date": "2023-01-01",
        "bloodPressureSystolic": 145,
        "bloodPressureDiastolic": 90,
        "heartRate": 88,
        "temperature": 37.2,
        "oxygenSaturation": 94,
        "pain": 3
      },
      // Additional measurements...
    ],
    "treatments": [
      {
        "name": "Medication A",
        "startDate": "2023-01-01",
        "endDate": "2023-01-08",
        "effectiveness": 85
      },
      // Additional treatments...
    ]
  },
  // Additional participants...
]`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>SOCR Resources</CardTitle>
          <CardDescription>
            Explore more Statistical Online Computational Resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a 
              href="https://www.socr.umich.edu/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              <h3 className="font-medium text-blue-600 mb-1">SOCR Main</h3>
              <p className="text-sm text-gray-600">Visit the main SOCR website</p>
            </a>
            <a 
              href="https://wiki.socr.umich.edu/index.php/SOCR_Data" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              <h3 className="font-medium text-blue-600 mb-1">SOCR Data</h3>
              <p className="text-sm text-gray-600">Access SOCR data resources</p>
            </a>
            <a 
              href="https://socr.umich.edu/HTML5/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              <h3 className="font-medium text-blue-600 mb-1">SOCR Apps</h3>
              <p className="text-sm text-gray-600">Explore other SOCR applications</p>
            </a>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>SOCR Development Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The Statistics Online Computational Resource (SOCR) is developed by a team of 
            researchers, educators, and developers at the University of Michigan.
          </p>
          <a 
            href="https://www.socr.umich.edu/people/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Learn more about the SOCR team →
          </a>
          
          <Separator className="my-6" />
          
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Statistics Online Computational Resource (SOCR)</p>
            <p className="mt-1">University of Michigan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
