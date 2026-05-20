!macro NSIS_HOOK_POSTUNINSTALL
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\SmartFactory"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SmartFactory"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\smart-factory"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\smart-factory"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\智能生产物料管理系统"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\智能生产物料管理系统"
  DeleteRegKey HKLM "Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\SmartFactory"
  DeleteRegKey HKCU "Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\SmartFactory"
  DeleteRegKey HKLM "Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\smart-factory"
  DeleteRegKey HKCU "Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\smart-factory"
  DeleteRegKey HKLM "Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\智能生产物料管理系统"
  DeleteRegKey HKCU "Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\智能生产物料管理系统"
!macroend
