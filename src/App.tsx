import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TutorialProvider } from "./components/TutorialProvider";
import Layout from "./components/Layout";
import DataImport from "./pages/DataImport";
import DataSummary from "./pages/DataSummary";
import DataVisualization from "./pages/DataVisualization";
import Analytics from "./pages/Analytics";
import CaseStudies from "./pages/CaseStudies";
import Reports from "./pages/Reports";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TutorialProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<DataImport />} />
                <Route path="data-import" element={<DataImport />} />
                <Route path="data-summary" element={<DataSummary />} />
                <Route path="data-visualization" element={<DataVisualization />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="case-studies" element={<CaseStudies />} />
                <Route path="reports" element={<Reports />} />
                <Route path="about" element={<About />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TutorialProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
