/**
 * Guardian visuals interactive project
 *
 * ./utils/analytics.js - Add Google analytics
 * ./utils/detect.js	- Device and env detection
 */

var ga = require('./utils/analytics');
var iframeMessenger = require('./utils/iframeMessenger');
var base = require('./html/base-with-margins.html');
var Handlebars = require('handlebars/dist/cjs/handlebars');
var pots = require('./data/data.json');
var potsContainer;
var groups;
var nextPotTime, nextTeamTime;
var selectedCountry = "england";
var firstClick = true;

var groupsOriginal = [
	{
		"group": "A",
		"teams": [{"name":"France","no": 0, "pot": 0, "flag": "/imgs/flags/fr.svg","points":10},"","",""]
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

var simulatorTemplate = Handlebars.compile( 
    require('./html/simulator-template.html'), 
    { compat: true }
);

function createDraw(first) {
	if(nextPotTime){
		clearTimeout(nextPotTime);
		nextPotTime = null;
	}
	if(nextTeamTime){
		clearTimeout(nextTeamTime);
		nextTeamTime = null;
	}
	groups = JSON.parse(JSON.stringify(groupsOriginal));
	var order = 1;
	document.querySelector('#current-pot p').innerHTML = "";
	if(first){
		document.querySelector('#current-pot p').innerHTML = "<span>Ready to start</span>";
	}
	document.querySelector('#current-pot #current-flags').innerHTML = "";
	document.querySelector('#current-pot').className -= " draw-ended";

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
			groupDifficulty += team.points;
		})
		group.difficulty = (groupDifficulty - 15);
	})
	if(first){
		groups = groupsOriginal;
	}
	
	
	var simulatorHTML = simulatorTemplate({groups:groups, selectedCountry: selectedCountry});
	document.querySelector('#draw-container').innerHTML = simulatorHTML;


	animateDraw(first);
}

function animateDraw(first){
	var currentPot = 1;
	if(!first){
		updatePot(currentPot);
	}
	
	function animateTeam(no,newPot){
		var teamEl = document.querySelector('.team-order-' + no);
		var currentFlagEl = document.querySelector('.current-flag-' + teamEl.getAttribute('data-team-id'));

		teamEl.className += " drawn";
		if(currentFlagEl){
			currentFlagEl.className += " drawn";
		}

		if(no < 23){
			var testspeed = 10;
			if(no === 5 || no === 11 || no === 17){
				no++;
				currentPot++;
				setTimeout(function(){
					updatePot(currentPot);
				},testspeed || 500)
				nextPotTime = setTimeout(function(){
					animateTeam(no,currentPot);
				},testspeed || 1500)
			}else{
				no++;
				nextTeamTime = setTimeout(function(){
					animateTeam(no,false);
				},testspeed || 200)
			}
		}else if(no === 23){
			onAnimationEnd(groups);
		}
	}
	if(!first){
		animateTeam(0,currentPot);
	}else{
		var teamEls = document.querySelectorAll('.group-container ul li');
		for( var i=0; i<teamEls.length; i++){
			teamEls[i].className += " drawn";
		}
	}
	
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

	document.querySelector('#current-pot').className += " draw-ended";
}

function share(e){
	var favoriteGroup;
	var favoriteGroupObject;
    var btn = e.target;
    var shareWindow;
    var twitterBaseUrl = "http://twitter.com/share?text=";
    var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
    var shareImage = "";
    var shareMessageList = "";
    var shareUrl = "http://gu.com/p/4en27/stw";

    groups.forEach(function(group){
		group.teams.forEach(function(team){
			if(team.id === selectedCountry){
				favoriteGroup = group;
			}
		})
	})

	favoriteGroup.teams.forEach(function(team,i){
		var isFavorite = (team.id === selectedCountry) ? "⚽️" : "";
		if(isFavorite){favoriteGroupObject = team};

		shareMessageList +=  "\r" + (i+1) + "." + (team.shortname || team.name) + isFavorite;
	})

	var shareMessageText = "My draw for " + favoriteGroupObject.name + "'s Euro 2016 group\r";
	var shareMessage = shareMessageText + shareMessageList + "\r\rCreate your own";

    if(btn.className.indexOf('share-twitter') > -1){
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

    var socialMedium = (btn.className.indexOf('share-twitter') > -1) ? "twitter" : "facebook";
    ga('send', 'event', 'draw', 'shared on ' + socialMedium, selectedCountry);
}


function boot(el) {
	el.innerHTML = base;
	ga('create','UA-25353554-31')
	ga('send','pageview')

	var drawButton = document.querySelector('#start-draw');
	drawButton.addEventListener('click', function(e){
		if(firstClick){
			firstClick = false;
			if(e.target){
				if(window.innerWidth < 620){
					window.scroll('0', e.target.getBoundingClientRect().top -20 );
				}
			}
		}
		createDraw(false);
		ga('send', 'event', 'draw', 'created', '');
	});

	var countryToggle = document.querySelector('#draw-finished select');
	countryToggle.addEventListener('change',function(e){
		selectedCountry = e.target.value;
		ga('send', 'event', 'country', 'switched', selectedCountry);
	})

	var shareButtons = document.querySelectorAll('.share-button');
	for(var i=0; i<shareButtons.length; i++){
		shareButtons[i].addEventListener('click',share);
	}

	createDraw(true);
	iframeMessenger.enableAutoResize();
}

module.exports = { boot: boot };
