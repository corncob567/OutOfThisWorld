function toggleSystemBrowser(exoplanet){
	// console.log(getSolarSystem(exoplanet).length);
  let solarSystem = getSolarSystem(exoplanet); // we can use pl_orbsmax to get how far planets are from their star

	d3.select('#systemBrowser')
      .style('display', 'block')
      .html(`
        <div class="headerBar">
          <div class="systemName">System Name: ${exoplanet.sys_name}<button onClick='closeSystemBrowser()' type='button' class='closeButton'>Close</button></div>
          <div class="selectedPlanet">Selected Planet: ${exoplanet.pl_name}</div>
          <div class="discoveryFacility">Discovered By: ${exoplanet.disc_facility} via ${exoplanet.discoverymethod} in ${exoplanet.disc_year}</div>
        </div>
        <div><svg id="systemGraph"></svg></div>
      `);
    
    bubbleChart = new Bubblechart({parentElement: '#systemGraph'}, solarSystem, "pl_orbsmax", "pl_bmasse", "pl_rade", "", "Orbit Semi-Major Axis [au]", "", "Planet Radius");
    bubbleChart.updateVis();
}

function getSolarSystem(exoplanet){
    let solarSystemName = exoplanet.sys_name;
    let solarSystem = [];
    data.map(d => {
        if(d.sys_name === solarSystemName){
            solarSystem.push({...d, isStar: false});
        }
    })
    let hostAsPlanet = {
      hostname: solarSystem[0].hostname,
      pl_name: solarSystem[0].hostname,
      st_rad: solarSystem[0].st_rad,
      pl_rade: solarSystem[0].st_rad * 109.076,
      st_mass: solarSystem[0].st_mass,
      pl_bmasse: solarSystem[0].st_mass,
      pl_orbsmax: 0,
      isStar: true
    }
    solarSystem.push(hostAsPlanet)
    // TODO: get kind of planet using pl_bmasse

    return solarSystem;
}

function closeSystemBrowser(){
    d3.select('#systemBrowser')
      .style('display', 'none');
}