/* ----------------------------------------------------
   本地 IndexedDB / LocalStorage 智能数据管理服务
   提供完整的物料、产品、流水的持久化增删改查及撤销逻辑
   ---------------------------------------------------- */

// 默认的高保真初始演示数据
const INITIAL_MATERIALS = [
  { id: "mat_nr", name: "天然橡胶 (NR)", stock: 0, unit: "kg", minStock: 150, color: "cyan", isBuiltIn: true },
  { id: "mat_sbr", name: "丁苯橡胶 (SBR)", stock: 0, unit: "kg", minStock: 100, color: "cyan", isBuiltIn: true },
  { id: "mat_br", name: "顺丁橡胶 (BR)", stock: 0, unit: "kg", minStock: 100, color: "cyan", isBuiltIn: true },
  { id: "mat_cb", name: "高活性炭黑 N330", stock: 0, unit: "kg", minStock: 80, color: "orange", isBuiltIn: true },
  { id: "mat_silica", name: "沉淀法白炭黑 (Silica)", stock: 0, unit: "kg", minStock: 100, color: "green", isBuiltIn: true },
  { id: "mat_cz", name: "促进剂 CZ (防焦型)", stock: 0, unit: "kg", minStock: 20, color: "gold", isBuiltIn: true },
  { id: "mat_dm", name: "促进剂 DM", stock: 0, unit: "kg", minStock: 20, color: "gold", isBuiltIn: true },
  { id: "mat_zno", name: "活性剂 氧化锌 (ZnO)", stock: 0, unit: "kg", minStock: 30, color: "green", isBuiltIn: true },
  { id: "mat_4010", name: "防老剂 4010NA", stock: 0, unit: "kg", minStock: 15, color: "green", isBuiltIn: true },
  { id: "mat_sulfur", name: "不溶性硫磺粉 (S-80)", stock: 0, unit: "kg", minStock: 15, color: "red", isBuiltIn: true }
];

const INITIAL_PRODUCTS = [];

const INITIAL_LOGS = [];

// 本地持久化存储的 Key
const KEYS = {
  MATERIALS: "smart_factory_materials_v3",
  PRODUCTS: "smart_factory_products_v3",
  LOGS: "smart_factory_logs_v3"
};

// 获取存储的数据
export const getStoredData = () => {
  let m = localStorage.getItem(KEYS.MATERIALS);
  let p = localStorage.getItem(KEYS.PRODUCTS);
  let l = localStorage.getItem(KEYS.LOGS);

  // 严格校验是否曾经初始化过 (必须三个 Key 都有写入记录，哪怕是空数组 "[]" 也算已初始化)
  if (m === null || p === null || l === null) {
    localStorage.setItem(KEYS.MATERIALS, JSON.stringify(INITIAL_MATERIALS));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    return {
      materials: INITIAL_MATERIALS,
      products: INITIAL_PRODUCTS,
      logs: INITIAL_LOGS
    };
  }

  return {
    materials: JSON.parse(m),
    products: JSON.parse(p),
    logs: JSON.parse(l)
  };
};

// 保存数据到本地
const saveData = (materials, products, logs) => {
  localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
};

// 浮点数保留两位小数的安全四舍五入算法，防止 JavaScript 浮点数累积误差 (如 0.1+0.2=0.30000000000000004)
const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * 1. 补充原材料库存
 */
export const restockMaterial = (materialId, qty, operator, notes) => {
  const { materials, products, logs } = getStoredData();
  const matIndex = materials.findIndex(item => item.id === materialId);
  
  if (matIndex === -1) return { success: false, message: "未找到该原材料" };
  
  const parsedQty = parseFloat(qty);
  materials[matIndex].stock = roundToTwo(materials[matIndex].stock + parsedQty);

  const newLog = {
    id: "log_" + Date.now(),
    type: "restock",
    date: new Date().toISOString().split("T")[0],
    title: "原料补货",
    itemName: materials[matIndex].name,
    qty: parsedQty,
    operator: operator || "系统",
    notes: notes || ""
  };

  logs.unshift(newLog); // 最新的流水排在最前面
  saveData(materials, products, logs);
  return { success: true, materials, products, logs };
};

