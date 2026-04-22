import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { Level2 } from './scenes/Level2';
import { GameOver } from './scenes/GameOver';
import { Intro } from './scenes/Intro';
import { MainMenu } from './scenes/MainMenu';
import * as Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { ScoreSummary } from './scenes/ScoreSummary';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#3a7d2c',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        Intro,
        MainMenu,
        Game,
        Level2,
        GameOver,
        ScoreSummary
    ]
};

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
