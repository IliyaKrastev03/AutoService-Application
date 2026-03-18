import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./MechanicDashboard.css";
import "./CustomerProfile.css";

export default function MechanicDashboard() {
  const [tasks, setTasks] = useState([]);

  const [myStats, setMyStats] = useState(null);

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [timeReport, setTimeReport] = useState({ hours: 0, minutes: 0 });

  const mechanicName = localStorage.getItem("userName");

  const fetchMyTasks = async () => {
    if (!mechanicName) return;
    try {
      const response = await axios.get(
        `https://localhost:7121/api/Repairs/mechanic/${mechanicName}`,
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Грешка при зареждане на задачите:", error);
    }
  };

  const fetchMyStats = async () => {
    if (!mechanicName) return;
    try {
      const response = await axios.get(
        `https://localhost:7121/api/Dashboard/mechanic-stats/${mechanicName}`,
      );
      setMyStats(response.data);
    } catch (error) {
      console.error("Грешка при зареждане на статистиката:", error);
    }
  };

  useEffect(() => {
    fetchMyTasks();
    fetchMyStats();
  }, [mechanicName]);

  const openTimeModal = (repairId) => {
    setSelectedTaskId(repairId);
    setIsTimeModalOpen(true);
  };

  const handleCompleteRepair = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        workedHours: parseInt(timeReport.hours) || 0,
        workedMinutes: parseInt(timeReport.minutes) || 0,
      };

      await axios.put(
        `https://localhost:7121/api/Repairs/${selectedTaskId}/complete`,
        payload,
      );

      alert("Работата е отчетена успешно! Колата отива при Управителя.");

      setIsTimeModalOpen(false);
      setTimeReport({ hours: 0, minutes: 0 });
      fetchMyTasks();
      fetchMyStats();
    } catch (error) {
      console.error("Грешка при приключване:", error);
      alert("Възникна грешка.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="mechanic-header">
          <div>
            <h1 className="mechanic-header-title">👨‍🔧 Работно място</h1>
            <p className="mechanic-header-subtitle">
              Добре дошъл, {mechanicName}!
            </p>
          </div>
          <div className="mechanic-header-stats">
            Активни задачи: <strong>{tasks.length}</strong>
          </div>
        </div>
        {myStats && (
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            <div
              style={{
                flex: 1,
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                borderLeft: "5px solid #27ae60",
              }}
            >
              <p
                style={{
                  margin: "0",
                  color: "#7f8c8d",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Натрупана Заработка
              </p>
              <h2
                style={{
                  margin: "5px 0 0 0",
                  color: "#27ae60",
                  fontSize: "28px",
                }}
              >
                {myStats.earnedMoney.toFixed(2)} €
              </h2>
              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "12px",
                  color: "#95a5a6",
                }}
              >
                Договор: <strong>{myStats.compensationInfo}</strong>
              </p>
            </div>

            <div
              style={{
                flex: 1,
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                borderLeft: "5px solid #3498db",
              }}
            >
              <p
                style={{
                  margin: "0",
                  color: "#7f8c8d",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Общо изработено време
              </p>
              <h2
                style={{
                  margin: "5px 0 0 0",
                  color: "#2c3e50",
                  fontSize: "28px",
                }}
              >
                {myStats.totalHours} ч. {myStats.totalMinutes} м.
              </h2>
              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "12px",
                  color: "#95a5a6",
                }}
              >
                Завършени ремонти: <strong>{myStats.repairsCount} бр.</strong>
              </p>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="empty-message empty-message-large">
            🎉 В момента нямаш назначени задачи. Можеш да си починеш!
          </div>
        ) : (
          <div className="mechanic-grid">
            {tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <h2>
                  🚗 {task.vehicle?.make} {task.vehicle?.model} (
                  {task.vehicle?.year} г.)
                </h2>
                <div className="task-plate">{task.vehicle?.licensePlate}</div>

                <div className="task-details">
                  <p>
                    <strong>📋 Тип:</strong> {task.repairType}
                  </p>
                  {task.complaint && (
                    <p className="text-danger">
                      <strong>⚠️ Оплакване:</strong> {task.complaint}
                    </p>
                  )}
                  <p className="task-description-box">
                    <strong>🛠️ Трябва да се направи:</strong>
                    <br />
                    {task.description}
                  </p>
                </div>

                <button
                  className="btn-complete-task"
                  onClick={() => openTimeModal(task.id)}
                >
                  ✅ ОТЧЕТИ ТРУД И ПРИКЛЮЧИ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isTimeModalOpen && (
        <div className="modal-overlay top-layer">
          <div className="modal-content size-md">
            <h3 className="modal-title-md">⏱️ Отчитане на изработено време</h3>
            <p className="modal-subtitle">
              Въведи колко време ти отне този ремонт. Не е задължително да
              попълваш и двете полета.
            </p>

            <form onSubmit={handleCompleteRepair}>
              <div className="time-inputs-flex">
                <div className="form-group flex-1">
                  <label>Часове:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Напр. 2"
                    value={timeReport.hours}
                    onChange={(e) =>
                      setTimeReport({ ...timeReport, hours: e.target.value })
                    }
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Минути:</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Напр. 30"
                    value={timeReport.minutes}
                    onChange={(e) =>
                      setTimeReport({ ...timeReport, minutes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions spaced">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsTimeModalOpen(false)}
                >
                  Отказ
                </button>
                <button type="submit" className="btn-submit btn-submit-success">
                  Потвърди и Изпрати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
