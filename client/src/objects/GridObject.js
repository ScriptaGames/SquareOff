import config from '../config';

class GridObject extends Phaser.Graphics {
    constructor(game, center_x, center_y) {
        super(game, center_x, center_y);

        const HEIGHT = game.height - config.GRID.PADDING.VERTICAL*2;
        const WIDTH = HEIGHT * config.GRID.WIDTH / config.GRID.HEIGHT;
        const hlw = config.GRID.LINE_WIDTH / 2;
        const hw = WIDTH / 2;
        const hh = HEIGHT / 2;

        this.blockWidth = WIDTH / config.GRID.WIDTH ;
        this.blockHeight = HEIGHT / config.GRID.HEIGHT;
        this.gridWidth = WIDTH;
        this.gridHeight = HEIGHT;
        this.lineWidth = config.GRID.LINE_WIDTH;

        this.lineStyle( config.GRID.LINE_WIDTH, 0x444444, 1.0);

        for( let gridX = 0; gridX <= config.GRID.WIDTH; gridX += 1 ) {
            let x = gridX * this.blockWidth;
            this.moveTo(x - hlw - hw, 0 - hlw - hh);
            this.lineTo(x - hlw - hw, HEIGHT + hlw - hh);
        }

        for( let gridY = 0; gridY <= config.GRID.HEIGHT; gridY += 1 ) {
            let y = gridY * this.blockHeight;
            this.moveTo(0 - hlw*2 - hw, y - hh);
            this.lineTo(WIDTH - hw, y - hh);
        }

        const RIM = WIDTH * ( config.GRID.WIDTH - config.GOAL.WIDTH ) / config.GRID.WIDTH / 2;
        this.lineStyle( config.GRID.LINE_WIDTH*4, 0xff0000, 0.8);
        this.moveTo(0 - hlw*2 - hw + RIM, 0 - hh);
        this.lineTo(WIDTH - hw - RIM, 0 - hh);
        this.moveTo(0 - hlw*2 - hw + RIM, config.GRID.HEIGHT * this.blockHeight - hh);
        this.lineTo(WIDTH - hw - RIM, config.GRID.HEIGHT * this.blockHeight - hh);

    }

    update() {
    }
}

export default GridObject;
