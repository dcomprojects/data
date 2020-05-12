let d3 = require("d3");

function createZoomable(dataAll, context) {

    const a25 = Array.from(Array(25), (e, i) => i);

    const margin = {
        top: 20,
        right: 0,
        bottom: 150,
        left: 50
    };

    const height = 500;
    const width = 1000;

    const y = d3.scaleLinear()
        .domain([0, d3.max(dataAll, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top]);

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    const xRef = d3.scaleBand()
        .domain(a25)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const newWidth = xRef.step() * Math.max(1, dataAll.length - 0.1 + 0.1 * 2);

    const xFull = d3.scaleBand()
        .domain(dataAll.map(d => d.name))
        .range([margin.left, newWidth - margin.right])
        .padding(0.1);

    let axisBottom = d3.axisBottom(xFull).tickSizeOuter(0);
    if ('xAxisFormat' in context) {
        axisBottom = axisBottom.tickFormat(context.xAxisFormat);
    }

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(axisBottom);

        const getFontSize = k => {
            return (d3.min([d3.max([5, +k * 6]), 12])) + "px";
        };

        const extentLarge = [
            [margin.left, margin.top],
        [newWidth - margin.right, height - margin.top]
        ];

        const extentSmall = [
            [margin.left, margin.top],
        [width - margin.right, height - margin.top]
        ];

    const sizeAndPlaceText = function (n) {
        let t = d3.select(this);
        t.style("font-size", xFull.bandwidth() - 0.5);
        const len = t.node().getComputedTextLength();
        const height = y(0) - y(n.value);

        const dx = t.node().getBBox().height;
        const dx2 = xFull.bandwidth();

        if (+len > +height) {
            t.attr("transform", `
                translate(${dx/4})
                translate(${xFull(n.name) + dx2/2.0}, ${y(n.value) - (len/2.0)}) 
                rotate(-90)`);
        } else {
            t.attr("transform", `
                translate(${dx/4})
                translate(${xFull(n.name) + dx2/2.0}, ${y(n.value) + (len/2.0)}) 
                rotate(-90)`);
        }
    };

    let zoomBehavior = d3.zoom()
    .scaleExtent([1,1])
    .translateExtent(extentLarge)
    .extent(extentSmall);

    const zoom = (svg) => {

        svg.call(zoomBehavior.on("zoom", zoomed));

        function zoomed() {
            console.log("called");
            xFull.range([extentLarge[0][0], extentLarge[1][0]].map(d => d3.event.transform.applyX(d)));
            svg.selectAll(".bars rect")
                .attr("x", d => xFull(d.name))
                .attr("width", xFull.bandwidth());
            svg.selectAll(".x-axis").call(xAxis);
                //.selectAll("text");
                //.style("font-size", getFontSize(d3.event.transform.k));
            svg.selectAll(".blahblah")
                .each(sizeAndPlaceText);
        }
    };

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .call(zoom);

    const drawBars = (g) => {
        g.append("rect")
            .on("click", context.onclick())
            .attr("x", d => xFull(d.name))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", xFull.bandwidth())
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
        .data(dataAll)
        .join("g")
        .call(drawBars);

    svg.append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "15px") //compute this dynamically...
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    const fn = function () {
           this.svg.selectAll(".blahblah").each(sizeAndPlaceText); 
    };

    const slideRight = function() {

        console.log(this.svg.select(".bars").node().getBBox());
        this.svg.transition().duration(3000).call(s => zoomBehavior.translateBy(s, -10000, 0));
        //d3.select(this.svg.node()).transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(1000, 0));
    };

    ret = {
        svg: svg,
    };

    ret.sizeAndPlaceText2 = fn.bind(ret); 
    ret.slideRight = slideRight.bind(ret);

    return ret;

}

exports.appendChart = function (selection, data, context) {

    chart = createZoomable(data, context);

    selection.append(() => chart.svg.node());
    chart.sizeAndPlaceText2();

    return chart;
};

exports.appendChartWithStats = function (selection, data, context) {

    let data2 = [];
    let sum = 0;
    data.forEach(e => {
        sum += e.value;
        data2.push({
            name: e.name,
            value: sum 
        });
    });

    data2 = Object.assign(data2, {
        format: "%",
        y: "Count"
    });
    chart = createZoomable(data2, context);

    selection.append(() => chart.svg.node());
    chart.sizeAndPlaceText2();

    return chart;
};

