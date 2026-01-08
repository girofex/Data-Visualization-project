# Visible and Invisible Wars
### A Data Visualization project
By Ex-Plot group
* Federica Tamerisco S4942412
* Sara Caviglia S5163676

---

People from the past believed that in the 21st century we would have solved world hunger, debts and diseases.<br>
Instead, we find ourselves reading again and again about the multiple conflicts that affect the world.<br>
The irony is that we choose what to talk about and what not: we unfortunately differentiate between first-page conflicts,
those happening near and that in some way affects us, and less important ones.<br>
The truth is that the entire world is suffering, and we are here to narrate without bias.
<br><br>
The website explores how the media and the popular opinion of the audience
changes with respect to how a conflict affects them in first person.<br>
After a brief description of the armed conflicts happening all over the world, 
we focus on three of wars

* The Russo-Ukrainian War
* The Palestinian-Israeli War
* The Drug War

---

## Folder structure
```
.
├── components                  #Navbar, footer and top button
├── css                         #Styling
├── data
│   ├── csv                     #Data
│   │   └── cleaned             #Pre-processed csv used for the plots
│   └── preprocessing           #Python notebooks used for the pre-processing
├── img                         #Images
├── js                          #Javascript files
│   └── charts                  #Scripts for the singular charts
├── firstpage.html
├── index.html
├── references.html
├── secondpage.html
└── thirdpage.html
```

## Data Pipeline
1. Search of the data in <tt>CSV</tt> or <tt>JSON</tt> format or in raw information.
2. Pre-processing of the <tt>CSV</tt> files with the use of Python notebooks and Numpy, Pandas and Matplotlib libraries.<br>The output is a cleaned <tt>CSV</tt> for each.

## Development
For the creation of the website we used various tools:
* HTML, CSS, JavaScript, Material UI baseline for the front-end
* D3.js for the creation of ten plots
| Topic   | Chart type               | Data source       |
|---------|--------------------------|-------------------|
| Amount of armed conflicts in the world | Connection map | Same writer |
| Statistics of Google Trends in time perspective | Line chart | Same writer |
| Statistics of Google Trends in space perspective | Choropleth | Different writer |
| Possession of Ukraine's territories during the war | Stacked bar chart | Different writer |
| Progression of EU's dependency on Russian natural gas | Polar char | Different writer |
| Main events in modern Middle East history | Timeline | Different writer |
| Casualities during Gaza Wars | Bar chart | Different writer |
| Hierarchy of the Medellín Cartel | Network | Different writer |
| Mean number of people every 100k that die for drug use | Area chart | Different writer |
| Countries with highest death rate in 2021 | Pictorial unit chart | Different writer |
