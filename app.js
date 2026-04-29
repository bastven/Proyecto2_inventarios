/**
 * InventarioPro - Sistema de Gestión de Inventario
 * Lógica de negocio, validaciones y manipulación segura del DOM.
 */

// =========================================
// ESTADO DE LA APLICACIÓN (DATOS)
// =========================================
let inventario = [];
let compras = [];
let ventas = [];

// =========================================
// ELEMENTOS DEL DOM
// =========================================
const form = document.getElementById('inventory-form');
const inputNombre = document.getElementById('product-name');
const inputPrecio = document.getElementById('product-price');
const inputStock = document.getElementById('product-stock');
const selectCategoria = document.getElementById('product-category');
const tablaBody = document.getElementById('inventory-body');
const alertContainer = document.getElementById('alert-container');
const emptyState = document.getElementById('empty-state');
const spanTotal = document.getElementById('total-products');

const historyBody = document.getElementById('history-body');
const historyEmptyState = document.getElementById('history-empty-state');

// Nuevos elementos del DOM para filtros avanzados
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterPriceMax = document.getElementById('filter-price-max');
const filterStockMin = document.getElementById('filter-stock-min');
const filterDate = document.getElementById('filter-date');
const btnLowStock = document.getElementById('btn-low-stock');
const btnResetFilters = document.getElementById('btn-reset-filters');

// =========================================
// INICIALIZACIÓN
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    renderizarLista();
    
    // Asignar el evento submit al formulario
    form.addEventListener('submit', agregarProducto);

    // Asignar eventos de filtros
    searchInput.addEventListener('input', aplicarFiltros);
    filterCategory.addEventListener('change', aplicarFiltros);
    filterPriceMax.addEventListener('input', aplicarFiltros);
    filterStockMin.addEventListener('input', aplicarFiltros);
    filterDate.addEventListener('change', aplicarFiltros);
    btnLowStock.addEventListener('click', consultarStockBajo);
    btnResetFilters.addEventListener('click', resetearFiltros);

    // Formulario de eliminación de cantidades
    const formDelete = document.getElementById('delete-form');
    if (formDelete) {
        formDelete.addEventListener('submit', manejarEliminacionFormulario);
    }

    // Formulario de compras
    const formPurchase = document.getElementById('purchase-form');
    if (formPurchase) {
        formPurchase.addEventListener('submit', registrarCompra);
    }

    // Formulario de ventas
    const formSale = document.getElementById('sale-form');
    if (formSale) {
        formSale.addEventListener('submit', registrarVenta);
    }
});

// =========================================
// FUNCIONES DE PERSISTENCIA
// =========================================

/**
 * Carga los datos desde localStorage si existen.
 */
function cargarDatos() {
    const datosGuardados = localStorage.getItem('inventario_datos');
    if (datosGuardados) {
        try {
            inventario = JSON.parse(datosGuardados);
        } catch (e) {
            console.error("Error al leer localStorage", e);
            inventario = [];
        }
    }
    
    const comprasGuardadas = localStorage.getItem('inventario_compras');
    if (comprasGuardadas) {
        try {
            compras = JSON.parse(comprasGuardadas);
        } catch (e) {
            console.error("Error al leer localStorage compras", e);
            compras = [];
        }
    }

    const ventasGuardadas = localStorage.getItem('inventario_ventas');
    if (ventasGuardadas) {
        try {
            ventas = JSON.parse(ventasGuardadas);
        } catch (e) {
            console.error("Error al leer localStorage ventas", e);
            ventas = [];
        }
    }
}

/**
 * Guarda el estado actual del inventario, compras y ventas en localStorage.
 */
function guardarDatos() {
    localStorage.setItem('inventario_datos', JSON.stringify(inventario));
    localStorage.setItem('inventario_compras', JSON.stringify(compras));
    localStorage.setItem('inventario_ventas', JSON.stringify(ventas));
}

// =========================================
// MÓDULO DE COMPRAS
// =========================================

/**
 * Registra una nueva compra y aumenta el stock automáticamente.
 */
