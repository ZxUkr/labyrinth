/**
 * Created by vpetlya on 7/13/15.
 * vp_inbox@ukr.net
 */

algorithmHolder.putInstance(1, function () {
	const TYPE_INDEX = {unknown: 0, barrier: 1, passable: 2, wall: 3, space: 4, exit: 5, key: 6};
	const TYPE_VALUE = {0: 'unknown', 1: 'barrier', 2: 'passable', 3: 'wall', 4: 'space', 5: 'exit', 6: 'key'};
	const DIRECTION = {
		TOP: {dx: 0, dy: -1, forward: 'top', backward: 'bottom', right: "right", left: "left"},
		RIGHT: {dx: 1, dy: 0, forward: 'right', backward: 'left', right: "bottom", left: "top"},
		BOTTOM: {dx: 0, dy: 1, forward: 'bottom', backward: 'top', right: "left", left: "right"},
		LEFT: {dx: -1, dy: 0, forward: 'left', backward: 'right', right: "top", left: "bottom"}
	}

	var Cell = function (top, right, bottom, left, center) {
		this.top = top;
		this.right = right;
		this.bottom = bottom;
		this.left = left;
		this.center = center;
		this.counter = 0;
	}

	var Direction = function (initDirection) {
		this.__proto__ = initDirection;

		this.toRight = function () {
			this.__proto__ = DIRECTION[this.right.toUpperCase()];
		}

		this.toLeft = function () {
			this.__proto__ = DIRECTION[this.left.toUpperCase()];
		}

		this.getDirection = function (name) {
			return new Direction(DIRECTION[name.toUpperCase()]);
		}
	}

	var Map = function (width, height) {
		var data = [];
		var center = {x: width / 2 >> 0, y: height / 2 >> 0};

		this.getData = function () {
			return data;
		}

		this.getWidth = function () {
			return width;
		}

		this.getHeight = function () {
			return height;
		}

		this.getInnerPos = function (pos) {
			return {x: center.x + pos.x, y: center.y + pos.y}
		}

		this.increment = function (pos) {
			var innerPos = this.getInnerPos(pos);
			data[innerPos.x][innerPos.y].counter++;
		}

		this.changeSize = function (top, right, bottom, left) {
			if (height + top + bottom <= 0 || width + right + left <= 0) return false;

			if (top < 0) {
				for (var i = 0; i < width; i++) {
					data[i].splice(0, -top);
				}
			} else if (top > 0) {
				for (var i = 0; i < width; i++) {
					for (var j = 0; j < top; j++) {
						data[i].unshift(new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown));
					}
				}
			}
			height += top;

			if (right < 0) {
				data.splice(data.length + right, -right);
			} else if (right > 0) {
				for (var i = 0; i < right; i++) {
					data.push([]);
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
					for (var j = 0; j < bottom; j++) {
						data[i].push(new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown));
					}
				}
			}
			height += bottom;

			if (left < 0) {
				data.splice(0, -left);
			} else if (left > 0) {
				for (var i = 0; i < left; i++) {
					data.unshift([]);
					for (var j = 0; j < height; j++) {
						data[0][j] = new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown);
					}
				}
			}
			width += left;

			center.x += left;
			center.y += top;
			return true;
		}

		this.update = function (pos, info) {
			var innerPos = this.getInnerPos(pos);
			if (innerPos.x < 0 || innerPos.x >= width || innerPos.y < 0 || innerPos.y >= height) {
				var top = innerPos.y < 0 ? Math.round(1 + height * 0.1) : 0;
				var right = innerPos.x >= width ? Math.round(1 + width * 0.1) : 0;
				var bottom = innerPos.y >= height ? Math.round(1 + height * 0.1) : 0;
				var left = innerPos.x < 0 ? Math.round(1 + width * 0.1) : 0;
				this.changeSize(top, right, bottom, left);
				innerPos = this.getInnerPos(pos);
			}

			if (typeof info.top != 'undefined' && info.top > data[innerPos.x][innerPos.y].top) data[innerPos.x][innerPos.y].top = info.top;
			if (typeof info.right != 'undefined' && info.right > data[innerPos.x][innerPos.y].right) data[innerPos.x][innerPos.y].right = info.right;
			if (typeof info.bottom != 'undefined' && info.bottom > data[innerPos.x][innerPos.y].bottom) data[innerPos.x][innerPos.y].bottom = info.bottom;
			if (typeof info.left != 'undefined' && info.left > data[innerPos.x][innerPos.y].left) data[innerPos.x][innerPos.y].left = info.left;
			if (typeof info.center != 'undefined' && info.center > data[innerPos.x][innerPos.y].center) data[innerPos.x][innerPos.y].center = info.center;
		}

		this.getCell = function (pos) {
			var innerPos = this.getInnerPos(pos);
			return data[innerPos.x][innerPos.y];
		}

		this.getRealCell = function (pos) {
			return data[pos.x][pos.y];
		}

		//Start Map code
		for (var i = 0; i < width; i++) {
			data[i] = [];
			for (var j = 0; j < height; j++) {
				data[i][j] = new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown);
			}
		}
		this.update({x: 0, y: 0}, {center: TYPE_INDEX.passable});
	}

	var Position = function (x, y) { //Осторожно ресайз карты делает позиции некоректными.
		this.x = x;
		this.y = y;

		this.movePos = function (dir) {
			return {x: this.x + dir.dx, y: this.y + dir.dy}
		}

		this.toMove = function (dir) {
			this.x += dir.dx;
			this.y += dir.dy;
		}

		this.top = function () {
			return new Position(this.x + DIRECTION.TOP.dx, this.y + DIRECTION.TOP.dy);
		}
		this.right = function () {
			return new Position(this.x + DIRECTION.RIGHT.dx, this.y + DIRECTION.RIGHT.dy);
		}
		this.bottom = function () {
			return new Position(this.x + DIRECTION.BOTTOM.dx, this.y + DIRECTION.BOTTOM.dy);
		}
		this.left = function () {
			return new Position(this.x + DIRECTION.LEFT.dx, this.y + DIRECTION.LEFT.dy);
		}
	}

	// ========================================= Robot =========================================
	var Robot = function () {
		var map = new Map(2, 2);
		var pos = new Position(0, 0);
		var dir = new Direction(DIRECTION.TOP);
		var queueCMD = [];
		var api = null;

		var behavior = {
			discovery: function () {

			},
			going: function () {

			},
			wade: function () {

			}
		}

		this.getMap = function () {
			return map;
		}

		this.getPosition = function () {
			return pos;
		}

		this.getDirection = function () {
			return dir;
		}

		this.getCommand = function () {
			return queueCMD[0];
		}

		this.setApi = function (apiObj) {
			api = apiObj;
		}

		this.toRight = function () {
			queueCMD.push(api.CMD_RIGHT);
		}

		this.toLeft = function () {
			queueCMD.push(api.CMD_LEFT);
		}

		this.toRandomSide = function (lp, rp) {
			if (Math.random() <= lp / (lp + rp)) this.toLeft();
			else this.toRight();
		}

		this.toMove = function () {
			queueCMD.push(api.CMD_MOVE);
		}

		this.toTopSide = function (andMove) {
			var isPush = false;
			switch (dir.forward) {
				case 'top':
					break;
				case 'right':
					queueCMD.push(api.CMD_LEFT);
					isPush = true;
					break;
				case 'bottom':
					queueCMD.push(api.CMD_RIGHT);
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
				case 'left':
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
			}
			if (andMove == true) queueCMD.push(api.CMD_MOVE);
			return andMove == true || isPush;
		}

		this.toRightSide = function (andMove) {
			var isPush = false;
			switch (dir.forward) {
				case 'top':
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
				case 'right':
					queueCMD.push(api.CMD_MOVE);
					break;
				case 'bottom':
					queueCMD.push(api.CMD_LEFT);
					isPush = true;
					break;
				case 'left':
					queueCMD.push(api.CMD_RIGHT);
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
			}
			if (andMove == true) queueCMD.push(api.CMD_MOVE);
			return andMove == true || isPush;
		}

		this.toBottomSide = function (andMove) {
			var isPush = false;
			switch (dir.forward) {
				case 'top':
					queueCMD.push(api.CMD_RIGHT);
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
				case 'right':
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
				case 'bottom':
					break;
				case 'left':
					queueCMD.push(api.CMD_LEFT);
					isPush = true;
					break;
			}
			if (andMove == true) queueCMD.push(api.CMD_MOVE);
			return andMove == true || isPush;
		}

		this.toLeftSide = function (andMove) {
			var isPush = false;
			switch (dir.forward) {
				case 'top':
					queueCMD.push(api.CMD_LEFT);
					isPush = true;
					break;
				case 'right':
					queueCMD.push(api.CMD_RIGHT);
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
				case 'bottom':
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
				case 'left':
					break;
			}
			if (andMove == true) queueCMD.push(api.CMD_MOVE);
			return andMove == true || isPush;
		}

		this.toScan = function () {
			queueCMD.push(api.CMD_SCAN);
		}

		this.setResult = function (result) {
			var info;

			switch (queueCMD[0]) {
				case api.CMD_SCAN:
					var tmpPos;
					info = {};
					info[dir.forward] = TYPE_INDEX[result.before];
					info[dir.right] = TYPE_INDEX[result.right];
					info[dir.left] = TYPE_INDEX[result.left];
					map.update(pos, info);

					info = {};
					tmpPos = pos.movePos(dir.getDirection(dir.forward));
					if (result.before != 'key') {
						info[dir.backward] = TYPE_INDEX[result.before];
						if (result.before != 'wall') info['center'] = TYPE_INDEX[result.before];
					} else {
						info['center'] = TYPE_INDEX[result.before];
					}
					map.update(tmpPos, info);

					info = {};
					tmpPos = pos.movePos(dir.getDirection(dir.right));
					if (result.right != 'key') {
						info[dir.left] = TYPE_INDEX[result.right];
						if (result.right != 'wall') info['center'] = TYPE_INDEX[result.right];
					} else {
						info['center'] = TYPE_INDEX[result.right];
					}
					map.update(tmpPos, info);

					info = {};
					tmpPos = pos.movePos(dir.getDirection(dir.left));
					if (result.left != 'key') {
						info[dir.right] = TYPE_INDEX[result.left];
						if (result.left != 'wall') info['center'] = TYPE_INDEX[result.left];
					} else {
						info['center'] = TYPE_INDEX[result.left];
					}
					map.update(tmpPos, info);
					break;
				case api.CMD_LEFT:
					dir.toLeft();
					break;
				case api.CMD_RIGHT:
					dir.toRight()
					break;
				case api.CMD_MOVE:
					if (result.success) {
						info = {};
						info[dir.forward] = TYPE_INDEX.space;
						map.update(pos, info);
						pos.toMove(dir);
						info = {center: TYPE_INDEX.passable};
						info[dir.backward] = TYPE_INDEX.space;
						map.update(pos, info);
						map.increment(pos);
					} else {
						if (queueCMD.length > 0) queueCMD = [];
						info = {};
						info[dir.forward] = TYPE_INDEX.barrier;
						map.update(pos, info);
						info = {};
						info[dir.backward] = TYPE_INDEX.barrier;
						map.update(pos.movePos(dir), info);
						this.toScan();
						this.toScan();
					}
					break;
			}
			queueCMD.shift();
		}

		this.generateDecision = function () {
			if (queueCMD.length > 0) return;

			var cell = map.getCell(pos);
			if (cell[dir.forward] == TYPE_INDEX['unknown']) {
				this.toMove();
			} else if (cell[dir.right] == TYPE_INDEX['unknown']) {
				this.toRight();
				this.toMove();
			} else if (cell[dir.left] == TYPE_INDEX['unknown']) {
				this.toLeft();
				this.toMove();
			} else if (cell[dir.backward] == TYPE_INDEX['unknown']) {
				this.toRight();
				this.toRight();
				this.toMove();
			} else if (cell[dir.forward] == TYPE_INDEX['barrier'] || cell[dir.forward] == TYPE_INDEX['passable']) {
				this.toScan();
			} else {
				var forwCell = map.getCell(pos.movePos(DIRECTION[dir.forward.toUpperCase()]));
				var rightCell = map.getCell(pos.movePos(DIRECTION[dir.right.toUpperCase()]));
				var leftCell = map.getCell(pos.movePos(DIRECTION[dir.left.toUpperCase()]));
				var backCell = map.getCell(pos.movePos(DIRECTION[dir.backward.toUpperCase()]));
				if (cell[dir.forward] != TYPE_INDEX['wall'] && cell[dir.forward] != TYPE_INDEX['barrier']
					&&(forwCell.counter < rightCell.counter || cell[dir.right] == TYPE_INDEX['wall'] || cell[dir.right] == TYPE_INDEX['barrier'])
					&&(forwCell.counter < leftCell.counter || cell[dir.left] == TYPE_INDEX['wall'] || cell[dir.left] == TYPE_INDEX['barrier'])
					&& (forwCell.counter < backCell.counter || cell[dir.backward] == TYPE_INDEX['wall'] || cell[dir.backward] == TYPE_INDEX['barrier'])
					) {
					this.toMove();
				} else if (cell[dir.right] != TYPE_INDEX['wall'] && cell[dir.right] != TYPE_INDEX['barrier']
					&&(rightCell.counter < leftCell.counter || cell[dir.left] == TYPE_INDEX['wall'] || cell[dir.left] == TYPE_INDEX['barrier'])
					&& (rightCell.counter < backCell.counter || cell[dir.backward] == TYPE_INDEX['wall'] || cell[dir.backward] == TYPE_INDEX['barrier'])
				) {
					this.toRight();
					this.toMove();
				} else if (cell[dir.left] != TYPE_INDEX['wall'] && cell[dir.left] != TYPE_INDEX['barrier']
					&& (leftCell.counter < backCell.counter || cell[dir.backward] == TYPE_INDEX['wall'] || cell[dir.backward] == TYPE_INDEX['barrier'])
				) {
					this.toLeft();
					this.toMove();
				} else if (cell[dir.backward] != TYPE_INDEX['wall'] && cell[dir.backward] != TYPE_INDEX['barrier']) {
					this.toRight();
					this.toRight();
					this.toMove();
				} else {
					this.toRandomSide(1, 1);
				}
			}
		}

		this.makeMove = function () {

		}
	}

	/**
	 * Component of ROBOMAZE that is responsible for drawing
	 */
	var mapVisualizer = function (map) {
		var CELL_SIZE = 24;
		var mapW = map.getWidth();
		var mapH = map.getHeight();
		var mapDiv = document.getElementById("map");

		this.createMap = function () {
			mapDiv.style.width = mapW * CELL_SIZE + "px";
			mapDiv.style.height = mapH * CELL_SIZE + "px";
			for (var i = 0; i < mapH; i++) {
				for (var j = 0; j < mapW; j++) {
					var div = document.createElement("DIV");
					div.className = "cell";
					div.id = "cell_" + i + "_" + j;
					mapDiv.appendChild(div);
				}
			}
		}
		this.createMap();

		this.resizeMap = function () {
			mapW = map.getWidth();
			mapH = map.getHeight();
			mapDiv.innerHTML = '';
			this.createMap();
		}

		this.drawMap = function (pos) {
			if (mapW != map.getWidth() || mapH != map.getHeight()) {
				this.resizeMap();
			}
			var innerPos = map.getInnerPos(pos);
			for (var i = 0; i < mapH; i++) {
				for (var j = 0; j < mapW; j++) {
					var cell = map.getRealCell({x: j, y: i})

					var div = document.getElementById("cell_" + i + "_" + j);
					div.className = "cell"
						+ " top-" + TYPE_VALUE[cell.top]
						+ " right-" + TYPE_VALUE[cell.right]
						+ " bottom-" + TYPE_VALUE[cell.bottom]
						+ " left-" + TYPE_VALUE[cell.left];
					if (cell.center == TYPE_INDEX['passable']) div.className += " passable";
					else if (cell.center == TYPE_INDEX['space']) div.className += " space";
					else if (cell.center == TYPE_INDEX['key']) div.className += " key";
					if (j == innerPos.x && i == innerPos.y) div.className += " pos";
					if (cell.counter > 0) div.innerHTML = cell.counter;
				}
			}
		}
	};

	var robot = new Robot()
	var movesLog = ['Start'];
	var turn = 0;
	var mapVisual;
	var HOW = function (api) {
		if (turn == 0) {
			robot.setApi(api);
			mapVisual = new mapVisualizer(robot.getMap());
		}
		turn++;
		robot.setResult(api.result);
		mapVisual.drawMap(robot.getPosition());
		robot.generateDecision();

		return movesLog[turn] = robot.getCommand();
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