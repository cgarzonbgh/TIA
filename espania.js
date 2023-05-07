console.log("Iniciando con D3.js");

// Lee el archivo json
d3.json("https://raw.githubusercontent.com/cgarzonbgh/TIA/main/evolucion_de_la_deuda_publica_de_espa%C3%B1a.json").then(

    // Dibuja el gráfico con los datos del archivo json:
    function (datos) {

        // Establece los márgenes del gráfico
        const margin = { top: 10, right: 15, bottom: 30, left: 60 };

        // Establece las dimensiones del gráfico
        const height = 450 - margin.top - margin.bottom;
        const width = 1000 - margin.left - margin.right;

        // Añade el SVG al body del HTML con los márgenes ajustados
        const svgHistograma = d3
            .select("#chart1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // Cambia el formato fecha del periodo
        datos.forEach(function (d) {
            d.Fecha = d3.timeParse("%Y-%m-%d")(`${d.Año}-${getMonthUppercaseFromString(d.Periodo)}-${1}`)
        });

        // Crea la escala X
        const escalaX = d3.scaleTime()
            .domain(d3.extent(datos, function (d) { return d.Fecha; }))
            .range([0 + margin.left, width - margin.right]);

        // Crea la escala Y
        const escalaY = d3.scaleLinear()
            .domain(d3.extent(datos, d => d.Valor))
            .range([height - margin.bottom, 0 + margin.top]);

        // Visualiza eje x
        const ejeX = d3.axisBottom(escalaX)

            // Pone ticks en el eje x
            .ticks(10)
            .tickFormat(d3.timeFormat("%Y"));

        // Añade el eje X
        svgHistograma
            .append("g")
            .attr("transform", "translate(0," + (height - margin.bottom + 5) + ")")
            .call(ejeX)
            // Selecciona todos los textos del eje X
            .selectAll("text")
            // Añade el estilo a los textos
            .attr("font-size", "12px");

        // Añade la leyenda en el eje X
        svgHistograma
            .append("text")
            .attr("x", width / 2)
            .attr("y", height + 15)
            .attr("fill", "black")
            .attr("font-size", "15px")
            .text("Año");

        // Visualiza eje y
        const ejeY = d3.axisLeft(escalaY)

        // Añade el eje Y
        svgHistograma
            .append("g")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .call(ejeY)
            // Selecciona todos los textos del eje Y
            .selectAll("text")
            // Añade el estilo a los textos
            .attr("font-size", "12px");


        // Añade la leyenda en el eje Y
        svgHistograma
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", margin.left - 100)
            .attr("dy", "1em")
            .style("font-size", "15px")
            .text("Deuda pública (Millones de Euros)");

        // Crea la linea
        svgHistograma
            .append("path")
            .datum(datos)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return escalaX(d.Fecha); })
                .y(function (d) { return escalaY(d.Valor); })
            );
    }
);

// Obtiene el número del mes a partir de su nombre
function getMonthUppercaseFromString(mes) {

    const meses = {
        'Enero': 1,
        'Febrero': 2,
        'Marzo': 3,
        'Abril': 4,
        'Mayo': 5,
        'Junio': 6,
        'Julio': 7,
        'Agosto': 8,
        'Septiembre': 9,
        'Octubre': 10,
        'Noviembre': 11,
        'Diciembre': 12
    };

    // Devuelve el número del mes
    return meses[mes];
}