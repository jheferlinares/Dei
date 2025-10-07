// Script para debuggear conteos desde el navegador
// Ejecutar en la consola del navegador cuando estés en la aplicación

async function debugConteos() {
    console.log('=== DEBUGGING CONTEOS DE REFERIDOS ===');
    
    try {
        // 1. Verificar conteos actuales
        console.log('\n1. CONTEOS ACTUALES:');
        
        const estadisticas = await fetch('/api/estadisticas?tipoProducto=vida');
        const stats = await estadisticas.json();
        console.log('Estadísticas generales (vida):', stats);
        
        const corporativo = await fetch('/api/ano-corporativo/estadisticas');
        const corpStats = await corporativo.json();
        console.log('Año corporativo:', corpStats);
        
        // 2. Verificar historial por mes
        console.log('\n2. HISTORIAL POR MES:');
        
        const meses = [
            { num: 7, nombre: 'Julio' },
            { num: 8, nombre: 'Agosto' },
            { num: 9, nombre: 'Septiembre' }
        ];
        
        let totalHistorial = 0;
        for (const mes of meses) {
            const response = await fetch(`/api/historial?mes=${mes.num}&año=2024`);
            const data = await response.json();
            console.log(`${mes.nombre} 2024:`, data.total);
            totalHistorial += data.total;
        }
        console.log('Total historial jul-sep:', totalHistorial);
        
        // 3. Verificar trimestre
        console.log('\n3. TRIMESTRE Q1:');
        const trimestre = await fetch('/api/historial?trimestre=1');
        const trimData = await trimestre.json();
        console.log('Trimestre Q1:', trimData.total);
        
        // 4. Mostrar diferencias
        console.log('\n4. DIFERENCIAS:');
        console.log(`Individual (${totalHistorial}) vs Corporativo (${corpStats.totalCerrados}): ${corpStats.totalCerrados - totalHistorial}`);
        console.log(`Corporativo (${corpStats.totalCerrados}) vs Trimestre (${trimData.total}): ${corpStats.totalCerrados - trimData.total}`);
        console.log(`Individual (${totalHistorial}) vs Trimestre (${trimData.total}): ${totalHistorial - trimData.total}`);
        
        // 5. Verificar datos detallados del trimestre
        console.log('\n5. ANÁLISIS DETALLADO DEL TRIMESTRE:');
        console.log('Detalle del trimestre Q1:', trimData.detalle.length, 'registros');
        
        // Agrupar por mes en el trimestre
        const porMesEnTrimestre = {};
        trimData.detalle.forEach(item => {
            if (!porMesEnTrimestre[item.mes]) {
                porMesEnTrimestre[item.mes] = 0;
            }
            porMesEnTrimestre[item.mes]++;
        });
        
        console.log('Distribución por mes en trimestre Q1:', porMesEnTrimestre);
        
        return {
            totalHistorial,
            corporativo: corpStats.totalCerrados,
            trimestre: trimData.total,
            diferencias: {
                individualVsCorporativo: corpStats.totalCerrados - totalHistorial,
                corporativoVsTrimestre: corpStats.totalCerrados - trimData.total,
                individualVsTrimestre: totalHistorial - trimData.total
            }
        };
        
    } catch (error) {
        console.error('Error en debug:', error);
        return null;
    }
}

// Función para mostrar recomendaciones
function mostrarRecomendaciones(resultado) {
    if (!resultado) return;
    
    console.log('\n=== RECOMENDACIONES ===');
    
    if (resultado.diferencias.individualVsCorporativo > 0) {
        console.log('⚠️ Hay más referidos en año corporativo que en historial individual');
        console.log('   Posible causa: Duplicados en año corporativo');
        console.log('   Solución: Ejecutar script para eliminar duplicados');
    }
    
    if (resultado.diferencias.corporativoVsTrimestre > 0) {
        console.log('⚠️ Hay más referidos en año corporativo que en trimestre Q1');
        console.log('   Posible causa: Referidos no asignados correctamente al trimestre');
        console.log('   Solución: Verificar lógica de trimestre corporativo');
    }
    
    if (resultado.diferencias.individualVsTrimestre > 0) {
        console.log('⚠️ Hay más referidos en conteo individual que en trimestre Q1');
        console.log('   Posible causa: Referidos en historial sin trimestre asignado');
        console.log('   Solución: Actualizar campo trimestreCorporativo en historial');
    }
}

// Ejecutar automáticamente si se carga el script
console.log('Script de debug cargado. Ejecuta debugConteos() para analizar.');