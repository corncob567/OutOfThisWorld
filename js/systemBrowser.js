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

function getPlanetType(exoplanet){
  let mass = exoplanet.pl_bmasse;
  if(mass === undefined){
    return 'Unknown'
  }else{
    if(mass < 0.00001){
      return 'Asteroidian';
    }
    if(mass >= 0.00001 && mass < 0.1){
      return 'Mercurian';
    }
    if(mass >= 0.1 && mass < 0.5){
      return 'Subterran';
    }
    if(mass >= 0.5 && mass < 2){
      return 'Terran';
    }
    if(mass >= 2 && mass < 10){
      return 'Superterran';
    }
    if(mass >= 10 && mass < 50){
      return 'Neptunian';
    }
    if(mass >= 50){
      return 'Jovian';
    }
  }
}

function getSolarSystem(exoplanet){
    let solarSystemName = exoplanet.sys_name;
    let solarSystem = [];

    let types = ["A", "F", "G", "K", "M", "Unknown"]
    let typeColors = ["green", "red", "blue", "orange", "purple", "black"]
    let specificColor = types.find(t => (t === exoplanet.st_spectype));
    let colorBasedOnStarType
    if(specificColor === undefined){
      colorBasedOnStarType = 'brown';
    }else{
      colorBasedOnStarType = typeColors[types.indexOf(specificColor)];
    }

    data.map(d => {
        if(d.sys_name === solarSystemName){
            solarSystem.push({...d, isStar: false, planetType: getPlanetType(d)});
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
      st_spectype: solarSystem[0].st_spectype,
      color: colorBasedOnStarType,
      isStar: true
    }
    solarSystem.push(hostAsPlanet)

    return solarSystem;
}

function closeSystemBrowser(){
    d3.select('#systemBrowser')
      .style('display', 'none');
}