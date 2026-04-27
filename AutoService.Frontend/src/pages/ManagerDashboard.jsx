import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./ManagerDashboard.css";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Users,
  UserSquare2,
  Wrench,
  Briefcase,
  Search,
  UserPlus,
  KeyRound,
  Trash2,
  CarFront,
  FolderOpen,
  X,
} from "lucide-react";

export default function ManagerDashboard() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      const response = await axios.get("/api/Auth/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Грешка:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("/api/Customers");
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
      await axios.post("/api/Auth/register", {
        username: formData.name,
        email: formData.email,
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
        role: "Mechanic",
        compensationType: "Percentage",
        commissionPercentage: 40,
        monthlySalary: 0,
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Грешка!");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете: ${name}?`)) {
      try {
        await axios.delete(`/api/Auth/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert("Грешка при изтриване.");
      }
    }
  };

  const handleResetPassword = async (id, name) => {
    if (window.confirm(`Изпращане на линк за нова парола до: ${name}?`)) {
      try {
        await axios.post(`/api/Auth/reset-password/${id}`);
        alert("Линкът е изпратен!");
      } catch (error) {
        alert("Грешка!");
      }
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/Customers", customerFormData);
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
      alert("Грешка!");
    }
  };

  const getRoleBadgeClass = (role) =>
    role === "Admin"
      ? "role-admin"
      : role === "Manager" || role === "ManagerGTP"
        ? "role-manager"
        : "role-mechanic";

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
        <h1 className="dashboard-header icon-text-flex">
          <ClipboardList size={32} /> Управление
        </h1>

        <div className="tabs-container">
          <button
            className={`tab-button icon-text-flex-center ${activeTab === "employees" ? "active" : ""}`}
            onClick={() => setActiveTab("employees")}
          >
            <UserSquare2 size={20} /> Служители
          </button>
          <button
            className={`tab-button icon-text-flex-center ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <Users size={20} /> Клиенти и Автомобили
          </button>
        </div>

        {activeTab === "employees" && (
          <>
            <div className="stats-grid">
              <div className="stat-card gray">
                <span className="stat-icon">
                  <Users size={32} />
                </span>
                <div className="stat-info">
                  <h4>Общо Служители</h4>
                  <p>{users.length}</p>
                </div>
              </div>
              <div className="stat-card blue">
                <span className="stat-icon">
                  <Wrench size={32} />
                </span>
                <div className="stat-info">
                  <h4>Механици</h4>
                  <p>{users.filter((u) => u.role === "Mechanic").length}</p>
                </div>
              </div>
              <div className="stat-card orange">
                <span className="stat-icon">
                  <Briefcase size={32} />
                </span>
                <div className="stat-info">
                  <h4>Управители</h4>
                  <p>
                    {
                      users.filter(
                        (u) => u.role === "Manager" || u.role === "ManagerGTP",
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="card-container">
              <div className="card-header">
                <h3 className="card-title">Списък със служители</h3>
                <div className="action-row">
                  <div className="search-input-wrapper">
                    <Search size={18} className="search-icon-inside" />
                    <input
                      type="text"
                      placeholder="Търсене..."
                      className="search-input has-icon"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn-add icon-text-flex-center"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <UserPlus size={18} /> ДОБАВИ СЛУЖИТЕЛ
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
                        <span className="sub-text-muted">{user.email}</span>
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
                            className={
                              user.compensationType === "Percentage"
                                ? "comp-percentage"
                                : "comp-salary"
                            }
                          >
                            {user.compensationType === "Percentage"
                              ? `${user.commissionPercentage}% Заработка`
                              : `Твърда Заплата: ${user.monthlySalary} €`}
                          </span>
                        ) : (
                          <span className="comp-standard">Стандартно</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-wrapper">
                          <button
                            className="btn-reset icon-text-flex-center"
                            onClick={() =>
                              handleResetPassword(
                                user.id,
                                user.name || user.username,
                              )
                            }
                          >
                            <KeyRound size={16} /> Парола
                          </button>
                          <button
                            className="btn-delete icon-text-flex-center"
                            onClick={() =>
                              handleDeleteUser(
                                user.id,
                                user.name || user.username,
                              )
                            }
                          >
                            <Trash2 size={16} /> Изтрий
                          </button>
                        </div>
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
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon-inside" />
                  <input
                    type="text"
                    placeholder="Търсене..."
                    className="search-input has-icon"
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="btn-add icon-text-flex-center"
                  onClick={() => setIsCustomerModalOpen(true)}
                >
                  <UserPlus size={18} /> ДОБАВИ КЛИЕНТ
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
                      <span className="sub-text-muted">{customer.address}</span>
                    </td>
                    <td>{customer.phone}</td>
                    <td>
                      <span className="car-count-badge icon-text-flex-center">
                        {
                          (customer.vehicles || []).filter((v) => !v.isArchived)
                            .length
                        }
                        <CarFront size={16} style={{ marginLeft: "4px" }} />
                      </span>
                    </td>
                    <td>
                      <div className="actions-wrapper">
                        <button
                          className="btn-reset btn-profile icon-text-flex-center"
                          onClick={() => navigate(`/customer/${customer.id}`)}
                        >
                          <FolderOpen size={16} /> Досие
                        </button>
                      </div>
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
            <div className="modal-header-flex">
              <h3>Добавяне на нов служител</h3>
              <button
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
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
                    <label>Тип заплащане:</label>
                    <select
                      value={formData.compensationType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          compensationType: e.target.value,
                        })
                      }
                      className="input-percentage"
                    >
                      <option value="Percentage">На процент (%)</option>
                      <option value="Salary">Твърда заплата</option>
                    </select>
                  </div>
                  {formData.compensationType === "Percentage" ? (
                    <div className="form-group">
                      <label>Процент (%):</label>
                      <input
                        type="number"
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
                      <label>Заплата (€):</label>
                      <input
                        type="number"
                        required
                        value={formData.monthlySalary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlySalary: parseFloat(e.target.value),
                          })
                        }
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
            <div className="modal-header-flex">
              <h3>Добавяне на нов клиент</h3>
              <button
                className="btn-close-modal"
                onClick={() => setIsCustomerModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
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
