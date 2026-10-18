import * as THREE from 'three';
import { SaveManager, GameSaveData, PlayerCustomization } from './save/SaveManager';
import { UIManager } from './ui/UIManager';
import { IslandTerrain } from './world/IslandTerrain';
import { WaterSystem } from './world/WaterSystem';
import { WeatherTimeSystem } from './world/WeatherTimeSystem';
import { BuildingManager } from './building/BuildingManager';
import { PlayerModel } from './player/PlayerModel';
import { PlayerController } from './player/PlayerController';
import { FishingSystem, CatchResult } from './fishing/FishingSystem';
import { soundSynth } from './audio/SoundSynthesizer';
import { ITEMS_DATABASE } from '../data/items/ItemsDatabase';
import { QUESTS_DATABASE } from '../data/quests/QuestsDatabase';
import { setLanguage, t } from '../data/localization/i18n';

class GameEngine {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  // Subsystems
  private saveManager = SaveManager.getInstance();
  private uiManager!: UIManager;
  private terrain!: IslandTerrain;
  private waterSystem!: WaterSystem;
  private weatherTime!: WeatherTimeSystem;
  private buildingManager!: BuildingManager;
  private playerModel!: PlayerModel;
  private playerController!: PlayerController;
  private fishingSystem!: FishingSystem;

  // Game Progress State
  public currentSave!: GameSaveData;
  public gameState: 'MAIN_MENU' | 'INTRO_TOUR' | 'PLAYING' = 'MAIN_MENU';

  // Tour Camera parameters
  private tourTimer = 0;
  private clock = new THREE.Clock();

  constructor() {
    this.initGraphics();
    this.initSubsystems();
    this.setupTouchControls();
    this.setupUIHandlers();

    // Start with Menu
    const hasSave = this.saveManager.hasSave();
    this.uiManager.showMainMenu(hasSave);

    this.startLoop();
  }