function registrarCompra(evento) {
    evento.preventDefault();
    
    const proveedorInput = sanitizarEntrada(document.getElementById('purchase-supplier').value);
    const productoInput = sanitizarEntrada(document.getElementById('purchase-product').value);
    const categoriaInput = sanitizarEntrada(document.getElementById('purchase-category').value);
    const precioInput = parseFloat(document.getElementById('purchase-price').value);
    const cantidadInput = parseInt(document.getElementById('purchase-quantity').value, 10);
    
    // Validación básica (apoyada en HTML5)
    if (!proveedorInput || !productoInput || !categoriaInput || isNaN(precioInput) || precioInput < 0 || isNaN(cantidadInput) || cantidadInput <= 0) {
        mostrarNotificacion('Por favor, verifica los datos de la compra.', 'error');
        return;
    }

    // 1. Crear y guardar la compra
    const nuevaCompra = {
        id: Date.now().toString(),
        proveedor: proveedorInput,
        fecha: new Date().toISOString(),
        productos: [{
            nombre: productoInput,
            cantidad: cantidadInput,
            precio: precioInput
        }]
    };
    compras.push(nuevaCompra);

    // 2. Aumentar stock si existe, o crearlo si no existe
    const productoExistente = buscarProductoPorNombre(productoInput);
    
    if (productoExistente) {
        productoExistente.stock += cantidadInput;
    } else {
        inventario.push({
            id: Date.now().toString() + '-prod',
            nombre: productoInput,
            precio: precioInput, // Usamos el precio de compra como referencia inicial
            stock: cantidadInput,
            categoria: categoriaInput || 'Otros'
        });
    }

    guardarDatos();
    renderizarLista();
    document.getElementById('purchase-form').reset();
    
    mostrarNotificacion(`Compra registrada: +${cantidadInput} de ${productoInput}`, 'success');
}

// =========================================
// MÓDULO DE VENTAS
// =========================================

/**
 * Registra una venta, descuenta el stock automáticamente y calcula el total.
 */
function registrarVenta(evento) {
    evento.preventDefault();
    
    const tipoDocumento = document.getElementById('sale-type').value;
    const productoInput = sanitizarEntrada(document.getElementById('sale-product').value);
    const cantidadInput = parseInt(document.getElementById('sale-quantity').value, 10);
    
    // 1. Validar producto
    const productoExistente = buscarProductoPorNombre(productoInput);
    
    if (!productoExistente) {
        mostrarError('error-sale-product', 'El producto no existe en el inventario.');
        return;
    } else {
        mostrarError('error-sale-product', '');
    }

    // 2. Validar cantidad y stock
    if (isNaN(cantidadInput) || cantidadInput <= 0) {
        mostrarError('error-sale-quantity', 'Cantidad inválida.');
        return;
    }
    if (cantidadInput > productoExistente.stock) {
        mostrarError('error-sale-quantity', `Solo hay ${productoExistente.stock} en stock.`);
        return;
    } else {
        mostrarError('error-sale-quantity', '');
    }

    // 3. Procesar venta
    const totalVenta = productoExistente.precio * cantidadInput;

    const nuevaVenta = {
        id: Date.now().toString(),
        tipo: tipoDocumento,
        fecha: new Date().toISOString(),
        productos: [{
            nombre: productoExistente.nombre,
            cantidad: cantidadInput,
            precio: productoExistente.precio
        }],
        total: totalVenta
    };

    ventas.push(nuevaVenta);

    // 4. Descontar stock
    productoExistente.stock -= cantidadInput;
    if (productoExistente.stock === 0) {
        // Eliminar producto si llega a 0 (Opcional, según lo especificado)
        const indice = inventario.indexOf(productoExistente);
        if (indice > -1) {
            inventario.splice(indice, 1);
            mostrarNotificacion(`¡Atención! "${productoExistente.nombre}" se agotó y fue eliminado del inventario.`, 'error');
        }
    }

    // 5. Guardar y refrescar
    guardarDatos();
    renderizarLista();
    document.getElementById('sale-form').reset();
    
    // Formatear el total para mostrarlo al usuario
    const totalFormat = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalVenta);
    mostrarNotificacion(`Venta registrada exitosamente. Total: ${totalFormat}`, 'success');
}

// =========================================
// SISTEMA DE NOTIFICACIONES (TOAST)
// =========================================

/**
 * Limpia y sanitiza las entradas de texto para prevenir XSS básico.
 * Evita inyección de etiquetas HTML limitando los caracteres permitidos.
 */
