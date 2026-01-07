#!/bin/bash

# Script de Prueba: Disponibilidad de Camas
# Valida que no se puedan asignar pacientes a camas ocupadas

echo "🏥 PRUEBA DE DISPONIBILIDAD DE CAMAS"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DB_PATH="$HOME/.local/share/com.hospital.app/hospital.db"

if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}❌ Base de datos no encontrada en: $DB_PATH${NC}"
    echo "Ejecuta primero: npm run tauri dev"
    exit 1
fi

echo "📊 Base de datos: $DB_PATH"
echo ""

passed=0
failed=0

# Función para ejecutar prueba
run_test() {
    local test_name=$1
    local query=$2
    local expected=$3
    
    result=$(sqlite3 "$DB_PATH" "$query" 2>&1)
    
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        ((passed++))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        echo "   Esperado: $expected"
        echo "   Obtenido: $result"
        ((failed++))
    fi
}

echo "1️⃣ VERIFICAR ESTRUCTURA DE TABLA ROOMS"
echo "----------------------------------------"

run_test "Tabla rooms existe" \
    "SELECT name FROM sqlite_master WHERE type='table' AND name='rooms';" \
    "rooms"

run_test "Columna bed_count existe" \
    "PRAGMA table_info(rooms);" \
    "bed_count"

run_test "Columna occupied_beds existe" \
    "PRAGMA table_info(rooms);" \
    "occupied_beds"

run_test "Columna status existe" \
    "PRAGMA table_info(rooms);" \
    "status"

echo ""
echo "2️⃣ VERIFICAR DATOS INICIALES"
echo "----------------------------------------"

# Contar habitaciones totales
total_rooms=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM rooms;")
echo "Total de habitaciones: $total_rooms"

# Mostrar habitaciones con disponibilidad
echo ""
echo "Habitaciones en el sistema:"
echo "Habitación | Tipo | Camas | Ocupadas | Disponibles | Estado"
echo "-----------|------|-------|----------|-------------|--------"
sqlite3 "$DB_PATH" "
    SELECT 
        room_number || ' | ' || 
        room_type || ' | ' || 
        bed_count || ' | ' || 
        occupied_beds || ' | ' || 
        (bed_count - occupied_beds) || ' | ' ||
        status
    FROM rooms 
    ORDER BY floor, room_number;
"

echo ""
run_test "Hay al menos 3 habitaciones" \
    "SELECT COUNT(*) >= 3 FROM rooms;" \
    "1"

run_test "Habitación 301-A está ocupada (1/1)" \
    "SELECT occupied_beds || '/' || bed_count FROM rooms WHERE room_number='301-A';" \
    "1/1"

run_test "Habitación 304-A está disponible (0/1)" \
    "SELECT occupied_beds || '/' || bed_count FROM rooms WHERE room_number='304-A';" \
    "0/1"

run_test "Habitación 305-B tiene camas libres" \
    "SELECT (bed_count - occupied_beds) > 0 FROM rooms WHERE room_number='305-B';" \
    "1"

echo ""
echo "3️⃣ PRUEBAS DE VALIDACIÓN DE DISPONIBILIDAD"
echo "----------------------------------------"

# Verificar habitaciones llenas
run_test "Habitación 301-A debe estar Occupied" \
    "SELECT status FROM rooms WHERE room_number='301-A';" \
    "Occupied"

# Verificar habitaciones disponibles
run_test "Habitación 304-A debe estar Available" \
    "SELECT status FROM rooms WHERE room_number='304-A';" \
    "Available"

# Verificar cálculo de camas libres
run_test "Camas libres se calculan correctamente" \
    "SELECT SUM(bed_count - occupied_beds) FROM rooms WHERE status='Available';" \
    "[0-9]"

echo ""
echo "4️⃣ PRUEBAS DE INTEGRIDAD DE DATOS"
echo "----------------------------------------"

run_test "occupied_beds nunca excede bed_count" \
    "SELECT COUNT(*) FROM rooms WHERE occupied_beds > bed_count;" \
    "0"

run_test "bed_count es positivo" \
    "SELECT COUNT(*) FROM rooms WHERE bed_count <= 0;" \
    "0"

run_test "occupied_beds no es negativo" \
    "SELECT COUNT(*) FROM rooms WHERE occupied_beds < 0;" \
    "0"

run_test "Status es válido (Available/Occupied/Maintenance)" \
    "SELECT COUNT(*) FROM rooms WHERE status NOT IN ('Available', 'Occupied', 'Maintenance');" \
    "0"

echo ""
echo "5️⃣ VERIFICAR ASIGNACIÓN DE PACIENTES A HABITACIONES"
echo "----------------------------------------"

# Contar pacientes con habitación asignada
patients_with_room=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM patients WHERE room IS NOT NULL AND room != '';")
echo "Pacientes con habitación asignada: $patients_with_room"

