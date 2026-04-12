import React from "react";
import { usePathname } from "../../lib/navigation";
import { AuthProvider } from "./lib/auth";
import LeadRoute from "./routes/LeadRoute";
import LoginRoute from "./routes/LoginRoute";

const AdminApp: React.FC = () => {
  const pathname = usePathname();

  return (
    <AuthProvider>
      {pathname === "/lead" ? <LeadRoute /> : <LoginRoute />}
    </AuthProvider>
  );
};

export default AdminApp;

