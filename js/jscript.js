$(function() {
	window.stave = new Stave("Stave");
	window.answerPanel = new AnswerPanel("answer-panel");

	//$("#text").html(window.stave.chord.tonic + "-" + window.stave.chord.mode + "<br>" + window.stave.chord.chord["notes"].join(" ") + "<br>" + window.stave.chord.chord["sounds"][0] + window.stave.chord.chord.octave[0] + " " + window.stave.chord.chord["sounds"][1] + window.stave.chord.chord.octave[1] + " " + window.stave.chord.chord["sounds"][2] + window.stave.chord.chord.octave[2]);

});

function AnswerPanel(id) {
	var self = this;
	
	init();
	
	function init() {
		initVarsAndElems();
		makeHtml();
		handleEvents();
		self.$elem.find("a:eq(0)").click();
	}
	
	function initVarsAndElems() {
		self.$elem = $("#" + id);
		self.$elem.data("AnswerPanel", self);
		self.marks = 0;
		self.errors = 0;
		self.time = {
			"showTime": 0,
			"clickTime": 0,
			"intervals": []
		};
		self.testNum = 10;
		self.chordArray = [];

		if(window.stave && window.stave.chordArray) {
			self.chordArray = window.stave.chordArray;
		}
	}

	function makeHtml() {
		createButtons();

		function createButtons() {
			for(var i = 0; i < self.chordArray.length; i++) {
				var tonic = self.chordArray[i].toUpperCase();
				self.$elem.append('<a href="#" class="i-dur ' + tonic + '" data-tonic="' + tonic + '" data-mode="dur">' + self.chordArray[i] + '</a>');
				self.$elem.append('<a href="#" class="i-moll ' + tonic + '" data-tonic="' + tonic + '" data-mode="moll">' + self.chordArray[i] + '</a>');
			}
		}
	}
	
	function handleEvents() {
		self.$elem.find("a").click(clickButton);

		function clickButton() {
			self.time.clickTime = new Date().getTime();
			window.stave._clear();

			if(self.time.showTime == 0) {//when load page
				showNewChord();
				return;
			}

			if(!window.stave || !window.stave.chord) return false;

			var currentChord = window.stave.chord;
			var $button = $(this);
			var chord = {
				"tonic": $button.attr("data-tonic"),
				"mode": $button.attr("data-mode")
			};

			if(chord.tonic == currentChord.tonic && chord.mode == currentChord.mode) {
				trueAnswer();
			} else {
				falseAnswer();
			}

			rememberInterval();

			self.testNum--;
			if(self.testNum == 0) {
				showResult();
			} else {
				showNewChord();
			}

			return false;
		}

		function trueAnswer() {
			increaseMarks();
		}

		function falseAnswer() {
			increaseErrors();
		}

		function increaseMarks() {
			self.marks++;
		}

		function increaseErrors() {
			self.errors++;
		}

		function rememberInterval() {
			var interval = self.time.clickTime - self.time.showTime;
			self.time.intervals.push(interval);
		}

		function showResult() {
			var result = "";
			result += "Верных ответов: " + self.marks + "<br>";
			result += "Ошибок: " + self.errors + "<br>";

			var averageInterval = 0;
			for(var i = 0; i < self.time.intervals.length; i++) {
				averageInterval += self.time.intervals[i];
			}
			averageInterval /= self.time.intervals.length;

			result += "Среднее время ответа: " + averageInterval + " мс";

			$("body").empty().append('<div>' + result + '</div>')
		}

		function showNewChord() {
			self.time.showTime = new Date().getTime();
			window.stave._drawStave();
			window.stave._showChord();
		}
	}
}

