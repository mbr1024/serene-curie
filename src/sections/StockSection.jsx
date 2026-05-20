import DateRangePicker from "../components/DateRangePicker";
import Icons from "../components/Icons";
import { getPaletteColor } from "../utils/palette";

function formatNumber(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

export default function StockSection({
  materials,
  products,
  materialHealthStats,
  materialConsumptionMap,
  productConsumptionStats,
  stockStats,
  statsTimeRange,
  setStatsTimeRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  getBatteryPercent
}) {
  const visibleMaterials = materialHealthStats.filter((item) => !item.archived || item.stock > 0);
  const visibleProducts = products.filter((item) => !item.archived || item.stock > 0);
  const lowStockCount = materials.filter((item) => !item.archived && item.stock <= item.minStock).length;

  return (
    <div>
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div className="section-title" style={{ marginBottom: 0 }}><Icons.Package /> 原材料实时库存</div>
        {lowStockCount > 0 ? (
          <div className="warning-stat-badge"><Icons.Warning /> 当前有 <strong>{lowStockCount}</strong> 款物料低于安全水位</div>
        ) : (
          <div className="success-stat-badge">全部原材料库存正常</div>
        )}
      </div>

      <div className="grid-stock">
        {visibleMaterials.length === 0 ? (
          <div className="empty-placeholder">暂无可展示的原材料，请先到配置中心添加</div>
        ) : (
          visibleMaterials.map((item) => {
            const isLow = item.stock <= item.minStock;
            const isUrgent = (item.daysRemaining !== null && item.daysRemaining < 3) || isLow;
            const isNormal = !isUrgent && item.daysRemaining !== null && item.daysRemaining >= 3;
            const batteryPercent = getBatteryPercent(item.stock, item.minStock);
            const color = getPaletteColor(item.id);

            return (
              <div key={item.id} className={`stock-card glow-${color} ${isUrgent && !item.archived ? "low-stock-alert" : ""} ${item.archived ? "archived-card" : ""}`}>
                <div className="card-header-info">
                  <span className="card-title">
                    {item.name}
                    {item.archived && <span className="archive-tag">已停用</span>}
                  </span>
                  <span className={`card-badge ${item.archived ? "cyan" : isUrgent ? "red" : color}`}>
                    {item.archived ? "存量清理" : isUrgent ? "低库存" : "正常"}
                  </span>
                </div>

                <div className="stock-value-wrapper">
                  <span className="stock-num">{formatNumber(item.stock)}</span>
                  <span className="stock-unit">{item.unit}</span>
                </div>

                <div>
                  <div className="battery-slot">
                    <div className={`battery-fill ${item.archived ? "cyan" : isUrgent ? "red" : color}`} style={{ width: `${batteryPercent}%` }} />
                  </div>
                  <div className="card-footer-stock">
                    <span>预警水位: {formatNumber(item.minStock)} {item.unit}</span>
                    <span className="stock-days-badge">
                      {item.daysRemaining !== null ? `预计可用 ${item.daysRemaining} 天` : "近期无消耗"}
                    </span>
                  </div>
                  {!item.archived && (
                    <div className="card-health-row">
                      <span className="health-sub-label">日均消耗 {formatNumber(item.dailyAvg)} {item.unit}/天</span>
                      <span className={`health-alert-inline ${isUrgent ? "red" : isNormal ? "green" : "muted"}`}>
                        {isUrgent ? (isLow ? "库存已低于安全线" : "库存不足 3 天") : isNormal ? "库存状态健康" : "暂无消耗记录"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="section-title orange"><Icons.Product /> 成品实时库存</div>
      <div className="grid-stock">
        {visibleProducts.length === 0 ? (
          <div className="empty-placeholder">暂无可展示的成品，请先到配置中心添加</div>
        ) : (
          visibleProducts.map((item) => (
            <div key={item.id} className={`stock-card glow-gold ${item.archived ? "archived-card" : ""}`}>
              <div className="card-header-info">
                <span className="card-title">
                  {item.name}
                  {item.archived && <span className="archive-tag">已停用</span>}
                </span>
                <span className="card-badge gold">
                  库存记录
                </span>
              </div>
              <div className="stock-value-wrapper">
                <span className="stock-num">{formatNumber(item.stock)}</span>
                <span className="stock-unit">{item.unit}</span>
              </div>
              <div className="card-footer-stock">
                <span>当前库存</span>
                <span className="stock-days-badge">累计报产 {formatNumber(productConsumptionStats[item.name]?.totalQty || 0)} {item.unit}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="analytics-toolbar-row">
        <div className="section-title cyan"><Icons.Analytics /> 生产消耗统计</div>
        <DateRangePicker
          range={statsTimeRange}
          setRange={setStatsTimeRange}
          startDate={customStartDate}
          setStartDate={setCustomStartDate}
          endDate={customEndDate}
          setEndDate={setCustomEndDate}
        />
      </div>

      <div className="analytics-container" style={{ marginTop: "16px" }}>
        <div className="analytics-kpi-grid">
          <div className="kpi-card btn-pressable">
            <div className="kpi-header">
              <span className="kpi-icon"><Icons.SmallMix /></span>
              <span className="kpi-title">打料累计批次</span>
            </div>
            <div className="kpi-value">{formatNumber(stockStats.mixBatchCount)} <span className="kpi-unit">次</span></div>
            <div className="kpi-footer">当前统计周期内的打料登记次数</div>
          </div>

          <div className="kpi-card btn-pressable">
            <div className="kpi-header">
              <span className="kpi-icon"><Icons.SmallFactory /></span>
              <span className="kpi-title">完工累计批次</span>
            </div>
            <div className="kpi-value">{formatNumber(stockStats.yieldBatchCount)} <span className="kpi-unit">次</span></div>
            <div className="kpi-footer">当前统计周期内的完工报产次数</div>
          </div>

          <div className="kpi-card btn-pressable">
            <div className="kpi-header">
              <span className="kpi-icon"><Icons.Product /></span>
              <span className="kpi-title">成品产出总量</span>
            </div>
            <div className="kpi-value">{formatNumber(stockStats.producedQty)} <span className="kpi-unit">双</span></div>
            <div className="kpi-footer">基于选定周期的完工成品总量</div>
          </div>

          <div className="kpi-card btn-pressable">
            <div className="kpi-header">
              <span className="kpi-icon"><Icons.SmallShip /></span>
              <span className="kpi-title">出货总量</span>
            </div>
            <div className="kpi-value">{formatNumber(stockStats.shippedQty)} <span className="kpi-unit">双</span></div>
            <div className="kpi-footer">基于选定周期的产品出库总量</div>
          </div>
        </div>

        <div className="analytics-main-grid analytics-single-col">
          <div className="analytics-chart-panel">
            <div className="panel-header">
              <h3>各款式累计产量明细</h3>
              <span className="panel-sub">选定统计周期内各成品款式的累计完工产量</span>
            </div>
            <div className="ratio-list">
              {Object.keys(productConsumptionStats).length === 0 ? (
                <div className="empty-placeholder" style={{ padding: "40px" }}>暂无完工产出流水</div>
              ) : (
                Object.keys(productConsumptionStats).map((productName) => {
                  const stats = productConsumptionStats[productName];
                  return (
                    <div key={productName} className="ratio-card" style={{ padding: "16px 20px" }}>
                      <div className="ratio-card-header" style={{ borderBottom: "none", paddingBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{productName}</h4>
                        <span className="total-produced" style={{ fontSize: "14px" }}>
                          累计产量: <strong style={{ color: "var(--color-cyan)", fontSize: "18px", marginLeft: "4px" }}>{formatNumber(stats.totalQty)}</strong> 双
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mat-total-summary">
              <div className="mat-total-summary-header">
                <span className="mat-total-title"><Icons.SmallMix /> 原料消耗汇总</span>
                <span className="mat-total-sub">所有产品合计 · 选定周期内各原料实际消耗总量</span>
              </div>
              {Object.keys(materialConsumptionMap).length === 0 ? (
                <div className="empty-placeholder">当前时间范围内暂无打料消耗记录</div>
              ) : (
                <div className="mat-total-grid">
                  {[...materials]
                    .filter((item) => (materialConsumptionMap[item.name] || 0) > 0)
                    .sort((a, b) => (materialConsumptionMap[b.name] || 0) - (materialConsumptionMap[a.name] || 0))
                    .map((item) => (
                      <div key={item.id} className="mat-total-item">
                        <span className="mat-total-name">{item.name}</span>
                        <span className="mat-total-qty">
                          <strong>{formatNumber(materialConsumptionMap[item.name])}</strong>
                          <span className="mat-total-unit"> {item.unit}</span>
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

