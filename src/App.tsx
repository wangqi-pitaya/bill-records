import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import Statistics from "@/pages/Statistics";
import CategoryManage from "@/pages/CategoryManage";
import WalletManage from "@/pages/WalletManage";
import { ToastContainer } from "@/components/Toast";
import { TabBar } from "@/components/TabBar";
import { useTheme } from "@/hooks/useTheme";

function AppContent() {
  useTheme();
  const location = useLocation();
  const hideTabBar = ['/categories', '/wallets'].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/categories" element={<CategoryManage />} />
        <Route path="/wallets" element={<WalletManage />} />
      </Routes>
      {!hideTabBar && <TabBar />}
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}