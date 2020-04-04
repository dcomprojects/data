let d3 = require("d3");

exports.zoomable = function (data) {

    const margin = {
        top: 20,
        right: 0,
        bottom: 150,
        left: 50
    };

    const height = 500;
    const width = 1000;

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top]);

    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

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
            x.range([margin.left, width - margin.right].map(d => d3.event.transform.applyX(d)));
            svg.selectAll(".bars rect").attr("x", d => x(d.name)).attr("width", x.bandwidth());
            svg.selectAll(".x-axis").call(xAxis);
        }
    }

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .call(zoom);

    svg.append("g")
        .attr("class", "bars")
        .attr("fill", "steelblue")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value))
        .attr("width", x.bandwidth());

    svg.append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "5px")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    return svg.node();
};