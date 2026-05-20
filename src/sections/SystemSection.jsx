import Icons from "../components/Icons";

export default function SystemSection({ handleImportBackup, handleExportBackup, handleOpenResetModal }) {
  return (
    <div className="system-wrapper">
      <div className="system-panel">
        <div className="system-panel-header">
          <div className="system-title-icon">
            <Icons.Backup />
          </div>
          <div>
            <h3>数据备份</h3>
            <p>导出当前库存、产品与流水数据，或从本地 JSON 备份恢复。</p>
          </div>
        </div>

        <div className="system-actions">
          <label className="system-action-btn btn-pressable">
            <Icons.Upload />
            <span>导入备份</span>
            <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: "none" }} />
          </label>
          <button className="system-action-btn btn-pressable" onClick={handleExportBackup}>
            <Icons.Download />
            <span>导出备份</span>
          </button>
        </div>
      </div>

      <div className="system-panel danger">
        <div className="system-panel-header">
          <div className="system-title-icon danger">
            <Icons.ShieldAlert />
          </div>
          <div>
            <h3>数据重置</h3>
            <p>清空当前库存、产品和流水记录，并恢复到初始数据状态。</p>
          </div>
        </div>

        <button className="danger-reset-btn btn-pressable" onClick={handleOpenResetModal}>
          <Icons.Reset />
          <span>重置系统数据</span>
        </button>
      </div>
    </div>
  );
}
