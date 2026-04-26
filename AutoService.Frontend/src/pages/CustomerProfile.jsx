import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./CustomerProfile.css";

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [editCustomerFormData, setEditCustomerFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });

  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [carFormData, setCarFormData] = useState({
    licensePlate: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    engineType: "Бензин",
    vehicleType: "Кола",
    drivetrain: "Предно",
    transmission: "Ръчна",
  });

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    message: "",
    vin: "",
    newCustomerId: "",
  });

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleRepairs, setVehicleRepairs] = useState([]);

  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairFormData, setRepairFormData] = useState({
    repairType: "Ремонт",
    complaint: "",
    description: "",
    mileage: 0,
  });

  const [isCostingModalOpen, setIsCostingModalOpen] = useState(false);
  const [costingRepair, setCostingRepair] = useState(null);
  const [partsList, setPartsList] = useState([]);
  const [laborCost, setLaborCost] = useState(0);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoRepair, setInfoRepair] = useState(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoRepair, setPhotoRepair] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCustomer = async () => {
    try {
      const response = await axios.get(`/api/Customers/${id}`);
      setCustomer(response.data);
    } catch (error) {
      console.error("Грешка при зареждане:", error);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const openEditCustomerModal = () => {
    setEditCustomerFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
    });
    setIsEditCustomerModalOpen(true);
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/Customers/${id}`, editCustomerFormData);
      alert("Данните на клиента са обновени успешно!");
      setIsEditCustomerModalOpen(false);
      fetchCustomer();
    } catch (error) {
      console.error(error);
      alert("Грешка при обновяване на клиента.");
    }
  };

  const fetchRepairs = async (vehicleId) => {
    try {
      const response = await axios.get(`/api/Repairs/vehicle/${vehicleId}`);
      setVehicleRepairs(response.data);
    } catch (error) {
      console.error("Грешка при зареждане на ремонтите:", error);
    }
  };

  const openVehicleProfile = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVehicleModalOpen(true);
    fetchRepairs(vehicle.id);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/Vehicles", {
        ...carFormData,
        customerId: parseInt(id),
        year: parseInt(carFormData.year),
      });
      setIsCarModalOpen(false);
      fetchCustomer();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setTransferData({
          message: error.response.data.message || error.response.data.Message,
          vin: carFormData.vin,
          newCustomerId: id,
        });
        setIsCarModalOpen(false);
        setIsTransferModalOpen(true);
      } else if (error.response && error.response.status === 400) {
        alert(error.response.data);
      } else {
        alert("Грешка от сървъра!");
      }
    }
  };

  const handleTransferVehicle = async () => {
    try {
      await axios.post(
        `/api/Vehicles/${transferData.vin}/transfer/${transferData.newCustomerId}`,
      );
      alert(
        "✅ Собствеността и историята са прехвърлени успешно към новия клиент!",
      );
      setIsTransferModalOpen(false);
      fetchCustomer();
    } catch (error) {
      console.error(error);
      alert("Възникна грешка при прехвърлянето на автомобила.");
    }
  };

  const handleArchiveVehicle = async (vehicleId, make, model) => {
    if (
      !window.confirm(
        `Сигурни ли сте, че искате да премахнете ${make} ${model} от този клиент?\nИсторията на ремонтите ще бъде запазена в архива.`,
      )
    )
      return;
    try {
      await axios.put(`/api/Vehicles/${vehicleId}/archive`);
      alert("Автомобилът е премахнат успешно!");
      fetchCustomer();
    } catch (error) {
      console.error(error);
      alert("Грешка при премахване на автомобила.");
    }
  };

  const handleAddRepair = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/Repairs", {
        repairType: repairFormData.repairType,
        complaint: repairFormData.complaint,
        description: repairFormData.description,
        mileage: parseInt(repairFormData.mileage),
        vehicleId: selectedVehicle.id,
        partsCost: 0,
        laborCost: 0,
      });
      setIsRepairModalOpen(false);
      setRepairFormData({
        repairType: "Ремонт",
        complaint: "",
        description: "",
        mileage: 0,
      });
      fetchRepairs(selectedVehicle.id);
    } catch (error) {
      alert("Грешка при добавяне на ремонт.");
    }
  };

  const openCostingModal = (repair) => {
    setCostingRepair(repair);
    setPartsList(repair.parts || []);
    setLaborCost(repair.laborCost || 0);
    setIsCostingModalOpen(true);
  };

  const openInfoModal = (repair) => {
    setInfoRepair(repair);
    setIsInfoModalOpen(true);
  };

  const openPhotoModal = (repair) => {
    setPhotoRepair(repair);
    setIsPhotoModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "repair_photos");

    try {
      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/dlpbuisb5/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );
      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      await axios.post(`/api/Repairs/${photoRepair.id}/photos`, {
        imageUrl: imageUrl,
      });

      alert("✅ Снимката е качена успешно!");
      fetchRepairs(selectedVehicle.id);

      setPhotoRepair((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), { id: Date.now(), imageUrl }],
      }));
    } catch (error) {
      console.error("Грешка при качване:", error);
      alert("❌ Възникна грешка при качването на снимката.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPartRow = () => {
    setPartsList([
      ...partsList,
      { name: "", partNumber: "", price: 0, quantity: 1 },
    ]);
  };

  const handlePartChange = (index, field, value) => {
    const newParts = [...partsList];
    newParts[index][field] = value;
    setPartsList(newParts);
  };

  const handleRemovePartRow = (index) => {
    setPartsList(partsList.filter((_, i) => i !== index));
  };

  const totalPartsPrice = partsList.reduce(
    (acc, part) =>
      acc + parseFloat(part.price || 0) * parseInt(part.quantity || 1),
    0,
  );
  const grandTotal = totalPartsPrice + parseFloat(laborCost || 0);

  const handleCostingSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        laborCost: parseFloat(laborCost || 0),
        parts: partsList.map((p) => ({
          name: p.name,
          partNumber: p.partNumber,
          price: parseFloat(p.price || 0),
          quantity: parseInt(p.quantity || 1),
        })),
      };
      await axios.put(`/api/Repairs/${costingRepair.id}/costing`, payload);
      alert("Ремонтът е остойностен успешно!");
      setIsCostingModalOpen(false);
      fetchRepairs(selectedVehicle.id);
    } catch (error) {
      alert("Грешка при запазване на частите!");
    }
  };

  const handlePayRepair = async (repairId) => {
    if (
      !window.confirm(
        "Сигурни ли сте, че клиентът е платил и искате да приключите ремонта?",
      )
    )
      return;
    try {
      await axios.put(`/api/Repairs/${repairId}/pay`);
      alert("✅ Успешно плащане! Ремонтът е приключен.");
      fetchRepairs(selectedVehicle.id);
    } catch (error) {
      alert("Възникна грешка при отразяване на плащането.");
    }
  };

  if (!customer)
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <h2>⏳ Зареждане...</h2>
        </div>
      </div>
    );

  const activeVehicles = (customer.vehicles || customer.Vehicles || []).filter(
    (v) => !v.isArchived,
  );
  const previousVehicles =
    customer.previousVehicles || customer.PreviousVehicles || [];

  const isCurrentOwner =
    selectedVehicle && selectedVehicle.customerId === parseInt(id);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <button className="btn-back" onClick={() => navigate("/manager")}>
          🔙 Назад към списъка
        </button>

        <div className="profile-header profile-header-wrapper">
          <div className="profile-header-info">
            <span className="profile-icon">👤</span>
            <div>
              <h1 className="profile-name">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="profile-phone profile-phone-text">
                📞 {customer.phone}{" "}
                {customer.address && `| 📍 ${customer.address}`}
              </p>
            </div>
          </div>
          <button
            className="btn-add btn-edit-customer"
            onClick={openEditCustomerModal}
          >
            ✏️ Редактирай Клиент
          </button>
        </div>

        <div className="card-container">
          <div className="card-header">
            <h3 className="card-title">Автомобили на клиента</h3>
            <button className="btn-add" onClick={() => setIsCarModalOpen(true)}>
              + ДОБАВИ АВТОМОБИЛ
            </button>
          </div>

          <div className="vehicles-grid">
            {activeVehicles.length === 0 ? (
              <p className="empty-vehicles-text">
                Този клиент няма активни автомобили.
              </p>
            ) : (
              activeVehicles.map((car) => (
                <div className="vehicle-card" key={car.id}>
                  <div className="vehicle-icon">
                    {car.vehicleType === "Бус" ? "🚐" : "🚗"}
                  </div>
                  <h4 className="vehicle-make-model">
                    {car.make} {car.model}
                  </h4>
                  <div className="vehicle-plate">{car.licensePlate}</div>
                  <p className="vehicle-year">Година: {car.year}</p>

                  <button
                    className="btn-vehicle-info"
                    onClick={() => openVehicleProfile(car)}
                  >
                    📂 Пълно Досие
                  </button>

                  <button
                    className="btn-remove-vehicle"
                    onClick={() =>
                      handleArchiveVehicle(car.id, car.make, car.model)
                    }
                  >
                    🗑️ Премахни колата
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {previousVehicles.length > 0 && (
          <div className="card-container previous-vehicles-container">
            <div className="card-header">
              <h3 className="card-title">Предишни автомобили (Прехвърлени)</h3>
            </div>
            <div className="vehicles-grid">
              {previousVehicles.map((car) => (
                <div
                  className="vehicle-card vehicle-card-archived"
                  key={car.id}
                >
                  <div className="vehicle-icon vehicle-icon-archived">
                    {car.vehicleType === "Бус" ? "🚐" : "🚗"}
                  </div>
                  <h4 className="vehicle-make-model vehicle-make-model-archived">
                    {car.make} {car.model}
                  </h4>
                  <div className="vehicle-plate vehicle-plate-archived">
                    {car.licensePlate}
                  </div>
                  <p className="vehicle-year">VIN: {car.vin}</p>

                  <button
                    className="btn-vehicle-info"
                    onClick={() => openVehicleProfile(car)}
                  >
                    📂 Виж Сервизна История
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isTransferModalOpen && (
        <div className="modal-overlay top-layer">
          <div className="modal-content size-md">
            <h2 className="transfer-modal-title">⚠️ Намерен е съвпадащ VIN!</h2>
            <p className="transfer-modal-message">{transferData.message}</p>
            <p className="transfer-modal-info">
              Ако колата е сменила собственика си, можете да я прехвърлите към
              текущия клиент. Цялата сервизна история ще бъде запазена и
              прехвърлена заедно с нея.
            </p>
            <div className="modal-actions spaced">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsTransferModalOpen(false)}
              >
                Отказ
              </button>
              <button
                type="button"
                className="btn-submit btn-transfer-submit"
                onClick={handleTransferVehicle}
              >
                🔄 Да, Прехвърли Колата
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditCustomerModalOpen && (
        <div className="modal-overlay top-layer">
          <div className="modal-content">
            <h3>Редактиране на клиент</h3>
            <form onSubmit={handleEditCustomer}>
              <div className="form-group">
                <label>Име:</label>
                <input
                  type="text"
                  required
                  value={editCustomerFormData.firstName}
                  onChange={(e) =>
                    setEditCustomerFormData({
                      ...editCustomerFormData,
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
                  value={editCustomerFormData.lastName}
                  onChange={(e) =>
                    setEditCustomerFormData({
                      ...editCustomerFormData,
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
                  value={editCustomerFormData.phone}
                  onChange={(e) =>
                    setEditCustomerFormData({
                      ...editCustomerFormData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Имейл (по желание):</label>
                <input
                  type="email"
                  value={editCustomerFormData.email}
                  onChange={(e) =>
                    setEditCustomerFormData({
                      ...editCustomerFormData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Адрес (по желание):</label>
                <input
                  type="text"
                  value={editCustomerFormData.address}
                  onChange={(e) =>
                    setEditCustomerFormData({
                      ...editCustomerFormData,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions spaced">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditCustomerModalOpen(false)}
                >
                  Отказ
                </button>
                <button type="submit" className="btn-submit btn-edit-customer">
                  Запази Промените
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCarModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content size-md">
            <h3>Добавяне на автомобил</h3>
            <form onSubmit={handleAddVehicle}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Рег. номер:</label>
                  <input
                    type="text"
                    required
                    value={carFormData.licensePlate}
                    onChange={(e) =>
                      setCarFormData({
                        ...carFormData,
                        licensePlate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>VIN:</label>
                  <input
                    type="text"
                    required
                    value={carFormData.vin}
                    onChange={(e) =>
                      setCarFormData({ ...carFormData, vin: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Марка:</label>
                  <input
                    type="text"
                    required
                    value={carFormData.make}
                    onChange={(e) =>
                      setCarFormData({ ...carFormData, make: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Модел:</label>
                  <input
                    type="text"
                    required
                    value={carFormData.model}
                    onChange={(e) =>
                      setCarFormData({ ...carFormData, model: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Година:</label>
                  <input
                    type="number"
                    required
                    value={carFormData.year}
                    onChange={(e) =>
                      setCarFormData({ ...carFormData, year: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Тип МПС:</label>
                  <select
                    value={carFormData.vehicleType}
                    onChange={(e) =>
                      setCarFormData({
                        ...carFormData,
                        vehicleType: e.target.value,
                      })
                    }
                  >
                    <option>Кола</option>
                    <option>Бус</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Двигател:</label>
                  <select
                    value={carFormData.engineType}
                    onChange={(e) =>
                      setCarFormData({
                        ...carFormData,
                        engineType: e.target.value,
                      })
                    }
                  >
                    <option>Бензин</option>
                    <option>Дизел</option>
                    <option>Газ/Бензин</option>
                    <option>Хибрид</option>
                    <option>Електрически</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Задвижване:</label>
                  <select
                    value={carFormData.drivetrain}
                    onChange={(e) =>
                      setCarFormData({
                        ...carFormData,
                        drivetrain: e.target.value,
                      })
                    }
                  >
                    <option>Предно</option>
                    <option>Задно</option>
                    <option>4x4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Трансмисия:</label>
                  <select
                    value={carFormData.transmission}
                    onChange={(e) =>
                      setCarFormData({
                        ...carFormData,
                        transmission: e.target.value,
                      })
                    }
                  >
                    <option>Ръчна</option>
                    <option>Автоматик</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions spaced">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsCarModalOpen(false)}
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

      {isRepairModalOpen && (
        <div className="modal-overlay top-layer">
          <div className="modal-content size-md">
            <h3 className="modal-title-md">Въвеждане на ремонт</h3>
            <form onSubmit={handleAddRepair}>
              <div className="form-grid-2">
                <div className="form-group form-group-no-margin">
                  <label>Тип посещение:</label>
                  <select
                    value={repairFormData.repairType}
                    onChange={(e) =>
                      setRepairFormData({
                        ...repairFormData,
                        repairType: e.target.value,
                      })
                    }
                  >
                    <option value="Обслужване">Обслужване</option>
                    <option value="Ремонт">Ремонт</option>
                    <option value="Диагностика">Диагностика</option>
                  </select>
                </div>
                <div className="form-group form-group-no-margin">
                  <label>Оплакване (Опционално):</label>
                  <textarea
                    rows="1"
                    placeholder="Напр. Тропане отпред..."
                    className="custom-textarea small"
                    value={repairFormData.complaint}
                    onChange={(e) =>
                      setRepairFormData({
                        ...repairFormData,
                        complaint: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Действия / Какво ще се прави:</label>
                <textarea
                  required
                  rows="2"
                  className="custom-textarea"
                  value={repairFormData.description}
                  onChange={(e) =>
                    setRepairFormData({
                      ...repairFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Актуални километри:</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={repairFormData.mileage}
                  onChange={(e) =>
                    setRepairFormData({
                      ...repairFormData,
                      mileage: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions spaced">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsRepairModalOpen(false)}
                >
                  Отказ
                </button>
                <button type="submit" className="btn-submit">
                  Създай Ремонт
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isVehicleModalOpen && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal-content size-xl">
            <div className="modal-header-flex">
              <h2 className="modal-title-xl">Паспорт на автомобила</h2>
              <button
                className="btn-close-modal"
                onClick={() => setIsVehicleModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <div className="vehicle-profile-grid">
              <div className="info-card">
                <h4>🚗 Основна информация</h4>
                <p>
                  <strong>Марка и Модел:</strong> {selectedVehicle.make}{" "}
                  {selectedVehicle.model}
                </p>
                <p>
                  <strong>Рег. Номер:</strong> {selectedVehicle.licensePlate}
                </p>
                <p>
                  <strong>Година:</strong> {selectedVehicle.year}
                </p>
              </div>
              <div className="info-card">
                <h4>⚙️ Технически спецификации</h4>
                <p>
                  <strong>VIN Номер:</strong> {selectedVehicle.vin}
                </p>
                <p>
                  <strong>Двигател:</strong> {selectedVehicle.engineType}
                </p>
                <p>
                  <strong>Задвижване:</strong> {selectedVehicle.drivetrain}
                </p>
                <p>
                  <strong>Трансмисия:</strong>{" "}
                  {selectedVehicle.transmission || "Няма данни"}
                </p>
              </div>
            </div>

            <div className="service-history-section">
              <div className="history-header">
                <h3 className="modal-title-xl history-title-large">
                  🛠️ История на ремонтите
                </h3>
                {isCurrentOwner && (
                  <button
                    className="btn-add large-text"
                    onClick={() => setIsRepairModalOpen(true)}
                  >
                    + НОВ РЕМОНТ
                  </button>
                )}
              </div>

              {!isCurrentOwner && (
                <p className="empty-parts-message warning-left">
                  * Този автомобил вече е собственост на друг клиент. Можете
                  само да разглеждате сервизната му история.
                </p>
              )}

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Описание</th>
                    <th>Километри</th>
                    <th>Обща Цена</th>
                    <th>Статус / Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleRepairs.map((repair) => (
                    <tr key={repair.id}>
                      <td>
                        {new Date(repair.createdAt).toLocaleDateString("bg-BG")}
                      </td>
                      <td>
                        <span className="repair-type-badge">
                          {repair.repairType}
                        </span>
                        <br />
                        <strong>{repair.description}</strong>
                        {repair.workedHours > 0 || repair.workedMinutes > 0 ? (
                          <div className="repair-worked-time">
                            ⏱️ Изработено: {repair.workedHours}ч.{" "}
                            {repair.workedMinutes}м.
                          </div>
                        ) : null}
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

                        {isCurrentOwner && repair.status !== "Завършен" && (
                          <button
                            className="action-btn-costing"
                            onClick={() => openCostingModal(repair)}
                          >
                            ✏️ Редактирай / Остойности
                          </button>
                        )}

                        {isCurrentOwner && repair.status !== "Завършен" && (
                          <button
                            className="action-btn-info btn-photos"
                            onClick={() => openPhotoModal(repair)}
                          >
                            📸 Снимки
                          </button>
                        )}

                        {isCurrentOwner &&
                          repair.status === "Остойностен (Чака плащане)" && (
                            <button
                              className="action-btn-costing btn-pay-repair"
                              onClick={() => handlePayRepair(repair.id)}
                            >
                              ✅ Платено и Приключено
                            </button>
                          )}

                        {repair.status === "Завършен" && (
                          <button
                            className="action-btn-info"
                            onClick={() => openInfoModal(repair)}
                          >
                            ℹ️ Виж фактурата
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions spaced">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsVehicleModalOpen(false)}
              >
                Затвори Досието
              </button>
            </div>
          </div>
        </div>
      )}

      {isCostingModalOpen && costingRepair && (
        <div className="modal-overlay top-layer">
          <div className="modal-content size-xl">
            <h2 className="modal-title-xl modal-title-margin">
              💰 Фактуриране и Части
            </h2>
            <p className="modal-subtitle-text">
              Ремонт: <strong>{costingRepair.description}</strong>
            </p>

            <form onSubmit={handleCostingSubmit}>
              <div className="parts-container">
                <button
                  type="button"
                  className="btn-add-part"
                  onClick={handleAddPartRow}
                >
                  ➕ Добави нова част
                </button>
                {partsList.length > 0 && (
                  <div className="part-row part-row-header">
                    <div>Име на частта</div>
                    <div>ОЕМ / Номер</div>
                    <div>Ед. Цена (€)</div>
                    <div>Количество</div>
                    <div>Изтрий</div>
                  </div>
                )}
                {partsList.map((part, index) => (
                  <div className="part-row" key={index}>
                    <input
                      type="text"
                      placeholder="Име..."
                      required
                      className="custom-textarea small"
                      value={part.name}
                      onChange={(e) =>
                        handlePartChange(index, "name", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Номер (опция)"
                      className="custom-textarea small"
                      value={part.partNumber}
                      onChange={(e) =>
                        handlePartChange(index, "partNumber", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="custom-textarea small"
                      placeholder="Цена"
                      value={part.price}
                      onChange={(e) =>
                        handlePartChange(index, "price", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="1"
                      required
                      className="custom-textarea small"
                      placeholder="Бр."
                      value={part.quantity}
                      onChange={(e) =>
                        handlePartChange(index, "quantity", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="btn-remove-part"
                      onClick={() => handleRemovePartRow(index)}
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-group labor-cost-group">
                <label className="labor-cost-label">
                  👨‍🔧 Цена за Труд Общо (€):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="custom-textarea labor-cost-input"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                />
              </div>

              <div className="totals-box">
                <p className="totals-text">
                  Части: {totalPartsPrice.toFixed(2)} €
                </p>
                <p className="totals-text">
                  Труд: {parseFloat(laborCost || 0).toFixed(2)} €
                </p>
                <h3>ОБЩО ЗА ПЛАЩАНЕ: {grandTotal.toFixed(2)} €</h3>
              </div>

              <div className="modal-actions spaced">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsCostingModalOpen(false)}
                >
                  Отказ
                </button>
                <button type="submit" className="btn-submit btn-submit-success">
                  💾 ЗАПАЗИ И ОСТОЙНОСТИ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInfoModalOpen && infoRepair && (
        <div className="modal-overlay top-layer invoice-print-container">
          <div
            className="modal-content size-xl invoice-modal-content"
            id="printable-invoice"
          >
            <div className="modal-header-flex no-print">
              <h2 className="modal-title-xl invoice-title">
                🧾 Детайли за ремонта (Фактура)
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
              <p className="invoice-print-sub">Официална сервизна бележка</p>
              <p className="invoice-print-date">
                Дата и час на издаване:{" "}
                {new Date(infoRepair.createdAt).toLocaleString("bg-BG", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}{" "}
                ч.
              </p>
            </div>

            <div className="invoice-header-box">
              <div className="invoice-info-group">
                <h4 className="invoice-info-title">👤 Данни за клиента:</h4>
                <p className="invoice-info-text">
                  <strong>Име:</strong> {customer.firstName} {customer.lastName}
                </p>
                <p className="invoice-info-text">
                  <strong>Телефон:</strong> {customer.phone}
                </p>
                {customer.address && (
                  <p className="invoice-info-text">
                    <strong>Адрес:</strong> {customer.address}
                  </p>
                )}
              </div>
              <div className="invoice-info-group">
                <h4 className="invoice-info-title">🚗 Данни за автомобила:</h4>
                <p className="invoice-info-text">
                  <strong>Модел:</strong> {selectedVehicle.make}{" "}
                  {selectedVehicle.model} ({selectedVehicle.year} г.)
                </p>
                <p className="invoice-info-text">
                  <strong>Рег. Номер:</strong> {selectedVehicle.licensePlate}
                </p>
                <p className="invoice-info-text">
                  <strong>VIN Номер:</strong> {selectedVehicle.vin}
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
                🖨️ Разпечатай Бележка
              </button>
            </div>
          </div>
        </div>
      )}

      {isPhotoModalOpen && photoRepair && (
        <div className="modal-overlay top-layer">
          <div className="modal-content size-md">
            <div className="modal-header-flex">
              <h2 className="modal-title-md">📸 Снимки към ремонт</h2>
              <button
                className="btn-close-modal"
                onClick={() => setIsPhotoModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <p className="modal-subtitle-text mb-20">
              Ремонт: <strong>{photoRepair.description}</strong>
            </p>

            <div className="photo-buttons-container">
              <label className="btn-camera">
                {isUploading ? "⏳ Качване..." : "📷 Снимай сега"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
              </label>

              <label className="btn-gallery">
                {isUploading ? "⏳ Качване..." : "📁 От телефона"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {photoRepair.photos && photoRepair.photos.length > 0 ? (
              <div className="photos-grid">
                {photoRepair.photos.map((p) => (
                  <a
                    key={p.id}
                    href={p.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={p.imageUrl}
                      alt="Repair"
                      className="repair-photo-img"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="empty-photos-text">
                Все още няма качени снимки за този ремонт.
              </p>
            )}

            <div className="modal-actions spaced mt-20">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsPhotoModalOpen(false)}
              >
                Затвори
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
