const API = 'http://localhost:3000/envios';

document.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    if (!usuarioGuardado) return window.location.href = 'index.html';
    
    const user = JSON.parse(usuarioGuardado);
    if (user.rol !== 'supervisor') {
        alert('Acceso denegado. Exclusivo para supervisores.');
        return window.location.href = 'index.html';
    }

    document.getElementById('info-usuario').textContent = `Supervisor | ${user.nombre}`;
    

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

    cargarEnvios();
});

async function cargarEnvios() {
    try {
        const res = await fetch(API);
        const envios = await res.json();
        renderTabla(envios);
    } catch (error) {
        console.error('Error al cargar:', error);
    }
}

function renderTabla(envios) {
    const tbody = document.getElementById('tabla-supervisor');
    tbody.innerHTML = '';

    envios.forEach(envio => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${envio.trackingId}</strong></td>
            <td>${envio.remitente}</td>
            <td>${envio.destinatario}</td>
            <td>
                <select class="edit-estado" onchange="actualizarDato('${envio.id}', 'estado', this.value)">
                    <option value="Pendiente" ${envio.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En tránsito" ${envio.estado === 'En tránsito' ? 'selected' : ''}>En tránsito</option>
                    <option value="En sucursal" ${envio.estado === 'En sucursal' ? 'selected' : ''}>En sucursal</option>
                    <option value="Entregado" ${envio.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    <option value="Cancelado" ${envio.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
            <td>
                <select class="edit-estado" onchange="actualizarDato('${envio.id}', 'prioridad', this.value)">
                    <option value="Alta" ${envio.prioridad === 'Alta' ? 'selected' : ''}>Alta</option>
                    <option value="Media" ${envio.prioridad === 'Media' ? 'selected' : ''}>Media</option>
                    <option value="Baja" ${envio.prioridad === 'Baja' ? 'selected' : ''}>Baja</option>
                </select>
            </td>
            <td style="display: flex; gap: 10px; align-items: center;">
                <a href="detalle.html?id=${envio.trackingId}" class="btn-link">Detalle</a>
                <button onclick="eliminarEnvio('${envio.id}')" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function actualizarDato(id, campo, valor) {
    try {
        const body = {};
        body[campo] = valor;
        await fetch(`${API}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (error) {
        console.error('Error actualizando:', error);
        alert('No se pudo actualizar.');
    }
}

async function eliminarEnvio(id) {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente este envío?')) {
        try {
            await fetch(`${API}/${id}`, { method: 'DELETE' });
            cargarEnvios(); // Recargar la tabla
        } catch (error) {
            console.error('Error eliminando:', error);
        }
    }
}