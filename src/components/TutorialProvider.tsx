
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Tutorial context to manage the tutorial state across the application
const TutorialContext = createContext<{
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  highlightFeature: (featureId: string) => void;
}>({
  showTutorial: false,
  setShowTutorial: () => {},
  highlightFeature: () => {},
});

export const useTutorial = () => useContext(TutorialContext);

// Each tutorial step includes title, description, path, and highlighted element ID
const tutorialSteps = [
  {
    title: "Welcome to SOCR-QI",
    description: "This interactive tutorial will guide you through our Quality Improvement Data Analysis tool. Let's explore the key features together!",
    path: "/data-import",
    highlightElement: null,
  },
  {
    title: "Data Import",
    description: "Begin your analysis by importing healthcare data or using our simulation feature to generate realistic sample data for testing.",
    path: "/data-import",
    highlightElement: "data-import-form",
  },
  {
    title: "Data Summary",
    description: "Explore comprehensive statistical summaries of your dataset including demographics and clinical information. Interactive charts help identify patterns quickly.",
    path: "/data-summary",
    highlightElement: "data-summary-overview",
  },
  {
    title: "Data Visualization",
    description: "Create custom visualizations through interactive charts and graphs. Toggle between different visualization types to reveal insights.",
    path: "/data-visualization", 
    highlightElement: "data-visualization-charts",
  },
  {
    title: "Analytics",
    description: "Perform advanced statistical analyses including regression, correlation, and clustering to identify risk factors and improvement opportunities.",
    path: "/analytics",
    highlightElement: "analytics-container",
  },
  {
    title: "Case Studies",
    description: "Dive into detailed participant profiles and cohort case studies to better understand individual experiences within your data.",
    path: "/case-studies",
    highlightElement: "participant-profiles",
  },
  {
    title: "Reports",
    description: "Generate comprehensive PDF reports summarizing your findings and analyses for easy sharing with stakeholders.",
    path: "/reports",
    highlightElement: "report-generator",
  },
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const highlightOverlayRef = useRef<HTMLDivElement | null>(null);

  // Show tutorial automatically on first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      // Short delay to ensure the app has fully loaded
      const timer = setTimeout(() => {
        setShowTutorial(true);
        localStorage.setItem("hasSeenTutorial", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle navigation to tutorial step
  useEffect(() => {
    if (showTutorial && tutorialSteps[currentStep]?.path) {
      // Navigate to the correct route for the current step
      if (location.pathname !== tutorialSteps[currentStep].path) {
        navigate(tutorialSteps[currentStep].path);
      }
      
      // Highlight the relevant element
      if (tutorialSteps[currentStep].highlightElement) {
        setTimeout(() => {
          setHighlightedElement(tutorialSteps[currentStep].highlightElement);
          highlightFeature(tutorialSteps[currentStep].highlightElement);
        }, 500); // Allow time for the page to render
      } else {
        setHighlightedElement(null);
      }
    }
  }, [showTutorial, currentStep, location.pathname, navigate]);

  // Clean up highlighted element when tutorial is closed
  useEffect(() => {
    if (!showTutorial) {
      setHighlightedElement(null);
      const highlightedEl = document.querySelector('.tutorial-highlight');
      if (highlightedEl) {
        highlightedEl.classList.remove('tutorial-highlight');
      }
      if (highlightOverlayRef.current) {
        document.body.removeChild(highlightOverlayRef.current);
        highlightOverlayRef.current = null;
      }
    }
  }, [showTutorial]);

  // Function to highlight a specific feature
  const highlightFeature = (featureId: string | null) => {
    // Remove previous highlight
    const previousHighlight = document.querySelector('.tutorial-highlight');
    if (previousHighlight) {
      previousHighlight.classList.remove('tutorial-highlight');
    }
    
    // Remove previous overlay if exists
    if (highlightOverlayRef.current) {
      document.body.removeChild(highlightOverlayRef.current);
      highlightOverlayRef.current = null;
    }

    // Return early if no feature to highlight
    if (!featureId) return;

    // Try to find the element to highlight
    setTimeout(() => {
      const element = document.getElementById(featureId);
      if (element) {
        // Add highlight class
        element.classList.add('tutorial-highlight');
        
        // Create overlay to dim everything except the highlighted element
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '40';
        overlay.style.pointerEvents = 'none';
        
        // Calculate element position for "cutout"
        const rect = element.getBoundingClientRect();
        overlay.style.boxShadow = `0 0 0 9999px rgba(0, 0, 0, 0.5)`;
        
        document.body.appendChild(overlay);
        highlightOverlayRef.current = overlay;
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
      setCurrentStep(0);
      toast.success("Tutorial completed! You can restart it anytime from the Settings menu.");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <TutorialContext.Provider value={{ showTutorial, setShowTutorial, highlightFeature }}>
      {children}
      
      {/* Tutorial modal */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tutorialSteps[currentStep]?.title}</DialogTitle>
            <DialogDescription className="py-4">
              {tutorialSteps[currentStep]?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTutorial(false);
                    setCurrentStep(0);
                  }}
                >
                  Skip Tutorial
                </Button>
                {currentStep > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={handlePrevious}
                    className="ml-2"
                  >
                    Previous
                  </Button>
                )}
              </div>
              <Button onClick={handleNext}>
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </DialogFooter>
          <div className="flex justify-center pt-2">
            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add tutorial highlight styles */}
      <style>
        {`
        .tutorial-highlight {
          position: relative;
          z-index: 50;
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        `}
      </style>
    </TutorialContext.Provider>
  );
}

