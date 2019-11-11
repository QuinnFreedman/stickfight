window.onload = function(){init()};
var width = 800;
var height = 500;
var canvas;
var ctx;
var buffer;
var bufferCanvas;
var players = new Array();
var gravity = .5;
var poses = new Array();
var scale = 10;
var count = 0;
var powerupsEnabled = true;
var powerups = new Array();
var powerupImage = new Image();
    powerupImage.src = 'powerup.png';
var fireballLeft = [
    [new Image(), new Image(), new Image()],
    [new Image(), new Image(), new Image()]
];
fireballLeft[0][0].src = 'blue/fireball1-.png';
fireballLeft[0][1].src = 'blue/fireball2-.png';
fireballLeft[0][2].src = 'blue/fireball3-.png';

fireballLeft[1][0].src = 'red/fireball1-.png';
fireballLeft[1][1].src = 'red/fireball2-.png';
fireballLeft[1][2].src = 'red/fireball3-.png';

var fireballRight = [
    [new Image(), new Image(), new Image()],
    [new Image(), new Image(), new Image()]
];
fireballRight[0][0].src = 'blue/fireball1.png';
fireballRight[0][1].src = 'blue/fireball2.png';
fireballRight[0][2].src = 'blue/fireball3.png';

fireballRight[1][0].src = 'red/fireball1.png';
fireballRight[1][1].src = 'red/fireball2.png';
fireballRight[1][2].src = 'red/fireball3.png';
var fireballs = [fireballRight, fireballLeft];

var explosions = [
    [new Image(), new Image(), new Image(), new Image()],
    [new Image(), new Image(), new Image(), new Image()]
]
explosions[0][0].src = 'blue/explosion1.png';
explosions[0][1].src = 'blue/explosion2.png';
explosions[0][2].src = 'blue/explosion3.png';
explosions[0][3].src = 'blue/explosion4.png';

explosions[1][0].src = 'red/explosion1.png';
explosions[1][1].src = 'red/explosion2.png';
explosions[1][2].src = 'red/explosion3.png';
explosions[1][3].src = 'red/explosion4.png';
    
var hasPlayed = false;
var paused = false;

//rAF
var targetFramerate = 60;
var stop=true;
var frameCount=0;
var fps,fpsInterval,startTime,now,then,elapsed;


function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = width;
    bufferCanvas.height = height;
    buffer = bufferCanvas.getContext("2d");
    canvas.height = height;
    canvas.width = width;
    
    poses[0] = new Pose(0);//stand
    poses[0].passiveBoxes = [new Rectangle(4,0,3,9),new Rectangle(4,9,4,4),new Rectangle(3,3,5,4)];
    poses[0].next = function(a){return (a.velocity[0] === 0 || a.y+a.h*scale != height) ? -1 : 2};
    poses[0].timeout = 10;
    poses[0].temporary = true;
    
    poses[1] = new Pose(1);//kick
    poses[1].passiveBoxes = [new Rectangle(4,0,3,9),new Rectangle(4,9,2,4),new Rectangle(3,3,5,4)];
    poses[1].damageBox = new Rectangle(6,8,5,2);
    poses[1].moveSpeed = 0;
    poses[1].next=function(a){return 0};
    poses[1].timeout = 7;
    poses[1].temporary = true;
    poses[1].restAfter = 20;
    
    poses[2] = new Pose(2);//walk
    poses[2].passiveBoxes = [new Rectangle(4,0,3,9),new Rectangle(4,9,4,4),new Rectangle(3,3,5,4)];
    poses[2].next=function(a){return 0};
    poses[2].timeout = 10;
    poses[2].temporary = true;
    
    poses[3] = new Pose(3);//punch
    poses[3].passiveBoxes = [new Rectangle(4,0,3,9),new Rectangle(4,9,4,4),new Rectangle(3,3,5,4)];
    poses[3].damageBox = new Rectangle(7,4,4,1);
    poses[3].moveSpeed = 0;
    poses[3].next=function(a){return 0};
    poses[3].timeout = 7;
    poses[3].temporary = true;
    poses[3].restAfter = 11;
    
    poses[4] = new Pose(4);//active block
    poses[4].passiveBoxes = [new Rectangle(4,0,3,9),new Rectangle(4,9,4,4),new Rectangle(3,3,5,4)];
    poses[4].activeBlockBox = new Rectangle(6,3,3,4)//Rectangle(6,3,3,4);
    poses[4].moveSpeed = 0;
    poses[4].next = function(a){return a.blockPressed ? 5 : 0};
    poses[4].timeout = 12;
    poses[4].blockRestAfter = 24;
    poses[4].temporary = true;
    
    poses[5] = new Pose(5);//block
    poses[5].passiveBoxes = [new Rectangle(4,0,3,9),new Rectangle(4,9,4,4),new Rectangle(3,3,5,4)];
    poses[5].blockBox = new Rectangle(5,3,3,4);
    poses[5].moveSpeed = 1;
    poses[5].maxSpeed = 6;
    poses[5].next=function(a){return 0};			
    
    poses[6] = new Pose(6);//crouch 
    poses[6].passiveBoxes = [new Rectangle(4,0,3,7),new Rectangle(3,3,5,4)];
    //poses[6].next = function(a){return (a.velocity[0] === 0 || a.y+a.h*scale != height) ? -1 : 2};
    //poses[6].timeout = 10;
    poses[6].moveSpeed = 1;
    poses[6].maxSpeed = 7;
    poses[6].temporary = false;
    poses[6].crouch = true;
    
    poses[7] = new Pose(7);//kick
    poses[7].passiveBoxes = [new Rectangle(4,0,3,7),new Rectangle(3,3,5,4)];
    poses[7].damageBox = new Rectangle(6,5,5,2);
    poses[7].moveSpeed = 0;
    poses[7].next = function(a){return 6};
    poses[7].timeout = 7;
    poses[7].temporary = true;
    poses[7].restAfter = 20;
    poses[7].crouch = true;
    
    poses[8] = new Pose(8);//mid-air kick
    poses[8].passiveBoxes = [new Rectangle(2,3,3,4),new Rectangle(1,7,5,4)];
    poses[8].damageBox = new Rectangle(6,8,5,4);
    poses[8].moveSpeed = 0;
    poses[8].next = function(a){return 0};
    poses[8].temporary = false;
    poses[8].restAfter = 10;
    
    poses[9] = new Pose(9);//powerball
    poses[9].passiveBoxes = [new Rectangle(4,0,3,9),new Rectangle(4,9,4,4),new Rectangle(3,3,5,4)];
    poses[9].moveSpeed = 0;
    poses[9].next = function(a){return 0};
    poses[9].timeout = 10;
    poses[9].temporary = true;
    poses[9].restAfter = 5;
    
    poses[10] = new Pose(10);//powerball
    poses[10].passiveBoxes = [new Rectangle(3,0,5,8)];
    poses[10].damageBox = new Rectangle(3,-1,5,1);
    poses[10].moveSpeed = 0;
    poses[10].next = function(a){return 6};
    poses[10].timeout = 10;
    poses[10].temporary = true;
    poses[10].restAfter = 25;
    poses[10].crouch = true;
    
    players = [new Player(0),new Player(1)];
    
    new Image().src = "background.png";

    document.getElementById("loading").style.display = "none";
    document.getElementById("container").style.display = "inline-block";

    startAnimating(targetFramerate);
}

