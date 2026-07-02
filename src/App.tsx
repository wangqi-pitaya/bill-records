import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AddBill from "@/pages/AddBill";
import CategoryManage from "@/pages/CategoryManage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddBill />} />
        <Route path="/edit/:id" element={<AddBill />} />
        <Route path="/categories" element={<CategoryManage />} />
      </Routes>
    </Router>
  );
}