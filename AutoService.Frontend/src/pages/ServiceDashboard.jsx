import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./ServiceDashboard.css";

export default function ServiceDashboard() {
  const [activeRepairs, setActiveRepairs] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const navigate = useNavigate();

  const fetchActiveRepairs = async () => {
    try {
      const response = await axios.get("/api/Repairs/active");
      setActiveRepairs(response.data);
    } catch (error) {
      console.error("Грешка при зареждане на ремонтите:", error);
    }
  };

  const fetchMechanics = async () => {
    try {
      const response = await axios.get("/api/Repairs/mechanics");
      setMechanics(response.data);
    } catch (error) {
      console.error("Грешка при зареждане на механиците:", error);
    }
  };

  useEffect(() => {
    fetchActiveRepairs();
    fetchMechanics();
  }, []);

  const assignMechanic = async (repairId, mechanicName) => {
    if (!mechanicName) return;
    try {
      await axios.put(
        `/api/Repairs/${repairId}/assign`,
        JSON.stringify(mechanicName),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      fetchActiveRepairs();
    } catch (error) {
      console.error("Грешка при назначаване:", error);
      alert("Възникна грешка при назначаването.");
    }
  };

  const waitingRepairs = activeRepairs.filter((r) => r.status === "Чакащ");
  const inProgressRepairs = activeRepairs.filter(
    (r) => r.status === "В процес",
  );
  const finishedRepairs = activeRepairs.filter(
    (r) => r.status === "Завършен от механик (Чака цена)",
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <h1 className="service-title">📋 Сервизен График (Активни ремонти)</h1>

        <div className="kanban-board">
          <div className="kanban-column">
            <h3 className="column-header warning">
              <span>🟡 Чакащи</span>
              <span className="count-badge">{waitingRepairs.length}</span>
            </h3>

            {waitingRepairs.length === 0 && (
              <p className="empty-column-msg">Няма чакащи автомобили.</p>
            )}

            {waitingRepairs.map((repair) => (
              <div className="repair-card status-waiting" key={repair.id}>
                <h4>
                  🚗 {repair.vehicle?.make} {repair.vehicle?.model}
                </h4>
                <div className="plate-badge-small">
                  {repair.vehicle?.licensePlate}
                </div>
                <p>
                  <strong>👤 Клиент:</strong>{" "}
                  {repair.vehicle?.customer?.firstName}{" "}
                  {repair.vehicle?.customer?.lastName}
                </p>
                <p>
                  <strong>📋 Тип:</strong> {repair.repairType}
                </p>
                {repair.complaint && (
                  <p className="complaint-text">
                    <strong>⚠️ Оплакване:</strong> {repair.complaint}
                  </p>
                )}
                <p>
                  <strong>🛠️ Действия:</strong> {repair.description}
                </p>

                <div className="assign-box">
                  <label className="assign-label">
                    👨‍🔧 Възложи на служител:
                  </label>
                  <select
                    className="assign-select"
                    defaultValue=""
                    onChange={(e) => assignMechanic(repair.id, e.target.value)}
                  >
                    <option value="" disabled>
                      Избери механик...
                    </option>
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn-open-repair"
                  onClick={() =>
                    navigate(`/customer/${repair.vehicle?.customerId}`, {
                      state: { autoOpenVehicleId: repair.vehicleId },
                    })
                  }
                >
                  Отвори досието
                </button>
              </div>
            ))}
          </div>

          <div className="kanban-column">
            <h3 className="column-header info">
              <span>🔵 В процес</span>
              <span className="count-badge">{inProgressRepairs.length}</span>
            </h3>

            {inProgressRepairs.length === 0 && (
              <p className="empty-column-msg">Няма автомобили в процес.</p>
            )}

            {inProgressRepairs.map((repair) => (
              <div className="repair-card status-progress" key={repair.id}>
                <h4>
                  🚗 {repair.vehicle?.make} {repair.vehicle?.model}
                </h4>
                <div className="plate-badge-small">
                  {repair.vehicle?.licensePlate}
                </div>
                <p>
                  <strong>📋 Тип:</strong> {repair.repairType}
                </p>
                <p>
                  <strong>🛠️ Действия:</strong> {repair.description}
                </p>

                <p className="mechanic-assigned-badge">
                  👨‍🔧 Работи: {repair.mechanicId}
                </p>

                <button
                  className="btn-open-repair"
                  onClick={() =>
                    navigate(`/customer/${repair.vehicle?.customerId}`, {
                      state: { autoOpenVehicleId: repair.vehicleId },
                    })
                  }
                >
                  Отвори досието
                </button>
              </div>
            ))}
          </div>

          <div className="kanban-column">
            <h3 className="column-header success">
              <span>🟠 Чакат Цена</span>
              <span className="count-badge">{finishedRepairs.length}</span>
            </h3>

            {finishedRepairs.length === 0 && (
              <p className="empty-column-msg">
                Няма завършени за остойностяване.
              </p>
            )}

            {finishedRepairs.map((repair) => (
              <div className="repair-card status-finished" key={repair.id}>
                <h4>
                  🚗 {repair.vehicle?.make} {repair.vehicle?.model}
                </h4>
                <div className="plate-badge-small">
                  {repair.vehicle?.licensePlate}
                </div>
                <p>
                  <strong>👤 Клиент:</strong>{" "}
                  {repair.vehicle?.customer?.firstName}{" "}
                  {repair.vehicle?.customer?.lastName}
                </p>

                <p className="worked-time-badge">
                  ⏱️ Изработено време: <br /> {repair.workedHours} ч. и{" "}
                  {repair.workedMinutes} мин.
                </p>

                <button
                  className="btn-open-repair btn-evaluate"
                  onClick={() =>
                    navigate(`/customer/${repair.vehicle?.customerId}`, {
                      state: { autoOpenVehicleId: repair.vehicleId },
                    })
                  }
                >
                  💰 Отвори и Остойности
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
