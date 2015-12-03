/**
 * Guardian visuals interactive project
 *
 * ./utils/analytics.js - Add Google analytics
 * ./utils/detect.js	- Device and env detection
 */

// var getJSON = require('./utils/getjson');
var base = require('./html/base-with-margins.html');
var Handlebars = require('handlebars/dist/cjs/handlebars');
var pots = require('./data/data.json');
var potsContainer;
var shareContainer;
var groups;

var groupsOriginal = [
	{
		"group": "A",
		"teams": [{"name":"France","no": 0, "pot": 0, "flag": "/imgs/flags/fr.svg","rank":24},"","",""]
	},{
		"group": "B",
		"teams": ["","","",""]
	},{
		"group": "C",
		"teams": ["","","",""]
	},{
		"group": "D",
		"teams": ["","","",""]
	},{
		"group": "E",
		"teams": ["","","",""]
	},{
		"group": "F",
		"teams": ["","","",""]
	}
]

var difficulty = {
	"min": 40,
	"max": 122,
	"total": 82
}

var simulatorTemplate = Handlebars.compile( 
    require('./html/simulator-template.html'), 
    { compat: true }
);

function createDraw() {
	groups = JSON.parse(JSON.stringify(groupsOriginal));
	var order = 1;

	shareContainer.className -= " active";
	pots.forEach(function(pot,potNumber){
		var range = (potNumber === 0) ? [1,2,3,4,5] : [0,1,2,3,4,5];

		pot.teams.forEach(function(team, teamNumber){
			var randomNumber = Math.floor(Math.random()*range.length);
			var randomGroup = groups[range[randomNumber]];
			range.splice(randomNumber,1);

			team.no = order;


			if(potNumber === 0){
				randomGroup.teams[0] = team;
			}else{
				var availableSlots = [];

				randomGroup.teams.forEach(function(teamSlot,i){
					if(!teamSlot){
						availableSlots.push(i);
					}
				})

				var randomPositionNumber = Math.floor(Math.random() * availableSlots.length);
				var randomSlot = availableSlots[randomPositionNumber];

				randomGroup.teams[randomSlot] = team;
			}

			order++;
		})
	})

	

	groups.forEach(function(group){
		var groupDifficulty = 0;
		group.teams.forEach(function(team){
			groupDifficulty += team.rank;
		})
		group.difficulty = 10 - Math.round(((groupDifficulty - difficulty.min)/difficulty.total)*10);
	})

	
	
	var simulatorHTML = simulatorTemplate({groups:groups});
	document.querySelector('#draw-container').innerHTML = simulatorHTML;

	animateDraw(groups);
}

function fillPotContainer(team){
	var teamCircle = document.createElement('div');
	teamCircle.className = "team-circle team-circle-"+ team.no;
	teamCircle.style.left = Math.random()*400 + "px";
	teamCircle.style.top = Math.random()*100 + "px";
	potsContainer.appendChild(teamCircle);
}

function animateDraw(){
	var currentPot = 1;
	updatePot(currentPot);

	function animateTeam(no,newPot){
		var teamEl = document.querySelector('.team-order-' + no);
		var currentFlagEl = document.querySelector('.current-flag-' + teamEl.getAttribute('data-team-id'));

		teamEl.className += " drawn";
		if(currentFlagEl){
			currentFlagEl.className += " drawn";
		}

		if(no < 23){
			if(no === 5 || no === 11 || no === 17){
				no++;
				currentPot++;
				setTimeout(function(){
					updatePot(currentPot);
				},500)
				setTimeout(function(){
					animateTeam(no,currentPot);
				},2000)
			}else{
				no++;
				setTimeout(function(){
					animateTeam(no,false);
				},200)
			}
		}else if(no === 23){
			onAnimationEnd(groups);
		}
	}

	animateTeam(0,currentPot);
}

function updatePot(pot){
	var statusEl = document.querySelector('#current-pot');
	statusEl.querySelector('p').innerHTML = "Seeding pot " + pot;

	var statusFlagsEl = statusEl.querySelector('#current-flags');
	statusFlagsEl.innerHTML = "";

	pots[pot-1].teams.forEach(function(team){
		var flagEl = document.createElement('div');
		flagEl.className = "current-flag-container current-flag-" + team.id;
		flagEl.innerHTML = "<img src='" + team.flag + "' />";

		statusFlagsEl.appendChild(flagEl);
	})
}

function onAnimationEnd(){
	var englandGroup;
	var odometerValues = {
		0: 4,
		1: 4,
		2: -11,
		3: -26,
		4: -41,
		5: -56,
		6: -71,
		7: -86,
		8: -101,
		9: -116,
		10: -131
	}

	var groupContainers = document.querySelectorAll('.group-container');

	for(var i = 0; i<groupContainers.length; i++){
		var diffValue = odometerValues[groups[i].difficulty];

		groupContainers[i].querySelector('h3 .odometer').style.backgroundPosition = "0 " + (diffValue) + "px";
	}

	groups.forEach(function(group){
		group.teams.forEach(function(team){
			if(team.name === "England"){
				englandGroup = group;
			}
		})
	})

	englandGroup.teams.forEach(function(team,i){
		if(team.name!=="England"){
			var countryContainer = shareContainer.querySelector('#share-country-' + i);
			var flagImage = document.createElement('img');
			flagImage.src = team.flag;

			countryContainer.querySelector('.share-country-name').innerHTML = team.name;
			countryContainer.querySelector('.share-country-flag').innerHTML = "<img src='" + team.flag + "' />";
		}
	})

	document.querySelector('#current-pot p').innerHTML = "";

	shareContainer.className += " active";
}

function share(e){
    var btn = e.srcElement;
    var shareWindow;
    var twitterBaseUrl = "http://twitter.com/share?text=";
    var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
    var shareMessage = "This would be my favorite draw. Create your own on http://gu.com/eejj394\r\r1. England\r2. Wales\r4. Slovakia\r4. Turkey";
    var shareImage = "";
    var shareUrl = " "

    if( btn.className.indexOf('share-twitter') > -1 ){

        shareWindow = twitterBaseUrl + 
                        encodeURIComponent(shareMessage) + 
                        "&url=" + 
                        encodeURIComponent(shareUrl);

    } else if( btn.className.indexOf('share-facebook') > -1 ){

        shareWindow = facebookBaseUrl + 
                        encodeURIComponent(shareUrl) + 
                        "&picture=" + 
                        encodeURIComponent(shareImage) + 
                        "&redirect_uri=http://www.theguardian.com";
    }

    window.open(shareWindow, "Share", "width=640,height=320"); 
}


function boot(el) {
	el.innerHTML = base;

	shareContainer = document.querySelector('#share-container');

	var drawButton = document.querySelector('#start-draw');
	drawButton.addEventListener('click', createDraw);

	var shareButtons = document.querySelectorAll('#share-button-container button');
	for(var i=0; i<shareButtons.length; i++){
		shareButtons[i].addEventListener('click',share);
	}

	createDraw();
}

module.exports = { boot: boot };
