import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import Icons from "./components/Icons";
import ActionSection from "./sections/ActionSection";
import AppModals from "./sections/AppModals";
import ConfigSection from "./sections/ConfigSection";
import LedgerSection from "./sections/LedgerSection";
import StockSection from "./sections/StockSection";
import SystemSection from "./sections/SystemSection";
import {
  addMaterial,
  addProduct,
  batchRestockMaterials,
  deleteMaterial,
  deleteProduct,
  getStoredData,
  reactivateMaterial,
  reactivateProduct,
  registerMixBatch,
  registerYieldBatch,
  resetSystemData,
  restoreBackup,
  restockMaterial,
  shipProduct,
  undoLog,
  updateMaterial,
  updateProduct
} from "./utils/db";

const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysAgoString = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getLocalDateString(date);
};

const getTodayString = () => getLocalDateString(new Date());
const emptyConfirm = { show: false, title: "", message: "", error: "", onConfirm: null };

function randomCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 4; index += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function App() {
  const [initialData] = useState(() => getStoredData());
  const [materials, setMaterials] = useState(initialData.materials);
  const [products, setProducts] = useState(initialData.products);
  const [logs, setLogs] = useState(initialData.logs);
  const [activeTab, setActiveTab] = useState("stock");
  const [toasts, setToasts] = useState([]);

  const [statsTimeRange, setStatsTimeRange] = useState("7");
  const [customStartDate, setCustomStartDate] = useState(() => getDaysAgoString(7));
  const [customEndDate, setCustomEndDate] = useState(() => getTodayString());
  const [ledgerTimeRange, setLedgerTimeRange] = useState("all");
  const [ledgerStartDate, setLedgerStartDate] = useState(() => getDaysAgoString(7));
  const [ledgerEndDate, setLedgerEndDate] = useState(() => getTodayString());

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showMixModal, setShowMixModal] = useState(false);
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSystemPanel, setShowSystemPanel] = useState(false);

  const [confirmModal, setConfirmModal] = useState(emptyConfirm);
  const [resetCountdown, setResetCountdown] = useState(5);
  const [resetCaptcha, setResetCaptcha] = useState("");
  const [resetInputCaptcha, setResetInputCaptcha] = useState("");

  const [formRestock, setFormRestock] = useState({ items: [], notes: "" });
  const [formShipment, setFormShipment] = useState({ productId: "", qty: "", notes: "" });
  const [formMix, setFormMix] = useState({ notes: "" });
  const [mixConsumptions, setMixConsumptions] = useState({});
  const [formYield, setFormYield] = useState({ productId: "", qty: "", notes: "" });
  const [formNewMaterial, setFormNewMaterial] = useState({ name: "", unit: "kg", minStock: "" });
  const [formEditMaterial, setFormEditMaterial] = useState({ id: "", name: "", unit: "kg", minStock: "" });
  const [formNewProduct, setFormNewProduct] = useState({ name: "", unit: "双" });
  const [formEditProduct, setFormEditProduct] = useState({ id: "", name: "", unit: "双" });

  useEffect(() => {
    let timer = null;
    if (showResetModal && resetCountdown > 0) {
      timer = setInterval(() => setResetCountdown((prev) => prev - 1), 1000);
    }
    return () => timer && clearInterval(timer);
  }, [showResetModal, resetCountdown]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3000);
  }, []);

  const parseLocalDate = (dateStr, isStart) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    if (isStart) date.setHours(0, 0, 0, 0);
    else date.setHours(23, 59, 59, 999);
    return date;
  };

  const getDaysAgoDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - parseInt(days, 10));
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const isLogInSelectedRange = useCallback((log) => {
    if (!log.date) return false;
    const logDate = new Date(log.date);
    if (statsTimeRange !== "custom") return logDate >= getDaysAgoDate(statsTimeRange);
    const startDate = parseLocalDate(customStartDate, true);
    const endDate = parseLocalDate(customEndDate, false);
    if (startDate && logDate < startDate) return false;
    if (endDate && logDate > endDate) return false;
    return true;
  }, [statsTimeRange, customStartDate, customEndDate]);

  const activePeriodDays = useMemo(() => {
    if (statsTimeRange !== "custom") return parseInt(statsTimeRange, 10) || 7;
    const startDate = parseLocalDate(customStartDate, true);
    const endDate = parseLocalDate(customEndDate, false);
    if (!startDate || !endDate) return 7;
    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [statsTimeRange, customStartDate, customEndDate]);

  const materialConsumptionMap = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      if ((log.type === "mix" || log.type === "production") && isLogInSelectedRange(log) && Array.isArray(log.consumptions)) {
        log.consumptions.forEach((item) => {
          if (item.name && item.qty) {
            map[item.name] = (map[item.name] || 0) + parseFloat(item.qty);
          }
        });
      }
    });
    return map;
  }, [logs, isLogInSelectedRange]);

  const productConsumptionStats = useMemo(() => {
    const stats = {};
    logs.forEach((log) => {
      if ((log.type === "yield" || log.type === "production") && isLogInSelectedRange(log)) {
        const name = log.itemName;
        if (!stats[name]) stats[name] = { totalQty: 0 };
        stats[name].totalQty += parseFloat(log.qty || 0);
      }
    });
    return stats;
  }, [logs, isLogInSelectedRange]);

  const activePeriodCons = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      if ((log.type === "mix" || log.type === "production") && Array.isArray(log.consumptions) && isLogInSelectedRange(log)) {
        log.consumptions.forEach((item) => {
          if (item.name && item.qty) {
            map[item.name] = (map[item.name] || 0) + parseFloat(item.qty);
          }
        });
      }
    });
    return map;
  }, [logs, isLogInSelectedRange]);

  const materialHealthStats = useMemo(() => {
    return materials.map((item) => {
      const periodTotal = activePeriodCons[item.name] || 0;
      const dailyAvg = periodTotal / activePeriodDays;
      const daysRemaining = dailyAvg > 0 ? parseFloat((item.stock / dailyAvg).toFixed(1)) : null;
      return {
        ...item,
        dailyAvg: parseFloat(dailyAvg.toFixed(2)),
        daysRemaining
      };
    });
  }, [materials, activePeriodCons, activePeriodDays]);

  const stockStats = useMemo(() => {
    const selectedLogs = logs.filter(isLogInSelectedRange);
    return {
      mixBatchCount: selectedLogs.filter((log) => log.type === "mix" || log.type === "production").length,
      yieldBatchCount: selectedLogs.filter((log) => log.type === "yield" || log.type === "production").length,
      producedQty: selectedLogs
        .filter((log) => log.type === "yield" || log.type === "production")
        .reduce((total, log) => total + parseFloat(log.qty || 0), 0),
      shippedQty: selectedLogs
        .filter((log) => log.type === "shipment")
        .reduce((total, log) => total + parseFloat(log.qty || 0), 0)
    };
  }, [logs, isLogInSelectedRange]);

  const isLogInLedgerRange = useCallback((log) => {
    if (ledgerTimeRange === "all") return true;
    if (!log.date) return false;
    const logDate = parseLocalDate(log.date, true);
    if (ledgerTimeRange !== "custom") return logDate >= getDaysAgoDate(ledgerTimeRange);
    const startDate = parseLocalDate(ledgerStartDate, true);
    const endDate = parseLocalDate(ledgerEndDate, false);
    if (startDate && logDate < startDate) return false;
    if (endDate && logDate > endDate) return false;
    return true;
  }, [ledgerTimeRange, ledgerStartDate, ledgerEndDate]);

  const ledgerLogs = useMemo(() => logs.filter(isLogInLedgerRange), [logs, isLogInLedgerRange]);

  const getBatteryPercent = (stock, minStock) => {
    if (minStock === 0) return 100;
    const ratio = stock / (minStock * 2);
    return Math.min(100, Math.max(8, Math.round(ratio * 100)));
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    const validItems = formRestock.items.filter((item) => item.qty && parseFloat(item.qty) > 0);
    if (validItems.length === 0) {
      showToast("请至少填写一种原材料的补货数量", "error");
      return;
    }
    const result = validItems.length === 1
      ? restockMaterial(validItems[0].materialId, validItems[0].qty, "管理员", formRestock.notes)
      : batchRestockMaterials(validItems, "管理员", formRestock.notes);
    if (result.success) {
      setMaterials(result.materials);
      setLogs(result.logs);
      setShowRestockModal(false);
      setFormRestock({ items: [], notes: "" });
      showToast("原料库存补给成功！");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleShipmentSubmit = (e) => {
    e.preventDefault();
    if (!formShipment.productId || !formShipment.qty || parseFloat(formShipment.qty) <= 0) {
      showToast("请填写完整的出货数量", "error");
      return;
    }
    const result = shipProduct(formShipment.productId, formShipment.qty, "管理员", formShipment.notes);
    if (result.success) {
      setProducts(result.products);
      setLogs(result.logs);
      setShowShipmentModal(false);
      setFormShipment({ productId: "", qty: "", notes: "" });
      showToast("产品出货登记成功！");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleMixSubmit = (e) => {
    e.preventDefault();
    const consumptionsArray = Object.keys(mixConsumptions).map((materialId) => ({ materialId, qty: mixConsumptions[materialId] }));
    if (!consumptionsArray.some((item) => item.qty && parseFloat(item.qty) > 0)) {
      showToast("请至少填写一种原材料消耗量", "error");
      return;
    }
    const result = registerMixBatch(consumptionsArray, "管理员", formMix.notes);
    if (result.success) {
      setMaterials(result.materials);
      setLogs(result.logs);
      setShowMixModal(false);
      setFormMix({ notes: "" });
      setMixConsumptions({});
      showToast("打料消耗登记成功！");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleYieldSubmit = (e) => {
    e.preventDefault();
    if (!formYield.productId || !formYield.qty || parseFloat(formYield.qty) <= 0) {
      showToast("请填写完整的完工产量", "error");
      return;
    }
    const result = registerYieldBatch(formYield.productId, formYield.qty, "管理员", formYield.notes);
    if (result.success) {
      setProducts(result.products);
      setLogs(result.logs);
      setShowYieldModal(false);
      setFormYield({ productId: "", qty: "", notes: "" });
      showToast("完工报产登记成功！");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleReuseLastMixCons = useCallback(() => {
    const lastMixLog = logs.find((log) => log.type === "mix" || log.type === "production");
    if (!lastMixLog) {
      showToast("未找到历史打料记录，请先手动登记一次", "error");
      return;
    }
    if (!lastMixLog.consumptions?.length) {
      showToast("上一批次没有原料消耗数据", "error");
      return;
    }
    const nextConsumptions = {};
    lastMixLog.consumptions.forEach((item) => {
      const material = materials.find((entry) => entry.name === item.name);
      if (material) nextConsumptions[material.id] = String(item.qty);
    });
    setMixConsumptions(nextConsumptions);
    showToast("已沿用上一批次打料消耗");
  }, [logs, materials, showToast]);

  const handleConsKeyNavigation = useCallback((e, index, totalCount) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextInput = document.querySelector(`[data-mat-index="${(index + 1) % totalCount}"]`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevInput = document.querySelector(`[data-mat-index="${(index - 1 + totalCount) % totalCount}"]`);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
  }, []);

  const handleOpenResetModal = useCallback(() => {
    setResetCountdown(5);
    setResetCaptcha(randomCaptcha());
    setResetInputCaptcha("");
    setShowResetModal(true);
  }, []);

  const handleSystemReset = useCallback((e) => {
    e.preventDefault();
    if (resetCountdown > 0) {
      showToast("警告倒计时未结束，请稍候", "error");
      return;
    }
    if (resetInputCaptcha.trim().toUpperCase() !== resetCaptcha) {
      showToast("验证码输入错误，请重新核对", "error");
      return;
    }
    const result = resetSystemData();
    if (result.success) {
      setMaterials(result.materials);
      setProducts(result.products);
      setLogs(result.logs);
      setShowResetModal(false);
      setResetInputCaptcha("");
      showToast("系统数据已重置为初始状态");
    } else {
      showToast(result.message, "error");
    }
  }, [resetCountdown, resetInputCaptcha, resetCaptcha, showToast]);

  const handleUndo = useCallback((logId) => {
    setConfirmModal({
      show: true,
      title: "撤销流水",
      message: "确定撤销该批次记账吗？撤销后相关库存会自动回滚，且该记录会被永久删除。",
      confirmText: "确认撤销",
      confirmBg: "var(--color-danger)",
      error: "",
      onConfirm: () => {
        const result = undoLog(logId);
        if (result.success) {
          setMaterials(result.materials);
          setProducts(result.products);
          setLogs(result.logs);
          showToast("流水撤销成功，库存已回滚！");
          return { success: true };
        }
        showToast(result.message, "error");
        return { success: false, message: result.message };
      }
    });
  }, [showToast]);

  const handleAddMaterialSubmit = (e) => {
    e.preventDefault();
    if (!formNewMaterial.name.trim() || !formNewMaterial.minStock || parseFloat(formNewMaterial.minStock) < 0) {
      showToast("请填写正确的原材料名称与预警水位", "error");
      return;
    }
    const result = addMaterial(
      formNewMaterial.name.trim(),
      formNewMaterial.unit,
      formNewMaterial.minStock
    );
    if (result.success) {
      setMaterials(result.materials);
      setShowAddMaterialModal(false);
      setFormNewMaterial({ name: "", unit: "kg", minStock: "" });
      showToast("新原材料添加成功！");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleEditMaterialSubmit = (e) => {
    e.preventDefault();
    if (!formEditMaterial.name.trim() || !formEditMaterial.minStock || parseFloat(formEditMaterial.minStock) < 0) {
      showToast("请填写正确的原材料名称与预警水位", "error");
      return;
    }
    const result = updateMaterial(
      formEditMaterial.id,
      formEditMaterial.name.trim(),
      formEditMaterial.unit,
      formEditMaterial.minStock
    );
    if (result.success) {
      setMaterials(result.materials);
      setLogs(result.logs);
      setShowEditMaterialModal(false);
      showToast("原材料修改成功！");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!formNewProduct.name.trim()) {
      showToast("请填写产品名称", "error");
      return;
    }
    const result = addProduct(
      formNewProduct.name.trim(),
      formNewProduct.unit,
      0
    );
    if (result.success) {
      setProducts(result.products);
      setShowAddProductModal(false);
      setFormNewProduct({ name: "", unit: "双" });
      showToast("新产品添加成功！");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleEditProductSubmit = (e) => {
    e.preventDefault();
    if (!formEditProduct.name.trim()) {
      showToast("请填写产品名称", "error");
      return;
    }
    const result = updateProduct(
      formEditProduct.id,
      formEditProduct.name.trim(),
      formEditProduct.unit,
      0
    );
    if (result.success) {
      setProducts(result.products);
      setLogs(result.logs);
      setShowEditProductModal(false);
      showToast("产品修改成功！");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleDeleteMaterial = useCallback((id) => {
    const material = materials.find((item) => item.id === id);
    if (!material) return;
    const referenced = logs.some((log) => {
      if (log.type === "restock" && log.itemName === material.name) return true;
      if ((log.type === "mix" || log.type === "production") && Array.isArray(log.consumptions)) {
        return log.consumptions.some((item) => item.name === material.name);
      }
      return false;
    });
    setConfirmModal({
      show: true,
      title: referenced ? "停用并归档原材料" : "彻底删除原材料",
      message: referenced
        ? `“${material.name}” 已关联历史流水，无法直接物理删除。系统将执行停用归档，历史记录会完整保留。`
        : `“${material.name}” 当前未关联历史流水，确定将其彻底删除吗？删除后无法恢复。`,
      confirmText: referenced ? "确认停用归档" : "确认彻底删除",
      confirmBg: referenced ? "var(--color-orange)" : "var(--color-danger)",
      error: "",
      onConfirm: () => {
        const result = deleteMaterial(id);
        if (result.success) {
          setMaterials(result.materials);
          showToast(referenced ? "物料已停用并归档" : "原材料已彻底删除");
          return { success: true };
        }
        showToast(result.message, "error");
        return { success: false, message: result.message };
      }
    });
  }, [materials, logs, showToast]);

  const handleDeleteProduct = useCallback((id) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const referenced = logs.some((log) => (log.type === "shipment" || log.type === "yield" || log.type === "production") && log.itemName === product.name);
    setConfirmModal({
      show: true,
      title: referenced ? "停用并归档产品" : "彻底删除产品",
      message: referenced
        ? `“${product.name}” 已关联历史流水，无法直接物理删除。系统将执行停用归档，历史记录会完整保留。`
        : `“${product.name}” 当前未关联历史流水，确定将其彻底删除吗？删除后无法恢复。`,
      confirmText: referenced ? "确认停用归档" : "确认彻底删除",
      confirmBg: referenced ? "var(--color-orange)" : "var(--color-danger)",
      error: "",
      onConfirm: () => {
        const result = deleteProduct(id);
        if (result.success) {
          setProducts(result.products);
          showToast(referenced ? "产品已停用并归档" : "产品已彻底删除");
          return { success: true };
        }
        showToast(result.message, "error");
        return { success: false, message: result.message };
      }
    });
  }, [products, logs, showToast]);

  const handleReactivateMaterial = useCallback((id) => {
    const result = reactivateMaterial(id);
    if (result.success) {
      setMaterials(result.materials);
      showToast("原材料已恢复启用");
    } else {
      showToast(result.message, "error");
    }
  }, [showToast]);

  const handleReactivateProduct = useCallback((id) => {
    const result = reactivateProduct(id);
    if (result.success) {
      setProducts(result.products);
      showToast("产品已恢复启用");
    } else {
      showToast(result.message, "error");
    }
  }, [showToast]);

  const handleExportBackup = useCallback(() => {
    const backupData = { materials, products, logs };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `serene-curie-backup-${new Date().toISOString().split("T")[0]}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("备份文件已导出");
  }, [materials, products, logs, showToast]);

  const handleImportBackup = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = restoreBackup(event.target.result);
      if (result.success) {
        setMaterials(result.materials);
        setProducts(result.products);
        setLogs(result.logs);
        showToast("备份已成功恢复");
      } else {
        showToast(result.message, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  }, [showToast]);

  return (
    <div className="app-container">
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
            {toast.type === "error" && <Icons.Warning />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <header className="app-header">
        <div className="brand-section">
          <Icons.Logo />
          <div className="brand-info">
            <h1>智能生产物料管理系统</h1>
            <p>SmartFactory Material Control Center</p>
          </div>
        </div>
        <div className="header-meta">
          <button
            type="button"
            className={`header-system-btn btn-pressable ${showSystemPanel ? "active" : ""}`}
            onClick={() => setShowSystemPanel(true)}
          >
            <Icons.System active={showSystemPanel} />
            <span>系统维护</span>
          </button>
        </div>
      </header>

      <nav className="nav-tabs">
        <button className={`tab-btn ${activeTab === "stock" ? "active" : ""}`} onClick={() => setActiveTab("stock")}><Icons.Stock active={activeTab === "stock"} /><span>库存看板</span></button>
        <button className={`tab-btn ${activeTab === "action" ? "active" : ""}`} onClick={() => setActiveTab("action")}><Icons.Action active={activeTab === "action"} /><span>快捷记账</span></button>
        <button className={`tab-btn ${activeTab === "config" ? "active" : ""}`} onClick={() => setActiveTab("config")}><Icons.Config active={activeTab === "config"} /><span>配置中心</span></button>
        <button className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`} onClick={() => setActiveTab("ledger")}><Icons.Ledger active={activeTab === "ledger"} /><span>历史流水</span></button>
      </nav>

      {showSystemPanel && (
        <div className="modal-overlay system-modal-overlay" onClick={() => setShowSystemPanel(false)}>
          <div className="system-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3><Icons.System /> 系统维护</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowSystemPanel(false)}>×</button>
            </div>
            <SystemSection
              handleImportBackup={handleImportBackup}
              handleExportBackup={handleExportBackup}
              handleOpenResetModal={handleOpenResetModal}
            />
          </div>
        </div>
      )}

      {activeTab === "stock" && (
        <StockSection
          materials={materials}
          products={products}
          materialHealthStats={materialHealthStats}
          materialConsumptionMap={materialConsumptionMap}
          productConsumptionStats={productConsumptionStats}
          stockStats={stockStats}
          statsTimeRange={statsTimeRange}
          setStatsTimeRange={setStatsTimeRange}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          getBatteryPercent={getBatteryPercent}
        />
      )}

      {activeTab === "action" && (
        <ActionSection
          materials={materials}
          products={products}
          showToast={showToast}
          setFormMix={setFormMix}
          setMixConsumptions={setMixConsumptions}
          setShowMixModal={setShowMixModal}
          setFormYield={setFormYield}
          setShowYieldModal={setShowYieldModal}
          setFormShipment={setFormShipment}
          setShowShipmentModal={setShowShipmentModal}
          setFormRestock={setFormRestock}
          setShowRestockModal={setShowRestockModal}
        />
      )}

      {activeTab === "config" && (
        <ConfigSection
          materials={materials}
          products={products}
          setShowAddMaterialModal={setShowAddMaterialModal}
          setShowAddProductModal={setShowAddProductModal}
          setFormEditMaterial={setFormEditMaterial}
          setShowEditMaterialModal={setShowEditMaterialModal}
          setFormEditProduct={setFormEditProduct}
          setShowEditProductModal={setShowEditProductModal}
          handleReactivateMaterial={handleReactivateMaterial}
          handleReactivateProduct={handleReactivateProduct}
          handleDeleteMaterial={handleDeleteMaterial}
          handleDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === "ledger" && (
        <LedgerSection
          logs={ledgerLogs}
          totalLogs={logs.length}
          handleUndo={handleUndo}
          ledgerTimeRange={ledgerTimeRange}
          setLedgerTimeRange={setLedgerTimeRange}
          ledgerStartDate={ledgerStartDate}
          setLedgerStartDate={setLedgerStartDate}
          ledgerEndDate={ledgerEndDate}
          setLedgerEndDate={setLedgerEndDate}
        />
      )}

      <AppModals
        materials={materials}
        products={products}
        showRestockModal={showRestockModal}
        setShowRestockModal={setShowRestockModal}
        formRestock={formRestock}
        setFormRestock={setFormRestock}
        handleRestockSubmit={handleRestockSubmit}
        showShipmentModal={showShipmentModal}
        setShowShipmentModal={setShowShipmentModal}
        formShipment={formShipment}
        setFormShipment={setFormShipment}
        handleShipmentSubmit={handleShipmentSubmit}
        showMixModal={showMixModal}
        setShowMixModal={setShowMixModal}
        formMix={formMix}
        setFormMix={setFormMix}
        mixConsumptions={mixConsumptions}
        setMixConsumptions={setMixConsumptions}
        handleMixSubmit={handleMixSubmit}
        handleReuseLastMixCons={handleReuseLastMixCons}
        handleConsKeyNavigation={handleConsKeyNavigation}
        showYieldModal={showYieldModal}
        setShowYieldModal={setShowYieldModal}
        formYield={formYield}
        setFormYield={setFormYield}
        handleYieldSubmit={handleYieldSubmit}
        showAddMaterialModal={showAddMaterialModal}
        setShowAddMaterialModal={setShowAddMaterialModal}
        formNewMaterial={formNewMaterial}
        setFormNewMaterial={setFormNewMaterial}
        handleAddMaterialSubmit={handleAddMaterialSubmit}
        showEditMaterialModal={showEditMaterialModal}
        setShowEditMaterialModal={setShowEditMaterialModal}
        formEditMaterial={formEditMaterial}
        setFormEditMaterial={setFormEditMaterial}
        handleEditMaterialSubmit={handleEditMaterialSubmit}
        showAddProductModal={showAddProductModal}
        setShowAddProductModal={setShowAddProductModal}
        formNewProduct={formNewProduct}
        setFormNewProduct={setFormNewProduct}
        handleAddProductSubmit={handleAddProductSubmit}
        showEditProductModal={showEditProductModal}
        setShowEditProductModal={setShowEditProductModal}
        formEditProduct={formEditProduct}
        setFormEditProduct={setFormEditProduct}
        handleEditProductSubmit={handleEditProductSubmit}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        showResetModal={showResetModal}
        setShowResetModal={setShowResetModal}
        resetCaptcha={resetCaptcha}
        resetCountdown={resetCountdown}
        resetInputCaptcha={resetInputCaptcha}
        setResetInputCaptcha={setResetInputCaptcha}
        handleSystemReset={handleSystemReset}
        showToast={showToast}
      />
    </div>
  );
}


