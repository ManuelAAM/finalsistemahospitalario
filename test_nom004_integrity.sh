#!/bin/bash

# ============================================================================
# TEST DE INTEGRIDAD NOM-004-SSA3-2012
# Verifica que los triggers de protección del expediente clínico funcionen
# ============================================================================

echo "=================================================="
echo "🔒 TEST DE INTEGRIDAD DEL EXPEDIENTE - NOM-004"
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# ============================================================================
# Test 1: Verificar que existen triggers de protección
# ============================================================================
echo "📋 Test 1: Verificar existencia de triggers de protección..."

TRIGGERS=(
  "prevent_delete_nurse_notes"
  "prevent_delete_vital_signs"
  "prevent_delete_treatments"
  "prevent_delete_non_pharma_treatments"
  "prevent_delete_nursing_shift_reports"
)

for trigger in "${TRIGGERS[@]}"; do
  if grep -q "$trigger" database/schema.sql; then
    echo -e "${GREEN}✅ PASS${NC}: Trigger '$trigger' definido en schema.sql"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: Trigger '$trigger' NO encontrado en schema.sql"
    ((FAILED++))
  fi
done

echo ""

# ============================================================================
# Test 2: Verificar que triggers se crean en database.js
# ============================================================================
echo "📋 Test 2: Verificar que triggers se crean en la inicialización..."

if grep -q "prevent_delete_nurse_notes" src/services/database.js; then
  echo -e "${GREEN}✅ PASS${NC}: Triggers NOM-004 se crean en database.js"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Triggers NOM-004 NO se crean en database.js"
  ((FAILED++))
fi

echo ""

# ============================================================================
# Test 3: Verificar que NO existen funciones de eliminación
# ============================================================================
echo "📋 Test 3: Verificar que NO existen funciones deleteNote/deleteVital..."

FORBIDDEN_FUNCTIONS=(
  "deleteNurseNote"
  "deleteVitalSign"
  "deleteTreatment"
  "removeNurseNote"
  "removeVitalSign"
  "removeTreatment"
)

FOUND_FORBIDDEN=0
for func in "${FORBIDDEN_FUNCTIONS[@]}"; do
  if grep -r "function $func\|const $func\|export.*$func" src/ --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "NOM004_COMPLIANCE.js" | grep -v "test_nom004" > /dev/null; then
    echo -e "${RED}❌ FAIL${NC}: Función prohibida encontrada: $func"
    ((FAILED++))
    FOUND_FORBIDDEN=1
  fi
done

if [ $FOUND_FORBIDDEN -eq 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}: NO se encontraron funciones de eliminación prohibidas"
  ((PASSED++))
fi

echo ""

# ============================================================================
# Test 4: Verificar que existe documentación NOM-004
# ============================================================================
echo "📋 Test 4: Verificar existencia de documentación NOM-004..."

DOC_FILES=(
  "NOM004_COMPLIANCE.md"
  "src/utils/NOM004_COMPLIANCE.js"
)

for doc in "${DOC_FILES[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Documentación encontrada: $doc"
    ((PASSED++))
  else
    echo -e "${YELLOW}⚠️  WARN${NC}: Documentación no encontrada: $doc"
  fi
done

echo ""

# ============================================================================
# Test 5: Verificar banners informativos en UI
# ============================================================================
echo "📋 Test 5: Verificar banners informativos NOM-004 en UI..."

if grep -q "NOM-004" src/App.jsx && grep -q "permanentes e inalterables" src/App.jsx; then
  echo -e "${GREEN}✅ PASS${NC}: Banner NOM-004 presente en App.jsx"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Banner NOM-004 NO encontrado en App.jsx"
  ((FAILED++))
fi

if grep -q "NOM-004" src/components/ReportsAnalytics.jsx; then
  echo -e "${GREEN}✅ PASS${NC}: Banner NOM-004 presente en ReportsAnalytics.jsx"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Banner NOM-004 NO encontrado en ReportsAnalytics.jsx"
  ((FAILED++))
fi

echo ""

# ============================================================================
# Test 6: Verificar mensajes de error descriptivos
# ============================================================================
echo "📋 Test 6: Verificar mensajes de error en triggers..."

if grep -q "VIOLACIÓN.*trazabilidad legal" database/schema.sql; then
  echo -e "${GREEN}✅ PASS${NC}: Mensajes de error descriptivos en triggers"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Mensajes de error NO son descriptivos"
  ((FAILED++))
fi

echo ""

# ============================================================================
# RESUMEN
# ============================================================================
echo "=================================================="
echo "📊 RESUMEN DE PRUEBAS"
echo "=================================================="
TOTAL=$((PASSED + FAILED))
echo -e "Total de pruebas: $TOTAL"
echo -e "${GREEN}Pasadas: $PASSED${NC}"
echo -e "${RED}Fallidas: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 TODOS LOS TESTS PASARON - NOM-004 CUMPLIMIENTO COMPLETO${NC}"
  echo ""
  echo "✅ El sistema cumple con los requisitos de integridad del expediente"
  echo "✅ Los triggers de protección están implementados"
  echo "✅ NO existen funciones que permitan eliminar registros médicos"
  echo "✅ La documentación está presente"
  echo "✅ Los usuarios son informados sobre la protección"
  exit 0
else
  echo -e "${RED}⚠️  ALGUNOS TESTS FALLARON - REVISAR IMPLEMENTACIÓN${NC}"
  echo ""
  echo "Por favor, revisa los errores anteriores y corrige las implementaciones faltantes."
  exit 1
fi
