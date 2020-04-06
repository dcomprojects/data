let data = require("./data");
let d3 = require("d3");
let bc = require("./barchart");
let z = require("./zoomable");

data.load().then(d => {
    let countryData = d.getCountryCounts();
    let canadaData = d.getRegionCounts("Canada");
    d3.select("#all").append(() => z.zoomable(countryData));
    d3.select("#canada").append(() => z.zoomable(canadaData));
});