/**
 * Created by vpetlya on 7/13/15.
 * vp_inbox@ukr.net
 */

algorithmHolder.putInstance(1, function () {
	const TYPE_INDEX = {unknown: 0, wall: 1, space: 2, exit: 3, key: 4, barrier: 5};
	const TYPE_VALUE = {0: 'unknown', 1: 'wall', 2: 'space', 3: 'exit', 4: 'key', 5: 'barrier'};
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
		var start = {x: width / 2 >> 0, y: height / 2 >> 0}

		this.getData = function(){
			return data;
		}

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
			if (typeof info.top != 'undefined') data[pos.x][pos.y].top = info.top;
			if (typeof info.right != 'undefined') data[pos.x][pos.y].right = info.right;
			if (typeof info.bottom != 'undefined') data[pos.x][pos.y].bottom = info.bottom;
			if (typeof info.left != 'undefined') data[pos.x][pos.y].left = info.left;
			if (typeof info.center != 'undefined') data[pos.x][pos.y].center = info.center;
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

	var Robot = function () {
		var map = new Map(15, 15);
		var pos = new Position(7, 7);
		var dir = new Direction(DIRECTION.TOP);
		var queueCMD = [];
		var api = null;

		this.getMap = function() {
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
					if (result.before != TYPE_VALUE['key']) {
						info[dir.backward] = result.before;
					} else {
						info['center'] = result.before;
					}
					map.update(tmpPos, info);

					info = {};
					tmpPos = pos.movePos(dir.getDirection(dir.right));
					if (result.right != TYPE_VALUE['key']) {
						info[dir.left] = result.right;
					} else {
						info['center'] = result.right;
					}
					map.update(tmpPos, info);

					info = {};
					tmpPos = pos.movePos(dir.getDirection(dir.left));
					if (result.left != TYPE_VALUE['key']) {
						info[dir.right] = result.left;
					} else {
						info['center'] = result.left;
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
						info = {center: TYPE_INDEX.space};
						info[dir.backward] = TYPE_INDEX.space;
						map.update(pos, info);
					} else {
						info = {};
						info[dir.forward] = TYPE_INDEX.barrier;
						map.update(pos, info);
						info = {};
						info[dir.backward] = TYPE_INDEX.barrier;
						map.update(pos.movePos(dir), info);
					}
					break;
			}
			queueCMD.shift();
		}

		this.generateDecision = function () {
			var cell = map.getCell(pos);
			if(Math.random()<0.1){
				this.toScan();
			}else if (cell[dir.forward] != TYPE_INDEX['wall'] && cell[dir.forward] != TYPE_INDEX['barrier']) {
				this.toMove();
			} else {
				this.toRandomSide(1,1);
			}
		}

		this.makeMove = function () {

		}
	}


	/**
	 * Component of ROBOMAZE that is responsible for drawing
	 */
	var mapVisualizer = function() {
		var CELL_SIZE = 20;
		var mapW = 15;
		var mapH = 15;
		var mapDiv = document.getElementById("map");
		var colors = {unknown: "#999", wall: "#000", space: "#fff", exit: "#f00", key: "#0f0", barrier: "#700"};

		for (var i = 0; i < mapH; i++) {
			for (var j = 0; j < mapW; j++) {
				var div = document.createElement("DIV");
				div.className="cell";
				div.id="cell_"+i+"_"+j;
				mapDiv.appendChild(div);
			}
		}


		this.drawMap = function(map, pos) {
			for (var i = 0; i < mapH; i++) {
				for (var j = 0; j < mapW; j++) {
					var cell = map.getCell({x:j,y:i})

					var div = document.getElementById("cell_"+i+"_"+j);
					div.className = "cell"
						+ " top-"+TYPE_VALUE[cell.top]
						+ " right-"+TYPE_VALUE[cell.right]
						+ " bottom-"+TYPE_VALUE[cell.bottom]
						+ " left-"+TYPE_VALUE[cell.left];
					if(cell.center == TYPE_INDEX['space']) div.className+=" space";
					if(j==pos.x && i==pos.y) div.className+=" pos";
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
			mapVisual = new mapVisualizer();
		}
		turn++;
		mapVisual.drawMap(robot.getMap(), robot.getPosition());
		robot.setResult(api.result);
		robot.generateDecision();

		return movesLog[turn] = robot.getCommand();
	}

	return {
		name: 'Hierarch of ways',
		roboFunc: HOW
	};
}());
