let data;
let globalDataFilter = [["pl_name", []], ["disc_year", []]];
let filterableVisualizations = [];
let nBins = 30;

d3.csv('data/exoplanets.csv')
  .then(_data => {
	data = _data;
  	console.log('Data loading complete. Work with dataset.');
    data.forEach(d => {
		// Attributes with BLANK where there would normally be numerical values will return NaN
      	d.sy_snum = +d.sy_snum;
		d.sy_pnum = +d.sy_pnum;
		d.disc_year = +d.disc_year;
		d.pl_orbsmax = +d.pl_orbsmax;
		d.pl_rade = +d.pl_rade;
		d.pl_bmasse = +d.pl_bmasse;
		d.pl_orbeccen = +d.pl_orbeccen;
		d.st_rad = +d.st_rad;
		d.st_mass = +d.st_mass;
		d.sy_dist = +d.sy_dist;

		if(d.st_spectype !== "BLANK"){
			d.st_spectype = d.st_spectype.charAt(0).toUpperCase() // only get type letter (A, F, G, K, N)
		}else{
			d.st_spectype = "Unknown"
		}

      	d.within_habitable_zone = isInHabitableZone(d.st_spectype, d.pl_orbsmax);
		d.filtered = false;
  	});

	barchart1 = new Barchart({
		parentElement: '#barchart1',
		}, data, "sy_snum", "Bar Chart 1", "Number of Stars", "# of Exoplanets");
	barchart1.updateVis();

	barchart2 = new Barchart({
		parentElement: '#barchart2',
		}, data, "sy_pnum", "Bar Chart 2", "Number of Planets", "# of Exoplanets");
	barchart2.updateVis();

	barchart3 = new Barchart({
		parentElement: '#barchart3',
		}, data, "st_spectype", "Bar Chart 3", "Star Type", "# of Exoplanets", 40);
	barchart3.updateVis();

	barchart4 = new Barchart({
		parentElement: '#barchart4',
		}, data, "discoverymethod", "Bar Chart 4", "Discovery Method", "# of Exoplanets", 110);
	barchart4.updateVis();

	dualBarchart = new DualBarchart({
		parentElement: '#dualbarchart',
		}, data, "st_spectype", "within_habitable_zone", "Dual Bar Chart", "Star Type", "# of Exoplanets");
	dualBarchart.updateVis(oninit=true);

	histogram = new Histogram({
		parentElement: '#histogram',
		}, data, "sy_dist", "Histogram", "Distance from Earth (pc)", "# of Exoplanets");
	histogram.updateVis(20);

	linechart = new LineChart({ parentElement: '#linechart'},
		data, "disc_year", "Line Chart", "Year", "# of Exoplanets Discovered");
    linechart.updateVis();
	
	scatterplot = new Scatterplot({ parentElement: '#scatterplot'},
		data, "pl_rade", "pl_bmasse","Scatter Plot", "Planet Radius (Earth Radius)", "Planet Mass (Earth Mass)");
	scatterplot.updateVis();

	table = new DataTable('#planetDataTable', data,
	[
		["pl_name", "Planet Name"],
		["hostname", "Host Name"],
		["st_spectype", "Star Type"],
		["disc_facility", "Discovery Facility"],
		["discoverymethod", "Discovery Method"],
		["disc_year", "Discovery Year"],
		["sy_dist", "Distance (pc)"],
		["sy_snum", "# of Stars"],
		["sy_pnum", "# of Planets"],
		["st_rad", "Stellar Radius"],
		["st_mass", "Stellar Mass"],
		["pl_rade", "Radius"],
		["pl_bmasse", "Mass"]
	]);
	

	filterableVisualizations = [barchart1, barchart2, barchart3, barchart4, dualBarchart, histogram, linechart, scatterplot, table]
})
.catch(error => {
    console.error('Error loading the data: ' + error);
});

d3.select("#nBin").on("input", function() {
	nBins = +this.value;
	histogram.updateVis(+this.value)
});

function isInHabitableZone(specType, plOrbsMax){
	let isHabitable = false
	switch (specType) {
		case 'A':
			isHabitable = (plOrbsMax >= 8.5 && plOrbsMax <= 12.5) ? true : false;
			return isHabitable
		case 'F':
			isHabitable = (plOrbsMax >= 1.5 && plOrbsMax <= 2.2) ? true : false;
			return isHabitable
		case 'G':
			isHabitable = (plOrbsMax >= 0.95 && plOrbsMax <= 1.4) ? true : false;
			return isHabitable
		case 'K':
			isHabitable = (plOrbsMax >= 0.38 && plOrbsMax <= 0.56) ? true : false;
			return isHabitable
		case 'M':
			isHabitable = (plOrbsMax >= 0.08 && plOrbsMax <= 0.12) ? true : false;
			return isHabitable
		default:
		  return false
	  }
}

function filterData(resetBrush = false) {
	let filteredData = data;
	if (globalDataFilter.length == 0) {
		filterableVisualizations.forEach(v => {
			v.data = data;
		})
	} else {
		filterableVisualizations.forEach(v => {
			filteredData = data.map(d => {
				for (i in globalDataFilter){
					let attrFilter = globalDataFilter[i]
					if(attrFilter[0] === "disc_year"){
						if((d[attrFilter[0]] > attrFilter[1][1] || d[attrFilter[0]] < attrFilter[1][0]) && attrFilter[1][1] !== attrFilter[1][0]){
							return {...d, filtered: true}
						}
					}else{
						if(!attrFilter[1].includes(d[attrFilter[0]]) && attrFilter[1].length > 0){
							return {...d, filtered: true}
						}
					}
				}
				return {...d, filtered: false}
			})
			v.data = filteredData;
		})
	}
	d3.select(".dataCount").text(filteredData.filter(d => !d.filtered).length + " / " + data.length)
	filterableVisualizations.forEach(v => {
		if(v.aggregateAttr === "sy_dist"){ // the histogram
			v.updateVis(nBins);
		}else{
			v.updateVis(resetBrush);
		}
	})
}

function clearFilters(){
	globalDataFilter = [["pl_name", []], ["disc_year", []]];
	filterData(resetBrush=true);
}