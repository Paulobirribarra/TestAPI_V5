// public/js/resumenMensual.js
document.addEventListener('DOMContentLoaded', () => {
    // Obtener los datos agrupados desde el servidor (inyectados en la vista)
    const groupedResumenes = JSON.parse(document.querySelector('#resumenMensualData').textContent);

    // Preparar datos para el gráfico
    const years = Object.keys(groupedResumenes).sort();
    const datasets = years.map(year => {
        const meses = Array(12).fill(0); // Inicializar 12 meses con 0
        groupedResumenes[year].forEach(resumen => {
            meses[resumen.month - 1] = resumen.montoNeto; // Rellenar el mes correspondiente
        });
        return {
            label: year,
            data: meses,
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            fill: false
        };
    });

    // Configurar el gráfico
    const ctx = document.getElementById('montoNetoChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Monto Neto ($)' }
                },
                x: {
                    title: { display: true, text: 'Mes' }
                }
            }
        }
    });
});