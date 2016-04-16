import config from '../config';

export default class GridObject extends Phaser.Graphics {
    constructor(game, x, y) {
        super(game, x, y);

        const HEIGHT = game.height - config.GRID.PADDING.VERTICAL*2;
        const WIDTH = HEIGHT * config.GRID.WIDTH / config.GRID.HEIGHT;
        const hw = config.GRID.LINE_WIDTH / 2;

        this.blockWidth = WIDTH / config.GRID.WIDTH;
        this.blockHeight = HEIGHT / config.GRID.HEIGHT;

        this.lineStyle( config.GRID.LINE_WIDTH, 0xffffff, 0.3);

        for( let gridX = 0; gridX <= config.GRID.WIDTH; gridX += 1 ) {
            let x = gridX * this.blockHeight;
            this.moveTo(x - hw, 0 - hw);
            this.lineTo(x - hw, HEIGHT + hw);
        }

        for( let gridY = 0; gridY <= config.GRID.HEIGHT; gridY += 1 ) {
            let y = gridY * this.blockWidth;
            this.moveTo(0 - hw*2, y);
            this.lineTo(WIDTH, y);
        }

    }

    update() {
    }
}