export const batchRestockMaterials = (items, operator, notes) => {
  const { materials, products, logs } = getStoredData();

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, message: "请至少填写一种原材料的补货数量" };
  }

  const normalizedItems = items
    .map((item) => ({
      materialId: item.materialId,
      qty: parseFloat(item.qty)
    }))
    .filter((item) => item.materialId && !Number.isNaN(item.qty) && item.qty > 0);

  if (normalizedItems.length === 0) {
    return { success: false, message: "请至少填写一种原材料的补货数量" };
  }

  for (const item of normalizedItems) {
    const matIndex = materials.findIndex((material) => material.id === item.materialId);
    if (matIndex === -1) {
      return { success: false, message: "存在未找到的原材料，无法完成批量补货" };
    }
  }

  const timestamp = Date.now();
  normalizedItems.forEach((item, index) => {
    const matIndex = materials.findIndex((material) => material.id === item.materialId);
    materials[matIndex].stock = roundToTwo(materials[matIndex].stock + item.qty);

    logs.unshift({
      id: `log_${timestamp}_${index}_${item.materialId}`,
      type: "restock",
      date: new Date().toISOString().split("T")[0],
      title: "原料补货",
      itemName: materials[matIndex].name,
      qty: item.qty,
      operator: operator || "系统",
      notes: notes || ""
    });
  });

  saveData(materials, products, logs);
  return { success: true, materials, products, logs };
};

/**
 * 2. 产品出货发单
 */
export const shipProduct = (productId, qty, operator, notes) => {
  const { materials, products, logs } = getStoredData();
  const prodIndex = products.findIndex(item => item.id === productId);

  if (prodIndex === -1) return { success: false, message: "未找到该产品" };

  const parsedQty = parseFloat(qty);
  if (products[prodIndex].stock < parsedQty) {
    return { success: false, message: `产品库存不足，当前仅剩 ${products[prodIndex].stock} ${products[prodIndex].unit}` };
  }

  products[prodIndex].stock = roundToTwo(products[prodIndex].stock - parsedQty);

  const newLog = {
    id: "log_" + Date.now(),
    type: "shipment",
    date: new Date().toISOString().split("T")[0],
    title: "产品出货",
    itemName: products[prodIndex].name,
    qty: parsedQty,
    operator: operator || "系统",
    notes: notes || ""
  };

  logs.unshift(newLog);
  saveData(materials, products, logs);
  return { success: true, materials, products, logs };
};

/**
 * 3. 生产打料实际扣减记录 (只扣原料库)
 */
export const registerMixBatch = (materialConsumptions, operator, notes) => {
  const { materials, products, logs } = getStoredData();

  // 1. 校验原料库存是否充足
  for (const item of materialConsumptions) {
    if (item.qty && parseFloat(item.qty) > 0) {
      const matIndex = materials.findIndex(m => m.id === item.materialId);
      if (matIndex !== -1) {
        const consumedQty = parseFloat(item.qty);
        const currentStock = materials[matIndex].stock || 0;
        if (currentStock < consumedQty) {
          return {
            success: false,
            message: `原材料 [${materials[matIndex].name}] 库存不足！当前库存：${currentStock} 公斤，本次生产需消耗：${consumedQty} 公斤。请先录入原料入库！`
          };
        }
      }
    }
  }

  // 2. 扣除原材料库存，并拼装明细
  const consumptionDetails = [];
  for (const item of materialConsumptions) {
    if (item.qty && parseFloat(item.qty) > 0) {
      const matIndex = materials.findIndex(m => m.id === item.materialId);
      if (matIndex !== -1) {
        const consumedQty = parseFloat(item.qty);
        materials[matIndex].stock = roundToTwo(materials[matIndex].stock - consumedQty);
        consumptionDetails.push({
          name: materials[matIndex].name,
          qty: consumedQty
        });
      }
    }
  }

  // 3. 生成打料流水
  const newLog = {
    id: "log_" + Date.now(),
    type: "mix",
    date: new Date().toISOString().split("T")[0],
    title: "打料消耗",
    itemName: "生产原材料",
    consumptions: consumptionDetails,
    operator: operator || "系统",
    notes: notes || ""
  };

  logs.unshift(newLog);
  saveData(materials, products, logs);
  return { success: true, materials, products, logs };
};

