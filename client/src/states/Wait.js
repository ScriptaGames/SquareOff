class WaitState extends Phaser.State {

    init(socket, nick, color) {
        console.log("Wait init: ", socket.id, nick, color);

        this.socket = socket;
        this.player_nick = nick;
        this.player_color = color;
    }

    preload(){
        console.log('Wait state preload');
    }

    create() {
        var self = this;

        this.socket.on('game_status', (status) => {
            document.querySelector('#waiting .players').textContent = status.player_count + ' player' + (status.player_count === 1 ? '' : 's');
            document.querySelector('#waiting .games').textContent = status.game_count + ' game' + (status.game_count === 1 ? '' : 's');
        });

        document.querySelector('#waiting').style.display = 'block';

        console.log('Wait state create');

        // Inform the server the player is ready to join a game
        this.socket.emit('player_ready', this.player_nick, this.player_color);

        this.socket.removeAllListeners('game_start');
        this.socket.on('game_start', gameInstance => {
            console.log("Entering Game instance: ", gameInstance.id);
            console.log("Enemy nick: ", gameInstance.enemy.nick);
            console.log("Enemy color: ", gameInstance.enemy.color);

            self.state.start('GameState', false, false, self.socket, self.player_nick, self.player_color, gameInstance.enemy.nick, gameInstance.enemy.color);
        });

        //TODO: add invite friend button to wait state for those tired of waiting
        //var inviteFriendButton = window.document.getElementById('enter_queue_button');
    }

    shutdown() {
        document.querySelector('#waiting').style.display = 'none';
        this.game.canvas.style.display = 'block';
    }
}

export default WaitState;
