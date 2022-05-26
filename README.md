# scavengerHunt

// Created by Alyssa Jarrell
// Contact at jarrell.alyssa@gmail.com

/////////////////////// PROJECT INFORMATION ////////////////////
/* This project is a scavenger hunt set in Philadelphia. There are three landmarks for the user to visit, each with their own clue. This data is contained in a json file, which is accessed and stored in the local storage. The game is tracked by game state, starting at 0, which is also added to local storage. When the user finds a landmark, the game state will be updated to 1, then 2, and when they have found the last landmark, the state will update to a final state of 3. A state of 0 is no landmarks found, a state of 3 is all landmarks found ---> win. To find a landmark, the user must turn on location tracking and use the clue to figure out the landmark. Each landmark has a 10 meter geofence around it. Once the user has come within 10 meters of the landmark, they have found it. The map will update with markers for each landmark found and the website will update the clue, tracking, and landmarks found information depending on the state of the game. The user has to option to turn location tracking on or off to save power/memory, but must turn it on when close to the landmark in order to find it. */
