
import { Outlet } from "react-router-dom";
import Header from "./Header";
import TabNavigation from "./TabNavigation";
import { DataProvider } from "@/context/DataContext";

const Layout = () => {
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
            <p>© {new Date().getFullYear()} SOCR - Statistics Online Computational Resource</p>
          </div>
        </footer>
      </div>
    </DataProvider>
  );
};

export default Layout;
