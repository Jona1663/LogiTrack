document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-alta-envio');
    const modal = document.getElementById('modal-exito');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    
    const trackingDisplay = document.getElementById('tracking-id-display');
    const prioridadDisplay = document.getElementById('prioridad-display');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página recargue al mandar el formulario

        // 1. Recopilar datos del formulario
        const formData = new FormData(form);
        const tipoEnvio = formData.get('tipoEnvio');
        const restricciones = formData.get('restricciones');

        // 2. Generar Tracking ID simulado (Ej: TRK12345)
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const trackingId = `TRK${randomNum}`;

        // 3. Mockear la lógica de la IA (Reglas simples para simular el Random Forest)
        let prioridadSugerida = 'Baja';
        if (tipoEnvio === 'Express' || restricciones === 'Fragil' || restricciones === 'Refrigerado') {
            prioridadSugerida = 'Alta';
        } else if (formData.get('volumen') === 'Grande') {
            prioridadSugerida = 'Media';
        }

        // 4. Crear el objeto del envío con los datos ingresados
        const nuevoEnvio = {
            id: trackingId, // JSON Server necesita un campo "id" obligatoriamente
            trackingId: trackingId,
            remitente: document.getElementById('remitente-nombre').value,
            destinatario: document.getElementById('destinatario-nombre').value,
            origen: document.getElementById('remitente-direccion').value,
            destino: document.getElementById('destinatario-direccion').value,
            estado: 'Pendiente', 
            prioridad: prioridadSugerida,
            fecha: new Date().toLocaleDateString('es-AR')
        };

        // 5. Enviar el objeto a la Mock API con un POST
        fetch('http://localhost:3000/envios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoEnvio)
        })
        .then(response => response.json())
        .then(data => {
            // 6. Mostrar resultado en el Modal recién cuando el servidor confirme
            trackingDisplay.textContent = data.trackingId;
            prioridadDisplay.textContent = data.prioridad;
            
            // Estilar la prioridad según el nivel
            prioridadDisplay.style.color = data.prioridad === 'Alta' ? 'red' : (data.prioridad === 'Media' ? 'orange' : 'green');
            
            modal.classList.remove('hidden');
        })
        .catch(error => console.error('Error al guardar el envío:', error));
    });

    // 7. Acción al cerrar el modal de éxito
    btnCerrarModal.addEventListener('click', () => {
        window.location.href = 'listado.html'; 
    });
});