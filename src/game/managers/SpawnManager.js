import Phaser from 'phaser';
import { MONSTER_SPAWNS, MonsterState, RESOURCE_COLORS, ResourceType } from '../data.js';

const ITEM_TEXTURES = {
  [ResourceType.WOOD]: 'tinyswords.resources.wood-item',
  [ResourceType.GOLD]: 'tinyswords.resources.gold-item',
  [ResourceType.MEAT]: 'tinyswords.resources.meat-item',
  [ResourceType.TOOLS]: 'tinyswords.resources.tools-item'
};

export class SpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.monsters = [];
    this.droppedItems = [];
    this.lastStationLockAt = 0;
  }

  spawnMonster() {
    const spawnPoint = Phaser.Utils.Array.GetRandom(MONSTER_SPAWNS);
    const isWarrior = Math.random() > 0.45;
    const sprite = this.scene.physics.add.sprite(
      spawnPoint.x,
      spawnPoint.y,
      isWarrior ? 'tinyswords.units.red.warrior.idle' : 'tinyswords.units.black.lancer.idle',
      0
    );
    sprite.setScale(0.56);
    sprite.setDepth(8);
    sprite.setCollideWorldBounds(true);
    sprite.body.setCircle(28, 68, 112);
    sprite.anims.play(isWarrior ? 'monster-run-warrior' : 'monster-run-lancer');

    const monster = {
      id: Phaser.Utils.String.UUID(),
      sprite,
      state: MonsterState.SPAWNING,
      speed: 150 + Math.random() * 35,
      kind: isWarrior ? 'warrior' : 'lancer',
      stunUntil: 0,
      despawnAt: 0,
      nextHarassAt: 0
    };

    sprite.setTint(0xffb68a);
    this.scene.time.delayedCall(400, () => {
      if (monster.sprite.active) {
        monster.state = MonsterState.HARASSING;
        monster.sprite.clearTint();
      }
    });

    this.monsters.push(monster);
    return monster;
  }

  createDroppedItem(resourceType, x, y) {
    const sprite = this.scene.add.image(x, y, ITEM_TEXTURES[resourceType]);
    sprite.setScale(0.7);
    sprite.setDepth(7);

    const marker = this.scene.add.circle(x, y + 4, 20, RESOURCE_COLORS[resourceType], 0.35);
    marker.setDepth(6);

    const item = {
      id: Phaser.Utils.String.UUID(),
      resourceType,
      x,
      y,
      sprite,
      marker,
      active: true
    };

    this.droppedItems.push(item);
    return item;
  }

  removeDroppedItem(itemId) {
    const item = this.droppedItems.find((candidate) => candidate.id === itemId);
    if (!item) {
      return;
    }

    item.active = false;
    item.sprite.destroy();
    item.marker.destroy();
    this.droppedItems = this.droppedItems.filter((candidate) => candidate.id !== itemId);
  }

  tryStunNearestMonster(source, radius) {
    let target = null;
    let bestDistance = radius;

    this.monsters.forEach((monster) => {
      if (monster.state === MonsterState.DESPAWNING) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(source.x, source.y, monster.sprite.x, monster.sprite.y);
      if (distance < bestDistance) {
        target = monster;
        bestDistance = distance;
      }
    });

    if (!target) {
      return false;
    }

    target.state = MonsterState.STUNNED;
    target.stunUntil = this.scene.time.now + 2400;
    target.despawnAt = target.stunUntil + 900;
    target.sprite.setVelocity(0, 0);
    target.sprite.setTint(0x8fd2ff);
    target.sprite.setAlpha(0.92);
    return true;
  }

  update(time) {
    this.updateDroppedItems();
    this.updateMonsters(time);
  }

  updateDroppedItems() {
    this.droppedItems.forEach((item, index) => {
      if (!item.active) {
        return;
      }
      const bob = Math.sin((this.scene.time.now / 250) + index) * 4;
      item.sprite.setY(item.y + bob);
      item.marker.setY(item.y + 4 + (bob * 0.25));
    });
  }

  updateMonsters(time) {
    this.monsters.forEach((monster) => {
      if (!monster.sprite.active) {
        return;
      }

      if (monster.state === MonsterState.STUNNED && time >= monster.despawnAt) {
        monster.state = MonsterState.DESPAWNING;
      }

      if (monster.state === MonsterState.DESPAWNING) {
        monster.sprite.setVelocity(0, 0);
        monster.sprite.setAlpha(Math.max(0, monster.sprite.alpha - 0.03));
        if (monster.sprite.alpha <= 0.04) {
          monster.sprite.destroy();
        }
        return;
      }

      if (monster.state !== MonsterState.HARASSING) {
        return;
      }

      const targetItem = this.getClosestDroppedItem(monster.sprite);
      const targetX = targetItem?.x ?? this.scene.player.x;
      const targetY = targetItem?.y ?? this.scene.player.y;
      this.scene.physics.moveTo(monster.sprite, targetX, targetY, monster.speed);

      if (targetItem && Phaser.Math.Distance.Between(monster.sprite.x, monster.sprite.y, targetItem.x, targetItem.y) < 36) {
        this.removeDroppedItem(targetItem.id);
        monster.state = MonsterState.DESPAWNING;
        return;
      }

      if (Phaser.Math.Distance.Between(monster.sprite.x, monster.sprite.y, this.scene.player.x, this.scene.player.y) < 52 && time >= monster.nextHarassAt) {
        monster.nextHarassAt = time + 1800;
        this.harassPlayer(monster);
      }
    });

    this.monsters = this.monsters.filter((monster) => monster.sprite.active);
  }

  harassPlayer(monster) {
    const dx = this.scene.player.x - monster.sprite.x;
    const dy = this.scene.player.y - monster.sprite.y;
    const vector = new Phaser.Math.Vector2(dx, dy).normalize().scale(260);
    this.scene.player.body.velocity.add(vector);
    this.scene.showToast('Un monstre seme le chaos !', 1400);

    if (this.scene.carriedItem) {
      this.scene.dropCarriedItem();
    }

    if (this.scene.time.now - this.lastStationLockAt > 1200) {
      this.lastStationLockAt = this.scene.time.now;
      this.scene.blockNearestStation(monster.sprite.x, monster.sprite.y);
    }
  }

  getClosestDroppedItem(sprite) {
    let best = null;
    let bestDistance = 9999;

    this.droppedItems.forEach((item) => {
      if (!item.active) {
        return;
      }
      const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, item.x, item.y);
      if (distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    });

    return best;
  }
}