function Stave(id) {
	if(!document.getElementById(id)) return;

	var self = this;
	
	init();
	
	function init() {
		self.elem = document.getElementById(id);
		initOptions();
		self.context  = self.elem.getContext('2d')
		self.chordArray = ["C", "F", "G", "D", "A", "E", "H"];

		drawStave();
	}

	function initOptions() {
		self.options = {};
		self.options.canvasWidth = self.elem.getAttribute("width");
		self.options.canvasHeight = self.elem.getAttribute("height");
		self.options.staveStart = 50;
		self.options.staveStep = 20;
		self.options.staveLineWidth = 2;
		self.options.staveLinesNum = 5;
		self.options.startOctave = 1;
		self.options.scale = {
			"notes": ["c", "d", "e", "f", "g", "a", "h"],
			"sounds": [["his", "c"], ["cis", "des"], ["d"], ["dis", "es"], ["e", "fes"], ["eis", "f"], ["fis", "ges"], ["g"], ["gis", "aes"], ["a"], ["ais", "b", "hes"], ["h", "ces"]],
			"octave1StaveLines": [-1, -0.5, 0, 0.5, 1, 1.5, 2]
		};
		self.options.octaveLimit = {
			"sounds": ["a", "a"],
			"octave": [0, 2]
		};
		self.options.note = {
			width: 30,
			height: 24,
			lineWidth: 2,
			strokeStyle: "#000"
		};
	}

	function drawStave() {
		for(var i = 0, x = 0, y = self.options.staveStart; i < self.options.staveLinesNum; i++) {
			self.context.strokeStyle = "#000000";
			self.context.lineWidth = self.options.staveLineWidth;
			self.context.beginPath();
			self.context.moveTo(x, y);
			self.context.lineTo(self.options.canvasWidth, y);
			self.context.stroke();

			y += self.options.staveStep;
		}
	}

	function drawChord(chord) {
		for(var i = 0, note; i < chord.chord.notes.length; i++) {
			note = {};
			note.octave = chord.chord.octave[i];

			for(var j = 0; j < self.options.scale.notes.length; j++) {
				if(chord.chord.notes[i] == self.options.scale.notes[j]) {
					note.staveLine = self.options.scale.octave1StaveLines[j];
				}
			}

			note.alteration = 0;
			if(chord.chord.sounds[i].indexOf("is") != -1) {
				note.alteration = +1;
			} else if(chord.chord.sounds[i].indexOf("es") != -1) {
				note.alteration = -1;
			}
			
			note.length = undefined;
			
			drawNote(note);
		}
	}

	function drawNote(note) {
		var additionalStaveLines = (note.octave - self.options.startOctave) * (self.options.scale.octave1StaveLines.length * 0.5);
		var noteStaveLine = note.staveLine + additionalStaveLines;
		var x = (self.options.canvasWidth - self.options.note.width) / 2;
		var y = self.options.staveStart + ((self.options.staveLinesNum - 1) - (note.staveLine + additionalStaveLines)) * self.options.staveStep;

		var topCurve = getTopCurve();
		var bottomCurve = getBottomCurve();

		self.context.strokeStyle = self.options.note.strokeStyle;
		
		drawNoteBody();
		drawNoteAdditionalLine();
		drawAlteration(note.alteration);
		
		function getTopCurve() {
			var result = {};
			result.start = {x: x, y: y};
			result.cPoint1 = {x: result.start.x, y: result.start.y - self.options.note.height/2};
			result.cPoint2 = {x: result.start.x + self.options.note.width, y: result.start.y - self.options.note.height/2};
			result.end = {x: result.start.x + self.options.note.width, y: result.start.y};
			
			return result;
		}
		
		function getBottomCurve() {
			var result = {};
			result.start = {x: topCurve.end.x, y: topCurve.end.y};
			result.cPoint1 = {x: result.start.x, y: result.start.y + self.options.note.height/2};
			result.cPoint2 = {x: result.start.x - self.options.note.width, y: result.start.y + self.options.note.height/2};
			result.end = {x: topCurve.start.x, y: topCurve.start.y};
			
			return result;
		}
		
		function drawNoteBody() {
			self.context.lineWidth = self.options.note.lineWidth;
			
			self.context.beginPath();
			self.context.moveTo(topCurve.start.x, topCurve.start.y);
			self.context.bezierCurveTo(topCurve.cPoint1.x, topCurve.cPoint1.y, topCurve.cPoint2.x, topCurve.cPoint2.y, topCurve.end.x, topCurve.end.y);
			self.context.bezierCurveTo(bottomCurve.cPoint1.x, bottomCurve.cPoint1.y, bottomCurve.cPoint2.x, bottomCurve.cPoint2.y, bottomCurve.end.x, bottomCurve.end.y);
			self.context.fill();
		}
		
		function drawNoteAdditionalLine() {
			self.context.lineWidth = self.options.note.lineWidth;
			
			var line = Math.floor(Math.abs(noteStaveLine));
			var sign = noteStaveLine / Math.abs(noteStaveLine);
			
			if(0 <= sign * line && sign * line <= (self.options.staveLinesNum - 1)) return;
			
			while(sign * line < 0 || sign * line > (self.options.staveLinesNum - 1)) {
				drawLine(line);
				line--;
			}
			
			function drawLine(line) {
				var y = self.options.staveStart + self.options.staveStep * (self.options.staveLinesNum - 1 - sign * line);
				
				self.context.beginPath();
				self.context.moveTo(x - 5, y);
				self.context.lineTo(x + self.options.note.width + 5, y);
				self.context.stroke();
			}
		}
		
		function drawAlteration(alteration) {
			if(alteration == 0) return;
			
			switch(alteration) {
				case 1:
					drawSharp();
					break;
				case -1:
					drawFlat();
					break;
			}
			
			function drawSharp() {
				self.context.lineWidth = 1.5 * self.options.note.lineWidth;
				
				self.context.beginPath();
				self.context.moveTo(x - 5, y - 5);
				self.context.lineTo(x - 20, y - 2);
				self.context.stroke();
				
				self.context.beginPath();
				self.context.moveTo(x - 5, y + 2);
				self.context.lineTo(x - 20, y + 5);
				self.context.stroke();
				
				self.context.lineWidth = self.options.note.lineWidth;
				
				self.context.beginPath();
				self.context.moveTo(x - 10, y - 15);
				self.context.lineTo(x - 10, y + 15);
				self.context.stroke();
				
				self.context.beginPath();
				self.context.moveTo(x - 15, y - 15);
				self.context.lineTo(x - 15, y + 15);
				self.context.stroke();
			}
			
			function drawFlat() {
				var startX = x - 15;
				
				self.context.lineWidth = self.options.note.lineWidth;
				
				self.context.beginPath();
				self.context.moveTo(startX, y + self.options.note.height/2 - self.context.lineWidth);
				self.context.lineTo(startX, y - self.options.note.height - 7);
				self.context.stroke();
				
				self.context.lineWidth = 1.5 * self.options.note.lineWidth;
				
				self.context.beginPath();
				self.context.moveTo(startX, y + self.options.note.height/2 - self.context.lineWidth);
				self.context.bezierCurveTo(startX + 15, y, startX + 15, y - self.options.note.height/2 - 5, startX, y - self.options.note.height/2 + 2 * self.context.lineWidth);
				self.context.stroke();
			}
		}
	}

	function showChord() {
		self.chord = new Chord(self.chordArray);
		drawChord(self.chord);
	}

	function clear() {
		self.context.clearRect(0, 0, self.options.canvasWidth, self.options.canvasHeight);
	}

	/*-- public methods ---*/

	this._drawStave = function() {
		drawStave();
	};

	this._showChord = function() {
		showChord();
	};

	this._clear = function() {
		clear();
	};
	
}