/**
 * 3.5 完工产出记录 (只增成品库)
 */
export const registerYieldBatch = (productId, productQty, operator, notes) => {
  const { materials, products, logs } = getStoredData();

  const prodIndex = products.findIndex(item => item.id === productId);
  if (prodIndex === -1) return { success: false, message: "未找到该大底产品" };

  const parsedProdQty = parseFloat(productQty);
  products[prodIndex].stock = roundToTwo(products[prodIndex].stock + parsedProdQty);

  // 生成完工产出流水
  const newLog = {
    id: "log_" + Date.now(),
    type: "yield",
    date: new Date().toISOString().split("T")[0],
    title: "完工产出",
    itemName: products[prodIndex].name,
    qty: parsedProdQty,
    operator: operator || "系统",
    notes: notes || ""
  };

  logs.unshift(newLog);
  saveData(materials, products, logs);
  return { success: true, materials, products, logs };
};

/**
 * 4. 撤销历史记账流水（完美回滚数据）
 */
export const undoLog = (logId) => {
  const { materials, products, logs } = getStoredData();
  const logIndex = logs.findIndex(item => item.id === logId);

  if (logIndex === -1) return { success: false, message: "未找到该流水记录" };

  const log = logs[logIndex];

  // 分类回撤库存
  if (log.type === "restock") {
    // 补货撤销：扣减加进去的原料
    const matIndex = materials.findIndex(m => m.name === log.itemName);
    if (matIndex !== -1) {
      materials[matIndex].stock = roundToTwo(materials[matIndex].stock - log.qty);
    }
  } else if (log.type === "shipment") {
    // 出货撤销：补回扣掉的产品
    const prodIndex = products.findIndex(p => p.name === log.itemName);
    if (prodIndex !== -1) {
      products[prodIndex].stock = roundToTwo(products[prodIndex].stock + log.qty);
    }
  } else if (log.type === "mix") {
    // 打料撤销：将扣掉的原材料原路退回！
    if (log.consumptions && log.consumptions.length > 0) {
      for (const cons of log.consumptions) {
        const matIndex = materials.findIndex(m => m.name === cons.name);
        if (matIndex !== -1) {
          materials[matIndex].stock = roundToTwo(materials[matIndex].stock + cons.qty);
        }
      }
    }
  } else if (log.type === "yield") {
    // 产出完工撤销：将增加的成品扣除！
    const prodIndex = products.findIndex(p => p.name === log.itemName);
    if (prodIndex !== -1) {
      products[prodIndex].stock = roundToTwo(products[prodIndex].stock - log.qty);
    }
  } else if (log.type === "production") {
    // 兼容历史生产批次撤销：扣除加进去的产品，同时返还扣掉的原料！
    const prodIndex = products.findIndex(p => p.name === log.itemName);
    if (prodIndex !== -1) {
      products[prodIndex].stock = roundToTwo(products[prodIndex].stock - log.qty);
    }

    if (log.consumptions && log.consumptions.length > 0) {
      for (const cons of log.consumptions) {
        const matIndex = materials.findIndex(m => m.name === cons.name);
        if (matIndex !== -1) {
          materials[matIndex].stock = roundToTwo(materials[matIndex].stock + cons.qty);
        }
      }
    }
  }

  // 从日志列表中删除此记录
  logs.splice(logIndex, 1);
  saveData(materials, products, logs);
  return { success: true, materials, products, logs };
};

// ----------------------------------------------------
// 物料配置 CRUD (原材料 / 产成品)
// ----------------------------------------------------

