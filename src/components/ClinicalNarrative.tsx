
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClinicalNarrativeProps {
  participant: any;
}

const ClinicalNarrative: React.FC<ClinicalNarrativeProps> = ({ participant }) => {
  // Generate a clinical narrative based on participant data
  const generateNarrative = () => {
    const {
      id,
      gender,
      age,
      condition,
      unit,
      riskScore,
      lengthOfStay,
      readmissionRisk,
      outcome,
      measurements,
      treatments
    } = participant;

    // Find latest vital signs
    const latestVitals = measurements
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 1)[0] || {};

    // Format date for admission
    const formatDate = (daysAgo: number) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };
    
    // Get admission date (assuming LOS days ago)
    const admissionDate = formatDate(lengthOfStay);
    
    // Get current treatments
    const currentTreatments = treatments
      .filter((t: any) => !t.endDate || new Date(t.endDate) > new Date())
      .map((t: any) => t.name)
      .join(", ");

    // Risk level in words
    const riskLevel = riskScore < 30 ? "low" : riskScore < 70 ? "moderate" : "high";
    
    // Severity descriptor based on condition and risk
    const severityDescriptor = riskScore < 40 ? "mild" : riskScore < 70 ? "moderate" : "severe";
    
    // Clinical presentation based on condition
    let clinicalPresentation = "";
    if (condition.includes("Diabetes")) {
      clinicalPresentation = `Patient presents with ${severityDescriptor} ${condition} with reported symptoms of polyuria, polydipsia, and fatigue.`;
    } else if (condition.includes("Heart")) {
      clinicalPresentation = `Patient presents with ${severityDescriptor} ${condition} with reported symptoms of chest pain, dyspnea on exertion, and fatigue.`;
    } else if (condition.includes("Respiratory")) {
      clinicalPresentation = `Patient presents with ${severityDescriptor} ${condition} with reported symptoms of productive cough, shortness of breath, and wheezing.`;
    } else if (condition.includes("Cancer")) {
      clinicalPresentation = `Patient presents with ${severityDescriptor} ${condition} with associated fatigue, weight loss, and site-specific pain.`;
    } else {
      clinicalPresentation = `Patient presents with ${severityDescriptor} ${condition}.`;
    }
    
    // Deep phenotype narrative
    let functionalStatusNote = "";
    if (participant.deepPhenotype?.functionalStatus) {
      const fs = participant.deepPhenotype.functionalStatus;
      functionalStatusNote = `Functional assessment reveals ${
        fs.physicalFunction < 40 ? "significantly impaired" : 
        fs.physicalFunction < 70 ? "moderately impaired" : "generally maintained"
      } physical function. ADL independence is ${
        fs.adlIndependence < 40 ? "poor, requiring significant assistance" : 
        fs.adlIndependence < 70 ? "fair, requiring some assistance" : "good, mostly independent"
      }. Cognitive function appears ${
        fs.cognitiveFunction < 40 ? "significantly impaired" : 
        fs.cognitiveFunction < 70 ? "mildly impaired" : "within normal limits"
      }.`;
    }
    
    // Build the narrative
    return `
      <span class="font-medium">CLINICAL NOTE - ${admissionDate}</span>
      
      <p class="mt-3"><span class="font-medium">PATIENT:</span> ${id}, a ${age}-year-old ${gender.toLowerCase()} admitted to the ${unit} on ${admissionDate}.</p>
      
      <p class="mt-3"><span class="font-medium">CHIEF COMPLAINT:</span> ${clinicalPresentation}</p>
      
      <p class="mt-3"><span class="font-medium">CURRENT STATUS:</span> Patient has been hospitalized for ${lengthOfStay} days with ${condition}. Initial assessment indicated a ${riskLevel} risk profile (score: ${riskScore}/100). Latest vital signs show heart rate of ${latestVitals.heartRate || "N/A"} bpm, blood pressure of ${latestVitals.bloodPressureSystolic || "N/A"}/${latestVitals.bloodPressureDiastolic || "N/A"} mmHg, and oxygen saturation of ${latestVitals.oxygenSaturation || "N/A"}%.</p>
      
      <p class="mt-3"><span class="font-medium">TREATMENT PLAN:</span> Current management includes ${currentTreatments || "observation and supportive care"}. Patient is responding ${
        outcome === "Improved" ? "well to the current treatment regimen" : 
        outcome === "Stable" ? "as expected to the current treatment regimen" : 
        "poorly to the current treatment regimen, requiring adjustment"
      }.</p>
      
      ${functionalStatusNote ? `<p class="mt-3"><span class="font-medium">FUNCTIONAL STATUS:</span> ${functionalStatusNote}</p>` : ""}
      
      <p class="mt-3"><span class="font-medium">DISPOSITION:</span> ${
        readmissionRisk < 30 
          ? `Patient is progressing well with ${outcome.toLowerCase()} condition. Discharge planning initiated with low readmission risk (${readmissionRisk}%).` 
          : readmissionRisk < 70 
            ? `Patient shows ${outcome.toLowerCase()} condition. Continued monitoring required with moderate readmission risk (${readmissionRisk}%).` 
            : `Patient requires close monitoring with ${outcome.toLowerCase()} condition. High risk for readmission (${readmissionRisk}%) following discharge.`
      }</p>
    `;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinical Narrative</CardTitle>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: generateNarrative() }} />
      </CardContent>
    </Card>
  );
};

export default ClinicalNarrative;
