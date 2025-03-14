
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoDataMessage from "@/components/NoDataMessage";
import MissingnessAnalysis from "@/components/MissingnessAnalysis";
import TemporalTrends from "@/components/TemporalTrends";

const DataSummary = () => {
  const { data, isDataLoaded } = useData();

  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  // Calculate summary statistics
  const totalParticipants = data.length;
  
  // Count by unit
  const unitCounts = data.reduce((acc, participant) => {
    acc[participant.unit] = (acc[participant.unit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by gender
  const genderCounts = data.reduce((acc, participant) => {
    acc[participant.gender] = (acc[participant.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by condition
  const conditionCounts = data.reduce((acc, participant) => {
    acc[participant.condition] = (acc[participant.condition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by outcome
  const outcomeCounts = data.reduce((acc, participant) => {
    acc[participant.outcome] = (acc[participant.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Age statistics
  const ages = data.map(p => p.age);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  const avgAge = Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);

  // Length of stay statistics
  const losValues = data.map(p => p.lengthOfStay);
  const minLOS = Math.min(...losValues);
  const maxLOS = Math.max(...losValues);
  const avgLOS = Math.round(losValues.reduce((sum, los) => sum + los, 0) / losValues.length);

  // Risk score statistics
  const riskScores = data.map(p => p.riskScore);
  const avgRiskScore = Math.round(riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length);

  // Average number of measurements per patient
  const avgMeasurements = Math.round(
    data.reduce((sum, p) => sum + p.measurements.length, 0) / data.length
  );

  // Average number of treatments per patient
  const avgTreatments = Math.round(
    data.reduce((sum, p) => sum + p.treatments.length, 0) / data.length
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Summary</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalParticipants}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Age Range</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{minAge} - {maxAge}</p>
            <p className="text-sm text-muted-foreground">Avg: {avgAge}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Length of Stay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgLOS} days</p>
            <p className="text-sm text-muted-foreground">Range: {minLOS} - {maxLOS}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgRiskScore}</p>
            <p className="text-sm text-muted-foreground">Scale: 0-100</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demographics">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(genderCounts).map(([gender, count]) => (
                    <div key={gender} className="flex justify-between items-center">
                      <span>{gender}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / totalParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / totalParticipants) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unit Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(unitCounts).map(([unit, count]) => (
                    <div key={unit} className="flex justify-between items-center">
                      <span>{unit}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / totalParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / totalParticipants) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Condition Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(conditionCounts).map(([condition, count]) => (
                    <div key={condition} className="flex justify-between items-center">
                      <span>{condition}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / totalParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / totalParticipants) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outcome Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(outcomeCounts).map(([outcome, count]) => (
                    <div key={outcome} className="flex justify-between items-center">
                      <span>{outcome}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / totalParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / totalParticipants) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="space-y-6">
            <MissingnessAnalysis />
            <TemporalTrends />
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
          <CardDescription>Overall statistics about the dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium">Demographics</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Total Participants: {totalParticipants}</li>
                <li>Gender Groups: {Object.keys(genderCounts).length}</li>
                <li>Age Range: {minAge} - {maxAge} years (avg: {avgAge})</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Clinical</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Clinical Units: {Object.keys(unitCounts).length}</li>
                <li>Conditions: {Object.keys(conditionCounts).length}</li>
                <li>Outcome Types: {Object.keys(outcomeCounts).length}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Measurements</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Avg. Measurements/Patient: {avgMeasurements}</li>
                <li>Avg. Treatments/Patient: {avgTreatments}</li>
                <li>Avg. Length of Stay: {avgLOS} days</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSummary;
