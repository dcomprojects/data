let d3 = require("d3");

exports.zoomable = function (data, context) {

    const margin = {
        top: 20,
        right: 0,
        bottom: 150,
        left: 50
    };

    const height = 500;
    const width = 1000;

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top]);

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

        const getFontSize = k => {
            return (d3.min([d3.max([5, +k * 6]), 12])) + "px";
        };

    function zz(e, evt) {
        console.log(evt);
        x.range([margin.left, width - margin.right].map(d => evt.applyX(d)));
        e.selectAll(".bars rect")
            .attr("x", d => x(d.name))
            .attr("width", x.bandwidth());
        e.selectAll(".x-axis").call(xAxis)
            .selectAll("text")
            .style("font-size", getFontSize(evt.k));
        e.selectAll(".blahblah")
            .each(sizeAndPlaceText);
    }

        const extent = [
            [margin.left, margin.top],
            [width - margin.right, height - margin.top]
        ];

    let zoomb = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent);

    function zoom(svg) {

        /*
        svg.call(d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed));
        */
        svg.call(zoomb.on("zoom", zoomed));

        function zoomed() {
            console.log("called");
            x.range([margin.left, width - margin.right].map(d => d3.event.transform.applyX(d)));
            svg.selectAll(".bars rect")
                .attr("x", d => x(d.name))
                .attr("width", x.bandwidth());
            svg.selectAll(".x-axis").call(xAxis)
                .selectAll("text")
                .style("font-size", getFontSize(d3.event.transform.k));
            svg.selectAll(".blahblah")
                .each(sizeAndPlaceText);
        }
    }

    const sizeAndPlaceText = function (n) {
        console.log("HUH -2?");
        let t = d3.select(this);
        t.style("font-size", x.bandwidth() - 0.2);
        const len = t.node().getComputedTextLength();
        const height = y(0) - y(n.value);

        const dx = t.node().getBBox().height;
        const dx2 = x.bandwidth();

        const zz = Math.min(dx - dx2);

        if (+len > +height) {
            t.attr("transform", `
                translate(${dx/4})
                translate(${x(n.name) + dx2/2.0}, ${y(n.value) - (len/2.0)}) 
                rotate(-90)`);
        } else {
            t.attr("transform", `
                translate(${dx/4})
                translate(${x(n.name) + dx2/2.0}, ${y(n.value) + (len/2.0)}) 
                rotate(-90)`);
        }
    };

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .call(zoom);

    const drawBars = (g) => {
        g.append("rect")
            .on("click", context.onclick())
            .attr("x", d => x(d.name))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", x.bandwidth())
            .append("svg:title")
            .text(function (d) {
                return d.value;
            });
        g.append("g")
            .append("text")
            .attr("class", "blahblah")
            .style("fill", "red")
            .style("text-anchor", "middle")
            .text(d => d.value)
            .on("click", context.onclick());
    };

    svg.append("g")
        .attr("class", "bars")
        .attr("fill", "steelblue")
        .selectAll("g")
        .data(data)
        .join("g")
        .call(drawBars);

    svg.append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "10px")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);


    return svg.node();
};

