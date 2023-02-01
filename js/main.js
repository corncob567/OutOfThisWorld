d3.csv('data/exoplanets.csv')
  .then(data => {
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

		d.st_spectype = d.st_spectype.charAt(0) // only get type letter (A, F, G, K, N)

      	d.within_habitable_zone = isInHabitableZone(d.st_spectype, d.pl_orbsmax);
  	});

	//data.filter(d => d.within_habitable_zone === true) // Returns the exoplanets that are habitable
	console.log(data);
	let starCounts = countStars(data);
  	drawBarChart(starCounts);
	// https://d3-graph-gallery.com/graph/histogram_basic.html - Use this for histogram eventually

})
.catch(error => {
    console.error('Error loading the data: ' + error);
});

// https://d3-graph-gallery.com/graph/barplot_basic.html
function drawBarChart(starCounts){
	// Margin object with properties for the four directions
	const margin = {top: 40, right: 50, bottom: 20, left: 50};

	// Width and height as the inner dimensions of the chart area
	const width = 375 - margin.left - margin.right;
	const height = 412 - margin.top - margin.bottom;
	const titleheight = 30
	const YAxisLabelWidth = 20
	const XAxisLabelHeight = 20

	const svg = d3.select('#barchart1').append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .append('g')
	    .attr('transform', `translate(${margin.left}, ${margin.top})`);

	// X axis
	let x = d3.scaleBand()
	.range([ YAxisLabelWidth, width ])
	.domain(starCounts.map(c => c.starNum))
	.padding(0.2);
	svg.append("g")
	.attr("transform", "translate(0," + (height - XAxisLabelHeight) + ")")
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	let maxStars = Math.max(...starCounts.map(c => c.frequency))

	// Add Y axis
	let y = d3.scaleLinear()
	.domain([0, maxStars])
	.range([ height - XAxisLabelHeight, titleheight]);
	svg.append("g")
	.call(d3.axisLeft(y))
	.attr("transform", "translate(" + YAxisLabelWidth + ", 0)");

	// Bars
	svg.selectAll("rect")
    .data(starCounts)
	.enter()
    .append("rect")
    .attr("x", function(d) { return x(d.starNum);})
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.frequency);})
    .attr("height", function(d) {
		return height- XAxisLabelHeight - y(d.frequency);
    })
	.attr("fill", "#69b3a2");

	// Title
	svg.append("text")
   .attr("x", width / 2)
   .attr("y", 10)
   .attr("text-anchor", "middle")
   .style("font-size", "24px")
   .text("Bar Chart 1");

   // Y-Axis Label
   svg.append("text")
   .attr("transform", "rotate(-90)")
   .attr("x", -(height / 2))
   .attr("y", -30)
   .style("text-anchor", "middle")
   .text("# of Exoplanets");

   // X-Axis Label
   svg.append("text")
   .attr("transform", "translate(" + (width / 2) + " ," + (height + 15) + ")")
   .style("text-anchor", "middle")
   .text("Number of Stars");
}


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
		case 'N':
			isHabitable = (plOrbsMax >= 0.08 && plOrbsMax <= 0.12) ? true : false;
			return isHabitable
		default:
		  return false
	  }
}

function countStars(data) {
	let counts = {};
	let countsArr = [];

	data.forEach(d => {
		counts[d.sy_snum] = (counts[d.sy_snum] || 0) + 1;
	});

	for(const [key, value] of Object.entries(counts)) {
		const obj = {
			starNum: key,
			frequency: value
		  };
		  countsArr.push(obj)
	}

	return countsArr;
};