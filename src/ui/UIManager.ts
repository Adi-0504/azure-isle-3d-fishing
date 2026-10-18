import { t, SupportedLanguage, setLanguage, getLanguage, translations } from '../../data/localization/i18n';
import { GameSaveData, PlayerCustomization, SaveManager } from '../save/SaveManager';
import { CREATURE_DATABASE, getCreatureById, CreatureData } from '../../data/fish/CreatureDatabase';
import { ITEMS_DATABASE } from '../../data/items/ItemsDatabase';
import { QUESTS_DATABASE } from '../../data/quests/QuestsDatabase';
import { CatchResult } from '../fishing/FishingSystem';
import { soundSynth } from '../audio/SoundSynthesizer';
import * as THREE from 'three';
import { CreatureModelGenerator } from '../ecology/CreatureModelGenerator';

export class UIManager {
  public rootElement: HTMLElement;
  public saveManager: SaveManager;

  // Active callbacks to main game loop
  public onStartNewGame!: (customization: PlayerCustomization, lang: SupportedLanguage) => void;
  public onContinueGame!: (save: GameSaveData) => void;
  public onEquipRod!: (rodId: string) => void;
  public onEquipBait!: (baitId: string | null) => void;
  public onSellItem!: (slotIndex: number) => void;
  public onBuyItem!: (itemId: string) => void;
  public onClaimQuest!: (questId: string) => void;
  public onSaveGame!: () => void;
  public onActionTrigger!: () => void;
  public onInteractTrigger!: () => void;
  public onSprintToggle!: (sprint: boolean) => void;
  public onJoystickMove!: (x: number, z: number) => void;
  public onTimeSpeedChange!: (speed: number) => void;

  // 3D Preview Mini Renderer for Catch and Catalog
  private previewRenderer!: THREE.WebGLRenderer;
  private previewScene!: THREE.Scene;
  private previewCamera!: THREE.PerspectiveCamera;
  private previewModel: THREE.Group | null = null;
  private previewAnimFrame: number | null = null;

  constructor(saveManager: SaveManager) {
    this.saveManager = saveManager;
    this.rootElement = document.getElementById('ui-container') || document.body;
    this.initPreviewRenderer();
  }

  private initPreviewRenderer() {
    this.previewScene = new THREE.Scene();
    this.previewCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    this.previewCamera.position.set(0, 0, 4.2);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.8);
    light1.position.set(2, 3, 4);
    const light2 = new THREE.AmbientLight(0xffffff, 1.2);
    this.previewScene.add(light1, light2);

    this.previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.previewRenderer.setSize(220, 220);
    this.previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public renderHUD(
    timeStr: string,
    seasonStr: string,
    weatherStr: string,
    biomeName: string,
    coins: number,
    stamina: number,
    maxStamina: number,
    equippedRodName: string,
    equippedBaitName: string | null,
    isNearWater: boolean,
    canInteract: boolean
  ) {
    const hud = document.getElementById('game-hud');
    if (!hud) return;

    const timeElem = document.getElementById('hud-time');
    if (timeElem) timeElem.textContent = timeStr;

    const envElem = document.getElementById('hud-env');
    if (envElem) envElem.textContent = `${seasonStr} • ${weatherStr} • 📍${biomeName}`;

    const coinElem = document.getElementById('hud-coins');
    if (coinElem) coinElem.textContent = `$${coins}`;

    const staminaBar = document.getElementById('hud-stamina-fill');
    if (staminaBar) {
      const pct = (stamina / maxStamina) * 100;
      staminaBar.style.width = `${pct}%`;
      staminaBar.style.backgroundColor = pct < 25 ? '#e63946' : '#2a9d8f';
    }

    const gearElem = document.getElementById('hud-gear');
    if (gearElem) {
      const baitText = equippedBaitName ? ` [${equippedBaitName}]` : '';
      gearElem.textContent = `🎣 ${equippedRodName}${baitText}`;
    }

    const promptElem = document.getElementById('hud-prompt');
    if (promptElem) {
      if (canInteract) {
        promptElem.textContent = `[ E / 點擊 ] ${t('vendingTerminal')}`;
        promptElem.style.display = 'block';
      } else if (isNearWater) {
        promptElem.textContent = `[ 空白鍵 / 拋竿 ] ${t('fishingPrompt')}`;
        promptElem.style.display = 'block';
      } else {
        promptElem.style.display = 'none';
      }
    }
  }

