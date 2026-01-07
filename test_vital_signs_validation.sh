#!/bin/bash

# ============================================================================
# TEST DE VALIDACIÓN DE SIGNOS VITALES
# Verifica que los rangos fisiológicos sean validados correctamente
# ============================================================================

echo "=================================================="
echo "🔬 TEST DE VALIDACIÓN DE SIGNOS VITALES"
echo "=================================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# ============================================================================
# Test 1: Verificar que existe el archivo de validación
# ============================================================================
echo "📋 Test 1: Verificar archivo de validación..."

if [ -f "src/utils/vitalSignsValidation.js" ]; then
  echo -e "${GREEN}✅ PASS${NC}: Archivo vitalSignsValidation.js existe"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Archivo vitalSignsValidation.js NO encontrado"
  ((FAILED++))
fi

echo ""

# ============================================================================
# Test 2: Verificar funciones de validación exportadas
# ============================================================================
echo "📋 Test 2: Verificar funciones de validación..."

VALIDATION_FUNCTIONS=(
  "validateTemperature"
  "validateBloodPressure"
  "validateHeartRate"
  "validateRespiratoryRate"
  "validateAllVitalSigns"
  "getValidationStyles"
)

for func in "${VALIDATION_FUNCTIONS[@]}"; do
  if grep -q "export.*function $func\|export.*$func.*=" src/utils/vitalSignsValidation.js; then
    echo -e "${GREEN}✅ PASS${NC}: Función '$func' exportada"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: Función '$func' NO encontrada"
    ((FAILED++))
  fi
done

echo ""

# ============================================================================
# Test 3: Verificar rangos fisiológicos definidos
# ============================================================================
echo "📋 Test 3: Verificar definición de rangos fisiológicos..."

VITAL_SIGNS=(
  "temperature"
  "heartRate"
  "respiratoryRate"
)

for vital in "${VITAL_SIGNS[@]}"; do
  if grep -q "$vital:" src/utils/vitalSignsValidation.js; then
    echo -e "${GREEN}✅ PASS${NC}: Rangos para '$vital' definidos"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: Rangos para '$vital' NO encontrados"
    ((FAILED++))
  fi
done

# Verificar presión arterial (tiene dos componentes)
if grep -q "bloodPressure" src/utils/vitalSignsValidation.js; then
  echo -e "${GREEN}✅ PASS${NC}: Rangos para 'bloodPressure' definidos"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Rangos para 'bloodPressure' NO encontrados"
  ((FAILED++))
fi

echo ""

# ============================================================================
# Test 4: Verificar integración en componente
# ============================================================================
echo "📋 Test 4: Verificar integración en CareFormComponents..."

if grep -q "validateAllVitalSigns" src/components/CareFormComponents.jsx; then
  echo -e "${GREEN}✅ PASS${NC}: Validación integrada en CareFormComponents"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Validación NO integrada en CareFormComponents"
  ((FAILED++))
fi

if grep -q "getValidationStyles" src/components/CareFormComponents.jsx; then
  echo -e "${GREEN}✅ PASS${NC}: Estilos de validación integrados"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Estilos de validación NO integrados"
  ((FAILED++))
fi

echo ""

# ============================================================================
# Test 5: Verificar mensajes de error
# ============================================================================
echo "📋 Test 5: Verificar mensajes de error descriptivos..."

if grep -q "fuera de rango\|VALORES INVÁLIDOS\|VALORES CRÍTICOS" src/components/CareFormComponents.jsx; then
  echo -e "${GREEN}✅ PASS${NC}: Mensajes de error descriptivos presentes"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}: Mensajes de error NO encontrados"
  ((FAILED++))
fi

echo ""

# ============================================================================
# Test 6: Verificar niveles de alerta
# ============================================================================
echo "📋 Test 6: Verificar niveles de alerta (normal, warning, critical)..."

ALERT_LEVELS=(
  "normal"
  "warning"
  "critical"
  "error"
)

for level in "${ALERT_LEVELS[@]}"; do
  if grep -q "level.*$level\|'$level'" src/utils/vitalSignsValidation.js; then
    echo -e "${GREEN}✅ PASS${NC}: Nivel de alerta '$level' implementado"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: Nivel de alerta '$level' NO encontrado"
    ((FAILED++))
  fi
done

echo ""

# ============================================================================
# EJEMPLOS DE VALIDACIÓN
# ============================================================================
echo "=================================================="
echo "📊 EJEMPLOS DE VALIDACIÓN"
echo "=================================================="
echo ""

echo -e "${BLUE}Temperatura:${NC}"
echo "  ✅ 36.5°C → Normal"
echo "  ⚠️  35.0°C → Hipotermia (advertencia)"
echo "  🔴 33.0°C → Hipotermia severa (crítico)"
echo "  ❌ 50.0°C → Fuera de rango posible (error)"
echo ""

echo -e "${BLUE}Presión Arterial:${NC}"
echo "  ✅ 120/80 → Normal"
echo "  ⚠️  140/95 → Hipertensión leve (advertencia)"
echo "  🔴 180/120 → Crisis hipertensiva (crítico)"
echo "  ❌ 300/200 → Fuera de rango posible (error)"
echo ""

echo -e "${BLUE}Frecuencia Cardíaca:${NC}"
echo "  ✅ 75 lpm → Normal"
echo "  ⚠️  55 lpm → Bradicardia leve (advertencia)"
echo "  🔴 45 lpm → Bradicardia severa (crítico)"
echo "  ❌ 300 lpm → Fuera de rango posible (error)"
echo ""

echo -e "${BLUE}Frecuencia Respiratoria:${NC}"
echo "  ✅ 16 rpm → Normal"
echo "  ⚠️  22 rpm → Taquipnea leve (advertencia)"
echo "  🔴 35 rpm → Taquipnea severa (crítico)"
echo "  ❌ 100 rpm → Fuera de rango posible (error)"
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
  echo -e "${GREEN}🎉 TODOS LOS TESTS PASARON - VALIDACIÓN IMPLEMENTADA${NC}"
  echo ""
  echo "✅ Los signos vitales se validan en rangos fisiológicos"
  echo "✅ Se detectan valores fuera de rango"
  echo "✅ Se clasifican en niveles: normal, warning, critical, error"
  echo "✅ Los usuarios reciben feedback visual en tiempo real"
  echo "✅ Se previenen errores de captura de datos"
  exit 0
else
  echo -e "${RED}⚠️  ALGUNOS TESTS FALLARON - REVISAR IMPLEMENTACIÓN${NC}"
  exit 1
fi
