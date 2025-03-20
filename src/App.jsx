import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ChatPage from "./components/ChatPage"; // Example page
import "./App.css";
function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat" element={<ChatPage />} />
      {/* <Route path="*" element={<LoginPage />} /> Default route */}
    </Routes>
  );
}

export default App;
