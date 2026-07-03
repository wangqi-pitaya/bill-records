import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import CategoryManage from "@/pages/CategoryManage";
import AddBill from "@/pages/AddBill";
import { ToastContainer } from "@/components/Toast";
import { useTheme } from "@/hooks/useTheme";

function AppContent() {
  useTheme();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<CategoryManage />} />
        <Route path="/add/:id?" element={<AddBill />} />
      </Routes>
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