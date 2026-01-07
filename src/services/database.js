import Database from 'tauri-plugin-sql-api';

let db = null;

// Exportar función para obtener la instancia de db
export function getDb() {
  return db;
}

// Inicializa la conexión a la BD
export async function initDatabase() {
  if (db) return db;
  
  try {
    console.log('🔌 Initializing SQLite database...');
    // Carga la base de datos (se crea en AppData si no existe)
    db = await Database.load('sqlite:hospital.db');
    console.log('✅ Database loaded successfully');
    
    // Crear tablas y datos semilla
    await createTables();
    await seedInitialData();
    
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error.message || error}`);
  }
}

// Crea todas las tablas necesarias
async function createTables() {
  try {
    console.log('🛠️ Creating database tables...');
    
    // Tabla de Usuarios
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        license_number TEXT,
        assigned_shifts TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Pacientes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        curp TEXT UNIQUE NOT NULL,
        room TEXT NOT NULL,
        condition TEXT NOT NULL,
        triage_level TEXT NOT NULL,
        triage_evaluated_by TEXT,
        triage_symptoms TEXT,
        triage_timestamp TEXT,
        admission_date TEXT NOT NULL,
        blood_type TEXT NOT NULL,
        allergies TEXT,
        diagnosis TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Signos Vitales
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vital_signs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        temperature TEXT NOT NULL,
        blood_pressure TEXT NOT NULL,
        heart_rate TEXT NOT NULL,
        respiratory_rate TEXT NOT NULL,
        registered_by TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    // Tabla de Tratamientos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS treatments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        medication TEXT NOT NULL,
        dose TEXT NOT NULL,
        frequency TEXT NOT NULL,
        start_date TEXT NOT NULL,
        last_application TEXT,
        applied_by TEXT,
        status TEXT DEFAULT 'Activo',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    // Tabla de Notas de Enfermería
    await db.execute(`
      CREATE TABLE IF NOT EXISTS nurse_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        note TEXT NOT NULL,
        note_type TEXT DEFAULT 'Evolución',
        nurse_name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    // Tabla de Citas
    await db.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        doctor TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Intentos de Login (Seguridad)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        success INTEGER NOT NULL,
        ip_address TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users(username)
      )
    `);

    // Tabla de Bloqueos de Cuenta (Seguridad)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS account_lockouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        locked_at TEXT DEFAULT CURRENT_TIMESTAMP,
        locked_until TEXT,
        reason TEXT,
        attempt_count INTEGER DEFAULT 3,
        temporary_password TEXT,
        FOREIGN KEY (username) REFERENCES users(username)
      )
    `);

    // Tabla de Errores del Sistema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        error_code TEXT NOT NULL,
        error_message TEXT NOT NULL,
        error_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        module TEXT,
        user_id INTEGER,
        user_name TEXT,
        ip_address TEXT,
        stack_trace TEXT,
        status TEXT DEFAULT 'Abierto',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        resolved_at TEXT,
        resolved_by TEXT,
        resolution_notes TEXT
      )
    `);

    // Tabla de Asignación de Turnos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS shift_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        shift_type TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        date TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Tablas de Módulos Avanzados
    await db.execute(`
      CREATE TABLE IF NOT EXISTS non_pharmacological_treatments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        treatment_type TEXT NOT NULL,
        description TEXT,
        application_date TEXT NOT NULL,
        duration_minutes INTEGER,
        performed_by TEXT,
        outcome TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS patient_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nurse_id INTEGER NOT NULL,
        patient_id INTEGER NOT NULL,
        assignment_date TEXT NOT NULL,
        shift_type TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (nurse_id) REFERENCES users(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS nurse_shift_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nurse_id INTEGER NOT NULL,
        shift_date TEXT NOT NULL,
        shift_type TEXT NOT NULL,
        report_content TEXT NOT NULL,
        pending_items TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (nurse_id) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number TEXT UNIQUE NOT NULL,
        floor INTEGER NOT NULL,
        department TEXT NOT NULL,
        room_type TEXT NOT NULL,
        bed_count INTEGER NOT NULL,
        occupied_beds INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Available',
        equipment TEXT,
        daily_rate REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Órdenes de Alta Médica (NOM-004 Compliance)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS discharge_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        discharge_type TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        follow_up_instructions TEXT,
        medications TEXT,
        restrictions TEXT,
        status TEXT DEFAULT 'active',
        cancellation_reason TEXT,
        discharge_executed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Tabla de Inventario de Medicamentos (NOM-176-SSA1-1998 Compliance)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS medication_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        active_ingredient TEXT,
        presentation TEXT,
        concentration TEXT,
        category TEXT DEFAULT 'ESTANDAR',
        is_controlled INTEGER DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit TEXT DEFAULT 'unidades',
        min_stock INTEGER DEFAULT 10,
        max_stock INTEGER DEFAULT 100,
        unit_price REAL DEFAULT 0,
        supplier TEXT,
        lot_number TEXT,
        expiration_date TEXT,
        location TEXT,
        storage_conditions TEXT,
        last_restocked TEXT,
        last_dispensed TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Registro de Dispensación de Medicamentos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS medication_dispensations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medication_id INTEGER NOT NULL,
        medication_name TEXT NOT NULL,
        patient_id INTEGER NOT NULL,
        patient_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        dispensed_by TEXT NOT NULL,
        doctor_prescription TEXT,
        lot_number TEXT,
        stock_before INTEGER,
        stock_after INTEGER,
        reason TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (medication_id) REFERENCES medication_inventory(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    // Tabla de Tokens de Restablecimiento de Contraseña
    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        license_number TEXT NOT NULL,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        used INTEGER DEFAULT 0,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        used_at TEXT,
        ip_address TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (username) REFERENCES users(username)
      )
    `);

    console.log('✅ All database tables verified/created');
    
    // ============================================================
    // NOM-004-SSA3-2012: PROTECCIÓN DE INTEGRIDAD DEL EXPEDIENTE
    // ============================================================
    console.log('🔒 Creating NOM-004 compliance triggers...');
    
    // Trigger: Impedir eliminación de notas de enfermería
    await db.execute(`
      CREATE TRIGGER IF NOT EXISTS prevent_delete_nurse_notes
      BEFORE DELETE ON nurse_notes
      BEGIN
        SELECT RAISE(ABORT, 'NOM-004 VIOLACIÓN: No se permite eliminar notas de enfermería. El expediente clínico debe mantener su integridad completa para garantizar trazabilidad legal.');
      END
    `);

    // Trigger: Impedir eliminación de signos vitales
    await db.execute(`
      CREATE TRIGGER IF NOT EXISTS prevent_delete_vital_signs
      BEFORE DELETE ON vital_signs
      BEGIN
        SELECT RAISE(ABORT, 'NOM-004 VIOLACIÓN: No se permite eliminar registros de signos vitales. El expediente clínico debe mantener su integridad completa para garantizar trazabilidad legal.');
      END
    `);

    // Trigger: Impedir eliminación de tratamientos
    await db.execute(`
      CREATE TRIGGER IF NOT EXISTS prevent_delete_treatments
      BEFORE DELETE ON treatments
      BEGIN
        SELECT RAISE(ABORT, 'NOM-004 VIOLACIÓN: No se permite eliminar registros de tratamientos. El expediente clínico debe mantener su integridad completa para garantizar trazabilidad legal.');
      END
    `);

    // Trigger: Impedir eliminación de tratamientos no farmacológicos
    await db.execute(`
      CREATE TRIGGER IF NOT EXISTS prevent_delete_non_pharma_treatments
      BEFORE DELETE ON non_pharmacological_treatments
      BEGIN
        SELECT RAISE(ABORT, 'NOM-004 VIOLACIÓN: No se permite eliminar tratamientos no farmacológicos. El expediente clínico debe mantener su integridad completa para garantizar trazabilidad legal.');
      END
    `);

    // Trigger: Impedir eliminación de reportes de turno
    await db.execute(`
      CREATE TRIGGER IF NOT EXISTS prevent_delete_shift_reports
      BEFORE DELETE ON nurse_shift_reports
      BEGIN
        SELECT RAISE(ABORT, 'NOM-004 VIOLACIÓN: No se permite eliminar reportes de turno. El expediente clínico debe mantener su integridad completa para garantizar trazabilidad legal.');
      END
    `);

    console.log('✅ NOM-004 compliance triggers created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw new Error(`Failed to create tables: ${error.message || error}`);
  }
}

// ========== DATA SEEDING (REINICIO FORZADO DE CREDENCIALES) ==========

export async function seedInitialData() {
  console.log('⚡ Running seedInitialData...');

  const targetUser = 'enfermero';
  const targetLicense = 'ENF-12345';
  
  // 1. ELIMINAR USUARIO EXISTENTE (Para asegurar que la contraseña se resetee)
  // Borramos intentos fallidos, bloqueos y el usuario mismo.
  try {
    await db.execute("DELETE FROM login_attempts WHERE username = ?", [targetUser]);
    await db.execute("DELETE FROM account_lockouts WHERE username = ?", [targetUser]);
    await db.execute("DELETE FROM users WHERE username = ? OR license_number = ?", [targetUser, targetLicense]);
    console.log('🧹 Cleaned up old user data (forced reset).');
  } catch (e) {
    console.warn('⚠️ Warning cleaning old user:', e);
  }

  // 2. CREAR USUARIO NUEVO CON CONTRASEÑA CORRECTA
  // Contraseña en texto plano: Enfermero123
  // Hash guardado: hash_Enfermero123
  console.log('👤 Creating fresh Nurse User...');
  await db.execute(`
    INSERT OR IGNORE INTO users (username, password_hash, role, name, email, license_number, assigned_shifts)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    targetUser, 
    'hash_Enfermero123', 
    'nurse', 
    'Enf. Laura Martínez', 
    'laura.martinez@hospital.com', 
    targetLicense, 
    '{"start": "06:00", "end": "22:00", "area": "Piso 3 - Ala Norte"}' 
  ]);

  // Crear usuarios adicionales para pruebas de recuperación
  console.log('👥 Creating additional test users...');
  
  // Verificar si los usuarios adicionales ya existen antes de insertarlos
  const existingUsers = await db.select('SELECT username FROM users WHERE username IN (?, ?)', 
    ['carlos.lopez', 'ana.garcia']);
  
  const existingUsernames = existingUsers.map(u => u.username);
  
  try {
    // Usuario 2: Enfermero de turno noche
    if (!existingUsernames.includes('carlos.lopez')) {
      await db.execute(`
        INSERT OR IGNORE INTO users (username, password_hash, role, name, email, license_number, assigned_shifts)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'carlos.lopez',
        'hash_Enfermero456',
        'nurse',
        'Enf. Carlos López',
        'carlos.lopez@hospital.com',
        'ENF-67890',
        '{"start": "22:00", "end": "06:00", "area": "Piso 2 - Ala Sur"}'
      ]);
      console.log('✅ User carlos.lopez created');
    } else {
      console.log('ℹ️ User carlos.lopez already exists, skipping');
    }

    // Usuario 3: Enfermera de urgencias
    if (!existingUsernames.includes('ana.garcia')) {
      await db.execute(`
        INSERT OR IGNORE INTO users (username, password_hash, role, name, email, license_number, assigned_shifts)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'ana.garcia',
        'hash_Urgencias2024',
        'nurse',
        'Enf. Ana García',
        'ana.garcia@hospital.com',
        'ENF-11223',
        '{"start": "14:00", "end": "22:00", "area": "Urgencias"}'
      ]);
      console.log('✅ User ana.garcia created');
    } else {
      console.log('ℹ️ User ana.garcia already exists, skipping');
    }

    console.log('✅ Additional test users processed successfully');
  } catch (e) {
    console.warn('⚠️ Error creating test users:', e.message);
  }

  // 3. Verificar/Crear Pacientes
  const patients = await db.select("SELECT count(*) as count FROM patients");
  if (patients[0].count === 0) {
      console.log('🌱 Seeding Patients...');
      await db.execute(`INSERT INTO patients (name, age, curp, room, condition, triage_level, admission_date, blood_type, allergies, diagnosis) VALUES ('Juan Pérez', 45, 'PEXJ791015HDFRXN01', '301-A', 'Estable', 'VERDE', '2025-10-20', 'O+', 'Penicilina', 'Neumonía')`);
      await db.execute(`INSERT INTO patients (name, age, curp, room, condition, triage_level, admission_date, blood_type, allergies, diagnosis) VALUES ('María González', 62, 'GOGM620312MDFNRR04', '302-B', 'Crítico', 'ROJO', '2025-10-21', 'A-', 'Ninguna', 'Post-operatorio')`);
      await db.execute(`INSERT INTO patients (name, age, curp, room, condition, triage_level, admission_date, blood_type, allergies, diagnosis) VALUES ('Carlos Ruiz', 28, 'RUCC960523HDFRZR08', '303-A', 'Recuperación', 'AMARILLO', '2025-10-23', 'B+', 'Polen', 'Apendicectomía')`);
  }

  // 4. Verificar/Crear Signos Vitales
  const vitals = await db.select("SELECT count(*) as count FROM vital_signs");
  if (vitals[0].count === 0) {
      console.log('🌱 Seeding Vital Signs...');
      const pList = await db.select("SELECT id FROM patients LIMIT 1");
      const pId = pList.length > 0 ? pList[0].id : 1;
      
      const dates = [
          { d: '24/10 08:00', t: '36.5', bp: '120/80', hr: '72' },
          { d: '24/10 12:00', t: '37.2', bp: '125/82', hr: '78' },
          { d: '24/10 16:00', t: '37.8', bp: '130/85', hr: '85' },
          { d: '24/10 20:00', t: '38.5', bp: '135/88', hr: '92' },
          { d: '25/10 00:00', t: '37.5', bp: '128/82', hr: '80' },
          { d: '25/10 04:00', t: '36.8', bp: '122/80', hr: '74' }
      ];

      for (const v of dates) {
          await db.execute(
              `INSERT INTO vital_signs (patient_id, date, temperature, blood_pressure, heart_rate, respiratory_rate, registered_by)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [pId, v.d, v.t, v.bp, v.hr, '18', 'Sistema']
          );
      }
  }
  
  // 5. Verificar/Crear Asignaciones de Pacientes a Enfermeros
  const assignments = await db.select("SELECT count(*) as count FROM patient_assignments");
  if (assignments[0].count === 0) {
      console.log('🌱 Seeding Patient Assignments...');
      
      // Obtener IDs de enfermeros y pacientes
      const nurses = await db.select("SELECT id, name FROM users WHERE role = 'nurse'");
      const patientsList = await db.select("SELECT id FROM patients");
      
      if (nurses.length > 0 && patientsList.length > 0) {
          const today = new Date().toLocaleDateString('es-MX');
          
          // Asignar pacientes a enfermeros con diferentes turnos
          // Enfermero 1 (Laura) - Turno Matutino - Paciente 1
          if (nurses[0] && patientsList[0]) {
              await db.execute(`
                  INSERT INTO patient_assignments (nurse_id, patient_id, assignment_date, shift_type, status, notes)
                  VALUES (?, ?, ?, 'Matutino', 'Active', 'Piso 3 - Ala Norte')
              `, [nurses[0].id, patientsList[0].id, today]);
          }
          
          // Enfermero 1 (Laura) - Turno Vespertino - Paciente 2
          if (nurses[0] && patientsList[1]) {
              await db.execute(`
                  INSERT INTO patient_assignments (nurse_id, patient_id, assignment_date, shift_type, status, notes)
                  VALUES (?, ?, ?, 'Vespertino', 'Active', 'Piso 3 - Ala Norte')
              `, [nurses[0].id, patientsList[1].id, today]);
          }
          
          // Enfermero 2 (Carlos) - Turno Nocturno - Paciente 2
          if (nurses[1] && patientsList[1]) {
              await db.execute(`
                  INSERT INTO patient_assignments (nurse_id, patient_id, assignment_date, shift_type, status, notes)
                  VALUES (?, ?, ?, 'Nocturno', 'Active', 'Piso 2 - Ala Sur')
              `, [nurses[1].id, patientsList[1].id, today]);
          }
          
          // Enfermero 3 (Ana) - Turno Vespertino - Paciente 3
          if (nurses[2] && patientsList[2]) {
              await db.execute(`
                  INSERT INTO patient_assignments (nurse_id, patient_id, assignment_date, shift_type, status, notes)
                  VALUES (?, ?, ?, 'Vespertino', 'Active', 'Urgencias')
              `, [nurses[2].id, patientsList[2].id, today]);
          }
          
          console.log('✅ Patient assignments created');
      }
  }
  
  // 6. Verificar/Crear Habitaciones
  const rooms = await db.select("SELECT count(*) as count FROM rooms");
  if (rooms[0].count === 0) {
      console.log('🌱 Seeding Rooms...');
      
      // Habitaciones del Piso 3 - Ala Norte
      await db.execute(`
          INSERT INTO rooms (room_number, floor, department, room_type, bed_count, occupied_beds, status, equipment)
          VALUES ('301-A', 3, 'Medicina Interna', 'Individual', 1, 1, 'Occupied', '["Monitor de signos vitales", "Oxígeno"]')
      `);
      
      await db.execute(`
          INSERT INTO rooms (room_number, floor, department, room_type, bed_count, occupied_beds, status, equipment)
          VALUES ('302-B', 3, 'Cirugía', 'Individual', 1, 1, 'Occupied', '["Monitor cardíaco", "Oxígeno", "Bomba de infusión"]')
      `);
      
      await db.execute(`
          INSERT INTO rooms (room_number, floor, department, room_type, bed_count, occupied_beds, status, equipment)
          VALUES ('303-A', 3, 'Post-operatorio', 'Individual', 1, 1, 'Occupied', '["Monitor", "Oxígeno"]')
      `);
      
      // Habitaciones disponibles
      await db.execute(`
          INSERT INTO rooms (room_number, floor, department, room_type, bed_count, occupied_beds, status, equipment)
          VALUES ('304-A', 3, 'Medicina Interna', 'Individual', 1, 0, 'Available', '["Monitor", "Oxígeno"]')
      `);
      
      await db.execute(`
          INSERT INTO rooms (room_number, floor, department, room_type, bed_count, occupied_beds, status, equipment)
          VALUES ('305-B', 3, 'Medicina Interna', 'Compartida', 2, 0, 'Available', '["Monitor", "Oxígeno"]')
      `);
      
      // UCI
      await db.execute(`
          INSERT INTO rooms (room_number, floor, department, room_type, bed_count, occupied_beds, status, equipment)
          VALUES ('401-UCI', 4, 'Cuidados Intensivos', 'UCI', 1, 0, 'Available', '["Ventilador", "Monitor multiparamétrico", "Bomba de infusión", "Desfibrilador"]')
      `);
      
      console.log('✅ Rooms created');
  }
}

// ========== FUNCIONES DE LECTURA (READ) ==========

export async function getUserByCedula(cedula) {
  const db = await initDatabase();
  // Busca por cédula O por nombre de usuario
  const result = await db.select(
    'SELECT * FROM users WHERE license_number = ? OR username = ?', 
    [cedula, cedula]
  );
  return result.length > 0 ? result[0] : null;
}

/**
 * Obtiene pacientes con filtrado opcional por enfermero
 * @param {Object} options - Opciones de filtrado
 * @param {number} options.nurseId - ID del enfermero (si es enfermero)
 * @param {string} options.role - Rol del usuario ('admin', 'nurse', 'patient')
 * @param {string} options.shift - Turno actual ('Matutino', 'Vespertino', 'Nocturno')
 * @returns {Promise<Array>} Lista de pacientes
 */
export async function getPatients(options = {}) {
  const db = await initDatabase();
  
  // Si es admin, ver todos los pacientes
  if (options.role === 'admin') {
    return await db.select('SELECT * FROM patients ORDER BY id DESC');
  }
  
  // Si es enfermero, solo ver pacientes asignados a su turno
  if (options.role === 'nurse' && options.nurseId) {
    const query = `
      SELECT DISTINCT p.* 
      FROM patients p
      INNER JOIN patient_assignments pa ON p.id = pa.patient_id
      WHERE pa.nurse_id = ? 
        AND pa.status = 'Active'
        ${options.shift ? "AND pa.shift_type = ?" : ""}
      ORDER BY p.id DESC
    `;
    
    const params = options.shift 
      ? [options.nurseId, options.shift] 
      : [options.nurseId];
    
    return await db.select(query, params);
  }
  
  // Por defecto, devolver todos
  return await db.select('SELECT * FROM patients ORDER BY id DESC');
}

/**
 * Asigna un paciente a un enfermero para un turno específico
 * @param {number} nurseId - ID del enfermero
 * @param {number} patientId - ID del paciente
 * @param {string} shiftType - Tipo de turno ('Matutino', 'Vespertino', 'Nocturno')
 * @param {string} notes - Notas adicionales
 */
export async function assignPatientToNurse(nurseId, patientId, shiftType, notes = '') {
  const db = await initDatabase();
  const today = new Date().toLocaleDateString('es-MX');
  
  // Verificar si ya existe asignación activa
  const existing = await db.select(
    'SELECT * FROM patient_assignments WHERE nurse_id = ? AND patient_id = ? AND shift_type = ? AND status = "Active"',
    [nurseId, patientId, shiftType]
  );
  
  if (existing.length > 0) {
    console.log('Asignación ya existe');
    return existing[0];
  }
  
  await db.execute(
    `INSERT INTO patient_assignments (nurse_id, patient_id, assignment_date, shift_type, status, notes)
     VALUES (?, ?, ?, ?, 'Active', ?)`,
    [nurseId, patientId, today, shiftType, notes]
  );
  
  console.log(`✅ Paciente ${patientId} asignado a enfermero ${nurseId} para turno ${shiftType}`);
}

/**
 * Obtiene las asignaciones de un enfermero
 * @param {number} nurseId - ID del enfermero
 * @param {string} shiftType - Tipo de turno (opcional)
 */
export async function getNurseAssignments(nurseId, shiftType = null) {
  const db = await initDatabase();
  
  const query = shiftType
    ? 'SELECT pa.*, p.name, p.room, p.condition FROM patient_assignments pa INNER JOIN patients p ON pa.patient_id = p.id WHERE pa.nurse_id = ? AND pa.shift_type = ? AND pa.status = "Active"'
    : 'SELECT pa.*, p.name, p.room, p.condition FROM patient_assignments pa INNER JOIN patients p ON pa.patient_id = p.id WHERE pa.nurse_id = ? AND pa.status = "Active"';
  
  const params = shiftType ? [nurseId, shiftType] : [nurseId];
  
  return await db.select(query, params);
}

/**
 * Obtiene todas las habitaciones
 * @param {string} status - Filtrar por estado (opcional: 'Available', 'Occupied', 'Maintenance')
 */
export async function getRooms(status = null) {
  const db = await initDatabase();
  
  if (status) {
    return await db.select('SELECT * FROM rooms WHERE status = ? ORDER BY floor, room_number', [status]);
  }
  
  return await db.select('SELECT * FROM rooms ORDER BY floor, room_number');
}

/**
 * Verifica si una habitación tiene camas disponibles
 * @param {string} roomNumber - Número de habitación
 * @returns {Promise<Object>} { available: boolean, room: Object, freeSpots: number }
 */
export async function checkRoomAvailability(roomNumber) {
  const db = await initDatabase();
  
  const rooms = await db.select('SELECT * FROM rooms WHERE room_number = ?', [roomNumber]);
  
  if (rooms.length === 0) {
    return { 
      available: false, 
      room: null, 
      freeSpots: 0,
      error: 'Habitación no encontrada' 
    };
  }
  
  const room = rooms[0];
  const freeSpots = room.bed_count - room.occupied_beds;
  
  return {
    available: freeSpots > 0 && room.status === 'Available',
    room: room,
    freeSpots: freeSpots,
    error: null
  };
}

/**
 * Asigna un paciente a una habitación (ocupa una cama)
 * @param {number} patientId - ID del paciente
 * @param {string} roomNumber - Número de habitación
 * @throws {Error} Si la habitación no tiene camas disponibles
 */
export async function assignPatientToRoom(patientId, roomNumber) {
  const db = await initDatabase();
  
  // Verificar disponibilidad
  const availability = await checkRoomAvailability(roomNumber);
  
  if (!availability.available) {
    throw new Error(
      `❌ CAMA NO DISPONIBLE: ${availability.error || 'La habitación ' + roomNumber + ' no tiene camas libres'}. ` +
      `Camas ocupadas: ${availability.room?.occupied_beds || 0}/${availability.room?.bed_count || 0}`
    );
  }
  
  // Actualizar el campo room del paciente
  await db.execute(
    'UPDATE patients SET room = ? WHERE id = ?',
    [roomNumber, patientId]
  );
  
  // Incrementar camas ocupadas
  await db.execute(
    'UPDATE rooms SET occupied_beds = occupied_beds + 1 WHERE room_number = ?',
    [roomNumber]
  );
  
  // Si todas las camas están ocupadas, cambiar estado
  const updatedRoom = await db.select('SELECT * FROM rooms WHERE room_number = ?', [roomNumber]);
  if (updatedRoom[0].occupied_beds >= updatedRoom[0].bed_count) {
    await db.execute(
      'UPDATE rooms SET status = "Occupied" WHERE room_number = ?',
      [roomNumber]
    );
  }
  
  console.log(`✅ Paciente ${patientId} asignado a habitación ${roomNumber}`);
}

/**
 * Libera una cama cuando un paciente es dado de alta o transferido
 * @param {string} roomNumber - Número de habitación
 */
export async function releaseRoomBed(roomNumber) {
  const db = await initDatabase();
  
  const rooms = await db.select('SELECT * FROM rooms WHERE room_number = ?', [roomNumber]);
  
  if (rooms.length === 0) {
    console.warn('⚠️ Habitación no encontrada:', roomNumber);
    return;
  }
  
  // Decrementar camas ocupadas
  await db.execute(
    'UPDATE rooms SET occupied_beds = CASE WHEN occupied_beds > 0 THEN occupied_beds - 1 ELSE 0 END WHERE room_number = ?',
    [roomNumber]
  );
  
  // Si hay camas libres, cambiar estado a Available
  const updatedRoom = await db.select('SELECT * FROM rooms WHERE room_number = ?', [roomNumber]);
  if (updatedRoom[0].occupied_beds < updatedRoom[0].bed_count) {
    await db.execute(
      'UPDATE rooms SET status = "Available" WHERE room_number = ?',
      [roomNumber]
    );
  }
  
  console.log(`✅ Cama liberada en habitación ${roomNumber}`);
}

export async function getVitalSigns() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM vital_signs ORDER BY date ASC');
}

export async function getTreatments() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM treatments ORDER BY id DESC');
}

export async function getNurseNotes() {
  const db = await initDatabase();
  const notes = await db.select('SELECT *, nurse_name as nurseName FROM nurse_notes ORDER BY created_at DESC');
  
  // Agregar información de editabilidad
  const { checkEditTimeLimit } = await import('../utils/editTimeValidation.js');
  
  return notes.map(note => ({
    ...note,
    editStatus: checkEditTimeLimit(note.created_at)
  }));
}

export async function getAppointments() {
    const db = await initDatabase();
    return await db.select('SELECT * FROM appointments ORDER BY date DESC');
}

export async function getLoginAttempts(username) {
    const db = await initDatabase();
    return await db.select(
        `SELECT * FROM login_attempts WHERE username = ? ORDER BY timestamp DESC LIMIT 10`,
        [username]
    );
}

// ========== FUNCIONES DE ESCRITURA (WRITE) ==========

export async function addVitalSignsDB(data) {
    const db = await initDatabase();
    await db.execute(
        `INSERT INTO vital_signs (patient_id, date, temperature, blood_pressure, heart_rate, respiratory_rate, registered_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.patient_id, data.date, data.temperature, data.blood_pressure, data.heart_rate, data.respiratory_rate, data.registered_by]
    );
    return await getVitalSigns();
}

export async function addTreatmentDB(data) {
    const db = await initDatabase();
    await db.execute(
        `INSERT INTO treatments (patient_id, medication, dose, frequency, start_date, applied_by, last_application, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.patientId, data.medication, data.dose, data.frequency, data.startDate, data.appliedBy, data.lastApplication, 'Activo', data.notes]
    );
    return await getTreatments();
}

export async function addNurseNoteDB(data) {
    const db = await initDatabase();
    await db.execute(
        `INSERT INTO nurse_notes (patient_id, date, note, nurse_name, note_type)
         VALUES (?, ?, ?, ?, ?)`,
        [data.patientId, data.date, data.note, data.nurseName, 'Evolución']
    );
    return await getNurseNotes();
}

/**
 * Actualiza una nota de enfermería con validación de tiempo (24h)
 * @param {number} noteId - ID de la nota
 * @param {Object} updateData - Datos a actualizar
 * @throws {Error} Si la nota no es editable por tiempo
 */
export async function updateNurseNote(noteId, updateData) {
  const db = await initDatabase();
  
  // Obtener la nota actual
  const currentNote = await db.select(
    'SELECT * FROM nurse_notes WHERE id = ?',
    [noteId]
  );
  
  if (currentNote.length === 0) {
    throw new Error('❌ Nota no encontrada');
  }
  
  // Validar tiempo de edición
  const { validateEditOperation } = await import('../utils/editTimeValidation.js');
  validateEditOperation(currentNote[0].created_at, 'edit');
  
  // Actualizar nota
  await db.execute(
    `UPDATE nurse_notes 
     SET note = ?, note_type = ?, date = ?
     WHERE id = ?`,
    [
      updateData.note || currentNote[0].note,
      updateData.note_type || currentNote[0].note_type,
      updateData.date || currentNote[0].date,
      noteId
    ]
  );
  
  console.log(`✅ Nota ${noteId} actualizada dentro del período de edición`);
  return await getNurseNotes();
}

/**
 * Elimina una nota de enfermería con validación de tiempo (24h)
 * @param {number} noteId - ID de la nota
 * @throws {Error} Si la nota no es editable por tiempo
 */
export async function deleteNurseNote(noteId) {
  const db = await initDatabase();
  
  // Obtener la nota actual
  const currentNote = await db.select(
    'SELECT * FROM nurse_notes WHERE id = ?',
    [noteId]
  );
  
  if (currentNote.length === 0) {
    throw new Error('❌ Nota no encontrada');
  }
  
  // Validar tiempo de edición
  const { validateEditOperation } = await import('../utils/editTimeValidation.js');
  validateEditOperation(currentNote[0].created_at, 'delete');
  
  // NOTA: Esta función podría estar bloqueada por triggers NOM-004
  // pero permitimos la eliminación dentro de 24h como excepción
  await db.execute(
    'DELETE FROM nurse_notes WHERE id = ?',
    [noteId]
  );
  
  console.log(`✅ Nota ${noteId} eliminada dentro del período de edición`);
  return await getNurseNotes();
}

/**
 * Obtiene una nota específica con estado de editabilidad
 * @param {number} noteId - ID de la nota
 */
export async function getNurseNoteById(noteId) {
  const db = await initDatabase();
  
  const notes = await db.select(
    'SELECT *, nurse_name as nurseName FROM nurse_notes WHERE id = ?',
    [noteId]
  );
  
  if (notes.length === 0) {
    return null;
  }
  
  const { checkEditTimeLimit } = await import('../utils/editTimeValidation.js');
  const note = notes[0];
  
  return {
    ...note,
    editStatus: checkEditTimeLimit(note.created_at)
  };
}

export async function updatePatientDB(id, data) {
    const db = await initDatabase();
    await db.execute(
        `UPDATE patients SET condition = ? WHERE id = ?`,
        [data.condition, id]
    );
    return await getPatients();
}

/**
 * Agrega un nuevo paciente con validación de CURP único
 * @param {Object} patientData - Datos del paciente
 * @param {string} patientData.name - Nombre completo
 * @param {number} patientData.age - Edad
 * @param {string} patientData.curp - CURP (Clave Única de Registro de Población)
 * @param {string} patientData.room - Número de habitación
 * @param {string} patientData.condition - Estado clínico
 * @param {string} patientData.admission_date - Fecha de ingreso
 * @param {string} patientData.blood_type - Tipo de sangre
 * @param {string} patientData.allergies - Alergias (opcional)
 * @param {string} patientData.diagnosis - Diagnóstico (opcional)
 * @throws {Error} Si el CURP ya existe o es inválido
 */
export async function addPatient(patientData) {
  const db = await initDatabase();
  
  // Validar CURP
  const { validateCURP } = await import('../utils/curpValidation.js');
  const curpValidation = validateCURP(patientData.curp);
  
  if (!curpValidation.isValid) {
    throw new Error(
      '❌ CURP INVÁLIDO:\n' + 
      curpValidation.errors.map(e => `  • ${e}`).join('\n')
    );
  }
  
  const curpNormalizado = curpValidation.normalized;
  
  // Verificar si el CURP ya existe
  const existente = await db.select(
    'SELECT id, name FROM patients WHERE curp = ?',
    [curpNormalizado]
  );
  
  if (existente.length > 0) {
    throw new Error(
      `❌ CURP DUPLICADO: El CURP ${curpNormalizado} ya está registrado.\n` +
      `Paciente existente: ${existente[0].name} (ID: ${existente[0].id})\n\n` +
      `No se pueden crear expedientes duplicados. Verifique el CURP ingresado.`
    );
  }
  
  // Insertar paciente
  try {
    await db.execute(
      `INSERT INTO patients (
        name, age, curp, room, condition, admission_date, 
        blood_type, allergies, diagnosis,
        triage_level, triage_evaluated_by, triage_symptoms, triage_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientData.name,
        patientData.age,
        curpNormalizado,
        patientData.room || 'Sin asignar',
        patientData.condition || 'En valoración',
        patientData.admission_date || new Date().toISOString().split('T')[0],
        patientData.blood_type,
        patientData.allergies || '',
        patientData.diagnosis || '',
        patientData.triage_level,
        patientData.triage_evaluated_by || 'Sistema',
        patientData.triage_symptoms || '',
        patientData.triage_timestamp || new Date().toISOString()
      ]
    );
    
    console.log(`✅ Paciente registrado: ${patientData.name} (CURP: ${curpNormalizado}, Triaje: ${patientData.triage_level})`);
    return await getPatients();
  } catch (error) {
    // Capturar error de constraint UNIQUE de SQLite
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error(
        `❌ ERROR DE DUPLICIDAD: El CURP ${curpNormalizado} ya existe en el sistema.\n` +
        `No se pueden registrar pacientes con el mismo CURP.`
      );
    }
    throw error;
  }
}

