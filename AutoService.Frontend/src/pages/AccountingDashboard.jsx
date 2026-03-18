import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./AccountingDashboard.css";

export default function AccountingDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Януари",
    "Февруари",
    "Март",
    "Април",
    "Май",
    "Юни",
    "Юли",
    "Август",
    "Септември",
    "Октомври",
    "Ноември",
    "Декември",
  ];

  const years = Array.from(
    { length: new Date().getFullYear() - 2024 + 2 },
    (_, i) => 2024 + i,
  );

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://localhost:7121/api/Dashboard/stats?month=${selectedMonth}&year=${selectedYear}`,
        );
        setStats(response.data);
      } catch (error) {
        console.error("Грешка:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedMonth, selectedYear]);

  if (!stats && !loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <h2>❌ Грешка при връзка със сървъра.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content accounting-container">
        <div className="dashboard-header-flex">
          <h1 className="dashboard-page-title title-no-border">
            📈 Финансови Отчети
          </h1>

          <div className="filter-group">
            <select
              className="filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((m, index) => (
                <option key={index} value={index + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className="filter-select filter-select-bold"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y} г.
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <h2>
            ⏳ Зареждане на данни за {months[selectedMonth - 1]} {selectedYear}
            ...
          </h2>
        ) : (
          <>
            <div className="report-grid">
              <div className="report-card">
                <h3 className="report-header">
                  <span className="text-capitalize">
                    📅 Месечен Отчет ({months[selectedMonth - 1]})
                  </span>
                  <span>{stats.currentMonth.repairsCount} ремонта</span>
                </h3>
                <div className="report-body">
                  <div className="report-row text-muted">
                    <span>Общо минали пари през касата:</span>
                    <span>{stats.currentMonth.totalTurnover.toFixed(2)} €</span>
                  </div>
                  <div className="report-row sub-row row-divider">
                    <span>└ Платени за части към доставчик:</span>
                    <span className="text-danger">
                      - {stats.currentMonth.partsCost.toFixed(2)} €
                    </span>
                  </div>

                  <div className="report-row green mt-10">
                    <span>РЕАЛЕН ПРИХОД НА СЕРВИЗА (От Труд):</span>
                    <span>{stats.currentMonth.laborRevenue.toFixed(2)} €</span>
                  </div>

                  <div className="report-row red mt-10">
                    <span>РАЗХОДИ ЗА ПЕРСОНАЛ:</span>
                    <span>
                      -{" "}
                      {(
                        stats.currentMonth.commissionsPaid +
                        stats.currentMonth.salariesPaid
                      ).toFixed(2)}{" "}
                      €
                    </span>
                  </div>
                  <div className="report-row sub-row">
                    <span>└ Заплати (Изработен процент):</span>
                    <span>
                      - {stats.currentMonth.commissionsPaid.toFixed(2)} €
                    </span>
                  </div>
                  <div className="report-row sub-row">
                    <span>└ Заплати (Твърди):</span>
                    <span>
                      - {stats.currentMonth.salariesPaid.toFixed(2)} €
                    </span>
                  </div>

                  <div className="report-row total">
                    <span>ЧИСТА ПЕЧАЛБА:</span>
                    <span
                      className={
                        stats.currentMonth.netProfit >= 0
                          ? "profit-positive"
                          : "profit-negative"
                      }
                    >
                      {stats.currentMonth.netProfit.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-card">
                <h3 className="report-header year">
                  <span>🗓️ Годишен Отчет ({selectedYear})</span>
                  <span>{stats.currentYear.repairsCount} ремонта</span>
                </h3>
                <div className="report-body">
                  <div className="report-row text-muted">
                    <span>Общо минали пари през касата:</span>
                    <span>{stats.currentYear.totalTurnover.toFixed(2)} €</span>
                  </div>
                  <div className="report-row sub-row row-divider">
                    <span>└ Платени за части към доставчик:</span>
                    <span className="text-danger">
                      - {stats.currentYear.partsCost.toFixed(2)} €
                    </span>
                  </div>

                  <div className="report-row green mt-10">
                    <span>РЕАЛЕН ПРИХОД НА СЕРВИЗА (От Труд):</span>
                    <span>{stats.currentYear.laborRevenue.toFixed(2)} €</span>
                  </div>

                  <div className="report-row red mt-10">
                    <span>РАЗХОДИ ЗА ПЕРСОНАЛ:</span>
                    <span>
                      -{" "}
                      {(
                        stats.currentYear.commissionsPaid +
                        stats.currentYear.salariesPaid
                      ).toFixed(2)}{" "}
                      €
                    </span>
                  </div>
                  <div className="report-row sub-row">
                    <span>└ Заплати (Изработен процент):</span>
                    <span>
                      - {stats.currentYear.commissionsPaid.toFixed(2)} €
                    </span>
                  </div>
                  <div className="report-row sub-row">
                    <span>└ Заплати (Твърди до момента):</span>
                    <span>- {stats.currentYear.salariesPaid.toFixed(2)} €</span>
                  </div>

                  <div className="report-row total">
                    <span>ЧИСТА ПЕЧАЛБА (Година):</span>
                    <span
                      className={
                        stats.currentYear.netProfit >= 0
                          ? "profit-positive"
                          : "profit-negative"
                      }
                    >
                      {stats.currentYear.netProfit.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-box">
              <h3 className="table-section-title">
                Обобщение на механиците ({months[selectedMonth - 1]}{" "}
                {selectedYear})
              </h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Механик</th>
                    <th>Коли / Време</th>
                    <th>Договор</th>
                    <th>Изкарал за сервиза (Труд)</th>
                    <th className="text-danger">Дължимо към механика</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.mechanicStats.length > 0 ? (
                    stats.mechanicStats.map((m, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{m.mechanicName}</strong>
                        </td>
                        <td>
                          {m.repairsCount} бр. / {m.totalHours} ч.{" "}
                          {m.totalMinutes} м.
                        </td>
                        <td>
                          <span className="archive-badge badge-warning">
                            {m.compensationInfo}
                          </span>
                        </td>
                        <td>{m.generatedLaborRevenue.toFixed(2)} €</td>
                        <td>
                          <strong className="text-danger">
                            {m.mechanicPay.toFixed(2)} €
                          </strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Няма данни за механици този месец.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