  // --- MODAL DIALOGS ---

  public showMainMenu(hasSave: boolean) {
    this.hideAllModals();
    const modal = document.getElementById('modal-main-menu');
    if (!modal) return;
    modal.style.display = 'flex';

    const btnContinue = document.getElementById('btn-menu-continue') as HTMLButtonElement;
    if (btnContinue) {
      btnContinue.style.display = hasSave ? 'block' : 'none';
      btnContinue.onclick = () => {
        soundSynth.playButtonClick();
        const save = this.saveManager.loadFromStorage();
        if (save && this.onContinueGame) {
          modal.style.display = 'none';
          this.onContinueGame(save);
        }
      };
    }

    const btnNewGame = document.getElementById('btn-menu-new');
    if (btnNewGame) {
      btnNewGame.onclick = () => {
        soundSynth.playButtonClick();
        modal.style.display = 'none';
        this.showIntroWizard();
      };
    }

    const btnLang = document.getElementById('btn-menu-lang');
    if (btnLang) {
      btnLang.onclick = () => {
        soundSynth.playButtonClick();
        this.showLanguagePicker();
      };
    }

    const btnSettings = document.getElementById('btn-menu-settings');
    if (btnSettings) {
      btnSettings.onclick = () => {
        soundSynth.playButtonClick();
        this.showSettingsModal();
      };
    }

    const btnCredits = document.getElementById('btn-menu-credits');
    if (btnCredits) {
      btnCredits.onclick = () => {
        soundSynth.playButtonClick();
        this.showCreditsModal();
      };
    }
  }

  public showIntroWizard() {
    this.hideAllModals();
    const modal = document.getElementById('modal-intro-wizard');
    if (!modal) return;
    modal.style.display = 'flex';

    let selectedOrigin = 'Taiwan';
    let selectedHairStyle: 'spiky' | 'flowing' | 'cap' = 'cap';
    let selectedHairColor = '#4A3728';
    let selectedSkinTone = '#FAD6B8';
    let selectedOutfitColor = '#1E6091';

    // Steps container
    const step1 = document.getElementById('intro-step-1')!;
    const step2 = document.getElementById('intro-step-2')!;
    const step3 = document.getElementById('intro-step-3')!;

    step1.style.display = 'block';
    step2.style.display = 'none';
    step3.style.display = 'none';

    // Step 1: Origin
    const regionSelect = document.getElementById('intro-region-select') as HTMLSelectElement;
    const regionInput = document.getElementById('intro-region-input') as HTMLInputElement;
    const btnNext1 = document.getElementById('btn-intro-next-1')!;

    btnNext1.onclick = () => {
      soundSynth.playButtonClick();
      selectedOrigin = regionInput.value.trim() || regionSelect.value;
      step1.style.display = 'none';
      step2.style.display = 'block';
    };

    // Step 2: Language
    const langSelect = document.getElementById('intro-lang-select') as HTMLSelectElement;
    langSelect.value = getLanguage();
    const btnNext2 = document.getElementById('btn-intro-next-2')!;

    btnNext2.onclick = () => {
      soundSynth.playButtonClick();
      const chosenLang = langSelect.value as SupportedLanguage;
      setLanguage(chosenLang);
      step2.style.display = 'none';
      step3.style.display = 'block';
      this.refreshUITexts();
    };

    // Step 3: Character Creation
    const nameInput = document.getElementById('char-name-input') as HTMLInputElement;
    const hairStyleRadios = document.querySelectorAll('input[name="hairStyle"]') as NodeListOf<HTMLInputElement>;
    const hairColorInput = document.getElementById('hair-color-picker') as HTMLInputElement;
    const skinToneInput = document.getElementById('skin-tone-picker') as HTMLInputElement;
    const outfitColorInput = document.getElementById('outfit-color-picker') as HTMLInputElement;
    const btnStart = document.getElementById('btn-intro-start')!;

    btnStart.onclick = () => {
      soundSynth.playButtonClick();
      const name = nameInput.value.trim() || 'Leo';
      hairStyleRadios.forEach(r => {
        if (r.checked) selectedHairStyle = r.value as 'spiky' | 'flowing' | 'cap';
      });
      selectedHairColor = hairColorInput.value;
      selectedSkinTone = skinToneInput.value;
      selectedOutfitColor = outfitColorInput.value;

      modal.style.display = 'none';

      const customization: PlayerCustomization = {
        name,
        origin: selectedOrigin,
        hairStyle: selectedHairStyle,
        hairColor: selectedHairColor,
        skinTone: selectedSkinTone,
        outfitColor: selectedOutfitColor
      };

      if (this.onStartNewGame) {
        this.onStartNewGame(customization, getLanguage());
      }
    };
  }

