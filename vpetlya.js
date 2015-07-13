/**
 * Created by vpetlya on 7/13/15.
 * vp_inbox@ukr.net
 */

/*algorithmHolder.putInstance(1, function () {

    return {
        name: 'Hierarch of ways',
        roboFunc: function(api) {
            if ( turnCount ) {
                turnCount--;
                return turnDirection;
            }

            if ( afterScan ) {
                afterScan = false;
                // choose turn
                var turns = [];
                if ( api.result.left === api.PLACE_EXIT || api.result.left === api.PLACE_KEY ) {
                    return api.CMD_LEFT;
                }
                if ( api.result.right === api.PLACE_EXIT || api.result.right === api.PLACE_KEY ) {
                    return api.CMD_RIGHT;
                }
                if ( api.result.left == api.PLACE_SPACE ) {
                    turns.push(api.CMD_LEFT);
                }
                if ( api.result.right == api.PLACE_SPACE ) {
                    turns.push(api.CMD_RIGHT);
                }
                if ( turns.length == 0 ) {
                    turnCount = 1;
                    turnDirection = api.CMD_RIGHT;
                } else if ( turns.length > 1 ) {
                    turnDirection = turns[Math.floor(Math.random() * 2)];
                } else {
                    turnDirection = turns[0];
                }
                return turnDirection;
            }

            if ( api.result.success ) {
                return api.CMD_MOVE;
            } else {
                // need open eyes
                afterScan = true;
                return api.CMD_SCAN;
            }
        }
    };
}());*/

// init your code here
algorithmHolder.putInstance(1, function () {
    // sample implementation of algorithm
    var turnDirection,
        afterScan = false,
        turnCount = 0;
    return {
        name: 'Half Blind',
        roboFunc: function(api) {
            if ( turnCount ) {
                turnCount--;
                return turnDirection;
            }

            if ( afterScan ) {
                afterScan = false;
                // choose turn
                var turns = [];
                if ( api.result.left === api.PLACE_EXIT || api.result.left === api.PLACE_KEY ) {
                    return api.CMD_LEFT;
                }
                if ( api.result.right === api.PLACE_EXIT || api.result.right === api.PLACE_KEY ) {
                    return api.CMD_RIGHT;
                }
                if ( api.result.left == api.PLACE_SPACE ) {
                    turns.push(api.CMD_LEFT);
                }
                if ( api.result.right == api.PLACE_SPACE ) {
                    turns.push(api.CMD_RIGHT);
                }
                if ( turns.length == 0 ) {
                    turnCount = 1;
                    turnDirection = api.CMD_RIGHT;
                } else if ( turns.length > 1 ) {
                    turnDirection = turns[Math.floor(Math.random() * 2)];
                } else {
                    turnDirection = turns[0];
                }
                return turnDirection;
            }

            if ( api.result.success ) {
                return api.CMD_MOVE;
            } else {
                // need open eyes
                afterScan = true;
                return api.CMD_SCAN;
            }
        }
    };
}());