/**
 * Created by vpetlya on 7/13/15.
 * vp_inbox@ukr.net
 */

algorithmHolder.putInstance(1, function () {
	const TYPE_INDEX = {unknown: 0, wall: 1, space: 2, exit: 3, key: 4, barrier: 5};
	const TYPE_VALUE = {0: 'unknown', 1: 'wall', 2: 'space', 3: 'exit', 4: 'key', 5: 'barrier'};
	const DIRECTION = {
		TOP: {x: 0, y: -1, name: 'top', contrName: 'bottom'},
		RIGHT: {x: 1, y: 0, name: 'right', contrName: 'left'},
		BOTTOM: {x: 0, y: 1, name: 'bottom', contrName: 'top'},
		LEFT: {x: -1, y: 0, name: 'left', contrName: 'right'}
	}

	var Cell = function (top, right, bottom, left, center) {
		this.top = top;
		this.right = right;
		this.bottom = bottom;
		this.left = left;
		this.center = center;
	}

	var Map = function (width, height) {
		var data = [];
		var start = {x: width / 2 >> 0, y: height / 2 >> 0}

		this.changeSize = function (top, right, bottom, left) {
			if (height + top + bottom <= 0 || width + right + left <= 0) return false;

			if (top < 0) {
				for (var i = 0; i < width; i++) {
					data[i].splice(0, -top);
				}
			} else if (top > 0) {
				for (var i = 0; i < width; i++) {
					for (var j = 0; j < top; i++) {
						data[i].unshift(new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown));
					}
				}
			}
			height += top;

			if (right < 0) {
				data.splice(data.length + right, -right);
			} else if (right > 0) {
				for (var i = 0; i < right; i++) {
					data.push(new Array[height]);
					for (var j = 0; j < height; j++) {
						data[width + i][j] = new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown);
					}
				}
			}
			width += right;

			if (bottom < 0) {
				for (var i = 0; i < width; i++) {
					data[i].splice(height + bottom, -bottom);
				}
			} else if (bottom > 0) {
				for (var i = 0; i < width; i++) {
					for (var j = 0; j < bottom; i++) {
						data[i].push(new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown));
					}
				}
			}
			height += bottom;

			if (left < 0) {
				data.splice(0, -left);
			} else if (left > 0) {
				for (var i = 0; i < left; i++) {
					data.unshift(new Array[height]);
					for (var j = 0; j < height; j++) {
						data[0][j] = new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown);
					}
				}
			}
			width += left;

			start.x += right + left;
			start.y += top + bottom;
			return true;
		}

		this.update = function (pos, info) {
			if (typeof info.top != undefined) data[pos.x][pos.y].top = info.top;
			if (typeof info.right != undefined) data[pos.x][pos.y].right = info.right;
			if (typeof info.bottom != undefined) data[pos.x][pos.y].bottom = info.bottom;
			if (typeof info.left != undefined) data[pos.x][pos.y].left = info.left;
			if (typeof info.center != undefined) data[pos.x][pos.y].center = info.center;
		}

		this.getCell = function (pos) {
			return data[pos.x][pos.y];
		}

		//Start Map code
		for (var i = 0; i < width; i++) {
			data[i] = [];
			for (var j = 0; j < height; j++) {
				data[i][j] = new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown);
			}
		}
		this.update({x: start.x, y: start.y}, {center: TYPE_INDEX.space});
	}

	var Position = function (x, y) {
		this.x = x;
		this.y = y;

		this.movePos = function (dir) {
			return {x: this.x + dir.x, y: this.y + dir.y}
		}

		this.makeMove = function (dir) {
			this.x += dir.x;
			this.y += dir.y;
		}

		this.top = function () {
			return new Position(this.x + DIRECTION.TOP.x, this.y + DIRECTION.TOP.y);
		}
		this.right = function () {
			return new Position(this.x + DIRECTION.RIGHT.x, this.y + DIRECTION.RIGHT.y);
		}
		this.bottom = function () {
			return new Position(this.x + DIRECTION.BOTTOM.x, this.y + DIRECTION.BOTTOM.y);
		}
		this.left = function () {
			return new Position(this.x + DIRECTION.LEFT.x, this.y + DIRECTION.LEFT.y);
		}
	}

	var Robot = function () {
		var map = new Map(15, 15);
		var pos = new Position(7, 7, DIRECTION.TOP);
		var dir = DIRECTION.TOP;

		this.getPosition = function () {
			return pos;
		}

		this.setResult = function (result, api) {
			if (movesLog[turn - 1] == api.CMD_MOVE) {
				var tmp;
				if (result.success) {
					tmp = {};
					tmp[dir.name] = TYPE_INDEX.space;
					map.update(pos, tmp);
					pos.makeMove(dir);
					tmp = {center: TYPE_INDEX.space};
					tmp[dir.contrName] = TYPE_INDEX.space;
					map.update(pos, tmp);
				} else {
					tmp = {};
					tmp[dir.name] = TYPE_INDEX.barrier;
					map.update(pos, tmp);
					tmp = {};
					tmp[dir.contrName] = TYPE_INDEX.barrier;
					map.update(pos.movePos(dir), tmp);
				}
			}
		}

		this.generateMove = function () {

		}

		this.makeMove = function () {

		}
	}


	var robot = new Robot()
	var movesLog = ['Start'];
	var turn = 0;
	var HOW = function (api) {
		turn++;
		robot.setResult(api.result, api);

		movesLog[turn] = api.CMD_MOVE;
		return api.CMD_MOVE;
	}

	return {
		name: 'Hierarch of ways',
		roboFunc: HOW
	};
}());

// init your code here
algorithmHolder.putInstance(2, function () {
	// sample implementation of algorithm
	var turnDirection,
		afterScan = false,
		turnCount = 0;
	return {
		name: 'Half Blind',
		roboFunc: function (api) {
			if (turnCount) {
				turnCount--;
				return turnDirection;
			}

			if (afterScan) {
				afterScan = false;
				// choose turn
				var turns = [];
				if (api.result.left === api.PLACE_EXIT || api.result.left === api.PLACE_KEY) {
					return api.CMD_LEFT;
				}
				if (api.result.right === api.PLACE_EXIT || api.result.right === api.PLACE_KEY) {
					return api.CMD_RIGHT;
				}
				if (api.result.left == api.PLACE_SPACE) {
					turns.push(api.CMD_LEFT);
				}
				if (api.result.right == api.PLACE_SPACE) {
					turns.push(api.CMD_RIGHT);
				}
				if (turns.length == 0) {
					turnCount = 1;
					turnDirection = api.CMD_RIGHT;
				} else if (turns.length > 1) {
					turnDirection = turns[Math.floor(Math.random() * 2)];
				} else {
					turnDirection = turns[0];
				}
				return turnDirection;
			}

			if (api.result.success) {
				return api.CMD_MOVE;
			} else {
				// need open eyes
				afterScan = true;
				return api.CMD_SCAN;
			}
		}
	};
}());