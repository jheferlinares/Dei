// Configuración de empleados por líder
const empleadosPorLider = {
  'Ashley Amparo': [
    'Ashley Amparo',
    'Lidianny Reyes',
    'Yeremy Calzado',
    'Pedro Manzanillo'
  ],
  
  'Alfonzo Navarro': [
    'Alfonzo Navarro',
    'Lisbeth Bernabe',
    'Mauby Nova',
    'Cristian Mendez',
    'Michael Muñoz',
    'Teodairin Rodriguez',
    'Karla Abreu',
    'Ynivelisse Berihuete',
    'Nayelly Jimenez',
    'Massiel Gonzalez'
  ],
  
  'Rubdith Gomez': [
    'Rubdith Gomez',
    'Jordan Navas',
    'Johanna Teran',
    'Rafael Pinzon',
    'Milagros Ollarves',
    'Hanzel Pineda',
    'Dariatny Becerra',
    'Natalys Moreno',
    'Britney Fermin',
    'Andrea Andrade'
  ],
  
  'Dorka de la Cruz': [
    'Dorka de la Cruz',
    'Jhefersson Linares',
    'Dahiana Galva',
    'Radhaysy Amparo',
    'Dismery Cabrera',
    'Mayelin Then'
  ],
  
  'Katherinne Rivas': [
    'Katherinne Rivas',
    'Mishell Perez',
    'Aura Lorenzo',
    'Otniel Martinez',
    'Bernardo Silva',
    'Gisell Ollarves',
    'Keberlin Malaver',
    'Adays Mercado',
    'Zinay Mercado',
    'Erick Espinosa'
  ],
  
  'Dilenia Roa': [
    'Dilenia Roa',
    'Bayan Enrique',
    'Moises Sosa',
    'Erica Montilla',
    'Maria Ceballos'
  ],
  
  'Keila Criollo': [
    'Keila Criollo',
    'Adolmary Fonseca',
    'Fabian Toro',
    'Oscar Linares',
    'Alejandra Alvarez'
  ],
  
  'Hanz Krznaric': [
    'Hanz Krznaric',
    'Roswuell Avila',
    'Michel Armas',
    'Eduardo Ortega',
    'Nathaly Franco',
    'Yulianny Rosario'
  ],
  
  'Yoaldrys Espina': [
    'Yoaldrys Espina',
    'Francisco Abreu'
  ],
  
  'Empleados Adicionales': [
    'Angelica Suarez',
    'Chackie Polanco',
    'Crismely Rubert',
    'Esther Abreu',
    'Franklyn Almonte',
    'Lovely Concepcion',
    'Yessica Pacheco',
    'Eliana Perez',
    'Zeilic Hernandez',
    'Yafreisy Ramirez',
    'Fanny Rojas',
    'Lisbeth Rincon',
    'Yeyder Diaz',
    'Elizabeth Cabrera',
    'Cristal Reyes',
    'Stacey Ortiz',
    'Joneli Santos',
    'Marianny Fajardo',
    'Anais Valdez',
    'Olider Veras'
  ]
};

// Yohanni Beltre tiene los empleados de Rubdith + Hanz
empleadosPorLider['Yohanni Beltre'] = [
  'Yohanni Beltre',
  ...empleadosPorLider['Rubdith Gomez'].slice(1), // Sin incluir a Rubdith
  ...empleadosPorLider['Hanz Krznaric'].slice(1)  // Sin incluir a Hanz
];

// Brigetle tiene los empleados de Rubdith + Hanz
empleadosPorLider['Brigetle Guerrero'] = [
  'Brigetle Guerrero',
  ...empleadosPorLider['Rubdith Gomez'].slice(1), // Sin incluir a Rubdith
  ...empleadosPorLider['Hanz Krznaric'].slice(1)  // Sin incluir a Hanz
];

// Ner Velasquez tiene los empleados de Alfonzo, Dorka y Katherinne
empleadosPorLider['Ner Velasquez'] = [
  'Ner Velasquez',
  ...empleadosPorLider['Alfonzo Navarro'].slice(1), // Sin incluir a Alfonzo
  ...empleadosPorLider['Dorka de la Cruz'].slice(1), // Sin incluir a Dorka
  ...empleadosPorLider['Katherinne Rivas'].slice(1)  // Sin incluir a Katherinne
];

// Función para obtener todos los empleados únicos
function obtenerTodosLosEmpleados() {
  const todosEmpleados = new Set();
  Object.values(empleadosPorLider).forEach(empleados => {
    empleados.forEach(empleado => todosEmpleados.add(empleado));
  });
  return Array.from(todosEmpleados).sort();
}

// Función para cargar empleados según el líder seleccionado
window.cargarEmpleadosPorLider = function(lider) {
  const empleadoSelect = document.getElementById('nombreEmpleado');
  empleadoSelect.innerHTML = '<option value="">Seleccionar Empleado</option>';
  
  // Siempre mostrar todos los empleados sin importar el líder
  const empleados = obtenerTodosLosEmpleados();
  
  empleados.forEach(empleado => {
    const option = document.createElement('option');
    option.value = empleado;
    option.textContent = empleado;
    empleadoSelect.appendChild(option);
  });
}

// Inicializar con todos los empleados
document.addEventListener('DOMContentLoaded', () => {
  // Cargar todos los empleados inicialmente
  window.cargarEmpleadosPorLider('');
});