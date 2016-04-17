import io from 'socket.io-client';

class MainmenuState extends Phaser.State {


    preload(){
        console.log('Mainmenu preload');
    }

    create() {
        let self = this;

        console.log('Mainmenu create');

        // Show the ui
        var ui = window.document.getElementById('main_menu');
        ui.style.display = 'block';

        let socket = io("http://localhost:3100");

        socket.on('connect', function () {
            console.log("WebSocket connection established and ready.");
        });

        socket.on('game_status', function (status) {
            console.log("Number of players online: ", status.player_count);
            console.log("Number of games in progress: ", status.game_count);
        });

        var enterQueueButton = window.document.getElementById('enter_queue_button');
        enterQueueButton.onclick = function () {
            var nick = window.document.getElementById('nick');
            console.log("enter queue, nick: ", nick.value);

            // start wait queue state
            self.state.start('WaitState', false, false, socket, nick.value);
        };

        //TODO: Implement invite friend button
        //var inviteFriendButton = window.document.getElementById('enter_queue_button');

    }

    shutdown() {
        // Hide the ui
        var ui = window.document.getElementById('main_menu');
        ui.style.display = 'none';
    }
}

export default MainmenuState;
