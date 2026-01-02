import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();

var margin = { top: 40, right: 150, bottom: 60, left: 70 },
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const svg = d3.select("#groupedbar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
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

const category = ["deaths_a", "deaths_b", "deaths_civilians", "deaths_unknown"];
const colors = d3.scaleOrdinal()
    .domain(category)
    .range([orange, black, prata, antic]);

d3.csv("data/csv/cleaned/fatalities_israelpalestine_cleaned.csv").then(data => {
    
	data.forEach(d => {
        d.year = +d.year;
    });

    const x0 = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.2);
    
    const x1 = d3.scaleBand()
        .domain(category)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");

	const maxY = d3.max(data, d => d3.max(category, key => d[key]));
    const y = d3.scaleLinear()
        .domain([0, 9000])
        .nice()
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .tickFormat(d => d3.format(",")(d).replace(/,/g, "."));

    svg.append("g")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");

    svg.append("text")
        .attr("class", "yAxisTitle")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "Roboto Slab")
        .text("Total occurrences");

    const yearGroups = svg.selectAll(".year-group")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "year-group")
        .attr("transform", d => `translate(${x0(d.year)},0)`);
    
    yearGroups.selectAll("rect")
        .data(d => category.map(key => ({key: key, value: d[key], year: d.year})))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => colors(d.key))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.7);
            tooltip.style("opacity", 1)
                   .html(`<strong>${d.key}</strong><br/>Count: ${d3.format(",")(d.value).replace(/,/g, ".")}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 1);
            tooltip.style("opacity", 0);
        });

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(category)
      .enter()
      .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);
    
    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => colors(d));
    
    legendItems.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-family", "Fira Sans")
      .text(d => d);
    
    if (window.updateGroupedBarChartTheme) {
        const initialTheme = document.body.classList.contains("body-mode");
        window.updateGroupedBarChartTheme(initialTheme);
    }
})
.catch(error => {
    console.error("Error loading grouped bar chart data:", error);
});