import { Injectable } from '@angular/core';
import Phaser from 'phaser';
import { GameScene } from './game.scene'; // Importe a nova classe da cena

@Injectable({
  providedIn: 'root',
})
export class PhaserService {
  game: Phaser.Game | null = null;

  initializeGame(container: HTMLElement) {
    if (this.game) {
      return;
    }

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container.id,
      scale: {
        min: {
          width: 400,
          height: 300,
        },
      },
      backgroundColor: '#2d2d2d',
      scene: [GameScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
    });
  }
}
