
import Icons from "../components/Icons";

const UNIT_OPTIONS = ["kg", "双", "卷", "桶", "米"];

function activeMaterials(materials) {
  return materials.filter((item) => !item.archived);
}

function activeProducts(products) {
  return products.filter((item) => !item.archived);
}

export default function AppModals(props) {
  const {
    materials,
    products,
    showRestockModal,
    setShowRestockModal,
    formRestock,
    setFormRestock,
    handleRestockSubmit,
    showShipmentModal,
    setShowShipmentModal,
    formShipment,
    setFormShipment,
    handleShipmentSubmit,
    showMixModal,
    setShowMixModal,
    formMix,
    setFormMix,
    mixConsumptions,
    setMixConsumptions,
    handleMixSubmit,
    handleReuseLastMixCons,
    handleConsKeyNavigation,
    showYieldModal,
    setShowYieldModal,
    formYield,
    setFormYield,
    handleYieldSubmit,
    showAddMaterialModal,
    setShowAddMaterialModal,
    formNewMaterial,
    setFormNewMaterial,
    handleAddMaterialSubmit,
    showEditMaterialModal,
    setShowEditMaterialModal,
    formEditMaterial,
    setFormEditMaterial,
    handleEditMaterialSubmit,
    showAddProductModal,
    setShowAddProductModal,
    formNewProduct,
    setFormNewProduct,
    handleAddProductSubmit,
    showEditProductModal,
    setShowEditProductModal,
    formEditProduct,
    setFormEditProduct,
    handleEditProductSubmit,
    confirmModal,
    setConfirmModal,
    showResetModal,
    setShowResetModal,
    resetCaptcha,
    resetCountdown,
    resetInputCaptcha,
    setResetInputCaptcha,
    handleSystemReset,
    showToast
  } = props;

  const openMaterials = activeMaterials(materials);
  const openProducts = activeProducts(products);

  return (
    <>
      {showRestockModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleRestockSubmit}>
            <div className="modal-header">
              <h3>+ 原料补货入库</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowRestockModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-group">
                <label>本次可同时录入多个原料数量</label>
                <div style={{ display: "grid", gap: "10px" }}>
                  {openMaterials.map((item) => {
                    const current = formRestock.items.find((entry) => entry.materialId === item.id) || { materialId: item.id, qty: "" };
                    return (
                      <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: "10px", alignItems: "center" }}>
                        <div className="modal-input" style={{ display: "flex", alignItems: "center" }}>{item.name}</div>
                        <input
                          type="number"
                          step="0.01"
                          className="modal-input"
                          placeholder={`数量 (${item.unit})`}
                          value={current.qty}
                          onChange={(e) => {
                            const nextItems = [...formRestock.items];
                            const targetIndex = nextItems.findIndex((entry) => entry.materialId === item.id);
                            if (targetIndex >= 0) nextItems[targetIndex] = { ...nextItems[targetIndex], qty: e.target.value };
                            else nextItems.push({ materialId: item.id, qty: e.target.value });
                            setFormRestock({ ...formRestock, items: nextItems });
                          }}
                        />
                        <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{item.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-group" style={{ marginBottom: 0 }}>
                <label>备注</label>
                <textarea className="modal-input" style={{ minHeight: "84px", resize: "none" }} value={formRestock.notes} onChange={(e) => setFormRestock({ ...formRestock, notes: e.target.value })} placeholder="可填写采购批次、供应商或说明" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowRestockModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit">确认补货</button>
            </div>
          </form>
        </div>
      )}

      {showShipmentModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleShipmentSubmit}>
            <div className="modal-header">
              <h3><Icons.SmallShip /> 成品出货登记</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowShipmentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-group">
                <label>选择产品</label>
                <select className="modal-input" value={formShipment.productId} onChange={(e) => setFormShipment({ ...formShipment, productId: e.target.value })}>
                  {openProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div className="modal-group">
                <label>出货数量</label>
                <input type="number" step="0.01" className="modal-input" value={formShipment.qty} onChange={(e) => setFormShipment({ ...formShipment, qty: e.target.value })} placeholder="请输入出货数量" required />
              </div>
              <div className="modal-group" style={{ marginBottom: 0 }}>
                <label>备注</label>
                <textarea className="modal-input" style={{ minHeight: "84px", resize: "none" }} value={formShipment.notes} onChange={(e) => setFormShipment({ ...formShipment, notes: e.target.value })} placeholder="可填写客户、单号或说明" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowShipmentModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit">确认出货</button>
            </div>
          </form>
        </div>
      )}

      {showMixModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleMixSubmit}>
            <div className="modal-header">
              <h3><Icons.SmallMix /> 打料消耗登记</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowMixModal(false)}>×</button>
            </div>
            <div className="modal-body mix-modal-body">
              <div className="modal-group">
                <div className="mix-modal-toolbar">
                  <label>录入本批次各原料实际消耗</label>
                  <div className="mix-modal-tools">
                    <button type="button" className="mix-tool-btn btn-pressable" onClick={handleReuseLastMixCons}>沿用上一批</button>
                    <button type="button" className="mix-tool-btn btn-pressable" onClick={() => {
                      setMixConsumptions({});
                      showToast("已清空当前消耗录入");
                    }}>清空</button>
                  </div>
                </div>
                <div className="consumptions-checklist mix-consumptions-list">
                  {openMaterials.map((item, index) => (
                    <div key={item.id} className="checklist-row mix-consumption-row">
                      <div className="checklist-label">{item.name}</div>
                      <div className="checklist-input-wrapper">
                      <input
                        type="number"
                        step="0.01"
                        className="checklist-input"
                        placeholder="0"
                        data-mat-index={index}
                        value={mixConsumptions[item.id] || ""}
                        onChange={(e) => setMixConsumptions({ ...mixConsumptions, [item.id]: e.target.value })}
                        onKeyDown={(e) => handleConsKeyNavigation(e, index, openMaterials.length)}
                      />
                        <span className="checklist-unit">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-group" style={{ marginBottom: 0 }}>
                <label>备注</label>
                <textarea className="modal-input" style={{ minHeight: "84px", resize: "none" }} value={formMix.notes} onChange={(e) => setFormMix({ ...formMix, notes: e.target.value })} placeholder="可填写机台、班次或批次说明" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowMixModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit">确认记账</button>
            </div>
          </form>
        </div>
      )}

      {showYieldModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleYieldSubmit}>
            <div className="modal-header">
              <h3><Icons.SmallFactory /> 完工报产</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowYieldModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-group">
                <label>选择产品</label>
                <select className="modal-input" value={formYield.productId} onChange={(e) => setFormYield({ ...formYield, productId: e.target.value })}>
                  {openProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div className="modal-group">
                <label>完工数量</label>
                <input type="number" step="0.01" className="modal-input" value={formYield.qty} onChange={(e) => setFormYield({ ...formYield, qty: e.target.value })} placeholder="请输入完工数量" required />
              </div>
              <div className="modal-group" style={{ marginBottom: 0 }}>
                <label>备注</label>
                <textarea className="modal-input" style={{ minHeight: "84px", resize: "none" }} value={formYield.notes} onChange={(e) => setFormYield({ ...formYield, notes: e.target.value })} placeholder="可填写班组、设备或说明" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowYieldModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit">确认报产</button>
            </div>
          </form>
        </div>
      )}

      {showAddMaterialModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleAddMaterialSubmit}>
            <div className="modal-header">
              <h3><Icons.Add /> 新增原材料</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowAddMaterialModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-group">
                <label>名称</label>
                <input type="text" className="modal-input" value={formNewMaterial.name} onChange={(e) => setFormNewMaterial({ ...formNewMaterial, name: e.target.value })} required />
              </div>
              <div className="modal-group">
                <label>单位</label>
                <select className="modal-input" value={formNewMaterial.unit} onChange={(e) => setFormNewMaterial({ ...formNewMaterial, unit: e.target.value })}>
                  {UNIT_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="modal-group">
                <label>预警水位</label>
                <input type="number" step="0.01" className="modal-input" value={formNewMaterial.minStock} onChange={(e) => setFormNewMaterial({ ...formNewMaterial, minStock: e.target.value })} required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowAddMaterialModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit">确认新增</button>
            </div>
          </form>
        </div>
      )}

      {showEditMaterialModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleEditMaterialSubmit}>
            <div className="modal-header">
              <h3><Icons.Edit /> 编辑原材料</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowEditMaterialModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-group">
                <label>名称</label>
                <input type="text" className="modal-input" value={formEditMaterial.name} onChange={(e) => setFormEditMaterial({ ...formEditMaterial, name: e.target.value })} required />
              </div>
              <div className="modal-group">
                <label>单位</label>
                <select className="modal-input" value={formEditMaterial.unit} onChange={(e) => setFormEditMaterial({ ...formEditMaterial, unit: e.target.value })}>
                  {UNIT_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="modal-group">
                <label>预警水位</label>
                <input type="number" step="0.01" className="modal-input" value={formEditMaterial.minStock} onChange={(e) => setFormEditMaterial({ ...formEditMaterial, minStock: e.target.value })} required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowEditMaterialModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit">确认保存</button>
            </div>
          </form>
        </div>
      )}

      {showAddProductModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleAddProductSubmit}>
            <div className="modal-header">
              <h3><Icons.Add /> 新增产品</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowAddProductModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-group">
                <label>名称</label>
                <input type="text" className="modal-input" value={formNewProduct.name} onChange={(e) => setFormNewProduct({ ...formNewProduct, name: e.target.value })} required />
              </div>
              <div className="modal-group">
                <label>单位</label>
                <select className="modal-input" value={formNewProduct.unit} onChange={(e) => setFormNewProduct({ ...formNewProduct, unit: e.target.value })}>
                  <option value="双">双</option>
                  <option value="件">件</option>
                  <option value="箱">箱</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowAddProductModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit">确认新增</button>
            </div>
          </form>
        </div>
      )}

      {showEditProductModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleEditProductSubmit}>
            <div className="modal-header">
              <h3><Icons.Edit /> 编辑产品</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowEditProductModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-group">
                <label>名称</label>
                <input type="text" className="modal-input" value={formEditProduct.name} onChange={(e) => setFormEditProduct({ ...formEditProduct, name: e.target.value })} required />
              </div>
              <div className="modal-group">
                <label>单位</label>
                <select className="modal-input" value={formEditProduct.unit} onChange={(e) => setFormEditProduct({ ...formEditProduct, unit: e.target.value })}>
                  <option value="双">双</option>
                  <option value="件">件</option>
                  <option value="箱">箱</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setShowEditProductModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit">确认保存</button>
            </div>
          </form>
        </div>
      )}

      {confirmModal.show && (
        <div className="modal-overlay" style={{ zIndex: 1800 }}>
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div className="modal-header">
              <h3><Icons.Warning /> {confirmModal.title || "请确认操作"}</h3>
              <button type="button" className="modal-btn-close" onClick={() => setConfirmModal({ show: false, title: "", message: "", error: "", onConfirm: null })}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--text-secondary)" }}>{confirmModal.message}</div>
              {confirmModal.error && <div className="warning-stat-badge" style={{ marginTop: "16px" }}>{confirmModal.error}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={() => setConfirmModal({ show: false, title: "", message: "", error: "", onConfirm: null })}>{confirmModal.error ? "关闭" : "取消"}</button>
              {!confirmModal.error && (
                <button
                  type="button"
                  className="modal-btn-submit"
                  style={{ background: confirmModal.confirmBg || "var(--color-danger)" }}
                  onClick={() => {
                    if (!confirmModal.onConfirm) return;
                    const result = confirmModal.onConfirm();
                    if (result?.success) {
                      setConfirmModal({ show: false, title: "", message: "", error: "", onConfirm: null });
                    } else if (result?.message) {
                      setConfirmModal((prev) => ({ ...prev, error: result.message }));
                    }
                  }}
                >
                  {confirmModal.confirmText || "确认执行"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="modal-overlay" style={{ background: "rgba(5, 6, 8, 0.92)", zIndex: 2000 }}>
          <form className="modal-content" style={{ maxWidth: "520px", border: "1px solid rgba(255, 46, 46, 0.3)", boxShadow: "0 20px 50px rgba(255, 46, 46, 0.15)" }} onSubmit={handleSystemReset}>
            <div className="modal-header" style={{ borderBottom: "1px solid rgba(255, 46, 46, 0.15)" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-danger)" }}><Icons.ShieldAlert /> 高风险重置警告</h3>
              <button type="button" className="modal-btn-close" onClick={() => setShowResetModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: "28px 32px" }}>
              <div style={{ background: "rgba(255, 46, 46, 0.05)", border: "1px solid rgba(255, 46, 46, 0.15)", padding: "16px 20px", borderRadius: "16px", marginBottom: "24px" }}>
                <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "#ff8b8b", fontWeight: 600 }}>
                  此操作会清空当前所有物料、产品和流水记录，并恢复到初始状态。操作不可撤销，请谨慎确认。
                </p>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
                为避免误操作，请先等待倒计时结束，再输入验证码完成确认。
              </div>
              <div className="modal-group" style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>请输入验证码</label>
                  <span style={{ fontSize: "15px", fontWeight: 800, background: "rgba(255, 255, 255, 0.08)", padding: "4px 12px", borderRadius: "8px", color: "var(--color-cyan)", letterSpacing: "3px", fontFamily: "monospace", border: "1px solid rgba(0, 242, 254, 0.2)" }}>{resetCaptcha}</span>
                </div>
                <input type="text" maxLength={4} className="modal-input" placeholder="输入上方验证码" value={resetInputCaptcha} onChange={(e) => setResetInputCaptcha(e.target.value)} style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "4px" }} required />
              </div>
            </div>
            <div className="modal-footer" style={{ background: "rgba(255, 46, 46, 0.02)", borderTop: "1px solid rgba(255, 46, 46, 0.1)" }}>
              <button type="button" className="modal-btn-cancel" onClick={() => setShowResetModal(false)}>取消</button>
              <button type="submit" className="modal-btn-submit" disabled={resetCountdown > 0} style={{ background: resetCountdown > 0 ? "rgba(255, 255, 255, 0.05)" : "var(--color-danger)", color: resetCountdown > 0 ? "var(--text-muted)" : "#fff" }}>
                {resetCountdown > 0 ? `请等待 ${resetCountdown}s` : "确认重置系统"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

