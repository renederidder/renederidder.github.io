// setting the styles of the address suggestions

const vertrekkantoren = new Map();

// Set longitude and latitude of vertrekkantoren
vertrekkantoren.set("Antwerpen", [4.398396, 51.196338]);
vertrekkantoren.set("Hasselt", [5.34742, 50.928365]);
vertrekkantoren.set("Destelbergen", [3.804347, 51.056817]);
vertrekkantoren.set("Turnhout", [4.948092, 51.32623]);
vertrekkantoren.set("Kortrijk", [3.302014, 50.829975]);
vertrekkantoren.set("Roeselare", [3.13132, 50.937168]);
vertrekkantoren.set("Leuven", [4.716952, 50.873095]);
vertrekkantoren.set("Zellik", [4.277571, 50.882726]);
vertrekkantoren.set("Mechelen", [4.461375, 51.057976]);
let lat1, lon1, lat2, lon2; // to hold the latitudes and longitudes of origin and destination for distance calculation

var dummy = [];
autocomplete(document.getElementById("origin"), dummy);
autocomplete(document.getElementById("destination"), dummy);

function pascalSentence(input) {
  const pattern = /\b(?![LXIVCDM]+\b)([0-9A-Z\u00C0-\u00DC]+)\b/g;
  return input
    .replace(
      pattern,
      match => match[0].toUpperCase() + match.slice(1).toLowerCase()
    )
    .replace(new RegExp(/É/g), "é")
    .replace(new RegExp(/È/g), "è")
    .replace(new RegExp(/Du\b/g), "du")
    .replace(new RegExp(/De La\b/g), "de la")
    .replace(new RegExp(/Iii/g), "III")
    .replace(new RegExp(/Ii/g), "II");
}

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a,
      b,
      i,
      val = this.value; // a is the container for the autocomplete suggestions, b is any suggestion inside a, val is what has been typed so far
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    document.getElementById("distance").innerText = `Afstand (enkel) = -- km`;
    inp.style = "color: black";
    if (!val) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV"); // a is the container for the autocomplete suggestions
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);

    url =
      "https://webservices-pub.bpost.be/ws/ExternalMailingAddressProofingCSREST_v1/address/autocomplete?id=1&q=" +
      val;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        suggestions = data.response.topSuggestions;
        return suggestions;
      })
      .then(suggestions => {
        for (let i = 0; i < suggestions.length; i++) {
          if (suggestions[i].address) {
            b = document.createElement("DIV");
            b.innerHTML = suggestions[i].address.string;
            // b.innerHTML += "<input type='hidden' value='" + suggestions[i].address.string + "'>";
            b.innerHTML += "<input type='hidden' value='" + i + "'>";
            // console.log(b.innerHTML)

            /*execute a function when someone clicks on the item value (DIV element):*/

            b.addEventListener("click", function (e) {
              // If Vertrekkantoor not empty, set latitude and longitude to vertrekkantoor's coordinates

              var vertrekkantoor =
                document.getElementById("vertrekkantoor").value;
              var vertrekkantoorEmpty = vertrekkantoor == "Leeg";
              if (!vertrekkantoorEmpty) {
                lon1 = vertrekkantoren.get(vertrekkantoor)[0];
                lat1 = vertrekkantoren.get(vertrekkantoor)[1];
                document.getElementById("origin").disabled = true;
              } else {
                lon1 = null;
                lat1 = null;
                document.getElementById("origin").disabled = false;
              }

              /*insert the value for the autocomplete text field:*/
              var index = this.getElementsByTagName("input")[0].value; // inp.value is now the complete suggestion-object selected
              inp.value = suggestions[index].address.string;

              // if busnumber is required, add ' Bus ' or ' Bte '
              var bus_bte =
                suggestions[index].address.detectedLanguage == "nl"
                  ? " Bus "
                  : " Bte ";
              var searchBarString = suggestions[index].address.searchBarString;
              if (
                (new RegExp("[0-9] Bus").test(searchBarString) ||
                  new RegExp("[0-9] Bte").test(searchBarString)) &&
                !suggestions[index].address.boxNumber
              ) {
                inp.value =
                  suggestions[index].address.string + " " + bus_bte + " ";
                inp.focus();
                inp.style = "color: red";
              }
              if (suggestions[index].address.houseNumber) {
                houseNumber = suggestions[index].address.houseNumber;
              } else {
                houseNumber = "";
              }

              if (suggestions[index].address.streetName) {
                streetName = suggestions[index].address.streetName;
                streetName = pascalSentence(streetName);
              } else {
                streetName = "";
              }
              if (suggestions[index].address.postalCode) {
                postalCode = suggestions[index].address.postalCode;
              } else {
                postalCode = "";
              }
              if (suggestions[index].address.municipalityName) {
                municipalityName = suggestions[index].address.municipalityName;
                municipalityName = pascalSentence(municipalityName);
              } else {
                municipalityName = "";
              }
              if (suggestions[index].address.boxNumber) {
                boxNumber = suggestions[index].address.boxNumber;
              } else {
                boxNumber = "";
              }

              if (suggestions[index].address.longitude) {
                if (inp.id == "origin") {
                  lon1 = suggestions[index].address.longitude;
                }
                if (inp.id == "destination") {
                  lon2 = suggestions[index].address.longitude;
                }
              } else {
                if (inp.id == "origin") {
                  lon1 = null;
                }
                if (inp.id == "destination") {
                  lon2 = null;
                }
              }

              if (suggestions[index].address.latitude) {
                if (inp.id == "origin") {
                  lat1 = suggestions[index].address.latitude;
                }
                if (inp.id == "destination") {
                  lat2 = suggestions[index].address.latitude;
                }
              } else {
                if (inp.id == "origin") {
                  lat1 = null;
                }
                if (inp.id == "destination") {
                  lat2 = null;
                }
              }

              addressLine1 =
                boxNumber == ""
                  ? streetName + " " + houseNumber
                  : streetName + " " + houseNumber + bus_bte + boxNumber;
              province =
                postalCode < 1300
                  ? "Brussels"
                  : postalCode < 1500
                  ? "Brabant-Wallon"
                  : postalCode < 2000
                  ? "Vlaams-Brabant"
                  : postalCode < 3000
                  ? "Antwerpen"
                  : postalCode < 3500
                  ? "Vlaams-Brabant"
                  : postalCode < 4000
                  ? "Limburg"
                  : postalCode < 5000
                  ? "Liège"
                  : postalCode < 6000
                  ? "Namur"
                  : postalCode < 6600
                  ? "Hainaut"
                  : postalCode < 7000
                  ? "Luxembourg"
                  : postalCode < 8000
                  ? "Hainaut"
                  : postalCode < 9000
                  ? "West-Vlaanderen"
                  : "Oost-Vlaanderen";
              console.log(addressLine1, postalCode, municipalityName, province);
              console.log(suggestions[index].address);

              getDistanceAndDuration();

              /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
              closeAllLists();
            });

            a.appendChild(b);
          }
        }
      });
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

