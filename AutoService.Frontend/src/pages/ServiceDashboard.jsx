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
      const response = await axios.get(
        "https://localhost:7121/api/Repairs/active",
      );
      setActiveRepairs(response.data);
    } catch (error) {
      console.error("Грешка при зареждане на ремонтите:", error);
    }
  };

  const fetchMechanics = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7121/api/Repairs/mechanics",
      );
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
        `https://localhost:7121/api/Repairs/${repairId}/assign`,
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
        <h1
          style={{
            color: "#2c3e50",
            borderBottom: "3px solid #3498db",
            paddingBottom: "10px",
          }}
        >
          📋 Сервизен График (Активни ремонти)
        </h1>

        <div className="kanban-board">
          <div className="kanban-column">
            <h3 className="column-header warning">
              <span>🟡 Чакащи</span>
              <span
                style={{
                  background: "#e9ecef",
                  padding: "2px 10px",
                  borderRadius: "15px",
                  fontSize: "16px",
                }}
              >
                {waitingRepairs.length}
              </span>
            </h3>

            {waitingRepairs.length === 0 && (
              <p style={{ color: "#7f8c8d" }}>Няма чакащи автомобили.</p>
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
                  <p style={{ color: "#e74c3c" }}>
                    <strong>⚠️ Оплакване:</strong> {repair.complaint}
                  </p>
                )}
                <p>
                  <strong>🛠️ Действия:</strong> {repair.description}
                </p>

                <div
                  style={{
                    marginTop: "15px",
                    marginBottom: "10px",
                    background: "#f8f9fa",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px dashed #bdc3c7",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#2c3e50",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    👨‍🔧 Възложи на служител:
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
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
                    navigate(`/customer/${repair.vehicle?.customerId}`)
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
              <span
                style={{
                  background: "#e9ecef",
                  padding: "2px 10px",
                  borderRadius: "15px",
                  fontSize: "16px",
                }}
              >
                {inProgressRepairs.length}
              </span>
            </h3>

            {inProgressRepairs.length === 0 && (
              <p style={{ color: "#7f8c8d" }}>Няма автомобили в процес.</p>
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

                <p
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    background: "#e1f5fe",
                    borderRadius: "5px",
                    color: "#0277bd",
                    fontWeight: "bold",
                  }}
                >
                  👨‍🔧 Работи: {repair.mechanicId}
                </p>

                <button
                  className="btn-open-repair"
                  onClick={() =>
                    navigate(`/customer/${repair.vehicle?.customerId}`)
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
              <span
                style={{
                  background: "#e9ecef",
                  padding: "2px 10px",
                  borderRadius: "15px",
                  fontSize: "16px",
                }}
              >
                {finishedRepairs.length}
              </span>
            </h3>

            {finishedRepairs.length === 0 && (
              <p style={{ color: "#7f8c8d" }}>
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

                <p
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    background: "#fef9e7",
                    borderRadius: "5px",
                    color: "#d35400",
                    fontWeight: "bold",
                  }}
                >
                  ⏱️ Изработено време: <br /> {repair.workedHours} ч. и{" "}
                  {repair.workedMinutes} мин.
                </p>

                <button
                  className="btn-open-repair"
                  style={{ background: "#e67e22", color: "white" }}
                  onClick={() =>
                    navigate(`/customer/${repair.vehicle?.customerId}`)
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
