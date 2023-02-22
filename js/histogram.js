class Histogram {
    /**
     * @param {Object}
     * @param {Array}
     */
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.initVis();
    }

    initVis() {
        this.updateVis()
    }

    updateVis(){
        let vis = this;
        vis.data = data.filter(d => d.filtered === false);

        vis.renderVis();
    }

    renderVis() {
        let histogram = d3.histogram()
			.value(d => d.sy_dist)
			.domain(x.domain())
			.thresholds(x.ticks(nBin)); // # of bins

		let bins = histogram(data);

		// Y axis: update now that we know the domain
		y.domain([0, d3.max(bins, d => d.length)]);
		yAxis
			.transition()
			.duration(1000)
			.call(d3.axisLeft(y));

		let u = svg.selectAll("rect")
			.data(bins)

		// Manage the existing bars and newly added ones
		u.join("rect")
			.attr('class', 'bar')
			.merge(u) // merge existing elements
			.transition() // apply changes to all of them
			.duration(1000)
				.attr("x", 1)
				.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
				.attr("width", function(d) { return x(d.x1) - x(d.x0); })
				.attr("height", function(d) { return height - y(d.length) - XAxisLabelHeight })
				.style("fill", "#69b3a2")

			// If less bars exist in the new histogram, delete bars no longer in use
			u.exit().remove()
	
		svg.selectAll("rect").on('mouseover', (event, d) => {
			d3.select('#tooltip')
			.style('display', 'block')
			.style('left', (event.pageX + 15) + 'px')   
			.style('top', (event.pageY + 15) + 'px')
			.html(`
				<div class="tooltip-title">${xLabel}: ${d.x0}-${d.x1}</div>
                <div class="tooltip-title">${yLabel}: ${d.length}</div>
			`);
		})
		.on('mouseleave', () => {
			d3.select('#tooltip').style('display', 'none');
		});
    }
}