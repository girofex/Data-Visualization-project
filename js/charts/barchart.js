import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();

var margin = { top: 10, right: 5, bottom: 45, left: 80 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "fixed")
    .style("opacity", 0)
    .style("background-color", `${beige}`)
    .style("border", `1px solid ${black}`)
    .style("padding", "10px")
    .style("z-index", "999")
    .style("pointer-events", "none")
    .style("font-family", prata)
    .style("font-size", "14px");

const categoryKeys = ["Government of Israel", "Hamas and armed groups", "Civilians"];

const categoryLabels = {
    "Government of Israel": "Government\nof Israel",
    "Hamas and armed groups": "Hamas\nand armed groups",
    "Civilians": "Civilians"
};

const colors = d3.scaleOrdinal()
    .domain(categoryKeys)
    .range([black, green, orange]);

let chartCreated = false;

function createBarChart() {
    if (chartCreated) return;
    chartCreated = true;

    d3.csv("data/csv/cleaned/fatalities_israelpalestine_per_side.csv").then(data => {
        const plotData = categoryKeys.map(key => ({
            key,
            label: categoryLabels[key],
            value: +data[0][key]
        }));

        const svg = d3.select("#bar")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(categoryKeys)
            .range([0, width])
            .padding(0.4);

        const maxY = d3.max(plotData, d => d.value);
        const y = d3.scaleLinear()
            .domain([0, maxY])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => categoryLabels[d]))
            .selectAll("text")
            .style("font-family", prata)
            .style("font-size", "12px")
            .attr("text-anchor", "middle")
            .each(function (d) {
                const text = d3.select(this);
                const lines = categoryLabels[d].split("\n");

                if (lines.length > 1)
                    text.attr("dy", "-0.6em");

                text.text(null);
                lines.forEach((line, i) => {
                    text.append("tspan")
                        .attr("x", 0)
                        .attr("dy", "1.2em")
                        .text(line);
                });
            });

        const yAxis = d3.axisLeft(y)
            .tickFormat(d => d3.format(",")(d).replace(/,/g, "."));

        svg.append("g")
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "12px")
            .style("font-family", prata);

        svg.append("text")
            .attr("class", "yAxisTitle")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -(height / 2))
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("font-family", antic)
            .text("Total Casualties");

        svg.selectAll(".bar")
            .data(plotData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.key))
            .attr("y", height)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", d => colors(d.key))
            .transition()
            .duration(1000)
            .delay((d, i) => i * 200)
            .ease(d3.easeCubicOut)
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value))
            .on("end", function () {
                d3.select(this)
                    .on("mouseover", function (event, d) {
                        d3.select(this).attr("opacity", 0.6);

                        tooltip
                            .style("opacity", 1)
                            .html(`<strong>${d.label}</strong><br/>
                                ${d3.format(",")(d.value).replace(/,/g, ".")} total casualties`);
                    })
                    .on("mousemove", function (event) {
                        tooltip
                            .style("left", (event.clientX + 15) + "px")
                            .style("top", (event.clientY) + "px");
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("opacity", 1);
                        tooltip.style("opacity", 0);
                    });
            });
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            createBarChart();
            observer.unobserve(entry.target);
        }
    });
});

const chartContainer = document.querySelector('#bar');
if (chartContainer) {
    observer.observe(chartContainer);
}