var Powerup = function(){
    this.h = 7;
    this.w = 7;
    this.y = 100;
    this.x = Math.floor(Math.random()*width-(this.w*scale));
    this.velocity = new Array();
    this.velocity[0] = Math.floor(Math.random()*3)+2;
    this.velocity[1] = (5-Math.abs(this.velocity[0]))*-1;
    this.hasBounced = 5;
    this.timeSinceHit = 0;

    this.simulate = function(){
        if(this.x + this.w*scale < 0 || this.x > width || this.y + this.h*scale < 0 || this.y > height){
            powerups.splice(powerups.indexOf(this), 1);
        }else{
            var collidesWith = this.collides();
            if(collidesWith != -1){
                powerups.splice(powerups.indexOf(this), 1);
                players[collidesWith].hasPowerup = true;
            }
            if(this.timeSinceHit > 0) this.timeSinceHit--;
        }
        
        if(this.hasBounced > 0){
            if(this.y <= 0 && this.velocity[1] < 0){
                this.velocity[1] *= -1;
                this.y = 0;
                this.hasBounced--;
                this.timeSinceHit--;
            }else if(this.y + this.h*scale >= height && this.velocity[1] > 0){
                this.y = height-this.h*scale;
                this.velocity[1] *= -1;
                this.hasBounced--;
                this.timeSinceHit--;
            }
            if(this.x <= 0 && this.velocity[0] < 0){
                this.velocity[0] *= -1;
                this.x = 0;
                this.hasBounced--;
                this.timeSinceHit--;
            }else if(this.x + this.w*scale >= width && this.velocity[0] > 0){
                this.x = width-this.w*scale;
                this.velocity[0] *= -1;
                this.hasBounced--;
                this.timeSinceHit--;
            }
        }
        this.y += this.velocity[1];
        this.x += this.velocity[0];
    }
    this.collides = function(){
        var randomIndex = Math.round(Math.random());
        var p1 = players[randomIndex];
        var p2 = players[randomIndex == 0 ? 1 : 0];
            
        for(k = 0; k < poses[p1.pose].passiveBoxes.length; k++){
            if(intersects2(poses[p1.pose].passiveBoxes[k],p1,this)){
                return p1.a;
            }
        }
        if(poses[p1.pose].damageBox && intersects2(poses[p1.pose].damageBox,p1,this)){
            return p1.a;
        }

        for(k = 0; k < poses[p2.pose].passiveBoxes.length; k++){
            if(intersects2(poses[p2.pose].passiveBoxes[k],p2,this)){
                return p2.a;
            }
        }
        if(poses[p2.pose].damageBox && intersects2(poses[p2.pose].damageBox,p2,this)){
            return p2.a;
        }
        return -1;
    }
    this.draw = function(context){
        context.drawImage(powerupImage,this.x,this.y);
    }
}

