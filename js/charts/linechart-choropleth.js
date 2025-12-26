import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { renderLineChart } from "./linechart.js";
import { renderChoropleth } from "./choropleth.js";

//Render
renderLineChart();
renderChoropleth();

d3.select("#linechart_container").style("display", "block");
d3.select("#choropleth_container").style("display", "none");

//Toggle buttons
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");

option1.addEventListener("click", () => {
    d3.select("#linechart_container").style("display", "block");
    d3.select("#choropleth_container").style("display", "none");
});

option2.addEventListener("click", () => {
    d3.select("#linechart_container").style("display", "none");
    d3.select("#choropleth_container").style("display", "block");
});

const buttons = document.querySelectorAll("#dropdown button");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});