# Aplicación de Control de Referidos

Esta aplicación permite llevar un registro de los referidos cerrados por cada trabajador durante un mes.

## Características

- Agregar referidos por trabajador
- Visualizar referidos en un gráfico de barras
- Eliminar referidos en caso de error
- Reiniciar datos para un nuevo mes
- Interfaz intuitiva y fácil de usar

## Requisitos

- Node.js (versión 12 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clona o descarga este repositorio
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta `npm install` para instalar las dependencias

## Uso

1. Ejecuta `npm start` para iniciar la aplicación
2. Abre tu navegador en `http://localhost:3000`
3. Usa el formulario para agregar referidos por trabajador
4. Visualiza los resultados en el gráfico y la tabla
5. Para eliminar un referido, usa el botón "Eliminar uno" en la tabla
6. Para reiniciar todos los datos (nuevo mes), usa el botón "Reiniciar Datos"

## Estructura del Proyecto

- `server.js`: Backend de la aplicación (Node.js con Express)
- `data.json`: Archivo donde se almacenan los datos
- `public/`: Carpeta con los archivos del frontend
  - `index.html`: Estructura de la página
  - `styles.css`: Estilos de la aplicación
  - `app.js`: Lógica del frontend