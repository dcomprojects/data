const r = require("random");
const d3 = require("d3");
const tt = require("./tt");

const buildSvg = (samples, f, df, df2) => {

    const margin = ({
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
    });
    const height = 500;
    const width = 1000;

    const calculated = [];
    samples.forEach(e => {
        calculated.push([e[0], f(e[0])]);
    });

    const x = d3.scaleLinear()
        .domain([d3.min(samples, d => d[0]), d3.max(samples, d => d[0])]).nice()
        .range([margin.left, width - margin.right]);

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));


    const y = d3.scaleLinear()
        .domain([d3.min(samples, d => d[1]), d3.max(samples, d => d[1])]).nice()
        .range([height - margin.bottom, margin.top]);

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(samples.y));

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
    .domain([d3.min(calculated, d => df(d[0])), d3.max(calculated, d => df(d[0]))])
    .range([2, 20]);

    const colorScale = d3.scaleSequential(
        [d3.min(calculated, d => df2(d[0])), d3.max(calculated, d => df2(d[0]))],
        d3.interpolateSpectral);

    console.log(`
    Line Width: ${df(samples[0][0])}
    Line Width: ${lineWidth(df(samples[0][0]))}
    `);

    function zoom(svg) {
        const extent = [
            [margin.left, margin.top],
            [width - margin.right, height - margin.top]
        ];

        svg.call(d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed));

        function zoomed() {
            svg.selectAll("g").attr("transform", d3.event.transform);
        }
    }

    let data2 = [];
    for (let i = 0; i < calculated.length - 1; i++) {
        data2.push([calculated[i], calculated[i + 1]]);
    }

    svg.call(zoom);

    svg.append("g")
        .selectAll("path")
        .data(data2)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", d => colorScale(df2(d[0][0]))) //color ~ acceleration
        .attr("stroke-width", d => lineWidth(df(d[0][0]))) //width ~ speed
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    svg.append("g")
        .append("path")
        .datum(samples)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line); 

    svg.append("g")
        .append("path")
        .datum(calculated)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line); 


    return svg.node();
};

const jitter = r.normal(0, 0.01);
const fJitter = (x, jitter) => {

    //(x-10)^3
    const a = 1; 
    const b = -30; 
    const c = 300; 
    const d = -1000;

    return f(x, [a, b, c, d]) + jitter();
};

const f = (i, coeff) => {

    const c = coeff.slice(-4);
    const x = i;

    //return Math.cos(x);
    //return Math.sin(x);

    return (x * x * x * c[0])
        + (x * x * c[1])
        + (x * c[2])
        + (c[3]);
};

const samples = [];

const start = -20;
const inc = 40.0/200.0;
for (let i = 0; i < 200; i++) {
    const x = start + (i * inc);
    const y = fJitter(x, jitter);
    samples.push([x,y]);
}

const data = tt.getDataApproximation(samples);
const node = buildSvg(data.samples, data.f, data.df, data.d2f);

d3.select("#main").append(() => node);