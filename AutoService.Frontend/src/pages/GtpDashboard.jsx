import Sidebar from "../components/Sidebar";

export default function GtpDashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ marginLeft: "250px", padding: "40px", width: "100%" }}>
        <h1>📊 Главно Табло - Сервиз (Manager)</h1>
        <p>Тук шефът ще вижда оборота, склада и всички служители.</p>
      </div>
    </div>
  );
}