  public showCatchModal(
    result: CatchResult,
    onKeep: () => void,
    onSell: () => void
  ) {
    const modal = document.getElementById('modal-catch');
    if (!modal) return;
    modal.style.display = 'flex';

    const lang = getLanguage();
    const nameElem = document.getElementById('catch-name')!;
    const starsElem = document.getElementById('catch-stars')!;
    const sizeElem = document.getElementById('catch-size')!;
    const priceElem = document.getElementById('catch-price')!;
    const descElem = document.getElementById('catch-desc')!;
    const canvasContainer = document.getElementById('catch-3d-canvas')!;

    nameElem.textContent = result.creature.names[lang] || result.creature.names['en'];
    starsElem.textContent = '★'.repeat(result.creature.rarity) + '☆'.repeat(5 - result.creature.rarity);
    sizeElem.textContent = `${result.sizeCm} cm`;
    priceElem.textContent = `$${result.price}`;
    descElem.textContent = result.creature.descriptions[lang] || result.creature.descriptions['en'];

    // Perfect Catch Banner
    let perfectBanner = document.getElementById('catch-perfect-badge');
    if (!perfectBanner) {
      perfectBanner = document.createElement('div');
      perfectBanner.id = 'catch-perfect-badge';
      perfectBanner.className = 'perfect-catch-banner';
      nameElem.parentNode?.insertBefore(perfectBanner, nameElem);
    }
    if (result.isPerfectTiming) {
      perfectBanner.textContent = '⭐ 完美起竿！(PERFECT CATCH) +15% 尺寸 & +25% 價值加成！';
      perfectBanner.style.display = 'block';
    } else {
      perfectBanner.style.display = 'none';
    }

    // Mount 3D Preview
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(this.previewRenderer.domElement);
    this.render3DPreview(result.creature);

    const btnKeep = document.getElementById('btn-catch-keep')!;
    btnKeep.onclick = () => {
      soundSynth.playButtonClick();
      this.stop3DPreview();
      modal.style.display = 'none';
      onKeep();
    };

    const btnSell = document.getElementById('btn-catch-sell')!;
    btnSell.onclick = () => {
      soundSynth.playCoinsChime();
      this.stop3DPreview();
      modal.style.display = 'none';
      onSell();
    };
  }

