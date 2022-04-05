/* Alyssa Jarrell
  CIS 228 - JS 2
  Prof. Liss
  Spring 2022
  jnumber: J00362041
*/

/////////////////////// PROJECT INFORMATION ////////////////////
/* This project is a scavenger hunt set in Philadelphia. There are three landmarks for the user to visit, each with their own clue. This data is contained in a json file, which is accessed and stored in the local storage. The game is tracked by game state, starting at 0, which is also added to local storage. When the user finds a landmark, the game state will be updated to 1, then 2, and when they have found the last landmark, the state will update to a final state of 3. A state of 0 is no landmarks found, a state of 3 is all landmarks found ---> win. To find a landmark, the user must turn on location tracking and use the clue to figure out the landmark. Each landmark has a 10 meter geofence around it. Once the user has come within 10 meters of the landmark, they have found it. The map will update with markers for each landmark found and the website will update the clue, tracking, and landmarks found information depending on the state of the game. The user has to option to turn location tracking on or off to save power/memory, but must turn it on when close to the landmark in order to find it. */

'use strict';


//////////////////////// GLOBAL VARIABLES ///////////////////////
////////////////////////////////////////////////////////////////

let markerOptions = { // map marker options
  zIndexOffset: 1000
};
let centerMarker = L.marker([39.9533412, -75.1632866], markerOptions); // default lat/lon Philadelphia
let watchID = 0; // watchID for tracking
let map;
let isTracking = false; // allows toggle of tracking button
let getLocalStorageObj;
let gameState;
let storedState;
let currentLandmarkInformation = {};
// let landmarks = {};

/////////////////////// LOCAL STORAGE GET/SET FUNC ////////////////////
///////////////////////////////////////////////////////////////////////

function storeDataLocalStorage(label, i) { // stores gameState locally and then checks for the stored data and returns it
    localStorage.setItem(label, JSON.stringify(i));
    let checkValue = getDataLocalStorage(label);
    return checkValue;
}

function getDataLocalStorage(label) { // checks local storage for data and returns data
    getLocalStorageObj = JSON.parse(localStorage.getItem(label));
    return getLocalStorageObj;
}

///////////////////////////// MAIN FUNC ///////////////////////////////
///////////////////////////////////////////////////////////////////////

function main() {
    document.addEventListener('DOMContentLoaded', () => {
        mapping(); // generates map when page loaded, marker set to Phila coords by default, but will move when user is tracking
        storedState = getDataLocalStorage("gameState"); // checks for stored gameState & sets to var
        let storedLandmarkInfo = getDataLocalStorage("landmarkInformation"); // checks for stored landmarkInformation, sets to var

        if (!storedLandmarkInfo) { // if no landmarkInformation saved in localStorage, start game (save json data to localStorage)
            gameState = 0; // sets initial gameState
            storeDataLocalStorage("gameState", gameState); // store initial gameState value to localStorage
            startGame(); // start game -- stores json data in localStorage
        } else if (storedLandmarkInfo) { // continue game 
            if (storedState == null){ // if storedState is null/empty, set gameState to 0, save to locStor and continue game
                gameState = 0;
                storeDataLocalStorage("gameState", gameState); // save gameState to localStorage
                continueGame(); 
            } else if (storedState >= 0 && storedState <= 2) { // if storedState between 0-2, continue game w/o saving gameState to locStor
                gameState = storedState;
                continueGame();
            } else if (storedState === 3) { // game is complete, but continueGame() will load relevant information for user
                continueGame();
            }
        }

        document.querySelector('#trackingButton').addEventListener('click', toggleTracking); // adds event listener for tracking button

    });
  }

main();

async function startGame() { // starts game by loading json data to local storage & gets the 1st landmark clue
  try {
    let landmarks = await getJson();
    currentLandmarkInformation = getCurrentLandmark(landmarks);
    progressReport(landmarks); // updates "Landmarks Found" section when a landmark is found
    return currentLandmarkInformation;
  } catch(e) {
    console.error(e);
  }
}

async function continueGame() { // continues game. Does similar to startGame, but gets landmark info from local storage
  try{
    let landmarks = await getDataLocalStorage("landmarkInformation");
    currentLandmarkInformation = getCurrentLandmark(landmarks);
    progressReport(landmarks);
    return currentLandmarkInformation;
  } catch(e) {
    console.error(e);
  }
}