/**
 * Verifica si un CURP ya está registrado
 * @param {string} curp - CURP a verificar
 * @returns {Promise<Object>} { exists: boolean, patient: Object|null }
 */
export async function checkCURPDuplicate(curp) {
  const db = await initDatabase();
  
  const { validateCURP } = await import('../utils/curpValidation.js');
  const validation = validateCURP(curp);
  
  if (!validation.isValid) {
    return { exists: false, patient: null, error: 'CURP inválido' };
  }
  
  const result = await db.select(
    'SELECT * FROM patients WHERE curp = ?',
    [validation.normalized]
  );
  
  return {
    exists: result.length > 0,
    patient: result.length > 0 ? result[0] : null,
    error: null
  };
}

// ========== FUNCIONES DE SEGURIDAD ==========

export async function recordLoginAttempt(username, success, ipAddress = '') {
    const db = await initDatabase();
    await db.execute(
        `INSERT INTO login_attempts (username, success, ip_address) VALUES (?, ?, ?)`,
        [username, success ? 1 : 0, ipAddress]
    );
    
    // Si falló, verificamos si hay que bloquear
    if (!success) {
        const attempts = await db.select(
            `SELECT COUNT(*) as count FROM login_attempts 
             WHERE username = ? AND success = 0 
             AND timestamp > datetime('now', '-24 hours')`,
            [username]
        );
        
        if (attempts[0].count >= 3) {
            await lockAccount(username);
        }
    }
}

