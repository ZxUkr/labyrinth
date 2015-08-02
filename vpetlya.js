/**
 * Created by vpetlya on 7/13/15.
 * vp_inbox@ukr.net
 */

algorithmHolder.putInstance(1, function () {
	const TYPE_BITS = {known: 2, type: 1, goal:2}; // type: 0 - passable, 1 - barrier;  goal: 00 - space, 10 - wall, 01 - key, 11 - exit
	const MASK = {known:1+2, type:4, goal:8+16};
	const TYPE_INDEX = {unknown: 0, passable: 1+0, barrier: 1+4, space: 3+0+0, wall: 3+4+8, key: 3+0+16, exit: 3+4+(8+16)};
	const TYPE_VALUE = {0: 'unknown', 1: 'passable', 3: 'space', 5: 'barrier', 15: 'wall', 19: 'key', 31: 'exit'};
	const DIRECTION = {
		top: {dx: 0, dy: -1, forward: 'top', backward: 'bottom', right: "right", left: "left"},
		right: {dx: 1, dy: 0, forward: 'right', backward: 'left', right: "bottom", left: "top"},
		bottom: {dx: 0, dy: 1, forward: 'bottom', backward: 'top', right: "left", left: "right"},
		left: {dx: -1, dy: 0, forward: 'left', backward: 'right', right: "top", left: "bottom"}
	}

	// ======================== Cell ========================
	var Cell = function (top, right, bottom, left, center, x, y) {
		this.top = top;
		this.right = right;
		this.bottom = bottom;
		this.left = left;
		this.center = center;
		this.counter = 0;
		this.step = null;
		this.probability = null;
		this.zone = null;
		this.x = x;
		this.y = y;
	}

	// ======================== Direction ========================
	var Direction = function (initDirection) {
		this.__proto__ = initDirection;

		this.toRight = function () {
			this.__proto__ = DIRECTION[this.right];
		}

		this.toLeft = function () {
			this.__proto__ = DIRECTION[this.left];
		}

		this.getDirection = function (name) {
			return new Direction(DIRECTION[name]);
		}
	}

	// ======================== MAP ========================
	var Map = function (width, height) {
		var data = [];
		this.updateForDraw = [];
		var center = {x: width / 2 >> 0, y: height / 2 >> 0};
		this.keyPos = null;
		this.exitPos = null;
		this.keyPossibilityCells = 0;
		var realTop = height;
		var realRight = 0;
		var realBottom = 0;
		var realLeft = width;
		var zones = [];
		var horizontalWalls = 0;
		var verticalWalls = 0;
		var cells = 1;
		this.getHorizontalProbability = function(){return 0.5*horizontalWalls/cells};
		this.getVerticalProbability = function(){return 0.5*verticalWalls/cells};
		this.getAverageSize = function(){ return 0.5*(realRight-realLeft + realBottom-realTop) };

		this.getData = function () {
			return data;
		}

		this.getZones = function() {
			return zones;
		}

		this.getWidth = function () {
			return width;
		}

		this.getHeight = function () {
			return height;
		}

		this.isEdge = function(pos) {
			var innerPos = this.getInnerPos(pos);
			return innerPos.x == realLeft || innerPos.x == realRight || innerPos.y == realTop || innerPos.y == realBottom;
		}

		this.getInnerPos = function (pos) {
			return new Position(center.x + pos.x, center.y + pos.y);
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
			realLeft += left;
			realTop += top;
			return true;
		}

		this.updateCoordinates = function(){
			for (var i = 0; i < width; i++) {
				for (var j = 0; j < height; j++) {
					data[i][j].x=i;
					data[i][j].y=j;
				}
			}
		}

		this.keyFound = function(pos){
			this.keyPos = new Position(pos.x, pos.y);
			this.keyPos.turn = turn;
			/*for (var i = 0; i < width; i++) {
				for (var j = 0; j < height; j++) {
					if(data[i][j].center == TYPE_INDEX.passable) data[i][j].center = TYPE_INDEX.space ;
				}
			}*/
		}

		this.exitFound = function(pos){
			this.exitPos = new Position(pos.x, pos.y);
			this.exitPos.turn = turn;
			/*for (var i = 0; i < width; i++) {
				for (var j = 0; j < height; j++) {
					if(data[i][j].top == TYPE_INDEX.barrier) data[i][j].top = TYPE_INDEX.wall;
					if(data[i][j].right == TYPE_INDEX.barrier) data[i][j].right = TYPE_INDEX.wall;
					if(data[i][j].bottom == TYPE_INDEX.barrier) data[i][j].bottom = TYPE_INDEX.wall;
					if(data[i][j].left == TYPE_INDEX.barrier) data[i][j].left = TYPE_INDEX.wall;
				}
			}*/
		}

		this.exitLocked = function(){
			for (var i = 0; i < width; i++) {
				for (var j = 0; j < height; j++) {
					if (data[i][j].center == TYPE_INDEX.passable) data[i][j].center = TYPE_INDEX.space;
				}
			}
			this.keyPossibilityCells = 0;
		}

		this.update = function (pos, info) {
			var innerPos = this.getInnerPos(pos);
			if (innerPos.x <= 0 || innerPos.x >= width-1 || innerPos.y <= 0 || innerPos.y >= height-1) {
				var top = innerPos.y <= 0 ? Math.round(1 + height * 0.1) : 0;
				var right = innerPos.x >= width-1 ? Math.round(1 + width * 0.1) : 0;
				var bottom = innerPos.y >= height-1 ? Math.round(1 + height * 0.1) : 0;
				var left = innerPos.x <= 0 ? Math.round(1 + width * 0.1) : 0;
				this.changeSize(top, right, bottom, left);
				this.updateCoordinates();
				innerPos = this.getInnerPos(pos);
			}

			if (innerPos.x < realLeft) realLeft = innerPos.x+1;
			else if (innerPos.x > realRight) realRight = innerPos.x-1;
			if (innerPos.y < realTop) realTop = innerPos.y+1;
			else if (innerPos.y > realBottom) realBottom = innerPos.y-1;

			if (typeof info.top != 'undefined') {
				if ((data[innerPos.x][innerPos.y].top & MASK.known) <= 1 && info.top == TYPE_INDEX.wall) horizontalWalls++;
				if (info.top > data[innerPos.x][innerPos.y].top) data[innerPos.x][innerPos.y].top = info.top;
			}
			if (typeof info.right != 'undefined') {
				if ((data[innerPos.x][innerPos.y].right & MASK.known) <= 1 && info.right == TYPE_INDEX.wall) verticalWalls++;
				if (info.right > data[innerPos.x][innerPos.y].right) data[innerPos.x][innerPos.y].right = info.right;
			}
			if (typeof info.bottom != 'undefined') {
				if ((data[innerPos.x][innerPos.y].bottom & MASK.known) <= 1 && info.bottom == TYPE_INDEX.wall) horizontalWalls++;
				if (info.bottom > data[innerPos.x][innerPos.y].bottom) data[innerPos.x][innerPos.y].bottom = info.bottom;
			}
			if (typeof info.left != 'undefined') {
				if ((data[innerPos.x][innerPos.y].left & MASK.known) <= 1 && info.left == TYPE_INDEX.wall) verticalWalls++;
				if (info.left > data[innerPos.x][innerPos.y].left) data[innerPos.x][innerPos.y].left = info.left;
			}
			if (typeof info.center != 'undefined') {
				if ((data[innerPos.x][innerPos.y].center & MASK.type) == 0) cells++;
				if ((data[innerPos.x][innerPos.y].center & MASK.known) == 0 && (info.center & (MASK.known | MASK.type)) == TYPE_INDEX.passable) this.keyPossibilityCells++;
				else if ((data[innerPos.x][innerPos.y].center & (MASK.known | MASK.type)) == TYPE_INDEX.passable && info.center == TYPE_INDEX.space) this.keyPossibilityCells--;
				if (info.center > data[innerPos.x][innerPos.y].center) data[innerPos.x][innerPos.y].center = info.center;
			}

			if (info.center == TYPE_INDEX.key) {
				this.keyFound(pos);
			}
			if ([info.top, info.right, info.bottom, info.left, info.center].indexOf(TYPE_INDEX.exit) > -1 && this.exitPos == null) {
				this.exitFound(pos);
			}
			if(mapVisual != null) this.updateForDraw.push(data[innerPos.x][innerPos.y]);
		}

		this.getCell = function (pos) {
			var innerPos = this.getInnerPos(pos);
			if (innerPos.x < 0 || innerPos.x >= width || innerPos.y < 0 || innerPos.y >= height)
				return false;
			return data[innerPos.x][innerPos.y];
		}

		this.getRealCell = function (pos) {
			if (pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height)
				return false;
			return data[pos.x][pos.y];
		}

		this.resetField = function () {
			for (var i = 0; i < width; i++) {
				for (var j = 0; j < height; j++) {
					data[i][j].step = null;
					data[i][j].zone = null;
					data[i][j].probability = null;
				}
			}
		}

		this.findZones = function () {
			var zoneCounter = 0;
			for (var i = 0; i < width; i++) {
				for (var j = 0; j < height; j++) {
					if (data[i][j].zone == null && (data[i][j].center & MASK.known) == 0) {
						var front = [this.getRealCell({x: i, y: j})];
						front[0].zone = zoneCounter;
						var zoneSize = 1;
						while (front.length > 0) {
							var current = front.shift();
							var topCell = this.getRealCell({x: current.x, y: current.y - 1});
							var rightCell = this.getRealCell({x: current.x + 1, y: current.y});
							var bottomCell = this.getRealCell({x: current.x, y: current.y + 1});
							var leftCell = this.getRealCell({x: current.x - 1, y: current.y});
							if(topCell && topCell.zone == null && (topCell.center & MASK.known) == 0){
								topCell.zone = zoneCounter;
								front.push(topCell);
								zoneSize++;
							}
							if(rightCell && rightCell.zone == null && (rightCell.center & MASK.known) == 0){
								rightCell.zone = zoneCounter;
								front.push(rightCell);
								zoneSize++;
							}
							if(bottomCell && bottomCell.zone == null && (bottomCell.center & MASK.known) == 0){
								bottomCell.zone = zoneCounter;
								front.push(bottomCell);
								zoneSize++;
							}
							if(leftCell && leftCell.zone == null && (leftCell.center & MASK.known) == 0){
								leftCell.zone = zoneCounter;
								front.push(leftCell);
								zoneSize++;
							}
						}
						zones[zoneCounter] = zoneSize;
						zoneCounter++;
					}
				}
			}
		}

		this.restorePath = function (endCell) {
			var path = [endCell];
			for (var i = endCell.step; i > 0; i--) {
				var current = path[path.length - 1];
				var topCell = this.getRealCell({x: current.x, y: current.y - 1});
				var rightCell = this.getRealCell({x: current.x + 1, y: current.y});
				var bottomCell = this.getRealCell({x: current.x, y: current.y + 1});
				var leftCell = this.getRealCell({x: current.x - 1, y: current.y});
				if ((current.top & MASK.type) == 0 && topCell && topCell.step != null && current.step == topCell.step + 1) {
					path.push(topCell);
				} else if ((current.right & MASK.type) == 0 && rightCell && rightCell.step != null && current.step == rightCell.step + 1) {
					path.push(rightCell);
				} else if ((current.bottom & MASK.type) == 0 && bottomCell && bottomCell.step != null && current.step == bottomCell.step + 1) {
					path.push(bottomCell);
				} else if ((current.left & MASK.type) == 0 && leftCell && leftCell.step != null && current.step == leftCell.step + 1) {
					path.push(leftCell);
				}
			}
			path.reverse();
			return path;
		}

		this.findShortestPath = function (startCell, endCell, reliability) { //Алгоритм Дейкстры +
			if (typeof reliability == "undefined") reliability = 0.4;
			this.resetField();
			startCell.step = 0;
			var front = [startCell];
			while (front.length > 0) {
				var current = front.shift();
				var topCell = this.getRealCell({x: current.x, y: current.y - 1});
				var rightCell = this.getRealCell({x: current.x + 1, y: current.y});
				var bottomCell = this.getRealCell({x: current.x, y: current.y + 1});
				var leftCell = this.getRealCell({x: current.x - 1, y: current.y});

				if ((current.top & MASK.type) == 0 && topCell && (topCell.center & MASK.type) == 0 && (topCell.step == null || current.step + 1 < topCell.step)) {
					topCell.step = current.step + 1;
					if (current.probability > 0) topCell.probability = current.probability * this.getHorizontalProbability();
					else if ((topCell.center & MASK.known) == 0) topCell.probability = this.getHorizontalProbability();
					if (topCell.probability == null || topCell.probability >= reliability) front.push(topCell);
				}
				if ((current.right & MASK.type) == 0 && rightCell && (rightCell.center & MASK.type) == 0 && (rightCell.step == null || current.step + 1 < rightCell.step)) {
					rightCell.step = current.step + 1;
					if (current.probability > 0) rightCell.probability = current.probability * this.getVerticalProbability();
					else if ((rightCell.center & MASK.known) == 0) rightCell.probability = this.getVerticalProbability();
					if (rightCell.probability == null || rightCell.probability >= reliability) front.push(rightCell);
				}
				if ((current.bottom & MASK.type) == 0 && bottomCell && (bottomCell.center & MASK.type) == 0 && (bottomCell.step == null || current.step + 1 < bottomCell.step)) {
					bottomCell.step = current.step + 1;
					if (current.probability > 0) bottomCell.probability = current.probability * this.getHorizontalProbability();
					else if ((bottomCell.center & MASK.known) == 0) bottomCell.probability = this.getHorizontalProbability();
					if (bottomCell.probability == null || bottomCell.probability >= reliability) front.push(bottomCell);
				}
				if ((current.left & MASK.type) == 0 && leftCell && (leftCell.center & MASK.type) == 0 && (leftCell.step == null || current.step + 1 < leftCell.step)) {
					leftCell.step = current.step + 1;
					if (current.probability > 0) leftCell.probability = current.probability * this.getVerticalProbability();
					else if ((leftCell.center & MASK.known) == 0) leftCell.probability = this.getVerticalProbability();
					if (leftCell.probability == null || leftCell.probability >= reliability) front.push(leftCell);
				}

				if (((current.top & MASK.type) == 0 && topCell == endCell)
					|| ((current.right & MASK.type) == 0 && rightCell == endCell)
					|| ((current.bottom & MASK.type) == 0 && bottomCell == endCell)
					|| ((current.left & MASK.type) == 0 && leftCell == endCell)) {
					endCell.step = current.step + 1;
					break;
				}
			}

			if(front.length == 0) return false;
			return this.restorePath(endCell);
		}

		this.findNearestUnexplored = function (startCell, reliability, randomLevel, maxLoss) { //Алгоритм Дейкстры +
			if (typeof reliability == "undefined") reliability = 0.4;
			if (typeof randomLevel == "undefined") randomLevel = 3;
			if (typeof maxLoss == "undefined") maxLoss = 1.07; // 7%
			this.resetField();
			var zone = null;
			if (this.keyPos != null || this.exitPos == null) {
				this.findZones();
				zone = 0;
			}
			startCell.step = 0;
			var lastStep = Number.MAX_VALUE;
			var front = [startCell];
			var variants = [];
			while (front.length > 0) {
				var current = front.shift();
				var topCell = this.getRealCell({x: current.x, y: current.y - 1});
				var rightCell = this.getRealCell({x: current.x + 1, y: current.y});
				var bottomCell = this.getRealCell({x: current.x, y: current.y + 1});
				var leftCell = this.getRealCell({x: current.x - 1, y: current.y});

				if ((current.top & MASK.type) == 0 && topCell && (topCell.step == null || current.step + 1 < topCell.step)) {
					topCell.step = current.step + 1;
					if (current.probability > 0) topCell.probability = current.probability * this.getHorizontalProbability();
					else if ((topCell.center & MASK.known) == 0) topCell.probability = this.getHorizontalProbability();
					if ((current.top & MASK.known) == 0 && (topCell.center & MASK.known) == 0 && topCell.zone == zone) {
						variants.push(current);
						lastStep = current.step + 1;
					} else if (topCell.probability == null || topCell.probability >= reliability) front.push(topCell);
				}
				if ((current.right & MASK.type) == 0 && rightCell && (rightCell.step == null || current.step + 1 < rightCell.step)) {
					rightCell.step = current.step + 1;
					if (current.probability > 0) rightCell.probability = current.probability * this.getVerticalProbability();
					else if ((rightCell.center & MASK.known) == 0) rightCell.probability = this.getVerticalProbability();
					if ((current.right & MASK.known) == 0 && (rightCell.center & MASK.known) == 0 && rightCell.zone == zone) {
						variants.push(current);
						lastStep = current.step + 1;
					} else if (rightCell.probability == null || rightCell.probability >= reliability) front.push(rightCell);
				}
				if ((current.bottom & MASK.type) == 0 && bottomCell && (bottomCell.step == null || current.step + 1 < bottomCell.step)) {
					bottomCell.step = current.step + 1;
					if (current.probability > 0) bottomCell.probability = current.probability * this.getHorizontalProbability();
					else if ((bottomCell.center & MASK.known) == 0) bottomCell.probability = this.getHorizontalProbability();
					if ((current.bottom & MASK.known) == 0 && (bottomCell.center & MASK.known) == 0 && bottomCell.zone == zone) {
						variants.push(current);
						lastStep = current.step + 1;
					} else if (bottomCell.probability == null || bottomCell.probability >= reliability) front.push(bottomCell);
				}
				if ((current.left & MASK.type) == 0 && leftCell && (leftCell.step == null || current.step + 1 < leftCell.step)) {
					leftCell.step = current.step + 1;
					if (current.probability > 0) leftCell.probability = current.probability * this.getVerticalProbability();
					else if ((leftCell.center & MASK.known) == 0) leftCell.probability = this.getVerticalProbability();
					if ((current.left & MASK.known) == 0 && (leftCell.center & MASK.known) == 0 && leftCell.zone == zone) {
						variants.push(current);
						lastStep = current.step + 1;
					} else if (leftCell.probability == null || leftCell.probability >= reliability) front.push(leftCell);
				}
				if (variants.length >= randomLevel || lastStep * maxLoss < current.step) {
					break;
				}
			}

			if(variants.length == 0) return false;
			return this.restorePath(variants[Math.floor(Math.random() * variants.length)]);
		}

		//Start Map code
		for (var i = 0; i < width; i++) {
			data[i] = [];
			for (var j = 0; j < height; j++) {
				data[i][j] = new Cell(TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, TYPE_INDEX.unknown, i,j);
			}
		}
		this.update({x: 0, y: 0}, {center: TYPE_INDEX.passable});
	}

	// ======================== Position ========================
	var Position = function (x, y) { //Осторожно ресайз карты делает позиции некоректными.
		this.x = x;
		this.y = y;

		this.nextPos = function (dir) {
			return new Position(this.x + dir.dx, this.y + dir.dy);
		}

		this.toMove = function (dir) {
			this.x += dir.dx;
			this.y += dir.dy;
		}

		this.top = function () {
			return new Position(this.x + DIRECTION.top.dx, this.y + DIRECTION.top.dy);
		}
		this.right = function () {
			return new Position(this.x + DIRECTION.right.dx, this.y + DIRECTION.right.dy);
		}
		this.bottom = function () {
			return new Position(this.x + DIRECTION.bottom.dx, this.y + DIRECTION.bottom.dy);
		}
		this.left = function () {
			return new Position(this.x + DIRECTION.left.dx, this.y + DIRECTION.left.dy);
		}
	}

	// ========================================= Robot =========================================
	var Robot = function () {
		var map = new Map(2, 2);
		var pos = new Position(0, 0);
		var dir = new Direction(DIRECTION.top);
		var queueCMD = [];
		var api = null;
		var hasExit = false;
		var hasKey = false;

		this.getQueueCommands = function() {
			return queueCMD;
		}

		this.getMap = function () {
			return map;
		}

		this.getPosition = function () {
			return pos;
		}

		this.getCurrentCell = function() {
			return map.getCell(pos);
		}

		this.getCell = function(dir) {
			return map.getCell(pos.nextPos(dir));
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

		this.getApi = function() {
			return api;
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

		this.toTopSide = function (andMove, stateDir) {
			var isPush = false;
			switch (typeof stateDir == 'undefined' ? dir.forward : stateDir) {
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

		this.toRightSide = function (andMove, stateDir) {
			var isPush = false;
			switch (typeof stateDir == 'undefined' ? dir.forward : stateDir) {
				case 'top':
					queueCMD.push(api.CMD_RIGHT);
					isPush = true;
					break;
				case 'right':
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

		this.toBottomSide = function (andMove, stateDir) {
			var isPush = false;
			switch (typeof stateDir == 'undefined' ? dir.forward : stateDir) {
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

		this.toLeftSide = function (andMove, stateDir) {
			var isPush = false;
			switch (typeof stateDir == 'undefined' ? dir.forward : stateDir) {
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

		this.toPath = function (path) {
			if (path == false) return;

			var current = this.getCurrentCell();
			if (current == path[0]) path.shift();
			var prevDir = undefined;
			for (var i = 0; i < path.length; i++) {
				var dx = path[i].x - current.x;
				var dy = path[i].y - current.y;
				for (var currDir in DIRECTION) {
					if (DIRECTION[currDir].dx == dx && DIRECTION[currDir].dy == dy)
						break;
				}

				switch (currDir) {
					case 'top': this.toTopSide(true, prevDir);
						break;
					case 'right': this.toRightSide(true, prevDir);
						break;
					case 'bottom': this.toBottomSide(true, prevDir);
						break;
					case 'left': this.toLeftSide(true, prevDir);
						break;
				}
				prevDir = currDir;
				current = path[i];
			}
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
					if (!hasExit && map.exitPos != null) hasExit = true;

					info = {};
					tmpPos = pos.nextPos(dir.getDirection(dir.forward));
					if (result.before != 'key') {
						info[dir.backward] = TYPE_INDEX[result.before];
						if (result.before != 'wall') info['center'] = TYPE_INDEX[result.before];
					} else {
						info['center'] = TYPE_INDEX[result.before];
					}
					map.update(tmpPos, info);

					info = {};
					tmpPos = pos.nextPos(dir.getDirection(dir.right));
					if (result.right != 'key') {
						info[dir.left] = TYPE_INDEX[result.right];
						if (result.right != 'wall') info['center'] = TYPE_INDEX[result.right];
					} else {
						info['center'] = TYPE_INDEX[result.right];
					}
					map.update(tmpPos, info);

					info = {};
					tmpPos = pos.nextPos(dir.getDirection(dir.left));
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
						if (this.getCurrentCell()[dir.forward] == TYPE_INDEX.exit) map.exitLocked();
						info = {};
						info[dir.forward] = TYPE_INDEX.barrier;
						map.update(pos, info);
						info = {};
						info[dir.backward] = TYPE_INDEX.barrier;
						map.update(pos.nextPos(dir), info);
					}
					break;
			}
			if (!hasKey && map.keyPos != null && map.getCell(map.keyPos).counter > 0) hasKey = true;
			queueCMD.shift();
		}

		this.generateMicroDecision = function(fromCell, toCell, subdir) {
			if (fromCell[subdir] == TYPE_INDEX.unknown && toCell.center == TYPE_INDEX.unknown
				|| ((hasKey || map.keyPossibilityCells > 0) && fromCell[subdir] == TYPE_INDEX.exit)
				|| (!hasKey && fromCell[subdir] == TYPE_INDEX.key))
			{
				return true
			}
			return false;
		}

		this.generateDecision = function () {
			if (queueCMD.length > 0) return;

			var cell = this.getCurrentCell();
			var path = false;
			var c = +(cell[dir.forward] == TYPE_INDEX.unknown) + (cell[dir.right] == TYPE_INDEX.unknown) + (cell[dir.left] == TYPE_INDEX.unknown);
			if (hasExit && map.keyPossibilityCells > map.getAverageSize()) {
				path = map.findShortestPath(cell, map.getCell(map.exitPos));
			}
			if (hasExit && (hasKey || map.keyPossibilityCells > path.length*1.67) && map.getCell(map.exitPos) != cell) {
				if (path == false) path = map.findShortestPath(cell, map.getCell(map.exitPos));
				this.toPath(path);
			} else if (c > 1 || (c >= 1 && map.isEdge(pos))) {
				this.toScan();
			} else if (this.generateMicroDecision(cell, map.getCell(pos.nextPos(DIRECTION[dir.forward])), dir.forward)) {
				this.toMove();
			} else if (this.generateMicroDecision(cell, map.getCell(pos.nextPos(DIRECTION[dir.right])), dir.right)) {
				this.toRight();
				this.toMove();
			} else if (this.generateMicroDecision(cell, map.getCell(pos.nextPos(DIRECTION[dir.left])), dir.left)) {
				this.toLeft();
				this.toMove();
			} else if (this.generateMicroDecision(cell, map.getCell(pos.nextPos(DIRECTION[dir.backward])), dir.backward)) {
				this.toRight();
				this.toRight();
				this.toMove();
			} else if ((cell[dir.forward] & MASK.type) == 0 && this.getCell(DIRECTION[dir.forward]).counter == 0) {
				this.toMove();
			} else if (!hasExit || !hasKey) {
				path = map.findNearestUnexplored(cell);
				if (path == false) path = map.findShortestPath(cell, map.getCell(map.exitPos));
				this.toPath(path);
			} else {
				debugger; //что-то неверно
			}
		}
	}

	/** =========================================
	 * Component that is responsible for drawing
	 *  =========================================
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

		this.resizeMap = function () {
			mapW = map.getWidth();
			mapH = map.getHeight();
			mapDiv.innerHTML = '';
			this.createMap();
		}

		this.drawMap = function (robot) {
			if (mapW != map.getWidth() || mapH != map.getHeight()) {
				this.resizeMap();
			}

			var innerPos = map.getInnerPos(robot.getPosition());
			for (var i = 0; i < mapH; i++) {
				for (var j = 0; j < mapW; j++) {
					var cell = map.getRealCell({x: j, y: i});
					var div = document.getElementById("cell_" + i + "_" + j);
					div.className = "cell"
						+ " top-" + TYPE_VALUE[cell.top]
						+ " right-" + TYPE_VALUE[cell.right]
						+ " bottom-" + TYPE_VALUE[cell.bottom]
						+ " left-" + TYPE_VALUE[cell.left];
					if (cell.center == TYPE_INDEX.passable) div.className += " passable";
					else if (cell.center == TYPE_INDEX.space) div.className += " space";
					else if (cell.center == TYPE_INDEX.key) div.className += " key";
					if (cell.zone != null)  div.className += " zone" + cell.zone;
					if (j == innerPos.x && i == innerPos.y) div.className += " pos";
					if (cell.counter > 0) div.innerHTML = cell.counter;
				}
			}
		}

		this.updateMap = function(robot) {
			if (mapW != map.getWidth() || mapH != map.getHeight()) {
				this.drawMap(robot);
			}

			var innerPos = map.getInnerPos(robot.getPosition());
			for (var i = 0; i < map.updateForDraw.length; i++) {
				var cell = map.updateForDraw[i];
				var div = document.getElementById("cell_" + cell.y + "_" + cell.x);
				div.className = "cell"
					+ " top-" + TYPE_VALUE[cell.top]
					+ " right-" + TYPE_VALUE[cell.right]
					+ " bottom-" + TYPE_VALUE[cell.bottom]
					+ " left-" + TYPE_VALUE[cell.left];
				if (cell.center == TYPE_INDEX.passable) div.className += " passable";
				else if (cell.center == TYPE_INDEX.space) div.className += " space";
				else if (cell.center == TYPE_INDEX.key) div.className += " key";
				if (cell == map.getRealCell(innerPos)) div.className += " pos";
				if (cell.counter > 0) div.innerHTML = cell.counter;
			}

			var queue = robot.getQueueCommands();
			var way =[];
			if (queue.length > 1) {
				var currPos = robot.getPosition();
				var currDir = robot.getDirection();
				currDir = new Direction(DIRECTION[currDir.forward]);
				var api = robot.getApi();
				for (var i = 0; i < queue.length; i++) {
					if (queue[i] == api.CMD_LEFT) currDir.toLeft();
					else if (queue[i] == api.CMD_RIGHT) currDir.toRight();
					else if (queue[i] == api.CMD_MOVE) {
						currPos = currPos.nextPos(currDir);
						cell = map.getCell(currPos);
						div = document.getElementById("cell_" + cell.y + "_" + cell.x);
						div.className += ' way';
					}
				}
			}
			map.updateForDraw = [];
		}

		var styles = document.createElement("STYLE");
		styles.id = "styles-for-map";
		styles.type = 'text/css';
		var css = "#map{\noverflow: hidden;\nfont-size:10px;\nline-height:20px;\ntext-align:center;\n}\n\.cell{\nfloat: left;\nwidth: 20px;\nheight: 20px;\nbackground-color: #aaa;\nborder: 2px solid #aaa;\n}\n\n.top-wall{border-top-color: #000;}\n.right-wall{border-right-color: #000;}\n.left-wall{border-left-color: #000;}\n.bottom-wall{border-bottom-color: #000;}\n\n\.top-barrier{border-top: 2px dotted #000;}\n.right-barrier{border-right: 2px dotted #000;}\n.left-barrier{border-left: 2px dotted #000;}\n.bottom-barrier{border-bottom: 2px dotted #000;}\n\n\.top-space{border-top-color: #fff;}\n.right-space{border-right-color: #fff;}\n.left-space{border-left-color: #fff;}\n.bottom-space{border-bottom-color: #fff;}\n\n\.top-exit{border-top-color: #f00;}\n.right-exit{border-right-color: #f00;}\n.left-exit{border-left-color: #f00;}\n.bottom-exit{border-bottom-color: #f00;}\n\n\.top-key{border-top-color: #0f0;}\n.right-key{border-right-color: #0f0;}\n.left-key{border-left-color: #0f0;}\n.bottom-key{border-bottom-color: #0f0;}\n\n\.space{background-color: #fff;}\n.passable{background-color: #eee;}\n.exit{background-color: #f00;}\n.key{background-color: #0f0;}\n.pos{background-color: #f00;}\n.way{background-color: #ff0 !important;}\n\n";
		for(var i=0; i<100; i++){
			css += (".zone"+i+" { background-color: #"+Math.floor(Math.random()*16777215).toString(16)+"; }\n");
		}
		if (styles.styleSheet){
			styles.styleSheet.cssText = css;
		} else {
			styles.appendChild(document.createTextNode(css));
		}
		document.head.appendChild(styles);
		this.createMap();
	};

	var robot = new Robot();
	var movesLog = ['Start'];
	var turn = 0;
	var mapVisual = null;
	var HOW = function (api) {
			if (turn == 0) {
				robot.setApi(api);
			}
			turn++;
			robot.setResult(api.result);
			robot.generateDecision();

			return movesLog[turn] = robot.getCommand();
	}

	var HOWandDraw = function (api) {
		if (turn == 0) {
			robot.setApi(api);
			mapVisual = new mapVisualizer(robot.getMap());
			var freq = parseInt(document.getElementById("map").dataset.freq);
			if (freq == undefined) freq=100;
		}
		turn++;
		robot.setResult(api.result);
		if(turn%freq == 0) mapVisual.drawMap(robot);
		else mapVisual.updateMap(robot);
		robot.generateDecision();

		return movesLog[turn] = robot.getCommand();
	}

	return {
		name: 'Hierarch of ways',
		roboFunc: (function() {
			var mapDiv = document.getElementById("map");
			if(mapDiv == null) return HOW;
			else return HOWandDraw;
		}())
	};
}());