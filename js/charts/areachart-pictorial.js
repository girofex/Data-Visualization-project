import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { renderAreaChart } from "./areachart.js";
import { renderPictorial } from "./pictorial.js";

//Render
renderAreaChart();
let pictorialPromise = renderPictorial();

d3.select("#areachart_container").style("display", "block");
d3.select("#pictorial_container").style("display", "none");

//Toggle buttons
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");

option1.addEventListener("click", () => {
    d3.select("#areachart_container").style("display", "block");
    d3.select("#pictorial_container").style("display", "none");
});

option2.addEventListener("click", () => {
    d3.select("#areachart_container").style("display", "none");
    d3.select("#pictorial_container").style("display", "block");

    //Pictorial animation
    pictorialPromise.then(allIcons => {
        if (!allIcons)
            return;

        const maxCount = d3.max(allIcons, icons => icons.size());

        for (let i = 0; i < maxCount; i++) {
            allIcons.forEach((icons, groupIdx) => {
                const icon = icons.filter((d, idx) => idx === i);
                icon.transition()
                    .delay(i * 150)
                    .duration(300)
                    .ease(d3.easeBackOut)
                    .style("opacity", 1)
                    .attr("transform", "scale(1)");
            });
        }
    });
});

const buttons = document.querySelectorAll("#dropdown button");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});