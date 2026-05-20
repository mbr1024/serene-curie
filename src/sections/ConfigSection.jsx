
import Icons from "../components/Icons";
import { getPaletteColor } from "../utils/palette";

function formatNumber(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

export default function ConfigSection({
  materials,
  products,
  setShowAddMaterialModal,
  setShowAddProductModal,
  setFormEditMaterial,
  setShowEditMaterialModal,
  setFormEditProduct,
  setShowEditProductModal,
  handleReactivateMaterial,
  handleReactivateProduct,
  handleDeleteMaterial,
  handleDeleteProduct
}) {
  return (
    <div className="config-layout">
      <div className="config-panel">
        <div className="config-header">
          <h3>原材料配置</h3>
          <button className="config-btn-add btn-pressable" onClick={() => setShowAddMaterialModal(true)}><Icons.Add />新增原材料</button>
        </div>
        <div className="config-item-list">
          {[...materials].sort((a, b) => (a.archived ? 1 : 0) - (b.archived ? 1 : 0)).map((item) => {
            const color = getPaletteColor(item.id);
            return (
            <div key={item.id} className={`config-card ${item.archived ? "archived" : ""}`}>
              <div className="config-info">
                <span className="config-color-indicator" style={{ color: `var(--color-${color})` }} />
                <div className="config-text">
                  <h4>
                    {item.name}
                    {item.archived && <span className="archive-tag">已归档</span>}
                  </h4>
                  <p>{item.unit} · 预警 {formatNumber(item.minStock)} · 当前 {formatNumber(item.stock)}</p>
                </div>
              </div>
              <div className="config-actions">
                {item.archived ? (
                  <button className="config-btn-action reactivate btn-pressable" title="恢复启用" onClick={() => handleReactivateMaterial(item.id)}><Icons.Reset /></button>
                ) : (
                  <>
                    <button
                      className="config-btn-action edit btn-pressable"
                      title="编辑原材料"
                      style={{
                        background: "rgba(0, 242, 254, 0.15)",
                        border: "1px solid rgba(0, 242, 254, 0.3)",
                        color: "var(--color-cyan)"
                      }}
                      onClick={() => {
                        setFormEditMaterial({
                          id: item.id,
                          name: item.name,
                          unit: item.unit,
                          minStock: String(item.minStock)
                        });
                        setShowEditMaterialModal(true);
                      }}
                    >
                      <Icons.Edit />
                    </button>
                    <button className="config-btn-action delete btn-pressable" title="删除原材料" onClick={() => handleDeleteMaterial(item.id)}><Icons.Delete /></button>
                  </>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="config-panel">
        <div className="config-header">
          <h3>成品配置</h3>
          <button className="config-btn-add btn-pressable" onClick={() => setShowAddProductModal(true)}><Icons.Add />新增产品</button>
        </div>
        <div className="config-item-list">
          {[...products].sort((a, b) => (a.archived ? 1 : 0) - (b.archived ? 1 : 0)).map((item) => (
            <div key={item.id} className={`config-card ${item.archived ? "archived" : ""}`}>
              <div className="config-info">
                <span className="config-color-indicator" style={{ color: "var(--color-gold)" }} />
                <div className="config-text">
                  <h4>
                    {item.name}
                    {item.archived && <span className="archive-tag">已归档</span>}
                  </h4>
                  <p>{item.unit} · 当前 {formatNumber(item.stock)}</p>
                </div>
              </div>
              <div className="config-actions">
                {item.archived ? (
                  <button className="config-btn-action reactivate btn-pressable" title="恢复启用" onClick={() => handleReactivateProduct(item.id)}><Icons.Reset /></button>
                ) : (
                  <>
                    <button
                      className="config-btn-action edit btn-pressable"
                      title="编辑产品"
                      style={{
                        background: "rgba(0, 242, 254, 0.15)",
                        border: "1px solid rgba(0, 242, 254, 0.3)",
                        color: "var(--color-cyan)"
                      }}
                      onClick={() => {
                        setFormEditProduct({
                          id: item.id,
                          name: item.name,
                          unit: item.unit
                        });
                        setShowEditProductModal(true);
                      }}
                    >
                      <Icons.Edit />
                    </button>
                    <button className="config-btn-action delete btn-pressable" title="删除产品" onClick={() => handleDeleteProduct(item.id)}><Icons.Delete /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

