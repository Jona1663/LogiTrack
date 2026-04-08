document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GESTIÓN DE SESIÓN Y HEADER PERSISTENTE ---
    const infoUsuario = document.getElementById('info-usuario');
    const btnLogout = document.getElementById('btn-logout');
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');

    if (usuarioGuardado) {
        const user = JSON.parse(usuarioGuardado);
        
        // Normalizamos el rol
        const rolReal = user.rol.trim().toLowerCase();
        const rolCapitalizado = rolReal.charAt(0).toUpperCase() + rolReal.slice(1);
        
        // Dibujamos la info en el header
        if (infoUsuario) {
            infoUsuario.textContent = `${rolCapitalizado} | ${user.nombre}`;
        }

        // --- LÓGICA DE RESTRICCIÓN DE NUEVO ENVÍO ---
        const btnNuevoEnvio = document.getElementById('btn-nuevo-envio');
        if (rolReal === 'supervisor' && btnNuevoEnvio) {
            btnNuevoEnvio.style.setProperty('display', 'none', 'important');
        }

        // Configuración del botón de Cerrar Sesión (Icono 👤)
        if (btnLogout) {
            btnLogout.style.display = 'inline-block'; // Nos aseguramos que sea visible
            // Usamos onclick para evitar duplicar eventos si se recarga el script
            btnLogout.onclick = () => {
                if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                    localStorage.removeItem('usuarioLogueado');
                    window.location.href = 'index.html';
                }
            };
        }

    } else {
        // Si no hay sesión, al login
        window.location.href = 'index.html';
        return;
    }

    // --- 2. LÓGICA DE LA TABLA Y DATOS ---
    let envios = []; 

    const tbody = document.getElementById('tabla-envios-body');
    const inputBusqueda = document.getElementById('input-busqueda');
    const selectEstado = document.getElementById('select-estado');
    const mensajeVacio = document.getElementById('mensaje-vacio');

    // Cargar datos de la API
    fetch('http://localhost:3000/envios')
        .then(response => response.json())
        .then(data => {
            envios = data; 
            renderTable(envios); 
        })
        .catch(error => console.error('Error al cargar envíos:', error));

    const getEstadoClass = (estado) => {
        const clases = {
            'Pendiente': 'estado-pendiente',
            'En tránsito': 'estado-entransito',
            'En sucursal': 'estado-ensucursal',
            'Entregado': 'estado-entregado',
            'Cancelado': 'estado-cancelado'
        };
        return clases[estado] || '';
    };

    const getPrioridadClass = (prioridad) => {
        const clases = {
            'Alta': 'prioridad-alta',
            'Media': 'prioridad-media',
            'Baja': 'prioridad-baja'
        };
        return clases[prioridad] || '';
    };

    const renderTable = (datos) => {
        if (!tbody) return;
        tbody.innerHTML = ''; 
        const user = JSON.parse(localStorage.getItem('usuarioLogueado'));
        const rolReal = user.rol.trim().toLowerCase();

        if (datos.length === 0) {
            mensajeVacio?.classList.remove('hidden');
        } else {
            mensajeVacio?.classList.add('hidden');
            datos.forEach(envio => {
                const tr = document.createElement('tr');

                // Si es supervisor, mostramos el SELECT, si no, el BADGE
                const celdaEstado = rolReal === 'supervisor'
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
                    <td>${envio.destino}</td>
                    <td>${celdaEstado}</td>
                    <td><span class="badge ${getPrioridadClass(envio.prioridad)}">${envio.prioridad}</span></td>
                    <td style="text-align: center;">
                        <a href="detalle.html?id=${envio.trackingId}" class="btn-link">Ver detalle</a>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll('.edit-estado').forEach(select => {
                select.addEventListener('change', (e) => actualizarEstado(e.target.dataset.id, e.target.value));
            });
        }
    };
    
    // --- 3. FILTROS Y ACTUALIZACIÓN ---
    const aplicarFiltros = () => {
        const textoBusqueda = inputBusqueda.value.toLowerCase();
        const estadoFiltro = selectEstado.value;

        const datosFiltrados = envios.filter(envio => {
            const coincideTexto = envio.trackingId.toLowerCase().includes(textoBusqueda) || 
                                  envio.destinatario.toLowerCase().includes(textoBusqueda);
            const coincideEstado = estadoFiltro === 'Todos' || envio.estado === estadoFiltro;
            return coincideTexto && coincideEstado;
        });

        renderTable(datosFiltrados);
    };

    inputBusqueda?.addEventListener('input', aplicarFiltros);
    selectEstado?.addEventListener('change', aplicarFiltros);

    const actualizarEstado = async (id, nuevoEstado) => {
        try {
            const res = await fetch(`http://localhost:3000/envios/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (res.ok) {
                alert('Estado actualizado correctamente.');
                // Actualizamos localmente el array de envios para no recargar la página entera
                const index = envios.findIndex(e => String(e.id) === String(id));
                if (index !== -1) envios[index].estado = nuevoEstado;
                aplicarFiltros(); 
            } else {
                alert('Error al actualizar el estado.');
            }
        } catch (error) {
            console.error("Error:", error);
            alert('No se pudo conectar con el servidor.');
        }
    };
});