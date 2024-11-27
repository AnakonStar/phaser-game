import { Component, ElementRef, OnInit } from '@angular/core';
import { PhaserService } from '../../services/phaser.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  standalone: true,
})
export class GameComponent implements OnInit {
  constructor(private phaserService: PhaserService, private el: ElementRef) {}

  ngOnInit(): void {
    // Passa o contêiner para o método
    this.phaserService.initializeGame(
      this.el.nativeElement.querySelector('#gameContainer')
    );
  }
}