var Fireball = function(a) {
    this.a = a;
    this.facing = players[a].facing; // 1 = left, 0 = right
    this.h = 7;
    this.w = 15;
    this.damageBox = new Rectangle(8, 0, 7, 7);
    this.y = players[a].y + 30;
    this.x = players[a].x + ((players[a].facing === 0) ? players[a].w : 0);
    this.velocity = 6 * (this.facing * -2 + 1);
    this.timeBetweenFrames = 4;
    this.animationCountdown = this.timeBetweenFrames;
    this.image = 0;
    this.numImages = 3;
    this.opponent = players[a === 0 ? 1 : 0];
    this.exploded = false;

    this.simulate = function() {
        if (this.x + this.w*scale < 0 || this.x > width || this.y + this.h*scale < 0 || this.y > height){
            powerups.splice(powerups.indexOf(this), 1);
            return;
        }

        this.animationCountdown--;
        if (this.animationCountdown === 0) {
            this.image = (this.image + 1) % this.numImages;
            this.animationCountdown = this.timeBetweenFrames;
        }

        if (!this.exploded) {
            this.x += this.velocity;

            if (this.collides()) {
                this.opponent.knockVelocity[0] = this.velocity > 0 ? 15 : -15;
                this.opponent.knockVelocity[1] = -15;
                this.opponent.health -= 15;
                this.exploded = true;
                this.w = 20;
                this.h = 20;
                this.x += (this.facing === 1 ? -6.5 : 1.5) * scale; 
                this.y -= 6.5 * scale;
                this.numImages = 5;
                this.timeBetweenFrames = 6;
                this.animationCountdown = this.timeBetweenFrames;
                this.image = 0;
            }
        } else {
            if (this.image === 4) {
                powerups.splice(powerups.indexOf(this), 1);
            }
        }
    }

    this.collides = function() {
        for(k = 0; k < poses[this.opponent.pose].passiveBoxes.length; k++){
            if (intersects(this.damageBox, this, poses[this.opponent.pose].passiveBoxes[k], this.opponent)) {
                return true;
            }
        }
        return false;
    }

    this.getImage = function() {
        if (this.exploded) {
            return explosions[this.a][this.image];
        } else {
            return fireballs[this.facing][this.a][this.image];
        }
    }

    this.draw = function(context){
        context.drawImage(this.getImage(),this.x,this.y);
    }
}

