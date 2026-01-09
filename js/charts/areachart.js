import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const beige = getComputedStyle(document.documentElement).getPropertyValue("--beige").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "fixed")
    .style("opacity", 0)
    .style("background-color", beige)
    .style("border", `1px solid ${black}`)
    .style("padding", "10px")
    .style("z-index", "999")
    .style("pointer-events", "none")
    .style("font-family", prata)
    .style("font-size", "14px")
    .style("line-height", "1.5")
    .style("max-width", "200px");

export function renderAreaChart() {
    d3.select("#area svg").remove();

    const screenWidth = window.innerWidth;
    const isPortrait = false;
    if(screenWidth <= "978px" && window.matchMedia('(orientation: portrait)'))
        isPortrait = true;

    const margin = { top: 70, right: 10, bottom: 70, left: 30 };
    const width = (isPortrait ? 300 : 500) - margin.left - margin.right;
    const height = (isPortrait ? 200 : 300) - margin.top - margin.bottom;

    d3.csv("data/csv/cleaned/areachart.csv").then(data => {
        data.forEach(d => {
            d.Year = +d.Year;
            d.DeathRate = +d.DeathRate;
        });

        var svg = d3.select("#area")
            .attr("data-animate", "false")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const title = svg.append('text')
            .attr('x', width / 2)
            .attr('y', -30)
            .attr("text-anchor", "middle")
            .style("font-family", antic)
            .style("font-size", "1rem")
            .style("font-weight", "bold")
            .style("line-height", "1.4");

        if (isPortrait) {
            title.append("tspan")
                .attr("x", width / 2)
                .attr("dy", 0)
                .text("Mean number of people every 100k");

            title.append("tspan")
                .attr("x", width / 2)
                .attr("dy", "1.2em")
                .text("that die for drug use");
        } else {
            title.text("Mean number of people every 100k that die for drug use");
        }


        //X axis
        var x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Year))
            .range([0, width]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(5))
            .selectAll("text")
            .style("font-family", prata)
            .style("font-size", "12px");

        svg.append("text")
            .attr("x", width / 2 - 6)
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
            .call(d3.axisLeft(y).ticks(4))
            .selectAll("text")
            .style("font-family", prata)
            .style("font-size", "12px");

        //Area
        const clip = svg.append("defs")
            .append("clipPath")
            .attr("id", "clip-area");

        const clipRect = clip.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", height);

        svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("fill", orange)
            .attr("clip-path", "url(#clip-area)")
            .attr("d", d3.area()
                .x(d => x(d.Year))
                .y0(y(0))
                .y1(d => y(d.DeathRate))
            );

        //Vertical line with tooltip
        const focus = svg.append("g")
            .style("display", "none");

        focus.append("line")
            .attr("class", "focus-line")
            .attr("stroke", black)
            .attr("stroke-width", 1)
            .attr("y1", 0)
            .attr("y2", height);

        focus.append("circle")
            .attr("r", 5)
            .attr("fill", beige)
            .attr("stroke", black)
            .attr("stroke-width", 2);

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", () => focus.style("display", null))
            .on("mouseout", () => {
                focus.style("display", "none");
                tooltip.style("opacity", 0);
            })
            .on("mousemove", function (event) {
                const [mouseX] = d3.pointer(event);
                const x0 = x.invert(mouseX);

                const bisect = d3.bisector(d => d.Year).left;
                const index = bisect(data, x0);
                const d0 = data[index - 1];
                const d1 = data[index];

                const d = d1 && d0 ? (x0 - d0.Year > d1.Year - x0 ? d1 : d0) : (d0 || d1);

                if (d) {
                    focus.select("line")
                        .attr("x1", x(d.Year))
                        .attr("x2", x(d.Year));

                    focus.select("circle")
                        .attr("cx", x(d.Year))
                        .attr("cy", y(d.DeathRate));

                    tooltip.style("opacity", 1)
                        .html(`<strong>Year:</strong> ${d.Year}<br/><strong>Death Rate:</strong> ${d.DeathRate.toFixed(2)}`)
                        .style("left", (event.clientX + 15) + "px")
                        .style("top", (event.clientY) + "px");
                }
            });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = "true";

                    clipRect
                        .transition()
                        .duration(2500)
                        .ease(d3.easeSin)
                        .attr("width", width);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(d3.select("#area svg").node());
    });
};

window.addEventListener("resize", () => {
    renderAreachart();
});