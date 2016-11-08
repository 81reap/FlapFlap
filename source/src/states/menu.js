var menu_state = {
    create: function() {
        //this.background = this.game.add.sprite(0, 0, 'background');
        this.background = this.game.add.button(0, 0, 'background', this.start, this);
        this.background.width = game.world.width;
        this.background.height = game.world.height - 32;
        
        // vars
        var x = game.world.width/2, y = game.world.height/3 *2 - 50;
        
        this.tap2fly = this.game.add.button(x, y, 'tap2fly', this.start, this);
        this.tap2fly.anchor.setTo(0.5, 0.5);
        
        //option button
        this.opt = this.game.add.button(20, 20, 'opt', this.option, this);
        this.opt.anchor.setTo(0.5, 0.5);
        this.opt.width = 25;
        this.opt.height = 25;
        
        //name
        this.name = this.game.add.button(x, y/2 - 50, 'name');
        this.name.anchor.setTo(0.5, 0.5);
        this.name.width = game.world.width/3 * 2;
        
        //for the ground
        this.ground = this.game.add.button(0, game.world.height - 32, 'ground', this.start, this);
        this.ground.width = game.world.width + 150;
        this.ground.body.velocity.x -= speed;
    },
    
    update: function() {
        //resets the ground so that it looks like its moving 4 EVEAA!
        if (this.ground.x < -130) { 
			this.ground.x = 0 ;
        }
    },
    
    //sends to the option screen
    option: function() {
        this.game.state.start('opt');
    },
    
    // Start the actual game
    start: function() {
        this.game.state.start('play');
    }
};