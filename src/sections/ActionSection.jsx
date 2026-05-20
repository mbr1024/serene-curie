import Icons from "../components/Icons";

export default function ActionSection({
  materials,
  products,
  showToast,
  setFormMix,
  setMixConsumptions,
  setShowMixModal,
  setFormYield,
  setShowYieldModal,
  setFormShipment,
  setShowShipmentModal,
  setFormRestock,
  setShowRestockModal
}) {
  return (
    <div className="actions-container">
      <div className="actions-banner">
        <h2>车间生产快捷记账</h2>
        <p>物料出库、补充及生产实际数据快速录入，操作简便，自动分析物料损耗</p>
      </div>

      <div className="action-cards-grid">
        <div className="action-big-card action-production btn-pressable" onClick={() => {
          const activeMats = materials.filter((m) => !m.archived);
          if (activeMats.length === 0) {
            showToast("没有可用的活跃原材料，请先到配置页启用或添加！", "error");
          } else {
            setFormMix({ notes: "" });
            setMixConsumptions({});
            setShowMixModal(true);
          }
        }}>
          <div className="action-icon"><Icons.Mix /></div>
          <span className="action-name">打料记账 (原料消耗)</span>
          <span className="action-desc">登记混炼打料实际消耗的基础原料总量（如天然橡胶、炭黑、促进剂等），精确扣减原料库。</span>
        </div>

        <div className="action-big-card action-yield btn-pressable" onClick={() => {
          const activeProds = products.filter((p) => !p.archived);
          if (activeProds.length === 0) {
            showToast("没有可用的活跃产品，请先到配置页启用或添加！", "error");
          } else {
            setFormYield({ productId: activeProds[0].id, qty: "", notes: "" });
            setShowYieldModal(true);
          }
        }}>
          <div className="action-icon"><Icons.Factory /></div>
          <span className="action-name">完工记账 (大底产量)</span>
          <span className="action-desc">登记硫化压制出炉的各款式合格大底双数，直接入库增加成品大底的物理库存。</span>
        </div>

        <div className="action-big-card action-shipment btn-pressable" onClick={() => {
          const activeProds = products.filter((p) => !p.archived);
          if (activeProds.length === 0) {
            showToast("没有可用的活跃大底款式，无法出货！", "error");
          } else {
            setFormShipment({ productId: activeProds[0].id, qty: "", notes: "" });
            setShowShipmentModal(true);
          }
        }}>
          <div className="action-icon"><Icons.Ship /></div>
          <span className="action-name">大底出货 (发单提货)</span>
          <span className="action-desc">当大底成品出厂发往客户时进行登记，扣减相应大底库存，包含拦截负库存超卖警报。</span>
        </div>

        <div className="action-big-card action-restock btn-pressable" onClick={() => {
          const activeMats = materials.filter((m) => !m.archived);
          if (activeMats.length === 0) {
            showToast("没有可用的活跃原材料，请先到配置页启用或添加！", "error");
          } else {
            setFormRestock({ items: activeMats.map((m) => ({ materialId: m.id, qty: "" })), notes: "" });
            setShowRestockModal(true);
          }
        }}>
          <div className="action-icon"><Icons.Plus /></div>
          <span className="action-name">原料补货 (补充入库)</span>
          <span className="action-desc">天然橡胶、炭黑、化学促进剂等基础原料新采购入库时在此补给登记，快速增加原料物理库存水位。</span>
        </div>
      </div>
    </div>
  );
}

