
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DatabaseIcon } from "lucide-react";

const NoDataMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="mb-6 bg-blue-50 p-6 rounded-full">
        <DatabaseIcon className="h-12 w-12 text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        You need to import or simulate data before you can view this section.
        Please go to the Data Import tab to get started.
      </p>
      <Button asChild>
        <Link to="/data-import">Go to Data Import</Link>
      </Button>
    </div>
  );
};

export default NoDataMessage;