function sanitizarEntrada(texto) {
    // Reemplaza <, > y otros caracteres peligrosos por entidades HTML o los elimina.
    // Para simplificar y usar JS puro, usaremos la propiedad nativa del navegador para texto.
    const div = document.createElement('div');
    div.textContent = texto.trim();
    return div.textContent;
}

/**
 * Valida los datos del formulario antes de procesarlos.
 * @returns {Object|null} Objeto con datos validados o null si hay error.
 */
function validarEntrada() {
    // Resetear mensajes de error
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    let esValido = true;
    
    // 1. Validar Nombre
    const nombreStr = inputNombre.value;
    const nombreSanitizado = sanitizarEntrada(nombreStr);
    // Expresión regular: Permite letras, números y algunos signos de puntuación básicos. No scripts.
    const nombreRegex = /^[a-zA-Z0-9\s\-_.,()]+$/;

    if (!nombreSanitizado) {
        mostrarError('error-name', 'El nombre es obligatorio.');
        esValido = false;
    } else if (nombreSanitizado.length < 3) {
        mostrarError('error-name', 'Debe tener al menos 3 caracteres.');
        esValido = false;
    } else if (!nombreRegex.test(nombreSanitizado)) {
        mostrarError('error-name', 'Contiene caracteres no permitidos.');
        esValido = false;
    }

    // 2. Validar Precio
    const precioVal = parseFloat(inputPrecio.value);
    if (isNaN(precioVal)) {
        mostrarError('error-price', 'Ingrese un número válido.');
        esValido = false;
    } else if (precioVal < 0) {
        mostrarError('error-price', 'El precio debe ser positivo.');
        esValido = false;
    }

    // 3. Validar Stock
    const stockVal = parseInt(inputStock.value, 10);
    if (isNaN(stockVal)) {
        mostrarError('error-stock', 'Ingrese una cantidad válida.');
        esValido = false;
    } else if (stockVal < 0) {
        mostrarError('error-stock', 'El stock no puede ser negativo.');
        esValido = false;
    }

    // 4. Validar Categoría
    const categoriaVal = selectCategoria.value;
    if (!categoriaVal) {
        mostrarError('error-category', 'Seleccione una categoría.');
        esValido = false;
    }

    if (!esValido) return null;

    return {
        id: Date.now().toString(), // Generar un ID único basado en el timestamp
        nombre: nombreSanitizado,
        precio: precioVal,
        stock: stockVal,
        categoria: sanitizarEntrada(categoriaVal)
    };
}

/**
 * Muestra el mensaje de error en el span correspondiente.
 */
function mostrarError(idElemento, mensaje) {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.textContent = mensaje;
    }
}

// =========================================
// LÓGICA DE NEGOCIO Y MANEJO DEL DOM
// =========================================

/**
 * Busca un producto en el inventario por su nombre (insensible a mayúsculas/minúsculas).
 * @param {string} nombre - Nombre del producto a buscar
 * @returns {Object|undefined} El producto encontrado o undefined
 */
function buscarProductoPorNombre(nombre) {
    const nombreBuscado = nombre.toLowerCase().trim();
    return inventario.find(producto => producto.nombre.toLowerCase().trim() === nombreBuscado);
}

/**
 * Maneja el evento de envío del formulario.
 */
function agregarProducto(evento) {
    // Prevenir el recargo de la página
    evento.preventDefault();

    // Validar y obtener objeto producto
    const nuevoProducto = validarEntrada();

    if (nuevoProducto) {
        // Buscar si el producto ya existe
        const productoExistente = buscarProductoPorNombre(nuevoProducto.nombre);

        if (productoExistente) {
            // Si existe, sumar el stock
            productoExistente.stock += nuevoProducto.stock;
            mostrarNotificacion(`Stock actualizado. Nuevo stock: ${productoExistente.stock}`, 'success');
        } else {
            // Si no existe, agregar al arreglo como nuevo
            inventario.push(nuevoProducto);
            mostrarNotificacion('Producto agregado exitosamente', 'success');
        }
        
        // Guardar
        guardarDatos();
        
        // Renderizar
        renderizarLista();
        
        // Limpiar formulario
        form.reset();
        
        // Dar foco al input
        inputNombre.focus();
    }
}

