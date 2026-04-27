import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  TrendingUp,
  Calendar,
  PieChart,
  TrendingDown,
  Wallet,
  Users,
  ArrowDownCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
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
          `/api/Dashboard/stats?month=${selectedMonth}&year=${selectedYear}`,
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
          <h2 className="icon-text-flex text-danger">
            <AlertCircle size={30} /> Грешка при връзка със сървъра.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content accounting-container">
        <div className="dashboard-header-flex">
          <h1 className="dashboard-page-title title-no-border icon-text-flex">
            <TrendingUp size={32} className="text-success" /> Финансови Отчети
          </h1>

          <div className="filter-group">
            <div className="filter-select-wrapper">
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
              <ChevronDown size={16} className="select-arrow" />
            </div>

            <div className="filter-select-wrapper">
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
              <ChevronDown size={16} className="select-arrow" />
            </div>
          </div>
        </div>

        {loading ? (
          <h2 className="icon-text-flex">
            <Clock className="spinner" /> Зареждане на данни за{" "}
            {months[selectedMonth - 1]} {selectedYear}...
          </h2>
        ) : (
          <>
            <div className="report-grid">
              <div className="report-card">
                <h3 className="report-header">
                  <span className="icon-text-flex text-capitalize">
                    <Calendar size={20} /> Месечен Отчет (
                    {months[selectedMonth - 1]})
                  </span>
                  <span className="badge-light">
                    {stats.currentMonth.repairsCount} ремонта
                  </span>
                </h3>
                <div className="report-body">
                  <div className="report-row text-muted">
                    <span>Общо минали пари (Оборот):</span>
                    <span>{stats.currentMonth.totalTurnover.toFixed(2)} €</span>
                  </div>
                  <div className="report-row sub-row row-divider">
                    <span className="icon-text-flex-small">
                      <ArrowDownCircle size={14} /> Платени за части:
                    </span>
                    <span className="text-danger">
                      - {stats.currentMonth.partsCost.toFixed(2)} €
                    </span>
                  </div>

                  <div className="report-row green mt-10">
                    <span className="icon-text-flex">
                      <Wallet size={18} /> ПРИХОД НА СЕРВИЗА (Труд):
                    </span>
                    <span>{stats.currentMonth.laborRevenue.toFixed(2)} €</span>
                  </div>

                  <div className="report-row red mt-10">
                    <span className="icon-text-flex">
                      <Users size={18} /> РАЗХОДИ ЗА ПЕРСОНАЛ:
                    </span>
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
                    <span>└ Процент за механици:</span>
                    <span>
                      - {stats.currentMonth.commissionsPaid.toFixed(2)} €
                    </span>
                  </div>
                  <div className="report-row sub-row">
                    <span>└ Твърди заплати:</span>
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
                  <span className="icon-text-flex">
                    <PieChart size={20} /> Годишен Отчет ({selectedYear})
                  </span>
                  <span className="badge-light">
                    {stats.currentYear.repairsCount} ремонта
                  </span>
                </h3>
                <div className="report-body">
                  <div className="report-row text-muted">
                    <span>Годишен оборот (Бруто):</span>
                    <span>{stats.currentYear.totalTurnover.toFixed(2)} €</span>
                  </div>
                  <div className="report-row sub-row row-divider">
                    <span className="icon-text-flex-small">
                      <ArrowDownCircle size={14} /> Разход за части:
                    </span>
                    <span className="text-danger">
                      - {stats.currentYear.partsCost.toFixed(2)} €
                    </span>
                  </div>

                  <div className="report-row green mt-10">
                    <span className="icon-text-flex">
                      <Wallet size={18} /> ПРИХОД ОТ ТРУД:
                    </span>
                    <span>{stats.currentYear.laborRevenue.toFixed(2)} €</span>
                  </div>

                  <div className="report-row red mt-10">
                    <span className="icon-text-flex">
                      <Users size={18} /> ПЕРСОНАЛ:
                    </span>
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
                    <span>└ Комисионни:</span>
                    <span>
                      - {stats.currentYear.commissionsPaid.toFixed(2)} €
                    </span>
                  </div>
                  <div className="report-row sub-row">
                    <span>└ Заплати:</span>
                    <span>- {stats.currentYear.salariesPaid.toFixed(2)} €</span>
                  </div>

                  <div className="report-row total">
                    <span>ЧИСТА ПЕЧАЛБА (YTD):</span>
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
              <h3 className="table-section-title icon-text-flex">
                <Users size={22} /> Обобщение на механиците (
                {months[selectedMonth - 1]} {selectedYear})
              </h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Механик</th>
                    <th>Дейност</th>
                    <th>Тип Договор</th>
                    <th>Принос (Труд)</th>
                    <th className="text-danger">За плащане</th>
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
                          <div className="icon-text-flex-small">
                            <CheckCircle2 size={14} className="text-success" />
                            {m.repairsCount} ремонта / {m.totalHours}ч.{" "}
                            {m.totalMinutes}м.
                          </div>
                        </td>
                        <td>
                          <span className="role-badge role-manager">
                            {m.compensationInfo}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {m.generatedLaborRevenue.toFixed(2)} €
                          </strong>
                        </td>
                        <td>
                          <strong className="text-danger">
                            {m.mechanicPay.toFixed(2)} €
                          </strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
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
