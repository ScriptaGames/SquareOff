import config from '../config';

class ButtonObject extends Phaser.Button {
    constructor(game, grid, grid_x, grid_y, blockSize, socket) {
        const x = game.world.centerX - grid.gridWidth / 2 + grid_x*grid.blockWidth;
        const y = game.world.centerY - grid.gridHeight / 2 + grid_y*grid.blockHeight;

        // configure button
        super(game, x, y, 'hover-sprite', function () {
            console.log("button clicked: ", grid_x, grid_y);
            socket.emit("mouse_click", grid_x, grid_y);
        }, null, 1, 0, 0, 0);
        this.onInputOver.add(function () {
            socket.emit("hover_change", grid_x, grid_y);
        });
        this.width = this.height = blockSize;
        this.input.useHandCursor = false;
    }
}

export default ButtonObject;