export async function lockAccount(username) {
    const db = await initDatabase();
    const temporaryPassword = Math.random().toString(36).slice(2, 10).toUpperCase();
    
    await db.execute(
        `INSERT OR REPLACE INTO account_lockouts 
         (username, locked_at, locked_until, reason, attempt_count, temporary_password) 
         VALUES (?, datetime('now'), datetime('now', '+24 hours'), 'Tres intentos fallidos', 3, ?)`,
        [username, temporaryPassword]
    );
    
    return temporaryPassword;
}

export async function isAccountLocked(username) {
    const db = await initDatabase();
    const result = await db.select(
        `SELECT * FROM account_lockouts WHERE username = ? AND locked_until > datetime('now')`,
        [username]
    );
    return result.length > 0 ? result[0] : null;
}

export async function unlockAccount(username) {
    const db = await initDatabase();
    await db.execute(
        `DELETE FROM account_lockouts WHERE username = ?`,
        [username]
    );
}

// ========== FUNCIONES DE ERRORES Y TURNOS ==========

export async function reportError(errorData) {
    const db = await initDatabase();
    await db.execute(
        `INSERT INTO system_errors 
         (error_code, error_message, error_type, severity, module, user_id, user_name, ip_address, stack_trace, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Abierto')`,
        [
            errorData.code || 'ERR_UNKNOWN',
            errorData.message || 'Error desconocido',
            errorData.type || 'generic',
            errorData.severity || 'medium',
            errorData.module || 'unknown',
            errorData.userId || null,
            errorData.userName || 'Sistema',
            errorData.ipAddress || '',
            errorData.stackTrace || ''
        ]
    );
}