function changeVertrekkantoor() {
  console.log("changed vertrekkantoor");
  var vertrekkantoor = document.getElementById("vertrekkantoor").value;
  var vertrekkantoorEmpty = vertrekkantoor == "Leeg";
  if (!vertrekkantoorEmpty) {
    lon1 = vertrekkantoren.get(vertrekkantoor)[0];
    lat1 = vertrekkantoren.get(vertrekkantoor)[1];
    document.getElementById("origin").disabled = true;
    document.getElementById("origin").value = "";
    document.getElementById("destination").focus();
  } else {
    lon1 = null;
    lat1 = null;
    document.getElementById("distance").innerText = `Afstand (enkel) = -- km`;
    document.getElementById("origin").disabled = false;
    document.getElementById("origin").focus();
  }
  getDistanceAndDuration();
}
function getDistanceAndDuration() {
  if (lon1 && lon2) {
    let request = new XMLHttpRequest();

    request.open(
      "POST",
      "https://api.openrouteservice.org/v2/matrix/driving-car"
    );

    request.setRequestHeader(
      "Accept",
      "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8"
    );
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader(
      "Authorization",
      "5b3ce3597851110001cf62483e729f9d01a448dbaa22385d444489ea"
    );

    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        var response = JSON.parse(this.responseText);
        console.log("afstand", response.distances[0][0]);
        console.log("duur", response.durations[0][0]);
        document.getElementById(
          "distance"
        ).innerText = `Afstand (enkel) = ${response.distances[0][0]} km`;
        document.getElementById(
          "duration"
        ).innerText = `Verplaatsingstijd (enkel)= ${Math.round(
          response.durations[0][0] / 60
        )} min`;
      }
    };

    const body = `{
      "locations":[[${lon1},${lat1}],[${lon2},${lat2}]],
      "destinations":[1],
      "metrics":["distance","duration"],
      "sources":[0],
      "units":"km"}`;
    console.log(body);
    request.send(body);
  }
}