/**
 * Maneja el envío del formulario de eliminación por nombre y cantidad.
 */
function manejarEliminacionFormulario(evento) {
    evento.preventDefault();
    const nombreInput = sanitizarEntrada(document.getElementById('delete-product-name').value);
    const cantidadInput = parseInt(document.getElementById('delete-quantity').value, 10);

    const producto = buscarProductoPorNombre(nombreInput);

    if (!producto) {
        mostrarError('error-delete-name', 'Producto no encontrado en el inventario.');
        return;
    } else {
        mostrarError('error-delete-name', '');
    }

    if (isNaN(cantidadInput) || cantidadInput <= 0) {
        mostrarError('error-delete-quantity', 'Ingresa una cantidad válida mayor a 0.');
        return;
    } else {
        mostrarError('error-delete-quantity', '');
    }

    eliminarCantidadProducto(producto.id, cantidadInput);
    document.getElementById('delete-form').reset();
}

/**
 * Solicita mediante un prompt la cantidad a eliminar desde la tabla.
 */
function solicitarEliminacionDesdeTabla(id) {
    const producto = inventario.find(p => p.id === id);
    if (!producto) return;

    const cantidadStr = prompt(`¿Cuántas unidades de "${producto.nombre}" deseas eliminar? (Stock actual: ${producto.stock})`, '1');
    if (cantidadStr === null) return; // Se canceló el prompt

    const cantidad = parseInt(cantidadStr, 10);
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarNotificacion('Ingresa una cantidad válida.', 'error');
        return;
    }

    eliminarCantidadProducto(id, cantidad);
}

/**
 * Elimina una cantidad específica de un producto. Si llega a 0, elimina el producto del inventario.
 */
function eliminarCantidadProducto(id, cantidad) {
    const indice = inventario.findIndex(p => p.id === id);
    if (indice === -1) return;

    const producto = inventario[indice];

    if (cantidad > producto.stock) {
        mostrarNotificacion(`Error: Solo hay ${producto.stock} unidades de ${producto.nombre}.`, 'error');
        return;
    }

    producto.stock -= cantidad;

    if (producto.stock === 0) {
        // Eliminar producto completamente del arreglo
        inventario.splice(indice, 1);
        mostrarNotificacion(`Producto "${producto.nombre}" eliminado completamente.`, 'error');
    } else {
        mostrarNotificacion(`Se eliminaron ${cantidad} unidades. Nuevo stock: ${producto.stock}`, 'success');
    }

    guardarDatos();
    renderizarLista();
}

/**
 * Renderiza la lista de productos en el DOM.
 * MUY IMPORTANTE: Usa createElement y textContent por seguridad (No innerHTML).
 * @param {Array} lista Arreglo de productos a renderizar (por defecto, el inventario completo)
 */
