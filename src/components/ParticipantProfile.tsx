import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import ClinicalNarrative from "@/components/ClinicalNarrative";

interface ParticipantProfileProps {
  participant: any;
}

const ParticipantProfile: React.FC<ParticipantProfileProps> = ({ participant }) => {
  // Format measurements for time series chart
  const measurementsByType: Record<string, any[]> = {};
  
  // Ensure measurements are initialized properly
  if (participant.measurements && Array.isArray(participant.measurements)) {
    participant.measurements.forEach((measurement: any) => {
      if (!measurement || !measurement.type) return;
      
      if (!measurementsByType[measurement.type]) {
        measurementsByType[measurement.type] = [];
      }
      
      measurementsByType[measurement.type].push({
        timestamp: new Date(measurement.timestamp).toLocaleString(),
        value: measurement.value,
        type: measurement.type
      });
    });
  }

  // Sort measurements by timestamp
  Object.values(measurementsByType).forEach(measurements => {
    measurements.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  // Get a list of all measurement types
  const measurementTypes = Object.keys(measurementsByType);

  // Prepare data for multiline chart
  const chartData = (() => {
    // Find all unique timestamps across all measurement types
    const allTimestamps = new Set<string>();
    Object.values(measurementsByType).forEach(measurements => {
      measurements.forEach(m => allTimestamps.add(m.timestamp));
    });

    // Sort timestamps chronologically
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    // Create data points with values for each measurement type
    return sortedTimestamps.map(timestamp => {
      const dataPoint: Record<string, any> = { timestamp };
      
      // For each measurement type, find the value at this timestamp
      measurementTypes.forEach(type => {
        const measurement = measurementsByType[type].find(m => m.timestamp === timestamp);
        dataPoint[type] = measurement ? measurement.value : null;
      });
      
      return dataPoint;
    });
  })();

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

  // Check if deep phenotype data is available
  const hasDeepPhenotype = !!participant.deepPhenotype;

  return (
    <div className="space-y-6">
      {/* Add the Clinical Narrative at the top */}
      <ClinicalNarrative participant={participant} />

      <Card>
        <CardHeader>
          <CardTitle>Participant Profile</CardTitle>
          <CardDescription>
            Detailed case study for participant ID: {participant.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <h3 className="text-lg font-medium mb-4">Demographics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{participant.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{participant.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clinical Unit</p>
                  <p className="font-medium">{participant.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium">{participant.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Outcome</p>
                  <p className="font-medium">{participant.outcome}</p>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-medium mb-4">Clinical Indicators</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          participant.riskScore < 30 ? "bg-green-500" : 
                          participant.riskScore < 70 ? "bg-yellow-500" : "bg-red-500"
                        }`} 
                        style={{ width: `${participant.riskScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{participant.riskScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Length of Stay</p>
                  <p className="font-medium">{participant.lengthOfStay} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Readmission Risk</p>
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          participant.readmissionRisk < 30 ? "bg-green-500" : 
                          participant.readmissionRisk < 70 ? "bg-yellow-500" : "bg-red-500"
                        }`} 
                        style={{ width: `${participant.readmissionRisk}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{participant.readmissionRisk}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-medium mb-4">Key Statistics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Measurements Recorded</p>
                  <p className="font-medium">{participant.measurements ? participant.measurements.length : 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Treatments Administered</p>
                  <p className="font-medium">{participant.treatments ? participant.treatments.length : 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Measurement Types</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {participant.measurements && Array.isArray(participant.measurements) && 
                      [...new Set(participant.measurements.map((m: any) => m.type))]
                        .filter((type: string | undefined) => type !== undefined)
                        .map((type: string) => (
                          <Badge key={type} variant="outline">{type}</Badge>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clinical Measurements</CardTitle>
          <CardDescription>Time series data for tracked clinical parameters</CardDescription>
        </CardHeader>
        <CardContent>
          {measurementTypes.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {measurementTypes.map((type, index) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      name={type}
                      stroke={colors[index % colors.length]}
                      activeDot={{ r: 8 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500">No measurement data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Treatment History</CardTitle>
          <CardDescription>Interventions and medications administered</CardDescription>
        </CardHeader>
        <CardContent>
          {participant.treatments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participant.treatments.map((treatment: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{treatment.name}</TableCell>
                      <TableCell>
                        {new Date(treatment.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'Ongoing'}
                      </TableCell>
                      <TableCell>{treatment.dosage}</TableCell>
                      <TableCell>{treatment.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No treatment data available</p>
          )}
        </CardContent>
      </Card>

      {hasDeepPhenotype && (
        <Card>
          <CardHeader>
            <CardTitle>Deep Phenotype Profile</CardTitle>
            <CardDescription>Enhanced patient characterization data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-3">Patient-Reported Outcomes</h3>
                <div className="space-y-4">
                  {participant.deepPhenotype.qualityOfLifeScore !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Quality of Life Score</span>
                        <span className="font-medium">{participant.deepPhenotype.qualityOfLifeScore}/100</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${participant.deepPhenotype.qualityOfLifeScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {participant.deepPhenotype.patientSatisfactionScore !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Patient Satisfaction</span>
                        <span className="font-medium">{participant.deepPhenotype.patientSatisfactionScore}/100</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${participant.deepPhenotype.patientSatisfactionScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {participant.deepPhenotype.symptomBurden !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Symptom Burden</span>
                        <span className="font-medium">{participant.deepPhenotype.symptomBurden}/10</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-yellow-500 rounded-full" 
                          style={{ width: `${(participant.deepPhenotype.symptomBurden / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {participant.deepPhenotype.functionalStatus && (
                <div>
                  <h3 className="text-md font-medium mb-3">Functional Status</h3>
                  <div className="space-y-4">
                    {Object.entries(participant.deepPhenotype.functionalStatus).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm">
                          <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                          <span className="font-medium">{value}/100</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParticipantProfile;
