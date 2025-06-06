# Instrucciones para la Aplicación de Control de Referidos

## Configuración Inicial

### 1. Configurar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crea un cluster gratuito
3. Configura un usuario de base de datos con contraseña
4. Configura el acceso de red (puedes permitir acceso desde cualquier IP: 0.0.0.0/0)
5. Obtén la cadena de conexión

### 2. Configurar la aplicación

1. Abre el archivo `.env` en la carpeta de la aplicación
2. Reemplaza la cadena de conexión con la que obtuviste de MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://tu_usuario:tu_contraseña_real@cluster0.mongodb.net/referidos_db?retryWrites=true&w=majority
   PORT=3000
   ```

### 3. Instalar dependencias e iniciar

1. Abre una terminal en la carpeta de la aplicación
2. Ejecuta `npm install` para instalar las dependencias
3. Ejecuta `npm start` para iniciar la aplicación
4. Abre tu navegador en `http://localhost:3000`

## Uso de la Aplicación

La aplicación tiene dos secciones principales:

### 1. Referidos Pendientes

En esta sección puedes:

- **Registrar nuevos referidos**:
  - Ingresa el nombre del cliente
  - Ingresa el nombre del empleado que envió el referido
  - Ingresa el país del empleado
  - Selecciona si el referido se envió en línea o por callback
  - Haz clic en "Registrar Referido"

- **Buscar referidos**:
  - Usa el campo de búsqueda para encontrar referidos por nombre de cliente o empleado
  - Haz clic en "Buscar" o presiona Enter

- **Gestionar referidos pendientes**:
  - Ver todos los referidos pendientes en la tabla
  - Marcar un referido como cerrado haciendo clic en "Cerrar"
  - Eliminar un referido haciendo clic en "Eliminar"

### 2. Referidos Cerrados

En esta sección puedes:

- **Ver estadísticas**:
  - Gráfico de barras mostrando los referidos cerrados por cada empleado
  - Tabla con el detalle de referidos cerrados por empleado

- **Exportar datos**:
  - Haz clic en "Exportar a Excel" para descargar un archivo CSV con los datos

- **Reiniciar datos**:
  - Al comenzar un nuevo mes, haz clic en "Reiniciar Datos"
  - Esto eliminará solo los referidos cerrados, manteniendo los pendientes

## Flujo de trabajo recomendado

1. **Registro diario de referidos**:
   - Cada vez que se envía un referido, regístralo en la sección "Referidos Pendientes"

2. **Seguimiento de referidos**:
   - Usa la función de búsqueda para encontrar referidos específicos
   - Cuando un referido se cierra, márcalo como "Cerrado"

3. **Análisis mensual**:
   - Revisa la sección "Referidos Cerrados" para ver el rendimiento de cada empleado
   - Exporta los datos a Excel para análisis adicionales

4. **Cambio de mes**:
   - Al comenzar un nuevo mes, exporta los datos actuales
   - Haz clic en "Reiniciar Datos" para comenzar un nuevo período

## Notas importantes

- Los datos se guardan en MongoDB Atlas, por lo que estarán disponibles desde cualquier dispositivo con acceso a internet
- La aplicación distingue entre referidos pendientes y cerrados
- Solo los referidos marcados como "cerrados" aparecen en las estadísticas
- Al reiniciar los datos, solo se eliminan los referidos cerrados, los pendientes se mantienen