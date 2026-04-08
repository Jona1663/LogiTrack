document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GESTIÓN DE SESIÓN Y HEADER PERSISTENTE ---
    const infoUsuario = document.getElementById('info-usuario');
    const btnLogout = document.getElementById('btn-logout');
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');

    if (usuarioGuardado) {
        const user = JSON.parse(usuarioGuardado);
        
        const rolReal = user.rol.trim().toLowerCase();
        const rolCapitalizado = rolReal.charAt(0).toUpperCase() + rolReal.slice(1);
        
        if (infoUsuario) {
            infoUsuario.textContent = `${rolCapitalizado} | ${user.nombre}`;
        }

        const btnNuevoEnvio = document.getElementById('btn-nuevo-envio');
        if (rolReal === 'supervisor' && btnNuevoEnvio) {
            btnNuevoEnvio.style.setProperty('display', 'none', 'important');
        }

        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
            btnLogout.onclick = () => {
                if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                    localStorage.removeItem('usuarioLogueado');
                    window.location.href = 'index.html';
                }
            };
        }

    } else {
        window.location.href = 'index.html';
        return;
    }

    // --- 2. LÓGICA DE LA TABLA Y DATOS ---
    let envios = []; 

    const tbody = document.getElementById('tabla-envios-body');
    const inputBusqueda = document.getElementById('input-busqueda');
    const selectEstado = document.getElementById('select-estado');
    const mensajeVacio = document.getElementById('mensaje-vacio');

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

                // Celda de Estado (Solo Supervisor edita)
                const celdaEstado = rolReal === 'supervisor'
                    ? `<select class="edit-estado" data-id="${envio.id}">
                        <option value="Pendiente" ${envio.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En tránsito" ${envio.estado === 'En tránsito' ? 'selected' : ''}>En tránsito</option>
                        <option value="En sucursal" ${envio.estado === 'En sucursal' ? 'selected' : ''}>En sucursal</option>
                        <option value="Entregado" ${envio.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                        <option value="Cancelado" ${envio.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>`
                    : `<span class="badge ${getEstadoClass(envio.estado)}">${envio.estado}</span>`;

                // --- NUEVA LÓGICA: Celda de Prioridad (Solo Operador edita) ---
                const celdaPrioridad = rolReal === 'operador'
                    ? `<select class="edit-prioridad" data-id="${envio.id}">
                        <option value="Baja" ${envio.prioridad === 'Baja' ? 'selected' : ''}>Baja</option>
                        <option value="Media" ${envio.prioridad === 'Media' ? 'selected' : ''}>Media</option>
                        <option value="Alta" ${envio.prioridad === 'Alta' ? 'selected' : ''}>Alta</option>
                    </select>`
                    : `<span class="badge ${getPrioridadClass(envio.prioridad)}">${envio.prioridad}</span>`;

                tr.innerHTML = `
                    <td><strong>${envio.trackingId}</strong></td>
                    <td>${envio.destino}</td>
                    <td>${celdaEstado}</td>
                    <td>${celdaPrioridad}</td>
                    <td style="text-align: center;">
                        <a href="detalle.html?id=${envio.trackingId}" class="btn-link">Ver detalle</a>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Eventos para cambios de Estado
            document.querySelectorAll('.edit-estado').forEach(select => {
                select.addEventListener('change', (e) => actualizarCampo(e.target.dataset.id, { estado: e.target.value }, 'Estado'));
            });

            // Eventos para cambios de Prioridad
            document.querySelectorAll('.edit-prioridad').forEach(select => {
                select.addEventListener('change', (e) => actualizarCampo(e.target.dataset.id, { prioridad: e.target.value }, 'Prioridad'));
            });
        }
    };
    
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

    // Función genérica para actualizar campos (Estado o Prioridad)
    const actualizarCampo = async (id, objetoData, nombreCampo) => {
        try {
            const res = await fetch(`http://localhost:3000/envios/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objetoData)
            });

            if (res.ok) {
                alert(`${nombreCampo} actualizado correctamente.`);
                const index = envios.findIndex(e => String(e.id) === String(id));
                if (index !== -1) {
                    // Actualizamos dinámicamente el valor en nuestro array local
                    const campo = Object.keys(objetoData)[0];
                    envios[index][campo] = objetoData[campo];
                }
                aplicarFiltros(); 
            } else {
                alert(`Error al actualizar el ${nombreCampo.toLowerCase()}.`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert('No se pudo conectar con el servidor.');
        }
    };
});