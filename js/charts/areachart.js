import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();

var margin = { top: 0, right: 5, bottom: 70, left: 70 },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svg = d3.select("#area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/csv/cleaned/drug_deaths_cleaned.csv").then(data => {
    data.forEach(d => {
        d.Year = +d.Year;
        d.DeathRate = +d.DeathRate;
    });

    //X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-family", prata)
        .style("font-size", "12px");

    svg.append("text")
        .attr("x", width / 2 + 3)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .style("font-family", antic)
        .style("font-weight", "bold")
        .text("Timeline");

    //Y axis
    var y = d3.scaleLinear()
        .domain([0, 1.5])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-family", prata)
        .style("font-size", "12px");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-family", antic)
        .style("font-weight", "bold")
        .text("Death Rate");

    //Area
    svg.append("path")
        .datum(data)
        .attr("fill", orange)
        .attr("d", d3.area()
            .x(function (d) { return x(d.Year) })
            .y0(y(0))
            .y1(function (d) { return y(d.DeathRate) })
        )
});