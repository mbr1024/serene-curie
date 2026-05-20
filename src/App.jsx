import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import {
  getStoredData,
  restockMaterial,
  shipProduct,
  registerProductionBatch,
  undoLog,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  reactivateMaterial,
  addProduct,
  updateProduct,
  deleteProduct,
  reactivateProduct,
  restoreBackup,
  resetSystemData
} from "./utils/db";

// ----------------------------------------------------
// 高清矢量 SVG 图标组件集合 (免除第三方打包依赖报错)
// ----------------------------------------------------
const Icons = {
  Logo: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cyan)" }}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Stock: ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: active ? "#000" : "inherit" }}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Action: ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: active ? "#000" : "inherit" }}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Ledger: ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: active ? "#000" : "inherit" }}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Config: ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: active ? "#000" : "inherit" }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Warning: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-danger)" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Factory: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20V9l4-2v13M10 20V5l4-2v17M18 20v-8l4-2v10M2 20h20" />
    </svg>
  ),
  Ship: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Plus: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Analytics: ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: active ? "#000" : "inherit" }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
};

export default function App() {
  // ----------------------------------------------------
  // 核心状态声明
  // ----------------------------------------------------
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("stock"); // "stock" | "action" | "ledger" | "config"
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [toasts, setToasts] = useState([]);
  
  // ----------------------------------------------------
  // 看板统计时间段相关状态
  // ----------------------------------------------------
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const getTodayString = () => getLocalDateString(new Date());
  const getDaysAgoString = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return getLocalDateString(d);
  };
  const [statsTimeRange, setStatsTimeRange] = useState("7"); // "7" | "15" | "30" | "custom"
  const [customStartDate, setCustomStartDate] = useState(() => getDaysAgoString(7));
  const [customEndDate, setCustomEndDate] = useState(() => getTodayString());

  // ----------------------------------------------------
  // 弹窗状态声明
  // ----------------------------------------------------
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    error: "",
    onConfirm: null
  });
  const [showArchivedKanban, setShowArchivedKanban] = useState(false);

  // ----------------------------------------------------
  // 重置功能专用状态与生成函数
  // ----------------------------------------------------
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(5);
  const [resetCaptcha, setResetCaptcha] = useState("");
  const [resetInputCaptcha, setResetInputCaptcha] = useState("");

  const generateRandomCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 剔除 O, I, 0, 1 防看错
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // ----------------------------------------------------
  // 表单状态声明
  // ----------------------------------------------------
  const [formRestock, setFormRestock] = useState({ materialId: "", qty: "", notes: "" });
  const [formShipment, setFormShipment] = useState({ productId: "", qty: "", notes: "" });
  const [formProduction, setFormProduction] = useState({ productId: "", qty: "", notes: "" });
  const [prodConsumptions, setProdConsumptions] = useState({}); // { [materialId]: qtyString }
  
  const [formNewMaterial, setFormNewMaterial] = useState({ name: "", unit: "kg", minStock: "", color: "cyan" });
  const [formEditMaterial, setFormEditMaterial] = useState({ id: "", name: "", unit: "kg", minStock: "", color: "cyan" });
  const [formNewProduct, setFormNewProduct] = useState({ name: "", unit: "双", minStock: "0" });
  const [formEditProduct, setFormEditProduct] = useState({ id: "", name: "", unit: "双", minStock: "0" });

  // ----------------------------------------------------
  // 生命周期与时钟挂载
  // ----------------------------------------------------
  useEffect(() => {
    // 加载本地数据
    const data = getStoredData();
    setMaterials(data.materials);
    setProducts(data.products);
    setLogs(data.logs);

    // 时钟定时器
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 重置倒计时定时器监听
  useEffect(() => {
    let timer = null;
    if (showResetModal && resetCountdown > 0) {
      timer = setInterval(() => {
        setResetCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showResetModal, resetCountdown]);

  // ----------------------------------------------------
  // 生产消耗数据统计 (📊 生产消耗看板专用)
  // ----------------------------------------------------
  
  // 辅助时间窗口计算边界日期
  const getDaysAgoDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(days));
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // timezone-safe 日期字符串解析函数
  const parseLocalDate = (dateStr, isStart) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isStart) {
      d.setHours(0, 0, 0, 0);
    } else {
      d.setHours(23, 59, 59, 999);
    }
    return d;
  };

  // 统一的日志时间区间过滤器
  const isLogInSelectedRange = useCallback((log) => {
    if (!log.date) return false;
    const logDate = new Date(log.date);
    if (statsTimeRange !== "custom") {
      return logDate >= getDaysAgoDate(statsTimeRange);
    } else {
      const startD = parseLocalDate(customStartDate, true);
      const endD = parseLocalDate(customEndDate, false);
      if (startD && logDate < startD) return false;
      if (endD && logDate > endD) return false;
      return true;
    }
  }, [statsTimeRange, customStartDate, customEndDate]);

  // 计算自定义区间实际物理天数 (做分摊用)
  const activePeriodDays = useMemo(() => {
    if (statsTimeRange !== "custom") {
      return parseInt(statsTimeRange) || 7;
    }
    const startD = parseLocalDate(customStartDate, true);
    const endD = parseLocalDate(customEndDate, false);
    if (startD && endD) {
      const diffTime = endD - startD;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 7;
  }, [statsTimeRange, customStartDate, customEndDate]);

  // 1. 各原料的累计消耗总量 (用于柱状图) - 过滤当前统计周期
  const materialConsumptionMap = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      if (log.type === "production" && isLogInSelectedRange(log)) {
        if (Array.isArray(log.consumptions)) {
          log.consumptions.forEach((c) => {
            if (c.name && c.qty) {
              map[c.name] = (map[c.name] || 0) + parseFloat(c.qty);
            }
          });
        }
      }
    });
    return map;
  }, [logs, isLogInSelectedRange]);

  // 2. 各产品的累计产量及原料消耗占比网格数据 - 过滤当前统计周期
  const productConsumptionStats = useMemo(() => {
    const stats = {}; // productName -> { totalQty: 0, consumptions: {} }
    logs.forEach((log) => {
      if (log.type === "production" && isLogInSelectedRange(log)) {
        const pName = log.itemName;
        if (!stats[pName]) {
          stats[pName] = { totalQty: 0, consumptions: {} };
        }
        stats[pName].totalQty += parseFloat(log.qty || 0);
        if (Array.isArray(log.consumptions)) {
          log.consumptions.forEach((c) => {
            if (c.name && c.qty) {
              stats[pName].consumptions[c.name] = (stats[pName].consumptions[c.name] || 0) + parseFloat(c.qty);
            }
          });
        }
      }
    });
    return stats;
  }, [logs, isLogInSelectedRange]);

  // 3. 当前周期原料的实际总消耗量 (用于安全天数估算)
  const activePeriodCons = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      if (log.type === "production" && Array.isArray(log.consumptions) && isLogInSelectedRange(log)) {
        log.consumptions.forEach((c) => {
          if (c.name && c.qty) {
            map[c.name] = (map[c.name] || 0) + parseFloat(c.qty);
          }
        });
      }
    });
    return map;
  }, [logs, isLogInSelectedRange]);

  // 4. 原料库存预估支撑天数与健康度指标 (基于选定周期日均消耗计算)
  const materialHealthStats = useMemo(() => {
    const days = activePeriodDays;
    return materials.map((m) => {
      const periodTotal = activePeriodCons[m.name] || 0;
      const dailyAvg = periodTotal / days;
      let daysRemaining = null;
      if (dailyAvg > 0) {
        daysRemaining = parseFloat((m.stock / dailyAvg).toFixed(1));
      }
      return {
        ...m,
        dailyAvg: parseFloat(dailyAvg.toFixed(2)),
        daysRemaining
      };
    });
  }, [materials, activePeriodCons, activePeriodDays]);

  // ----------------------------------------------------
  // 智能气泡通知服务
  // ----------------------------------------------------
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // ----------------------------------------------------
  // 表单提交处理函数 (封装本地 DB 操作与状态更新)
  // ----------------------------------------------------

  // 1. 原料补充提交
  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!formRestock.materialId || !formRestock.qty || parseFloat(formRestock.qty) <= 0) {
      showToast("请填写完整的补充数量", "error");
      return;
    }
    
    const res = restockMaterial(formRestock.materialId, formRestock.qty, "管理员", formRestock.notes);
    if (res.success) {
      setMaterials(res.materials);
      setLogs(res.logs);
      setShowRestockModal(false);
      setFormRestock({ materialId: "", qty: "", notes: "" });
      showToast("原料库存补给成功！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 2. 产品出货提交
  const handleShipmentSubmit = (e) => {
    e.preventDefault();
    if (!formShipment.productId || !formShipment.qty || parseFloat(formShipment.qty) <= 0) {
      showToast("请填写完整的出货数量", "error");
      return;
    }

    const res = shipProduct(formShipment.productId, formShipment.qty, "管理员", formShipment.notes);
    if (res.success) {
      setProducts(res.products);
      setLogs(res.logs);
      setShowShipmentModal(false);
      setFormShipment({ productId: "", qty: "", notes: "" });
      showToast("产品出货发单成功！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 3. 生产批次实际扣减提交 (核心)
  const handleProductionSubmit = (e) => {
    e.preventDefault();
    if (!formProduction.productId || !formProduction.qty || parseFloat(formProduction.qty) <= 0) {
      showToast("请填写正确的合格产出数量", "error");
      return;
    }

    // 格式化实际消耗格式
    const consumptionsArray = Object.keys(prodConsumptions).map((matId) => ({
      materialId: matId,
      qty: prodConsumptions[matId]
    }));

    // 校验至少输入了一项原料消耗，防止偷懒
    const hasCons = consumptionsArray.some((item) => item.qty && parseFloat(item.qty) > 0);
    if (!hasCons) {
      showToast("请至少填写一项实际原料消耗量！", "error");
      return;
    }

    const res = registerProductionBatch(
      formProduction.productId,
      formProduction.qty,
      consumptionsArray,
      "管理员",
      formProduction.notes
    );

    if (res.success) {
      setProducts(res.products);
      setMaterials(res.materials);
      setLogs(res.logs);
      setShowProductionModal(false);
      setFormProduction({ productId: "", qty: "", notes: "" });
      setProdConsumptions({});
      showToast("生产批次实际记账成功！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 3.1 沿用上一批次生产原料实际投料量 (确保高度机密，零配方库泄露)
  const handleReuseLastProductionCons = () => {
    const lastProdLog = logs.find((log) => log.type === "production");
    if (!lastProdLog) {
      showToast("未找到历史排产记账流水，请先手动进行第一次登记！", "error");
      return;
    }
    
    if (!lastProdLog.consumptions || lastProdLog.consumptions.length === 0) {
      showToast("上一批次生产记录中无原料消耗数据", "error");
      return;
    }

    const newConsumptions = {};
    lastProdLog.consumptions.forEach((c) => {
      // 动态根据原料名匹配 id
      const mat = materials.find((m) => m.name === c.name);
      if (mat) {
        newConsumptions[mat.id] = String(c.qty);
      }
    });

    setProdConsumptions(newConsumptions);
    showToast("已成功复制并沿用上一批次实际消耗投料！");
  };

  // 3.2 键盘快捷流网格输入导航 (Enter / Down / Up)
  const handleConsKeyNavigation = (e, index, totalCount) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % totalCount;
      const nextInput = document.querySelector(`[data-mat-index="${nextIndex}"]`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select(); // 自动全选方便直接覆盖输入
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + totalCount) % totalCount;
      const prevInput = document.querySelector(`[data-mat-index="${prevIndex}"]`);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
  };

  // ----------------------------------------------------
  // ⚙️ 严格的系统出厂重置处理器
  // ----------------------------------------------------
  const handleOpenResetModal = () => {
    const code = generateRandomCaptcha();
    setResetCaptcha(code);
    setResetInputCaptcha("");
    setResetCountdown(5); // 强制锁定 5 秒
    setShowResetModal(true);
  };

  const handleSystemReset = (e) => {
    e.preventDefault();
    if (resetCountdown > 0) {
      showToast("警告倒计时未结束，请仔细阅读警告说明！", "error");
      return;
    }
    if (resetInputCaptcha.trim().toUpperCase() !== resetCaptcha) {
      showToast("验证码输入错误，请重新核对！", "error");
      // 重新生成验证码防爆破
      setResetCaptcha(generateRandomCaptcha());
      setResetInputCaptcha("");
      return;
    }

    const res = resetSystemData();
    if (res.success) {
      setMaterials(res.materials);
      setProducts(res.products);
      setLogs(res.logs);
      setShowResetModal(false);
      showToast("系统数据已彻底重置为出厂状态！", "success");
    } else {
      showToast(res.message, "error");
    }
  };

  // 4. 撤销流水 (回滚数据)
  const handleUndo = (logId) => {
    setConfirmModal({
      show: true,
      title: "撤销历史记账",
      message: "确定撤销该批次记账吗？撤销后相关库存将自动双向原路返还，且该记录将被永久删除，此操作不可逆转。",
      error: "",
      onConfirm: () => {
        const res = undoLog(logId);
        if (res.success) {
          setMaterials(res.materials);
          setProducts(res.products);
          setLogs(res.logs);
          showToast("流水撤销成功，库存数据已完全回滚！");
          return { success: true };
        } else {
          showToast(res.message, "error");
          return { success: false, message: res.message };
        }
      }
    });
  };

  // 5. 新建原材料
  const handleAddMaterialSubmit = (e) => {
    e.preventDefault();
    if (!formNewMaterial.name || !formNewMaterial.minStock || parseFloat(formNewMaterial.minStock) < 0) {
      showToast("请填写正确的名称与预警水位", "error");
      return;
    }

    const colorPalette = ["cyan", "green", "orange", "gold"];
    const autoColor = colorPalette[materials.length % colorPalette.length];

    const res = addMaterial(
      formNewMaterial.name,
      formNewMaterial.unit,
      formNewMaterial.minStock,
      autoColor
    );

    if (res.success) {
      setMaterials(res.materials);
      setShowAddMaterialModal(false);
      setFormNewMaterial({ name: "", unit: "kg", minStock: "", color: "cyan" });
      showToast("新原材料添加成功！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 5.1 修改原材料类别
  const handleEditMaterialSubmit = (e) => {
    e.preventDefault();
    if (!formEditMaterial.name || !formEditMaterial.minStock || parseFloat(formEditMaterial.minStock) < 0) {
      showToast("请填写正确的名称与预警水位", "error");
      return;
    }

    const res = updateMaterial(
      formEditMaterial.id,
      formEditMaterial.name,
      formEditMaterial.unit,
      formEditMaterial.minStock,
      formEditMaterial.color
    );

    if (res.success) {
      setMaterials(res.materials);
      setLogs(res.logs);
      setShowEditMaterialModal(false);
      showToast("原材料类别修改成功！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 6. 新建产品
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!formNewProduct.name) {
      showToast("请填写产品名称", "error");
      return;
    }

    const res = addProduct(formNewProduct.name, formNewProduct.unit, "0");

    if (res.success) {
      setProducts(res.products);
      setShowAddProductModal(false);
      setFormNewProduct({ name: "", unit: "双", minStock: "0" });
      showToast("新产品添加成功！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 6.1 修改产品（大底款式）
  const handleEditProductSubmit = (e) => {
    e.preventDefault();
    if (!formEditProduct.name) {
      showToast("请填写大底款式名称", "error");
      return;
    }

    const res = updateProduct(
      formEditProduct.id,
      formEditProduct.name,
      formEditProduct.unit,
      formEditProduct.minStock || "0"
    );

    if (res.success) {
      setProducts(res.products);
      setLogs(res.logs);
      setShowEditProductModal(false);
      showToast("大底款式修改成功！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 7. 删除原材料
  const handleDeleteMaterial = (id) => {
    const material = materials.find(m => m.id === id);
    if (!material) return;

    // 级联拦截校验：扫描流水历史中是否引用了此原材料名称
    const isReferenced = logs?.some(log => {
      if (log?.type === "restock" && log?.itemName === material.name) return true;
      if (log?.type === "production" && log?.consumptions) {
        return log.consumptions.some(cons => cons?.name === material.name);
      }
      return false;
    });

    if (isReferenced) {
      setConfirmModal({
        show: true,
        title: "物料安全停用与归档",
        message: `“${material.name}” 存在关联的历史记账流水。为了保证历史账目的完整性与追溯，系统无法将其彻底抹去。

系统将为您执行“停用与安全归档”操作：
1. 历史记账流水完美保留，账目完整不受任何影响。
2. 该物料将从所有原料补货、生产登记等快捷表单中隐藏，防范误选。
3. 它将沉底展示在配置页面下方，您随时可以一键恢复启用。`,
        confirmText: "确认停用并归档",
        confirmBg: "var(--color-orange)",
        error: "",
        onConfirm: () => {
          const res = deleteMaterial(id);
          if (res.success) {
            setMaterials(res.materials);
            showToast("物料已成功停用并安全归档！");
            return { success: true };
          } else {
            showToast(res.message, "error");
            return { success: false, message: res.message };
          }
        }
      });
    } else {
      setConfirmModal({
        show: true,
        title: "彻底删除物料定义",
        message: `“${material.name}” 目前没有关联任何历史流水记录，确定将其彻底从系统物理删除吗？删除后该项将无法恢复。`,
        confirmText: "彻底删除物料",
        confirmBg: "var(--color-danger)",
        error: "",
        onConfirm: () => {
          const res = deleteMaterial(id);
          if (res.success) {
            setMaterials(res.materials);
            showToast("原材料定义已被物理删除");
            return { success: true };
          } else {
            showToast(res.message, "error");
            return { success: false, message: res.message };
          }
        }
      });
    }
  };

  // 8. 删除产品
  const handleDeleteProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // 级联拦截校验：扫描流水历史中是否引用了此产品名称
    const isReferenced = logs?.some(log => {
      if ((log?.type === "shipment" || log?.type === "production") && log?.itemName === product.name) return true;
      return false;
    });

    if (isReferenced) {
      setConfirmModal({
        show: true,
        title: "产品安全停用与归档",
        message: `“${product.name}” 存在关联的历史记账流水。为了保证历史账目的完整性与追溯，系统无法将其彻底抹去。

系统将为您执行“停用与安全归档”操作：
1. 历史记账流水完美保留，产品追溯不受任何影响。
2. 该产品将从产品出货、生产登记等快捷表单中隐藏，防范一线误选。
3. 它将沉底展示在配置页面下方，您随时可以一键恢复启用。`,
        confirmText: "确认停用并归档",
        confirmBg: "var(--color-orange)",
        error: "",
        onConfirm: () => {
          const res = deleteProduct(id);
          if (res.success) {
            setProducts(res.products);
            showToast("产品已成功停用并安全归档！");
            return { success: true };
          } else {
            showToast(res.message, "error");
            return { success: false, message: res.message };
          }
        }
      });
    } else {
      setConfirmModal({
        show: true,
        title: "彻底删除产品定义",
        message: `“${product.name}” 目前没有关联任何历史流水记录，确定将其彻底从系统物理删除吗？删除后该项将无法恢复。`,
        confirmText: "彻底删除产品",
        confirmBg: "var(--color-danger)",
        error: "",
        onConfirm: () => {
          const res = deleteProduct(id);
          if (res.success) {
            setProducts(res.products);
            showToast("产品定义已被物理删除");
            return { success: true };
          } else {
            showToast(res.message, "error");
            return { success: false, message: res.message };
          }
        }
      });
    }
  };

  // 8.1 重新激活/启用原材料
  const handleReactivateMaterial = (id) => {
    const res = reactivateMaterial(id);
    if (res.success) {
      setMaterials(res.materials);
      showToast("原材料已成功恢复为活跃状态！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 8.2 重新激活/启用产品
  const handleReactivateProduct = (id) => {
    const res = reactivateProduct(id);
    if (res.success) {
      setProducts(res.products);
      showToast("产品已成功恢复为活跃状态！");
    } else {
      showToast(res.message, "error");
    }
  };

  // 9. 一键备份数据 (导出为本地 JSON)
  const handleExportBackup = () => {
    const backupData = { materials, products, logs };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `智能物料库存备份_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("备份 JSON 导出成功！请妥善保管此文件。");
  };

  // 10. 一键还原备份 (导入 JSON)
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = restoreBackup(event.target.result);
      if (res.success) {
        setMaterials(res.materials);
        setProducts(res.products);
        setLogs(res.logs);
        showToast("备份数据成功恢复，页面已完美刷新！");
      } else {
        showToast(res.message, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // 重置 file input
  };

  // ----------------------------------------------------
  // 看板水位辅助计算器
  // ----------------------------------------------------
  const getBatteryPercent = (stock, minStock) => {
    if (minStock === 0) return 100;
    // 水平水位百分比，以安全水位线为基准进行比例缩放 (安全水位左右刚好是半满)
    const ratio = stock / (minStock * 2);
    return Math.min(100, Math.max(8, Math.round(ratio * 100)));
  };

  const getBatteryColor = (stock, minStock) => {
    if (stock <= minStock) return "red";
    return "normal";
  };

  return (
    <div className="app-container">
      {/* 🔔 弹出的悬浮通知容器 */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === "error" ? "toast-error" : "toast-success"}`}>
            {t.type === "error" && <Icons.Warning />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* 顶部主标题与时钟状态 */}
      <header className="app-header">
        <div className="brand-section">
          <Icons.Logo />
          <div className="brand-info">
            <h1>智能混炼大底生产管理系统</h1>
          </div>
        </div>
        
        <div className="header-meta">
          <div className="clock-panel">{time}</div>
          <div className="operator-badge" style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.1)" }}>
            <span>👤 系统管理员</span>
          </div>
        </div>
      </header>

      {/* 🚀 顶部极简快捷导航（iPad Tactile Tab） */}
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === "stock" ? "active" : ""}`}
          onClick={() => setActiveTab("stock")}
        >
          <Icons.Stock active={activeTab === "stock"} />
          生产大盘
        </button>
        <button
          className={`tab-btn ${activeTab === "action" ? "active" : ""}`}
          onClick={() => setActiveTab("action")}
        >
          <Icons.Action active={activeTab === "action"} />
          快捷登记记账
        </button>
        <button
          className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`}
          onClick={() => setActiveTab("ledger")}
        >
          <Icons.Ledger active={activeTab === "ledger"} />
          历史流水账本
        </button>
        <button
          className={`tab-btn ${activeTab === "config" ? "active" : ""}`}
          onClick={() => setActiveTab("config")}
        >
          <Icons.Config active={activeTab === "config"} />
          原料与大底配置
        </button>
      </nav>

      {/* ----------------------------------------------------
         板块 1: 实时余量大看板 (Live Stock View)
         ---------------------------------------------------- */}
      {activeTab === "stock" && (
        <div>
          {/* 原材料余量看板（含健康预估，合并展示） */}
          <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div className="section-title" style={{ marginBottom: 0 }}>📦 原材料实时余量</div>
            {materials.filter(m => !m.archived && m.stock <= m.minStock).length > 0 ? (
              <div className="warning-stat-badge">
                ⚠️ 当前有 <strong>{materials.filter(m => !m.archived && m.stock <= m.minStock).length}</strong> 款物料低于安全水位！
              </div>
            ) : (
              <div className="success-stat-badge">
                🛡️ 全体物料库存充足，安全运行中
              </div>
            )}
          </div>
          <div className="grid-stock">
            {materialHealthStats.filter(m => !m.archived || m.stock > 0).length === 0 ? (
              <div className="empty-placeholder">暂无活跃原材料，请先去 [物料配置] 添加</div>
            ) : (
              materialHealthStats.filter(m => !m.archived || m.stock > 0).map((m) => {
                const isLow = m.stock <= m.minStock;
                const isUrgent = (m.daysRemaining !== null && m.daysRemaining < 3) || isLow;
                const isNormal = !isUrgent && m.daysRemaining !== null && m.daysRemaining >= 3;
                const battPct = getBatteryPercent(m.stock, m.minStock);
                return (
                  <div key={m.id} className={`stock-card glow-${m.color} ${isUrgent && !m.archived ? "low-stock-alert" : ""} ${m.archived ? "archived-card" : ""}`}>
                    <div className="card-header-info">
                      <span className="card-title">
                        {m.name}
                        {m.archived && <span className="archive-tag">已停用</span>}
                      </span>
                      <span className={`card-badge ${m.archived ? "cyan" : isUrgent ? "red" : m.color}`}>
                        {m.archived ? "● 存余清仓" : isUrgent ? "⚠️ 低库存预警" : "● 正常运转"}
                      </span>
                    </div>

                    <div className="stock-value-wrapper">
                      <span className="stock-num">{m.stock}</span>
                      <span className="stock-unit">{m.unit}</span>
                    </div>

                    <div>
                      <div className="battery-slot">
                        <div
                          className={`battery-fill ${m.archived ? "cyan" : isUrgent ? "red" : m.color}`}
                          style={{ width: `${battPct}%` }}
                        />
                      </div>
                      <div className="card-footer-stock">
                        <span>预警水位: {m.minStock} {m.unit}</span>
                        <span className="stock-days-badge">
                          {m.daysRemaining !== null
                            ? `预计可用 ${m.daysRemaining} 天`
                            : "近期无消耗"}
                        </span>
                      </div>
                      {!m.archived && (
                        <div className="card-health-row">
                          <span className="health-sub-label">日均耗: {m.dailyAvg} {m.unit}/天</span>
                          <span className={`health-alert-inline ${isUrgent ? "red" : isNormal ? "green" : "muted"}`}>
                            {isUrgent
                              ? (isLow ? `🚨 低于安全水位` : `⚠️ 不足 3 天`)
                              : isNormal ? `🛡️ 储备充沛` : `💡 暂无消耗`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 产成品库存看板 */}
          <div className="section-title orange">👟 大底款式实时余量</div>
          <div className="grid-stock">
            {products.filter(p => !p.archived || p.stock > 0).length === 0 ? (
              <div className="empty-placeholder">暂无活跃大底，请先去 [原料与大底配置] 添加</div>
            ) : (
              products.filter(p => !p.archived || p.stock > 0).map((p) => {
                return (
                  <div key={p.id} className={`stock-card glow-gold ${p.archived ? "archived-card" : ""}`}>
                    <div className="card-header-info">
                      <span className="card-title">
                        {p.name}
                        {p.archived && <span className="archive-tag">已停用</span>}
                      </span>
                    </div>

                    <div className="stock-value-wrapper">
                      <span className="stock-num">{p.stock}</span>
                      <span className="stock-unit">{p.unit}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 📊 生产实际消耗与安全天数看板 */}
          <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginTop: "40px", marginBottom: "20px" }}>
            <div className="section-title" style={{ borderColor: "rgb(168, 85, 247)", marginBottom: 0 }}>
              📊 生产消耗统计与安全天数预估
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div className="range-selector-container">
                <button
                  type="button"
                  className={`range-selector-btn btn-pressable ${statsTimeRange === "7" ? "active" : ""}`}
                  onClick={() => setStatsTimeRange("7")}
                >
                  最近一周
                </button>
                <button
                  type="button"
                  className={`range-selector-btn btn-pressable ${statsTimeRange === "15" ? "active" : ""}`}
                  onClick={() => setStatsTimeRange("15")}
                >
                  最近半个月
                </button>
                <button
                  type="button"
                  className={`range-selector-btn btn-pressable ${statsTimeRange === "30" ? "active" : ""}`}
                  onClick={() => setStatsTimeRange("30")}
                >
                  最近一个月
                </button>
                <button
                  type="button"
                  className={`range-selector-btn btn-pressable ${statsTimeRange === "custom" ? "active" : ""}`}
                  onClick={() => setStatsTimeRange("custom")}
                >
                  自定义区间
                </button>
              </div>
              
              {statsTimeRange === "custom" && (
                <div className="custom-date-picker-wrapper">
                  <span className="custom-date-label">查询区间:</span>
                  <input
                    type="date"
                    className="custom-date-input"
                    value={customStartDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (customEndDate && val > customEndDate) {
                        showToast("开始日期不能晚于结束日期", "error");
                        return;
                      }
                      setCustomStartDate(val);
                    }}
                  />
                  <span className="custom-date-sep">至</span>
                  <input
                    type="date"
                    className="custom-date-input"
                    value={customEndDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (customStartDate && val < customStartDate) {
                        showToast("结束日期不能早于开始日期", "error");
                        return;
                      }
                      setCustomEndDate(val);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="analytics-container" style={{ marginTop: "16px" }}>
            {/* 顶部玻璃感 KPI 板 */}
            <div className="analytics-kpi-grid">
              <div className="kpi-card btn-pressable">
                <div className="kpi-header">
                  <span className="kpi-icon">🏭</span>
                  <span className="kpi-title">最近统计生产批次</span>
                </div>
                <div className="kpi-value">
                  {logs.filter(log => log.type === "production" && isLogInSelectedRange(log)).length} <span className="kpi-unit">次</span>
                </div>
                <div className="kpi-footer">当前周期：{statsTimeRange === "7" ? "最近一周" : statsTimeRange === "15" ? "最近半个月" : statsTimeRange === "30" ? "最近一个月" : `${customStartDate} 至 ${customEndDate}`}</div>
              </div>

              <div className="kpi-card btn-pressable">
                <div className="kpi-header">
                  <span className="kpi-icon">👟</span>
                  <span className="kpi-title">最近统计产出成品</span>
                </div>
                <div className="kpi-value">
                  {logs.filter(log => log.type === "production" && isLogInSelectedRange(log)).reduce((acc, log) => acc + parseFloat(log.qty || 0), 0)} <span className="kpi-unit">件</span>
                </div>
                <div className="kpi-footer">当前周期：{statsTimeRange === "7" ? "最近一周" : statsTimeRange === "15" ? "最近半个月" : statsTimeRange === "30" ? "最近一个月" : `${customStartDate} 至 ${customEndDate}`}</div>
              </div>

              <div className="kpi-card btn-pressable">
                <div className="kpi-header">
                  <span className="kpi-icon">📤</span>
                  <span className="kpi-title">最近统计出货总量</span>
                </div>
                <div className="kpi-value">
                  {logs.filter(log => log.type === "shipment" && isLogInSelectedRange(log)).reduce((acc, log) => acc + parseFloat(log.qty || 0), 0)} <span className="kpi-unit">件</span>
                </div>
                <div className="kpi-footer">基于选定周期的产品出库总量</div>
              </div>
            </div>

            <div className="analytics-main-grid analytics-single-col">
              {/* 产品投产消耗明细（全宽） */}
              <div className="analytics-chart-panel">
                <div className="panel-header">
                  <h3>🎯 各大底款式投产消耗明细</h3>
                  <span className="panel-sub">各大底款式产出量及关联原料消耗量与单双平均耗量</span>
                </div>
                <div className="ratio-list">
                  {Object.keys(productConsumptionStats).length === 0 ? (
                    <div className="empty-placeholder" style={{ padding: "40px" }}>暂无大底款式投产消耗流水</div>
                  ) : (
                    Object.keys(productConsumptionStats).map((prodName) => {
                      const stats = productConsumptionStats[prodName];
                      const matEntries = Object.keys(stats.consumptions);
                      return (
                        <div key={prodName} className="ratio-card">
                          <div className="ratio-card-header">
                            <h4>👟 {prodName}</h4>
                            <span className="total-produced">累计产出: <strong>{stats.totalQty}</strong> 件</span>
                          </div>
                          <div className="ratio-card-body">
                            <h5>物料消耗明细:</h5>
                            <div className="ratio-grid">
                              {matEntries.map((matName) => {
                                const consumedQty = stats.consumptions[matName];
                                const perUnit = stats.totalQty > 0 ? (consumedQty / stats.totalQty).toFixed(2) : "—";
                                const mat = materials.find(m => m.name === matName);
                                const unit = mat ? mat.unit : "";
                                return (
                                  <div key={matName} className="ratio-item">
                                    <div className="ratio-mat-name">{matName}</div>
                                    <div className="ratio-vals">
                                      <span>共 {consumedQty.toFixed(1)} {unit}</span>
                                      <span className="ratio-badge">{perUnit} {unit} / 件</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 原料消耗跨产品汇总（面板底部） */}
                {Object.keys(materialConsumptionMap).length > 0 && (
                  <div className="mat-total-summary">
                    <div className="mat-total-summary-header">
                      <span className="mat-total-title">📋 原料消耗汇总</span>
                      <span className="mat-total-sub">所有产品合计 · 选定周期内各原料实际消耗总量</span>
                    </div>
                    <div className="mat-total-grid">
                      {[...materials]
                        .filter(m => (materialConsumptionMap[m.name] || 0) > 0)
                        .sort((a, b) => (materialConsumptionMap[b.name] || 0) - (materialConsumptionMap[a.name] || 0))
                        .map(m => (
                          <div key={m.id} className="mat-total-item">
                            <span className="mat-total-name">{m.name}</span>
                            <span className="mat-total-qty">
                              <strong>{materialConsumptionMap[m.name].toFixed(1)}</strong>
                              <span className="mat-total-unit"> {m.unit}</span>
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      )}

      {/* ----------------------------------------------------
         板块 2: 快捷登记面板
         ---------------------------------------------------- */}
      {activeTab === "action" && (
        <div className="actions-container">
          <div className="actions-banner">
            <h2>车间生产快捷记账</h2>
            <p>物料出库、补充及生产实际数据快速录入，操作简便，自动分析物料损耗</p>
          </div>

          <div className="action-cards-grid">
            {/* 1. 生产登记 */}
            <div className="action-big-card action-production btn-pressable" onClick={() => {
              const activeProds = products.filter(p => !p.archived);
              const activeMats = materials.filter(m => !m.archived);
              if (activeProds.length === 0) {
                showToast("没有可用的活跃产品，请先到配置页启用或添加！", "error");
              } else if (activeMats.length === 0) {
                showToast("没有可用的活跃原材料，请先到配置页启用或添加！", "error");
              } else {
                setFormProduction({ productId: activeProds[0].id, qty: "", notes: "" });
                setShowProductionModal(true);
              }
            }}>
              <div className="action-icon">
                <Icons.Factory />
              </div>
              <span className="action-name">生产登记 (产出+消耗)</span>
              <span className="action-desc">
                记录今日某批次实际产出的合格品数量，并同时输入该批次实际消耗的所有原材料，损耗与不良率一键计入。
              </span>
            </div>

            {/* 2. 出货登记 */}
            <div className="action-big-card action-shipment btn-pressable" onClick={() => {
              const activeProds = products.filter(p => !p.archived);
              if (activeProds.length === 0) {
                showToast("没有可用的活跃大底款式，无法出货！", "error");
              } else {
                setFormShipment({ productId: activeProds[0].id, qty: "", notes: "" });
                setShowShipmentModal(true);
              }
            }}>
              <div className="action-icon">
                <Icons.Ship />
              </div>
              <span className="action-name">大底出货 (发单提货)</span>
              <span className="action-desc">
                当大底成品出厂发往客户时进行登记，扣减相应大底库存，包含拦截负库存超卖警报。
              </span>
            </div>

            {/* 3. 原料补货 */}
            <div className="action-big-card action-restock btn-pressable" onClick={() => {
              const activeMats = materials.filter(m => !m.archived);
              if (activeMats.length === 0) {
                showToast("没有可用的活跃原材料，请先到配置页启用或添加！", "error");
              } else {
                setFormRestock({ materialId: activeMats[0].id, qty: "", notes: "" });
                setShowRestockModal(true);
              }
            }}>
              <div className="action-icon">
                <Icons.Plus />
              </div>
              <span className="action-name">原料补货 (补充入库)</span>
              <span className="action-desc">
                天然橡胶、炭黑、化学促进剂等基础原料新采购入库时在此补给登记，快速增加原料物理库存水位。
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
         板块 3: 物料配置管理面板 (Materials & Products Config)
         ---------------------------------------------------- */}
      {activeTab === "config" && (
        <div className="config-layout">
          {/* 原材料配置列表 */}
          <div className="config-panel">
            <div className="config-header">
              <h3>📦 自定义原材料配置</h3>
              <button className="config-btn-add btn-pressable" onClick={() => setShowAddMaterialModal(true)}>
                ＋ 新增原料
              </button>
            </div>

            <div className="config-item-list">
              {[...materials].sort((a, b) => (a.archived ? 1 : 0) - (b.archived ? 1 : 0)).map((m) => (
                <div key={m.id} className={`config-card ${m.archived ? "archived" : ""}`}>
                  <div className="config-info">
                    <span className="config-color-indicator" style={{ color: `var(--color-${m.color})` }} />
                    <div className="config-text">
                      <h4>
                        {m.name}
                        {m.archived && <span className="archive-tag">已归档</span>}
                      </h4>
                      <p>
                        计量单位: {m.unit} | 警报水位: {m.minStock} {m.unit}
                      </p>
                    </div>
                  </div>
                  <div className="config-actions">
                    {m.archived ? (
                      <button
                        className="config-btn-action reactivate btn-pressable"
                        title="重新启用原料"
                        onClick={() => handleReactivateMaterial(m.id)}
                      >
                        🔄
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="config-btn-action edit btn-pressable"
                          title="修改原料"
                          style={{
                            background: "rgba(0, 242, 254, 0.15)",
                            border: "1px solid rgba(0, 242, 254, 0.3)",
                            color: "var(--color-cyan)"
                          }}
                          onClick={() => {
                            setFormEditMaterial({
                              id: m.id,
                              name: m.name,
                              unit: m.unit,
                              minStock: String(m.minStock),
                              color: m.color
                            });
                            setShowEditMaterialModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="config-btn-action btn-pressable"
                          title="删除原料"
                          onClick={() => handleDeleteMaterial(m.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 产品配置列表 */}
          <div className="config-panel">
            <div className="config-header">
              <h3>👟 自定义大底款式配置</h3>
              <button className="config-btn-add btn-pressable" onClick={() => setShowAddProductModal(true)}>
                ＋ 新增款式
              </button>
            </div>

            <div className="config-item-list">
              {[...products].sort((a, b) => (a.archived ? 1 : 0) - (b.archived ? 1 : 0)).map((p) => (
                <div key={p.id} className={`config-card ${p.archived ? "archived" : ""}`}>
                  <div className="config-info">
                    <span className="config-color-indicator" style={{ color: "var(--color-gold)" }} />
                    <div className="config-text">
                      <h4>
                        {p.name}
                        {p.archived && <span className="archive-tag">已归档</span>}
                      </h4>
                      <p>
                        计量单位: {p.unit}
                      </p>
                    </div>
                  </div>
                  <div className="config-actions">
                    {p.archived ? (
                      <button
                        className="config-btn-action reactivate btn-pressable"
                        title="重新启用产品"
                        onClick={() => handleReactivateProduct(p.id)}
                      >
                        🔄
                      </button>
                    ) : (
                      <>
                        <button
                          className="config-btn-action edit btn-pressable"
                          title="修改款式"
                          onClick={() => {
                            setFormEditProduct({
                              id: p.id,
                              name: p.name,
                              unit: p.unit,
                              minStock: String(p.minStock || 0)
                            });
                            setShowEditProductModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="config-btn-action btn-pressable"
                          title="删除产品"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ⚠️ 系统危险区 / 数据重置中心 */}
          <div className="danger-zone-panel" style={{
            gridColumn: "1 / -1",
            marginTop: "32px",
            background: "rgba(255, 46, 46, 0.02)",
            border: "1px dashed rgba(255, 46, 46, 0.2)",
            borderRadius: "24px",
            padding: "24px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 8px 32px rgba(255, 46, 46, 0.02)",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div className="danger-zone-info" style={{ flex: "1 1 500px" }}>
              <h3 style={{ color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>
                ⚠️ 系统危险数据重置
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", lineHeight: "1.6", margin: 0 }}>
                此重置操作将清空所有流水账目与自定义产品，并将库存清零，还原到干净的 10 种内置常用混炼大底原料。重置前需严格通过 5s 物理锁和 4 位随机验证码校验。
              </p>
            </div>
            <button
              type="button"
              className="btn-danger-press btn-pressable"
              style={{
                background: "rgba(255, 46, 46, 0.08)",
                border: "1px solid rgba(255, 46, 46, 0.25)",
                color: "var(--color-danger)",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 0 15px rgba(255, 46, 46, 0.05)"
              }}
              onClick={handleOpenResetModal}
            >
              🔄 重置系统出厂数据
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
         板块 4: 历史流水记账时间轴 (Ledger View)
         ---------------------------------------------------- */}
      {activeTab === "ledger" && (
        <div className="ledger-wrapper">
          <div className="config-header">
            <h3>📜 物料出库与出入库流水分步时间轴</h3>
            <div className="ledger-actions">
              {/* 一键恢复备份 */}
              <label className="ledger-btn-backup btn-pressable" style={{ display: "inline-flex", cursor: "pointer" }}>
                📥 导入备份 (.json)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  style={{ display: "none" }}
                />
              </label>

              {/* 一键备份 */}
              <button className="ledger-btn-backup btn-pressable" onClick={handleExportBackup}>
                📤 一键导出备份
              </button>
            </div>
          </div>

          <div className="ledger-list">
            {logs.length === 0 ? (
              <div className="empty-placeholder">暂无任何批次记账与补货流水</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="ledger-item">
                  <div className="ledger-main">
                    <div className={`ledger-icon-badge ${log.type}`}>
                      {log.type === "restock" && "📥"}
                      {log.type === "shipment" && "📤"}
                      {log.type === "production" && "🏭"}
                    </div>
                    <div className="ledger-body">
                      <h4>
                        {log.title}
                      </h4>
                      
                      {log.type === "restock" && (
                        <div className="ledger-summary">
                          采购补充原材料 <em>{log.itemName}</em> 共计 <strong>+{log.qty}</strong>
                        </div>
                      )}

                      {log.type === "shipment" && (
                        <div className="ledger-summary">
                          出货发运产品 <em>{log.itemName}</em> 共计 <strong>-{log.qty}</strong>
                        </div>
                      )}

                      {log.type === "production" && (
                        <div>
                          <div className="ledger-summary">
                            合格产出产品 <em>{log.itemName}</em> 共计 <strong>+{log.qty}</strong>
                          </div>
                          {log.consumptions && log.consumptions.length > 0 && (
                            <div className="ledger-consumptions">
                              <span>实际物料消耗: </span>
                              {log.consumptions.map((cons, index) => (
                                <span key={index} className="consumption-pill">
                                  {cons.name}: -{cons.qty}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {log.notes && <div className="ledger-notes">备注: {log.notes}</div>}
                    </div>
                  </div>

                  <div className="ledger-meta">
                    <span className="ledger-date">{log.date}</span>
                    <button className="ledger-btn-undo btn-pressable" onClick={() => handleUndo(log.id)}>
                      ↩ 撤销本批
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}



      {/* ====================================================
         弹出层: 1. 原材料补货弹窗
         ==================================================== */}
      {showRestockModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleRestockSubmit}>
            <div className="modal-header">
              <h3>📥 原材料补货登记</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowRestockModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-group">
                <label>选择补货原材料:</label>
                <select
                  className="modal-input"
                  value={formRestock.materialId}
                  onChange={(e) => setFormRestock({ ...formRestock, materialId: e.target.value })}
                >
                  {materials.filter(m => !m.archived).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (当前库存: {m.stock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-group">
                <label>实际补货数量:</label>
                <input
                  type="number"
                  step="0.01"
                  className="modal-input"
                  placeholder="请输入补充入库的数量"
                  value={formRestock.qty}
                  onChange={(e) => setFormRestock({ ...formRestock, qty: e.target.value })}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("请填写实际补货数量")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              <div className="modal-group">
                <label>补货备注 (选填):</label>
                <textarea
                  className="modal-input"
                  style={{ minHeight: "80px", resize: "none" }}
                  placeholder="如: 批次批号、供应商名称等"
                  value={formRestock.notes}
                  onChange={(e) => setFormRestock({ ...formRestock, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowRestockModal(false)}>
                取消
              </button>
              <button type="submit" className="modal-btn-submit">
                确认入库
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================
         弹出层: 2. 大底出货弹窗
         ==================================================== */}
      {showShipmentModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleShipmentSubmit}>
            <div className="modal-header">
              <h3>📤 大底出货登记</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowShipmentModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-group">
                <label>选择出货大底款式:</label>
                <select
                  className="modal-input"
                  value={formShipment.productId}
                  onChange={(e) => setFormShipment({ ...formShipment, productId: e.target.value })}
                >
                  {products.filter(p => !p.archived).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (当前库存: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-group">
                <label>出货发运数量:</label>
                <input
                  type="number"
                  step="0.01"
                  className="modal-input"
                  placeholder="请输入本次发货出库的产品数量"
                  value={formShipment.qty}
                  onChange={(e) => setFormShipment({ ...formShipment, qty: e.target.value })}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("请填写出货发运数量")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              <div className="modal-group">
                <label>出货去向备注 (选填):</label>
                <textarea
                  className="modal-input"
                  style={{ minHeight: "80px", resize: "none" }}
                  placeholder="如: 发运物流单号、收货商、目的地等"
                  value={formShipment.notes}
                  onChange={(e) => setFormShipment({ ...formShipment, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowShipmentModal(false)}>
                取消
              </button>
              <button type="submit" className="modal-btn-submit">
                确认出货
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================
         弹出层: 3. 核心生产登记双栏弹窗 (无配方，左栏产出，右栏实际消耗)
         ==================================================== */}
      {showProductionModal && (
        <div className="modal-overlay">
          <form className="modal-content wide" onSubmit={handleProductionSubmit}>
            <div className="modal-header">
              <h3>🏭 本批次生产合格品记账 (损耗天然记入)</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowProductionModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body production-double-column">
              {/* 左半边: 生产产品和数量 */}
              <div className="prod-left-column">
                <div className="modal-group">
                  <label>产出成品类别:</label>
                  <select
                    className="modal-input"
                    value={formProduction.productId}
                    onChange={(e) => setFormProduction({ ...formProduction, productId: e.target.value })}
                  >
                    {products.filter(p => !p.archived).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-group">
                  <label>实际合格产出数量:</label>
                  <input
                    type="number"
                    step="0.01"
                    className="modal-input"
                    placeholder="合格品的产出总量"
                    value={formProduction.qty}
                    onChange={(e) => setFormProduction({ ...formProduction, qty: e.target.value })}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("请填写实际合格产出数量")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                </div>

                <div className="modal-group" style={{ marginBottom: 0 }}>
                  <label>生产批次备注 (选填):</label>
                  <textarea
                    className="modal-input"
                    style={{ minHeight: "100px", resize: "none" }}
                    placeholder="如: 批次号、某生产线、领班签字、异常备忘等"
                    value={formProduction.notes}
                    onChange={(e) => setFormProduction({ ...formProduction, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* 右半边: 本次生产的实际物料消耗表单 */}
              <div className="prod-right-column">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-secondary)" }}>⚡ 本批次原料实际消耗量:</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: "rgba(0, 242, 254, 0.15)",
                        border: "1px solid rgba(0, 242, 254, 0.3)",
                        color: "var(--color-cyan)",
                        boxShadow: "0 0 8px rgba(0, 242, 254, 0.1)",
                        transition: "all 0.2s ease"
                      }}
                      onClick={handleReuseLastProductionCons}
                    >
                      📋 沿用上一批次
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "var(--text-secondary)",
                        transition: "all 0.2s ease"
                      }}
                      onClick={() => {
                        setProdConsumptions({});
                        showToast("已清空当前录入的消耗量");
                      }}
                    >
                      🗑️ 清空
                    </button>
                  </div>
                </div>

                <div className="consumptions-checklist" style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "6px" }}>
                  {(() => {
                    const activeMats = materials.filter(m => !m.archived);
                    if (activeMats.length === 0) {
                      return <div className="empty-placeholder" style={{ padding: "20px 0", fontSize: "12px" }}>请先前往配置添加原材料</div>;
                    }
                    return activeMats.map((m, index) => (
                      <div key={m.id} className="checklist-row">
                        <div className="checklist-label">
                          <span className="config-color-indicator" style={{ color: `var(--color-${m.color})` }} />
                          {m.name}
                        </div>
                        <div className="checklist-input-wrapper">
                          <input
                            type="number"
                            step="0.01"
                            className="checklist-input"
                            placeholder="0.00"
                            data-mat-index={index}
                            value={prodConsumptions[m.id] || ""}
                            onChange={(e) =>
                              setProdConsumptions({
                                ...prodConsumptions,
                                [m.id]: e.target.value
                              })
                            }
                            onKeyDown={(e) => handleConsKeyNavigation(e, index, activeMats.length)}
                          />
                          <span className="checklist-unit">{m.unit}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowProductionModal(false)}>
                取消
              </button>
              <button type="submit" className="modal-btn-submit">
                确认排产记账
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================
         弹出层: 4. 新增原材料定义弹窗
         ==================================================== */}
      {showAddMaterialModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleAddMaterialSubmit}>
            <div className="modal-header">
              <h3>＋ 新增原材料分类</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowAddMaterialModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-group">
                <label>原材料名称:</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="如: 顺丁橡胶 (BR)、促进剂 DM、防老剂等"
                  value={formNewMaterial.name}
                  onChange={(e) => setFormNewMaterial({ ...formNewMaterial, name: e.target.value })}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("请填写原材料名称")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              <div className="modal-group">
                <label>计量单位:</label>
                <select
                  className="modal-input"
                  value={formNewMaterial.unit}
                  onChange={(e) => setFormNewMaterial({ ...formNewMaterial, unit: e.target.value })}
                >
                  <option value="kg">公斤 (kg)</option>
                  <option value="只">只</option>
                  <option value="码">码</option>
                  <option value="片">片</option>
                  <option value="米">米</option>
                </select>
              </div>

              <div className="modal-group" style={{ marginBottom: 0 }}>
                <label>最低安全预警水位:</label>
                <input
                  type="number"
                  step="0.01"
                  className="modal-input"
                  placeholder="当库存低于此数值时，看板会亮起红色警报"
                  value={formNewMaterial.minStock}
                  onChange={(e) => setFormNewMaterial({ ...formNewMaterial, minStock: e.target.value })}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("请填写最低安全预警水位")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowAddMaterialModal(false)}>
                取消
              </button>
              <button type="submit" className="modal-btn-submit">
                确认创建
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================
         弹出层: 4.1 修改原材料定义弹窗
         ==================================================== */}
      {showEditMaterialModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleEditMaterialSubmit}>
            <div className="modal-header">
              <h3>✏️ 修改原材料分类</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowEditMaterialModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-group">
                <label>原材料名称:</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="如: 顺丁橡胶 (BR)、促进剂 DM、防老剂等"
                  value={formEditMaterial.name}
                  onChange={(e) => setFormEditMaterial({ ...formEditMaterial, name: e.target.value })}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("请填写原材料名称")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              <div className="modal-group">
                <label>计量单位:</label>
                <select
                  className="modal-input"
                  value={formEditMaterial.unit}
                  onChange={(e) => setFormEditMaterial({ ...formEditMaterial, unit: e.target.value })}
                >
                  <option value="kg">公斤 (kg)</option>
                  <option value="只">只</option>
                  <option value="码">码</option>
                  <option value="片">片</option>
                  <option value="米">米</option>
                </select>
              </div>

              <div className="modal-group" style={{ marginBottom: 0 }}>
                <label>最低安全预警水位:</label>
                <input
                  type="number"
                  step="0.01"
                  className="modal-input"
                  placeholder="当库存低于此数值时，看板会亮起红色警报"
                  value={formEditMaterial.minStock}
                  onChange={(e) => setFormEditMaterial({ ...formEditMaterial, minStock: e.target.value })}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("请填写最低安全预警水位")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowEditMaterialModal(false)}>
                取消
              </button>
              <button type="submit" className="modal-btn-submit">
                确认修改
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================
         弹出层: 5. 新增大底款式弹窗
         ==================================================== */}
      {showAddProductModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleAddProductSubmit}>
            <div className="modal-header">
              <h3>＋ 新增大底款式</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowAddProductModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-group">
                <label>大底款式名称:</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="如: 男装耐磨橡胶大底 42#、高弹性防滑大底 A 型等"
                  value={formNewProduct.name}
                  onChange={(e) => setFormNewProduct({ ...formNewProduct, name: e.target.value })}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("请填写款式名称")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              <div className="modal-group" style={{ marginBottom: 0 }}>
                <label>计量单位:</label>
                <select
                  className="modal-input"
                  value={formNewProduct.unit}
                  onChange={(e) => setFormNewProduct({ ...formNewProduct, unit: e.target.value })}
                >
                  <option value="双">双</option>
                  <option value="只">只</option>
                  <option value="片">片</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowAddProductModal(false)}>
                取消
              </button>
              <button type="submit" className="modal-btn-submit">
                确认创建
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================
         弹出层: 5.1 修改大底款式弹窗
         ==================================================== */}
      {showEditProductModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleEditProductSubmit}>
            <div className="modal-header">
              <h3>✏️ 修改大底款式</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowEditProductModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-group">
                <label>大底款式名称:</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="如: 男装耐磨橡胶大底 42#、高弹性防滑大底 A 型等"
                  value={formEditProduct.name}
                  onChange={(e) => setFormEditProduct({ ...formEditProduct, name: e.target.value })}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("请填写款式名称")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
              </div>

              <div className="modal-group" style={{ marginBottom: 0 }}>
                <label>计量单位:</label>
                <select
                  className="modal-input"
                  value={formEditProduct.unit}
                  onChange={(e) => setFormEditProduct({ ...formEditProduct, unit: e.target.value })}
                >
                  <option value="双">双</option>
                  <option value="只">只</option>
                  <option value="片">片</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowEditProductModal(false)}>
                取消
              </button>
              <button type="submit" className="modal-btn-submit">
                确认修改
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================
         弹出层: 6. 统一确认弹窗 (解决 Tauri window.confirm 静默失败问题)
         ==================================================== */}
      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                ⚠️ {confirmModal.title || "请确认操作"}
              </h3>
              <button
                type="button"
                className="modal-btn-close"
                onClick={() => setConfirmModal({ show: false, title: "", message: "", error: "", onConfirm: null })}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{ 
                fontSize: "14px", 
                lineHeight: "1.6", 
                color: "var(--text-secondary)",
                margin: 0
              }}>
                {confirmModal.message}
              </p>
              
              {confirmModal.error && (
                <div style={{
                  margin: "16px 0 0 0",
                  padding: "12px 16px",
                  background: "rgba(255, 75, 75, 0.1)",
                  border: "1px solid rgba(255, 75, 75, 0.25)",
                  borderRadius: "14px",
                  color: "var(--color-danger)",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  display: "flex",
                  alignItems: "start",
                  gap: "10px",
                  animation: "toast-enter 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                  <span>{confirmModal.error}</span>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ background: "rgba(0, 0, 0, 0.15)" }}>
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setConfirmModal({ show: false, title: "", message: "", error: "", onConfirm: null })}
              >
                {confirmModal.error ? "关闭" : "取消"}
              </button>
              {!confirmModal.error && (
                <button
                  type="button"
                  className="modal-btn-submit"
                  style={{ 
                    background: confirmModal.confirmBg || "var(--color-danger)", 
                    color: "#fff",
                    boxShadow: confirmModal.confirmBg ? `0 4px 16px ${confirmModal.confirmBg}33` : "0 4px 16px rgba(255, 46, 46, 0.2)"
                  }}
                  onClick={() => {
                    if (confirmModal.onConfirm) {
                      const res = confirmModal.onConfirm();
                      if (res && res.success === false) {
                        setConfirmModal(prev => ({ ...prev, error: res.message }));
                        return;
                      }
                    }
                    setConfirmModal({ show: false, title: "", message: "", error: "", onConfirm: null });
                  }}
                >
                  {confirmModal.confirmText || "确认执行"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
         弹出层: 7. 系统出厂重置极其严格的二次确认弹窗
         ==================================================== */}
      {showResetModal && (
        <div className="modal-overlay" style={{ background: "rgba(5, 6, 8, 0.92)", zIndex: 2000 }}>
          <form className="modal-content" style={{ maxWidth: "520px", border: "1px solid rgba(255, 46, 46, 0.3)", boxShadow: "0 20px 50px rgba(255, 46, 46, 0.15)" }} onSubmit={handleSystemReset}>
            <div className="modal-header" style={{ borderBottom: "1px solid rgba(255, 46, 46, 0.15)" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-danger)" }}>
                🚨 极其严重的重置警告！
              </h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowResetModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: "28px 32px" }}>
              <div style={{
                background: "rgba(255, 46, 46, 0.05)",
                border: "1px solid rgba(255, 46, 46, 0.15)",
                padding: "16px 20px",
                borderRadius: "16px",
                marginBottom: "24px"
              }}>
                <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "#ff8b8b", fontWeight: "600" }}>
                  此操作将彻底抹去本客户端所有已登记的生产账目、自定义大底产品款式定义以及所有物料库存数字，且此操作不可逆、无法物理恢复！
                </p>
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
                为了防范恶意清空或操作员无意识误触，系统需要您：
                <ol style={{ paddingLeft: "20px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>等待 <strong>5 秒钟</strong> 的警示倒计时，确认您知悉此操作的后果。</li>
                  <li>在下方正确输入 4 位防误触安全校验码。</li>
                </ol>
              </div>

              {/* 验证码展示与录入区 */}
              <div className="modal-group" style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>请输入安全验证码 (忽略大小写):</label>
                  <span style={{ fontSize: "15px", fontWeight: "800", background: "rgba(255, 255, 255, 0.08)", padding: "4px 12px", borderRadius: "8px", color: "var(--color-cyan)", letterSpacing: "3px", fontFamily: "monospace", textShadow: "0 0 10px rgba(0, 242, 254, 0.3)", border: "1px solid rgba(0, 242, 254, 0.2)" }}>
                    {resetCaptcha}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  className="modal-input"
                  placeholder="请输入上方验证码"
                  value={resetInputCaptcha}
                  onChange={(e) => setResetInputCaptcha(e.target.value)}
                  style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "4px", border: "1px solid rgba(0, 242, 254, 0.3)" }}
                  required
                />
              </div>
            </div>

            <div className="modal-footer" style={{ background: "rgba(255, 46, 46, 0.02)", borderTop: "1px solid rgba(255, 46, 46, 0.1)" }}>
              <button type="button" className="modal-btn-cancel" onClick={() => setShowResetModal(false)}>
                取消返回
              </button>
              <button
                type="submit"
                className="modal-btn-submit"
                disabled={resetCountdown > 0}
                style={{
                  background: resetCountdown > 0 ? "rgba(255, 255, 255, 0.05)" : "var(--color-danger)",
                  color: resetCountdown > 0 ? "var(--text-muted)" : "#fff",
                  cursor: resetCountdown > 0 ? "not-allowed" : "pointer",
                  boxShadow: resetCountdown > 0 ? "none" : "0 4px 20px rgba(255, 46, 46, 0.35)",
                  transition: "all 0.3s ease"
                }}
              >
                {resetCountdown > 0 ? `请仔细核对并确认... (${resetCountdown}s)` : "🔥 确认抹去数据并彻底重置"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
