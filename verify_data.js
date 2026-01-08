// Script para verificar la cantidad de datos en la base de datos
const Database = require('@tauri-apps/plugin-sql');

async function verifyData() {
  try {
    const db = await Database.load('sqlite:hospital.db');
    
    console.log('🏥 VERIFICACIÓN DE DATOS MASIVOS DEL SISTEMA HOSPITALARIO');
    console.log('========================================================\n');
    
    // Verificar pacientes
    const patients = await db.select('SELECT COUNT(*) as count FROM patients');
    const patientsByFloor = await db.select('SELECT floor, COUNT(*) as count FROM patients GROUP BY floor');
    console.log(`👥 PACIENTES: ${patients[0].count} registros`);
    patientsByFloor.forEach(f => {
      console.log(`   - ${f.floor}: ${f.count} pacientes`);
    });
    
    // Verificar signos vitales
    const vitals = await db.select('SELECT COUNT(*) as count FROM vital_signs');
    console.log(`💓 SIGNOS VITALES: ${vitals[0].count} registros`);
    
    // Verificar medicamentos
    const medications = await db.select('SELECT COUNT(*) as count FROM medications');
    const medsByCategory = await db.select('SELECT category, COUNT(*) as count FROM medications GROUP BY category LIMIT 8');
    console.log(`💊 MEDICAMENTOS: ${medications[0].count} registros`);
    medsByCategory.forEach(m => {
      console.log(`   - ${m.category}: ${m.count} medicamentos`);
    });
    
    // Verificar tratamientos
    const treatments = await db.select('SELECT COUNT(*) as count FROM treatments');
    const activeTreatments = await db.select("SELECT COUNT(*) as count FROM treatments WHERE status = 'Activo'");
    console.log(`🏥 TRATAMIENTOS: ${treatments[0].count} registros (${activeTreatments[0].count} activos)`);
    
    // Verificar notas de enfermería
    const notes = await db.select('SELECT COUNT(*) as count FROM nurse_notes');
    const notesByType = await db.select('SELECT note_type, COUNT(*) as count FROM nurse_notes GROUP BY note_type');
    console.log(`📝 NOTAS DE ENFERMERÍA: ${notes[0].count} registros`);
    notesByType.forEach(n => {
      console.log(`   - ${n.note_type}: ${n.count} notas`);
    });
    
    // Verificar citas médicas  
    const appointments = await db.select('SELECT COUNT(*) as count FROM appointments');
    const appointmentsByStatus = await db.select('SELECT status, COUNT(*) as count FROM appointments GROUP BY status');
    console.log(`📅 CITAS MÉDICAS: ${appointments[0].count} registros`);
    appointmentsByStatus.forEach(a => {
      console.log(`   - ${a.status}: ${a.count} citas`);
    });
    
    // Verificar usuarios
    const users = await db.select('SELECT COUNT(*) as count FROM users');
    const usersByRole = await db.select('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    console.log(`👤 USUARIOS: ${users[0].count} registros`);
    usersByRole.forEach(u => {
      console.log(`   - ${u.role}: ${u.count} usuarios`);
    });
    
    console.log('\n✅ VERIFICACIÓN COMPLETA - BASE DE DATOS POBLADA EXITOSAMENTE');
    console.log(`📊 TOTAL DE REGISTROS: ${
      patients[0].count + vitals[0].count + medications[0].count + 
      treatments[0].count + notes[0].count + appointments[0].count + users[0].count
    }`);
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  }
}

verifyData();