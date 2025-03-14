
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto py-4 px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <img 
            src="/lovable-uploads/6de429cc-c2f8-4062-83ac-7c851a47285b.png" 
            alt="SOCR Logo" 
            className="h-12"
          />
          <h1 className="text-2xl font-bold text-blue-600">SOCR-QI</h1>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <a 
            href="https://www.socr.umich.edu/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            SOCR
          </a>
          <a 
            href="https://wiki.socr.umich.edu/index.php/SOCR_Data" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            SOCR Data
          </a>
          <a 
            href="https://socr.umich.edu/HTML5/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            SOCR Apps
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
