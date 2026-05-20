const DEFAULT_PRESETS = [
  { value: "7", label: "近 7 天" },
  { value: "15", label: "近 15 天" },
  { value: "30", label: "近 30 天" }
];

export default function DateRangePicker({
  range,
  setRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  presets = DEFAULT_PRESETS,
  includeAll = false
}) {
  const handleStartChange = (value) => {
    if (endDate && value > endDate) return;
    setStartDate(value);
    setRange("custom");
  };

  const handleEndChange = (value) => {
    if (startDate && value < startDate) return;
    setEndDate(value);
    setRange("custom");
  };

  return (
    <div className="stats-range-toolbar">
      {includeAll && (
        <button
          type="button"
          className={`range-selector-btn btn-pressable ${range === "all" ? "active" : ""}`}
          onClick={() => setRange("all")}
        >
          全部
        </button>
      )}
      {presets.map((preset) => (
        <button
          key={preset.value}
          type="button"
          className={`range-selector-btn btn-pressable ${range === preset.value ? "active" : ""}`}
          onClick={() => setRange(preset.value)}
        >
          {preset.label}
        </button>
      ))}
      <button
        type="button"
        className={`range-selector-btn btn-pressable ${range === "custom" ? "active" : ""}`}
        onClick={() => setRange("custom")}
      >
        自定义
      </button>
      {range === "custom" && (
        <div className="custom-date-picker-wrapper">
          <span className="custom-date-label">查询区间:</span>
          <input
            type="date"
            className="custom-date-input"
            value={startDate}
            onChange={(event) => handleStartChange(event.target.value)}
          />
          <span className="custom-date-sep">至</span>
          <input
            type="date"
            className="custom-date-input"
            value={endDate}
            onChange={(event) => handleEndChange(event.target.value)}
          />
        </div>
      )}
    </div>
  );
}
