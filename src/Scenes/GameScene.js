import Phaser from 'phaser';
import Player from './Entities/Player';
import GunShip from './Entities/GunShip';

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  preload() {
    this.load.image('sprBg0', 'content/sprBg0.png');
    this.load.image('sprBg1', 'content/sprBg1.png');
    this.load.spritesheet('sprExplosion', 'content/sprExplosion.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('sprEnemy0', 'content/sprEnemy0.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image('sprEnemy1', 'content/sprEnemy1.png');
    this.load.spritesheet('sprEnemy2', 'content/sprEnemy2.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image('sprLaserEnemy0', 'content/sprLaserEnemy0.png');
    this.load.image('sprLaserPlayer', 'content/sprLaserPlayer.png');
    this.load.spritesheet('sprPlayer', 'content/sprPlayer.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.audio('sndExplode0', 'content/sndExplode0.wav');
    this.load.audio('sndExplode1', 'content/sndExplode1.wav');
    this.load.audio('sndLaser', 'content/sndLaser.wav');
  }

  create() {
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enemies = this.add.group();
    this.enemyLasers = this.add.group();
    this.playerLasers = this.add.group();
    this.time.addEvent({
      delay: 1000,
      callback() {
        let enemy = null;

        if (Phaser.Math.Between(0, 10) >= 3) {
          enemy = new GunShip(
            this,
            Phaser.Math.Between(0, this.game.config.width),
            0,
          );
        }
        this.physics.add.collider(this.playerLasers, this.enemies, (playerLaser, enemy) => {
          if (enemy) {
            if (enemy.onDestroy !== undefined) {
              enemy.onDestroy();
            }

            enemy.explode(true);
            playerLaser.destroy();
          }
          this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (!player.getData('isDead')
                && !enemy.getData('isDead')) {
              player.explode(false);
              enemy.explode(true);
            }
          });
          this.physics.add.overlap(this.player, this.enemyLasers, (player, laser) => {
            if (!player.getData('isDead')
                && !laser.getData('isDead')) {
              player.explode(false);
              laser.destroy();
              this.scene.start('GameOver');
            }
          });
        });

        if (enemy !== null) {
          enemy.setScale(Phaser.Math.Between(10, 20) * 0.1);
          this.enemies.add(enemy);
        }
      },
      callbackScope: this,
      loop: true,
    });
    this.anims.create({
      key: 'sprEnemy0',
      frames: this.anims.generateFrameNumbers('sprEnemy0'),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'sprEnemy2',
      frames: this.anims.generateFrameNumbers('sprEnemy2'),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'sprExplosion',
      frames: this.anims.generateFrameNumbers('sprExplosion'),
      frameRate: 20,
      repeat: 0,
    });

    this.anims.create({
      key: 'sprPlayer',
      frames: this.anims.generateFrameNumbers('sprPlayer'),
      frameRate: 20,
      repeat: -1,
    });
    this.sfx = {
      explosions: [
        this.sound.add('sndExplode0'),
        this.sound.add('sndExplode1'),
      ],
      laser: this.sound.add('sndLaser'),
    };
    this.player = new Player(
      this,
      this.game.config.width * 0.5,
      this.game.config.height * 0.9,
      'sprPlayer',
    );
  }

  update() {
    this.player.update();
    if (this.keyA.isDown) {
      this.player.moveLeft();
    } else if (this.keyD.isDown) {
      this.player.moveRight();
    }
    if (this.keySpace.isDown) {
      this.player.setData('isShooting', true);
    } else {
      this.player.setData('timerShootTick', this.player.getData('timerShootDelay') - 1);
      this.player.setData('isShooting', false);
    }
    if (!this.player.getData('isDead')) {
      this.player.update();
      if (this.keyA.isDown) {
        this.player.moveLeft();
      } else if (this.keyD.isDown) {
        this.player.moveRight();
      }

      if (this.keySpace.isDown) {
        this.player.setData('isShooting', true);
      } else {
        this.player.setData('timerShootTick', this.player.getData('timerShootDelay') - 1);
        this.player.setData('isShooting', false);
      }
    }
    for (let i = 0; i < this.enemies.getChildren().length; i += 1) {
      const enemy = this.enemies.getChildren()[i];
      if (enemy.x < -enemy.displayWidth
        || enemy.x > this.game.config.width + enemy.displayWidth
        || enemy.y < -enemy.displayHeight * 4
        || enemy.y > this.game.config.height + enemy.displayHeight) {
        if (enemy) {
          if (enemy.onDestroy !== undefined) {
            enemy.onDestroy();
          }

          enemy.destroy();
        }
      }
      enemy.update();
    }
  }

  getEnemiesByType(type) {
    const arr = [];
    for (let i = 0; i < this.enemies.getChildren().length; i += 1) {
      const enemy = this.enemies.getChildren()[i];
      if (enemy.getData('type') === type) {
        arr.push(enemy);
      }
    }
    return arr;
  }
}