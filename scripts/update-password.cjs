const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.argv[2];
if (!dbPath) {
  console.error('Uso: node scripts/update-password.cjs <ruta_a_db>');
  process.exit(1);
}

const resolved = path.resolve(dbPath);
console.log('Actualizando password en DB:', resolved);

const db = new sqlite3.Database(resolved, (err) => {
  if (err) {
    console.error('Error al abrir la DB:', err.message);
    process.exit(1);
  }

  const newHash = 'hash_Enfermero123';
  const sql = `UPDATE users SET password_hash = ? WHERE username = 'enfermero';`;
  
  db.run(sql, [newHash], function(err) {
    if (err) {
      console.error('Error en la actualización:', err.message);
      db.close();
      process.exit(1);
    }

    console.log(`Actualizado: ${this.changes} fila(s) modificada(s)`);
    console.log('Nuevo hash:', newHash);
    
    // Verificar que se actualizó
    const verify = `SELECT username, password_hash FROM users WHERE username = 'enfermero';`;
    db.get(verify, (err, row) => {
      if (row) {
        console.log('Verificación:');
        console.log(row);
      }
      db.close();
    });
  });
});
