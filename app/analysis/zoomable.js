let d3 = require("d3");
let s = require("./stats");

function drawStats(svg, data, stats2, idx, x, y) {

    //const sobj = stats2[idx].stats.actual;
    const sobj = stats2[idx].stats.avg;
    console.log(sobj);

    const data2 = [];
    for (let i = 0; i < sobj.samples.length-1; ++i) {
        /*
        console.log(`
            ${(data[i].name)} ${data[i].value}
            ${sobj.f(i)}
            ${sobj.df(i)}
            ${sobj.d2f(i)}
        `);
        */
        let ii0 = sobj.samples[i][0];
        let ii1 = sobj.samples[i+1][0];
        data2.push([
            //[data[i].name, stats.df(i)],
            //[data[i+1].name, stats.df(i+1)]

            //[data[i].name, stats.samples[i][1]],
            //[data[i+1].name, stats.samples[i+1][1]]

            [ii0, sobj.f(ii0)],
            [ii1, sobj.f(ii1)]

        ]);
    }

    const names = [];
    for (let i = 0; i < data.length; ++i) {
        names.push(data[i].name);
    }

    console.log(data2);
    console.log(names);

    const lineWidth = d3.scaleLinear()
        .domain([
            d3.min(sobj.samples, d => Math.abs(sobj.df(d[0]))), 
            d3.max(sobj.samples, d => Math.abs(sobj.df(d[0])))
        ])
        .range([2, 20]);

    const line = d3.line()
        .defined(d => !isNaN(d[1]))
        .x(d => x(names[d[0]]))
        .y(d => y(d[1]));

    svg.append("g")
    .attr("class", "pathgroup")
    .selectAll("path")
    .data(data2)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", "black") 
    /*
    .attr("stroke", d => {
        if (stats.df2(d[0][0]) == 0.0) {
            return "grey";
        } else if (d[0][0] > 0) {
            return positiveScale(stats.df2(d[0][0])); //color ~ acceleration
        } else {
            return negativeScale(stats.df2(d[0][0])); //color ~ acceleration
        }
    })
    */ 
    .attr("stroke-width", d => lineWidth(Math.abs(sobj.df(d[0][0])))) //width ~ speed
    //.attr("stroke-width", d => lineWidth(Math.abs(sobj.df(d[0][0])))) //width ~ speed
    //.attr("stroke-width", 10) 
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

}

function createZoomable(dataAll, context, stats2) {

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

            svg.selectAll(".pathgroup")
                .attr("transform", d3.event.transform);

            svg.selectAll(".x-axis").call(xAxis);
                //.selectAll("text");
                //.style("font-size", getFontSize(d3.event.transform.k));
            svg.selectAll(".blahblah")
                .each(sizeAndPlaceText);
        }
    };

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .call(zoom)
        .on("wheel.zoom", null);

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

    if (stats2 !== undefined) {
        drawStats(svg, dataAll, stats2, stats2.length - 1, xFull, y);
    }

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

    let cumulative = [];
    let sum = 0;
    data.forEach((e,i) => {
        sum += e.value;
        cumulative.push([ i, e.value ]);
    });

    const stats2 = s.getRollingStats(cumulative, 14);

    chart = createZoomable(data, context, stats2);

    selection.append(() => chart.svg.node());
    chart.sizeAndPlaceText2();

    return chart;
};

