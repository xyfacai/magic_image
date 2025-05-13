// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 初始化 Tauri 应用
fn main() {
    tauri::Builder::default()
        // 暂时注释掉插件以排查问题
        // .plugin(tauri_plugin_http::init())
        // .plugin(tauri_plugin_shell::init())
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                // 在开发模式下提供更详细的日志
                println!("应用正在开发模式下运行");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("运行Tauri应用程序时出错");
}