function phoneFormat() {
  let val = document.getElementById("landlijn").value;
  document.getElementById("landlijn").style.color = "black";
  let mobiles = ["045", "046", "047", "048", "049"];
  let bigZones = ["02", "03", "09"];
  let liege = ["041", "042", "043", "044"];
  let smallZones = [
    "010",
    "015",
    "052",
    "057",
    "063",
    "071",
    "085",
    "014",
    "051",
    "056",
    "061",
    "069",
    "083",
    "013",
    "050",
    "055",
    "060",
    "067",
    "082",
    "089",
    "012",
    "019",
    "054",
    "059",
    "065",
    "081",
    "087",
    "011",
    "016",
    "053",
    "058",
    "064",
    "080",
    "086",
  ];
  let zoneType = "unknown";

  if (bigZones.includes(val.substr(0, 2)) || liege.includes(val.substr(0, 3))) {
    zoneType = "bigZone";
  }
  if (mobiles.includes(val.substr(0, 3)) && zoneType == "unknown") {
    zoneType = "mobile";
  }
  if (smallZones.includes(val.substr(0, 3)) && zoneType == "unknown") {
    zoneType = "smallZone";
  }

  if (zoneType == "bigZone") {
    let digitsOnly = val.replace(/\D+/g, "");
    switch (digitsOnly.length) {
      case (1, 2):
        document.getElementById("landlijn").value = digitsOnly;
        break;
      case 3:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 2) + " " + digitsOnly.substr(2, 1);
        break;
      case 4:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 2) + " " + digitsOnly.substr(2, 2);
        break;
      case 5:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 2) + " " + digitsOnly.substr(2, 3);
        break;
      case 6:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 2) +
          " " +
          digitsOnly.substr(2, 3) +
          " " +
          digitsOnly.substr(5, 1);
        break;
      case 7:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 2) +
          " " +
          digitsOnly.substr(2, 3) +
          " " +
          digitsOnly.substr(5, 2);
        break;
      case 8:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 2) +
          " " +
          digitsOnly.substr(2, 3) +
          " " +
          digitsOnly.substr(5, 2) +
          " " +
          digitsOnly.substr(7, 1);
        break;
      case 9:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 2) +
          " " +
          digitsOnly.substr(2, 3) +
          " " +
          digitsOnly.substr(5, 2) +
          " " +
          digitsOnly.substr(7, 2);
        document.getElementById("landlijn").style.color = "green";
        break;
      default:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 2) +
          " " +
          digitsOnly.substr(2, 3) +
          " " +
          digitsOnly.substr(5, 2) +
          " " +
          digitsOnly.substr(7, 2) +
          " " +
          digitsOnly.substr(9);
        document.getElementById("landlijn").style.color = "red";
    }
  }

  if (zoneType == "smallZone") {
    let digitsOnly = val.replace(/\D+/g, "");
    switch (digitsOnly.length) {
      case (1, 2, 3):
        document.getElementById("landlijn").value = digitsOnly;
        break;
      case 4:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 3) + " " + digitsOnly.substr(3, 1);
        break;
      case 5:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 3) + " " + digitsOnly.substr(3, 2);
        break;
      case 6:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 3) +
          " " +
          digitsOnly.substr(3, 2) +
          " " +
          digitsOnly.substr(5, 1);
        break;
      case 7:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 3) +
          " " +
          digitsOnly.substr(3, 2) +
          " " +
          digitsOnly.substr(5, 2);

        break;
      case 8:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 3) +
          " " +
          digitsOnly.substr(3, 2) +
          " " +
          digitsOnly.substr(5, 2) +
          " " +
          digitsOnly.substr(7, 2);
        break;
      case 9:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 3) +
          " " +
          digitsOnly.substr(3, 2) +
          " " +
          digitsOnly.substr(5, 2) +
          " " +
          digitsOnly.substr(7, 2);
        document.getElementById("landlijn").style.color = "green";
        break;
      default:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 3) +
          " " +
          digitsOnly.substr(3, 2) +
          " " +
          digitsOnly.substr(5, 2) +
          " " +
          digitsOnly.substr(7, 2) +
          " " +
          digitsOnly.substr(9);
        document.getElementById("landlijn").style.color = "red";
    }
  }
  if (zoneType == "mobile") {
    let digitsOnly = val.replace(/\D+/g, "");
    switch (digitsOnly.length) {
      case 1:
      case 2:
      case 3:
      case 4:
        document.getElementById("landlijn").value = digitsOnly;
        break;
      case 5:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 4) + " " + digitsOnly.substr(4, 1);
        break;
      case 6:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 4) + " " + digitsOnly.substr(4, 2);
        break;
      case 7:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 4) +
          " " +
          digitsOnly.substr(4, 2) +
          " " +
          digitsOnly.substr(6, 1);
        break;
      case 8:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 4) +
          " " +
          digitsOnly.substr(4, 2) +
          " " +
          digitsOnly.substr(6, 2);

        break;
      case 9:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 4) +
          " " +
          digitsOnly.substr(4, 2) +
          " " +
          digitsOnly.substr(6, 2) +
          " " +
          digitsOnly.substr(8, 1);
        break;
      case 10:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 4) +
          " " +
          digitsOnly.substr(4, 2) +
          " " +
          digitsOnly.substr(6, 2) +
          " " +
          digitsOnly.substr(8, 2);
        document.getElementById("landlijn").style.color = "green";
        break;
      default:
        document.getElementById("landlijn").value =
          digitsOnly.substr(0, 4) +
          " " +
          digitsOnly.substr(4, 2) +
          " " +
          digitsOnly.substr(6, 2) +
          " " +
          digitsOnly.substr(8, 2) +
          " " +
          digitsOnly.substr(10);
        document.getElementById("landlijn").style.color = "red";
    }
  }
}
