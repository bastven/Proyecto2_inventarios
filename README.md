# Proyecto2_inventarios
gestor de inventarios basico para micro emprendimientos
ya teniendo nuestra idea de proyecto, primero buscamos los requerimientos necesarios de una micro empresa al momento de gestionar inventarios pequeños, en base a esos requerimientos armamos nuestro prompt creado en CHATGPT para luego utilizarlo en ANTIGRAVITY.

el prompt fue el siguiente:
==========================================================================================================================================
Actúa como un desarrollador experto en JavaScript, HTML y buenas prácticas de seguridad web. Necesito que generes una aplicación web completa de gestión de inventario orientada a una microempresa, cumpliendo estrictamente los siguientes requisitos:

🔹 CONTEXTO DEL PROYECTO
La aplicación debe resolver el problema de control de inventario en microempresas, permitiendo registrar productos, visualizar stock y gestionar datos dinámicamente sin base de datos, utilizando arreglos y objetos en JavaScript.

🔹 REQUERIMIENTOS FUNCIONALES
* Registrar productos con: nombre, precio, categoría y stock
* Mostrar lista de productos en pantalla
* Eliminar productos
* Actualizar automáticamente la lista al agregar/eliminar
* Mostrar información clara del inventario

🔹 REQUERIMIENTOS TÉCNICOS (OBLIGATORIOS)
* Uso de HTML, CSS y JavaScript puro (sin frameworks)
* Uso de arreglos y objetos para almacenar datos
* Manipulación dinámica del DOM
* Código modular con funciones reutilizables

🔹 FORMULARIO HTML
Debe incluir mínimo:
* Input de texto (nombre del producto)
* Input numérico (precio o stock)
* Select (categoría)
* Botón de envío

🔹 VALIDACIONES AVANZADAS EN JAVASCRIPT
* Campos obligatorios
* Validación con expresiones regulares
* Validación de números positivos
* Sanitización de datos de entrada

🔹 SEGURIDAD (MUY IMPORTANTE)
* No usar innerHTML para insertar datos dinámicos
* Usar textContent o createElement
* Validar y limpiar los inputs del usuario
* Evitar vulnerabilidades XSS

🔹 FUNCIONES MODULARES (OBLIGATORIO)
El código debe incluir funciones como:
* validarEntrada()
* agregarProducto()
* renderizarLista()
* eliminarProducto()

🔹 MANEJO DEL DOM
* Mostrar productos en una lista (ul o tabla)
* Actualizar dinámicamente la vista
* Botones para eliminar cada producto

🔹 ESTRUCTURA DEL PROYECTO
Generar el código separado en:
* index.html
* style.css
* app.js

🔹 EXTRA (SI ES POSIBLE)
* Uso de localStorage para persistencia
* Interfaz simple y clara
* Mensajes de error amigables

🔹 FORMATO DE RESPUESTA
* Entregar el código completo y funcional
* Explicar brevemente cada archivo
* Asegurarse de que el código sea claro, ordenado y comentado

🔹 IMPORTANTE
El código debe estar listo para ser subido a GitHub y desplegado en GitHub Pages.
==========================================================================================================================================

ya teniendo una base (maqueta) de lo que queremos, refinamos el prompt y lo desarrollamos por parte para que se ajuste correctamente a lo solicitado por el porfesor.

para refinar dichas funciones y agregados utilizamos los siguientes prompt:

==========================================================================================================================================
ETAPA 1: AUTENTICACIÓN (LOGIN + REGISTRO)
Actúa como un desarrollador experto en JavaScript. Tengo un sistema de inventario ya funcional (con formularios, validaciones, DOM seguro y localStorage), y quiero agregar un sistema de autenticación de usuarios SIN romper el código existente.

🔹 OBJETIVO
Implementar registro e inicio de sesión usando RUT como identificador.

🔹 REQUERIMIENTOS
1. Crear formulario de REGISTRO:
* Campo RUT
* Campo contraseña

2. Crear formulario de LOGIN:
* Campo RUT
* Campo contraseña

3. Validaciones:
* RUT no vacío (puede ser validación simple)
* Contraseña mínimo 4 caracteres

4. Almacenar usuarios en localStorage:
* Estructura:
  usuarios = [
  { rut: "12345678-9", password: "1234" }
  ]

5. Implementar funciones:
* registrarUsuario()
* iniciarSesion()
* cerrarSesion()
  
6. Manejo de sesión:
* Guardar usuario activo en localStorage
* Si hay sesión activa → mostrar sistema de inventario
* Si no → mostrar login

7. Seguridad:
* No usar innerHTML
* Usar textContent y createElement
* Sanitizar inputs
🔹 FORMATO DE RESPUESTA
* Indicar qué agregar en HTML
* Indicar qué agregar en JS
* Explicar brevemente cada parte
🔹 IMPORTANTE
No reescribir todo el proyecto, solo agregar autenticación encima del sistema actual.


ETAPA 2: SISTEMA DE VISTAS (MENÚ / TABS)
Actúa como desarrollador frontend experto. Tengo un sistema con login funcionando y quiero organizar la aplicación en diferentes secciones (tipo panel de control).

🔹 OBJETIVO
Crear un sistema de navegación (tabs o botones) para mostrar diferentes módulos.

🔹 SECCIONES
* Ingresar productos
* Eliminar productos
* Compras
* Ventas
* Inventario general

🔹 REQUERIMIENTOS
1. Crear menú (botones o navbar)

2. Cada sección debe estar en un contenedor <div>

3. Mostrar/ocultar secciones usando JS:
* Solo una visible a la vez

4. Crear función:
* mostrarSeccion(idSeccion)