export async function getSystemErrors(filters = {}) {
    const db = await initDatabase();
    let query = 'SELECT * FROM system_errors WHERE 1=1';
    const params = [];
    // Filtros simples
    if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }
    query += ' ORDER BY created_at DESC';
    if (filters.limit) query += ` LIMIT ${filters.limit}`;
    
    return await db.select(query, params);
}

export async function updateErrorStatus(errorId, status, resolvedBy = '', notes = '') {
    const db = await initDatabase();
    const resolvedAt = status === 'Resuelto' ? new Date().toLocaleString('es-MX') : null;
    await db.execute(
        `UPDATE system_errors 
         SET status = ?, resolved_at = ?, resolved_by = ?, resolution_notes = ? 
         WHERE id = ?`,
        [status, resolvedAt, resolvedBy, notes, errorId]
    );
}

export async function assignShift(userId, username, shiftType, dayOfWeek, startTime, endTime) {
    const db = await initDatabase();
    await db.execute(
        `INSERT INTO shift_assignments 
         (user_id, username, shift_type, day_of_week, start_time, end_time, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [userId, username, shiftType, dayOfWeek, startTime, endTime]
    );
}

export async function getUserShifts(username) {
    const db = await initDatabase();
    return await db.select(
        `SELECT * FROM shift_assignments WHERE username = ? AND is_active = 1`,
        [username]
    );
}

export async function getCurrentShift(username) {
    const db = await initDatabase();
    const now = new Date();
    const dayOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][now.getDay()];
    // Formato HH:MM
    const currentTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    
    const shifts = await db.select(
        `SELECT * FROM shift_assignments 
         WHERE username = ? AND day_of_week = ? AND is_active = 1
         AND start_time <= ? AND end_time >= ?`,
        [username, dayOfWeek, currentTime, currentTime]
    );
    
    return shifts.length > 0 ? shifts[0] : null;
}

// ============================================================
// GESTIÓN DE ÓRDENES DE ALTA MÉDICA (NOM-004 COMPLIANCE)
// ============================================================

/**
 * Crea una nueva orden de alta médica
 */
export async function createDischargeOrder(orderData) {
  const db = await initDatabase();
  const {
    patientId,
    doctorId,
    doctorName,
    dischargeType,
    diagnosis,
    recommendations,
    followUpInstructions,
    medications,
    restrictions
  } = orderData;

  const now = new Date().toISOString();

  try {
    await db.execute(
      `INSERT INTO discharge_orders (
        patient_id,
        doctor_id,
        doctor_name,
        discharge_type,
        diagnosis,
        recommendations,
        follow_up_instructions,
        medications,
        restrictions,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        patientId,
        doctorId,
        doctorName,
        dischargeType,
        diagnosis,
        recommendations || '',
        followUpInstructions || '',
        medications || '',
        restrictions || '',
        now,
        now
      ]
    );

    console.log('✅ Orden de alta médica creada');
    return { success: true, message: 'Orden de alta creada exitosamente' };
  } catch (error) {
    console.error('❌ Error creando orden de alta:', error);
    throw new Error('Error al crear orden de alta médica');
  }
}

