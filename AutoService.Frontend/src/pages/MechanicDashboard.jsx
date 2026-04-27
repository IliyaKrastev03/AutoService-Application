import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  Hammer,
  CarFront,
  ClipboardCheck,
  Wallet,
  Timer,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info,
  Calendar,
  X,
} from "lucide-react";
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
      const response = await axios.get(`/api/Repairs/mechanic/${mechanicName}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Грешка при зареждане на задачите:", error);
    }
  };

  const fetchMyStats = async () => {
    if (!mechanicName) return;
    try {
      const response = await axios.get(
        `/api/Dashboard/mechanic-stats/${mechanicName}`,
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

      await axios.put(`/api/Repairs/${selectedTaskId}/complete`, payload);
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
          <div className="icon-text-flex">
            <Hammer size={32} className="text-white" />
            <div>
              <h1 className="mechanic-header-title">Работно място</h1>
              <p className="mechanic-header-subtitle">
                Добре дошъл, {mechanicName}!
              </p>
            </div>
          </div>
          <div className="mechanic-header-stats icon-text-flex">
            <ClipboardCheck size={24} /> Активни задачи:{" "}
            <strong>{tasks.length}</strong>
          </div>
        </div>

        {myStats && (
          <div className="mechanic-stats-container">
            <div className="mechanic-stat-card green-border">
              <div className="icon-text-flex-between">
                <p className="mechanic-stat-label">Натрупана Заработка</p>
                <Wallet size={20} className="text-success" />
              </div>
              <h2 className="mechanic-stat-value green-text">
                {myStats.earnedMoney.toFixed(2)} €
              </h2>
              <p className="mechanic-stat-footer icon-text-flex-small">
                <Info size={12} /> Договор:{" "}
                <strong>{myStats.compensationInfo}</strong>
              </p>
            </div>

            <div className="mechanic-stat-card blue-border">
              <div className="icon-text-flex-between">
                <p className="mechanic-stat-label">Общо изработено време</p>
                <Timer size={20} className="text-primary" />
              </div>
              <h2 className="mechanic-stat-value dark-text">
                {myStats.totalHours} ч. {myStats.totalMinutes} м.
              </h2>
              <p className="mechanic-stat-footer icon-text-flex-small">
                <CheckCircle2 size={12} /> Завършени ремонти:{" "}
                <strong>{myStats.repairsCount} бр.</strong>
              </p>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="empty-message-box">
            <CheckCircle2 size={48} className="text-success" />
            <p>В момента нямаш назначени задачи. Можеш да си починеш!</p>
          </div>
        ) : (
          <div className="mechanic-grid">
            {tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <h2 className="icon-text-flex">
                  <CarFront size={24} className="text-primary" />{" "}
                  {task.vehicle?.make} {task.vehicle?.model}
                </h2>
                <div className="task-plate-wrapper">
                  <span className="task-plate">
                    {task.vehicle?.licensePlate}
                  </span>
                  <span className="task-year icon-text-flex-small">
                    <Calendar size={14} /> {task.vehicle?.year} г.
                  </span>
                </div>

                <div className="task-details">
                  <p className="icon-text-flex-small">
                    <strong>📋 Тип:</strong> {task.repairType}
                  </p>
                  {task.complaint && (
                    <p className="text-danger icon-text-flex-small">
                      <AlertTriangle size={16} /> <strong>Оплакване:</strong>{" "}
                      {task.complaint}
                    </p>
                  )}
                  <div className="task-description-box">
                    <p>
                      <strong>🛠️ Трябва да се направи:</strong>
                    </p>
                    <p className="description-text">{task.description}</p>
                  </div>
                </div>

                <button
                  className="btn-complete-task icon-text-flex-center"
                  onClick={() => openTimeModal(task.id)}
                >
                  <CheckCircle2 size={20} /> ОТЧЕТИ ТРУД И ПРИКЛЮЧИ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isTimeModalOpen && (
        <div className="modal-overlay top-layer">
          <div className="modal-content size-md">
            <div className="modal-header-flex">
              <h3 className="modal-title-md icon-text-flex">
                <Clock size={24} /> Отчитане на време
              </h3>
              <button
                className="btn-close-modal"
                onClick={() => setIsTimeModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <p className="modal-subtitle">
              Въведи колко време ти отне този ремонт.
            </p>

            <form onSubmit={handleCompleteRepair}>
              <div className="time-inputs-flex">
                <div className="form-group flex-1">
                  <label className="icon-text-flex-small">
                    <Timer size={14} /> Часове:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={timeReport.hours}
                    onChange={(e) =>
                      setTimeReport({ ...timeReport, hours: e.target.value })
                    }
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="icon-text-flex-small">
                    <Clock size={14} /> Минути:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
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
                <button
                  type="submit"
                  className="btn-submit btn-submit-success icon-text-flex-center"
                >
                  <CheckCircle2 size={18} /> Потвърди и Изпрати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