var Player = function(a){
    this.a = a;//id
    this.opp = (a === 0) ? 1 : 0;
    this.w = 11;
    this.h = 13;
    this.x = (a === 0) ? 100 : 590;
    this.y = 70;
    this.stunned = 0;
    this.pose = 0;
    this.facing = (a === 0) ? 0 : 1;
    this.kickPressed = false;
    this.punchPressed = false;
    this.blockPressed = false;
    this.downPressed = false;
    this.leftPressed = false;
    this.rightPressed = false;
    this.velocity = [0,0];
    this.knockVelocity = [0,0];
    this.poseCountdown = 0;
    this.hasHit = false;
    this.hasDoubleJumped = false;
    this.timeSinceAction = 0;
    this.timeSinceBlock = 0;
    this.stunned = 0;
    this.knockDistance = 0;
    this.health = 100;
    this.combo = 0;
    this.hasPowerup = false;
    this.kick = function(){
        if(!this.kickPressed && this.timeSinceAction === 0 && this.stunned === 0 && this.knockVelocity[0] === 0 && this.knockVelocity[1] === 0){
            if(this.pose === 6){
                this.setPose(7);
            }else{
                if(this.y < height - (this.h * scale)){
                    this.setPose(8);
                    this.velocity[0] += 15*((this.facing === 0) ? 1 : -1);
                }else{
                    this.setPose(1);
                }
            }
            this.timeSinceAction = poses[this.pose].restAfter;
        }
        this.kickPressed = true;
    }
    this.punch = function(){
        if(!this.punchPressed && this.timeSinceAction === 0 && this.stunned === 0 && this.knockVelocity[0] === 0 && this.knockVelocity[1] === 0){
            if(poses[this.pose].crouch){
                this.setPose(10);
            }else if(this.hasPowerup){
                this.setPose(9);
                this.hasPowerup = false;
                powerups.push(new Fireball(this.a));
            }else{
                this.setPose(3);
            }
            this.timeSinceAction = poses[this.pose].restAfter;
        }
        this.punchPressed = true;
    }
    this.block = function(){
        if(!this.blockPressed && this.timeSinceBlock === 0 && this.stunned === 0 && this.knockVelocity[0] === 0 && this.knockVelocity[1] === 0
        && !poses[this.pose].crouch){
            this.setPose(4);
            this.timeSinceBlock = poses[this.pose].blockRestAfter;
        }
        this.blockPressed = true;
    }
    this.stopBlocking = function() {
        this.blockPressed = false;
        if(this.pose === 5){
            this.setPose(0);
        }
    }
    this.crouch = function(){
        if(!this.downPressed && this.timeSinceBlock === 0 && this.stunned === 0 && this.knockVelocity[0] === 0 && this.knockVelocity[1] === 0){
            this.setPose(6);
        }
        this.downPressed = true;
    }
    this.stand = function(){
        this.downPressed = false;
        this.setPose(0);
        
        var opp = players[this.opp];
        if(this.x + this.w*scale - 30 > opp.x + 30 &&
            this.x + 30 < opp.x + opp.w*scale - 30
        ){
            if(opp.y + opp.h*scale >= this.y &&
                /*opp.y < this.y - this.h &&*/
                opp.y < this.y
            ){
                opp.y = this.y - opp.h*scale;
                opp.velocity[1] = -4;
            }else if(/*opp.velocity[1] === 0 && */opp.y >= this.y){
                this.y = opp.y - this.h*scale;
            }
        }
    }
    this.jump = function(){
        if(this.stunned === 0 && this.knockVelocity[0] === 0 && this.knockVelocity[1] === 0){
            if(this.y === height-this.h*scale){
                this.velocity[1] = -8;
            }else if(!this.hasDoubleJumped){
                if(this.x <= 0){
                    this.hasDoubleJumped = true;
                    this.velocity[1] = -12;
                    this.velocity[0] = 8;
                }else if(this.x + this.w*scale >= width){
                    this.velocity[1] = -12;
                    this.velocity[0] = -8;
                    this.hasDoubleJumped = true;
                }
            }
        }
    }
    this.tickPose = function(){
        if(poses[this.pose].temporary){
            if(this.poseCountdown === 0){
                var n = poses[this.pose].next(this);
                if(n != -1){
                    this.setPose(n);
                }
            }else{
                this.poseCountdown--;
            }
        }else if(this.pose === 8){
            if(this.y >= height - (this.h * scale)){
                this.pose = 0;
                this.timeSinceAction = poses[8].restAfter;
            }
        }
        if(this.timeSinceAction > 0)
            this.timeSinceAction--;
        if(this.timeSinceBlock > 0)
            this.timeSinceBlock--;
        if(this.stunned > 0)
            this.stunned--;
    }
    this.setPose = function(i){
        if(poses[this.pose].crouch){
            this.h = 13;
            this.y = Math.min(this.y,height-this.h*scale);
        }
        this.pose = i;
        if(poses[i].crouch){
            if(this.y + this.h*scale >= height){
                this.y += 5*scale;
            }						
            this.h = 8;
        }
        this.hasHit = false;
        if(poses[this.pose].temporary){
            this.poseCountdown = poses[this.pose].timeout;
        }
        if(this.y >= height-this.h*scale){
            this.velocity[0] = (Math.abs(this.velocity[0]) > 8*poses[this.pose].moveSpeed) ? 8*poses[this.pose].moveSpeed*(Math.abs(this.velocity[0])/this.velocity[0]) : this.velocity[0];
        }
    }
    
    this.update = function(){
        if(this.knockVelocity[0] === 0 && this.knockVelocity[1] === 0){
            this.y += this.velocity[1];//*((this.y >= height-this.h*scale) ? poses[this.pose].moveSpeed : 1);
            this.x += this.velocity[0];//*((this.y >= height-this.h*scale) ? poses[this.pose].moveSpeed : 1);
        }else{
            this.y += this.knockVelocity[1];
            this.x += this.knockVelocity[0];
            this.knockDistance += this.knockVelocity[0];
        }
        this.facing = (this.x < players[this.opp].x) ? 0 : 1;
    }
    this.simulate = function(){
        this.tickPose();
        if(this.y <= 0 && this.velocity[1] < 0){
            this.y = 0;
            this.velocity[1] = 0;
        }else if(this.y >= height - this.h*scale && this.velocity[1] > 0){
            this.y = height - this.h*scale;
            this.velocity[1] = 0;
            this.hasDoubleJumped = false;
        }else if(this.y < height - this.h*scale && this.knockVelocity[1] === 0){
            this.velocity[1] += gravity;
        }
        this.combo--;
        var opp = players[((this.a === 0) ? 1 : 0)];	
        if(this.y + this.h*scale >= opp.y &&
            this.y + this.h*scale <= opp.y+30 &&
            this.x + this.w*scale - 30 > opp.x + 30 &&
            this.x + 30 < opp.x + opp.w*scale - 30 &&
            this.velocity[1] > 0 //&&
            //this.pose !== 8
        ){//stomp
            this.velocity[1] = 0;//*= -1;
            this.y = opp.y - this.h*scale;
        }
        
        if(!(this.knockVelocity[0] === 0 && this.knockVelocity[1] === 0)){
            if(this.y <= 0 && this.knockVelocity[1] < 0){
                this.y = 0;
                this.knockVelocity[1] = 0;
            }else if(this.y >= height - this.h*scale && this.knockVelocity[1] > 0){
                this.y = height - this.h*scale;
                this.knockVelocity[1] = 0;
            }else if(this.y < height - this.h*scale){
                if(this.knockVelocity[1] < 0) {
                    this.knockVelocity[1] += gravity;
                    this.velocity[1] = 0;
                }
            }
            
            if(this.x <= 0 && this.knockVelocity[0] < 0){
                this.x = 0;
                if(this.knockDistance !== 0){
                    this.health -= Math.abs(this.knockVelocity[0]);
                    this.stunned = 12;
                }
                this.knockVelocity[0] = 0;
                this.knockDistance = 0;
            }else if(this.x >= width - this.w*scale && this.knockVelocity[0] > 0){
                this.x = width - this.w*scale;
                if(this.knockDistance !== 0){
                    this.health -= Math.abs(this.knockVelocity[0]);
                    this.stunned = 12;
                }
                this.knockVelocity[0] = 0;
                this.knockDistance = 0;
            }else{
                if(this.knockVelocity[0] < 0){
                    this.knockVelocity[0] += Math.min(1,Math.abs(this.knockVelocity[0]));
                }else if(this.knockVelocity[0] > 0){
                    this.knockVelocity[0] -= Math.min(1,Math.abs(this.knockVelocity[0]));
                }
                if(this.knockVelocity === 0){
                    this.knockDistance = 0;
                }
            }
        }
        
        if(this.stunned === 0 && this.knockVelocity[0] === 0 && this.knockVelocity[1] === 0){
            if(this.rightPressed && !this.leftPressed){
                // if(this.velocity[0] < 8){
                    this.velocity[0] = Math.min(poses[this.pose].maxSpeed,
                        this.velocity[0] + 4*((this.y >= height-this.h*scale) ? poses[this.pose].moveSpeed : 1));
                // }
            }else if(!this.rightPressed && this.leftPressed){
                // if(this.velocity[0] > -8){
                this.velocity[0] = Math.max(-poses[this.pose].maxSpeed, 
                    this.velocity[0] - 4*((this.y >= height-this.h*scale) ? poses[this.pose].moveSpeed : 1));
                // }
            }
        }

        //damping/friction
        if(this.velocity[0] < 0){
            this.velocity[0] += Math.min(2,Math.abs(this.velocity[0]));
        }else if(this.velocity[0] > 0){
            this.velocity[0] -= Math.min(2,Math.abs(this.velocity[0]));
        }
        
        if(this.x <= 0 && this.velocity[0] < 0){//collide x walls
            this.x = 0;
            this.velocity[0] = 0;
        }else if(this.x >= width - this.w*scale && this.velocity[0] > 0){
            this.x = width - this.w*scale;
            this.velocity[0] = 0;
        }else if(this.velocity[0] < 0 && //collide between characters
            this.x > players[this.opp].x+50 &&
            this.x < players[this.opp].x+60 &&
            this.y + this.h*scale > players[this.opp].y &&
            players[this.opp].y + players[this.opp].h*scale > this.y
        ){
            this.x = players[this.opp].x+55;
            this.velocity[0] = 0;
        }else if(this.velocity[0] > 0 &&
            this.x + this.w*scale > players[this.opp].x+50 &&
            this.x + this.w*scale < players[this.opp].x+60 &&
            this.y + this.h*scale > players[this.opp].y &&
            players[this.opp].y + players[this.opp].h*scale > this.y
        ){
            this.x = players[this.opp].x+55-this.w*scale;
            this.velocity[0] = 0;
        }
        this.update();
        this.collide();
    }
    this.collide = function(){
        var damageBox = poses[this.pose].damageBox;
        if(!(damageBox === undefined || damageBox === null) && this.hasHit === false){
            var opponent = players[this.opp];
            var boxes = poses[opponent.pose].passiveBoxes;
            if(!(poses[opponent.pose].blockBox === undefined || poses[opponent.pose].blockBox === null)){
                if(intersects(damageBox,this,poses[opponent.pose].blockBox,opponent)){
                    opponent.health -= 2;
                    this.hasHit = true;
                    return;
                }
            }
            if(!(poses[opponent.pose].activeBlockBox === undefined || poses[opponent.pose].activeBlockBox === null)){
                if(intersects(damageBox,this,poses[opponent.pose].activeBlockBox,opponent)){
                    this.stunned = 60;
                    this.hasHit = true;
                    return;
                }
            }
            for(e = 0; e < boxes.length; e++){
                if(intersects(damageBox,this,boxes[e],opponent)){
                    if(this.pose === 3){
                        if(opponent.stunned < 10) opponent.stunned = 7;
                        opponent.velocity[0] = 0;
                        opponent.health -= 5;
                        this.combo += 100;
                        if(this.combo >= 200){
                            opponent.knockVelocity[0] = (this.facing === 0) ? 10 : -10;
                            this.combo = 0;
                        }
                    }else if(this.pose === 1 || this.pose === 8){
                        opponent.knockVelocity[0] = (this.facing === 0) ? 15 : -15;
                        opponent.health -= 2;
                    }else if(this.pose === 7){
                        if(this.h*scale + this.y >= height){
                            opponent.knockVelocity[1] = -10;
                            opponent.knockVelocity[0] = (this.facing === 0) ? 5 : -5;
                        }else{
                            opponent.knockVelocity[0] = (this.facing === 0) ? 10 : -10;
                        }
                        opponent.health -= 2;
                    }else if(this.pose === 10){
                        opponent.knockVelocity[1] = -12;
                        opponent.health -= 6;
                    }
                    this.hasHit = true;
                    return;
                }
            }
        }
    }
    this.getImg = function(){
        return poses[this.pose].img[(a === 0) ? 0 : 1][(this.facing === 0) ? 0 : 1];
    }
    this.draw = function(context){
        if(this.stunned > 0){
            context.fillStyle='#fff223';
            context.fillRect(this.x+40,this.y-20,30,10);
        }
        if(this.hasPowerup){
            context.fillStyle = (this.a == 0) ? 'rgb(0,46,225)' : 'red';
            context.fillRect(this.x+50,this.y-20,10,10);
        }
        
        context.drawImage(this.getImg(), 0, 0, this.w*scale, this.h*scale, this.x,this.y,this.w*scale,this.h*scale);//TODO
        if (false) {
            context.fillStyle = "rgba(0, 255, 0, 0.5)";
            if(poses[this.pose].passiveBoxes){
                context.fillStyle = "rgba(0, 0, 0, 1)";
                context.fillText("pos "+this.pose,this.x+40,this.y-20);
                context.fillStyle = "rgba(0, 255, 0, 0.5)";
            
                for(j = 0; j < poses[this.pose].passiveBoxes.length; j++){
                    var r = poses[this.pose].passiveBoxes[j];
                    var transform = rectInPlayerFrame(r, this)
                    context.fillRect(transform.x, transform.y, transform.w, transform.h)
                }
            }
            if(!(poses[this.pose].damageBox === undefined || poses[this.pose].damageBox === null)){
                context.fillStyle = "rgba(255, 200, 0, 0.5)";
                var r = rectInPlayerFrame(poses[this.pose].damageBox, this);
                context.fillRect(r.x, r.y, r.w, r.h);
            }
            if(!(poses[this.pose].blockBox === undefined || poses[this.pose].blockBox === null)){
                context.fillStyle = 'lightblue';
                var r = rectInPlayerFrame(poses[this.pose].blockBox, this);
                context.fillRect(r.x, r.y, r.w, r.h);
            }
            if(!(poses[this.pose].activeBlockBox === undefined || poses[this.pose].activeBlockBox === null)){
                context.fillStyle = 'blue';
                var r = rectInPlayerFrame(poses[this.pose].activeBlockBox, this);
                context.fillRect(r.x, r.y, r.w, r.h);
            }
        }
    };
}
function intersects(a, player1, b, player2) {
    // return rectanglesIntersect(
    // 	rectInPlayerFrame(a, player1),
    // 	rectInPlayerFrame(b, player2));
    var x1, y1, w1, h1;
    var x2, y2, w2, h2;
    if (player1.facing === 0) { 
        x1 = player1.x + a.x * scale; 
        y1 = player1.y + a.y * scale; 
        w1 = a.w * scale; 
        h1 = a.h * scale;
    } else {
        x1 = player1.x + (player1.w * scale) - (a.x + a.w) * scale;
        y1 = player1.y + a.y * scale;
        w1 = a.w * scale;
        h1 = a.h * scale;
    }
    if (player2.facing === 0) { 
        x2 = player2.x + b.x * scale; 
        y2 = player2.y + b.y * scale; 
        w2 = b.w * scale; 
        h2 = b.h * scale;
    } else {
        x2 = player2.x + (player2.w * scale) - (b.x + b.w) * scale;
        y2 = player2.y + b.y * scale;
        w2 = b.w * scale;
        h2 = b.h * scale;
    }
    return x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2;
}
function rectanglesIntersect(a, b) {
    return a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
}
function rectInPlayerFrame(rect, player) {
    return (player.facing === 0) ? 
        new Rectangle(player.x + rect.x * scale, 
                player.y + rect.y * scale, 
                rect.w * scale, 
                rect.h * scale) :
        new Rectangle(player.x + (player.w * scale) - (rect.x + rect.w) * scale,
                player.y + rect.y * scale,
                rect.w * scale,
                rect.h * scale);
}
function intersects2(a,player1,b){
    var tempx = (player1.facing === 0) ? a.x : player1.w-(a.w+a.x);
    return (tempx*scale+player1.x + a.w*scale > b.x && 
    tempx*scale+player1.x < b.x + b.w*scale && 
    a.y*scale+player1.y + a.h*scale > b.y && 
    a.y*scale+player1.y < b.y + b.h*scale);
    // return rectanglesIntersect(rectInPlayerFrame(a, player1), 
    // 	new Rectangle(b.x, b.y, b.w * scale, b.h * scale));
}
function Pose(i){
    this.img = [[new Image(),new Image()],[new Image(),new Image()]];
    this.img[0][0].src='blue/'+i+'.png';
    this.img[0][1].src='blue/'+i+'-.png';
    this.img[1][0].src='red/'+i+'.png';
    this.img[1][1].src='red/'+i+'-.png';
    this.passiveBoxes = new Array();
    this.blockBox;
    this.activeBlockBox;
    this.damageBox;
    this.temporary = false;
    this.timeout;
    this.next=function(a){return -1};
    this.moveSpeed = 1;
    this.maxSpeed = 9;
    this.restAfter = 0;
    this.blockRestAfter = 0;
    this.crouch = false;
}