  public showBackpack(
    slots: { itemId: string; quantity: number; size?: number }[],
    maxSlots: number,
    equippedRodId: string,
    equippedBaitId: string | null
  ) {
    this.hideAllModals();
    const modal = document.getElementById('modal-backpack');
    if (!modal) return;
    modal.style.display = 'flex';

    const lang = getLanguage();
    const capacityElem = document.getElementById('bag-capacity-text')!;
    capacityElem.textContent = `${t('capacity')}: ${slots.length} / ${maxSlots}`;

    const grid = document.getElementById('bag-grid')!;
    grid.innerHTML = '';

    for (let i = 0; i < maxSlots; i++) {
      const slotData = slots[i];
      const slotDiv = document.createElement('div');
      slotDiv.className = `bag-slot ${slotData ? 'filled' : 'empty'}`;

      if (slotData) {
        const creature = getCreatureById(slotData.itemId);
        const item = ITEMS_DATABASE[slotData.itemId];

        let icon = '📦';
        let name = slotData.itemId;
        if (creature) {
          icon = creature.category === 'fish' ? '🐟' : creature.category === 'shrimp' ? '🦐' : creature.category === 'crab' ? '🦀' : '🦪';
          name = `${creature.names[lang]} (${slotData.size}cm)`;
        } else if (item) {
          icon = item.icon;
          name = item.names[lang];
        }

        const isEquipped = slotData.itemId === equippedRodId || slotData.itemId === equippedBaitId;

        slotDiv.innerHTML = `
          <div class="slot-icon">${icon}</div>
          <div class="slot-name">${name}</div>
          ${slotData.quantity > 1 ? `<span class="slot-qty">x${slotData.quantity}</span>` : ''}
          ${isEquipped ? `<span class="slot-tag">E</span>` : ''}
        `;

        slotDiv.onclick = () => {
          soundSynth.playButtonClick();
          this.showItemActionMenu(slotData, i, () => {
            modal.style.display = 'none';
          });
        };
      }
      grid.appendChild(slotDiv);
    }
  }

  private showItemActionMenu(
    slot: { itemId: string; quantity: number },
    index: number,
    closeBag: () => void
  ) {
    const creature = getCreatureById(slot.itemId);
    const item = ITEMS_DATABASE[slot.itemId];

    if (creature) {
      if (confirm(`${t('sell')}: $${creature.basePrice}?`)) {
        if (this.onSellItem) this.onSellItem(index);
        closeBag();
      }
    } else if (item) {
      if (item.type === 'rod') {
        if (this.onEquipRod) this.onEquipRod(item.id);
        closeBag();
      } else if (item.type === 'bait') {
        if (this.onEquipBait) this.onEquipBait(item.id);
        closeBag();
      }
    }
  }

  public showCatalog(catalogRecord: Record<string, { discovered: boolean; caughtCount: number; maxSizeCm: number }>) {
    this.hideAllModals();
    const modal = document.getElementById('modal-catalog');
    if (!modal) return;
    modal.style.display = 'flex';

    const lang = getLanguage();
    const listContainer = document.getElementById('catalog-list')!;
    listContainer.innerHTML = '';

    CREATURE_DATABASE.forEach(data => {
      const rec = catalogRecord[data.id];
      const isKnown = rec && rec.discovered;

      const card = document.createElement('div');
      card.className = `catalog-card ${isKnown ? 'discovered' : 'undiscovered'}`;

      if (isKnown) {
        card.innerHTML = `
          <div class="card-header">
            <span class="card-name">${data.names[lang]}</span>
            <span class="card-stars">${'★'.repeat(data.rarity)}</span>
          </div>
          <div class="card-stats">
            <div>${t('coins')}: $${data.basePrice}</div>
            <div>Max: ${rec.maxSizeCm} cm</div>
            <div>Count: ${rec.caughtCount}</div>
          </div>
          <div class="card-desc">${data.descriptions[lang]}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="card-header">
            <span class="card-name">???</span>
            <span class="card-stars">?????</span>
          </div>
          <div class="card-desc">探索島嶼解鎖此生物資料...</div>
        `;
      }
      listContainer.appendChild(card);
    });
  }

