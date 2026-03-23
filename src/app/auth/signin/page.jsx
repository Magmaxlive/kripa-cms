

import React from "react";
import Signin from "@/components/Auth/Signin";


export const metadata = {
  title: "Kripa Login",
  description: "Kripa Financial Solutions Admin",
};

const SignIn = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300 dark:bg-gray-dark px-4">
      <div className="w-full max-w-md">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
           <img src={"/images/logo/kripalogo.svg"} alt="Logo" className="mb-4" priority  style={{ width: "150px", height: "auto" }} />

          
          <p className="text-sm text-gray-700 mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-sm border border-gray-100 dark:border-strokedark p-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-1">Sign in</h2>
          <p className="text-sm text-gray-400 mb-6 text-center">Enter your credentials to continue</p>
          <Signin />
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          © {new Date().getFullYear()} Kripa Financial Solutions
        </p>

      </div>
    </div>
  );
};

export default SignIn;