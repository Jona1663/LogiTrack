document.addEventListener('DOMContentLoaded', () => {
    
    // --- MANEJO DE SESIÓN EN EL HEADER ---
    const infoUsuario = document.getElementById('info-usuario');
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');

    if (usuarioGuardado) {
        const user = JSON.parse(usuarioGuardado);
        
        // Normalizamos el rol para la comparación (quitamos espacios y pasamos a minúsculas)
        const rolReal = user.rol.trim().toLowerCase();
        
        const rolCapitalizado = rolReal.charAt(0).toUpperCase() + rolReal.slice(1);
        infoUsuario.textContent = `${rolCapitalizado} | ${user.nombre}`;

        // --- LÓGICA DE RESTRICCIÓN DE NUEVO ENVÍO ---
        const btnNuevoEnvio = document.getElementById('btn-nuevo-envio');

        // Verificamos el rol normalizado
        if (rolReal === 'supervisor' && btnNuevoEnvio) {
            console.log("Rol de supervisor detectado. Ocultando botón de nuevo envío...");
            btnNuevoEnvio.style.setProperty('display', 'none', 'important');
        }
    } else {
        window.location.href = 'index.html';
        return;
    }
    // Funcionalidad para Cerrar Sesión con confirmación
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
            if (confirmar) {
                localStorage.removeItem('usuarioLogueado');
                window.location.href = 'index.html';
            }
        });
    }
    // ---------------------------------------------

    let envios = []; // Variable global para guardar los datos que traiga el servidor

    // Elementos del DOM
    const tbody = document.getElementById('tabla-envios-body');
    const inputBusqueda = document.getElementById('input-busqueda');
    const selectEstado = document.getElementById('select-estado');
    const mensajeVacio = document.getElementById('mensaje-vacio');

    // 1. LEER DE LA MOCK API AL CARGAR LA PÁGINA
    fetch('http://localhost:3000/envios')
        .then(response => response.json())
        .then(data => {
            envios = data; // Guardamos los datos recibidos en nuestra variable
            renderTable(envios); // Renderizamos la tabla
        })
        .catch(error => console.error('Error al cargar envíos:', error));

    // 2. FUNCIONES AUXILIARES PARA ESTILOS (BADGES)
    const getEstadoClass = (estado) => {
        switch(estado) {
            case 'Pendiente': return 'estado-pendiente';
            case 'En tránsito': return 'estado-entransito';
            case 'En sucursal': return 'estado-ensucursal';
            case 'Entregado': return 'estado-entregado';
            case 'Cancelado': return 'estado-cancelado';
            default: return '';
        }
    };

    const getPrioridadClass = (prioridad) => {
        switch(prioridad) {
            case 'Alta': return 'prioridad-alta';
            case 'Media': return 'prioridad-media';
            case 'Baja': return 'prioridad-baja';
            default: return '';
        }
    };

    // 3. FUNCIÓN PARA RENDERIZAR LA TABLA
    const renderTable = (datos) => {
        tbody.innerHTML = ''; // Limpiar la tabla antes de inyectar nuevos datos
        const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));

        if (datos.length === 0) {
            mensajeVacio.classList.remove('hidden');
        } else {
            mensajeVacio.classList.add('hidden');
            datos.forEach(envio => {
                const tr = document.createElement('tr');

                // Si es supervisor, mostramos un select. Si es operador, solo el badge.
                const celdaEstado = usuario.rol === 'supervisor'
                ? `<select class="edit-estado" data-id="${envio.id}">
                    <option value="Pendiente" ${envio.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En tránsito" ${envio.estado === 'En tránsito' ? 'selected' : ''}>En tránsito</option>
                    <option value="En sucursal" ${envio.estado === 'En sucursal' ? 'selected' : ''}>En sucursal</option>
                    <option value="Entregado" ${envio.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    <option value="Cancelado" ${envio.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                   </select>`
                : `<span class="badge ${getEstadoClass(envio.estado)}">${envio.estado}</span>`;

                tr.innerHTML = `
                    <td><strong>${envio.trackingId}</strong></td>
                    <td>${envio.remitente}</td>
                    <td>${envio.destinatario}</td>
                    <td>${envio.origen}</td>
                    <td>${envio.destino}</td>
                    <td>${celdaEstado}</td>
                    <td><span class="badge ${getPrioridadClass(envio.prioridad)}">${envio.prioridad}</span></td>
                    <td>${envio.fecha}</td>
                    <td><a href="detalle.html?id=${envio.trackingId}" class="btn-link">Ver detalle</a></td>
                `;
                tbody.appendChild(tr);
            });

            // Agregamos el evento a todos los selectores nuevos
            document.querySelectorAll('.edit-estado').forEach(select => {
            select.addEventListener('change', (e) => actualizarEstado(e.target.dataset.id, e.target.value));
        });
        }
    };

    // 4. FUNCIÓN PARA APLICAR FILTROS (BÚSQUEDA Y ESTADO)
    const aplicarFiltros = () => {
        const textoBusqueda = inputBusqueda.value.toLowerCase();
        const estadoFiltro = selectEstado.value;

        // Filtramos usando la variable 'envios' que ya tiene los datos del servidor
        const datosFiltrados = envios.filter(envio => {
            const coincideTexto = envio.trackingId.toLowerCase().includes(textoBusqueda) || 
                                  envio.destinatario.toLowerCase().includes(textoBusqueda);
            
            const coincideEstado = estadoFiltro === 'Todos' || envio.estado === estadoFiltro;

            return coincideTexto && coincideEstado;
        });

        renderTable(datosFiltrados);
    };

    // 5. EVENT LISTENERS PARA LOS FILTROS
    inputBusqueda.addEventListener('input', aplicarFiltros);
    selectEstado.addEventListener('change', aplicarFiltros);

    // 6. Para para guardar los cambios permanentemente con json.server cuando se actualizan los estados de los 
    //envíos.
    const actualizarEstado = async (id, nuevoEstado) => {
        try {
            const res = await fetch(`http://localhost:3000/envios/${id}`, {
                method: 'PATCH', // PATCH solo actualiza el campo que le enviamos
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (res.ok) {
                alert('Estado actualizado correctamente.');
                // Opcional: recargar los datos para que los filtros se mantengan
                location.reload(); 
            } else {
                alert('Error al actualizar el estado.');
            }
        } catch (error) {
            console.error("Error:", error);
            alert('No se pudo conectar con el servidor.');
        }
    };
});