import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: any;
  private interactableBox!: Phaser.Physics.Arcade.Sprite;
  private modal = document.getElementById('gameModal');
  private closeBtn = document.querySelector('.modal-close');
  bullets!: Phaser.Physics.Arcade.Group;

  // Teste

  // New properties for shooting cooldown and state
  private shootCooldownTime = 300; // Cooldown time in milliseconds
  private canShoot = true; // Flag to check if the player can shoot
  private isShooting = false; // Flag to check if the shooting key is currently pressed

  constructor() {
    super('GameScene');
  }

  preload() {
    this.loadSprites();
  }

  create() {
    this.configurePlayer();
    this.configureInteractableBox();

    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 10, // Limit number of bullets
    });

    this.physics.world.gravity.y = 600;

    this.physics.add.collider(
      this.player,
      this.interactableBox,
      this.showModal,
      undefined,
      this
    );

    this.configureKeyboardControl();
  }

  override update() {
    this.playerMovementControl();
  }

  private loadSprites() {
    // Load spritesheet for the player (adjust frameWidth and frameHeight to your sprite size)
    this.load.spritesheet('player', 'assets/player-spritesheet.png', {
      frameWidth: 34,
      frameHeight: 27,
    });
    // Load a box image for the interactable object
    this.load.image('box', 'assets/ball.png');
    this.load.image('shoot', 'assets/web-shoot.png');
  }

  private configurePlayer() {
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerAnimationConfig();
  }

  private configureInteractableBox() {
    this.interactableBox = this.physics.add.sprite(200, 300, 'box');
    this.physics.add.existing(this.interactableBox, true);
    this.interactableBox.setImmovable(true);
    this.interactableBox.setDisplaySize(50, 50);
    this.interactableBox.setCollideWorldBounds(true);
  }

  private configureKeyboardControl() {
    this.cursors = this.input.keyboard!.addKeys({
      player_walk_left: 'A',
      player_walk_right: 'D',
      player_jump: 'SPACE',
      player_shoot: 'E',
    });

    // Set up input events for shooting
    this.input.keyboard!.on('keydown-E', () => {
      if (this.canShoot && !this.isShooting) {
        this.isShooting = true; // Set shooting state to true
        this.shoot(); // Call the shoot function
      }
    });

    this.input.keyboard!.on('keyup-E', () => {
      this.isShooting = false; // Reset shooting state on key release
    });
  }

  private playerAnimationConfig() {
    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('player', { start: 2, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('player', { start: 2, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });

    // Idle animation when no key is pressed
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 5 }),
      frameRate: 4,
    });

    this.anims.create({
      key: 'shoot',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 6 }),
      frameRate: 5,
    });

    this.player.play('idle');
  }

  private playerMovementControl() {
    const speed = 160;

    // Horizontal movement
    if (
      this.cursors.player_walk_left.isDown &&
      this.cursors.player_walk_right.isDown
    ) {
      this.player.setVelocityX(0);
      this.player.anims.play('idle', true);
    } else if (this.cursors.player_walk_left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.flipX = true;
      this.player.anims.play('walk-left', true);
    } else if (this.cursors.player_walk_right.isDown) {
      this.player.setVelocityX(speed);
      this.player.flipX = false;
      this.player.anims.play('walk-right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('idle', true);
    }

    if (this.player.body!.blocked.down) {
      if (this.cursors.player_jump.isDown) {
        this.player.anims.play('jump', true);
        this.player.setVelocityY(-300); // Adjust jump height as needed
      }

      if (this.player.body!.velocity.equals(new Phaser.Math.Vector2(0, 0))) {
        this.player.anims.play('idle', true);
      }
    } else {
      this.player.anims.play('jump', true);
    }

    // Update bullets
    this.updateBullets();
  }

  private shoot() {
    let bullets = this.bullets.get();

    bullets.setTexture('shoot');

    if (bullets.getLength() < bullets.maxSize) {
      const bullet = bullets.get();

      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(this.player.x, this.player.y);
        bullet.body.setVelocityX(this.player.flipX ? -400 : 400); // Change direction based on player facing
        bullet.body.allowGravity = false; // Disable gravity for bullets

        // Set the cooldown
        this.canShoot = false;
        this.time.delayedCall(this.shootCooldownTime, () => {
          this.canShoot = true; // Allow shooting again after cooldown
        });

        this.player.anims.play('shoot', true); // Play shoot animation
      }
    }
  }

  private updateBullets() {
    this.bullets.children.iterate((bullet: any) => {
      if (
        bullet.active &&
        (bullet.x < 0 || bullet.x > this.game.config.width)
      ) {
        bullet.setActive(false);
        bullet.setVisible(false);
        return false;
      }
      return true;
    });
  }

  private showModal(
    playerObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Tilemaps.Tile,
    boxObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Tilemaps.Tile
  ) {
    // Show the modal
    if (this.modal) {
      this.modal.style.display = 'block';
    }

    // Hide the modal when the 'x' button is clicked
    this.closeBtn?.addEventListener('click', () => {
      this.modal!.style.display = 'none';
    });

    // Hide the modal when clicking outside of the modal content
    window.onclick = (event: any) => {
      if (event.target == this.modal) {
        this.modal!.style.display = 'none';
      }
    };
  }
}