function Rectangle(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

function startAnimating(fps){
    fpsInterval=1000/fps;
    then=window.performance.now();
    startTime=then;
    requestAnimationFrame(animate);
    // requestAnimationFrame(getControls)
}

function getControls() {
    var gamepads = navigator.getGamepads();
    if (gamepads[0] && gamepads[0].connected) {
        pollGamepad(gamepads[0], 0);
    }
    if (gamepads[1] && gamepads[1].connected && gamepads[1].buttons[0]) {
        pollGamepad(gamepads[1], 1);
    }
    if (gamepads[2] && gamepads[2].connected && gamepads[2].buttons[0]) {
        pollGamepad(gamepads[2], 1);
    }
    // requestAnimationFrame(getControls)
}

function animate() {
    getControls();


    // calc elapsed time since last loop

    now = window.performance.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);
        

        if(!stop){
            simulate();
        }
        
        draw(elapsed);
        
        if(players[0].health <= 0 || players[1].health <= 0){
            stop = true;
        }
    }
    // request another frame
    
    requestAnimationFrame(animate);
}

function simulate(){
    for(i = 0; i < players.length; i++){
        players[i].simulate();
    }
    if(powerupsEnabled){
        count++;
        if(count >= 240){
            count = 0;
            var rand = Math.ceil(Math.random()*5);
            if(rand >= 3 && powerups.length === 0){
                powerups.push(new Powerup(0));
            }
        }
        for(i = 0; i < powerups.length; i++){
            powerups[i].simulate();
        }
    }
}

