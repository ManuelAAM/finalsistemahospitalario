const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.argv[2];
if (!dbPath) {
  console.error('Uso: node scripts/query-db.cjs <ruta_a_db>');
  process.exit(1);
}

const resolved = path.resolve(dbPath);
console.log('Abriendo DB en:', resolved);

const db = new sqlite3.Database(resolved, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error al abrir la DB:', err.message);
    process.exit(1);
  }

  const sql = `SELECT id, username, password_hash, license_number, email FROM users WHERE username = 'enfermero' OR license_number = 'ENF-12345' LIMIT 1;`;
  db.get(sql, (err, row) => {
    if (err) {
      console.error('Error en la consulta:', err.message);
      db.close();
      process.exit(1);
    }

    if (!row) {
      console.log('No se encontró el usuario enfermero en la DB.');
    } else {
      console.log('Fila encontrada:');
      console.log(row);
    }

    db.close();
  });
});
