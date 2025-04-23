
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Data Import", path: "/data-import" },
  { name: "Data Summary", path: "/data-summary" },
  { name: "Data Visualization", path: "/data-visualization" },
  { name: "Analytics", path: "/analytics" },
  { name: "Case Studies", path: "/case-studies" },
  { name: "Reports", path: "/reports" },
  { name: "About", path: "/about" },
];

const TabNavigation = () => {
  const location = useLocation();

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                location.pathname === tab.path || 
                (location.pathname === "/" && tab.path === "/data-import")
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
