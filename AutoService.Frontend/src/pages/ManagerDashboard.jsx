import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./ManagerDashboard.css";
import { useNavigate } from "react-router-dom";

export default function ManagerDashboard() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Mechanic",
    compensationType: "Percentage",
    commissionPercentage: 40,
    monthlySalary: 0,
  });

  const [customers, setCustomers] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerFormData, setCustomerFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });

  const [activeTab, setActiveTab] = useState("employees");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://localhost:7121/api/Auth/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Грешка:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("https://localhost:7121/api/Customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Грешка:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCustomers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://localhost:7121/api/Auth/register", {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        compensationType: formData.compensationType,
        commissionPercentage: formData.commissionPercentage,
        monthlySalary: formData.monthlySalary,
      });
      alert("Служителят е добавен успешно!");
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Mechanic",
        compensationType: "Percentage",
        commissionPercentage: 40,
        monthlySalary: 0,
      });
      fetchUsers();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.response?.data ||
          "Грешка при създаването!",
      );
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете: ${name}?`)) {
      try {
        await axios.delete(`https://localhost:7121/api/Auth/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert("Грешка при изтриване.");
      }
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPassword = window.prompt(`Въведете нова парола за: ${name}`);
    if (newPassword && newPassword.length >= 6) {
      try {
        await axios.post(
          `https://localhost:7121/api/Auth/reset-password/${id}`,
          { newPassword },
        );
        alert(`Паролата е променена!`);
      } catch (error) {
        alert("Грешка при смяна.");
      }
    } else if (newPassword) {
      alert("Паролата трябва да е поне 6 символа!");
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://localhost:7121/api/Customers",
        customerFormData,
      );
      alert("Клиентът е добавен успешно!");
      setIsCustomerModalOpen(false);
      setCustomerFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
      });
      fetchCustomers();
    } catch (error) {
      alert("Грешка при създаване на клиент!");
    }
  };

  const getRoleBadgeClass = (role) =>
    role === "Admin"
      ? "role-admin"
      : role === "Manager" || role === "ManagerGTP"
        ? "role-manager"
        : "role-mechanic";

  const totalUsers = users.length;
  const totalMechanics = users.filter((u) => u.role === "Mechanic").length;
  const totalManagers = users.filter(
    (u) => u.role === "Manager" || u.role === "ManagerGTP",
  ).length;

  const filteredUsers = users.filter((u) =>
    (u.name || u.username || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );
  const filteredCustomers = customers.filter((c) =>
    `${c.firstName} ${c.lastName}`
      .toLowerCase()
      .includes(customerSearchTerm.toLowerCase()),
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <h1 className="dashboard-header">
          <span className="header-icon">📋</span> Управление
        </h1>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "employees" ? "active" : ""}`}
            onClick={() => setActiveTab("employees")}
          >
            🪪 Служители
          </button>
          <button
            className={`tab-button ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            📇 Клиенти и Автомобили
          </button>
        </div>

        {activeTab === "employees" && (
          <>
            <div className="stats-grid">
              <div className="stat-card gray">
                <span className="stat-icon">👥</span>
                <div className="stat-info">
                  <h4>Общо Служители</h4>
                  <p>{totalUsers}</p>
                </div>
              </div>
              <div className="stat-card blue">
                <span className="stat-icon">👨‍🔧</span>
                <div className="stat-info">
                  <h4>Механици</h4>
                  <p>{totalMechanics}</p>
                </div>
              </div>
              <div className="stat-card orange">
                <span className="stat-icon">👔</span>
                <div className="stat-info">
                  <h4>Управители</h4>
                  <p>{totalManagers}</p>
                </div>
              </div>
            </div>

            <div className="card-container">
              <div className="card-header">
                <h3 className="card-title">Списък със служители</h3>
                <div className="action-row">
                  <input
                    type="text"
                    placeholder="🔍 Търсене..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="btn-add"
                    onClick={() => setIsModalOpen(true)}
                  >
                    + ДОБАВИ СЛУЖИТЕЛ
                  </button>
                </div>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Име</th>
                    <th>Роля</th>
                    <th>Тип Заплащане</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name || user.username}</strong>
                        <br />
                        <span style={{ fontSize: "12px", color: "#7f8c8d" }}>
                          {user.email}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`role-badge ${getRoleBadgeClass(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.role === "Mechanic" ? (
                          <span
                            style={{
                              fontWeight: "bold",
                              color:
                                user.compensationType === "Percentage"
                                  ? "#e67e22"
                                  : "#2980b9",
                            }}
                          >
                            {user.compensationType === "Percentage"
                              ? `${user.commissionPercentage}% Заработка`
                              : `Твърда Заплата: ${user.monthlySalary} €`}
                          </span>
                        ) : (
                          <span
                            style={{ color: "#7f8c8d", fontStyle: "italic" }}
                          >
                            Стандартно
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-reset"
                          onClick={() =>
                            handleResetPassword(
                              user.id,
                              user.name || user.username,
                            )
                          }
                        >
                          🔑 Парола
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() =>
                            handleDeleteUser(
                              user.id,
                              user.name || user.username,
                            )
                          }
                        >
                          ✖ Изтрий
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "customers" && (
          <div className="card-container">
            <div className="card-header">
              <h3 className="card-title">Списък с клиенти</h3>
              <div className="action-row">
                <input
                  type="text"
                  placeholder="🔍 Търсене..."
                  className="search-input"
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                />
                <button
                  className="btn-add"
                  onClick={() => setIsCustomerModalOpen(true)}
                >
                  + ДОБАВИ КЛИЕНТ
                </button>
              </div>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Бр. Коли</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>
                        {customer.firstName} {customer.lastName}
                      </strong>
                      <br />
                      <span style={{ fontSize: "12px", color: "#7f8c8d" }}>
                        {customer.address}
                      </span>
                    </td>
                    <td>{customer.phone}</td>
                    <td>
                      <span className="car-count-badge">
                        {
                          (customer.vehicles || []).filter((v) => !v.isArchived)
                            .length
                        }{" "}
                        🚗
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-reset btn-profile"
                        onClick={() => navigate(`/customer/${customer.id}`)}
                      >
                        📂 Досие
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Добавяне на нов служител</h3>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Име:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Имейл:</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Парола:</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Роля:</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="Mechanic">Механик</option>
                  <option value="ManagerGTP">ГТП Мениджър</option>
                  <option value="Manager">Управител</option>
                  <option value="Admin">Админ</option>
                </select>
              </div>

              {formData.role === "Mechanic" && (
                <>
                  <div className="form-group">
                    <label style={{ color: "#e67e22", fontWeight: "bold" }}>
                      Тип заплащане:
                    </label>
                    <select
                      value={formData.compensationType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          compensationType: e.target.value,
                        })
                      }
                      style={{ border: "2px solid #e67e22" }}
                    >
                      <option value="Percentage">
                        На процент от труда (%)
                      </option>
                      <option value="Salary">Твърда месечна заплата</option>
                    </select>
                  </div>

                  {formData.compensationType === "Percentage" ? (
                    <div className="form-group">
                      <label>Процент за механика (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={formData.commissionPercentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            commissionPercentage: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label style={{ color: "#2980b9", fontWeight: "bold" }}>
                        Месечна заплата (€):
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="Напр. 1500"
                        value={formData.monthlySalary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlySalary: parseFloat(e.target.value),
                          })
                        }
                        style={{ border: "2px solid #2980b9" }}
                      />
                    </div>
                  )}
                </>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отказ
                </button>
                <button type="submit" className="btn-submit">
                  Запази
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCustomerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Добавяне на нов клиент</h3>
            <form onSubmit={handleAddCustomer}>
              <div className="form-group">
                <label>Име:</label>
                <input
                  type="text"
                  required
                  value={customerFormData.firstName}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Фамилия:</label>
                <input
                  type="text"
                  required
                  value={customerFormData.lastName}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Телефон:</label>
                <input
                  type="tel"
                  required
                  value={customerFormData.phone}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Имейл:</label>
                <input
                  type="email"
                  value={customerFormData.email}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Адрес:</label>
                <input
                  type="text"
                  value={customerFormData.address}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsCustomerModalOpen(false)}
                >
                  Отказ
                </button>
                <button type="submit" className="btn-submit">
                  Запази
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
