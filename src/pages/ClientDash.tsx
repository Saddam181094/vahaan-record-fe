import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ClientDash = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    return (
        <>
            <SidebarProvider>
              <AppSidebar />
              <SidebarTrigger />
              <div className="flex flex-col w-full bg-white pr-6 lg:pt-20 h-full min-h-[100vh]">
                <div className="flex flex-col w-full ml-3">
                  <div className="flex flex-col lg:flex-row items-center justify-between px-6 pt-8 gap-8">
                    {/* Navigation Cards Section */}
                    <div className="w-full lg:w-1/2 space-y-8">
                      <h1 className="text-3xl font-bold text-gray-800">
                        Welcome to the Client Portal! <br />
                        <span className="text-indigo-600">{user?.name}.</span>
                      </h1>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => navigate("/client/cases")}
                          className="rounded-xl bg-blue-100 hover:bg-blue-200 p-6 shadow-md cursor-pointer transition-all transition-transform transform hover:scale-[1.02] duration-200"
                        >
                          <h2 className="text-lg font-semibold text-blue-800">My Cases</h2>
                        </div>
                        <div
                          onClick={() => navigate("/client/Transactions")}
                          className="rounded-xl bg-green-100 hover:bg-green-200 p-6 shadow-md cursor-pointer transition-all transition-transform transform hover:scale-[1.02] duration-200"
                        >
                          <h2 className="text-lg font-semibold text-green-800">My Transactions</h2>
                        </div>
                        <div
                          onClick={() => navigate("/client/Bills")}
                          className="rounded-xl bg-yellow-100 hover:bg-yellow-200 p-6 shadow-md cursor-pointer transition-all transition-transform transform hover:scale-[1.02] duration-200"
                        >
                          <h2 className="text-lg font-semibold text-yellow-800">All Bills</h2>
                        </div>
                        <div
                          onClick={() => navigate("/client/Profile")}
                          className="rounded-xl bg-purple-100 hover:bg-purple-200 p-6 shadow-md cursor-pointer transition-all transition-transform transform hover:scale-[1.02] duration-200"
                        >
                          <h2 className="text-lg font-semibold text-purple-800">My Profile</h2>
                        </div>
                      </div>
                    </div>

                    {/* Image Section */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                      <img
                        src="/Group.svg"
                        alt="Client Portal"
                        className="max-w-xs sm:max-w-sm w-full object-contain"
                      />
                    </div>
                  </div>
                  <img
                  src="/banner.jpg"
                  alt="Banner"
                  className="w-full h-auto object-cover lg:mt-30 mt-10 border rounded-lg shadow-md"
                  />
              <footer className="w-full lg:mt-5 mt-3 py-4 bg-gray-100 border-t text-center text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span>
                  <strong>Customer Care:</strong> 7801878800
                </span>
                <span className="hidden md:inline mx-2">|</span>
                <span>
                  <strong>Mail:</strong> info@vahaanrecord.com
                </span>
                <span className="hidden md:inline mx-2">|</span>
                <span>
                  Contact us For any Query or help
                </span>
              </footer>
                </div>
              </div>
            </SidebarProvider>
        </>
    );
};

export default ClientDash;