let d3 = require("d3");
//let zzz = require("./blah2");
let bc = require("./barchart");

function getGrowthRate() {
    // load covid-19 dataset
    // get last 5 samples  
    // 
    //const url =  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
    const url = "data/time_series_covid19_confirmed_global.csv";

    d3.csv(url, (d) => {
        if (d["Country/Region"] === "Canada") {
            return d;
        }
        return null;
    }).then((d) => {

        let provinceIdx = 0;
        let countryIdx = 1;
        let lat = 2;
        let lon = 3;

        let data = {};

        d.forEach(r => {

            let samples = [];
            let prev = 0
            d.columns.slice(4).forEach(e => {

                console.log(`${r[d.columns[0]]} ${e}=${r[e]}`)
                let sample = +r[e];
                let delta = sample - prev
                prev = sample

                samples.push({name: e, value: delta});
            });

            data[r[d.columns[0]]] = Object.assign(samples, {
                format: "%",
                y: "Y label"
            });
        });

        const key = "Newfoundland and Labrador";
        let svg = bc.barChart(data[key]);

        d3.select("#main").append(() => svg);
    });
}

getGrowthRate();