import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();

var margin = { top: 40, right: 40, bottom: 60, left: 80 },
    width = 750 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const svg = d3.select("#groupedbar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", `${beige}`)
    .style("border", `1px solid ${black}`)
    .style("padding", "10px")
    .style("z-index", "999")
    .style("pointer-events", "none")
    .style("font-family", prata)
    .style("font-size", "14px");

const category = ["Government of Israel", "Hamas and armed groups", "Civilians"];
const colors = d3.scaleOrdinal()
    .domain(category)
    .range([black, green, orange]);

d3.csv("data/csv/cleaned/fatalities_israelpalestine_per_side.csv").then(data => {
    const plotData = category.map(cat => {
        return {
            name: cat,
            value: +data[0][cat]
        };
    });

    const x = d3.scaleBand()
        .domain(category)
        .range([0, width])
        .padding(0.4);
    
    const maxY = d3.max(plotData, d => d.value);
    const y = d3.scaleLinear()
        .domain([0, maxY])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-family", prata);

    const yAxis = d3.axisLeft(y)
        .tickFormat(d => d3.format(",")(d).replace(/,/g, "."));

    svg.append("g")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-family", prata);

    svg.append("text")
        .attr("class", "yAxisTitle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -(height / 2))
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", prata)
        .text("Total Casualties");

    svg.selectAll(".bar")
        .data(plotData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => colors(d.name))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.7);
            tooltip.style("opacity", 1)
                   .html(`<strong>${d.name}</strong><br/>Count: ${d3.format(",")(d.value).replace(/,/g, ".")}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 1);
            tooltip.style("opacity", 0);
        });

})
.catch(error => {
    console.error("Error loading bar chart data:", error);
});