  public showShop(coins: number, maxBagSlots: number) {
    this.hideAllModals();
    const modal = document.getElementById('modal-shop');
    if (!modal) return;
    modal.style.display = 'flex';

    const lang = getLanguage();
    const coinElem = document.getElementById('shop-coins-text')!;
    coinElem.textContent = `${t('coins')}: $${coins}`;

    const itemsGrid = document.getElementById('shop-items-grid')!;
    itemsGrid.innerHTML = '';

    Object.values(ITEMS_DATABASE).forEach(item => {
      if (item.price === 0) return; // starting gear not for sale
      const itemCard = document.createElement('div');
      itemCard.className = 'shop-card';
      itemCard.innerHTML = `
        <div class="shop-card-icon">${item.icon}</div>
        <div class="shop-card-title">${item.names[lang]}</div>
        <div class="shop-card-desc">${item.description[lang]}</div>
        <div class="shop-card-footer">
          <span class="shop-price">$${item.price}</span>
          <button class="btn-buy ${coins < item.price ? 'disabled' : ''}">${t('buy')}</button>
        </div>
      `;

      const buyBtn = itemCard.querySelector('.btn-buy') as HTMLButtonElement;
      buyBtn.onclick = () => {
        if (coins >= item.price && this.onBuyItem) {
          soundSynth.playCoinsChime();
          this.onBuyItem(item.id);
          modal.style.display = 'none';
        } else {
          soundSynth.playButtonClick();
        }
      };

      itemsGrid.appendChild(itemCard);
    });
  }

  public showQuestBoard(activeQuests: { questId: string; progress: number }[], completedQuests: string[]) {
    this.hideAllModals();
    const modal = document.getElementById('modal-quests');
    if (!modal) return;
    modal.style.display = 'flex';

    const lang = getLanguage();
    const list = document.getElementById('quests-list')!;
    list.innerHTML = '';

    QUESTS_DATABASE.forEach(q => {
      const active = activeQuests.find(a => a.questId === q.id);
      const isCompleted = completedQuests.includes(q.id);

      const qCard = document.createElement('div');
      qCard.className = `quest-card ${isCompleted ? 'completed' : active ? 'active' : 'locked'}`;

      const curProg = active ? active.progress : isCompleted ? q.targetCount : 0;
      const isReadyToClaim = active && curProg >= q.targetCount && !isCompleted;

      qCard.innerHTML = `
        <div class="quest-title">${q.title[lang]}</div>
        <div class="quest-desc">${q.description[lang]}</div>
        <div class="quest-prog-bar">
          <div class="quest-prog-fill" style="width: ${(curProg / q.targetCount) * 100}%"></div>
        </div>
        <div class="quest-footer">
          <span>進度: ${curProg} / ${q.targetCount}</span>
          <span>獎勵: +$${q.rewardCoins}</span>
          ${isReadyToClaim ? `<button class="btn-claim">${t('claimReward')}</button>` : isCompleted ? `<span>✓ ${t('questCompleted')}</span>` : ''}
        </div>
      `;

      if (isReadyToClaim) {
        const btn = qCard.querySelector('.btn-claim') as HTMLButtonElement;
        btn.onclick = () => {
          soundSynth.playCoinsChime();
          if (this.onClaimQuest) this.onClaimQuest(q.id);
          modal.style.display = 'none';
        };
      }

      list.appendChild(qCard);
    });
  }

