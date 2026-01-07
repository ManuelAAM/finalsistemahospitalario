const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// Ruta donde Tauri guarda la DB
const dbPath = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'com.sistema-hospitalario.ads',
  'hospital.db'
);

console.log('\n=== DIAGNOSTICO DE USUARIO EN BD ===\n');
console.log('Buscando BD en:', dbPath);
console.log('');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir BD:', err.message);
    console.error('Si la BD no existe, abre la app para que se cree.\n');
    process.exit(1);
  }

  // 1. Verificar si existe la tabla users
  const checkTable = `SELECT name FROM sqlite_master WHERE type='table' AND name='users';`;
  db.get(checkTable, (err, row) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      process.exit(1);
    }
    
    if (!row) {
      console.error('PROBLEMA: Tabla "users" no existe aun.\n');
      db.close();
      process.exit(1);
    }

    console.log('OK: Tabla "users" existe\n');

    // 2. Obtener todos los usuarios
    const selectAll = `SELECT id, username, password_hash, license_number, name, email FROM users;`;
    db.all(selectAll, (err, rows) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        process.exit(1);
      }

      if (rows.length === 0) {
        console.log('PROBLEMA: No hay usuarios en la BD.\n');
        db.close();
        process.exit(1);
      }

      console.log('USUARIOS ENCONTRADOS:');
      console.log('='.repeat(80));
      rows.forEach((user, i) => {
        console.log(`\n[Usuario ${i + 1}]`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  License/Cedula: ${user.license_number}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Password Hash: ${user.password_hash}`);
      });

      // 3. Verificar específicamente "enfermero"
      console.log('\n' + '='.repeat(80));
      const enfermeroRow = rows.find(u => u.username === 'enfermero' || u.license_number === 'ENF-12345');
      if (enfermeroRow) {
        console.log('\nCREDENCIAL DE DEMO (enfermero):');
        console.log(`  Cedula a usar: ENF-12345`);
        console.log(`  Contraseña a usar: Enfermero123`);
        console.log(`  Hash esperado: hash_Enfermero123`);
        console.log(`  Hash en BD: ${enfermeroRow.password_hash}`);
        
        if (enfermeroRow.password_hash === 'hash_Enfermero123') {
          console.log('  STATUS: ✅ CORRECTO - Puedes usar ENF-12345 / Enfermero123\n');
        } else {
          console.log(`  STATUS: ❌ INCORRECTO - Hash no coincide.\n`);
          console.log('  SOLUCION: El usuario se creó con hash incorrecto.');
          console.log('  Opción 1: Vuelve a borrar la carpeta AppData y reinicia la app.');
          console.log('  Opción 2: Ejecuta update-password.cjs para cambiar el hash.\n');
        }
      } else {
        console.log('\nPROBLEMA: El usuario "enfermero" no existe en la BD.\n');
      }

      db.close();
    });
  });
});
