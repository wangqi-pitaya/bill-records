import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AddBill from "@/pages/AddBill";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddBill />} />
        <Route path="/edit/:id" element={<AddBill />} />
      </Routes>
    </Router>
  );
}