  public showSettingsModal() {
    this.hideAllModals();
    const modal = document.getElementById('modal-settings');
    if (!modal) return;
    modal.style.display = 'flex';

    const audioSettings = soundSynth.getSettings();
    const bgmSlider = document.getElementById('settings-bgm-slider') as HTMLInputElement;
    const sfxSlider = document.getElementById('settings-sfx-slider') as HTMLInputElement;
    const bgmMute = document.getElementById('settings-bgm-mute') as HTMLInputElement;
    const sfxMute = document.getElementById('settings-sfx-mute') as HTMLInputElement;

    if (bgmSlider) {
      bgmSlider.value = (audioSettings.bgmVolume * 100).toString();
      bgmSlider.oninput = () => soundSynth.setBgmVolume(Number(bgmSlider.value) / 100);
    }
    if (sfxSlider) {
      sfxSlider.value = (audioSettings.sfxVolume * 100).toString();
      sfxSlider.oninput = () => soundSynth.setSfxVolume(Number(sfxSlider.value) / 100);
    }
    if (bgmMute) {
      bgmMute.checked = audioSettings.bgmMuted;
      bgmMute.onchange = () => soundSynth.setBgmMuted(bgmMute.checked);
    }
    if (sfxMute) {
      sfxMute.checked = audioSettings.sfxMuted;
      sfxMute.onchange = () => soundSynth.setSfxMuted(sfxMute.checked);
    }

    const btnSave = document.getElementById('btn-save-progress')!;
    btnSave.onclick = () => {
      soundSynth.playButtonClick();
      if (this.onSaveGame) this.onSaveGame();
      alert(t('saveSuccess'));
    };

    const btnExport = document.getElementById('btn-export-save')!;
    btnExport.onclick = () => {
      soundSynth.playButtonClick();
      const save = this.saveManager.loadFromStorage();
      if (save) this.saveManager.exportSaveToFile(save);
    };

    const importInput = document.getElementById('input-import-save') as HTMLInputElement;
    importInput.onchange = async () => {
      if (importInput.files && importInput.files[0]) {
        try {
          const loadedSave = await this.saveManager.importSaveFromFile(importInput.files[0]);
          this.saveManager.saveToStorage(loadedSave);
          alert(t('saveSuccess'));
          modal.style.display = 'none';
          if (this.onContinueGame) this.onContinueGame(loadedSave);
        } catch {
          alert(t('invalidSaveFile'));
        }
      }
    };
  }

  public showCreditsModal() {
    this.hideAllModals();
    const modal = document.getElementById('modal-credits');
    if (!modal) return;
    modal.style.display = 'flex';
  }

  public showLanguagePicker() {
    const lang = prompt(
      'Choose language:\nzh-TW, zh-CN, en, ja, ko, es, fr, de',
      getLanguage()
    ) as SupportedLanguage;
    if (lang && translations[lang]) {
      setLanguage(lang);
      this.refreshUITexts();
    }
  }

  public hideAllModals() {
    this.stop3DPreview();
    const modals = document.querySelectorAll('.game-modal');
    modals.forEach(m => (m as HTMLElement).style.display = 'none');
  }

  private render3DPreview(data: CreatureData) {
    if (this.previewModel) {
      this.previewScene.remove(this.previewModel);
    }
    this.previewModel = CreatureModelGenerator.createCreatureMesh(data, 1.2);
    this.previewScene.add(this.previewModel);

    const animate = () => {
      if (this.previewModel) {
        this.previewModel.rotation.y += 0.02;
        this.previewModel.rotation.x = Math.sin(Date.now() * 0.003) * 0.15;
      }
      this.previewRenderer.render(this.previewScene, this.previewCamera);
      this.previewAnimFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private stop3DPreview() {
    if (this.previewAnimFrame) {
      cancelAnimationFrame(this.previewAnimFrame);
      this.previewAnimFrame = null;
    }
    if (this.previewModel) {
      this.previewScene.remove(this.previewModel);
      this.previewModel = null;
    }
  }

  public refreshUITexts() {
    // Updates all data-i18n attributes in the DOM
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n') as keyof typeof translations['en'];
      if (key) {
        elem.textContent = t(key);
      }
    });
  }

  public showToast(message: string, icon = '✨') {
    let toast = document.getElementById('floating-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'floating-toast';
      toast.className = 'floating-toast-pill interactive-ui';
      this.rootElement.appendChild(toast);
    }
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    toast.classList.remove('toast-show');
    void toast.offsetWidth;
    toast.classList.add('toast-show');

    setTimeout(() => {
      toast?.classList.remove('toast-show');
    }, 2600);
  }

  public updateRadar(playerX: number, playerZ: number, playerYaw: number) {
    const radarDot = document.getElementById('radar-player-dot');
    if (!radarDot) return;
    const mapRadius = 34;
    const nx = 40 + (playerX / 85) * mapRadius;
    const ny = 40 + (playerZ / 85) * mapRadius;
    radarDot.style.left = `${nx}px`;
    radarDot.style.top = `${ny}px`;
    radarDot.style.transform = `translate(-50%, -50%) rotate(${-playerYaw}rad)`;
  }
}