function renderizarLista(lista = inventario) {
    // Limpiar el tbody
    tablaBody.innerHTML = '';
    
    // Actualizar contador
    spanTotal.textContent = lista.length;

    // Manejar estado vacío
    if (lista.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    // Recorrer el arreglo y construir el DOM dinámicamente
    lista.forEach((producto) => {
        // Crear fila <tr>
        const tr = document.createElement('tr');
        tr.className = 'new-row'; // Para animación CSS

        // 1. Celda Nombre
        const tdNombre = document.createElement('td');
        tdNombre.textContent = producto.nombre;
        tdNombre.setAttribute('data-label', 'Nombre');
        tr.appendChild(tdNombre);

        // 2. Celda Categoría
        const tdCategoria = document.createElement('td');
        const spanCat = document.createElement('span');
        spanCat.className = 'badge';
        spanCat.textContent = producto.categoria;
        tdCategoria.appendChild(spanCat);
        tdCategoria.setAttribute('data-label', 'Categoría');
        tr.appendChild(tdCategoria);

        // 3. Celda Precio
        const tdPrecio = document.createElement('td');
        // Formatear precio como moneda local
        const precioFormateado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(producto.precio);
        tdPrecio.textContent = precioFormateado;
        tdPrecio.setAttribute('data-label', 'Precio');
        tr.appendChild(tdPrecio);

        // 4. Celda Stock
        const tdStock = document.createElement('td');
        tdStock.textContent = producto.stock + ' un.';
        tdStock.setAttribute('data-label', 'Stock');
        // Color visual según cantidad de stock
        if (producto.stock < 10) {
            tdStock.className = 'stock-low';
        } else {
            tdStock.className = 'stock-ok';
        }
        tr.appendChild(tdStock);

        // 5. Celda Acciones
        const tdAcciones = document.createElement('td');
        tdAcciones.setAttribute('data-label', 'Acciones');
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-delete';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.setAttribute('aria-label', `Eliminar ${producto.nombre}`);
        
        // Asignar el evento directamente (Closure seguro)
        btnEliminar.addEventListener('click', () => {
            solicitarEliminacionDesdeTabla(producto.id);
        });

        tdAcciones.appendChild(btnEliminar);
        tr.appendChild(tdAcciones);

        // Agregar fila al cuerpo de la tabla
        tablaBody.appendChild(tr);
    });
}

// =========================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// =========================================

/**
 * Aplica todos los filtros de manera combinada y en tiempo real.
 */
function aplicarFiltros() {
    const terminoBusqueda = sanitizarEntrada(searchInput.value).toLowerCase();
    const categoriaSeleccionada = sanitizarEntrada(filterCategory.value);
    const precioMax = parseFloat(filterPriceMax.value);
    const stockMin = parseInt(filterStockMin.value, 10);
    const fechaSeleccionada = filterDate.value; // Formato YYYY-MM-DD

    const resultados = inventario.filter(producto => {
        // 1. Filtro por nombre
        const coincideNombre = producto.nombre.toLowerCase().includes(terminoBusqueda);
        
        // 2. Filtro por categoría
        const coincideCategoria = categoriaSeleccionada === 'Todas' || producto.categoria === categoriaSeleccionada;
        
        // 3. Filtro por precio máximo
        const coincidePrecio = isNaN(precioMax) || producto.precio <= precioMax;

        // 4. Filtro por stock mínimo
        const coincideStock = isNaN(stockMin) || producto.stock >= stockMin;

        // 5. Filtro por fecha de registro (usando el ID como timestamp)
        let coincideFecha = true;
        if (fechaSeleccionada) {
            const timestampProducto = parseInt(producto.id);
            if (!isNaN(timestampProducto)) {
                // Convertir timestamp a YYYY-MM-DD según zona horaria local
                const fechaDate = new Date(timestampProducto);
                const year = fechaDate.getFullYear();
                const month = String(fechaDate.getMonth() + 1).padStart(2, '0');
                const day = String(fechaDate.getDate()).padStart(2, '0');
                const fechaProductoStr = `${year}-${month}-${day}`;
                
                coincideFecha = (fechaProductoStr === fechaSeleccionada);
            }
        }

        // Retorna true solo si cumple TODAS las condiciones establecidas
        return coincideNombre && coincideCategoria && coincidePrecio && coincideStock && coincideFecha;
    });

    // Renderizar solo los que pasaron el filtro
    renderizarLista(resultados);
}

/**
 * Filtra los productos con stock menor a 10 y los muestra en la tabla.
 */
function consultarStockBajo() {
    // Al pulsar el atajo, vaciamos los otros filtros para evitar conflictos
    searchInput.value = '';
    filterCategory.value = 'Todas';
    filterPriceMax.value = '';
    filterStockMin.value = '';
    filterDate.value = '';
    
    const resultados = inventario.filter(producto => producto.stock < 10);
    renderizarLista(resultados);
    
    if (resultados.length > 0) {
        mostrarNotificacion(`Mostrando ${resultados.length} producto(s) con stock bajo`, 'success');
    } else {
        mostrarNotificacion('No hay productos con stock menor a 10', 'success');
    }
}

/**
 * Limpia todos los filtros y restaura la vista del inventario.
 */
function resetearFiltros() {
    searchInput.value = '';
    filterCategory.value = 'Todas';
    filterPriceMax.value = '';
    filterStockMin.value = '';
    filterDate.value = '';
    renderizarLista(inventario);
}

// =========================================
// SISTEMA DE NOTIFICACIONES (TOAST)
// =========================================

/**
 * Muestra una alerta temporal en pantalla usando DOM seguro.
 * @param {string} mensaje El texto a mostrar
 * @param {string} tipo 'success' o 'error'
 */
function mostrarNotificacion(mensaje, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    
    const icono = document.createElement('span');
    icono.textContent = tipo === 'success' ? '✅' : '🗑️';
    alerta.appendChild(icono);
    
    const texto = document.createElement('span');
    texto.textContent = mensaje;
    alerta.appendChild(texto);

    alertContainer.appendChild(alerta);

    // Remover la alerta después de 3 segundos
    setTimeout(() => {
        alerta.classList.add('alert-fade-out');
        alerta.addEventListener('animationend', () => {
            if(alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        });
    }, 3000);
}

// =========================================
// SISTEMA DE AUTENTICACIÓN
// =========================================

// 1. Elementos del DOM para Autenticación
const authSection = document.getElementById('auth-section');
const mainContent = document.querySelector('.main-content');
const btnLogout = document.getElementById('btn-logout');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const btnShowRegister = document.getElementById('btn-show-register');
const btnShowLogin = document.getElementById('btn-show-login');

const authError = document.getElementById('auth-error');
const registerError = document.getElementById('register-error');

// 2. Inicialización de Autenticación
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion(); // Verifica si hay sesión al cargar

    // Cambiar a vista de registro
    btnShowRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
        authError.textContent = ''; 
    });

    // Cambiar a vista de login
    btnShowLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        registerError.textContent = '';
    });

    // Eventos de los formularios
    registerForm.addEventListener('submit', registrarUsuario);
    loginForm.addEventListener('submit', iniciarSesion);
    if(btnLogout) btnLogout.addEventListener('click', cerrarSesion);
});

