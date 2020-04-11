let d3 = require("d3");
let data = require("./data");
let z = require("./zoomable");

data.load().then(d => {

    const context = {
        onclick: () => {
            return (c) => {
                let countryData = d.getRegionCounts(c.name);
                d3.select("#country").append(() => z.zoomable(countryData, {onclick: () => {}}));
            };
        },
    };

    let allCountries = d.getCountryCounts();
    let countryData = d.getRegionCounts("Canada");
    d3.select("#all").append(() => z.zoomable(allCountries, context));
});