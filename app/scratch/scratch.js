const d3 = require("d3");
const tt = require("./tt");

const buildSvg = (data, df, df2, actual, calculated) => {

    const margin = ({
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
    });
    const height = 500;
    const width = 1000;

    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d[0]), d3.max(data, d => d[0])]).nice()
        .range([margin.left, width - margin.right]);

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));


    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d[1]), d3.max(data, d => d[1])]).nice()
        .range([height - margin.bottom, margin.top]);

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y));

    const xAxis2 = g => g
        .attr("transform", `translate(0,${y(0)})`)
        .call(d3.axisBottom(x).tickValues([]));

    const yAxis2 = g => g
        .attr("transform", `translate(${x(0) - margin.left},0)`)
        .call(d3.axisLeft(y).tickValues([]));

    const line = d3.line()
        .defined(d => !isNaN(d[1]))
        .x(d => x(d[0]))
        .y(d => y(d[1]));

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .call(xAxis);
    svg.append("g")
        .call(xAxis2);

    svg.append("g")
        .call(yAxis)
        .append("g")
        .call(yAxis2);

    const lineWidth = d3.scaleLinear()
    .domain([d3.min(data, d => df(d[0])), d3.max(data, d => df(d[0]))])
    .range([1, 10]);

    console.log(`
    Line Width: ${df(data[0][0])}
    Line Width: ${lineWidth(df(data[0][0]))}
    `);

    /*
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", d => lineWidth(d[0]))
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);
    */

    let data2 = [];
    for (let i = 0; i < data.length-1; i++) {
        data2.push([data[i], data[i+1]]);
    }

    svg.selectAll("path")
        .data(data2)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", d => lineWidth(df(d[0][0])))
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line); 

    svg.append("path")
        .datum(df2)
        .attr("fill", "none")
        .attr("stroke", "yellow")
        .attr("stroke-width", 2.0)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    svg.append("path")
        .datum(actual)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    svg.append("path")
        .datum(calculated)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.0)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    return svg.node();
};

console.log(tt.df);
const node = buildSvg(tt.someData, tt.df, tt.df2, tt.actual, tt.calculated);

d3.select("#main").append(() => node);