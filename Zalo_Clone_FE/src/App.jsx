import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";

function App() {
  // Lấy userId và accessToken từ localStorage
  const userId = localStorage.getItem('userId');
  const accessToken = localStorage.getItem('accessToken');

  // Nếu không có userId hoặc accessToken, chuyển hướng về Login
  if (!userId || !accessToken) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home userId={userId} />} />
      </Routes>
    </Router>
  );
}

export default App;