let d3 = require("d3");
let bc = require("./barchart");

function getRollup(data) {

    totals = {};

    const formatTime = d3.timeFormat("%m/%d/%y");
    const parseTime = d3.timeParse("%m/%d/%y");

    Object.keys(data).forEach(e => {

        if (e !== "Recovered") {
            console.log(e);
            console.log(data[e]);
            
            data[e].forEach(o => {

                key = formatTime(o.name);
                if (!(key in totals)) {
                    totals[key] = 0;
                }
                totals[key] += o.value;
            });
        }
    });

    ret = [];

    Object.keys(totals).forEach(k => {
        const formatTime = d3.timeFormat("%B %d, %Y");
        ret.push({"name": parseTime(k), "value": totals[k]});
    });

    return ret; 
}

function getGrowthRate(countryFilter, regionKey) {
    const url =  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
    //const url = "data/time_series_covid19_confirmed_global.csv";

    d3.csv(url, (row) => {

        if (typeof countryFilter === 'function') {
            if (countryFilter(row)) {
                return row;
            } else {
                return null;
            }
        }
        return row;

    }).then((dataFrame) => {

        let provinceIdx = 0;
        let countryIdx = 1;
        let lat = 2;
        let lon = 3;

        let data = {};

        let parseTime = d3.timeParse("%m/%d/%y");

        let startDate = parseTime("2/1/20"); 

        dataFrame.forEach(row => {

            let samples = [];
            let prev = 0
            dataFrame.columns.slice(4).forEach(e => {

                console.log(`${row[dataFrame.columns[0]]} ${e}=${row[e]}`)

                let sample = +row[e];
                let delta = sample - prev;
                prev = sample;

                let date = parseTime(e);
                if (date > startDate) {
                    samples.push({name: date, value: delta});
                }
            });

            data[row[dataFrame.columns[0]]] = Object.assign(samples, {
                format: "%",
                y: "Y label"
            });
        });

        rollup = getRollup(data); 
        Object.assign(rollup, {
            y: "Totals"
        });

        console.log(rollup);
        console.log(data[regionKey]);
        let svg = bc.barChart(data[regionKey]);
        //let svg = bc.barChart(rollup);
        d3.select("#main").append(() => svg);
    });
}


const countryFilter = r => {
        if (r["Country/Region"] === "Canada") {
            return r;
        }
        return null;
};

//const region = "Newfoundland and Labrador";
const region = "Ontario";

getGrowthRate(countryFilter, region);