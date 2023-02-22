function toggleSystemBrowser(exoplanet){
	// console.log(getSolarSystem(exoplanet).length);
	d3.select('#systemBrowser')
      .style('display', 'block')
      .html(`
        <div class="headerBar">
          <div class="systemName">System Name: ${exoplanet.sys_name}<button onClick='closeSystemBrowser()' type='button'>X</button></div>
          <div class="selectedPlanet">Selected Planet: ${exoplanet.pl_name}</div>
          <div class="discoveryFacility">Discovered By: ${exoplanet.disc_facility} via ${exoplanet.discoverymethod}</div>
        </div>
      `);
}

function getSolarSystem(exoplanet){
    let solarSystemName = exoplanet.sys_name;
    let solarSystem = [];
    data.map(d => {
        if(d.sys_name === solarSystemName){
            solarSystem.push(d);
        }
    })
    return solarSystem;
}

function closeSystemBrowser(){
    d3.select('#systemBrowser')
      .style('display', 'none');
}