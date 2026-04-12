import "./App.css";
import { usePathname } from "./lib/navigation";
import AdminApp from "./apps/admin/AdminApp";
import PortfolioApp from "./apps/portfolio/PortfolioApp";
function App() {
  const pathname = usePathname();

  return pathname === "/login" || pathname === "/lead" ? <AdminApp /> : <PortfolioApp />;
}

export default App;