  private initGraphics() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbde0fe);
    this.scene.fog = new THREE.FogExp2(0xbde0fe, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    const container = document.getElementById('canvas-container') || document.body;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private initSubsystems() {
    // 1. Terrain & Nature
    this.terrain = new IslandTerrain();
    this.scene.add(this.terrain.group);

    // 2. Water System
    this.waterSystem = new WaterSystem();
    this.scene.add(this.waterSystem.group);

    // 3. Buildings & Camp
    this.buildingManager = new BuildingManager();
    this.scene.add(this.buildingManager.group);

    // 4. Default Save & Weather
    this.currentSave = this.saveManager.createDefaultSave();
    this.weatherTime = new WeatherTimeSystem(
      this.currentSave.timeOfDayMinutes,
      this.currentSave.season,
      this.currentSave.weather
    );
    this.scene.add(this.weatherTime.sunLight, this.weatherTime.hemiLight);
    if (this.weatherTime.rainParticles) {
      this.scene.add(this.weatherTime.rainParticles);
    }

    // 5. Player Model & Controller
    this.playerModel = new PlayerModel(this.currentSave.customization);
    this.scene.add(this.playerModel.group);

    this.playerController = new PlayerController(this.playerModel, this.camera, this.terrain);

    // 6. Fishing System
    this.fishingSystem = new FishingSystem(this.scene);

    // 7. UI Manager
    this.uiManager = new UIManager(this.saveManager);
  }

  private setupUIHandlers() {
    // New game trigger
    this.uiManager.onStartNewGame = (customization: PlayerCustomization, lang) => {
      soundSynth.init();
      setLanguage(lang);
      this.currentSave = this.saveManager.createDefaultSave(customization.name, customization.origin);
      this.currentSave.customization = customization;
      this.currentSave.language = lang;

      this.playerModel.updateCustomization(customization);
      this.buildingManager.setCabinTier(this.currentSave.cabinTier);

      // Start Scenic Island Cinematic Tour
      this.startIntroTour();
    };

    // Continue game trigger
    this.uiManager.onContinueGame = (save: GameSaveData) => {
      soundSynth.init();
      this.currentSave = save;
      setLanguage(save.language);
      this.playerModel.updateCustomization(save.customization);
      this.playerController.position.set(save.playerPos.x, save.playerPos.y, save.playerPos.z);
      this.playerController.yaw = save.playerYaw;
      this.weatherTime.timeOfDayMinutes = save.timeOfDayMinutes;
      this.weatherTime.setSeason(save.season);
      this.weatherTime.setWeather(save.weather);
      this.terrain.updateSeason(save.season);
      this.buildingManager.setCabinTier(save.cabinTier);
      this.buildingManager.setHomeAquariumCreatures(save.homeAquariumCreatures);
      this.buildingManager.museumDonatedCreatures = save.museumDonatedCreatures;
      this.buildingManager.upgradeMuseumTier(save.museumTier);

      this.gameState = 'PLAYING';
    };

    // Catch success flow
    this.fishingSystem.onCatchSuccessCallback = (result: CatchResult) => {
      // Register in catalog
      let record = this.currentSave.catalog[result.creature.id];
      if (!record) {
        record = {
          discovered: true,
          caughtCount: 0,
          maxSizeCm: 0,
          firstCaughtTimestamp: Date.now()
        };
        this.currentSave.catalog[result.creature.id] = record;
      }
      record.caughtCount++;
      record.maxSizeCm = Math.max(record.maxSizeCm, result.sizeCm);

      // Progress relevant quests
      this.advanceQuestProgress('catch_count', 1);
      this.advanceQuestProgress('catch_species', 1, result.creature.id);

      // Show catch resolution modal
      this.uiManager.showCatchModal(
        result,
        // On Keep
        () => {
          if (this.currentSave.inventory.length < this.currentSave.maxBagSlots) {
            this.currentSave.inventory.push({
              itemId: result.creature.id,
              quantity: 1,
              size: result.sizeCm,
              rarity: result.creature.rarity
            });
          } else {
            alert(t('backpackFull'));
            this.currentSave.coins += result.price;
          }
          this.fishingSystem.reset(this.playerModel, this.waterSystem);
          this.autoSave();
        },
        // On Sell
        () => {
          this.currentSave.coins += result.price;
          this.fishingSystem.reset(this.playerModel, this.waterSystem);
          this.autoSave();
        }
      );
    };

    // Catch escape callback
    this.fishingSystem.onCatchEscapeCallback = () => {
      this.fishingSystem.reset(this.playerModel, this.waterSystem);
    };

    // Bag & Equipment
    this.uiManager.onEquipRod = (rodId: string) => {
      this.currentSave.equippedRodId = rodId;
    };
    this.uiManager.onEquipBait = (baitId: string | null) => {
      this.currentSave.equippedBaitId = baitId;
    };
    this.uiManager.onSellItem = (slotIdx: number) => {
      const slot = this.currentSave.inventory[slotIdx];
      if (slot) {
        const c = ITEMS_DATABASE[slot.itemId] || { price: 30 };
        this.currentSave.coins += c.price * slot.quantity;
        this.currentSave.inventory.splice(slotIdx, 1);
        soundSynth.playCoinsChime();
        this.autoSave();
      }
    };

    // Shop buy handler
    this.uiManager.onBuyItem = (itemId: string) => {
      const item = ITEMS_DATABASE[itemId];
      if (!item || this.currentSave.coins < item.price) return;

      this.currentSave.coins -= item.price;

      if (item.type === 'rod') {
        this.currentSave.equippedRodId = item.id;
        this.advanceQuestProgress('upgrade_gear', 1);
      } else if (item.type === 'bait') {
        this.currentSave.inventory.push({ itemId: item.id, quantity: 5 });
        this.currentSave.equippedBaitId = item.id;
      } else if (item.id === 'bag_upgrade_1') {
        this.currentSave.maxBagSlots = 20;
      } else if (item.id === 'bag_upgrade_2') {
        this.currentSave.maxBagSlots = 30;
      } else if (item.id === 'cabin_blueprint') {
        this.currentSave.cabinTier = 1;
        this.buildingManager.setCabinTier(1);
        this.advanceQuestProgress('build_cabin', 1);
      } else if (item.id === 'cabin_extension') {
        this.currentSave.cabinTier = 2;
        this.buildingManager.setCabinTier(2);
      } else if (item.id === 'home_aquarium') {
        // Automatically put first caught fish into home aquarium if available
        const firstFish = Object.keys(this.currentSave.catalog)[0];
        if (firstFish) {
          this.currentSave.homeAquariumCreatures = [firstFish];
          this.buildingManager.setHomeAquariumCreatures([firstFish]);
        }
      } else if (item.id === 'museum_tier_1') {
        this.currentSave.museumTier = 1;
        this.buildingManager.upgradeMuseumTier(1);
      } else if (item.id === 'museum_tier_2') {
        this.currentSave.museumTier = 2;
        this.buildingManager.upgradeMuseumTier(2);
      } else if (item.id === 'museum_tier_3') {
        this.currentSave.museumTier = 3;
        this.buildingManager.upgradeMuseumTier(3);
      }

      this.autoSave();
    };

    // Quest claim handler
    this.uiManager.onClaimQuest = (questId: string) => {
      const q = QUESTS_DATABASE.find(item => item.id === questId);
      if (q && !this.currentSave.completedQuests.includes(questId)) {
        this.currentSave.coins += q.rewardCoins;
        if (q.rewardItem) {
          this.currentSave.inventory.push({ itemId: q.rewardItem, quantity: 3 });
        }
        this.currentSave.completedQuests.push(questId);
        this.autoSave();
      }
    };

    // Manual Save
    this.uiManager.onSaveGame = () => {
      this.syncSaveState();
      this.saveManager.saveToStorage(this.currentSave);
    };

    // Keyboard shortcut listeners (B: bag, C: catalog, Q: quests, Space: action, E: interact, Esc: settings)
    window.addEventListener('keydown', (e) => {
      if (this.gameState !== 'PLAYING') return;

      if (e.code === 'KeyB') {
        soundSynth.playButtonClick();
        this.uiManager.showBackpack(
          this.currentSave.inventory,
          this.currentSave.maxBagSlots,
          this.currentSave.equippedRodId,
          this.currentSave.equippedBaitId
        );
      } else if (e.code === 'KeyC') {
        soundSynth.playButtonClick();
        this.uiManager.showCatalog(this.currentSave.catalog);
      } else if (e.code === 'KeyQ') {
        soundSynth.playButtonClick();
        this.uiManager.showQuestBoard(this.currentSave.activeQuests, this.currentSave.completedQuests);
      } else if (e.code === 'Escape') {
        soundSynth.playButtonClick();
        this.uiManager.showSettingsModal();
      } else if (e.code === 'Space') {
        this.handleActionTrigger();
      } else if (e.code === 'KeyE') {
        this.handleInteractTrigger();
      }
    });
  }

  private setupTouchControls() {
    // Virtual Joystick on iPad / Touch
    const zone = document.getElementById('virtual-joystick-zone');
    const knob = document.getElementById('joystick-knob');
    if (zone && knob) {
      let isTracking = false;
      let startX = 0;
      let startY = 0;
      const maxRadius = 45;

      zone.addEventListener('pointerdown', (e) => {
        isTracking = true;
        startX = e.clientX;
        startY = e.clientY;
        zone.setPointerCapture(e.pointerId);
      });

      zone.addEventListener('pointermove', (e) => {
        if (!isTracking) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const clampedDist = Math.min(dist, maxRadius);

        const nx = Math.cos(angle) * clampedDist;
        const ny = Math.sin(angle) * clampedDist;

        knob.style.transform = `translate(${nx}px, ${ny}px)`;

        // In Three.js screen space: dy > 0 is pulling backward (moveZ = -1), dy < 0 is pushing forward (moveZ = 1)
        this.playerController.setVirtualJoystick(nx / maxRadius, -ny / maxRadius);
      });

      const resetKnob = () => {
        isTracking = false;
        knob.style.transform = 'translate(0px, 0px)';
        this.playerController.setVirtualJoystick(0, 0);
      };

      zone.addEventListener('pointerup', resetKnob);
      zone.addEventListener('pointercancel', resetKnob);
    }

    // Touch Action Cluster
    const btnAction = document.getElementById('btn-touch-action');
    if (btnAction) {
      btnAction.addEventListener('pointerdown', () => this.handleActionTrigger());
    }

    const btnInteract = document.getElementById('btn-touch-interact');
    if (btnInteract) {
      btnInteract.addEventListener('pointerdown', () => this.handleInteractTrigger());
    }

    const btnSprint = document.getElementById('btn-touch-sprint');
    if (btnSprint) {
      let sprintActive = false;
      btnSprint.addEventListener('pointerdown', () => {
        sprintActive = !sprintActive;
        this.playerController.input.isSprinting = sprintActive;
        btnSprint.classList.toggle('active', sprintActive);
      });
    }

    const btnBag = document.getElementById('btn-touch-bag');
    if (btnBag) {
      btnBag.addEventListener('pointerdown', () => {
        soundSynth.playButtonClick();
        this.uiManager.showBackpack(
          this.currentSave.inventory,
          this.currentSave.maxBagSlots,
          this.currentSave.equippedRodId,
          this.currentSave.equippedBaitId
        );
      });
    }

    const btnCatalog = document.getElementById('btn-touch-catalog');
    if (btnCatalog) {
      btnCatalog.addEventListener('pointerdown', () => {
        soundSynth.playButtonClick();
        this.uiManager.showCatalog(this.currentSave.catalog);
      });
    }

    const btnQuest = document.getElementById('btn-touch-quest');
    if (btnQuest) {
      btnQuest.addEventListener('pointerdown', () => {
        soundSynth.playButtonClick();
        this.uiManager.showQuestBoard(this.currentSave.activeQuests, this.currentSave.completedQuests);
      });
    }

    const btnMenu = document.getElementById('btn-touch-menu');
    if (btnMenu) {
      btnMenu.addEventListener('pointerdown', () => {
        soundSynth.playButtonClick();
        this.uiManager.showSettingsModal();
      });
    }
  }

  private handleActionTrigger() {
    if (this.fishingSystem.state === 'idle') {
      if (this.terrain.isNearWater(this.playerController.position.x, this.playerController.position.z)) {
        this.fishingSystem.startCast(this.playerModel, this.playerController.yaw, this.waterSystem);
      }
    } else if (this.fishingSystem.state === 'bite' || this.fishingSystem.state === 'waiting') {
      this.fishingSystem.reelIn(
        this.playerModel,
        this.waterSystem,
        this.terrain,
        this.weatherTime,
        this.currentSave.equippedRodId,
        this.currentSave.equippedBaitId
      );
    }
  }

  private handleInteractTrigger() {
    // Proximity to camp terminals
    const pPos = this.playerController.position;
    for (const term of this.terrain.interactableTerminals) {
      if (pPos.distanceTo(term.pos) < 3.2) {
        soundSynth.playButtonClick();
        if (term.type === 'shop') {
          this.uiManager.showShop(this.currentSave.coins, this.currentSave.maxBagSlots);
        } else if (term.type === 'quest') {
          this.uiManager.showQuestBoard(this.currentSave.activeQuests, this.currentSave.completedQuests);
        }
        return;
      }
    }
  }

  private advanceQuestProgress(type: string, amount: number, speciesId?: string, biomeId?: string) {
    this.currentSave.activeQuests.forEach(aq => {
      const q = QUESTS_DATABASE.find(item => item.id === aq.questId);
      if (!q) return;

      if (q.targetType === type) {
        if (type === 'catch_species') {
          if (q.targetSpeciesId === speciesId) {
            aq.progress = Math.min(q.targetCount, aq.progress + amount);
          }
        } else if (type === 'explore_biome') {
          if (q.targetBiome === biomeId) {
            aq.progress = Math.min(q.targetCount, aq.progress + amount);
          }
        } else {
          aq.progress = Math.min(q.targetCount, aq.progress + amount);
        }
      }
    });
  }

  private startIntroTour() {
    this.gameState = 'INTRO_TOUR';
    this.tourTimer = 0;
  }

  private updateIntroTour(dt: number) {
    this.tourTimer += dt;
    const t = this.tourTimer;

    // Cinematic camera flyover waypoints
    if (t < 3.0) {
      // Waypoint 1: Southern Beach
      this.camera.position.set(0, 12, 60);
      this.camera.lookAt(0, 2, 20);
    } else if (t < 6.0) {
      // Waypoint 2: Northern Cliffs
      this.camera.position.set(0, 24, -45);
      this.camera.lookAt(0, 8, -10);
    } else if (t < 9.0) {
      // Waypoint 3: Highland Lake
      this.camera.position.set(25, 14, 25);
      this.camera.lookAt(25, 4, -5);
    } else {
      // Tour complete, arrive at Camp
      this.gameState = 'PLAYING';
      this.playerController.position.set(0, 1.5, 5);
      this.playerController.cameraYaw = 0;
      this.playerController.cameraPitch = 0.35;
    }
  }

  private syncSaveState() {
    this.currentSave.playerPos = {
      x: this.playerController.position.x,
      y: this.playerController.position.y,
      z: this.playerController.position.z
    };
    this.currentSave.playerYaw = this.playerController.yaw;
    this.currentSave.timeOfDayMinutes = this.weatherTime.timeOfDayMinutes;
    this.currentSave.season = this.weatherTime.season;
    this.currentSave.weather = this.weatherTime.weather;
  }

  private autoSave() {
    this.syncSaveState();
    this.saveManager.saveToStorage(this.currentSave);
  }

  private startLoop() {
    let autoSaveAccumulator = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const timeSec = this.clock.getElapsedTime();

      // Update Environmental Systems
      this.weatherTime.update(dt, this.scene, this.playerController.position);
      this.waterSystem.update(dt, timeSec);

      if (this.gameState === 'MAIN_MENU') {
        // Dynamic Island Menu Camera orbit
        const camDist = 65;
        this.camera.position.set(
          Math.sin(timeSec * 0.12) * camDist,
          25 + Math.sin(timeSec * 0.08) * 5,
          Math.cos(timeSec * 0.12) * camDist
        );
        this.camera.lookAt(0, 4, 0);
      } else if (this.gameState === 'INTRO_TOUR') {
        this.updateIntroTour(dt);
      } else if (this.gameState === 'PLAYING') {
        const canMove = this.fishingSystem.state === 'idle';
        this.playerController.update(dt, canMove);
        this.fishingSystem.update(dt, this.playerModel, this.waterSystem);

        // Track exploration biome
        const curBiome = this.terrain.getBiomeAt(
          this.playerController.position.x,
          this.playerController.position.z
        );
        if (!this.currentSave.unlockedBiomes.includes(curBiome)) {
          this.currentSave.unlockedBiomes.push(curBiome);
          this.advanceQuestProgress('explore_biome', 1, undefined, curBiome);
        }

        // Check water proximity & interaction proximity
        const isNearWater = this.terrain.isNearWater(
          this.playerController.position.x,
          this.playerController.position.z
        );
        let canInteract = false;
        for (const term of this.terrain.interactableTerminals) {
          if (this.playerController.position.distanceTo(term.pos) < 3.2) {
            canInteract = true;
            break;
          }
        }

        // HUD Render
        const rodItem = ITEMS_DATABASE[this.currentSave.equippedRodId];
        const baitItem = this.currentSave.equippedBaitId ? ITEMS_DATABASE[this.currentSave.equippedBaitId] : null;
        const lang = this.currentSave.language;

        this.uiManager.renderHUD(
          this.weatherTime.getFormattedTime(),
          t(this.weatherTime.season),
          t(this.weatherTime.weather === 'sunny' ? 'weatherSunny' : this.weatherTime.weather === 'cloudy' ? 'weatherCloudy' : 'weatherRainy'),
          t(curBiome === 'beach' ? 'southernBeach' : curBiome === 'stream' ? 'forestStream' : curBiome === 'cliffs' ? 'northernCliffs' : curBiome === 'lake' ? 'centralHighlandLake' : curBiome === 'grove' ? 'secretForestGrove' : 'coastalReefs'),
          this.currentSave.coins,
          this.playerController.stamina,
          this.playerController.maxStamina,
          rodItem ? rodItem.names[lang] : '竹製手作釣竿',
          baitItem ? baitItem.names[lang] : null,
          isNearWater,
          canInteract
        );

        // Auto-save every 30 seconds
        autoSaveAccumulator += dt;
        if (autoSaveAccumulator >= 30.0) {
          autoSaveAccumulator = 0;
          this.autoSave();
        }
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
});
