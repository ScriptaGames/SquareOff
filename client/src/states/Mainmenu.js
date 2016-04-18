import _ from 'lodash';
import io from 'socket.io-client';

class MainmenuState extends Phaser.State {


    preload(){
        console.log('Mainmenu preload');
    }

    create() {
        console.log('Mainmenu create');

        document.querySelector('#main-menu').style.display = 'block';

        // attach color button handlers
        var colorButtons = _.toArray(document.querySelectorAll('.color-picker *'));
        var player_color = parseInt(_.sample(colorButtons).dataset.color.replace('#', ''), 16);
        _.each(colorButtons, function (button) {
            button.addEventListener('click', function (evt) {
                player_color = parseInt(this.dataset.color.replace('#', ''), 16);
            });
        });

        let socket = io("http://localhost:3100");

        socket.on('connect', () => {
            console.log("WebSocket connection established and ready.");
            this.enableButtons(true);
        });

        socket.on('disconnect', status => {
            console.log("Server connection lost! :(");
            this.enableButtons(false);
            this.state.start('MainmenuState');
        });

        socket.on('game_status', (status) => {
            console.log("Number of players online: ", status.player_count);
            console.log("Number of games in progress: ", status.game_count);
        });

        var enterQueueButton = window.document.getElementById('enter_queue_button');
        enterQueueButton.onclick = () => {
            var nick = window.document.getElementById('nick');
            console.log("enter queue, nick: ", nick.value);

            // start wait queue state
            this.state.start('WaitState', false, false, socket, nick.value, player_color);
        };

        //TODO: Implement invite friend button
        //var inviteFriendButton = window.document.getElementById('enter_queue_button');

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
