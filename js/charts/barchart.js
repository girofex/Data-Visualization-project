import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();

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
    if (chartCreated)
        return;
    
    chartCreated = true;

    d3.select("#bar svg").remove();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let isLandscape = false;
    if(screenWidth <= "844px" && screenHeight <= "390px")
        isLandscape = true;

    const margin = { top: 50, right: 10, bottom: 50, left: 10 };
    const width = (isLandscape ? 250 : 500) - margin.left - margin.right;
    const height = (isLandscape ? 250 : 350) - margin.top - margin.bottom;

    d3.csv("data/csv/cleaned/barchart.csv").then(data => {
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
            .style("font-size", (isLandscape ? "9" : "12") + "px")
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
                        .attr("dy", "1.4em")
                        .text(line);
                });
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - (isLandscape ? 180 : 280))
            .attr("text-anchor", "middle")
            .style("font-family", antic)
            .style("font-weight", "bold")
            .style("font-size", "1rem")
            .text("Casualties");

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
            .attr("height", d => height - y(d.value));

        svg.selectAll(".bar-label")
            .data(plotData)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => x(d.key) + x.bandwidth() / 2)
            .attr("y", d => y(d.value) - 5)
            .attr("text-anchor", "middle")
            .style("font-family", prata)
            .style("font-size", "12px")
            .text(d => d3.format(",")(d.value).replace(/,/g, "."));
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            createBarChart();
            observer.unobserve(entry.target)
        }
    });
},
    {
        threshold: 1,
        rootMargin: '0px 0px -200px 0px'
    });

const chartContainer = document.querySelector('#bar');
if (chartContainer) {
    observer.observe(chartContainer);
}