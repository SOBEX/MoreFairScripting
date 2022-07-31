	// ==UserScript==
	// @name         Tree 2022-07-26 No jQuery, not Tampermonkey-ready, Season2-ready
	// @namespace    https://fair.kaliburg.de/#
	// @version      0.425
	// @description  Fair Game QOL Enhancements
	// @author       Aqualxx
	// @match        https://fair.kaliburg.de/
	// @include      *kaliburg.de*
	// @run-at       document-end
	// @icon         https://www.google.com/s2/favicons?domain=kaliburg.de
	// @downloadURL  https://raw.githubusercontent.com/LynnCinnamon/fair-game-qol/main/fairgame.js
	// @updateURL    https://raw.githubusercontent.com/LynnCinnamon/fair-game-qol/main/fairgame.js
	// @grant        unsafeWindow
	// @license      MIT
	// ==/UserScript==

	// Script made by aqualxx#5004 and maintained by Lynn#6969
	// Simulation by Tree#1019
	// Some more contributions by Spyrfyr & Boozle & Bender & MobileChecker & Beverice & SOBEX



	// Time to wait (in milliseconds) before running the script to give the page time to load properly
	waitingTime = 5000;

	setTimeout(function(){

		Fair.register(api=>window.store=api);

		// Sets theme to "Light"
		document.getElementsByTagName('html')[0].className='light';

		// Navbar is not needed (if you need it, remove this line)
		document.getElementsByTagName('nav')[0].style.display = "none";

		// Set the ladder area to cover more space (remove this if you want the navbar back)
		document.getElementsByClassName('ladder-row')[0].style.maxHeight='87%';
		document.getElementsByClassName('ladder-row')[0].style.height='87%';

		// Fixes the display of the ranker table header
		document.getElementsByClassName('ladder-row')[0].classList.remove("py-1");
		document.getElementsByClassName('ladder-row')[0].style["overflow-x"] = "hidden";

		document.getElementsByClassName('col')[0].style["padding-top"] = "8px";
		document.getElementsByClassName('col')[1].style["padding-top"] = "8px";
		document.getElementsByClassName('col')[2].style["padding-top"] = "8px";
		document.getElementsByClassName('col')[3].style["padding-top"] = "8px";

		const SimulationBehaviors = {
			WALL: 0, // No action is taken by anyone, thus walling
			AUTOPROMOTE: 1, // Everyone instantly promotes when they reach #1
			MANUALPROMOTE: 2, // Everyone promotes once they have a 30 second lead
		}
		const SimulationActions = {
			BIAS: 0, //Default action of checking if player will bias
			MULTI: 1, //Check what happens if you multi
			GRAPE: 999 //Check what happens if the person on top gets GRAPED!!!
		}

		// Timeout of the simulation in milliseconds. The default value of 200 should be enough in most situations.
		// However, in ladders with many rankers or very early in new ladders, a higher value may be useful.
		const simulationTimeoutOptions = {
			a: 200,
			b: 400,
			c: 600,
			d: 800
		}

		if (typeof unsafeWindow !== 'undefined') {
			window = unsafeWindow;
		}

		// Colorization of rankers
		let zombie = "white"; // Background color for zombies
		let hMulti = "#f6c6f6"; // rankers on higher multi;
		let sMulti_hBias = "#c6f6c6"; // rankers on same multi, but higher bias
		let sMulti_sBias = "#c6c6f6"; // rankers on same multi, same bias
		let sMulti_lBias = "#f6c6c6"; // rankers on same multi, but lower bias
		let otherColor = "orange"; // simulated ranker color
		let myColor = "yellow"; // my color
		let promoted = "#C0C0C0"; // promoted rankers

		// Colorization of background
		let farmingGrapes = "#e5ffd9"; // bottom of the ladder, grapes are farmed
		let topIsLava = "#ffdddd"; // top of the ladder, vinegar is decaying
		let boringState = "white"; // in the middle of the ladder, nothing interesting
		let myLadderState = 2; // corresponds to boring state

		// Colorization of texts
		let zombieText = "#cccccc"; // Text color for zombies
		let darkGreen = "#007000";
		let darkRed = "#700000";

		/* Global variables */
		let pointsForManualPromote;

		let tickTimes = [];
		const ticksToCount = 10;
		let averageTickTime = 1.0;

		let timeToOneMap = new Map();
		let timeToYouMap = new Map();
		let timeSimulated = 0;
		let simulationFinished = false;
		let simulatedLadderData;
		let simulationTimeout;

		let leaveBottomTime = "";
		let myTimeToFirst = ""
		let noActionTakenTimeTime;
		let actionTakenTime;

		const myID = window.store.state.ladder.yourRanker.accountId;
		let basePointsToPromote;
		let simulatedRanker = myID;

		let promotime1 = "";
		let promotime2 = "";
		let gaintime1 = "";
		let gaintime2 = "";
		let floortime1 = "";
		let floortime2 = "";
		let myfloortime = "";
		let toptime1 = "";
		let toptime2 = "";
		let decay = "";
		let simResultsText = "";
		let rowText = "";

		let topRanker = window.store.state.ladder.rankers[0];
		let topRankerVinegar = 1;
		let topRankerSeconds = 0;

		//let pw = new Audio('https://www.myinstants.com/media/sounds/woo.mp3'); // wooo
		//let pw = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-police-whistle-614.mp3');  // whistle
		let pw = new Audio('https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Shiny+metal+ass&filename=nt/NTEwNzE0MjczNTEwODA1_uUzwjP9PLyM.mp3');  // bmsma

		/* Page updates */
		window.subscribeToDomNode = function(id, callback) {
			//let input = $("#"+id)[0];
			let input = document.querySelector("#"+id);
			if (input) {
				input.addEventListener("change", callback);
			} else {
				console.log(`Id ${id} was not found subscribing to change events`);
			}
		}

		clientData = {};
		clientData.ladderAreaSize = 1;

		document.getElementsByTagName('body')[0].style.lineHeight = 1;

		// Replace ranker table with simulated one
		let oldRankerTable = document.getElementsByClassName('table')[0];
		let newRankerTable = oldRankerTable.cloneNode(true);
		newRankerTable.innerHTML = "<col width='6%'><col width='7%'><col width='33%'><col width='5%'><col width='11%'><col width='11%'><col width='12%'><col width='15%'><tbody id='newTable'></tbody>";
		oldRankerTable.parentElement.appendChild(newRankerTable);
		oldRankerTable.setAttribute('hidden','');
		thead = newRankerTable.createTHead();
		thead.style["z-index"] = "999";
		thead.style["position"] = "sticky";
		thead.style["top"] = "0";
		thead.innerHTML ="<tr class='thead-light' style='background-color: #ebede9;'><th>#</th><th>Stats</th><th>Username</th><th class='text-end'>Gain</th><th class='text-end'>Power</th><th class='text-end'>Power Diff</th><th class='text-end'>ETA to You</th><th class='text-end'>Points</th></tr>";
		newRankerTable.style['margin-bottom']='0';

		//numberFormatter = window.store.state.numberFormatter;

		/* Utility functions */
		// Finds and returns an Object's key by its value
		window.getKeyByValue = function(object, value) {
			return Object.keys(object).find(key => object[key] === value);
		}

		// Solves quadratic formula and returns minimal positive solution or Infinity
		window.solveQuadratic = function(a, b, c) {
			if (a === 0) {
				const solution = -c / b;
				return solution >= 0 ? solution : Infinity;
			}
			else {
				let discriminant = b ** 2 - 4 * a * c;
				if (discriminant < 0) {
					return Infinity;
				}
				discriminant = Math.sqrt(discriminant);
				const root1 = (-b + discriminant) / (2 * a);
				const root2 = (-b - discriminant) / (2 * a);
				if (root1 > 0 && root2 > 0) {
					return Math.min(root1, root2);
				}
				else {
					const maxRoot = Math.max(root1, root2);
					if (maxRoot < 0) {
						return Infinity;
					}
					else {
						return maxRoot;
					}
				}
			}
		}

		// Returns a ranker's acceleration
		window.getAcceleration = function(ranker) {
			if (!ranker.growing || ranker.rank === 1) {
				return 0;
			}
			return (ranker.bias + ranker.rank - 1) * ranker.multi;
		}

		// Returns the time difference between two rankers
		window.findTimeDifference = function(ranker1, ranker2) {
			const a = (getAcceleration(ranker1) - getAcceleration(ranker2)) * 0.5;
			const b = (ranker1.growing ? ranker1.power : 0) - (ranker2.growing ? ranker2.power : 0);
			const c = ranker1.points - ranker2.points;
			return solveQuadratic(a, b, c);
		}

		// Converts duration in seconds to "7m 08s" display or "00h 07m 08s" depending on longVersion
		window.secondsToHms = function(duration,longVersion) {
			duration = Math.ceil(Number(duration));

			if (!isFinite(duration)) {
				return "Never";
			}
			else if (duration === 0) {
				if (longVersion) {
					return "00h 00m 00s ";
				}
				else {
					return "0s";
				}
			}

			const h = Math.floor(duration / 3600);
			const m = Math.floor(duration % 3600 / 60);
			const s = Math.floor(duration % 3600 % 60);

			let hDisplay = "";
			let mDisplay = "";
			let sDisplay = "";

			if (longVersion) {
				hDisplay = String(h).padStart(2, "0") + "h ";
				mDisplay = String(m).padStart(2, "0") + "m ";
				sDisplay = String(s).padStart(2, "0") + "s ";
			}
			else {
				hDisplay = h > 0 ? h + "h" : "";
				mDisplay = h > 0 ? " " + String(m).padStart(2, "0") + "m" : m > 0 ? m + "m" : "";
				sDisplay = (h > 0 || m > 0) ? " " + String(s).padStart(2, "0") + "s" : s > 0 ? s + "s" : "";
			}

			return hDisplay + mDisplay + sDisplay;
		}

		/* Ladder updates */
		window.updateTimes = function() {
			const yourSimulatedRanker = simulatedLadderData.rankers.filter(obj => obj.you)[0];

			/* Add in approximate times */
			for (const ranker of window.store.state.ladder.rankers) {
				const simulatedRanker = simulatedLadderData.rankers.filter(obj => obj.accountId === ranker.accountId)[0];

				// Time to #1
				if (!timeToOneMap.has(ranker.accountId) && ranker.growing) {
					// Time to reach minimum promotion points of the ladder
					if (window.store.state.ladder.rankers[0].points.lessThan(basePointsToPromote)) {
						const timeToLadder = timeSimulated + solveQuadratic(getAcceleration(simulatedRanker)/2, simulatedRanker.power, basePointsToPromote.mul(-1).add(simulatedRanker.points));
						timeToOneMap.set(ranker.accountId, {time: timeToLadder, approximate: true});
					}
					// Time to reach first ranker
					else if (ranker.rank !== 1) {
						const timeToFirst = timeSimulated + findTimeDifference(simulatedRanker, simulatedLadderData.rankers[0]);
						timeToOneMap.set(ranker.accountId, {time: timeToFirst, approximate: true});
					}
				}

				// Time to You
				if (!timeToYouMap.has(ranker.accountId) && !ranker.you) {
					const timeToYou = timeSimulated + findTimeDifference(simulatedRanker, yourSimulatedRanker);
					timeToYouMap.set(ranker.accountId, {time: timeToYou, approximate: true});
				}
			}

			/* Sort maps */
			timeToOneMap = new Map([...timeToOneMap.entries()].filter(obj => obj[1].time !== 0).sort((a, b) => a[1].time - b[1].time));
			timeToYouMap = new Map([...timeToYouMap.entries()].filter(obj => obj[1].time !== 0).sort((a, b) => a[1].time - b[1].time));

			/* Set output strings */
			let oneOrder = 0;

			// store time to reach the top
			if (timeToOneMap.has(myID)) {
				strMyTimeToFirst = secondsToHms(timeToOneMap.get(myID).time,false);
				myTimeToFirst = timeToOneMap.get(myID).time;
			}

			timeToOneMap.forEach(obj => {
				let outputStr = "";
				if (obj.time === Infinity) {
					outputStr += "<sub>>" + oneOrder + "</sub>";
				}
				else {

					outputStr += "<sub>#" + (++oneOrder) + "</sub>";
				}

				if (obj.approximate) {
					outputStr += "<i>";
				}
				if (window.store.state.ladder.rankers[0].points.lessThan(basePointsToPromote)) {
					outputStr += "L";
				}

				outputStr += secondsToHms(obj.time,false);
				if (obj.approximate) {
					outputStr += "</i>";
				}
				obj.outputStr = outputStr;
			});
			let youOrder = 0;
			timeToYouMap.forEach(obj => {
				let outputStr = "";
				if (obj.time === Infinity) {
					outputStr += "<sub>>" + youOrder + "</sub>";
				}
				else {
					outputStr += "<sub>#" + (++youOrder) + "</sub>";
				}
				if (obj.approximate) {
					outputStr += "<i>";
				}
				// store time to leave the bottom (does not necessarily match totalBottomTime)
				if (youOrder == 1 && window.store.state.ladder.yourRanker.rank == window.store.state.ladder.rankers.length) {
					leaveBottomTime = secondsToHms(obj.time,false);
					myfloortime  = secondsToHms(obj.time,false);
				}
				outputStr += secondsToHms(obj.time,false);
				if (obj.approximate) {
					outputStr += "</i>";
				}
				obj.outputStr = outputStr;

			});

		}

		window.sanitize = function(username) {
			username = username.replaceAll('<', '\u{226E}');
			username = username.replaceAll('>', '\u{226F}');
			return username;
		}

		/* Overrides built-in handleLadderUpdates to update tick length.
		*/
		window.handleLadderUpdates = function(message) {
		//window.store._actions['ladder/update'][0] = function(eh) {
			if (message) {
				eh.message.events.forEach(e => window.store._actions['ladder/handleEvent'][0]({type:'handleEvent',event:e,stompClient:eh.stompClient}))
			}
			window.store._mutations['ladder/calculate'][0](eh.message.secondsPassed);
			tickTimes.push(eh.message.secondsPassed);
			if (tickTimes.length > ticksToCount) {
				tickTimes.shift();
			}
			averageTickTime = tickTimes.reduce((a, b) => a + b) / tickTimes.length;
		}

		const mainColumn = document.getElementById('app').children[2].children[0].children[0].children[0];
		mainColumn.style['width']='40%';
		mainColumn.style['padding-right']='5px';
		mainColumn.style['font-size']='90%';

		const chatColumn = document.getElementById('app').children[2].children[0].children[0].children[1];
		chatColumn.style['width']='31%';
		chatColumn.style['padding-right']='0';
		chatColumn.style['padding-left']='0';
		chatColumn.style['font-size']='90%';

		const middleColumn = document.createElement('div');
		insertAfter(mainColumn,middleColumn);
		middleColumn.style['width']='29%';
		middleColumn.style['padding-right']='0';

		let simOptionshtml = "<div id='simOptions' style='padding: 8px 0px; width: 100%; font-size: 12px; '><p style='font-weight: bold; margin-bottom: 6px;'>Simulation options</p><div style='float:left; font-size: 10px; width:33%; padding-right:3%;'><span>Simulate Action</span><select name='fonts' id='simulationAction' class='form-select' style='height: 25px; font-size: 10px; padding: 0 2.25rem 0 0.75rem; margin-top:3px;'><option value='BIAS'>Bias</option><option value='MULTI'>Multi</option><option value='GRAPE'>Grape</option></select></div><div style='float:left; font-size: 10px; width:33%; padding-right:3%;'><span>Simulation Behavior</span><select name='fonts' id='simulationBehavior' class='form-select' style='height: 25px; font-size: 10px; padding: 0 2.25rem 0 0.75rem; margin-top:3px;'><option value='AUTOPROMOTE'>Auto promote</option><option value='WALL'>Wall</option><option value='MANUALPROMOTE'>Manual promote</option></select></div><div style='float:left; font-size: 10px; width:33%; padding-right:3%;'><span>Simulation Timeout (ms)</span><select name='fonts' id='simulationTimeout' class='form-select' style='height: 25px; font-size: 10px; padding: 0 2.25rem 0 0.75rem; margin-top:3px;'><option value='a'>200</option><option value='b'>400</option><option value='c'>600</option><option value='d'>800</option></select></div></div>"

		middleColumn.innerHTML = simOptionshtml;

		const simResultsPara = document.createElement("p");
		simResultsPara.style['margin-top']='10px';
		simResultsPara.innerHTML = "Initialize simulation";
		simResultsPara.style['font-weight']='bold';

		const simResults = document.createElement('div');
		simResults.setAttribute("id", "simResults");
		simResults.style['padding']='2px 0px 0px';
		simResults.style['font-size']='12px';
		simResults.style['clear']='left';
		simResults.appendChild(simResultsPara);

		let simOptions = document.querySelector('#simOptions');
		insertAfter(simOptions,simResults);


		// Your CSS as text
		var styles = ".message,.message-header,.message-username,.message-date,.message-status,.msgLength,#chatInput,.chatInputPlaceholder{font-size: 80%}.btn{padding:3px 9px}.col-6{padding:0;}.col-5{max-height:107% !important;height:107%;}.w-100 {background-color:#fa9155 !important;}";
		var styleSheet = document.createElement("style")
		styleSheet.innerText = styles
		document.head.appendChild(styleSheet)

		let highestsensiblebias;

		window.updateLadder = function() {
			pointsForManualPromote = window.store.state.ladder.stats.pointsNeededForManualPromote;
			basePointsToPromote = window.store.state.ladder.basePointsToPromote;
			highestsensiblebias = 0;
			while (Math.pow(window.store.state.ladder.number + 1, highestsensiblebias + 1) < pointsForManualPromote * 0.5) {
				highestsensiblebias = highestsensiblebias + 1;
			}
			highestsensiblebias -= 1;
			runSimulation(false);
			updateTimes();


			// Calculate vinegar decay of top ranker
			let buttonRowSecondColumn = document.getElementsByClassName('col-6')[1];
			buttonRowSecondColumn.innerHTML = "Round Base Point Requirement: "+Math.round(window.store.state.settings.pointsForPromote).toLocaleString()+"<br/>Ladder Base Point Requirement: " + Math.round(window.store.state.ladder.basePointsToPromote).toLocaleString() + "<br/>";
			//buttonRowSecondColumn.innerHTML = "Ladder Base Point Requirement: " + Math.round(window.store.state.ladder.basePointsToPromote).toLocaleString() + "<br/>";
			if (window.store.state.ladder.rankers[0].accountId === topRanker.accountId && window.store.state.ladder.rankers[0].growing && window.store.state.ladder.rankers[0].points - basePointsToPromote >= 0 && window.store.state.ladder.rankers.length >= Math.max(window.store.state.settings.minimumPeopleForPromote,window.store.state.ladder.number)) {
				// Top Ranker has not changed, and would be able to promote
				topRankerVinegar = topRankerVinegar * 0.9975; // decay by 0.25%
				topRankerSeconds += 1;
				buttonRowSecondColumn.innerHTML += "Vinegar decay: #" + topRanker.username + "#" + topRanker.accountId + " lost " + Math.round((1-topRankerVinegar)*10000) / 100 + "% (" + topRankerSeconds + "s)";
			}
			else {
				// Top Ranker has changed
				topRanker = window.store.state.ladder.rankers[0];
				topRankerVinegar = 1;
				topRankerSeconds = 0;
				buttonRowSecondColumn.innerHTML += "Vinegar decay: n/a";
			}


			// Build new ranker table
			let rankersToShow = [];
			for (const [rank, ranker] of window.store.state.ladder.rankers.entries()) {
				rankersToShow.push(ranker);
			}
			document.getElementById("newTable").innerHTML = "";
			rowText = "";
			for (const ranker of rankersToShow) {
				// Colorize row
				rowText += "<tr style='font-size: 90%;";
				if (ranker.you) {
					rowText += "background-color:"+myColor;
				}
				else if (!ranker.growing) {
					rowText += "background-color:"+promoted;
				}
				else if (ranker.bias === 0 && ranker.multi === 1) {
					rowText += "color:"+zombieText+";background-color:"+zombie;
				}
				else if (ranker.multi > window.store.state.ladder.yourRanker.multi) {
					rowText += "background-color:"+hMulti;
				}
				else if (ranker.multi === window.store.state.ladder.yourRanker.multi) {
					if (window.store.state.ladder.yourRanker.bias === ranker.bias) {
						rowText += "background-color:"+sMulti_sBias;
					}
					else if (window.store.state.ladder.yourRanker.bias > ranker.bias) {
						rowText += "background-color:"+sMulti_lBias;
					}
					else if (window.store.state.ladder.yourRanker.bias < ranker.bias) {
						rowText += "background-color:"+sMulti_hBias;
					}
				}
				else {
					rowText += "background-color:"+zombie;
				}
				rowText += "'>";

				// Ranker Rank & Tag
				rowText += "<td>" + ranker.rank + " ";
				if (ranker.tag != 0) {
					rowText += ranker.tag + "<sup>" + ranker.ahPoints + "</sup>";
				}
				rowText += "</td>";

				// Multi & Bias
				let biasCost = Math.pow(window.store.state.ladder.number + 1, ranker.bias + 1);
				let multiCost = Math.pow(window.store.state.ladder.number + 1, ranker.multi + 1);
				rowText += "<td>";
				if (ranker.growing) {
					if (ranker.points.greaterThanOrEqualTo(biasCost)) {
						rowText += "<span style='color: "+darkGreen+";'>+"+String(ranker.bias).padStart(2, "0")+" "+"</span>";
					}
					else {
						rowText += "<span title='Bias cost: " + Math.round(biasCost).toLocaleString()+" points (affordable in " + secondsToHms(Math.ceil((biasCost - ranker.points)/ranker.power),false) +")' style='color: "+darkRed+";'>+"+String(ranker.bias).padStart(2, "0")+" "+"</span>";
					}
					if (ranker.power.greaterThanOrEqualTo(multiCost)) {
						rowText += "<span style='color: "+darkGreen+";'>x"+String(ranker.multi).padStart(2, "0")+"</span>";
					}
					else {
						rowText += "<span title='Multi cost: " + Math.round(multiCost).toLocaleString()+" power (affordable in " + secondsToHms(Math.ceil((multiCost - ranker.power)/getAcceleration(ranker)),false) +")' style='color: "+darkRed+";'>x"+String(ranker.multi).padStart(2, "0")+"</span>";
					}
				}
				else {
					rowText += "+"+String(ranker.bias).padStart(2, "0")+" x"+String(ranker.multi).padStart(2, "0");
				}
				rowText += "</td>";

				// Username
				rowText += "<td style='overflow:hidden'>"+sanitize(ranker.username)+"<sup>#"+ranker.accountId+"</sup></td>";

				// Power Gain
				rowText += "<td class='text-end'>";
				if (ranker.growing && ranker.rank !== 1) {
					rowText += "+" + Math.round(getAcceleration(ranker)).toLocaleString();
				}
				rowText += "</td>";

				// Power
				rowText += "<td class='text-end' ";
				if (ranker.rank === 1 && ranker.growing) {
					rowText += "title='Multi cost: " + Math.round(multiCost).toLocaleString();
					if (ranker.power.greaterThanOrEqualTo(multiCost)) {
						rowText += "\u{1F7E9}' style='font-weight: bold; color: "+darkGreen+";'";
					}
					else {
						rowText += "\u{1F7E5}' style='font-weight: bold; color: "+darkRed+";'";
					}
				}
				rowText += ">"+Math.round(ranker.power).toLocaleString()+"</td>";

				// Power Diff
				rowText += "<td class='text-end'>";
				if (timeToYouMap.has(ranker.accountId)) {
					rowText += Math.round(window.store.state.ladder.yourRanker.power - ranker.power).toLocaleString();
				}
				rowText += "</td>";

				// Time to You
				rowText += "<td class='text-end'>";
				if (timeToYouMap.has(ranker.accountId)) {
					rowText += timeToYouMap.get(ranker.accountId).outputStr;
				}
				rowText += "</td>";

				// Points
				rowText += "<td class='text-end'>"+Math.round(ranker.points).toLocaleString()+"</td>";

				rowText += "</tr>";
			}
			document.getElementById("newTable").innerHTML = rowText;



			// Colorize background & update title based on ranker state
			let newDocumentTitle = "#" + window.store.state.ladder.yourRanker.rank;
			if (window.store.state.ladder.yourRanker.rank == window.store.state.ladder.rankers.length) {
				document.getElementsByTagName('body')[0].style.backgroundColor = farmingGrapes;
				document.getElementsByTagName('body')[0].style['background-image'] = 'https://w7.pngwing.com/pngs/113/170/png-transparent-bender-korra-roger-zoidberg-character-bender.png';
				newDocumentTitle +=  " F: " + leaveBottomTime;
				myLadderState = 1;
			}
			else if (window.store.state.ladder.yourRanker.rank == 1 // top of the ladder
			&& window.store.state.ladder.yourRanker.growing // not promoted
			&& !window.store.state.ladder.types.includes('ASSHOLE')) { // not in asshole ladder
			// && window.store.state.ladder.number != window.store.state.settings.assholeLadder) { // not in asshole ladder
				document.getElementsByTagName('body')[0].style.backgroundColor = topIsLava;
				if (window.store.state.ladder.yourRanker.points > pointsForManualPromote + window.store.state.ladder.yourRanker.power) { // promotion threshold crossed (+1 tick to not trigger with autopromote)
					pw.play(); // play alarm continuously if promotion is possible, unless in AH
				}
				newDocumentTitle += " TOP IS LAVA!!!";
				myLadderState = 3;
			}
			else {
				if (myLadderState == 1 && window.store.state.ladder.yourRanker.growing) { // play alarm once if losing the bottom
					pw.play();
				}
				document.getElementsByTagName('body')[0].style.backgroundColor = boringState;
				newDocumentTitle +=  " P: " + strMyTimeToFirst;
				myLadderState = 2;
			}
			document.title = newDocumentTitle;
		}

		window.setSimulationPlayer = function (id) {
			if (simulatedRanker == id) {
				simulatedRanker = myID;
			}
			else {
				simulatedRanker = id;
			}
		}

		function insertAfter(referenceNode, newNode) {
		  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}

		function reverseInsertionSort(inputArr) {
			const n = inputArr.length;
			for (let i = 1; i < n; i++) {
				// Choosing the first element in our unsorted subarray
				const current = inputArr[i];
				// The last element of our sorted subarray
				let j = i - 1;
				while ((j > -1) && (current.points > inputArr[j].points)) {
					inputArr[j + 1] = inputArr[j];
					j--;
				}
				inputArr[j + 1] = current;
			}
			return inputArr;
		}

		let simResultsInner = document.getElementById("simResults");
		function runSimulation(current) {
			if(!current){
				simResultsInner.innerHTML = "";
				simResultsText = "";
			}

			// Variables
			timeSimulated = 0;
			simulationFinished = false;
			let numberHitOne = 0;
			let numberHitYou = 0;
			let totalTimeOnBottom = 0;
			let timeOnTop = 0;
			const simulationBehavior = SimulationBehaviors[document.querySelector('#simulationBehavior').value];
			const simulationAction = SimulationActions[document.querySelector('#simulationAction').value];
			const simulationTimeout = simulationTimeoutOptions[document.querySelector('#simulationTimeout').value];
			//pointsForManualPromote = window.store.state.settings.pointsForManualPromote.mul(window.store.state.ladder.number);
			pointsForManualPromote = window.store.state.ladder.stats.pointsNeededForManualPromote;
			// Initialize arrays
			simulatedLadderData = JSON.parse(JSON.stringify(window.store.state.ladder));
			let timeToYouSigns = new Map();
			timeToOneMap.clear();
			timeToYouMap.clear();

			simResultsText += "<p style='margin: 6px 0';><span style='font-weight: bold;'>Simulation ";
			if (current){
				simResultsText += "assuming no changes";
			}
			else{
				if(simulatedRanker !== myID) {
					simResultsText += "for user ID #" + simulatedRanker + " ";
				}
				// Bias for the simulated player (does not have be able to buy it)
				if(simulationAction === SimulationActions.BIAS) {
					simResultsText += "assuming +1 Bias";
					simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].points = 0;
					simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].bias += 1;
					simulatedLadderData.rankers.sort((a, b) => b.points - a.points);
					simulatedLadderData.rankers.forEach((ranker, index) => {
						ranker.rank = index + 1;
					});
				// Multi for the simulated player (does not have be able to buy it)
				} else if (simulationAction === SimulationActions.MULTI) {
					simResultsText += "assuming +1 Multi";
					simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].points = 0;
					simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].power = 0;
					simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].bias = 0;
					simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].multi += 1;
					simulatedLadderData.rankers.sort((a, b) => b.points - a.points);
					simulatedLadderData.rankers.forEach((ranker, index) => {
						ranker.rank = index + 1;
					});
				// If the simulated player gets successfully graped (does not have to be #1)
				} else if (simulationAction === SimulationActions.GRAPE) {
					simResultsText += "assuming graping";
					simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].points = 0;
					const multiCost = Math.pow(window.store.state.ladder.number + 1, simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].multi + 1);
					if(simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].power >= multiCost) {
						simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].power = 0;
						simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].bias = 0;
						simulatedLadderData.rankers.filter(x => x.accountId == simulatedRanker)[0].multi += 1;
					}
					simulatedLadderData.rankers.sort((a, b) => b.points - a.points);
					simulatedLadderData.rankers.forEach((ranker, index) => {
						ranker.rank = index + 1;
					});
				}
			}
			simResultsText += " </span>";

			simulatedLadderData.rankers.forEach(ranker => {
				// Convert Decimals to Numbers for major speedup
				ranker.points = Number(ranker.points);
				ranker.power = Number(ranker.power);

				if (!ranker.growing || (ranker.rank === 1 && simulatedLadderData.rankers[0].points >= basePointsToPromote)) {
					timeToOneMap.set(ranker.accountId, {time: 0, order: -1});
				}
				if (!ranker.you) {
					timeToYouSigns.set(ranker.accountId, Math.sign(ranker.rank - simulatedLadderData.yourRanker.rank));
				}
			});

			const startTime = new Date().getTime();
			while (new Date().getTime() - startTime < simulationTimeout && timeToOneMap.size !== simulatedLadderData.rankers.length) {

				// Find lowest ETA (time until someone somewhere in the ladder will change positions)
				let minETA = Infinity;

				for (const ranker of simulatedLadderData.rankers) {
					if (!ranker.growing) {
						continue;
					}
					// If #1 cannot promote yet and needs to wait for minimum points, ensure we don't overshoot our ETA
					if (simulatedLadderData.rankers[0].points < basePointsToPromote) {
						let etaToLadder = solveQuadratic(getAcceleration(ranker)/2, ranker.power, basePointsToPromote.mul(-1).add(ranker.points));
						if (isFinite(etaToLadder)) {
							// Server works in whole tick increments, so round up to the next number of ticks
							etaToLadder = Math.ceil(etaToLadder / averageTickTime) * averageTickTime;
							minETA = Math.min(minETA, etaToLadder);
							if (minETA <= averageTickTime) {
								break;
							}
						}
					}

					if (ranker.rank === 1) {
						continue;
					}
					// Find ETA for ranker and ranker above them to meet in point values
					let etaToNext = findTimeDifference(ranker, simulatedLadderData.rankers[ranker.rank - 2]);
					if (isFinite(etaToNext)) {
						// Server works in whole tick increments, so round up to the next number of ticks
						etaToNext = Math.ceil(etaToNext / averageTickTime) * averageTickTime;
						minETA = Math.min(minETA, etaToNext);
						if (minETA <= averageTickTime) {
							break;
						}
					}

				}
				// Ensure at least 1 tick passes
				if (minETA < averageTickTime) {
					minETA = averageTickTime;
				}
				// Halt if there are no non-rank 1 growers to prevent infinite simulation
				else if (minETA === Infinity) {
					break;
				}

				// Add that many seconds of production to everybody
				timeSimulated += minETA;
				for (const ranker of simulatedLadderData.rankers) {
					if(ranker.accountId === simulatedRanker && ranker.rank === simulatedLadderData.rankers.length && ranker.growing === true) {
						totalTimeOnBottom += minETA;
					}
					if(ranker.accountId === simulatedRanker && ranker.rank === 1 && ranker.growing === true) {
						timeOnTop += minETA;
					}
					if (!ranker.growing) {
						continue;
					}
					let powerGain = ranker.rank === 1 ? 0 : (ranker.rank - 1 + ranker.bias) * ranker.multi;
					ranker.points = ranker.points + ranker.power * minETA + powerGain * minETA * (minETA - 1) / 2;
					ranker.power = ranker.power + powerGain * minETA;
				}

				// Move ranker array around
				simulatedLadderData.rankers = reverseInsertionSort(simulatedLadderData.rankers);

				// Update ranks and set Time to You map
				// Uses same sign as timeToYouSigns map: -1 indicates ranker is before you, 1 indicates ranker is after you
				// Usage of variable prevents another unnecessary for-loop
				// If the signs don't match up, this means you passed them or they passed you
				let rankerComparisonSign = -1;
				simulatedLadderData.rankers.forEach((ranker, index) => {
					ranker.rank = index + 1;
					if (ranker.you) {
						rankerComparisonSign = 1;
					}
					else if (!timeToYouMap.has(ranker.accountId) && timeToYouSigns.get(ranker.accountId) !== rankerComparisonSign) {
						timeToYouMap.set(ranker.accountId, {time: timeSimulated, order: ++numberHitYou, approximate: false});
					}

				});

				// Set Time to #1 map and perform #1 behaviors
				const firstRanker = simulatedLadderData.rankers[0];
				if (firstRanker.growing) {
					if (firstRanker.points < basePointsToPromote) {
						// The only action they can take (from the script's point of view) is to wall
						// Intentionally empty
					}
					else {
						if (!timeToOneMap.has(firstRanker.accountId)) {
							timeToOneMap.set(firstRanker.accountId, {time: timeSimulated, order: ++numberHitOne, approximate: false});

						}
						// #1 Walls
						if (simulationBehavior === SimulationBehaviors.WALL) {
							// Intentionally empty
						}
						// #1 Autopromotes
						else if (simulationBehavior === SimulationBehaviors.AUTOPROMOTE
							// If the real first ranker is sitting at #1 growing and able to promote, they are not autopromoting
							&& !(window.store.state.ladder.rankers[0].accountId === firstRanker.accountId
							&& window.store.state.ladder.rankers[0].points.greaterThanOrEqualTo(basePointsToPromote))
							) {
								firstRanker.growing = false;
						}
						else if (simulationBehavior === SimulationBehaviors.MANUALPROMOTE
							// Test for manual promote in AH ==> doesnt work
							&& !(window.store.state.ladder.rankers[0].accountId === firstRanker.accountId
							&& window.store.state.ladder.rankers[0].points.greaterThanOrEqualTo(basePointsToPromote))
							) {
								timeSimulated += 30;
								//timeSimulated += window.store.state.settings.manualPromoteWaitTime;
								timeToOneMap.set(firstRanker.accountId, {time: timeSimulated, order: ++numberHitOne, approximate: false});
								//firstRanker.growing = false;
						}
						else {
							// Unsupported option; assume wall
							// Intentionally empty
						}
					}
				}
			}

			if (timeToOneMap.size === simulatedLadderData.rankers.length) {
				simulationFinished = true;
			}

			simResultsText += " (Simulation complete: " + (simulationFinished ? '\u{1F7E9}' : '\u{1F7E5}') + ")</p>";
			simResultsText += "<table id='simtable' cellpadding='2' style='width:100%'><colgroup><col width='5%'><col width='12%'><col width='12%'><col width='11%'><col width='10%'><col width='10%'><col width='10%'><col width='25%'><col width='5%'></colgroup><tr style='font-weight: bold; font-size: 10px;'><td style='padding-right: 5px;'></td><td style='padding-right: 5px;'>Time to Promo</td><td style='padding-right: 5px;'>Diff to Promo</td><td style='padding-right: 5px;'>Bi/Mu</td><td style='padding-left: 5px;text-align: right;'>promPower</td><td style='padding-left: 5px;text-align: right;'>curPower</td><td style='padding-left: 5px;text-align: right;'>curPoDiff</td><td style='padding-left: 5px;'>Name</td><td></td></tr>";

			let myTimeToPromo = timeToOneMap.get(myID).time;
			let myPromotionTime = new Date();
			myPromotionTime.setSeconds(myPromotionTime.getSeconds() + myTimeToPromo)
			let simMulti = window.store.state.ladder.yourRanker.multi;
			let simBias = window.store.state.ladder.yourRanker.bias;
			let simPower = window.store.state.ladder.yourRanker.power;
			let simPoints = window.store.state.ladder.yourRanker.points;
			let simRank = window.store.state.ladder.yourRanker.rank;

			timeToOneMap.forEach((obj, accountId) => {
				if(window.store.state.ladder.rankers.filter(x => x.accountId == accountId)[0].growing === false) {
					return;
				}
				const ranker = simulatedLadderData.rankers.filter(x => x.accountId === accountId)[0];

				const currentRanker = window.store.state.ladder.rankers.filter(x => x.accountId == accountId)[0];

				let currentMulti = currentRanker.multi;
				let currentBias = currentRanker.bias;
				let currentPower = currentRanker.power;

				if (obj.order <= 22 || ranker.you) { // limit to top 22 because the rankers further below are not that interesting
					simResultsText += "<tr style='";
					if (ranker.you) {
						simResultsText += "background-color:"+myColor;
					}
					else if (ranker.accountId === simulatedRanker) {
						simResultsText += "background-color:"+otherColor;
					}
					else if (currentMulti === 1 && currentBias === 0) {
						simResultsText += "color:"+zombieText;
					}
					else if (currentMulti > simMulti) {
						simResultsText += "background-color:"+hMulti;
					}
					else if (currentMulti === simMulti && currentBias < simBias) {
						simResultsText += "background-color:"+sMulti_lBias;
					}
					else if (currentMulti === simMulti && currentBias === simBias) {
						simResultsText += "background-color:"+sMulti_sBias;
					}
					else if (currentMulti === simMulti && currentBias > simBias) {
						simResultsText += "background-color:"+sMulti_hBias;
					}
					simResultsText += "; font-size: 10px;'>";
					simResultsText += "<td>#"+String(obj.order)+"</td>";
					simResultsText += "<td>"+secondsToHms(obj.time,true)+"</td>";
					simResultsText += "<td>";
					if (ranker.you) {
					}
					else if (obj.time < myTimeToPromo) {
						simResultsText += secondsToHms(Math.round(myTimeToPromo-obj.time),true);
					}
					else  {
						simResultsText += secondsToHms(Math.round(obj.time-myTimeToPromo),true);
					}
					simResultsText += "</td>";
					simResultsText += "<td>"+String(ranker.bias).padStart(3, "+0")+String(ranker.multi).padStart(3, "x0")+"</td>";
					if (currentMulti - simMulti === 1 || currentMulti === simMulti) {
						simResultsText += "<td style='text-align: right;'>"+Math.round(ranker.power).toLocaleString()+"</td>";
						simResultsText += "<td style='text-align: right;'>"+Math.round(currentPower).toLocaleString()+"</td>";
						simResultsText += "<td style='text-align: right;'>";
						if (ranker.you) {
						}
						else {
							simResultsText += Math.round(simPower-currentPower).toLocaleString();
						}
						simResultsText += "</td>";
					}
					else {
						simResultsText += "<td></td><td></td><td></td>";
					}
					simResultsText += "<td style='overflow-x: hidden; padding-left: 5px;'>"+sanitize(ranker.username)+"</td>";
					simResultsText += "<td>"+"<a style='text-decoration: none;' href='#' onclick='setSimulationPlayer("+ranker.accountId+")'>\u{1F441}</a></td>";
					simResultsText += "</tr>";

					if(ranker.accountId === simulatedRanker) {
						if(!current) {
							actionTakenTime = obj.time;
						} else {
							noActionTakenTimeTime = obj.time;
						}
					}
				}

			});
			simResultsText += "</table>";

			let timeDiff = Math.abs(noActionTakenTimeTime - actionTakenTime);

			if (!current) {
				promotime1 = String(myPromotionTime.getHours()).padStart(2, "0") + ":" + String(myPromotionTime.getMinutes()).padStart(2, "0") + ":" + String(myPromotionTime.getSeconds()).padStart(2, "0");
				gaintime1 = secondsToHms(timeDiff,false);
				floortime1 = secondsToHms(totalTimeOnBottom,false);
				toptime1 = secondsToHms(timeOnTop,false);
			}
			else {
				promotime2 = String(myPromotionTime.getHours()).padStart(2, "0") + ":" + String(myPromotionTime.getMinutes()).padStart(2, "0") + ":" + String(myPromotionTime.getSeconds()).padStart(2, "0");
				gaintime2 = "n/a";
				floortime2 = secondsToHms(totalTimeOnBottom,false);
				toptime2 = secondsToHms(timeOnTop,false);
			}

			if (window.store.state.ladder.rankers[0].accountId === topRanker.accountId && window.store.state.ladder.rankers[0].growing && window.store.state.ladder.rankers[0].points - basePointsToPromote >= 0 && window.store.state.ladder.rankers.length >= Math.max(10,window.store.state.ladder.number)) {
				// Top Ranker has not changed, and would be able to promote
				topRankerVinegar = topRankerVinegar * 0.9975; // decay by 0.25%
				topRankerSeconds += 1;
				decay = topRanker.username + "#" + topRanker.accountId + " lost " + Math.round((1-topRankerVinegar)*10000) / 100 + "% (" + topRankerSeconds + "s)";
			}
			else {
				// Top Ranker has changed
				topRanker = window.store.state.ladder.rankers[0];
				topRankerVinegar = 1;
				topRankerSeconds = 0;
				decay = "n/a";
			}

			if (current) {
				simResultsText += "<table cellpadding='3' style='margin-top:6px;'><tr style='font-weight: bold; font-size: 12px;'><td></td><td>Action</td><td style='padding-right: 60px;'>No changes</td><td style='font-weight:bold;' colspan='2'>Cost for bias</td></tr><tr style='font-size: 12px;'><td style='font-weight: bold;'>Promotion (local time)</td><td>"+promotime1+"</td><td>"+promotime2+"</td><td>"+String(highestsensiblebias - 3).padStart(3, "+0")+"</td><td class='text-end'>"+Math.pow(window.store.state.ladder.number + 1, highestsensiblebias - 3).toLocaleString()+"</td></tr><tr style='font-size: 12px;'><td style='font-weight: bold;'>Time "+ (noActionTakenTimeTime > actionTakenTime ? "gain" : "loss") +"</td><td>"+gaintime1+"</td><td>"+gaintime2+"</td><td>"+String(highestsensiblebias - 2).padStart(3, "+0")+"</td><td class='text-end'>"+Math.pow(window.store.state.ladder.number + 1, highestsensiblebias - 2).toLocaleString()+"</td></tr><tr style='font-size: 12px;'><td style='font-weight: bold;'>Floor time</td><td>"+floortime1+"</td><td>"+floortime2+"</td><td>"+String(highestsensiblebias - 1).padStart(3, "+0")+"</td><td class='text-end'>"+Math.pow(window.store.state.ladder.number + 1, highestsensiblebias - 1).toLocaleString()+"</td></tr><tr style='font-size: 12px;'><td style='font-weight: bold;'>Top time</td><td>"+toptime1+"</td><td>"+toptime2+"</td><td>"+String(highestsensiblebias).padStart(3, "+0")+"</td><td class='text-end'>"+Math.pow(window.store.state.ladder.number + 1, highestsensiblebias).toLocaleString()+"</td></tr></table>";
			}
			// <tr style='font-size: 12px;'><td style='font-weight: bold;'>Vinegar decay:</td><td colspan='4'>"+decay+"</td></tr>



			simResultsInner.innerHTML = simResultsText;

			if (!current){
				runSimulation(true)
			}
		}

		var linkTag = document.createElement('link');
		linkTag.rel = "stylesheet";
		linkTag.href = "https://fonts.googleapis.com/css2?family=BenchNine:wght@400&display=swap"
		document.body.appendChild(linkTag);

		window.updateLadderLastValue=0;
		setInterval(function(){
			let currentValue=window.store.state.ladder.rankers.filter(r=>r.growing)[0]?.points.toNumber();
			if(currentValue&&window.updateLadderLastValue!=currentValue){
				window.updateLadderLastValue=currentValue;
				updateLadder();
			}
		},100);

	},waitingTime);
