#!/bin/bash

# Script de Prueba: Unicidad de Pacientes por CURP
# Valida que no se puedan crear expedientes duplicados

echo "🏥 PRUEBA DE UNICIDAD DE PACIENTES (CURP)"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo "1️⃣ VERIFICAR ESTRUCTURA DE TABLA PATIENTS CON CURP"
echo "---------------------------------------------------"

run_test "Tabla patients existe" \
    "SELECT name FROM sqlite_master WHERE type='table' AND name='patients';" \
    "patients"

run_test "Columna CURP existe" \
    "PRAGMA table_info(patients);" \
    "curp"

# Verificar que CURP sea UNIQUE
curp_unique=$(sqlite3 "$DB_PATH" "SELECT sql FROM sqlite_master WHERE type='table' AND name='patients';" | grep -i "curp.*UNIQUE")

if [ -n "$curp_unique" ]; then
    echo -e "${GREEN}✅ PASS${NC}: CURP tiene restricción UNIQUE"
    ((passed++))
else
    echo -e "${RED}❌ FAIL${NC}: CURP no tiene restricción UNIQUE"
    ((failed++))
fi

echo ""
echo "2️⃣ VERIFICAR DATOS EXISTENTES"
echo "---------------------------------------------------"

# Contar pacientes
total_patients=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM patients;")
echo "Total de pacientes: $total_patients"

echo ""
echo "Pacientes con CURP:"
echo "ID | Nombre | CURP | Edad"
echo "---|--------|------|-----"
sqlite3 "$DB_PATH" "
    SELECT 
        id || ' | ' || 
        name || ' | ' || 
        curp || ' | ' ||
        age
    FROM patients 
    ORDER BY id;
"

echo ""
run_test "Todos los pacientes tienen CURP" \
    "SELECT COUNT(*) FROM patients WHERE curp IS NULL OR curp = '';" \
    "0"

run_test "Todos los CURP tienen 18 caracteres" \
    "SELECT COUNT(*) FROM patients WHERE LENGTH(curp) != 18;" \
    "0"

run_test "No hay CURPs duplicados" \
    "SELECT COUNT(*) FROM (SELECT curp, COUNT(*) as cnt FROM patients GROUP BY curp HAVING cnt > 1);" \
    "0"

echo ""
echo "3️⃣ PRUEBA DE FORMATO DE CURP"
echo "---------------------------------------------------"

# Verificar formato de CURPs existentes
echo "Validando formato de CURPs en la BD:"

while IFS='|' read -r id name curp; do
    # Verificar que empiece con 4 letras
    if [[ $curp =~ ^[A-Z]{4} ]]; then
        echo -e "  ${GREEN}✓${NC} $name: $curp"
    else
        echo -e "  ${RED}✗${NC} $name: $curp (formato inválido)"
    fi
done < <(sqlite3 "$DB_PATH" "SELECT id, name, curp FROM patients;" | tr '|' '|')

echo ""
echo "4️⃣ PRUEBA DE DUPLICIDAD (Simulación)"
echo "---------------------------------------------------"

# Obtener un CURP existente
existing_curp=$(sqlite3 "$DB_PATH" "SELECT curp FROM patients LIMIT 1;")
echo "CURP de prueba: $existing_curp"

# Intentar insertar duplicado
echo ""
echo "Intentando insertar paciente con CURP duplicado..."