/**
 * Obtiene la orden de alta activa de un paciente
 */
export async function getActiveDischargeOrder(patientId) {
  const db = await initDatabase();
  
  try {
    const result = await db.select(
      `SELECT * FROM discharge_orders 
       WHERE patient_id = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [patientId]
    );

    return result && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error obteniendo orden de alta:', error);
    return null;
  }
}

/**
 * Valida si un paciente puede ser dado de alta
 */
export async function validatePatientDischarge(patientId) {
  const order = await getActiveDischargeOrder(patientId);
  
  if (!order) {
    return {
      canDischarge: false,
      hasOrder: false,
      message: '❌ No se puede dar de alta sin orden médica'
    };
  }

  return {
    canDischarge: true,
    hasOrder: true,
    order: order,
    message: '✅ Paciente autorizado para alta médica'
  };
}

/**
 * Completa el proceso de alta del paciente
 */
export async function dischargePatient(patientId) {
  const db = await initDatabase();
  
  // Validar que existe orden de alta
  const validation = await validatePatientDischarge(patientId);
  if (!validation.canDischarge) {
    throw new Error(
      '🚫 ALTA NO AUTORIZADA\n\n' +
      'No se puede dar de alta a este paciente sin una orden médica formal.\n\n' +
      'Requisito: El médico tratante debe emitir una orden de alta antes de cerrar la cuenta.'
    );
  }

  const now = new Date().toISOString();

  try {
    // Actualizar estado de la orden
    await db.execute(
      `UPDATE discharge_orders 
       SET status = 'completed',
           discharge_executed_at = ?,
           updated_at = ?
       WHERE patient_id = ? AND status = 'active'`,
      [now, now, patientId]
    );

    // Liberar la habitación del paciente
    const patient = await db.select('SELECT room FROM patients WHERE id = ?', [patientId]);
    if (patient && patient[0]?.room) {
      await db.execute(
        `UPDATE rooms SET occupied_beds = occupied_beds - 1 WHERE room_number = ?`,
        [patient[0].room]
      );
    }

    // Actualizar estado del paciente
    await db.execute(
      `UPDATE patients 
       SET status = 'discharged',
           room = 'Alta Médica',
           condition = 'Alta'
       WHERE id = ?`,
      [patientId]
    );

    console.log('✅ Alta médica completada');
    return { success: true, message: 'Alta médica completada exitosamente' };
  } catch (error) {
    console.error('❌ Error completando alta:', error);
    throw new Error('Error al completar alta médica');
  }
}

/**
 * Cancela una orden de alta médica
 */
export async function cancelDischargeOrder(patientId, reason) {
  const db = await initDatabase();
  const now = new Date().toISOString();

  try {
    await db.execute(
      `UPDATE discharge_orders 
       SET status = 'cancelled',
           cancellation_reason = ?,
           updated_at = ?
       WHERE patient_id = ? AND status = 'active'`,
      [reason, now, patientId]
    );
    
    console.log(`✅ Orden de alta cancelada para paciente ${patientId}`);
    return { success: true, message: 'Orden de alta cancelada' };
  } catch (error) {
    console.error('❌ Error cancelando orden:', error);
    throw error;
  }
}

// ============================================
// GESTIÓN DE INVENTARIO DE MEDICAMENTOS
// ============================================

/**
 * Obtiene todo el inventario de medicamentos
 */
export async function getMedicationInventory() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM medication_inventory WHERE status = "active" ORDER BY name ASC');
}

/**
 * Busca un medicamento por nombre exacto
 */
export async function findMedicationByName(name) {
  const db = await initDatabase();
  const results = await db.select(
    'SELECT * FROM medication_inventory WHERE name = ? AND status = "active"',
    [name.trim()]
  );
  return results.length > 0 ? results[0] : null;
}

/**
 * Agrega un nuevo medicamento al inventario
 */
export async function addMedicationToInventory(medication) {
  const db = await initDatabase();
  const now = new Date().toISOString();

  try {
    await db.execute(
      `INSERT INTO medication_inventory (
        name, active_ingredient, presentation, concentration, category,
        is_controlled, quantity, unit, min_stock, max_stock, unit_price,
        supplier, lot_number, expiration_date, location, storage_conditions,
        last_restocked, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medication.name,
        medication.active_ingredient || null,
        medication.presentation || null,
        medication.concentration || null,
        medication.category || 'ESTANDAR',
        medication.is_controlled ? 1 : 0,
        medication.quantity || 0,
        medication.unit || 'unidades',
        medication.min_stock || 10,
        medication.max_stock || 100,
        medication.unit_price || 0,
        medication.supplier || null,
        medication.lot_number || null,
        medication.expiration_date || null,
        medication.location || 'Farmacia Principal',
        medication.storage_conditions || 'Temperatura ambiente',
        now,
        now,
        now
      ]
    );
    
    console.log(`✅ Medicamento agregado al inventario: ${medication.name}`);
    return await getMedicationInventory();
  } catch (error) {
    console.error('❌ Error agregando medicamento:', error);
    throw error;
  }
}