function Chord(chordArray) {
	var self = this;
	
	init();
	
	function init() {
		initOptions();
		self.mode = chooseMode();
		self.triad = getTriad();
		self.chord = getChord();
		self.chord = setOctave(self.chord);
	}

	function initOptions() {
		self.options = {};
		self.options.modeArray = ["dur", "moll"];
		self.options.triadAlgorithm = {
			"notes": {
				"dur": [2, 2],
				"moll": [2, 2]
			},
			"sounds": {
				"dur": [4, 3],
				"moll": [3, 4]
			}
		};
	}

	function chooseMode() {
		var random = Math.round(Math.random());
		return self.options.modeArray[random];
	}

	function getTriad() {
		var random = Math.round(Math.random() * (chordArray.length - 1));
		self.tonic = chordArray[random];
		var tonicIndex = getScaleNameIndex(chordArray[random]);
		var triadAlgorithm = getTriadAlgorithm();
		triadAlgorithm = adaptArray(triadAlgorithm, window.stave.options.scale);

		return {
			"notes": formTriad("notes"),
			"sounds": formTriad("sounds")
		};

		function getTriadAlgorithm() {
			return {
				"notes": getAlgorithm("notes"),
				"sounds": getAlgorithm("sounds")
			};

			function getAlgorithm(key) {
				return [
					tonicIndex[key],
					tonicIndex[key] + self.options.triadAlgorithm[key][self.mode][0],
					tonicIndex[key] + self.options.triadAlgorithm[key][self.mode][0] + self.options.triadAlgorithm[key][self.mode][1]
				]
			}
		}

		function formTriad(key) {
			var result = [];
			for(var i = 0; i < triadAlgorithm[key].length; i++) {
				var arrayItem = window.stave.options.scale[key][triadAlgorithm[key][i]];
				if(arrayItem.push) {
					for(var j = 0; j < arrayItem.length; j++) {
						if(arrayItem[j].slice(0, 1) == window.stave.options.scale.notes[triadAlgorithm.notes[i]]) {
							result.push(arrayItem[j]);
						}
					}
				} else {
					result.push(arrayItem);
				}
			}

			return result;
		}
	}

	function getScaleNameIndex(scaleName) {
		scaleName = scaleName.toLowerCase();

		var scale = {
			"notes": scaleName.slice(0, 1),
			"sounds": scaleName
		};

		var result = {
			"notes": 0 || getIndex("notes"),
			"sounds": 0 || getIndex("sounds")
		};

		return result;

		function getIndex(key) {
			for(var i = 0; i < window.stave.options.scale[key].length; i++) {
				var arrayItem = window.stave.options.scale[key][i];
				if(arrayItem.push) {
					for(var j= 0; j < arrayItem.length; j++) {
						if(arrayItem[j] == scale[key]) {
							return i;
						}
					}
				} else if(arrayItem == scale[key]) {
					return i;
				}
			}
		}
	}

	function getChord() {
		var random = Math.round(Math.random() * 2);
		var result = formResult();

		for(key in result) {
			for(var i = 0; i < random; i++) {
				result[key].push(result[key].shift());
			}
		}

		return result;

		function formResult() {
			var result = {};

			for(key in self.triad) {
				result[key] = [];
				for(var i = 0; i < self.triad[key].length; i++) {
					result[key].push(self.triad[key][i]);
				}
			}

			return result;
		}
	}

	function setOctave(chord) {
		chord.octave = [window.stave.options.octaveLimit.octave[0]];

		var chordStartIndex = getScaleNameIndex(chord.sounds[0]).sounds;
		//var chordEndIndex = getScaleNameIndex(chord.sounds[chord.sounds.length - 1]).sounds;

		var limitStartIndex = getScaleNameIndex(window.stave.options.octaveLimit.sounds[0]).sounds;
		//var limitEndIndex = getScaleNameIndex(window.stave.options.octaveLimit.sounds[1]).sounds;

		if(chordStartIndex < limitStartIndex) {
			chord.octave[0] = chord.octave[0] + 1;
		}

		var octave = chord.octave[0];

		for(var i = 1, soundIndex = chordStartIndex; i < chord.sounds.length; i++) {
			chord.octave[i] = chord.octave[i - 1];
			var newSoundIndex = getScaleNameIndex(chord.sounds[i]).sounds;

			if(newSoundIndex < soundIndex) {
				chord.octave[i]++;
			}
			soundIndex = newSoundIndex;
		}

		return chord;
	}

	function adaptArray(array, sourceArray) {
		var result = array;
		for(key in result) {
			for(var i = 0; i < result[key].length; i++) {
				if(result[key][i] >= sourceArray[key].length) {
					result[key][i] = result[key][i] - sourceArray[key].length;
				}
			}
		}

		return result;
	}

	/*-- public methods ---*/
	
}