export const addMaterial = (name, unit, minStock, color) => {
  const { materials, products, logs } = getStoredData();
  
  if (materials.some(item => item.name === name)) {
    return { success: false, message: "原材料名称已存在" };
  }

  const newMat = {
    id: "mat_" + Date.now(),
    name,
    stock: 0, // 初始库存为0
    unit,
    minStock: parseFloat(minStock) || 0,
    color: color || "cyan"
  };

  materials.push(newMat);
  saveData(materials, products, logs);
  return { success: true, materials, products, logs };
};

export const updateMaterial = (id, name, unit, minStock, color) => {
  try {
    const { materials, products, logs } = getStoredData();
    const matIndex = materials.findIndex(item => item.id === id);
    if (matIndex === -1) return { success: false, message: "未找到该原材料" };

    const oldName = materials[matIndex].name;
    
    // 检查是否与其他原料重名
    if (materials.some((item, idx) => idx !== matIndex && item.name === name)) {
      return { success: false, message: "原材料名称已存在" };
    }

    // 更新原材料属性
    materials[matIndex].name = name;
    materials[matIndex].unit = unit;
    materials[matIndex].minStock = parseFloat(minStock) || 0;
    if (color) materials[matIndex].color = color;

    // 级联更新日志里的名称，以保持流水历史一致性
    if (oldName !== name && logs && logs.length > 0) {
      logs.forEach(log => {
        if (log.type === "restock" && log.itemName === oldName) {
          log.itemName = name;
        }
        if (log.type === "production" && log.consumptions) {
          log.consumptions.forEach(cons => {
            if (cons.name === oldName) {
              cons.name = name;
            }
          });
        }
        if (log.type === "mix" && log.consumptions) {
          log.consumptions.forEach(cons => {
            if (cons.name === oldName) {
              cons.name = name;
            }
          });
        }
      });
    }

    saveData(materials, products, logs);
    return { success: true, materials, products, logs };
  } catch (error) {
    console.error("updateMaterial error:", error);
    return { success: false, message: "修改失败: " + error.message };
  }
};

export const deleteMaterial = (id) => {
  try {
    const { materials, products, logs } = getStoredData();
    const material = materials.find(item => item.id === id);
    if (!material) return { success: false, message: "未找到该原材料" };

    // 级联拦截校验：扫描流水历史中是否引用了此原材料名称 (采用防空指针可选链)
    const isReferenced = logs?.some(log => {
      if (log?.type === "restock" && log?.itemName === material.name) return true;
      if (log?.type === "production" && log?.consumptions) {
        return log.consumptions.some(cons => cons?.name === material.name);
      }
      if (log?.type === "mix" && log?.consumptions) {
        return log.consumptions.some(cons => cons?.name === material.name);
      }
      return false;
    });

    if (isReferenced) {
      // 存在关联流水，执行停用归档
      material.archived = true;
      saveData(materials, products, logs);
      return { success: true, isArchived: true, materials, products, logs };
    }

    // 无关联流水，执行物理删除
    const filtered = materials.filter(item => item.id !== id);
    saveData(filtered, products, logs);
    return { success: true, isArchived: false, materials: filtered, products, logs };
  } catch (error) {
    console.error("deleteMaterial error:", error);
    return { success: false, message: "删除失败: " + error.message };
  }
};

export const reactivateMaterial = (id) => {
  try {
    const { materials, products, logs } = getStoredData();
    const material = materials.find(item => item.id === id);
    if (!material) return { success: false, message: "未找到该原材料" };

    material.archived = false; // 重新启用
    saveData(materials, products, logs);
    return { success: true, materials, products, logs };
  } catch (error) {
    console.error("reactivateMaterial error:", error);
    return { success: false, message: "激活失败: " + error.message };
  }
};

