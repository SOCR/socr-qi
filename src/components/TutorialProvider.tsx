
import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TutorialContext = createContext<{
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
}>({
  showTutorial: false,
  setShowTutorial: () => {},
});

export const useTutorial = () => useContext(TutorialContext);

const tutorialSteps = [
  {
    title: "Welcome to SOCR-QI",
    description: "This tutorial will guide you through the key features of our Quality Improvement Data Analysis tool.",
  },
  {
    title: "Data Import",
    description: "Start by importing your healthcare data or use our simulation feature to generate sample data.",
    path: "/data-import",
  },
  {
    title: "Data Summary",
    description: "Explore comprehensive statistical summaries, demographics, and clinical information about your dataset.",
    path: "/data-summary",
  },
  {
    title: "Data Visualization",
    description: "Visualize your data through interactive charts and graphs to identify patterns and trends.",
    path: "/data-visualization",
  },
  {
    title: "Analytics",
    description: "Perform advanced statistical analyses and risk factor assessments.",
    path: "/analytics",
  },
  {
    title: "Case Studies",
    description: "Examine detailed participant profiles and cohort case studies.",
    path: "/case-studies",
  },
  {
    title: "Reports",
    description: "Generate comprehensive reports summarizing your findings.",
    path: "/reports",
  },
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Show tutorial automatically on first visit
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem("hasSeenTutorial", "true");
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
      setCurrentStep(0);
    }
  };

  return (
    <TutorialContext.Provider value={{ showTutorial, setShowTutorial }}>
      {children}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
            <DialogDescription>{tutorialSteps[currentStep].description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTutorial(false);
                  setCurrentStep(0);
                }}
              >
                Skip Tutorial
              </Button>
              <Button onClick={handleNext}>
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TutorialContext.Provider>
  );
}
