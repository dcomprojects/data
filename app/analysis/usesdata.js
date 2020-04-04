let data = require("./data");
let d3 = require("d3");
let bc = require("./barchart");
let z = require("./zoomable");

data.load().then(d => {
    let countryData = d.getCountryCounts();
    d3.select("#main").append(() => z.zoomable(countryData));
});