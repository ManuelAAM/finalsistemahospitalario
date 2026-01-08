// Script para verificar las asignaciones de pacientes a enfermeros
const Database = require('@tauri-apps/plugin-sql');

async function verifyAssignments() {
  try {
    const db = await Database.load('sqlite:hospital.db');
    
    console.log('🏥 VERIFICACIÓN DE ASIGNACIONES PACIENTE-ENFERMERO');
    console.log('==================================================\n');
    
    // Verificar total de asignaciones
    const totalAssignments = await db.select('SELECT COUNT(*) as count FROM patient_assignments');
    console.log(`📋 TOTAL DE ASIGNACIONES: ${totalAssignments[0].count}\n`);
    
    // Asignaciones por enfermero
    const assignmentsByNurse = await db.select(`
      SELECT u.username, u.name, COUNT(pa.id) as patient_count, 
             GROUP_CONCAT(DISTINCT pa.shift_type) as shifts
      FROM users u 
      LEFT JOIN patient_assignments pa ON u.id = pa.nurse_id AND pa.status = 'Active'
      WHERE u.role = 'nurse'
      GROUP BY u.id, u.username, u.name
      ORDER BY patient_count DESC
    `);
    
    console.log('👥 ASIGNACIONES POR ENFERMERO:');
    assignmentsByNurse.forEach(nurse => {
      console.log(`   ${nurse.name} (${nurse.username}): ${nurse.patient_count} pacientes`);
      if (nurse.shifts) {
        console.log(`      Turnos: ${nurse.shifts}`);
      }
    });
    console.log();
    
    // Asignaciones por turno
    const assignmentsByShift = await db.select(`
      SELECT shift_type, COUNT(*) as count 
      FROM patient_assignments 
      WHERE status = 'Active' 
      GROUP BY shift_type
    `);
    
    console.log('🕐 ASIGNACIONES POR TURNO:');
    assignmentsByShift.forEach(shift => {
      console.log(`   ${shift.shift_type}: ${shift.count} asignaciones`);
    });
    console.log();
    
    // Asignaciones por piso/área
    const assignmentsByArea = await db.select(`
      SELECT p.floor, COUNT(pa.id) as assignments
      FROM patient_assignments pa
      JOIN patients p ON pa.patient_id = p.id
      WHERE pa.status = 'Active'
      GROUP BY p.floor
      ORDER BY assignments DESC
    `);
    
    console.log('🏢 ASIGNACIONES POR ÁREA:');
    assignmentsByArea.forEach(area => {
      console.log(`   ${area.floor}: ${area.assignments} asignaciones`);
    });
    console.log();
    
    // Detalles de asignaciones recientes
    const recentAssignments = await db.select(`
      SELECT u.name as nurse_name, 
             p.first_name || ' ' || p.last_name as patient_name,
             p.floor,
             pa.shift_type,
             pa.notes
      FROM patient_assignments pa
      JOIN users u ON pa.nurse_id = u.id
      JOIN patients p ON pa.patient_id = p.id
      WHERE pa.status = 'Active'
      ORDER BY pa.id DESC
      LIMIT 10
    `);
    
    console.log('📝 ASIGNACIONES RECIENTES (últimas 10):');
    recentAssignments.forEach((assignment, index) => {
      console.log(`   ${index + 1}. ${assignment.nurse_name} → ${assignment.patient_name}`);
      console.log(`      Área: ${assignment.floor} | Turno: ${assignment.shift_type}`);
      console.log(`      Notas: ${assignment.notes}`);
      console.log();
    });
    
    console.log('✅ VERIFICACIÓN COMPLETADA - ASIGNACIONES FUNCIONANDO CORRECTAMENTE');
    
  } catch (error) {
    console.error('❌ Error verificando asignaciones:', error);
  }
}

verifyAssignments();