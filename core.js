var algorithmHolder = function() {
    var items = {};
    return {
        putInstance: function(name, instance) {
            items[name] = instance;
        },
        getInstance: function(name) {
            return items[name];
        }
    };
}();

// competition part
window.onload = function() {
    (function() {
        var ROBOMAZE = {
            // Constants
            WALL: 'wall',
            SPACE: 'space',
            EXIT: 'exit',
            KEY: 'key', // TODO implement

            CMD_MOVE: 'move',
            CMD_RIGHT: 'right',
            CMD_LEFT: 'left',
            CMD_SCAN: 'scan',

            RIGHT_CMD_TRANSLATION: {
                top: "right", right: "bottom", bottom: "left", left: "top"
            },
            LEFT_CMD_TRANSLATION: {
                top: "left", left: "bottom", bottom: "right", right: "top"
            },
            SCAN_CMD_TRANSLATION: {
                top: {before: "top", right: "right", left: "left"},
                right: {before: "right", right: "bottom", left: "top"},
                bottom: {before: "bottom", right: "left", left: "right"},
                left:  {before: "left", right: "top", left: "bottom"}
            },

            STEP_TIMEOUT: 50,

            NEIGHBOURS: {
                top:    {chX: 0,  chY: -1, xOffset: 0,  yOffset: -1, xWall: 0, yWall: 0, wW: 1, wH: 0, tr: ""},
                bottom: {chX: 0,  chY: 1,  xOffset: 0,  yOffset: 1,  xWall: 0, yWall: 1, wW: 1, wH: 0, tr: "r180,20,20"},
                left:   {chX: -2, chY: 0,  xOffset: -1, yOffset: 0,  xWall: 0, yWall: 0, wW: 0, wH: 1, tr: "r-90,20,20"},
                right:  {chX: 2,  chY: 0,  xOffset: 1,  yOffset: 0,  xWall: 1, yWall: 0, wW: 0, wH: 1, tr: "r90,20,20"}
            },
            CELL_SIZE: 40
        };

        /**
         * Map of the maze
         */
        ROBOMAZE.mazeMap = {
            map: null,
            paper: null,
            init: function(map) {
                this.map = map;
                // TODO check map for valid structure

                ROBOMAZE.visualizer.preparePaper(this);
            },
            /**
             * Find all part of map like walls, exits, key etc.
             */
            analyzeMap: function() {
                // TODO find cells

                // TODO find all walls

                // TODO find exits

                // TODO find a key

            },
            getCell: function(x, y) {
                var cellInfo = {success: false};
                // check for borders
                if ( x < 0 || y < 0 || x >= this.mapWidth() || y >= this.mapHeight() ) {
                    return cellInfo;
                }
                var chX = 4 * x + 2;
                var chY = 2 * y + 1;
                var cellChar = this.map[chY].charAt(chX);
                if ( cellChar !== '*' ) {
                    cellInfo.success = true;
                    var w = this.getWalls(chX, chY);
                    cellInfo.walls = w.walls;
                    cellInfo.exit = w.exit;
                    cellInfo.keyWalls = w.keyWalls;
                    if ( cellChar == 'K' ) {
                        cellInfo.key = true;
                        cellInfo.keyWalls = {};
                    }
                }
                return cellInfo;
            },
            getWalls: function(chX, chY) {
                var t, neighbourObj, wallChar, exit,
                    walls = {}, keyWalls = {};
                for (t in ROBOMAZE.NEIGHBOURS) {
                    neighbourObj = ROBOMAZE.NEIGHBOURS[t];
                    wallChar = this.map[chY + neighbourObj.chY].charAt(chX + neighbourObj.chX);
                    if ( wallChar === 'E' ) {
                        exit = t;
                    } else if ( wallChar === 'k' ) {
                        keyWalls[t] = true;
                    } else if ( wallChar !== ' ') {
                        walls[t] = true;
                    }
                }
                return {walls : walls, exit: exit, keyWalls: keyWalls};
            },
            mapWidth: function() {
                return Math.floor(this.map[0].length / 4);
            },
            mapHeight: function() {
                return Math.floor(this.map.length / 2);
            }
        };

        /**
         * Component of ROBOMAZE that is responsible for drawing
         */
        ROBOMAZE.visualizer = {
            preparePaper: function(map) {
                this.map = map;
                this.paper = Raphael(
                    document.getElementById("maze"),
                    (this.map.mapWidth() + 2) * ROBOMAZE.CELL_SIZE,
                    (this.map.mapHeight() + 2)* ROBOMAZE.CELL_SIZE
                );
            },
            drawWalls: function() {
                var x, y, wallType, neighbourObj, cellInfo, exits, exitCoords,
                    wallMap = {},
                    xSize = this.map.mapWidth(),
                    ySize = this.map.mapHeight();

                exits = {};
                for (x = 0; x < xSize; x++) {
                    for (y = 0; y < ySize; y++) {
                        cellInfo = this.map.getCell(x, y);
                        if ( cellInfo.success ) {
                            if ( cellInfo.exit ) {
                                neighbourObj = ROBOMAZE.NEIGHBOURS[cellInfo.exit]
                                exits[(x + neighbourObj.xOffset) + ':' + (y + neighbourObj.yOffset)] = true;
                            }
                            if ( cellInfo.key ) {
                                this.drawKey(x, y);
                            }
                            for (wallType in cellInfo.walls) {
                                neighbourObj = ROBOMAZE.NEIGHBOURS[wallType];
                                var r = this.paper.rect(
                                    (x + 1 + neighbourObj.xWall) * ROBOMAZE.CELL_SIZE - 1,
                                    (y + 1 + neighbourObj.yWall) * ROBOMAZE.CELL_SIZE - 1,
                                    neighbourObj.wW * ROBOMAZE.CELL_SIZE + 3,
                                    neighbourObj.wH * ROBOMAZE.CELL_SIZE + 3
                                );
                                r.attr("fill", "#000");
                                r.attr("stroke", "transparent");
                            }
                        }
                    }
                }
                // draw exit(s)
                for (exitCoords in exits) {
                    var coords = exitCoords.split(':');
                    x = (Number(coords[0]) + 1) * ROBOMAZE.CELL_SIZE;
                    y = (Number(coords[1]) + 1) * ROBOMAZE.CELL_SIZE;
                    var text = this.paper.text(ROBOMAZE.CELL_SIZE / 2, ROBOMAZE.CELL_SIZE / 2, "EXIT");
                    text.attr("fill", "red");
                    text.transform("t" + x + "," + y);
                }
            },
            getCellCoordinates: function(x, y) {
                return {
                    startX: (x + 1) * ROBOMAZE.CELL_SIZE,
                    startY: (y + 1) * ROBOMAZE.CELL_SIZE
                };
            },
            translateRobotImageToCell: function(image, robot) {
                var cellCoords = this.getCellCoordinates(robot.x, robot.y);
                image.transform("t" + cellCoords.startX + "," + cellCoords.startY);
                image.transform("..." + ROBOMAZE.NEIGHBOURS[robot.position].tr);
            },
            _animateEye: function(robot, eyeX, eyeY) {
                var pupil;
                var eyeImage = this.paper.set();
                var eye = this.paper.circle(eyeX, eyeY, 2);
                eye.attr("fill", "#fff");
                eyeImage.push(eye);
                pupil = this.paper.circle(eyeX, eyeY, 1);
                pupil.attr("fill", "#000");
                eyeImage.push(pupil);

                this.translateRobotImageToCell(eyeImage, robot);
                eye.animate({r: 7}, ROBOMAZE.STEP_TIMEOUT, function() {
                    eyeImage.remove();
                });
            },
            _drawBaseRobot: function(robot) {
                var imageContainer, robotBody;
                if ( robot.image ) {
                    robot.image.remove();
                }

                imageContainer = this.paper.set();
                robotBody = this.paper.path("M10,30L10,15L20,10L30,15,L30,30Z");
                robotBody.attr("fill", robot.color);
                imageContainer.push(robotBody);

                this.translateRobotImageToCell(imageContainer, robot);
                return imageContainer;
            },
            drawRobot: function(robot) {
                var eye, pupil, s, eyeSet, startX, startY;
                if ( robot.command == ROBOMAZE.CMD_RIGHT ) {
                    robot.image.animate({transform: ['...r90']}, ROBOMAZE.STEP_TIMEOUT * 0.9);
                } else if ( robot.command == ROBOMAZE.CMD_LEFT ) {
                    robot.image.animate({transform: ['...r-90']}, ROBOMAZE.STEP_TIMEOUT * 0.9);
                } else if ( robot.command == ROBOMAZE.CMD_MOVE ) {
                    robot.image.animate({transform: ['...t0,-40']}, ROBOMAZE.STEP_TIMEOUT, function() {
                        if ( !robot.stillMoving ) {
                            robot.image.remove();
                        }
                    });
                } else if ( robot.command == ROBOMAZE.CMD_SCAN ) {
                    robot.image = this._drawBaseRobot(robot);
                    this._animateEye(robot, 12, 10);
                    this._animateEye(robot, 28, 10);
                } else {
                    robot.image = this._drawBaseRobot(robot);
                }
                return robot.image;
            },
            drawKey: function(x, y) {
                var keySet = this.paper.set();
                keySet.push(
                    this.paper.circle(20, 10, 5),
                    this.paper.path("M20,15L20,35,L10,35L10,30L15,30L15,25L20,25Z")
                );
                keySet.attr("stroke", "green");
                var cellCoords = this.getCellCoordinates(x, y);
                keySet.transform("t" + cellCoords.startX + "," + cellCoords.startY);
            }
        };

        var baseMazeMap = [
            // 0   1   2   3   4   5   6   7   8   9   10
            '    +---+---+---+-E-+---+---+---+---+---+---+',
            '  * |               |   |                   |', // 0
            '+---+   +   +---+   +   +   +---+---+---+   +',
            '|       |       |       |   |       |       |', // 1
            '+   +---+---+   +---+---+   +   +   +   +---+',
            '|           |           |   |   |   |   |   |', // 2
            '+   +---+---+---+---+   +---+   +   +   +   +',
            '|   |           |       |       |       |   |', // 3
            '+   +   +---+   +   +   +   +---+---+---+   +',
            '|   |   |           |   |       |           |', // 4
            '+ k +   +---+---+---+---+---+   +---+   +   +',
            '| K |   |                   |           |   |', // 5
            '+---+   +   +---+---+---+   +---+---+---+   +',
            '|       |   |           |                   |', // 6
            '+   +---+   +---+---+   +---+---+---+---+---+',
            '|                                       | *  ', // 7
            '+---+---+---+---+---+---+---+---+---+---+    '
        ];

        // init maze
        var mazeMap = ROBOMAZE.mazeMap;
        mazeMap.init(baseMazeMap);
        var mazeView = ROBOMAZE.visualizer;
        mazeView.drawWalls();

        // setup robots
        var instanceNames = {
            1: {color: "#e00000"},
            2: {color: "#00e000"},
            3: {color: "#0000e0"}
        };
        var robots = [];
        var currStep = -1;
        for (var i in instanceNames) {
            var instance = algorithmHolder.getInstance(i);
            if ( instance ) {
                var robot = {
                    x: 6, y: 2, position: "top",
                    color: instanceNames[i].color,
                    aiObj: instance,
                    result: {success: true},
                    stillMoving: true, steps: currStep
                };
                robots.push(robot);
                currStep -= 50;
            }
        }
        nextMove();

        function nextMove() {
            var hasRobotToMove = false;
            // show/update competition table
            var competitors = [];
            competitors.push.apply(competitors, robots);
            competitors.sort(function(a, b) {
                if ( a.steps > 0 && b.steps > 0 ) {
                    return a.steps - b.steps;
                } else {
                    if ( a.steps > 0 ) {
                        return -1;
                    } else if ( b.steps > 0 ) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });
            $('#competitors').empty();
            competitors.forEach(function(item) {
                var $line = $("<p></p>");
                var $name = $("<span></span>").text(item.aiObj.name + (item.keyFound ? ' (key)' : ''));
                if ( item.steps < 0 ) {
                    $name.css('color', 'gray');
                } else {
                    $line.append(item.steps + " ");
                }
                var $colorBox = $("<span></span>")
                    .addClass('box')
                    .css('background-color', item.color);
                $line.append($colorBox);
                $name.appendTo($line);
                if ( !item.stillMoving ) {
                    $line.css('color', 'green');
                }
                $('#competitors').append($line);
            });

            for (var ri in robots) {
                var robot = robots[ri];
                if ( robot.stillMoving ) {
                    moveRobot(robot);
                    if ( robot.stillMoving ) {
                        hasRobotToMove = true;
                    }
                }
            }
            if ( hasRobotToMove ) {
                setTimeout(nextMove, ROBOMAZE.STEP_TIMEOUT);
            } else {
                // TODO detect winners

            }
        }

        function moveRobot(robot) {
            var cmd, moveCell, neighbourObj, direction, wallName;
            var api = {
                CMD_MOVE: ROBOMAZE.CMD_MOVE,
                CMD_RIGHT: ROBOMAZE.CMD_RIGHT,
                CMD_LEFT: ROBOMAZE.CMD_LEFT,
                CMD_SCAN: ROBOMAZE.CMD_SCAN,
                PLACE_WALL: ROBOMAZE.WALL,
                PLACE_SPACE: ROBOMAZE.SPACE,
                PLACE_EXIT: ROBOMAZE.EXIT,
                PLACE_KEY: ROBOMAZE.KEY,
                LEFT: ROBOMAZE.CMD_LEFT,
                RIGHT: ROBOMAZE.CMD_RIGHT,
                BEFORE: 'before',
                result: robot.result
            };

            // check for delay movement and first run
            robot.steps++;
            if ( robot.steps <= 0 ) {
                if ( robot.steps == 0 ) {
                    mazeView.drawRobot(robot);
                }
                return;
            }

            // get variant of move in safe way
            try {
                cmd = robot.aiObj.roboFunc(api);
            } catch(ex) {
                cmd = null;
            }

            // update robot position
            if ( cmd === ROBOMAZE.CMD_RIGHT ) {
                robot.position = ROBOMAZE.RIGHT_CMD_TRANSLATION[robot.position];
                robot.result = {success: true};
            } else if ( cmd === ROBOMAZE.CMD_LEFT ) {
                robot.position = ROBOMAZE.LEFT_CMD_TRANSLATION[robot.position];
                robot.result = {success: true};
            } else if ( cmd === ROBOMAZE.CMD_MOVE ) {
                // check next cell
                moveCell = mazeMap.getCell(robot.x, robot.y);
                if ( moveCell.walls[robot.position] ) {
                    robot.result = {success: false};
                    cmd = null;
                } else {
                    robot.result = {success: true};
                    if ( moveCell.key ) {
                        robot.keyFound = true;
                    }
                    if ( moveCell.exit === robot.position ) {
                        if ( robot.keyFound ) {
                            robot.stillMoving = false;
                        } else {
                            robot.result = {success: false};
                            cmd = null;
                        }
                    }
                    if ( robot.result.success ) {
                        robot.image = mazeView._drawBaseRobot(robot); // animation hack
                        neighbourObj = ROBOMAZE.NEIGHBOURS[robot.position];
                        robot.x = robot.x + neighbourObj.xOffset;
                        robot.y = robot.y + neighbourObj.yOffset;
                    }
                }
            } else if ( cmd === ROBOMAZE.CMD_SCAN ) {
                robot.result = {success: true};
                moveCell = mazeMap.getCell(robot.x, robot.y);
                for (direction in ROBOMAZE.SCAN_CMD_TRANSLATION[robot.position]) {
                    wallName = ROBOMAZE.SCAN_CMD_TRANSLATION[robot.position][direction];
                    if ( moveCell.exit == wallName ) {
                        robot.result[direction] = ROBOMAZE.EXIT;
                    } else if ( moveCell.keyWalls[wallName] ) {
                        robot.result[direction] = ROBOMAZE.KEY;
                    } else {
                        robot.result[direction] = ( moveCell.walls[wallName] ) ? ROBOMAZE.WALL : ROBOMAZE.SPACE;
                    }
                }
            } else {
                robot.result = {success: true, msg: "Unknown command"};
            }

            // show robot in the new state (place)
            robot.command = cmd;
            mazeView.drawRobot(robot);
        }
    })();
}