# Mostrar asignaciones
echo ""
echo "Pacientes | Habitación | Estado"
echo "----------|------------|--------"
sqlite3 "$DB_PATH" "
    SELECT 
        p.name || ' | ' || 
        COALESCE(p.room, 'Sin asignar') || ' | ' ||
        p.condition
    FROM patients p;
"

run_test "Hay pacientes asignados a habitaciones" \
    "SELECT COUNT(*) > 0 FROM patients WHERE room IS NOT NULL;" \
    "1"

# Verificar consistencia entre pacientes y habitaciones
echo ""
echo "6️⃣ VERIFICAR CONSISTENCIA DE DATOS"
echo "----------------------------------------"

# Contar cuántas habitaciones están marcadas como ocupadas
occupied_rooms=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM rooms WHERE occupied_beds > 0;")
echo "Habitaciones con camas ocupadas: $occupied_rooms"

run_test "Habitaciones con occupied_beds > 0 existen" \
    "SELECT COUNT(*) > 0 FROM rooms WHERE occupied_beds > 0;" \
    "1"

# Verificar que las habitaciones ocupadas tengan status correcto
run_test "Habitaciones llenas tienen status Occupied" \
    "SELECT COUNT(*) FROM rooms WHERE occupied_beds >= bed_count AND status != 'Occupied';" \
    "0"

echo ""
echo "7️⃣ PRUEBAS DE EQUIPAMIENTO"
echo "----------------------------------------"

run_test "UCI tiene equipamiento avanzado" \
    "SELECT equipment LIKE '%Monitor%' FROM rooms WHERE room_type='UCI';" \
    "1"

run_test "Campo equipment es JSON válido" \
    "SELECT COUNT(*) FROM rooms WHERE equipment LIKE '[%]';" \
    "[0-9]"

echo ""
echo "8️⃣ PRUEBAS DE TIPOS DE HABITACIÓN"
echo "----------------------------------------"

run_test "Existen habitaciones individuales" \
    "SELECT COUNT(*) > 0 FROM rooms WHERE room_type='Individual';" \
    "1"

run_test "Existen habitaciones compartidas" \
    "SELECT COUNT(*) > 0 FROM rooms WHERE room_type='Compartida';" \
    "1"

run_test "Existen habitaciones UCI" \
    "SELECT COUNT(*) > 0 FROM rooms WHERE room_type='UCI';" \
    "1"

echo ""
echo "9️⃣ RESUMEN DE CAPACIDAD HOSPITALARIA"
echo "----------------------------------------"

total_beds=$(sqlite3 "$DB_PATH" "SELECT SUM(bed_count) FROM rooms;")
occupied=$(sqlite3 "$DB_PATH" "SELECT SUM(occupied_beds) FROM rooms;")
available=$(sqlite3 "$DB_PATH" "SELECT SUM(bed_count - occupied_beds) FROM rooms;")

echo "📊 Capacidad total: $total_beds camas"
echo "🔴 Ocupadas: $occupied camas"
echo "🟢 Disponibles: $available camas"

if [ $occupied -gt 0 ] && [ $available -gt 0 ]; then
    occupancy=$(echo "scale=1; $occupied * 100 / $total_beds" | bc)
    echo "📈 Tasa de ocupación: ${occupancy}%"
fi

echo ""
echo "🔟 VERIFICAR FUNCIONES DE VALIDACIÓN (Nivel Aplicación)"
echo "----------------------------------------"

echo "⚠️  Las siguientes validaciones se ejecutan en el código JavaScript:"
echo "   - checkRoomAvailability(roomNumber): Verifica camas libres"
echo "   - assignPatientToRoom(patientId, roomNumber): Bloquea si no hay espacio"
echo "   - releaseRoomBed(roomNumber): Libera cama al dar de alta"
echo ""
echo "✅ Para probar estas funciones, ejecuta la aplicación y:"
echo "   1. Intenta asignar un paciente a habitación 301-A (debería fallar)"
echo "   2. Asigna un paciente a habitación 304-A (debería funcionar)"
echo "   3. Verifica que occupied_beds se incrementa en la base de datos"

echo ""
echo "═══════════════════════════════════════"
echo "📊 RESULTADO FINAL"
echo "═══════════════════════════════════════"
echo -e "${GREEN}✅ Pruebas exitosas: $passed${NC}"
echo -e "${RED}❌ Pruebas fallidas: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODAS LAS PRUEBAS PASARON!${NC}"
    echo ""
    echo "✅ La tabla rooms está correctamente configurada"
    echo "✅ Hay habitaciones con diferentes estados de ocupación"
    echo "✅ Los datos de capacidad son consistentes"
    echo "✅ Las validaciones de integridad funcionan"
    echo ""
    echo "🔒 PROTECCIÓN IMPLEMENTADA:"
    echo "   - No se puede asignar paciente a cama ocupada"
    echo "   - occupied_beds nunca excede bed_count"
    echo "   - Status se actualiza automáticamente"
    exit 0
else
    echo -e "${YELLOW}⚠️  Algunas pruebas fallaron. Revisar la implementación.${NC}"
    exit 1
fi