5. Mantener manipulación segura del DOM
🔹 IMPORTANTE
No eliminar el código existente, solo organizarlo en secciones.
🔹 FORMATO
Mostrar cambios en HTML y JS.


ETAPA 3: MEJORA INGRESO DE PRODUCTOS (APILAR STOCK)
Actúa como experto en JavaScript. Tengo una función para agregar productos a un inventario, pero quiero mejorarla.
🔹 OBJETIVO
Evitar duplicar productos y en su lugar acumular stock.

🔹 REQUERIMIENTOS
1. Crear función:
* buscarProductoPorNombre(nombre)

2. Modificar agregarProducto:
* Si el producto ya existe → sumar stock
* Si no existe → crear nuevo producto

3. Mantener validaciones existentes

4. Actualizar localStorage correctamente
🔹 IMPORTANTE
No duplicar productos con el mismo nombre.
🔹 FORMATO
Mostrar solo el código modificado.


ETAPA 4: ELIMINAR PRODUCTOS POR CANTIDAD
Actúa como desarrollador JavaScript. Quiero mejorar la eliminación de productos en mi sistema.

🔹 OBJETIVO
Eliminar productos por cantidad, no completamente.

🔹 REQUERIMIENTOS
1. Permitir ingresar cantidad a eliminar

2. Validar:
* No eliminar más de lo disponible

3. Si stock llega a 0:
* Eliminar producto del inventario

4. Crear función:
* eliminarCantidadProducto(id, cantidad)
🔹 FORMATO
Indicar cambios en HTML y JS.


ETAPA 5: MÓDULO DE COMPRAS
Actúa como desarrollador experto en JS. Quiero agregar un módulo de compras a mi sistema.

🔹 OBJETIVO
Registrar compras con proveedores.

🔹 ESTRUCTURA
compras = [
{
proveedor: "",
fecha: "",
productos: [{ nombre, cantidad, precio }]
}
]

🔹 REQUERIMIENTOS
1. Formulario de compra:
* Proveedor
* Producto
* Cantidad
* Precio

2. Función:
* registrarCompra()

3. Al registrar:
* Guardar compra
* Aumentar stock automáticamente

4. Guardar en localStorage
🔹 FORMATO
Mostrar HTML + JS.


ETAPA 6: MÓDULO DE VENTAS
Actúa como desarrollador JS. Quiero agregar ventas a mi sistema.

🔹 OBJETIVO
Registrar ventas y descontar stock.

🔹 ESTRUCTURA
ventas = [
{
tipo: "boleta" o "factura",
fecha: "",
productos: [{ nombre, cantidad, precio }],
total: number
}
]

🔹 REQUERIMIENTOS
1. Formulario:
* Tipo (boleta/factura)
* Producto
* Cantidad

2. Función:
* registrarVenta()

3. Validar stock disponible

4. Descontar stock automáticamente

5. Calcular total

🔹 FORMATO
HTML + JS.


ETAPA 7: FILTROS AVANZADOS (CONSULTAS PRO)
Actúa como experto en JavaScript. Quiero mejorar las consultas de mi inventario.

🔹 OBJETIVO
Agregar filtros avanzados.

🔹 FILTROS
* Por categoría
* Por precio
* Por stock
* Por fecha

🔹 REQUERIMIENTOS
1. Crear inputs/selects para filtros

2. Usar .filter()

3. Reutilizar:
   renderizarLista(lista = inventario)

4. Actualizar en tiempo real

🔹 FORMATO
Mostrar implementación completa.
==========================================================================================================================================

ya por ultimo y dejar refinado el proyecto:

Estoy desarrollando una aplicación web de inventario usando HTML, CSS y JavaScript puro (sin frameworks). Ya tengo funcionalidades como login, registro, gestión de productos, compras y ventas.

Necesito que adaptes TODO el proyecto para que sea completamente responsive y funcione correctamente en dispositivos móviles, tablets y escritorio.

Requisitos específicos:

1. Diseño Responsive:
- Usar media queries en CSS para adaptar el layout.
- En pantallas pequeñas (max-width: 768px):
  - Cambiar el layout de dos columnas a una sola columna.
  - Formularios deben ocupar el 100% del ancho.
  - Tablas deben ser scrollables horizontalmente o convertirse en tarjetas.
  - Reducir paddings y tamaños de fuente si es necesario.

2. Navbar (menú superior):
- En escritorio: mantener menú horizontal.
- En móvil: convertir en menú tipo hamburguesa o scroll horizontal.
- Los botones deben ser fácilmente clickeables (mínimo 44px de alto).

3. Formularios:
- Inputs y selects deben ocupar el 100% del ancho en móvil.
- Espaciado vertical adecuado entre campos.
- Botones grandes y accesibles.

4. Tablas de inventario:
- En móvil:
  - Opción 1: hacer scroll horizontal.
  - Opción 2 (mejor): transformar cada fila en una tarjeta visual.
- Mantener legibilidad de datos.

5. Login y Registro:
- Centrar el formulario en pantalla.
- Mostrar solo login inicialmente.
- “Crear cuenta” como link pequeño debajo.

6. Buenas prácticas:
- No romper el diseño actual (mantener estilo glassmorphism).
- Usar flexbox y/o grid correctamente.
- No usar librerías externas (solo CSS puro).
- Mantener clases existentes y modificar lo mínimo necesario.

7. Seguridad:
- No usar innerHTML para insertar contenido dinámico.
- Mantener uso de textContent y createElement.

Entrégame:
- Cambios específicos en CSS (media queries completas).
- Si es necesario, ajustes mínimos en HTML.
- Explicación breve de qué se modificó.
