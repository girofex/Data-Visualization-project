import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();

const margin = { top: 10, right: 180, bottom: 60, left: 50 },
    width = 690 - margin.left - margin.right,
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

let chartCreated = false;

function createStackedBarChart() {
    if (chartCreated) return;
    chartCreated = true;

    d3.csv("data/csv/cleaned/russian_possession_cleaned.csv").then(data => {
        data.forEach(d => {
            const parsed = d3.timeParse("%Y-%m-%d")(d.Date);
            d.DateStr = parsed ? d3.timeFormat("%d/%m/%y")(parsed) : d.Date;
            d.Russian_Possession = +d.Russian_Possession;
            d.Ukrainian_Possession = +d.Ukrainian_Possession;
        });

        const categories = ["Russian_Possession", "Ukrainian_Possession"];
        const colors = d3.scaleOrdinal()
            .domain(categories)
            .range([orange, green]);

        const stackedData = d3.stack().keys(categories)(data);

        const svgRoot = d3.select("#stackedbar")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const svg = svgRoot.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.DateStr))
            .range([0, width])
            .padding(0.5);

        const xAxis = d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 5)));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .attr("font-size", "12px")
            .style("font-family", prata)
            .style("text-anchor", "end");

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        const layers = svg.selectAll(".layer")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "layer")
            .attr("fill", d => colors(d.key));

        layers.selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data.DateStr))
            .attr("y", height)
            .attr("height", 0)
            .attr("width", x.bandwidth() + 5)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("opacity", 0.6);
                const key = this.parentNode.__data__.key;
                let valueLabel = "";
                let value = "";

                if (key === "Russian_Possession") {
                    valueLabel = "Russian Possession";
                    value = d.data.Russian_Possession;
                } else if (key === "Ukrainian_Possession") {
                    valueLabel = "Ukrainian Possession";
                    value = d.data.Ukrainian_Possession;
                }

                tooltip
                    .style("opacity", 1)
                    .html(`<strong>${d.data.DateStr}</strong><br/>
                        ${valueLabel}: ${value}%`);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.clientX + 15) + "px")
                    .style("top", (event.clientY) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
                tooltip.style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .delay((d, i) => i * 10)
            .ease(d3.easeCubicOut)
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]));

        const legend = svg.append("g")
            .attr("transform", `translate(${width + 20}, 0)`);

        const legendItems = legend.selectAll(".legend-item")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`);

        legendItems.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => colors(d));

        legendItems.append("text")
            .attr("class", "legendText")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-family", prata)
            .text(d => d.replace("_", " "));

        const peak = data.reduce((max, d) => d.Russian_Possession > max.Russian_Possession ? d : max, data[0]);

        const peakX = x(peak.DateStr) + x.bandwidth() - 1;
        const peakY = y(peak.Russian_Possession);

        svg.append("circle")
            .attr("cx", peakX)
            .attr("cy", peakY)
            .attr("r", 0)
            .attr("fill", beige)
            .attr("stroke", black)
            .attr("stroke-width", 2)
            .transition()
            .delay(1000)
            .duration(500)
            .ease(d3.easeBackOut)
            .attr("r", 12)
            .on("end", function () {
                d3.select(this)
                    .on("mouseover", function (event, d) {
                        d3.select(this).attr("opacity", 0.6);
                        tooltip.style("opacity", 1)
                            .html(`<strong>${peak.DateStr}</strong><br/>
                                Peak of Russian possession: ${peak.Russian_Possession}%`);
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
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            createStackedBarChart();
            observer.unobserve(entry.target)
        }
    });
},
    {
        threshold: 1,
        rootMargin: '0px 0px -200px 0px'
    });

const chartContainer = document.querySelector('#stackedbar');
if (chartContainer) {
    observer.observe(chartContainer);
}