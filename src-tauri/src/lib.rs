use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let show = tauri::menu::MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
      let quit = tauri::menu::MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
      let tray_menu = tauri::menu::Menu::with_items(app, &[&show, &quit])?;

      let mut tray_builder = tauri::tray::TrayIconBuilder::new();
      if let Some(icon) = app.default_window_icon().cloned() {
        tray_builder = tray_builder.icon(icon);
      }

      let tray = tray_builder
        .menu(&tray_menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
          "show" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.unminimize();
              let _ = window.set_focus();
            }
          }
          "quit" => app.exit(0),
          _ => {}
        })
        .on_tray_icon_event(|tray, event| {
          if let tauri::tray::TrayIconEvent::Click { button, button_state, .. } = event {
            if button == tauri::tray::MouseButton::Left
              && button_state == tauri::tray::MouseButtonState::Up
            {
              if let Some(window) = tray.app_handle().get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
              }
            }
          }
        })
        .build(app)?;

      let _tray = tray;

      if let Some(window) = app.get_webview_window("main") {
        let app_handle = app.handle().clone();
        window.on_window_event(move |event| {
          if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            if let Some(window) = app_handle.get_webview_window("main") {
              let _ = window.hide();
            }
          }
        });
      }

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