function draw(elapsed){
    bufferCanvas.width = width;
    //ctx.scale(2, 2);
    buffer.fillText("fps: "+Math.round(1000/elapsed * 100) / 100,10,10);
    buffer.beginPath();
    buffer.fillStyle = 'blue';
    buffer.fillRect(20+Math.round((100 - players[0].health)*3.5 / 10) * 10,20,Math.round(players[0].health*3.5 / 10) * 10,30);
    buffer.fillStyle = 'red';
    buffer.fillRect(430,20,Math.round(players[1].health*3.5 / 10) * 10,30);
    buffer.fillStyle = 'black';
    buffer.fillRect(370,10,60,50);
    for(i = 0; i < players.length; i++){
        players[i].draw(buffer);
    }
    for(i = 0; i < powerups.length; i++){
        powerups[i].draw(buffer);
    }
    if(stop){
        buffer.fillStyle = 'black';
        buffer.font = 'bold 30pt Lucida Console';
        buffer.textAlign = 'center';
        buffer.fillText((paused ? "paused" : ("press [space] to play"+((hasPlayed) ? " again" : ""))),width/2,height/2);
    }
    buffer.stroke();
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bufferCanvas,0,0,width,height,0,0,width,height);
}

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    
    document.getElementById("controls").style.display = "none";
    
    var scaleX = window.innerWidth/(width+22);
    var scaleY = window.innerHeight/(height+22);
    var scaleXY = Math.min(scaleX,scaleY);
    
    canvas.style.transform = "scale("+scaleXY+","+scaleXY+")";
    canvas.style.webkitTransform = "scale("+scaleXY+","+scaleXY+")";
    canvas.style.MozTransform = "scale("+scaleXY+","+scaleXY+")";
    canvas.style.msTransform = "scale("+scaleXY+","+scaleXY+")";
    canvas.style.OTransform = "scale("+scaleXY+","+scaleXY+")";
    
    
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    
    document.getElementById("controls").style.display = "block";
    
    canvas.style.transform = "scale("+1+","+1+")";
    canvas.style.webkitTransform = "scale("+1+","+1+")";
    canvas.style.MozTransform = "scale("+1+","+1+")";
    canvas.style.msTransform = "scale("+1+","+1+")";
    canvas.style.OTransform = "scale("+1+","+1+")";
    
  }
}

