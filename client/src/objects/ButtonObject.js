import config from '../config';

class ButtonObject extends Phaser.Button {
    constructor(game, grid, grid_x, grid_y, blockSize) {
        const x = game.world.centerX - grid.gridWidth / 2 + grid_x*grid.blockWidth;
        const y = game.world.centerY - grid.gridHeight / 2 + grid_y*grid.blockHeight;

        super(game, x, y, null, function () {console.log("button clicked: ", grid_x, grid_y)});

        this.width = this.height = blockSize;

        this.onInputOver.add(function () {console.log('button over: ', grid_x, grid_y)}, this);
        this.input.useHandCursor = false;
    }
}

export default ButtonObject;
