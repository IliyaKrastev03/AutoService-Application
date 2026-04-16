import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const baseUrl = "/api/Auth";

    try {
      const response = await axios.post(`${baseUrl}/login`, {
        email: email,
        password: password,
      });

      console.log("Успешен вход:", response.data);

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userRole", response.data.role);

      localStorage.setItem("userName", response.data.username || email);

      const userRole = response.data.role;
      if (userRole === "Admin" || userRole === "Manager") {
        navigate("/manager");
      } else if (userRole === "ManagerGTP") {
        navigate("/gtp");
      } else if (userRole === "Mechanic") {
        navigate("/mechanic");
      }
    } catch (error) {
      console.error("Грешка:", error);
      alert(error.response?.data || "Грешен имейл или парола!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="main-title">AutoService</h1>
        <h3 className="sub-title">Вход в системата</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имейл:</label>
            <input
              type="email"
              placeholder="boss@autoservice.bg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Парола:</label>
            <input
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            ВЛЕЗ
          </button>
        </form>
      </div>
    </div>
  );
}
