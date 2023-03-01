class Bubblechart {
  /**
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _xAttr, _yAttr, _rAttr, _title, _xLabel, _yLabel, _rLabel, _XAxisLabelHeight = 20) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 950,
        containerHeight: _config.containerHeight || 550,
        margin: _config.margin || {top: 30, right: 0, bottom: 20, left: 50},
        title: _title,
        xLabel: _xLabel,
        yLabel: _yLabel,
        rLabel: _rLabel,
        XAxisLabelHeight: _XAxisLabelHeight
      }
      this.xAttr = _xAttr;
      this.yAttr = _yAttr;
      this.rAttr = _rAttr;
      this.data = _data;
      this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - 20;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - vis.config.XAxisLabelHeight;

    // Initialize scales and axes
    // Important: we flip array elements in the yLabel output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.rScale = d3.scaleLog()
        .range([10, 20])

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
        .attr('transform', `translate(50, ${vis.config.margin.top})`);

    // Append yLabel-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis yLabel-axis');

    // Title
    vis.svg.append("text")
      .attr("x", vis.width / 2)
      .attr("yLabel", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .text(vis.config.title);

    // Y-Axis Label
    vis.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.config.containerHeight + 160)
      .attr("yLabel", 25)
      .style("text-anchor", "middle")
      .text(vis.config.yLabel);

    vis.xValue = d => d[vis.xAttr];
    vis.yValue = d => 0; // do not change
    vis.rValue = d => d[vis.rAttr];
  }

  updateVis() {
    let vis = this;

    vis.data = vis.data.filter(d => !isNaN(d[vis.xAttr]))
    
    // Set the scale input domains
    vis.xScale.domain([-2 * d3.max(vis.data, vis.xValue), 2 * d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));
    vis.rScale.domain(d3.extent(vis.data.filter(d => d.isStar === false), vis.rValue));

    const ellipses = vis.chart.join('g').selectAll("ellipse")
    .data(vis.data.filter(d => d.isStar === false && !isNaN(d.pl_orbeccen))) // just dont show orbits for planets with unknown eccentricity
    .join("ellipse")
    .attr("cx", d => vis.xScale(vis.xValue(d)) - 240)
    .attr("cy", d => vis.yScale(vis.yValue(d)))
    .attr("rx", d => (vis.xScale(vis.xValue(d) - vis.xValue(d))))
    .attr("ry", d => (vis.xScale(vis.xValue(d)) / (1 - d.pl_orbeccen)))
    .style('fill', 'none')
    .style('stroke', 'black');

    // Add dots
    const circles = vis.chart.join('g').selectAll("circle")
      .data(vis.data)
      .join("circle")
      .attr("cx", d => {
        if(d.isStar === false){
          return vis.xScale(vis.xValue(d)) + 200;
        }else{
          return vis.xScale(vis.xValue(d)) - 100;
        }
      })
      .attr("cy", d => vis.yScale(vis.yValue(d)))
      .attr("r", d => {
        if(d.isStar === false){
          if(isNaN(d[vis.rAttr])){
            return 15;
          }else{
            return vis.rScale(vis.rValue(d));
          }
        }else{
          return 40;
        }
      })
      .style('fill', d => {
        if(!isNaN(d[vis.rAttr]) || d.isStar){
          return d.color;
        }else{
          return 'white'
        }
      })
      .style('stroke', d => {
        if(d.isStar || isNaN(d.pl_rade)){
          return 'black'
        }else{
          return ''
        }
      })
      .style('stroke-dasharray', d => {
        if(d.isStar){
          return '8'
        }else{
          return ''
        }
      });

    circles
        .on('mouseover', (event, d) => {
          d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX - 65) + 'px')
          .style('top', (event.pageY + 15) + 'px')
          .html(function(){
            if(d.isStar === true){
              return `
                      <div class="tooltip-title">${d.pl_name} - Star</div>
                      <div class="tooltip-title">Solar Radius: ${d.st_rad.toFixed(2)} (not drawn to scale)</div>
                      <div class="tooltip-title">Star Type: ${d.st_spectype}</div>
                    `
            }else{
              return `
                      <div class="tooltip-title">${d.pl_name} - Planet</div>
                      <div class="tooltip-title">${vis.config.xLabel}: ${vis.xValue(d).toFixed(2)}</div>
                      <div class="tooltip-title">${vis.config.rLabel}: ${vis.rValue(d).toFixed(2)} (scaled to system planets)</div>
                      <div class="tooltip-title">Orbit Eccentricity: ${d.pl_orbeccen.toFixed(2)}</div>
                      <div class="tooltip-title">Planet Type: ${d.planetType}</div>
                    `
            }
          });
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          });    
  }
}