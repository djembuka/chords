$(function() {
	window.stave = new Stave("Stave");
	window.stave._showChord();
	$("#text").html(window.stave.chord.tonic + "-" + window.stave.chord.mode + "<br>" + window.stave.chord.chord["notes"].join(" ") + "<br>" + window.stave.chord.chord["sounds"][0] + window.stave.chord.chord.octave[0] + " " + window.stave.chord.chord["sounds"][1] + window.stave.chord.chord.octave[1] + " " + window.stave.chord.chord["sounds"][2] + window.stave.chord.chord.octave[2]);

});

function Stave(id) {
	if(!document.getElementById(id)) return;

	var self = this;
	
	init();
	
	function init() {
		initOptions();
		self.elem = document.getElementById(id);
		self.context  = self.elem.getContext('2d')
		self.chordArray = ["C", "F", "G", "D"];

		drawStave();
	}

	function initOptions() {
		self.options = {};
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
			self.context.lineTo(200, y);
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
		var y = self.options.staveStart + ((self.options.staveLinesNum - 1) - (note.staveLine + additionalStaveLines)) * self.options.staveStep;

		var topCurve = getTopCurve();
		var bottomCurve = getBottomCurve();
		
		drawNoteBody();
		drawNoteAdditionalLine();

		self.context.strokeStyle = self.options.note.strokeStyle;
		self.context.lineWidth = self.options.note.lineWidth;
		
		function getTopCurve() {
			var result = {};
			result.start = {x: 100, y: y};
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
			self.context.beginPath();
			self.context.moveTo(topCurve.start.x, topCurve.start.y);
			self.context.bezierCurveTo(topCurve.cPoint1.x, topCurve.cPoint1.y, topCurve.cPoint2.x, topCurve.cPoint2.y, topCurve.end.x, topCurve.end.y);
			self.context.bezierCurveTo(bottomCurve.cPoint1.x, bottomCurve.cPoint1.y, bottomCurve.cPoint2.x, bottomCurve.cPoint2.y, bottomCurve.end.x, bottomCurve.end.y);
			self.context.fill();
		}
		
		function drawNoteAdditionalLine() {
			var line = Math.floor(Math.abs(noteStaveLine));
			var sign = noteStaveLine / Math.abs(noteStaveLine);
			
			if(0 <= sign * line && sign * line <= (self.options.staveLinesNum - 1)) return;
			
			while(sign * line < 0 || sign * line > (self.options.staveLinesNum - 1)) {
				drawLine(line);
				line--;
			}
			
			function drawLine(line) {
				var x = 100;
				var y = self.options.staveStart + self.options.staveStep * (self.options.staveLinesNum - 1 - sign * line);
				
				self.context.beginPath();
				self.context.moveTo(x - 5, y);
				self.context.lineTo(x + self.options.note.width + 5, y);
				self.context.stroke();
			}
		}
	}

	function showChord() {
		self.chord = new Chord(self.chordArray);
		drawChord(self.chord);
	}

	/*-- public methods ---*/

	this._showChord = function() {
		showChord();
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