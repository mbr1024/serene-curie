import {
  AlertTriangle,
  BarChart3,
  Box,
  ClipboardList,
  DatabaseBackup,
  Download,
  Edit3,
  Factory,
  FileClock,
  FlaskConical,
  Gauge,
  Package,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  Plus,
  RotateCcw,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  Upload,
  Zap
} from "lucide-react";

const navIconStyle = (active) => ({ color: active ? "#000" : "inherit" });
const largeIconProps = { size: 36, strokeWidth: 2 };

const Icons = {
  Logo: () => <Box size={36} strokeWidth={2.5} style={{ color: "var(--color-cyan)" }} />,
  Stock: ({ active }) => <Gauge size={18} strokeWidth={2.5} style={navIconStyle(active)} />,
  Action: ({ active }) => <Zap size={18} strokeWidth={2.5} style={navIconStyle(active)} />,
  Ledger: ({ active }) => <FileClock size={18} strokeWidth={2.5} style={navIconStyle(active)} />,
  Config: ({ active }) => <Settings size={18} strokeWidth={2.5} style={navIconStyle(active)} />,
  System: ({ active }) => <SlidersHorizontal size={18} strokeWidth={2.5} style={navIconStyle(active)} />,
  Warning: () => <AlertTriangle size={18} strokeWidth={2.5} style={{ color: "var(--color-danger)" }} />,
  Factory: () => <Factory {...largeIconProps} />,
  Ship: () => <PackageMinus {...largeIconProps} />,
  Plus: () => <PackagePlus {...largeIconProps} />,
  Mix: () => <FlaskConical {...largeIconProps} />,
  SmallFactory: () => <Factory size={18} strokeWidth={2.5} />,
  SmallShip: () => <PackageMinus size={18} strokeWidth={2.5} />,
  SmallPlus: () => <PackagePlus size={18} strokeWidth={2.5} />,
  SmallMix: () => <FlaskConical size={18} strokeWidth={2.5} />,
  Package: () => <Package size={18} strokeWidth={2.5} />,
  Product: () => <PackageCheck size={18} strokeWidth={2.5} />,
  Analytics: ({ active }) => <BarChart3 size={18} strokeWidth={2.5} style={navIconStyle(active)} />,
  Backup: () => <DatabaseBackup size={18} strokeWidth={2.5} />,
  Upload: () => <Upload size={18} strokeWidth={2.5} />,
  Download: () => <Download size={18} strokeWidth={2.5} />,
  Reset: () => <RotateCcw size={18} strokeWidth={2.5} />,
  ShieldAlert: () => <ShieldAlert size={18} strokeWidth={2.5} />,
  List: () => <ClipboardList size={18} strokeWidth={2.5} />,
  Add: () => <Plus size={18} strokeWidth={2.5} />,
  Edit: () => <Edit3 size={18} strokeWidth={2.5} />,
  Delete: () => <Trash2 size={18} strokeWidth={2.5} />
};

export default Icons;
