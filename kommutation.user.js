// ==UserScript==
// @name         Kommutation
// @namespace    http://tridactyl.xyz
// @version      0.0.1
// @description  grab a gpx file off komoot - edit the route, reload the page, click the button
// @author       bovine3dom
// @match        https://www.komoot.com/plan/tour/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    // 1) go on a route
    // 2) click edit
    // 3) reload the page (important!) with e.g. ctrl+r
    // 4) click the Grab GPX button

    // following adapted lightly from
    // https://github.com/DreiDe/komootGPXport
    function jsonToGpx(coords) {
        let gpx =
            `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
                <gpx version="1.1" creator="komootGPXport">
                  <metadata></metadata>
                    <rte>
                      ${coords.map((coord) => {
                          return `<rtept lat="${coord.lat}" lon="${coord.lng}"><ele>${coord.z}</ele></rtept>`
                      }).join('\n')}
                    </rte>
                </gpx>`
        return gpx
    }

    function downloadGpx(filename, text){
        let elem = document.createElement('a')
        elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        elem.setAttribute('download', filename)

        elem.style.display = 'none'
        document.body.appendChild(elem)

        elem.click()

        document.body.removeChild(elem)
    }
    // adaptation ends

    const grabbutton = document.createElement("button");
    grabbutton.style.position = "fixed"
    grabbutton.style.top = "10px"
    grabbutton.style.left = "10px"
    grabbutton.style.zIndex = "2147483647"
    grabbutton.style.padding = "10px 15px"
    grabbutton.style.backgroundColor = "lightgreen"
    grabbutton.style.color = "black"
    grabbutton.style.border = "2px solid darkgreen"
    grabbutton.style.borderRadius = "5px"
    grabbutton.style.cursor = "pointer"
    grabbutton.style.fontSize = "14px"
    grabbutton.style.setProperty("display", "block", "important")
    grabbutton.style.setProperty("visibility", "visible", "important")
    grabbutton.style.setProperty("opacity", "1", "important")
    setTimeout(() => {
        if (kmtBoot.getProps().page.linksEmbedded == undefined) {
            // since it's a daft SPA this doesn't actually trigger
            grabbutton.innerHTML = "Click me to reload before you can grab GPX"
            grabbutton.addEventListener("click", function() {
                location.reload()
            })
        } else {
            // since it's a daft SPA this stays past its welcome
            grabbutton.innerHTML = "Grab GPX"
            grabbutton.addEventListener("click", function() {
                const coords = kmtBoot.getProps().page.linksEmbedded.tour.coords()
                downloadGpx(`${new Date().toISOString()}.gpx`, jsonToGpx(coords))
            })
        }
        document.body.prepend(grabbutton)
    }, 1000)
})()
