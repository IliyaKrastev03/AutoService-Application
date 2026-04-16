import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./VinSearch.css";
import "./CustomerProfile.css";

export default function VinSearch() {
  const [vinQuery, setVinQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Щатове за отваряне на детайлите на ремонта (фактурата) 🌟
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoRepair, setInfoRepair] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!vinQuery) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.get(`/api/Vehicles/search/${vinQuery}`);
      setResult(response.data);
    } catch (err) {
      setError("Автомобил с такъв VIN номер не е намерен в базата данни.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 Функция за отваряне на прозореца 🌟
  const openInfoModal = (repair) => {
    setInfoRepair(repair);
    setIsInfoModalOpen(true);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <h1 className="vin-page-title">🗄️ Архив и Търсене по VIN</h1>

        <div className="vin-search-container">
          <p className="vin-page-subtitle">
            Въведете VIN номер, за да проверите пълната сервизна история на
            автомобила (включително архивирани коли и стари собственици).
          </p>
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              className="vin-input"
              placeholder="Напр. WBAXXXXXXXXXXXXXX"
              value={vinQuery}
              onChange={(e) => setVinQuery(e.target.value)}
            />
            <button type="submit" className="btn-search">
              {isLoading ? "Търсене..." : "🔍 ТЪРСИ"}
            </button>
          </form>
          {error && <p className="vin-error-msg">{error}</p>}
        </div>

        {result && (
          <div className="modal-content size-xl vin-result-container">
            <div className="modal-header-flex">
              <h2 className="modal-title-xl">
                Паспорт на автомобила
                {result.vehicle.isArchived && (
                  <span className="archive-badge">АРХИВИРАН / ИЗТРИТ</span>
                )}
              </h2>
            </div>

            <div className="vehicle-profile-grid">
              <div className="info-card">
                <h4>🚗 Основна информация</h4>
                <p>
                  <strong>Марка и Модел:</strong> {result.vehicle.make}{" "}
                  {result.vehicle.model}
                </p>
                <p>
                  <strong>Рег. Номер:</strong> {result.vehicle.licensePlate}
                </p>
                <p>
                  <strong>Година:</strong> {result.vehicle.year}
                </p>
                <p>
                  <strong>
                    {result.vehicle.isArchived
                      ? "Последен собственик:"
                      : "Настоящ собственик:"}
                  </strong>{" "}
                  {result.vehicle.customer?.firstName}{" "}
                  {result.vehicle.customer?.lastName}
                </p>
              </div>
              <div className="info-card">
                <h4>⚙️ Технически спецификации</h4>
                <p>
                  <strong>VIN Номер:</strong> {result.vehicle.vin}
                </p>
                <p>
                  <strong>Двигател:</strong> {result.vehicle.engineType}
                </p>
                <p>
                  <strong>Задвижване:</strong> {result.vehicle.drivetrain}
                </p>
              </div>
            </div>

            {/* 🌟 ИСТОРИЯ НА СОБСТВЕНОСТТА 🌟 */}
            {result.ownershipHistory && result.ownershipHistory.length > 0 && (
              <div className="ownership-history-section">
                <h3 className="vin-section-title">
                  👥 История на собствеността
                </h3>
                <div className="ownership-list">
                  {result.ownershipHistory.map((owner, index) => (
                    <div
                      key={index}
                      className={`ownership-item ${owner.isCurrentOwner ? "current" : "past"}`}
                    >
                      <div className="ownership-status-icon">
                        {owner.isCurrentOwner ? "🟢" : "🔴"}
                      </div>
                      <div className="ownership-details">
                        <h4 className="ownership-name">
                          {owner.ownerName}
                          {owner.isCurrentOwner && (
                            <span className="current-badge">
                              Настоящ собственик
                            </span>
                          )}
                        </h4>
                        <p className="ownership-phone">
                          📞 {owner.ownerPhone || "Няма въведен телефон"}
                        </p>
                        <p className="ownership-dates">
                          🗓️ От:{" "}
                          {new Date(owner.startDate).toLocaleDateString(
                            "bg-BG",
                          )}{" "}
                          — До:{" "}
                          {owner.endDate
                            ? new Date(owner.endDate).toLocaleDateString(
                                "bg-BG",
                              )
                            : "момента"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="service-history-section">
              <div className="history-header">
                <h3 className="vin-section-title">
                  🛠️ История на ремонтите (Справка)
                </h3>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Описание</th>
                    <th>Километри</th>
                    <th>Обща Цена</th>
                    <th>Статус</th>
                    <th>Детайли</th> {/* 🌟 НОВА КОЛОНА ЗА БУТОНА 🌟 */}
                  </tr>
                </thead>
                <tbody>
                  {result.repairs.length > 0 ? (
                    result.repairs.map((repair) => (
                      <tr key={repair.id}>
                        <td>
                          {new Date(repair.createdAt).toLocaleDateString(
                            "bg-BG",
                          )}
                        </td>
                        <td>
                          <span className="repair-type-badge">
                            {repair.repairType}
                          </span>
                          <br />
                          <strong>{repair.description}</strong>
                        </td>
                        <td>{repair.mileage} км</td>
                        <td>
                          <strong>
                            {(repair.partsCost + repair.laborCost).toFixed(2)} €
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${repair.status === "Завършен" ? "completed" : "pending"}`}
                          >
                            {repair.status}
                          </span>
                        </td>
                        <td>
                          {/* 🌟 БУТОН ЗА ВИЗУАЛИЗАЦИЯ НА ФАКТУРАТА 🌟 */}
                          <button
                            className="action-btn-info"
                            onClick={() => openInfoModal(repair)}
                          >
                            ℹ️ Виж детайли
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-table-cell">
                        Няма записани ремонти за този автомобил.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🌟 МОДАЛЕН ПРОЗОРЕЦ ЗА ДЕТАЙЛИТЕ НА РЕМОНТА (ФАКТУРА) 🌟 */}
        {isInfoModalOpen && infoRepair && result && (
          <div className="modal-overlay top-layer invoice-print-container">
            <div
              className="modal-content size-xl invoice-modal-content"
              id="printable-invoice"
            >
              <div className="modal-header-flex no-print">
                <h2 className="modal-title-xl invoice-title">
                  🧾 Детайли за ремонта (Справка)
                </h2>
                <button
                  className="btn-close-modal"
                  onClick={() => setIsInfoModalOpen(false)}
                >
                  ✖
                </button>
              </div>

              <div className="invoice-print-header">
                <h1 className="invoice-print-logo">AutoService Manager</h1>
                <p className="invoice-print-sub">
                  Архивно копие на сервизна бележка
                </p>
                <p className="invoice-print-date">
                  Дата на ремонта:{" "}
                  {new Date(infoRepair.createdAt).toLocaleString("bg-BG", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}{" "}
                  ч.
                </p>
              </div>

              <div className="invoice-header-box">
                <div className="invoice-info-group">
                  <h4 className="invoice-info-title">
                    👤 Данни за собственика по талон:
                  </h4>
                  <p className="invoice-info-text">
                    <strong>Име:</strong> {result.vehicle.customer?.firstName}{" "}
                    {result.vehicle.customer?.lastName}
                  </p>
                  <p className="invoice-info-text">
                    <strong>Телефон:</strong> {result.vehicle.customer?.phone}
                  </p>
                </div>
                <div className="invoice-info-group">
                  <h4 className="invoice-info-title">
                    🚗 Данни за автомобила:
                  </h4>
                  <p className="invoice-info-text">
                    <strong>Модел:</strong> {result.vehicle.make}{" "}
                    {result.vehicle.model} ({result.vehicle.year} г.)
                  </p>
                  <p className="invoice-info-text">
                    <strong>Рег. Номер:</strong> {result.vehicle.licensePlate}
                  </p>
                  <p className="invoice-info-text">
                    <strong>VIN Номер:</strong> {result.vehicle.vin}
                  </p>
                  <p className="invoice-info-text">
                    <strong>Километраж:</strong> {infoRepair.mileage} км
                  </p>
                </div>
              </div>

              <p className="invoice-subtitle invoice-subtitle-large">
                Извършена услуга / Ремонт:{" "}
                <strong className="invoice-strong">
                  {infoRepair.description}
                </strong>
              </p>

              {infoRepair.parts && infoRepair.parts.length > 0 ? (
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Вложена част</th>
                      <th>ОЕМ / Номер</th>
                      <th>Ед. Цена</th>
                      <th>Количество</th>
                      <th>Общо</th>
                    </tr>
                  </thead>
                  <tbody>
                    {infoRepair.parts.map((p, i) => (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td>{p.partNumber || "-"}</td>
                        <td>{p.price.toFixed(2)} €</td>
                        <td>{p.quantity} бр.</td>
                        <td>{(p.price * p.quantity).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-parts-message">
                  Няма вложени резервни части за този ремонт (Само труд).
                </p>
              )}

              <div className="totals-box totals-box-no-margin invoice-totals-border">
                <p className="totals-text totals-text-large">
                  Стойност Части: {infoRepair.partsCost.toFixed(2)} €
                </p>
                <p className="totals-text totals-text-large">
                  Стойност Труд: {infoRepair.laborCost.toFixed(2)} €
                </p>
                <h2 className="grand-total-print">
                  КРАЙНА СУМА ЗА ПЛАЩАНЕ:{" "}
                  {(infoRepair.partsCost + infoRepair.laborCost).toFixed(2)} €
                </h2>
              </div>

              <div className="modal-actions spaced no-print modal-actions-print">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsInfoModalOpen(false)}
                >
                  Затвори
                </button>
                <button
                  type="button"
                  className="btn-submit btn-submit-success btn-print-icon"
                  onClick={() => window.print()}
                >
                  🖨️ Разпечатай Копие
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
