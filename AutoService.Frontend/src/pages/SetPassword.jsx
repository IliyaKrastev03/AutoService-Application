import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./SetPassword.css";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Невалиден линк! Липсва код за сигурност.");
      return;
    }

    if (password.length < 6) {
      setError("Паролата трябва да е поне 6 символа.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролите не съвпадат!");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/Auth/complete-password-setup", {
        token: token,
        newPassword: password,
      });

      alert(
        "Паролата е зададена успешно! Сега можете да влезете в профила си.",
      );
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data || "Възникна грешка. Линкът може да е изтекъл.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="set-password-container">
      <div className="set-password-box">
        <h2 className="set-password-title">🔒 Задаване на парола</h2>
        <p className="set-password-subtitle">
          Добре дошли! Моля, въведете новата си лична парола по-долу.
        </p>

        <form onSubmit={handleSubmit} className="set-password-form">
          <div className="form-group">
            <label>Нова Парола:</label>
            <input
              type="password"
              placeholder="Въведете минимум 6 символа..."
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Потвърди Паролата:</label>
            <input
              type="password"
              placeholder="Повторете паролата..."
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="btn-submit-password"
            disabled={isLoading}
          >
            {isLoading ? "Запазване..." : "ЗАПАЗИ ПАРОЛАТА И ВЛЕЗ"}
          </button>
        </form>
      </div>
    </div>
  );
}