async function getJson() { // fetches json data and saves to local storage
  try{
    let response = await fetch('landmarkData.json');
    let data = await response.text();
    let landmarkInformationObj = await JSON.parse(data);
    let landmarks = landmarkInformationObj.landmarks;
    return storeDataLocalStorage("landmarkInformation", landmarks);
  } catch(e) {
    console.error(e);
  }
}

function getCurrentLandmark(landmarks) { // gets information about current landmark based on game state 
    storedState = getDataLocalStorage("gameState"); // gets stored state
    if (storedState > 0) { // when storedState is greater than 0
      document.querySelector('#noProgressContainer').classList = "noShow"; // sets display of noProgressContainer to none
    } 
    if (storedState <= 2){ // when storedState less than or = 2 (game started, but not won)
      currentLandmarkInformation = landmarks[storedState]; // gets landmark info from landmarks array at index = storedState
      addClueToPage(currentLandmarkInformation); // adds clue to page
      return currentLandmarkInformation;
    } else if (storedState === 3) { // if storedState = 3, game is won. following loads all clues to page
        document.querySelector("#currentClueSpot").textContent = ""; // clears any text before loading all clues
        let clueInfo = winningFunction(landmarks, storedState);
        return clueInfo;
    } else {
      console.error("Something went wrong");
    }
}

function addClueToPage(currentLandmarkInformation) { // shows current clue on page
    let currentClueSpot = document.querySelector('#currentClueSpot'); // target p elem for clue details
    currentClueSpot.textContent = currentLandmarkInformation.clue; // add text to currentClueSpot elem
    return currentLandmarkInformation.clue; // returns current landmark info array
}

function progressReport(landmarks) { // generates progress info for game on page --> "Landmarks Found"
    let storedState = getDataLocalStorage("gameState"); // checks game state in locStor
    if (storedState != null) { // if stored state is not null/undefined, do following
      let progressList = document.querySelector('#progressInfo');
      progressList.textContent = ""; // sets textContent to 0 to clear before loading correct info

      let greenIcon = L.icon({ // green map icon for landmarks already found
        iconUrl: 'images/greenMarker.png',
        shadowUrl: 'images/marker-shadow.png',
        iconSize:     [30, 46], // size of the icon
        shadowSize:   [46, 46], // size of the shadow
        iconAnchor:   [12, 46], // point of the icon which will correspond to marker's location
        popupAnchor:  [-1, -34] // point from which the popup should open relative to the iconAnchor
      });

      for(var i = 0; i < storedState; i++){ // loops through landmarksArray based on storedState# to generate info on landmarks found
        let info = landmarks[i];
        let listItem = document.createElement("li"); // create list item --> ul already defined on html page
        let listItemText = document.createTextNode(info.name);
        listItemText.classList = "listItemText"; // adds class declaration to list items
        listItem.appendChild(listItemText); // appends text to list item
        progressList.appendChild(listItem); // appends list item to ul on html page
        L.marker([info.lat, info.lon], {icon: greenIcon}).addTo(map).bindPopup(`${info.name}`); // add green marker for each landmark found
      }
    } else if (storedState == null) { // if no state, error
      console.error("Game state is null");
    }
}

function updateStoredState() { // updates locally stored game state when landmark is found
  gameState = storedState;
  if (storedState === 0 || storedState === 1) {
    gameState = storedState + 1;
    return storeDataLocalStorage("gameState", gameState);
  } else if (storedState === 2) {
    gameState = storedState + 1;
    let stateCheck = storeDataLocalStorage("gameState", gameState);
    winningMessage();
    return stateCheck;
  }
}   

/////////////////////// STYLE HANDLING FUNCS ///////////////////////
///////////////////////////////////////////////////////////////////////

function foundLandmarkOn() { // when a landmark is found, show congrats message, hide all other game info 
  document.querySelector('#gameInfoContainer').className = 'noShow';
  document.querySelector('#congrats').className = "congrats";
}

