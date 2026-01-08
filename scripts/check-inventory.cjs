#!/usr/bin/env node

/**
 * Script para verificar el inventario de medicamentos en la base de datos
 */

const Database = require('tauri-plugin-sql-api').default;

async function checkInventory() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    const db = await Database.load('sqlite:hospital.db');
    console.log('✅ Conectado exitosamente\n');

    // Verificar si la tabla existe
    console.log('📋 Verificando tabla medication_inventory...');
    const tables = await db.select(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='medication_inventory'"
    );
    
    if (tables.length === 0) {
      console.log('❌ La tabla medication_inventory NO existe');
      return;
    }
    
    console.log('✅ La tabla existe\n');

    // Contar registros
    const count = await db.select('SELECT COUNT(*) as count FROM medication_inventory');
    console.log(`📊 Total de medicamentos: ${count[0].count}\n`);

    if (count[0].count === 0) {
      console.log('⚠️ El inventario está vacío');
      console.log('💡 Posibles soluciones:');
      console.log('   1. Ejecutar: bash reset-database.sh');
      console.log('   2. Reiniciar la aplicación con: npm run tauri dev');
      return;
    }

    // Mostrar todos los medicamentos
    const meds = await db.select('SELECT * FROM medication_inventory ORDER BY name LIMIT 20');
    
    console.log('💊 Medicamentos en inventario:');
    console.log('═'.repeat(80));
    
    meds.forEach((med, idx) => {
      console.log(`\n${idx + 1}. ${med.name}`);
      console.log(`   Categoría: ${med.category}`);
      console.log(`   Stock: ${med.quantity} ${med.unit}`);
      console.log(`   Ubicación: ${med.location}`);
      console.log(`   Precio: $${med.unit_price}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Total mostrado: ${meds.length} medicamentos`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 La base de datos puede no existir aún.');
    console.error('   Ejecuta primero: npm run tauri dev');
  }
}

checkInventory();