duplicate_error=$(sqlite3 "$DB_PATH" "
    INSERT INTO patients (name, age, curp, room, condition, admission_date, blood_type) 
    VALUES ('Paciente Duplicado', 30, '$existing_curp', '999-Z', 'Estable', '2026-01-06', 'O+');
" 2>&1)

if echo "$duplicate_error" | grep -q "UNIQUE constraint failed"; then
    echo -e "${GREEN}✅ PASS${NC}: Base de datos rechazó CURP duplicado"
    echo "   Error: $duplicate_error"
    ((passed++))
else
    echo -e "${RED}❌ FAIL${NC}: Base de datos permitió CURP duplicado"
    # Limpiar si se insertó
    sqlite3 "$DB_PATH" "DELETE FROM patients WHERE name='Paciente Duplicado';" 2>/dev/null
    ((failed++))
fi

echo ""
echo "5️⃣ VALIDACIÓN DE CURPS EXISTENTES"
echo "---------------------------------------------------"

# Validar CURPs de pacientes de prueba
echo "Validando CURPs específicos:"

curp1="PEXJ791015HDFRXN01"
curp2="GOGM620312MDFNRR04"
curp3="RUCC960523HDFRZR08"

for curp in "$curp1" "$curp2" "$curp3"; do
    patient_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM patients WHERE curp='$curp';")
    if [ "$patient_count" -eq "1" ]; then
        patient_name=$(sqlite3 "$DB_PATH" "SELECT name FROM patients WHERE curp='$curp';")
        echo -e "  ${GREEN}✓${NC} $curp → $patient_name"
    elif [ "$patient_count" -gt "1" ]; then
        echo -e "  ${RED}✗${NC} $curp → DUPLICADO ($patient_count veces)"
    else
        echo -e "  ${YELLOW}⚠${NC} $curp → No encontrado"
    fi
done

echo ""
echo "6️⃣ PRUEBA DE CASE SENSITIVITY"
echo "---------------------------------------------------"

# Verificar que CURP sea case-insensitive (todos en mayúsculas)
lowercase_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM patients WHERE curp != UPPER(curp);")

if [ "$lowercase_count" -eq "0" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Todos los CURPs están en mayúsculas"
    ((passed++))
else
    echo -e "${RED}❌ FAIL${NC}: Hay $lowercase_count CURPs en minúsculas"
    ((failed++))
fi

echo ""
echo "7️⃣ INFORMACIÓN EXTRAÍDA DE CURPS"
echo "---------------------------------------------------"

echo "Extrayendo información de CURPs registrados:"
echo ""

while IFS='|' read -r name curp age; do
    # Extraer fecha de nacimiento del CURP (posiciones 5-10: AAMMDD)
    year=${curp:4:2}
    month=${curp:6:2}
    day=${curp:8:2}
    
    # Convertir año (asumiendo 1900-2099)
    if [ "$year" -le "26" ]; then
        full_year=$((2000 + year))
    else
        full_year=$((1900 + year))
    fi
    
    # Extraer sexo (posición 11: H/M)
    sex_code=${curp:10:1}
    if [ "$sex_code" == "H" ]; then
        sex="Masculino"
    else
        sex="Femenino"
    fi
    
    # Extraer estado (posiciones 12-13)
    state=${curp:11:2}
    
    echo -e "${BLUE}$name${NC}"
    echo "  CURP: $curp"
    echo "  Nacimiento: $day/$month/$full_year"
    echo "  Edad registrada: $age años"
    echo "  Sexo: $sex"
    echo "  Estado: $state"
    echo ""
done < <(sqlite3 "$DB_PATH" "SELECT name, curp, age FROM patients;")

echo ""
echo "8️⃣ ESTADÍSTICAS DE CURP"
echo "---------------------------------------------------"

total_curps=$(sqlite3 "$DB_PATH" "SELECT COUNT(DISTINCT curp) FROM patients;")
total_patients=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM patients;")

echo "Total de pacientes: $total_patients"
echo "CURPs únicos: $total_curps"

if [ "$total_curps" -eq "$total_patients" ]; then
    echo -e "${GREEN}✅ Todos los pacientes tienen CURP único${NC}"
else
    echo -e "${RED}❌ Hay CURPs duplicados: $(($total_patients - $total_curps)) duplicados${NC}"
fi

echo ""
echo "9️⃣ VERIFICAR ÍNDICE UNIQUE"
echo "---------------------------------------------------"

# Verificar si hay índice en CURP
index_info=$(sqlite3 "$DB_PATH" "PRAGMA index_list(patients);" | grep -i curp)

if [ -n "$index_info" ]; then
    echo -e "${GREEN}✅ Hay índice en columna CURP${NC}"
    echo "$index_info"
else
    echo -e "${YELLOW}⚠️  No hay índice explícito en CURP (constraint inline)${NC}"
fi

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
    echo "✅ Campo CURP está configurado como UNIQUE"
    echo "✅ No hay CURPs duplicados en la base de datos"
    echo "✅ Todos los CURPs tienen formato correcto (18 caracteres)"
    echo "✅ La base de datos rechaza intentos de duplicar CURPs"
    echo ""
    echo "🔒 PROTECCIÓN IMPLEMENTADA:"
    echo "   - No se pueden crear expedientes duplicados"
    echo "   - CURP garantiza unicidad de cada paciente"
    echo "   - Constraint UNIQUE a nivel de base de datos"
    echo "   - Validación de formato en el código"
    exit 0
else
    echo -e "${YELLOW}⚠️  Algunas pruebas fallaron. Revisar la implementación.${NC}"
    exit 1
fi
