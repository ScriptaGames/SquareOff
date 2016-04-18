import config from '../config';

class ScoreText extends Phaser.Text {

    constructor(game, x, y, text, color, size) {

        const template = '#000000';
        const colorValue = color.toString(16);
        const colorString = template.substring(0, template.length - colorValue.length) + colorValue;

        super(game, x, y, text, {
            font: size + 'px Bowlby One SC',
            fill: colorString,
            align: 'right',
        });

    }

}

export default ScoreText;
