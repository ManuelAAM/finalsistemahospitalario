const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

const dbPath = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'com.sistema-hospitalario.ads',
  'hospital.db'
);

const cedula = 'ENF-12345';
const password = 'Enfermero123';

// Simular exactamente lo que hace auth.js
const hashPassword = (pwd) => `hash_${pwd}`;

console.log('\n=== SIMULACION DE LOGIN ===\n');
console.log(`Cedula: "${cedula}"`);
console.log(`Contraseña: "${password}"`);
console.log(`Hash Input generado: "${hashPassword(password)}"`);
console.log('\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }

  // Buscar usuario (igual a getUserByCedula)
  const sql = `SELECT * FROM users WHERE license_number = ? OR username = ?`;
  db.get(sql, [cedula, cedula], (err, user) => {
    if (err) {
      console.error('Error SQL:', err);
      db.close();
      process.exit(1);
    }

    if (!user) {
      console.log('ERROR: Usuario no encontrado');
      db.close();
      process.exit(1);
    }

    console.log('Usuario encontrado:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  License: ${user.license_number}`);
    console.log(`  Hash BD: "${user.password_hash}"`);
    console.log('\nComparacion:');
    
    const inputHash = hashPassword(password);
    const dbHash = user.password_hash;
    
    console.log(`  Hash Input:  "${inputHash}"`);
    console.log(`  Hash BD:     "${dbHash}"`);
    console.log(`  ¿Coinciden?: ${inputHash === dbHash ? 'SI ✅' : 'NO ❌'}`);
    
    if (inputHash === dbHash) {
      console.log('\nRESULTADO: LOGIN EXITOSO\n');
    } else {
      console.log('\nRESULTADO: LOGIN FALLIDO - Hashes no coinciden\n');
      console.log('Analisis de caracteres:');
      console.log(`  Input length: ${inputHash.length}`);
      console.log(`  DB length: ${dbHash.length}`);
      console.log(`  Input bytes: ${Buffer.from(inputHash).toString('hex')}`);
      console.log(`  DB bytes: ${Buffer.from(dbHash).toString('hex')}`);
    }

    db.close();
  });
});