/**
 * Actualiza el stock de un medicamento
 */
export async function updateMedicationStock(medicationId, newQuantity) {
  const db = await initDatabase();
  const now = new Date().toISOString();

  try {
    await db.execute(
      `UPDATE medication_inventory 
       SET quantity = ?, 
           last_restocked = ?,
           updated_at = ?
       WHERE id = ?`,
      [newQuantity, now, now, medicationId]
    );
    
    console.log(`✅ Stock actualizado para medicamento ${medicationId}: ${newQuantity} unidades`);
  } catch (error) {
    console.error('❌ Error actualizando stock:', error);
    throw error;
  }
}

/**
 * Dispensa un medicamento y reduce el stock
 * @throws {Error} Si no hay suficiente stock
 */
export async function dispenseMedication(dispensation) {
  const db = await initDatabase();
  const now = new Date().toISOString();

  try {
    // Buscar medicamento por nombre
    const medication = await findMedicationByName(dispensation.medicationName);
    
    if (!medication) {
      throw new Error(
        `❌ MEDICAMENTO NO ENCONTRADO\n\n` +
        `El medicamento "${dispensation.medicationName}" no existe en el inventario.\n\n` +
        `⚠️ Verifique el nombre o regístrelo primero en el sistema.`
      );
    }

    // Validar stock disponible
    const { validateStockAvailability } = await import('../utils/medicationStockValidation.js');
    const validation = validateStockAvailability(
      dispensation.medicationName,
      dispensation.quantity,
      medication.quantity
    );

    // Calcular nuevo stock
    const newStock = medication.quantity - dispensation.quantity;

    // Actualizar stock en inventario
    await db.execute(
      `UPDATE medication_inventory 
       SET quantity = ?,
           last_dispensed = ?,
           updated_at = ?
       WHERE id = ?`,
      [newStock, now, now, medication.id]
    );

    // Registrar dispensación para auditoría
    await db.execute(
      `INSERT INTO medication_dispensations (
        medication_id, medication_name, patient_id, patient_name,
        quantity, dispensed_by, doctor_prescription, lot_number,
        stock_before, stock_after, reason, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medication.id,
        medication.name,
        dispensation.patientId,
        dispensation.patientName || 'N/A',
        dispensation.quantity,
        dispensation.dispensedBy,
        dispensation.doctorPrescription || null,
        medication.lot_number,
        medication.quantity,
        newStock,
        dispensation.reason || 'Tratamiento médico',
        now
      ]
    );

    console.log(
      `✅ Medicamento dispensado: ${medication.name}\n` +
      `   Cantidad: ${dispensation.quantity}\n` +
      `   Stock anterior: ${medication.quantity}\n` +
      `   Stock actual: ${newStock}`
    );

    // Devolver advertencia si el stock quedó bajo
    return {
      success: true,
      newStock,
      warning: validation.warning,
      stockLevel: validation.stockLevel
    };
  } catch (error) {
    console.error('❌ Error dispensando medicamento:', error);
    throw error;
  }
}

/**
 * Obtiene historial de dispensaciones
 */
export async function getDispensationHistory(filters = {}) {
  const db = await initDatabase();
  
  let query = 'SELECT * FROM medication_dispensations WHERE 1=1';
  const params = [];

  if (filters.medicationId) {
    query += ' AND medication_id = ?';
    params.push(filters.medicationId);
  }

  if (filters.patientId) {
    query += ' AND patient_id = ?';
    params.push(filters.patientId);
  }

  if (filters.startDate) {
    query += ' AND date(created_at) >= date(?)';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND date(created_at) <= date(?)';
    params.push(filters.endDate);
  }

  query += ' ORDER BY created_at DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  return await db.select(query, params);
}

/**
 * Obtiene medicamentos con stock bajo o crítico
 */
export async function getLowStockMedications() {
  const db = await initDatabase();
  return await db.select(
    `SELECT * FROM medication_inventory 
     WHERE status = 'active' AND quantity <= min_stock 
     ORDER BY quantity ASC`
  );
}

/**
 * Obtiene medicamentos próximos a vencer (30 días)
 */
export async function getMedicationsNearExpiration(daysThreshold = 30) {
  const db = await initDatabase();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysThreshold);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  return await db.select(
    `SELECT * FROM medication_inventory 
     WHERE status = 'active' 
     AND expiration_date IS NOT NULL 
     AND expiration_date <= ?
     AND expiration_date >= date('now')
     ORDER BY expiration_date ASC`,
    [futureDateStr]
  );
}

/**
 * Obtiene todas las órdenes de alta de un paciente
 */
export async function getDischargeHistory(patientId) {
  const db = await initDatabase();
  
  try {
    return await db.select(
      `SELECT * FROM discharge_orders 
       WHERE patient_id = ?
       ORDER BY created_at DESC`,
      [patientId]
    );
  } catch (error) {
    console.error('Error obteniendo historial de altas:', error);
    return [];
  }
}

// ============================================
// FUNCIONES DE SEGURIDAD - RESTABLECIMIENTO DE CONTRASEÑA
// ============================================

/**
 * Genera un token aleatorio seguro
 */
function generateSecureToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token + Date.now().toString(36);
}

/**
 * Crea un token de restablecimiento de contraseña
 * Requiere validación de cédula profesional
 */
export async function createPasswordResetToken(licenseNumber, ipAddress = null) {
  const db = await initDatabase();
  
  try {
    // Verificar que la cédula profesional existe
    const users = await db.select(
      `SELECT id, username, email, license_number, name 
       FROM users 
       WHERE license_number = ?`,
      [licenseNumber]
    );
    
    if (!users || users.length === 0) {
      throw new Error('ERR-03: Cédula profesional no encontrada en el sistema');
    }
    
    const user = users[0];
    
    // Verificar que el usuario tiene un email asociado
    if (!user.email) {
      throw new Error(
        'Este usuario no tiene un correo electrónico registrado.\n' +
        'Por favor contacte al administrador del sistema.'
      );
    }
    
    // Invalidar tokens anteriores del mismo usuario (seguridad)
    await db.execute(
      `UPDATE password_reset_tokens 
       SET used = 1 
       WHERE user_id = ? AND used = 0`,
      [user.id]
    );
    
    // Generar nuevo token
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora
    
    // Guardar token
    await db.execute(
      `INSERT INTO password_reset_tokens (
        user_id, username, license_number, email, token, 
        expires_at, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.username,
        user.license_number,
        user.email,
        token,
        expiresAt.toISOString(),
        ipAddress,
        new Date().toISOString()
      ]
    );
    
    console.log(`🔐 Token de recuperación generado para: ${user.username}`);
    
    return {
      success: true,
      token,
      email: user.email,
      username: user.username,
      name: user.name,
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('❌ Error creando token de recuperación:', error);
    throw error;
  }
}

/**
 * Valida un token de restablecimiento
 */
export async function validatePasswordResetToken(token) {
  const db = await initDatabase();
  
  try {
    const tokens = await db.select(
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? AND used = 0`,
      [token]
    );
    
    if (!tokens || tokens.length === 0) {
      throw new Error('Token inválido o ya fue utilizado');
    }
    
    const tokenData = tokens[0];
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    // Verificar expiración
    if (now > expiresAt) {
      throw new Error('El token ha expirado. Por favor solicite uno nuevo.');
    }
    
    return {
      valid: true,
      userId: tokenData.user_id,
      username: tokenData.username,
      email: tokenData.email
    };
  } catch (error) {
    console.error('❌ Error validando token:', error);
    throw error;
  }
}

/**
 * Restablece la contraseña usando un token válido
 */
export async function resetPasswordWithToken(token, newPassword) {
  const db = await initDatabase();
  
  try {
    // Validar token
    const validation = await validatePasswordResetToken(token);
    
    if (!validation.valid) {
      throw new Error('Token inválido');
    }
    
    // Hash de la nueva contraseña (simulado - en producción usar bcrypt)
    const passwordHash = btoa(newPassword); // Usar bcrypt en producción
    
    // Actualizar contraseña
    await db.execute(
      `UPDATE users 
       SET password_hash = ? 
       WHERE id = ?`,
      [passwordHash, validation.userId]
    );
    
    // Marcar token como usado
    await db.execute(
      `UPDATE password_reset_tokens 
       SET used = 1, used_at = ? 
       WHERE token = ?`,
      [new Date().toISOString(), token]
    );
    
    console.log(`✅ Contraseña restablecida para usuario: ${validation.username}`);
    
    return {
      success: true,
      message: 'Contraseña actualizada correctamente'
    };
  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error);
    throw error;
  }
}

/**
 * Limpia tokens expirados (mantenimiento)
 */
export async function cleanExpiredTokens() {
  const db = await initDatabase();
  
  try {
    const now = new Date().toISOString();
    
    const result = await db.execute(
      `DELETE FROM password_reset_tokens 
       WHERE expires_at < ? OR used = 1`,
      [now]
    );
    
    console.log(`🧹 Tokens de recuperación limpiados`);
    return { success: true };
  } catch (error) {
    console.error('Error limpiando tokens:', error);
    return { success: false };
  }
}

/**
 * Obtiene todas las órdenes de alta activas
 */
export async function getAllActiveDischargeOrders() {
  const db = await initDatabase();
  
  try {
    return await db.select(
      `SELECT do.*, p.name as patient_name, p.room 
       FROM discharge_orders do
       JOIN patients p ON do.patient_id = p.id
       WHERE do.status = 'active'
       ORDER BY do.created_at DESC`
    );
  } catch (error) {
    console.error('Error obteniendo órdenes de alta:', error);
    return [];
  }
}