// 3. Obtener usuarios guardados
function obtenerUsuarios() {
    const usuariosGuardados = localStorage.getItem('inventario_usuarios');
    return usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
}

// 4. Función de Registro
function registrarUsuario(e) {
    e.preventDefault();
    // Usamos la función sanitizarEntrada que ya tienes definida en app.js
    const rutInput = sanitizarEntrada(document.getElementById('register-rut').value);
    const passInput = sanitizarEntrada(document.getElementById('register-password').value);

    // Validaciones
    if (!rutInput) {
        registerError.textContent = 'El RUT es obligatorio.';
        return;
    }
    if (passInput.length < 4) {
        registerError.textContent = 'La contraseña debe tener al menos 4 caracteres.';
        return;
    }

    const usuarios = obtenerUsuarios();
    const existe = usuarios.find(u => u.rut === rutInput);

    if (existe) {
        registerError.textContent = 'Este RUT ya está registrado.';
        return;
    }

    // Guardar nuevo usuario
    usuarios.push({ rut: rutInput, password: passInput });
    localStorage.setItem('inventario_usuarios', JSON.stringify(usuarios));
    
    // Iniciar sesión automáticamente y limpiar formulario
    localStorage.setItem('usuario_activo', rutInput);
    verificarSesion();
    registerForm.reset();
}

// 5. Función de Inicio de Sesión
function iniciarSesion(e) {
    e.preventDefault();
    const rutInput = sanitizarEntrada(document.getElementById('login-rut').value);
    const passInput = sanitizarEntrada(document.getElementById('login-password').value);

    const usuarios = obtenerUsuarios();
    const usuarioValido = usuarios.find(u => u.rut === rutInput && u.password === passInput);

    if (usuarioValido) {
        localStorage.setItem('usuario_activo', rutInput);
        verificarSesion();
        loginForm.reset();
        authError.textContent = '';
    } else {
        authError.textContent = 'RUT o contraseña incorrectos.';
    }
}

// 6. Función para Cerrar Sesión
function cerrarSesion() {
    localStorage.removeItem('usuario_activo');
    verificarSesion();
}

// 7. Manejo de la Sesión y Vistas
function verificarSesion() {
    const usuarioActivo = sanitizarEntrada(localStorage.getItem('usuario_activo') || '');
    
    if (usuarioActivo) {
        // Hay sesión: Ocultar login, mostrar app y botón de salir
        authSection.classList.add('hidden');
        mainContent.style.display = 'block';
        if(btnLogout) btnLogout.classList.remove('hidden');
        
        // Mostrar el inventario por defecto si la función ya está cargada
        if(typeof mostrarSeccion === 'function') mostrarSeccion('sec-inventario');
    } else {
        // No hay sesión: Mostrar login, ocultar app y botón de salir
        authSection.classList.remove('hidden');
        mainContent.style.display = 'none';
        if(btnLogout) btnLogout.classList.add('hidden');
    }
}

