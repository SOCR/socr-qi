
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DataSummaryDeepPhenotypeProps {
  deepPhenotypeCategories: Array<{
    id: string;
    label: string;
    variables: string[];
  }>;
  data: any[];
  calculateDeepPhenotypeStats: (path: string) => any;
}

const DataSummaryDeepPhenotype: React.FC<DataSummaryDeepPhenotypeProps> = ({
  deepPhenotypeCategories,
  data,
  calculateDeepPhenotypeStats,
}) => {
  // Helper to safely access nested properties
  const getNestedValue = (obj: any, path: string) => {
    try {
      return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    } catch (e) {
      return undefined;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deep Phenotype Data Summary</CardTitle>
        <CardDescription>
          Explore enhanced patient phenotyping variables across multiple domains
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {deepPhenotypeCategories.map((category) => {
            const availableVars = category.variables.filter(v => 
              data.some(p => p.deepPhenotype && getNestedValue(p.deepPhenotype, v) !== undefined)
            );
            
            if (availableVars.length === 0) return null;
            
            return (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="hover:bg-gray-50 px-4">
                  {category.label}
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4">
                    {availableVars.map((varPath) => {
                      const stats = calculateDeepPhenotypeStats(varPath);
                      if (!stats) return null;
                      
                      // Get the variable label (last part of the path)
                      const varLabel = varPath.split('.').pop() || varPath;
                      const formattedLabel = varLabel
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase());
                      
                      return (
                        <div key={varPath} className="border rounded-md p-4">
                          <h4 className="font-medium mb-2">{formattedLabel}</h4>
                          {stats.type === 'numeric' && (
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500">Min</p>
                                <p className="font-medium">{stats.min}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Average</p>
                                <p className="font-medium">{stats.avg}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Max</p>
                                <p className="font-medium">{stats.max}</p>
                              </div>
                            </div>
                          )}
                          
                          {stats.type === 'categorical' && (
                            <div className="space-y-2">
                              {Object.entries(stats.categories).map(([value, count]) => (
                                <div key={value} className="flex justify-between items-center">
                                  <span>{value}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-indigo-500 rounded-full" 
                                        style={{ width: `${(count as number / stats.count) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium">
                                      {Math.round((count as number / stats.count) * 100)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default DataSummaryDeepPhenotype;
