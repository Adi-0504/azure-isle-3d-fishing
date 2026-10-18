import * as THREE from 'three';
import { CreatureData, getCreaturesForConditions } from '../../data/fish/CreatureDatabase';
import { PlayerModel } from '../player/PlayerModel';
import { WaterSystem } from '../world/WaterSystem';
import { IslandTerrain } from '../world/IslandTerrain';
import { WeatherTimeSystem } from '../world/WeatherTimeSystem';
import { soundSynth } from '../audio/SoundSynthesizer';
import { ITEMS_DATABASE } from '../../data/items/ItemsDatabase';

export type FishingState = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'caught';

export interface CatchResult {
  creature: CreatureData;
  sizeCm: number;
  price: number;
  isNewDiscovery: boolean;
  isPerfectTiming?: boolean;
}

export class FishingSystem {
  public state: FishingState = 'idle';
  private bobberPos = new THREE.Vector3();
  private waitTimer = 0;
  private biteWindowTimer = 0;
  private currentNibbleTime = 0;
  private alertBillboard: THREE.Sprite;

  public onCatchSuccessCallback: ((result: CatchResult) => void) | null = null;
  public onCatchEscapeCallback: (() => void) | null = null;

  constructor(scene: THREE.Scene) {
    // Exclamation mark "!" billboard above character
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FF3366';
    ctx.beginPath();
    ctx.arc(64, 64, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 75px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    this.alertBillboard = new THREE.Sprite(spriteMat);
    this.alertBillboard.scale.set(1.4, 1.4, 1.4);
    this.alertBillboard.visible = false;
    scene.add(this.alertBillboard);
  }

  public canFishHere(playerPos: THREE.Vector3, terrain: IslandTerrain): boolean {
    return terrain.isNearWater(playerPos.x, playerPos.z);
  }

  public startCast(
    playerModel: PlayerModel,
    playerYaw: number,
    waterSystem: WaterSystem
  ) {
    if (this.state !== 'idle') return;

    this.state = 'casting';
    playerModel.animState = 'cast';
    soundSynth.playCastRod();

    // Calculate bobber target landing spot in front of player
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
    const castDistance = 7.5;
    this.bobberPos.copy(playerModel.group.position).add(forward.multiplyScalar(castDistance));
    this.bobberPos.y = 0.45; // Water surface height

    // Animation transition to waiting
    setTimeout(() => {
      if (this.state !== 'casting') return;
      this.state = 'waiting';
      playerModel.animState = 'idle';
      playerModel.setFishingLine(this.bobberPos);
      waterSystem.spawnRipple(this.bobberPos, 1.8);
      soundSynth.playWaterPlop();

      // Trigger fish shadow swimming to bait
      waterSystem.triggerFishShadow(this.bobberPos);

      // Random wait time before bite (3.5 to 7.0 seconds)
      this.waitTimer = 3.2 + Math.random() * 3.5;
      this.currentNibbleTime = this.waitTimer * 0.6; // subtle twitch before full bite
    }, 450);
  }

  public reelIn(
    playerModel: PlayerModel,
    waterSystem: WaterSystem,
    terrain: IslandTerrain,
    weatherTime: WeatherTimeSystem,
    equippedRodId: string,
    equippedBaitId: string | null
  ) {
    if (this.state === 'waiting') {
      // Early reel - missed
      this.reset(playerModel, waterSystem);
      return;
    }

    if (this.state === 'bite') {
      // Hit on time!
      // Check timing accuracy: sweet spot between 0.7s and 1.9s remaining
      const isPerfect = (this.biteWindowTimer >= 0.7 && this.biteWindowTimer <= 1.9);

      this.state = 'reeling';
      playerModel.animState = 'reel';
      soundSynth.playReelClick();
      waterSystem.spawnRipple(this.bobberPos, isPerfect ? 3.5 : 2.5);

      setTimeout(() => {
        this.resolveCatch(playerModel, waterSystem, terrain, weatherTime, equippedRodId, equippedBaitId, isPerfect);
      }, 700);
    }
  }

  private resolveCatch(
    playerModel: PlayerModel,
    waterSystem: WaterSystem,
    terrain: IslandTerrain,
    weatherTime: WeatherTimeSystem,
    equippedRodId: string,
    equippedBaitId: string | null,
    isPerfectTiming: boolean = false
  ) {
    this.state = 'caught';
    this.alertBillboard.visible = false;
    playerModel.animState = 'cheer';
    soundSynth.playCatchSuccess();

    // Determine creature
    const biome = terrain.getBiomeAt(this.bobberPos.x, this.bobberPos.z);
    const rodData = ITEMS_DATABASE[equippedRodId];
    const rodTier = rodData?.tier || 1;
    const isNight = weatherTime.isNight();

    let candidates = getCreaturesForConditions(biome, weatherTime.season, weatherTime.weather, isNight, rodTier);
    if (candidates.length === 0) {
      // Fallback creature from database
      candidates = getCreaturesForConditions(biome, weatherTime.season, weatherTime.weather, isNight, 1);
    }
    if (candidates.length === 0) {
      candidates = [
        getCreaturesForConditions('stream', 'spring', 'sunny', false, 1)[0]
      ];
    }

    // Pick creature with bait influence
    let chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (equippedBaitId === 'bait_master' && candidates.some(c => c.rarity >= 4)) {
      const rareList = candidates.filter(c => c.rarity >= 3);
      if (rareList.length > 0) chosen = rareList[Math.floor(Math.random() * rareList.length)];
    }

    // Roll size (Perfect timing gives +15% length bonus!)
    const sizeRange = chosen.maxSize - chosen.minSize;
    let sizeCm = Math.round((chosen.minSize + Math.random() * sizeRange) * 10) / 10;
    if (isPerfectTiming) {
      sizeCm = Math.round(Math.min(chosen.maxSize * 1.15, sizeCm * 1.15) * 10) / 10;
    }

    // Value calculation (+25% bonus for perfect catch)
    let price = Math.round(chosen.basePrice * (sizeCm / chosen.minSize));
    if (isPerfectTiming) {
      price = Math.round(price * 1.25);
    }

    const result: CatchResult = {
      creature: chosen,
      sizeCm,
      price,
      isNewDiscovery: false,
      isPerfectTiming
    };

    if (this.onCatchSuccessCallback) {
      this.onCatchSuccessCallback(result);
    }
  }

  public reset(playerModel: PlayerModel, waterSystem: WaterSystem) {
    this.state = 'idle';
    this.alertBillboard.visible = false;
    playerModel.animState = 'idle';
    playerModel.setFishingLine(null);
    waterSystem.hideFishShadow();
  }

  public update(
    dt: number,
    playerModel: PlayerModel,
    waterSystem: WaterSystem
  ) {
    if (this.state === 'waiting') {
      this.waitTimer -= dt;
      this.currentNibbleTime -= dt;

      // Subtle nibble ripple before full bite
      if (this.currentNibbleTime <= 0 && this.currentNibbleTime > -0.5) {
        waterSystem.spawnRipple(this.bobberPos, 0.8);
        this.currentNibbleTime = -999;
      }

      if (this.waitTimer <= 0) {
        // Trigger Bite Alert!
        this.state = 'bite';
        this.biteWindowTimer = 2.4; // Generous arcade timing window
        this.alertBillboard.position.copy(playerModel.group.position).add(new THREE.Vector3(0, 2.8, 0));
        this.alertBillboard.visible = true;

        soundSynth.playBiteAlert();
        soundSynth.playWaterPlop();
        waterSystem.spawnRipple(this.bobberPos, 2.2);
      }
    } else if (this.state === 'bite') {
      this.biteWindowTimer -= dt;
      // Gentle bobber dip vibration
      this.bobberPos.y = 0.38 + Math.sin(Date.now() * 0.03) * 0.08;
      playerModel.setFishingLine(this.bobberPos);

      if (this.biteWindowTimer <= 0) {
        // Fish got away!
        this.reset(playerModel, waterSystem);
        if (this.onCatchEscapeCallback) {
          this.onCatchEscapeCallback();
        }
      }
    }
  }
}
