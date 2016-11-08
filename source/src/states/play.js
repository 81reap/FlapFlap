//      vars add stlye
var giveGravity = function (sprite) {
	sprite.body.gravity.y = 1000;
};

var goAway = function (sprite) {
	sprite.game.add.tween(sprite).to({
			alpha: 0,
			height: 0,
			width: 0,
			x: sprite.x + 30,
			y: sprite.y + 30
		}, speed, Phaser.Easing.Quadratic.In, true);
};

var die = function (sprite) {
	sprite.body.velocity.x = -speed;
	sprite.game.add.tween(sprite)
		.to({
			angle: 90,
			x: 400
		}, 1000, Phaser.Easing.Quadratic.In, true);
};

var flyIn = function (sprite) {
	sprite.flyingIn = sprite.game.add.tween(sprite).to({
			y: 250
		}, 1000, Phaser.Easing.Quadratic.Out, true);

	sprite.flyingIn.onComplete.add(giveGravity.bind(this, sprite));

	sprite.game.add.tween(sprite).to({
			x: 100,
			angle: 0
		}, 1000, Phaser.Easing.Quadratic.Out, true);
};

//      play code starts here
var play_state = {

	create: function () {
        //background
        this.background = this.game.add.sprite(0, 0, 'background');
        this.background.width = game.width;
        this.background.height = game.world.height - 32;
        
		this.noscore = false;
        
        //bird
		this.bird = this.game.add.sprite(0, 0, 'bird');
		this.bird.angle = 70;
        this.bird.height = 40;
        this.bird.width = 45;
		this.bird.anchor.setTo(-0.2, 0.5);
        this.bird.animations.add('fly');
        this.bird.animations.play('fly', 10, true);
		flyIn(this.bird);
		this.bird.body.bounce.setTo(1, 1);
		this.downHandler = this.game.input.onDown.add(this.jump, this);

		this.pipes = game.add.group();

		this.pipes.createMultiple(20, 'pipe');

		this.pipeAdder = this.game.time.events.loop(1500, this.addRowOfPipes, this);
		this.highScore = window.localStorage.getItem('flabbyBird') || 0;
		this.score = 0;
		var style = {
			font: '40px Arial',
			fill: '#ffffff',
			stroke: '#000000',
			strokeThickness: 5
		};

		this.labelScore = this.game.add.text(20, 20, this.score, style);

		var highScoreStyle = {
			font: '40px Arial',
			fill: '#D2BE27',
			stroke: '#000000',
			strokeThickness: 5
		};

		this.labelHighScore = this.game.add.text(this.game.width - 40, 20, this.highScore, highScoreStyle);
		this.currentPipe = null;
		this.nextPipe = null;
        
        //ground
        this.ground = this.game.add.sprite(0, game.world.height - 32, 'ground');
        this.ground.width = game.world.width + 150;
        this.ground.body.velocity.x -= speed;
        this.background.height = game.world.height - 32;
        
        //sound effects
        flap = this.game.add.audio('flap');
        death = this.game.add.audio('die');
        point = this.game.add.audio('point');
        
        //confettie
        this.confettie1 = game.add.emitter(0, 0, 100);
        this.confettie1.makeParticles('c_green');
        this.confettie2 = game.add.emitter(0, 0, 100);
        this.confettie2.makeParticles('c_navy');
        this.confettie3 = game.add.emitter(0, 0, 100);
        this.confettie3.makeParticles('c_red');
        this.confettie4 = game.add.emitter(0, 0, 100);
        this.confettie4.makeParticles('c_sky');
        this.confettie5 = game.add.emitter(0, 0, 100);
        this.confettie5.makeParticles('c_yellow');
        this.confettie1.gravity = 200;
        this.confettie2.gravity = 200;
        this.confettie3.gravity = 200;
        this.confettie4.gravity = 200;
        this.confettie5.gravity = 200;
	},

	update: function () {
        if (this.ground.x < -130) { 
			this.ground.x = 0 ;
        }
        
		this.checkPipes();

		if (this.game.physics.collide(this.bird, this.ground)) {
			this.restartGame();
		}
        
        if (!this.bird.inWorld) {
			this.restartGame();
		} else {
			this.game.physics.collide(this.bird, this.pipes, this.collisionHappened, null, this);
		}
	},

	collisionHappened: function () {
		this.noscore = true;
		this.showFinalScore();
		die(this.bird);
		this.pipes.forEach(goAway);
		this.game.input.onDown.removeAll();
	},
	checkPipes: function () {
		if (this.currentPipe == null) {
			this.currentPipe = this.nextPipe;
		}

		if (this.currentPipe != null && this.currentPipe.x < 100) {
			this.addToScore();
			this.currentPipe = this.nextPipe;
		}
	},

	jump: function() {
        flap.play()
        
		if (this.bird.flyingIn) {
			this.bird.flyingIn.stop();
			giveGravity(this.bird);
		}

		this.bird.body.velocity.y = -350;
		this.game.add.tween(this.bird)
			.to({ height: 30 }, 100, Phaser.Easing.Linear.None, true)
			.to({ height: 40 }, 100, Phaser.Easing.Linear.None, true);


		if (this.bird.angling) {
			this.bird.angling.stop();
		}

		this.bird.angling = this.game.add.tween(this.bird)
			.to({ angle: -10 }, 80, Phaser.Easing.Linear.None, true)
			.to({ angle: 50 }, 2000, Phaser.Easing.Linear.None, true);
	},
    
    restartGame: function () {
        death.play();
		window.localStorage.setItem('flabbyBird', this.highScore);
		this.game.time.events.remove(this.pipeAdder);
		this.game.state.start('menu');
	},

	addOnePipe: function (x, y) {
		var pipe = this.pipes.getFirstDead();
		pipe.reset(x, y);
		pipe.body.velocity.x = -speed;
		pipe.outOfBoundsKill = true;

		return pipe;
	},

	addRowOfPipes: function () {
		var hole = Math.floor(Math.random() * 5) + 1;
		for (var i = 0; i < 8; i++) {
			if (i != hole && i != hole + 1) {
				this.nextPipe = this.addOnePipe(400, i * 60 + 10);
			}
		}
	},

	addToScore: function () {
		if (this.noscore === false) {
			this.labelScore.content = ++this.score;
            point.play();

			if (this.score == this.highScore) {
				this.labelHighScore.moveScore = this.game.add.tween(this.labelHighScore).to({ x: 20 }, 300, Phaser.Easing.Sinusoidal.In, true);
			}

			if (this.score >= this.highScore) {
				this.labelHighScore.content = this.highScore = this.score;
                this.yay();
			}
		}
	},

	showFinalScore: function () {        
		var text = this.score >= this.highScore ? this.labelHighScore : this.labelScore;
		var otherText = text === this.labelScore ? this.labelHighScore : this.labelScore;

		if (text.moveScore) {
			text.moveScore.stop();
		}

		var style = text.style;
		style.font = '80px Arial';
		text.setStyle(style);

		text.game.add.tween(text).to({
				x: 150 - ((text.width + 40) / 2),
				y: 245 - ((text.height + 40) / 2)
			}, 150, Phaser.Easing.Quadratic.Out, true);

		otherText.game.add.tween(otherText).to({
				alpha: 0
			}, 50, Phaser.Easing.Linear.None, true);
	},
    
    yay: function() {     //CONFETTIE!!!!!!!!!!! :3   
        var x = this.game.width / 2;
        
        this.confettie1.x = x;
        this.confettie1.y = 0;
        this.confettie1.start(true, 2000, null, 5);
        
        this.confettie2.x = x;
        this.confettie2.y = 0;
        this.confettie2.start(true, 2000, null, 5);
        
        this.confettie3.x = x;
        this.confettie3.y = 0;
        this.confettie3.start(true, 2000, null, 5);
        
        this.confettie4.x = x;
        this.confettie4.y = 0;
        this.confettie4.start(true, 2000, null, 5);
        
        this.confettie5.x = x;
        this.confettie5.y = 0;
        this.confettie5.start(true, 2000, null, 5);
    }
};