function foundLandmarkOff() { // when congrats (next clue) button clicked, hide congrats message and show all other game info
  document.querySelector('#gameInfoContainer').className = 'show';
  document.querySelector('#congrats').className = "noShow"; // hides #congrats elem 
  let clueSpot = document.querySelector('#clueSpot');
  // let clueText = document.querySelector('#currentClueSpot');
   if (getDataLocalStorage("gameState") < 3) {
      setTimeout(() => { // adds styling to page for winning message 
        clueSpot.style.border =  "3px solid rgba(37, 106, 255, 0.8)";
      }, 0);
      setTimeout(() => { // reverts to default styling for winning message
        clueSpot.style.border =  "2px inset rgba(0,0,0,.2)";
      }, 1000);
  }
  continueGame();
}

function congratsScreen(currentLandmarkInformation) { // when a landmark is found, congrats message will display
  if (document.querySelector('#congratsHeader')) { // clears any prior congrats message info before adding new
    document.querySelector('#congratsHeader').remove();
  }
  if(document.querySelector('#congratsMessageDiv')) { // clears any prior congrats message info before adding new
    document.querySelector('#congratsMessageDiv').remove();
  }

  let name = currentLandmarkInformation.name; // sets current name
  let image = currentLandmarkInformation.image; // sets current image
  let landmarkInfoMessage = "You have found the location: " + name; // message displayed

  // congrats elem created for when user finds landmark; display = none until found
  let congratsDiv = document.querySelector('#congrats');
  let congratsHeaderElem = document.createElement('h2'); // create h2 elem for congrats header
  congratsHeaderElem.textContent = 'Congrats!'; // add text to header
  congratsHeaderElem.id = "congratsHeader"; // give id to congrats header
  congratsDiv.appendChild(congratsHeaderElem); // append to page

  let congratsMessageDiv = document.createElement('div'); // creates new div
  congratsMessageDiv.id = "congratsMessageDiv"; // adds id to div
  congratsDiv.appendChild(congratsMessageDiv); // appends div

  // congrats message; display = none until found
  let congratsMessage = document.createElement('p'); // create p elem for congrats message
  congratsMessage.id = "congratsMessage"; // give id to congrats message
  congratsMessage.textContent = landmarkInfoMessage; // add text to message
  congratsMessageDiv.appendChild(congratsMessage); // append to page

  let img = document.createElement("img"); // create img elem
  img.id = "landmarkImg"; // give img id
  img.src = image; // choose img path
  img.alt = `Image of ${name}`;
  congratsMessageDiv.appendChild(img); // append img to page

  if (currentLandmarkInformation.id <= 2) { 
    let nextLandmarkButton = document.createElement('button'); // create button elem
    nextLandmarkButton.id = "nextLandmarkButton"; // give button id
    nextLandmarkButton.textContent = 'Show next landmark hint'; // add text to button
    nextLandmarkButton.addEventListener('click', foundLandmarkOff); // add event listener to button
    congratsMessageDiv.appendChild(nextLandmarkButton); // append to page

      if (currentLandmarkInformation.id === 2) { // when last landmark is found, button text changes
          nextLandmarkButton.textContent = 'See Results';
      }
  } 
  return currentLandmarkInformation;
}

function refreshGame () { // refreshes page to default
  if(getDataLocalStorage("gameState") === 3) {
    storeDataLocalStorage("gameState", 0);
    window.location.reload();
  } else {
    console.error("Something went wrong");
  }
}

function winningFunction(landmarks, storedState) { // when game is won, tracking info hidden/removed from page and replaced with a winning message, clue list also altered
    let trackingButton = document.querySelector('#trackingButton');
    trackingButton.classList = "noShow"; // hides tracking button

    let refreshButton = document.createElement('button'); // create new button to refresh page to default
    refreshButton.id = "refreshButton";
    refreshButton.textContent = "Restart Game"; 
    refreshButton.addEventListener('click', refreshGame); 
    let trackingSpotText = document.querySelector('#trackingSpotText');
    trackingSpotText.appendChild(refreshButton);
    
    document.querySelector('#message').classList = "noShow"; // hides content from the tracking section on page
    document.querySelector('#distance').classList = "noShow"; // hides content from the tracking section on page

    let trackingTitle = document.querySelector('#tracking');
    trackingTitle.innerHTML = "<span id = \"win\">You've won the game!</span>"; // winning message
    let trackingContainer = document.querySelector('#trackingSpot');

    setTimeout(() => { // adds styling to page for winning message 
      trackingTitle.style.color = "rgba(37, 106, 255, 0.8)";
      trackingContainer.style.border =  "3px solid rgba(37, 106, 255, 0.8)";
    }, 0);
    setTimeout(() => { // reverts to default styling for winning message
      trackingTitle.style.color = "black";
      trackingContainer.style.border =  "2px inset rgba(0,0,0,.2)";
    }, 1500);

    document.querySelector('#clues').textContent = "Clues list"; // changes "Current Clue" to "Clues list" when game won
    for(var i = 0; i < storedState; i++){ // loops through landmark info to generate clue list
      let info = landmarks[i];
      let cluesList = document.querySelector('#clueList');
      let cluesListItem = document.createElement("li");
      cluesListItem.textContent = info.clue;
      cluesList.appendChild(cluesListItem);
    }
    return landmarks;
}

