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

var groups = [
	{
		"group": "A",
		"teams": [{"name":"France","no": 0, "pot": 0, "flag": "fr","rank":24},"","",""]
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
	var newGroupStage = JSON.parse(JSON.stringify(groups));
	var order = 1;

	pots.forEach(function(pot,potNumber){
		var range = (potNumber === 0) ? [1,2,3,4,5] : [0,1,2,3,4,5];

		pot.teams.forEach(function(team, teamNumber){
			var randomNumber = Math.floor(Math.random()*range.length);
			var randomGroup = newGroupStage[range[randomNumber]];
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

	

	newGroupStage.forEach(function(group){
		var groupDifficulty = 0;
		group.teams.forEach(function(team){
			groupDifficulty += team.rank;
		})
		group.difficulty = (100 - Math.round(((groupDifficulty - difficulty.min)/difficulty.total)*100))/10;
	})

	
	
	var simulatorHTML = simulatorTemplate({groups:newGroupStage});
	document.querySelector('#draw-container').innerHTML = simulatorHTML;

	animateDraw();
}

function animateDraw(){
	var currentPot = 1;

	function animateTeam(no,newPot){
		var teamEl = document.querySelector('.team-order-' + no);
		teamEl.className += " drawn";

		if(newPot){
			updatePot(newPot);
		}

		if(no < 23){
			if(no === 5 || no === 11 || no === 17){
				no++;
				currentPot++;
				setTimeout(function(){
					animateTeam(no,currentPot);
				},1200)
			}else{
				no++;
				setTimeout(function(){
					animateTeam(no,false);
				},200)
			}
			
			
		}
	}

	animateTeam(0,currentPot);
}

function updatePot(pot){
	var statusEl = document.querySelector('#current-pot');
	statusEl.innerHTML = "Seeding pot " + pot;
}



function boot(el) {
	el.innerHTML = base;
	var button = document.querySelector('#start-draw');
	button.addEventListener('click', createDraw);
	createDraw();
}

module.exports = { boot: boot };
