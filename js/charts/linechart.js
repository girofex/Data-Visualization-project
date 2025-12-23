import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { annotation, annotationLabel } from "https://cdn.jsdelivr.net/npm/d3-svg-annotation@2.5.1/+esm";

const antic = getComputedStyle(document.documentElement).getPropertyValue("--antic").trim();
const prata = getComputedStyle(document.documentElement).getPropertyValue("--prata").trim();
const black = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const white = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();

const margin = { top: 70, right: 150, bottom: 55, left: 110 },
    width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

const parseDate = d3.timeParse("%Y-%m-%d");

const observerOptions = { root: null, threshold: 0.5 };

const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const svg = d3.select(entry.target);
            if (svg.attr("data-animate") === "false") {
                svg.attr("data-animate", "true");

                svg.selectAll(".line").each(function () {
                    const totalLength = this.getTotalLength();
                    d3.select(this)
                        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(2500)
                        .ease(d3.easeSin)
                        .attr("stroke-dashoffset", 0);
                });
            }
        }
    });
}, observerOptions);

d3.csv("data/csv/cleaned/timeline_trends_cleaned.csv").then(data => {
    data.forEach(d => {
        d.Week = parseDate(d.Week);
        d.RussianUkranianWar = +d.RussianUkranianWar;
        d.IsraeliPalestinianWar = +d.IsraeliPalestinianWar;
        d.DrugWar = +d.DrugWar;
    });

    const keys = ["RussianUkranianWar", "IsraeliPalestinianWar", "DrugWar"];

    const datasets = keys.map(k => ({
        name: k,
        data: data.map(d => ({
            Week: d.Week,
            value: d[k]
        }))
    }));

    const svgRoot = d3.select("#linechart")
        .append("svg")
        .attr("data-animate", "false")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    chartObserver.observe(svgRoot.node());

    const svg = svgRoot.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleOrdinal()
        .domain(keys)
        .range([black, orange, white]);

    //X axis
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Week))
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(7))
        .selectAll("text")
        .style("font-family", prata)
        .style("font-size", "12px");

    svg.append("text")
        .attr("y", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .style("font-family", antic)
        .style("font-weight", "bold")
        .text("Timeline");

    //Y axis
    const y = d3.scaleLinear()
        .domain([
            0,
            d3.max(datasets, d => d3.max(d.data, p => p.value))
        ])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d3.format(",")(d).replace(/,/g, ".")))
        .selectAll("text")
        .style("font-family", prata)
        .style("font-size", "12px");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-family", antic)
        .style("font-weight", "bold")
        .text("Interest Index");

    //Lines
    const lineGen = d3.line()
        .x(d => x(d.Week))
        .y(d => y(d.value));

    const groups = svg.selectAll(".area-line")
        .data(datasets)
        .join("g")
        .attr("class", "area-line");

    groups.append("path")
        .attr("class", "line")
        .attr("data-region", d => d.name)
        .attr("d", d => lineGen(d.data))
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.name))
        .attr("stroke-width", 2.5)
        .style("cursor", "pointer")
        .on("click", handleToggle);

    //Labels
    let labels = datasets.map(d => {
        const lastPoint = [...d.data].reverse().find(p => lineGen.defined()(p));

        return {
            name: d.name,
            color: colorScale(d.name),
            x: x(lastPoint.Week),
            y: y(lastPoint[yField]),
            origY: y(lastPoint[yField])
        };
    });

    const minSpacing = 18;
    labels.sort((a,b) => a.y - b.y);

    for (let i = 1; i < labels.length; i++) {
        if ((labels[i].y - labels[i-1].y) < minSpacing)
            labels[i].y = labels[i-1].y + minSpacing;
    }
    
    for (let i = labels.length - 2; i >= 0; i--) {
        if ((labels[i+1].y - labels[i].y) < minSpacing)
            labels[i].y = labels[i+1].y - minSpacing;
    }

    labels.forEach(l => {
        l.y = Math.max(0, Math.min(height, l.y));
        l.x = width + 8;
    });

    labels.forEach(l => {
        svg.append("text")
        .attr("data-region", l.name)
        .attr("x", l.x)
        .attr("y", l.y)
        .text(l.name)
        .style("font-family", antic)
        .style("font-size", "12px")
            .style("font-weight", "bold")
        .style("fill", l.color)
        .style("cursor", "pointer")
        .on("click", handleToggle);
    });

    //Opacity
    let activeRegion = null;

    function handleToggle() {
        const clicked = d3.select(this).attr("data-region");
        activeRegion = activeRegion === clicked ? null : clicked;

        svg.selectAll(".line, text[data-region]")
            .transition().duration(300)
            .style("opacity", function () {
                const region = d3.select(this).attr("data-region");
                return !activeRegion || region === activeRegion ? 1 : 0.2;
            });
    }
});