function winningMessage() {
    console.log('You win the game!');
  }

function err(e) { // error function
    console.error(e);
  }

///////////////////////////////////////////////////////////////////////
/////////////////////// MAPPING & DISTANCE FUNC ///////////////////////
///////////////////////////////////////////////////////////////////////

function mapping() { // generates map on page w/ Philadelphia center coords to start
    map = L.map('map').setView([39.9533412, -75.1632866], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    centerMarker.addTo(map).bindPopup('Philadelphia');
  }

function turnTrackingOn() { // turns on location tracking
  isTracking = true; // sets isTracking var to true
  let options = { enableHighAccuracy: true,
                  maximumAge: 1000*30 };
  watchID = navigator.geolocation.watchPosition(showPositionOnMap, err, options); // callback to showPositionOnMap
  document.querySelector('#trackingButton').textContent = 'Stop Tracking';
}

function turnTrackingOff() { // turns off location tracking
  isTracking = false;
  navigator.geolocation.clearWatch(watchID);
  document.querySelector('#trackingButton').textContent = 'Start Tracking';
}
  
function toggleTracking() { // toggles tracking on/off when trackingButton is clicked
  isTracking = !isTracking;
  if (isTracking) {
    turnTrackingOn();
  } else {
    turnTrackingOff();
  }
}
  
function showPositionOnMap(position) { // sets map coords to user location
    let dateTime = new Date(position.timestamp).toLocaleString(); // sets datetime for tracking
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
//   let lat = 39.94987347338062; // test 1st landmark w/o server or chrome sensor
//   let lon = -75.14985294852438; // test 1st landmark w/o server or chrome sensor
    document.querySelector("#message").innerHTML = `Latitude(User): ${lat}<br>Longitude(User): ${lon}<br>Timestamp: ${dateTime}`; // message to display user location & timestamp
    map.panTo([lat, lon]); // pans to current user location
    centerMarker.setLatLng([lat, lon]).bindPopup('Your most recent tracked location'); // sets centerMarker to user loc
    geoFenceHandling(currentLandmarkInformation.lat, currentLandmarkInformation.lon, lat, lon); // checks if user location is within geofence of landmark
    return (lat, lon);
  }

  
function getDistance(lat1, lon1, lat2, lon2) { // haversine's formula for calculating distance between two locations -- returns distance in meters
    const r = 6378.137;
    lat1 *= Math.PI / 180;
    lat2 *= Math.PI / 180;
    lon1 *= Math.PI / 180;
    lon2 *= Math.PI / 180;
    let h = Math.pow(Math.sin((lat2 - lat1) / 2), 2) + (Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2));
    return ((2 * r * Math.asin(Math.sqrt(h))) * 1000);
  }
  
async function geoFenceHandling(lat1, lon1, lat2, lon2){ // when user is within 10 meters of landmark, they have found landmark
  try{
    let dist = getDistance(lat1, lon1, lat2, lon2);
    document.querySelector('#distance').textContent ='Distance: ' + dist.toFixed(2) + ' meters';
    
    if (dist > 10) { // if dist > 10meters, do nothing except return gameState
      return dist;
    } else if (dist <= 10) { // if distance less than or equal to 10 meters, user has found landmark 
      console.log(currentLandmarkInformation);
        await congratsScreen(currentLandmarkInformation); // edit congrats screen content, await before foundLandmark()
        foundLandmarkOn(); // class adjustments to show congrats screen
        turnTrackingOff(); // turns off location tracking
        updateStoredState(); // updates game state in local storage
      return dist;
    }
  } catch(e) {
    console.error(e);
  }
}