export const addProduct = (name, unit, minStock) => {
  const { materials, products, logs } = getStoredData();

  if (products.some(item => item.name === name)) {
    return { success: false, message: "产品名称已存在" };
  }

  const newProd = {
    id: "prod_" + Date.now(),
    name,
    stock: 0, // 初始库存为0
    unit,
    minStock: parseFloat(minStock) || 0
  };

  products.push(newProd);
  saveData(materials, products, logs);
  return { success: true, materials, products, logs };
};

export const updateProduct = (id, name, unit, minStock) => {
  try {
    const { materials, products, logs } = getStoredData();
    const prodIndex = products.findIndex(item => item.id === id);
    if (prodIndex === -1) return { success: false, message: "未找到该大底款式" };

    const oldName = products[prodIndex].name;

    // 检查是否与其他款式重名
    if (products.some((item, idx) => idx !== prodIndex && item.name === name)) {
      return { success: false, message: "大底款式名称已存在" };
    }

    // 更新大底属性
    products[prodIndex].name = name;
    products[prodIndex].unit = unit;
    products[prodIndex].minStock = parseFloat(minStock) || 0;

    // 级联更新日志里的产品名，以保持流水历史一致性
    if (oldName !== name && logs && logs.length > 0) {
      logs.forEach(log => {
        if ((log.type === "shipment" || log.type === "production" || log.type === "yield") && log.itemName === oldName) {
          log.itemName = name;
        }
      });
    }

    saveData(materials, products, logs);
    return { success: true, materials, products, logs };
  } catch (error) {
    console.error("updateProduct error:", error);
    return { success: false, message: "修改失败: " + error.message };
  }
};

export const deleteProduct = (id) => {
  try {
    const { materials, products, logs } = getStoredData();
    const product = products.find(item => item.id === id);
    if (!product) return { success: false, message: "未找到该产品" };

    // 级联拦截校验：扫描流水历史中是否引用了此产成品名称 (采用防空指针可选链)
    const isReferenced = logs?.some(log => {
      if ((log?.type === "shipment" || log?.type === "production" || log?.type === "yield") && log?.itemName === product.name) return true;
      return false;
    });

    if (isReferenced) {
      // 存在关联流水，执行停用归档
      product.archived = true;
      saveData(materials, products, logs);
      return { success: true, isArchived: true, materials, products, logs };
    }

    // 无关联流水，执行物理删除
    const filtered = products.filter(item => item.id !== id);
    saveData(materials, filtered, logs);
    return { success: true, isArchived: false, materials, products: filtered, logs };
  } catch (error) {
    console.error("deleteProduct error:", error);
    return { success: false, message: "删除失败: " + error.message };
  }
};

export const reactivateProduct = (id) => {
  try {
    const { materials, products, logs } = getStoredData();
    const product = products.find(item => item.id === id);
    if (!product) return { success: false, message: "未找到该产品" };

    product.archived = false; // 重新启用
    saveData(materials, products, logs);
    return { success: true, materials, products, logs };
  } catch (error) {
    console.error("reactivateProduct error:", error);
    return { success: false, message: "激活失败: " + error.message };
  }
};

// 备份一键恢复
export const restoreBackup = (backupJsonStr) => {
  try {
    const data = JSON.parse(backupJsonStr);
    if (!data.materials || !data.products || !data.logs) {
      return { success: false, message: "备份格式错误，缺少必要字段" };
    }
    saveData(data.materials, data.products, data.logs);
    return { success: true, ...data };
  } catch {
    return { success: false, message: "无法解析备份数据，请检查文件" };
  }
};

// 客户端重置数据，清空全部数据但保留并恢复出厂内置的 10 种原料类别定义 (库存归零)
export const resetSystemData = () => {
  try {
    const resetMaterials = INITIAL_MATERIALS.map(m => ({
      ...m,
      stock: 0
    }));
    const resetProducts = [];
    const resetLogs = [];

    saveData(resetMaterials, resetProducts, resetLogs);
    return { success: true, materials: resetMaterials, products: resetProducts, logs: resetLogs };
  } catch (error) {
    console.error("resetSystemData error:", error);
    return { success: false, message: "重置失败: " + error.message };
  }
};