var keyBindings = (function(){
    var KeyBinding = function(f1, f2) {
        this.onKeyDown = function(playerId) {
            if (!this.pressed) {
                if (f1) f1(playerId);
                this.pressed = true;
            }
        };
        this.onKeyUp = function(playerId) {
            if (this.pressed) {
                if (f2) f2(playerId);
                this.pressed = false;
            }
        };
        this.pressed = false;
    }

    var bindings = new Array(16);

    bindings[8] = new KeyBinding(pause, null);
    bindings[9] = new KeyBinding(restart, null);
    bindings[3] = new KeyBinding(
            function(playerId) {
                if (!stop) players[playerId].jump();
            },
            null);
    bindings[0] = new KeyBinding(
            function(playerId) {
                if (!stop) players[playerId].punch();
            },
            function(playerId) {
                if (!stop) players[playerId].punchPressed = false;
            });
    bindings[1] = new KeyBinding(
            function(playerId) {
                if (!stop) players[playerId].kick();
            },
            function(playerId) {
                if (!stop) players[playerId].kickPressed = false;
            });
    bindings[2] = new KeyBinding(
            function(playerId) {
                if (!stop) players[playerId].block();
            },
            function(playerId) {
                if (!stop) players[playerId].stopBlocking();
            });
    bindings[14] = new KeyBinding(
            //leftPressed
            function(playerId) {
                if (!stop) players[playerId].leftPressed = true;
            },
            //leftReleased
            function(playerId) {
                if (!stop) players[playerId].leftPressed = false;
            });
    bindings[15] = new KeyBinding(
            //rightPressed
            function(playerId) {
                if (!stop) players[playerId].rightPressed = true;
            },
            //rightReleased
            function(playerId) {
                if (!stop) players[playerId].rightPressed = false;
            });
    bindings[13] = new KeyBinding(
            //downPressed
            function(playerId) {
                if (!stop) players[playerId].crouch();
            },
            //downReleased
            function(playerId) {
                if (!stop) players[playerId].stand();
            });
    return bindings;
})();

