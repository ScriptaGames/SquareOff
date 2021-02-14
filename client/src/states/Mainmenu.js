import _ from 'lodash';
import io from 'socket.io-client';

class MainmenuState extends Phaser.State {


    preload(){
        console.log('Mainmenu preload');
    }

    create() {
        console.log('Mainmenu create');

        document.querySelector('#main-menu').style.display = 'block';

        document.querySelector('#show-about').addEventListener('click', function() {
            document.querySelector('#about').style.display = 'block';
        });
        document.querySelector('#hide-about').addEventListener('click', function() {
            document.querySelector('#about').style.display = 'none';
        });

        // attach color button handlers
        var colorButtons = _.toArray(document.querySelectorAll('.color-picker *'));
        var self = this;
        this.player_color = parseInt(_.sample(colorButtons).dataset.color.replace('#', ''), 16);
        _.each(colorButtons, button => {
            button.addEventListener('click', function (evt) {
                // reset all border colors and then set border color on this btn
                _.each(colorButtons, (btn) => btn.classList.remove('active') );
                this.classList.add('active');
                self.player_color = parseInt(this.dataset.color.replace('#', ''), 16);
                window.Sounds.colorPick.play();
            });
        });

        document.querySelector('#nick').addEventListener('keydown', evt => {
            const Enter = 13;
            if (evt.keyCode === Enter) {
                this.startGame();
            }
            else {
                window.Sounds.nameType.play();
            }
        });

        this.socket = io("http://localhost:8080");  //TODO: get this from config based on environment variable

        this.socket.on('connect', () => {
            console.log("WebSocket connection established and ready.");
            this.enableButtons(true);
        });

        this.socket.on('disconnect', status => {
            console.log("Server connection lost! :(");
            this.enableButtons(false);
            this.state.start('MainmenuState');
        });

        this.socket.on('game_status', (status) => {
            console.log("Number of players online: ", status.player_count);
            console.log("Number of games in progress: ", status.game_count);
        });

        var enterQueueButton = window.document.getElementById('enter_queue_button');
        enterQueueButton.addEventListener('click', this.startGame.bind(this));

        //TODO: Implement invite friend button
        //var inviteFriendButton = window.document.getElementById('enter_queue_button');

    }

    startGame() {
        var nick = window.document.getElementById('nick').value || 'Anonymous';
        console.log("enter queue, nick: ", nick);

        window.Sounds.play.play();

        // start wait queue state
        this.state.start('WaitState', false, false, this.socket, nick, this.player_color);
    }

    enableButtons(bool) {
        // enable the play buttons
        let buttons = document.querySelectorAll('#main-menu button');
        _.each(_.toArray(buttons), el => { el.disabled = false } );
    }

    shutdown() {
        document.querySelector('#main-menu').style.display = 'none';
    }
}

export default MainmenuState;
