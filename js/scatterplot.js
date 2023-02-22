// https://en.wikipedia.org/wiki/List_of_Solar_System_objects_by_size
let ourSolarSystem = [
	{pl_name: "Mercury", pl_rade: 0.3829, pl_bmasse: 0.0553, color: "#ff0000", labelYOffset: 0, labelXOffset: 0, filtered: false},
	{pl_name: "Venus", pl_rade: 0.9499, pl_bmasse: 0.815, color: "#ff0000", labelYOffset: 0, labelXOffset: -50, filtered: false},
	{pl_name: "Earth", pl_rade: 1, pl_bmasse: 1, color: "#ff0000", labelYOffset: -10, labelXOffset: 0, filtered: false},
	{pl_name: "Mars", pl_rade: 0.5320, pl_bmasse: 0.107, color: "#ff0000", labelYOffset: 0, labelXOffset: 0, filtered: false},
	{pl_name: "Jupiter", pl_rade: 10.97, pl_bmasse: 317.83, color: "#ff0000", labelYOffset: 0, labelXOffset: 0, filtered: false},
	{pl_name: "Saturn", pl_rade: 9.140, pl_bmasse: 95.162, color: "#ff0000", labelYOffset: 0, labelXOffset: 0, filtered: false},
	{pl_name: "Uranus", pl_rade: 3.981, pl_bmasse: 14.536, color: "#ff0000", labelYOffset: 0, labelXOffset: 0, filtered: false},
	{pl_name: "Neptune", pl_rade: 3.865, pl_bmasse: 17.147, color: "#ff0000", labelYOffset: -10, labelXOffset: -70, filtered: false},
]

class Scatterplot {
  /**
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _xAttr, _yAttr, _title, _xLabel, _yLabel, _XAxisLabelHeight = 20) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 600,
        containerHeight: _config.containerHeight || 412,
        margin: _config.margin || {top: 30, right: 30, bottom: 20, left: 50},
        title: _title,
        xLabel: _xLabel,
        yLabel: _yLabel,
        XAxisLabelHeight: _XAxisLabelHeight
      }
      this.xAttr = _xAttr;
      this.yAttr = _yAttr;
      this.data = _data;
      this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - 20;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - vis.config.XAxisLabelHeight;

    // Initialize scales and axes
    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLog()
        .range([vis.height, 0]);

    vis.xScale = d3.scaleLog()
        .range([0, vis.width]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.yAxis = d3.axisLeft(vis.yScale);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left + 20},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Title
    vis.svg.append("text")
      .attr("x", vis.width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .text(vis.config.title);

    // Y-Axis Label
    vis.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.config.containerHeight + 200)
      .attr("y", 25)
      .style("text-anchor", "middle")
      .text(vis.config.yLabel);

    // X-Axis Label
    vis.svg.append("text")
      .attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + 65) + ")")
      .style("text-anchor", "middle")
      .text(vis.config.xLabel);

    vis.xValue = d => d[vis.xAttr];
    vis.yValue = d => d[vis.yAttr];
  }

  updateVis() {
    let vis = this;
    vis.data = vis.data.map(d => ({...d, color: "#69b3a2"})).filter(d => !isNaN(d.pl_bmasse) && !isNaN(d.pl_rade)).concat(ourSolarSystem)
    
    // Set the scale input domains
    vis.xScale.domain(d3.extent(data, vis.xValue));
    vis.yScale.domain(d3.extent(data, vis.yValue));

    // Add dots
    vis.circles = vis.chart.join('g').selectAll("circle")
      .data(vis.data.filter(d => d.filtered === false))
      .join("circle")
      .attr("cx", d => vis.xScale(vis.xValue(d)))
      .attr("cy", d => vis.yScale(vis.yValue(d)))
      .attr("r", 4)
      .style("fill", function (d) { return d.color; })

    // Labels for planets in our solar system
    vis.chart.append('g')
      .selectAll(".solarSystemLabel")
      .data(vis.data.filter(d => ourSolarSystem.includes(d)))
      .join("text")
      .attr("class", "solarSystemLabel")
      .attr("x", function (d) { return vis.xScale(vis.xValue(d)) + 5 + d.labelXOffset; } )
      .attr("y", function (d) { return vis.yScale(vis.yValue(d)) + 10 + d.labelYOffset; } )
      .attr("font-weight", 600)
      .text(d => d.pl_name);

    vis.circles
        .on('mouseover', (event, d) => {
          d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15) + 'px')
          .html(`
              <div class="tooltip-title">${d.pl_name}</div>
              <ul>
              <li>Earth Radius: ${d.pl_rade}</li>
              <li>Earth Mass: ${d.pl_bmasse}</li>
              </ul>
            `);
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          });
    
    vis.xAxisG.call(vis.xAxis)
    vis.yAxisG.call(vis.yAxis)
  }

  toggleFilter(filterProperty){
      let attrFilter = globalDataFilter.find(f => (f[0] === this.aggregateAttr))
      const attrIndex = globalDataFilter.indexOf(attrFilter);
      if (attrIndex === -1){ // Attribute has never been filtered on
          globalDataFilter.push([this.aggregateAttr, [filterProperty]]); // Append new filter
      }else{ // Attribute is either being removed entirely or needs to be OR'd
          let specificFilter = globalDataFilter[attrIndex]
          let specificFilterProperty = specificFilter[1].find(s => (s === filterProperty))
          const specificFilterIndex = specificFilter[1].indexOf(specificFilterProperty);
          // Specific filter property was found, so we remove it
          if (specificFilterIndex > -1) {
              if (specificFilter[1].length === 1){
                  globalDataFilter.splice(attrIndex, 1); // remove entire attribute filter since no specific attributes are selected for it
              }else{
                  specificFilter[1].splice(specificFilterIndex, 1); // only removes specific filter from that attribute
              }
          }else{ // Attribute already has at least 1 filter on it, so we add the new filter to that attribute's array
              specificFilter[1].push(filterProperty); // Append new filter
          }
      }
      filterData(); // Call global function to update visuals
  }
}