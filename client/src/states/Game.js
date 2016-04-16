import RainbowText from 'objects/RainbowText';
import GameObject from 'objects/GameObject';
import io from 'socket.io-client';

class GameState extends Phaser.State {

	preload() {
		console.log('Game preload');

		// The order you create these groups matters, unless you set the Z-index by hand.
		// I add these to the game object, so they're easily accessed inside different objects.
		// Create a group for the foreground items, like players, enemies and things like that.
		this.game.foreground = this.game.add.group();

		// Create a group for UI stuff like buttons, texts and menus. It's drawn on top of the foreground.
		this.game.ui = this.game.add.group();
	}

	create() {
		console.log('Game create');

        var socket = io("http://localhost:3100", {query: 'name=' + Date.now()});

        socket.on('connect', function () {
            console.log("WebSocket connection established and ready.");
        });


        let center = { x: this.game.world.centerX, y: this.game.world.centerY };


		// These are some text object examples
		let text = new RainbowText(this.game, center.x, center.y, 'Phaser template for Ludum Dare!');
		text.anchor.set(0.5, 1);
		this.game.ui.add(text);

		let text2 = new RainbowText(this.game, center.x, center.y, 'Press directional keys!');
		text2.anchor.set(0.5, 0);
		this.game.ui.add(text2);

		// This is a game sprite example
		this.player = new GameObject(this.game, center.x, center.y + 100, 'plane', 0);
		this.game.foreground.add(this.player);

		// Create directional keys
		this.cursors = this.game.input.keyboard.createCursorKeys();

	}

	update(){
		// Do all your game loop stuff here
		this.checkKeyboard();
	}

	checkKeyboard(){
		// Separate checking for up/down and left/right
		if (this.cursors.up.isDown){
			this.player.y -= 1;
		} else if (this.cursors.down.isDown){
			this.player.y += 1;
		}

		if (this.cursors.left.isDown){
			this.player.x -= 1;
		} else if (this.cursors.right.isDown){
			this.player.x += 1;
		}
	}

}

export default GameState;
