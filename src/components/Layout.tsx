
import { Outlet } from "react-router-dom";
import Header from "./Header";
import TabNavigation from "./TabNavigation";
import { DataProvider } from "@/context/DataContext";
import { useEffect, useRef } from "react";

const Layout = () => {
  const emailImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Fix the SOCR email image src when component mounts
    if (emailImgRef.current) {
      emailImgRef.current.src = "https://www.socr.umich.edu/img/SOCR_Email.png";
    }
  }, []);

  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <TabNavigation />
        <main className="flex-grow p-4 md:p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
        <footer className="bg-white border-t py-4">
          <div className="container mx-auto text-center text-sm text-gray-500">
            <div className="flex flex-col items-center">
              <p className="mb-2">© 2025 UMSN (Michigan Nursing) & SOCR (Statistics Online Computational Resource)</p>
              <div className="flex items-center justify-center flex-wrap gap-2">
                <a href="https://www.socr.umich.edu/" className="text-blue-600 hover:text-blue-800">SOCR Resource</a>
                <span>Visitor number</span>
                <img 
                  className="statcounter" 
                  src="https://c.statcounter.com/5714596/0/038e9ac4/0/" 
                  alt="Web Analytics" 
                  style={{ border: 0, verticalAlign: 'middle' }} 
                />
                <span id="current-year"></span>
                <a href="https://www.socr.umich.edu/img/SOCR_Email.png">
                  <img 
                    ref={emailImgRef}
                    alt="SOCR Email"
                    title="SOCR Email"
                    style={{ border: 0, height: '20px' }}
                  />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </DataProvider>
  );
};

// Add script to display current year
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      const currentYear = new Date().getFullYear();
      yearElement.textContent = ` | ${currentYear} | `;
    }
  });
}

export default Layout;