// =========================================
// SISTEMA DE NAVEGACIÓN (TABS)
// =========================================

/**
 * Muestra una sección específica y oculta las demás.
 * Se llama desde los botones del menú de navegación.
 */
window.mostrarSeccion = function(idSeccion) {
    // 1. Ocultar todas las secciones del dashboard
    const secciones = document.querySelectorAll('.dashboard-section');
    secciones.forEach(sec => sec.classList.add('hidden'));

    // 2. Mostrar únicamente la sección solicitada
    const seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) {
        seccionActiva.classList.remove('hidden');
    }

    // 3. Actualizar clase 'active' en los botones del navbar
    const botones = document.querySelectorAll('.nav-item');
    botones.forEach(btn => {
        // Chequeamos si el onclick de este botón hace referencia a la sección que estamos mostrando
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(idSeccion)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 4. Lógicas específicas por sección al abrir
    if (idSeccion === 'sec-historial') {
        renderizarHistorial();
    }
};

// =========================================
// MÓDULO DE HISTORIAL
// =========================================

/**
 * Combina compras y ventas, las ordena por fecha y las renderiza en la tabla.
 */
function renderizarHistorial() {
    if (!historyBody || !historyEmptyState) return;
    
    // Limpiar usando manipulación DOM segura
    while (historyBody.firstChild) {
        historyBody.removeChild(historyBody.firstChild);
    }

    const movimientos = [];

    // Extraer datos de compras
    compras.forEach(c => {
        movimientos.push({
            tipo: 'Compra',
            fecha: new Date(c.fecha),
            detalle: `Proveedor: ${c.proveedor} | ${c.productos[0].cantidad}x ${c.productos[0].nombre}`,
            monto: c.productos[0].cantidad * c.productos[0].precio
        });
    });

    // Extraer datos de ventas
    ventas.forEach(v => {
        movimientos.push({
            tipo: `Venta (${v.tipo})`,
            fecha: new Date(v.fecha),
            detalle: `${v.productos[0].cantidad}x ${v.productos[0].nombre}`,
            monto: v.total
        });
    });

    // Ordenar de más reciente a más antiguo
    movimientos.sort((a, b) => b.fecha - a.fecha);

    if (movimientos.length === 0) {
        historyEmptyState.classList.remove('hidden');
        return;
    } else {
        historyEmptyState.classList.add('hidden');
    }

    const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    movimientos.forEach(mov => {
        const tr = document.createElement('tr');
        tr.className = 'new-row';

        // 1. Celda Fecha
        const tdFecha = document.createElement('td');
        tdFecha.textContent = mov.fecha.toLocaleString('es-CL');
        tdFecha.setAttribute('data-label', 'Fecha');
        tr.appendChild(tdFecha);

        // 2. Celda Tipo
        const tdTipo = document.createElement('td');
        const spanTipo = document.createElement('span');
        spanTipo.className = 'badge';
        spanTipo.textContent = mov.tipo;
        if (mov.tipo === 'Compra') {
            spanTipo.style.backgroundColor = '#3b82f6'; // Azul
        } else {
            spanTipo.style.backgroundColor = '#10b981'; // Verde
        }
        tdTipo.appendChild(spanTipo);
        tdTipo.setAttribute('data-label', 'Tipo');
        tr.appendChild(tdTipo);

        // 3. Celda Detalle
        const tdDetalle = document.createElement('td');
        tdDetalle.textContent = mov.detalle;
        tdDetalle.setAttribute('data-label', 'Detalle');
        tr.appendChild(tdDetalle);

        // 4. Celda Monto Total
        const tdMonto = document.createElement('td');
        tdMonto.textContent = formatter.format(mov.monto);
        tdMonto.setAttribute('data-label', 'Total');
        tr.appendChild(tdMonto);

        // Agregar fila a la tabla
        historyBody.appendChild(tr);
    });
}
