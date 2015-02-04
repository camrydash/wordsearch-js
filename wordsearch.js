//Each position in the wordsearch grid is a Cell
function Cell(letter) {
	this.letter = letter;
	this.words = {};
	this.is_part_of_word = false;

	this.addWordInDirection = function(word_index, direction) {
		this.words[word_index] = direction;
		this.is_part_of_word = true;
	};
}

function errorParser(arrayArgs) {
	if(arrayArgs && arrayArgs.length) {
		var kvp = arrayArgs.map(function(kv) {
			return kv.key + "=" + kv.value;
		});
		return kvp.join("&");
	}
	return "cannot decode args";
}

function WordSearch(words) {
	var directions = {
		N : 0,
		NE : 1,
		E : 2,
		SE : 3,
		S : 4,
		SW : 5,
		W : 6,
		NW : 7
	};

	var step_directions = {};
	step_directions[directions.N] 	= function (row, column) { return [row - 1 	, column	] };
	step_directions[directions.NE] 	= function (row, column) { return [row - 1 	, column + 1] };
	step_directions[directions.E] 	= function (row, column) { return [row 		, column + 1] };
	step_directions[directions.SE]	= function (row, column) { return [row + 1 	, column + 1] };
	step_directions[directions.S] 	= function (row, column) { return [row + 1 	, column	] };
	step_directions[directions.SW] 	= function (row, column) { return [row + 1 	, column - 1] };
	step_directions[directions.W] 	= function (row, column) { return [row 		, column - 1] };
	step_directions[directions.NW] 	= function (row, column) { return [row - 1 	, column - 1] };

	//Converts words to upperCase and removes any whitespaces
	words = words.map(function(w) { 
		return w.toUpperCase().trim();
	});

	var randomFunction = function(min, max) {
		if(min > max)
			throw "min cannot be > max";
		return min + Math.floor((Math.random() * (max - min + 1)) + 0);
	}

	var randomLetter = function() {
		return String.fromCharCode(randomFunction(65, 90));
	}

	var shuffle = function shuffle(o){ 
    	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    	return o;
	};

	var attemptWordPlacement = function(grid, word, row, column, direction) {

		//can move right
		if(direction == directions.NE || direction == directions.E || direction == directions.SE)
			if(column + (word.length - 1) > grid.length - 1)
				return false;
		//can move left
		if(direction == directions.NW || direction == directions.W || direction == directions.SW)
			if(column - (word.length - 1) < 0)
				return false;
		//can move up
		if(direction == directions.NW || direction == directions.N || direction == directions.NE)
			if(row - (word.length - 1) < 0)
				return false;
		//can move down
		if(direction == directions.SW || direction == directions.S || direction == directions.SE)
			if(row + (word.length - 1) > grid.length - 1)
				return false;

		//check for intersections
		var r = row, c = column;
		var step = step_directions[direction];
		for(var i = 0; i < word.length; i++) {
			try
			{
			if(grid[r][c].letter != null && grid[r][c].letter != word.charAt(i))
				return false;
			}
			catch(ex) {
				throw errorParser([ { key : "word", value : word }, { key : "row", value : row }, { key : "column", value : column }, { key : "direction", value : direction }]);
			}
			var next_cell_pos = step(r, c);
			r = next_cell_pos[0];
			c = next_cell_pos[1];
		}

		r = row, c = column;
		for (var w = 0; w < word.length; w++) {
			var cell = grid[r][c];
			cell.letter = word.charAt(w);
			cell.addWordInDirection(w, direction)
			var next_cell_pos = step(r, c);
			r = next_cell_pos[0];
			c = next_cell_pos[1];
		}
		console.log("filled: " + word)
		return true;
	}


	var addWordtoGrid = function(grid, word, allowed_directions) {
		var start_r = randomFunction(0, grid.length - 1);
		var start_c = randomFunction(0, grid[start_r].length - 1);

		for(var r = start_r; r < grid.length + start_r; r++) {
			var r0 = r % grid.length;
			for (var c = start_c; c < grid[r0].length + start_c; c++) {
				var c0 = c % grid[r0].length;
				shuffle(allowed_directions)
				for (var d = 0; d < allowed_directions.length; d++) {
					if(attemptWordPlacement(grid, word, r0, c0, allowed_directions[d])) 
						return { row : r0, column : c0, direction : allowed_directions[d] };
				}
			}
		}
		return false;
	}

	this.generate = function(rows, columns, allowed_directions) {
		var grid = new Array(rows);
		for(var r = 0; r < rows; r++) {
			grid[r] = new Array(columns);
			for(var c = 0; c < columns; c++) {
				grid[r][c] = new Cell(null);
			}
		}

		if(allowed_directions == undefined) {
			allowed_directions = [];
			var dkeys = Object.keys(directions);
			for (var k = 0; k < dkeys.length; k++) {
				//var dir = {};
				//dir[dkeys[k]] = directions[dkeys[k]];
				//allowed_directions.push(dir); 
				allowed_directions.push(directions[dkeys[k]]);
			}
		}

		var tries = 10;
		var fails = 0;
		for (var w = 0; w < words.length; w++) {
			for (var j = 0; j < tries; j++) {
				//attempt to place the word for 10 tries
				//debugger;
				var position = addWordtoGrid(grid, words[w], allowed_directions);
				if (position) break; else fails++;
			}
		}

		console.log("Fails: " + fails);
		for (var row = 0; row < grid.length; row++) {
			for (var clm = 0; clm < grid[row].length; clm++) {
				if(grid[row][clm].letter == null)
					grid[row][clm].letter = randomLetter();
				;
			}
		}
		return grid;
	}

}


var config_settings = {
	rows : 		10,
	columns : 	10,
	sample_words : ["FRANKLIN", "UNIVERSITY", "CHOCOLATE",
	 "APPLE", "RICE", "STORM", "HOLOCAUST", "GREEN",
	 "SUMMARY", "DASH", "ECLIPSE"],

};


function initialize(words) {
	if(words == undefined)
		words = config_settings.sample_words;
	var ws = new WordSearch(words);
	var grid = ws.generate(config_settings.rows, config_settings.columns)
	createTable(grid);
}
		
initialize();

function createTable(grid) {
    //document.write("<table border=\"1\">");
    var dataHtml = "";
    for (var row = 0; row < grid.length; row++) {
        //document.write("<tr>");
        dataHtml += "<tr>\n";
        for (var clm = 0; clm < grid[row].length; clm++) {
            var bgcolor = grid[row][clm].is_part_of_word ? "white" : "white";
            var text = grid[row][clm].is_part_of_word ? "<strong>{0}</strong>".replace("{0}", grid[row][clm].letter) : grid[row][clm].letter;
            dataHtml += "\t<td align=\"center\" bgcolor=\"" + bgcolor + "\">" + text + "</td>\n";
            //document.write("<td align=\"center\" bgcolor=\"" + bgcolor + "\">" + grid[row][clm] + "</td>");
        }
        dataHtml += "\n</tr>\n";
        //document.write("</tr>");
    }
    //console.log(dataHtml);
    $("#wordsearch-table").html(dataHtml);
    //document.write("</table>");
}