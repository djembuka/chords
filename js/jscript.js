$(function() {
	window.stave = new Stave("Stave");
});

function Stave(id) {
	if(!document.getElementById(id)) return;

	var self = this;
	
	init();
	
	function init() {
		initOptions();
		self.elem = document.getElementById(id);
		self.context  = self.elem.getContext('2d')
		self.chordArray = ["C", "F", "G"];
		self.chord = new Chord(self.chordArray);
		$("#text").html(self.chord.tonic + "-" + self.chord.mode + "<br>" + self.chord.chord["notes"].join(" ") + "<br>" + self.chord.chord["sounds"][0] + self.chord.chord.octave[0] + " " + self.chord.chord["sounds"][1] + self.chord.chord.octave[1] + " " + self.chord.chord["sounds"][2] + self.chord.chord.octave[2]);

		drawStave();
		drawChord(self.chord.chord);	
	}

	function initOptions() {
		self.options = {};
		self.options.staveStep = 10;
	}

	function drawStave() {
		for(var i = 0, x = 0, y = 1; i < 5; i++) {
			self.context.strokeStyle = "#000000";
			self.context.lineWidth = 2;
			self.context.beginPath();
			self.context.moveTo(x, y);
			self.context.lineTo(200, y);
			self.context.stroke();

			y += self.options.staveStep;
		}
	}

	function drawChord(chord) {console.log(chord);
		for(var i = 0, note; i < chord.notes.length; i++) {
			note = {};

			for(var j = 0; j < self.options.scale.notes; j++) {
				if(chord.notes[i] == self.options.scale.notes[j]) {
					note.staveLine = self.options.scale.octave1StaveLines[j];
				}
			}

			note.alteration = 0;
			if(chord.sounds[i].indexOf("is") != -1) {
				note.alteration = +1;
			} else {
				note.alteration = -1;
			}
			
			note.length = undefined;
			
			drawNote(note);
		}
	}

	function drawNote(note) {
		console.log(note);
	}

	/*-- public methods ---*/
	
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
			console.log(self.chord);
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
		self.options.scale = {
			"notes": ["c", "d", "e", "f", "g", "a", "h"],
			"sounds": [["his", "c"], ["cis", "des"], ["d"], ["dis", "es"], ["e", "fes"], ["eis", "f"], ["fis", "ges"], ["g"], ["gis", "aes"], ["a"], ["ais", "b", "hes"], ["h", "ces"]],
			"octave1StaveLines": [-1, -0.5, 0, 0.5, 1, 1.5, 2]
		};
		self.options.octaveLimit = {
			"sounds": ["a", "a"],
			"octave": [0, 2]
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
		triadAlgorithm = adaptArray(triadAlgorithm, self.options.scale);

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
				var arrayItem = self.options.scale[key][triadAlgorithm[key][i]];
				if(arrayItem.push) {
					for(var j = 0; j < arrayItem.length; j++) {
						if(arrayItem[j].slice(0, 1) == self.options.scale.notes[triadAlgorithm.notes[i]]) {
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
			for(var i = 0; i < self.options.scale[key].length; i++) {
				var arrayItem = self.options.scale[key][i];
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
		chord.octave = [self.options.octaveLimit.octave[0]];

		var chordStartIndex = getScaleNameIndex(chord.sounds[0]).sounds;
		//var chordEndIndex = getScaleNameIndex(chord.sounds[chord.sounds.length - 1]).sounds;

		var limitStartIndex = getScaleNameIndex(self.options.octaveLimit.sounds[0]).sounds;
		//var limitEndIndex = getScaleNameIndex(self.options.octaveLimit.sounds[1]).sounds;

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