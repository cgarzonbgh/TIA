console.log("Iniciando con D3.js");

// Lee el archivo json
d3.json("https://raw.githubusercontent.com/cgarzonbgh/TIA/main/Deuda_Colombia_V1.json").then(

    // Dibuja el gráfico con los datos del archivo json:
    function (datos) {
        console.log(datos);


        // Establece los márgenes del gráfico
        const margin = { top: 10, right: 15, bottom: 30, left: 160 };

        // Establece las dimensiones del gráfico
        const height = 450 - margin.top - margin.bottom;
        const width = 1000 - margin.left - margin.right;

        // Añade el SVG al body del HTML con los márgenes ajustados
        const svgHistograma = d3
            .select("#chart2")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Cambia el formato fecha del periodo
        datos.forEach(function (d) {
            d.Fecha = d3.timeParse("%Y-%m-%d")(`${d.Año}-${getMonthLoweCaseFromString(d.Periodo)}-${1}`)
        });

        // Crea la escala X
        const escalaX = d3
            // Establece la escala x segun la fecha provista
            .scaleTime()
            .domain(d3.extent(datos, function (d) { return d.Fecha; }))
            .range([0 + margin.left, width - margin.right]);

        // Crea la escala Y
        const escalaY = d3
            .scaleLinear()
            .domain(d3.extent(datos, d => parseNumber(d["Valor (Millones EUR)"])))
            .range([height - margin.bottom, 0 + margin.top]);

        // Visualiza eje x
        const ejeX = d3
            .axisBottom(escalaX)
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
            // Establace el tick de la leyenda en la mitad del eje X
            .attr("x", 500)
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
            // Establece la posicion de la leyenda en el eje X
            .attr("x", -(270))
            // Establece la posicion de la leyenda en el eje Y
            .attr("y", margin.left - 150)
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
                .y(function (d) { return escalaY(parseNumber(d["Valor (Millones EUR)"])); })
            )
            // Añade un tooltip cuando el ratón se mueve
            .on("mouseover", function () {
                const [x, y] = d3.mouse(this);
                const invertX = escalaX.invert(x);
                const dato = datos.find(function (d) {
                    return d.Fecha.getFullYear() === invertX.getFullYear();
                });
                console.log(dato);
                pintarTooltip(dato);
            })
            // Borra el tooltip cuando el ratón se mueve
            .on("mouseout", borrarTooltip);

        // Crea el tooltip
        var tooltip = d3
            .select("#chart2")
            .append("div")
            .attr("class", "tooltip")

        // Pinta el tooltip para cada valor seleccionado
        function pintarTooltip(d) {
            tooltip
                // Añade el contenido del tooltip
                .text("Año " + d.Año + " --- €" + (parseNumber(d["Valor (Millones EUR)"])).toLocaleString("en-US"))
                // Establece la posición del tooltip en el eje Y
                .style("top", d3.event.pageY + "px")
                // Establece la posición del tooltip en el eje X
                .style("left", d3.event.pageX + "px")
                // Añade una transición para que el tooltip aparezca
                .transition()
                .style("opacity", 1)

        }

        // Borra el tooltip
        function borrarTooltip() {
            tooltip
                // Añade una transición para que el tooltip desaparezca
                .transition()
                .style("opacity", 0)
        }
    }
);

// Obtiene el número del mes a partir de su nombre
function getMonthLoweCaseFromString(mes) {

    const meses = {
        'enero': 1,
        'febrero': 2,
        'marzo': 3,
        'abril': 4,
        'mayo': 5,
        'junio': 6,
        'julio': 7,
        'agosto': 8,
        'septiembre': 9,
        'octubre': 10,
        'noviembre': 11,
        'diciembre': 12
    };

    // Devuelve el número del mes
    return meses[mes];
}

// Convierte el valor recibido en un número
function parseNumber(stringNumber) {
    // Remueve los caracteres no numéricos a excepción de la coma y el punto ( "$ 36.813.694.117,06") a (36.813.694.117,06)
    const cleanString = stringNumber.replace(/[^0-9.,]+/g, '');

    // Remueve los puntos (36.813.694.117,06) a (36813694117,06)
    const dotString = cleanString.replace(/\./g, '');

    // Remplaza la coma por un punto (36813694117,06) a (36813694117.06)
    const commaString = dotString.replace(',', '.');

    // Convierte la cadena a un número con dos decimales (36813694117.06) a (36813694117.06)
    const parsedNumber = parseFloat(commaString).toFixed(2);

    // Retorna el número a decimal
    return parseFloat(parsedNumber);
}