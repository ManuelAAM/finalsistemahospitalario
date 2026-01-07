#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Aquí estaba el error del .new(), lo cambiamos a .default()
        // y eliminamos el plugin de logs que no tenías instalado
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}