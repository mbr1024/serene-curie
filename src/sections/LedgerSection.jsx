import DateRangePicker from "../components/DateRangePicker";
import Icons from "../components/Icons";

export default function LedgerSection({
  logs,
  totalLogs,
  handleUndo,
  ledgerTimeRange,
  setLedgerTimeRange,
  ledgerStartDate,
  setLedgerStartDate,
  ledgerEndDate,
  setLedgerEndDate
}) {
  return (
    <div className="ledger-wrapper">
      <div className="ledger-header">
        <div>
          <h3>出入库流水</h3>
          <p>当前显示 {logs.length} / {totalLogs} 条记录</p>
        </div>
        <DateRangePicker
          range={ledgerTimeRange}
          setRange={setLedgerTimeRange}
          startDate={ledgerStartDate}
          setStartDate={setLedgerStartDate}
          endDate={ledgerEndDate}
          setEndDate={setLedgerEndDate}
          includeAll
        />
      </div>

      <div className="ledger-list">
        {logs.length === 0 ? (
          <div className="empty-placeholder">{totalLogs === 0 ? "暂无任何批次记账与补货流水" : "当前筛选范围内暂无流水"}</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="ledger-item">
              <div className="ledger-main">
                <div className={`ledger-icon-badge ${log.type}`}>
                  {log.type === "restock" && <Icons.SmallPlus />}
                  {log.type === "shipment" && <Icons.SmallShip />}
                  {log.type === "mix" && <Icons.SmallMix />}
                  {log.type === "yield" && <Icons.SmallFactory />}
                  {log.type === "production" && <Icons.SmallFactory />}
                </div>
                <div className="ledger-body">
                  <h4>{log.title}</h4>

                  {log.type === "restock" && <div className="ledger-summary">采购补充原材料 <em>{log.itemName}</em> 共计 <strong>+{log.qty}</strong></div>}
                  {log.type === "shipment" && <div className="ledger-summary">出货发运产品 <em>{log.itemName}</em> 共计 <strong>-{log.qty}</strong></div>}
                  {log.type === "mix" && (
                    <div>
                      <div className="ledger-summary">生产打料实际消耗原料如下：</div>
                      {log.consumptions?.length > 0 && (
                        <div className="ledger-consumptions">
                          <span>实际原料消耗: </span>
                          {log.consumptions.map((cons, index) => (
                            <span key={index} className="consumption-pill" style={{ color: "var(--color-danger)", borderColor: "rgba(255, 46, 46, 0.2)" }}>
                              {cons.name}: -{cons.qty} 公斤
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {log.type === "yield" && <div className="ledger-summary">完工报产大底 <em>{log.itemName}</em> 共计 <strong>+{log.qty}</strong> 双</div>}
                  {log.type === "production" && (
                    <div>
                      <div className="ledger-summary">合格产出产品 <em>{log.itemName}</em> 共计 <strong>+{log.qty}</strong></div>
                      {log.consumptions?.length > 0 && (
                        <div className="ledger-consumptions">
                          <span>实际物料消耗: </span>
                          {log.consumptions.map((cons, index) => (
                            <span key={index} className="consumption-pill">{cons.name}: -{cons.qty}</span>
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
                  <Icons.Reset />
                  <span>撤销本批</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

