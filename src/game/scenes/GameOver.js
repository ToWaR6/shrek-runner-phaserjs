import { Scene } from 'phaser';

// Legacy fallback — normally ScoreSummary is used instead
export class GameOver extends Scene
{
    constructor () { super('GameOver'); }

    create ()
    {
        this.scene.start('ScoreSummary', { won: false, onionCount: 0, totalOnions: 20, lives: 0, timeMs: 0 });
    }
}