function pollGamepad(gamepad, playerId) {

    for (key in keyBindings) {
        var binding = keyBindings[key];
        if (gamepad.buttons[parseInt(key)] && gamepad.buttons[parseInt(key)].pressed) {
            binding.onKeyDown(playerId);
        } else {
            binding.onKeyUp(playerId);
        }
    }

    // gamepad.on('press', jump, function(e) {
    // 	if (!stop) players[playerId].jump();
    // });
}

function pause() {
    if(!(!paused && stop)){
        paused = !paused;
        stop = !stop;
        players[0].rightPressed = false;
        players[0].leftPressed = false;
        players[1].rightPressed = false;
        players[1].leftPressed = false;
    }
}


function keyDown(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if(!stop){
        if (code === 38)//up
            players[1].jump();
        else if (code === 40)//down
            players[1].crouch();
        else if (code === 37)//left
            players[1].leftPressed = true;
        else if (code === 39)//right
            players[1].rightPressed = true;
        else if (code === 190){
            players[1].kick();
        }else if (code === 188){
            players[1].punch();
        }else if (code === 77){
            players[1].block();
        }else
        
        //player 2
        if (code === 87)//up
            players[0].jump();
        else if (code === 83)//down
            players[0].crouch();
        else if (code === 65)//left
            players[0].leftPressed = true;
        else if (code === 68)//right
            players[0].rightPressed = true;
        else if (code === 66){
            players[0].kick();
        }else if (code === 86){
            players[0].punch();
        }else if (code === 67){
            players[0].block();
        }
    }else {
        if(code === 32){
            restart();
        }
    }
    
    if(code == 27) {
        pause();
    }
    
}

function restart() {
    if (stop && !paused) {
        players = [new Player(0),new Player(1)];
        powerups = new Array();
        count = 0;
        stop = false;
        hasPlayed = true;
    }
}

function keyUp(e){
    if(!stop){
        var code = e.keyCode ? e.keyCode : e.which;
        if (code === 40)//down
            players[1].stand();
        else if (code === 37)//left
            players[1].leftPressed = false;
        else if (code === 39)//right
            players[1].rightPressed = false;
        else if (code === 190){
            players[1].kickPressed = false;
        }else if (code === 188){
            players[1].punchPressed = false;
        }else if (code === 77){
            players[1].stopBlocking();
        }else
        
        //player 2
        if (code === 83)//down
            players[0].stand();
        else if (code === 65)//left
            players[0].leftPressed = false;
        else if (code === 68)//right
            players[0].rightPressed = false;
        else if (code === 66){
            players[0].kickPressed = false;
        }else if (code === 86){
            players[0].punchPressed = false;
        }else if (code === 67){
            players[0].stopBlocking();			
        }
    }
}

