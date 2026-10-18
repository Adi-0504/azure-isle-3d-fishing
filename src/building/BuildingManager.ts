import * as THREE from 'three';
import { CreatureData, getCreatureById } from '../../data/fish/CreatureDatabase';
import { CreatureModelGenerator } from '../ecology/CreatureModelGenerator';
import { ToonGradients } from '../world/ToonGradients';

export class BuildingManager {
  public group: THREE.Group;
  public cabinTier = 0; // 0: tent, 1: log cabin, 2: expanded cabin
  private cabinGroup: THREE.Group;
  private homeAquariumGroup: THREE.Group;
  private homeAquariumCreatures: string[] = [];
  public museumDonatedCreatures: string[] = [];
  public museumTier = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'building_manager';

    this.cabinGroup = new THREE.Group();
    this.cabinGroup.position.set(-2.5, 0, -1.5);
    this.group.add(this.cabinGroup);

    this.homeAquariumGroup = new THREE.Group();
    this.homeAquariumGroup.position.set(0, 0.4, 0);
    this.cabinGroup.add(this.homeAquariumGroup);

    this.updateCabinVisuals();
  }

  public setCabinTier(tier: number) {
    this.cabinTier = tier;
    this.updateCabinVisuals();
  }

  public updateCabinVisuals() {
    while (this.cabinGroup.children.length > 0) {
      this.cabinGroup.remove(this.cabinGroup.children[0]);
    }

    if (this.cabinTier === 0) {
      // Starter Tent
      const tentGeo = new THREE.ConeGeometry(2.2, 2.0, 4);
      tentGeo.rotateY(Math.PI / 4);
      const tentMat = new THREE.MeshToonMaterial({
        color: 0xf4a261,
        gradientMap: ToonGradients.getThreeTone()
      });
      const tent = new THREE.Mesh(tentGeo, tentMat);
      tent.position.y = 1.0;
      tent.castShadow = true;
      this.cabinGroup.add(tent);
    } else {
      // Tier 1 / 2: Solid Log Cabin
      const woodWallMat = new THREE.MeshToonMaterial({
        color: 0x8b5a2b,
        gradientMap: ToonGradients.getThreeTone()
      });
      const roofMat = new THREE.MeshToonMaterial({
        color: 0xb7094c,
        gradientMap: ToonGradients.getThreeTone()
      });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xa8dadc, transparent: true, opacity: 0.6 });

      // Cabin Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 3.2), woodWallMat);
      body.position.y = 1.2;
      body.castShadow = true;
      this.cabinGroup.add(body);

      // Pitched Roof
      const roofGeo = new THREE.ConeGeometry(3.2, 1.4, 4);
      roofGeo.rotateY(Math.PI / 4);
      roofGeo.scale(1.1, 1, 0.9);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 2.9;
      roof.castShadow = true;
      this.cabinGroup.add(roof);

      // Glass Window
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), glassMat);
      win.position.set(0.8, 1.4, 1.62);
      this.cabinGroup.add(win);

      // Door
      const doorMat = new THREE.MeshToonMaterial({
        color: 0x5c4033,
        gradientMap: ToonGradients.getThreeTone()
      });
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.1), doorMat);
      door.position.set(-0.7, 0.8, 1.62);
      this.cabinGroup.add(door);

      // Tier 2 additions: Veranda deck & flower planters
      if (this.cabinTier >= 2) {
        const deckMat = new THREE.MeshToonMaterial({
          color: 0xa0522d,
          gradientMap: ToonGradients.getThreeTone()
        });
        const deck = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 1.4), deckMat);
        deck.position.set(0, 0.1, 2.3);
        deck.castShadow = true;
        this.cabinGroup.add(deck);

        // Flower planters
        const planterMat = new THREE.MeshToonMaterial({
          color: 0xe76f51,
          gradientMap: ToonGradients.getThreeTone()
        });
        [-1.6, 1.6].forEach(px => {
          const pot = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.4), planterMat);
          pot.position.set(px, 0.4, 2.6);
          const flower = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.25, 0),
            new THREE.MeshToonMaterial({
              color: 0xffb703,
              gradientMap: ToonGradients.getThreeTone()
            })
          );
          flower.position.set(px, 0.7, 2.6);
          this.cabinGroup.add(pot, flower);
        });
      }
    }

    // Re-attach home aquarium
    this.cabinGroup.add(this.homeAquariumGroup);
    this.rebuildHomeAquariumVisuals();
  }

  public setHomeAquariumCreatures(creatures: string[]) {
    this.homeAquariumCreatures = creatures;
    this.rebuildHomeAquariumVisuals();
  }

  public getHomeAquariumCreatures(): string[] {
    return this.homeAquariumCreatures;
  }

  private rebuildHomeAquariumVisuals() {
    while (this.homeAquariumGroup.children.length > 0) {
      this.homeAquariumGroup.remove(this.homeAquariumGroup.children[0]);
    }

    if (this.homeAquariumCreatures.length === 0) return;

    // Glass Tank Mesh
    const tankGeo = new THREE.BoxGeometry(2.0, 1.2, 1.0);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x90e0ef,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1
    });
    const tank = new THREE.Mesh(tankGeo, glassMat);
    tank.position.set(2.4, 0.6, 0);
    this.homeAquariumGroup.add(tank);

    // Inner water volume
    const waterInner = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.1, 0.9),
      new THREE.MeshBasicMaterial({ color: 0x48cae4, transparent: true, opacity: 0.25 })
    );
    waterInner.position.copy(tank.position);
    this.homeAquariumGroup.add(waterInner);

    // Swimming fish inside tank
    this.homeAquariumCreatures.forEach((creatureId, idx) => {
      const data = getCreatureById(creatureId);
      if (data) {
        const miniModel = CreatureModelGenerator.createCreatureMesh(data, 0.35);
        miniModel.position.set(
          tank.position.x + (idx === 0 ? -0.4 : 0.4),
          tank.position.y + (Math.random() - 0.5) * 0.4,
          tank.position.z + (Math.random() - 0.5) * 0.3
        );
        this.homeAquariumGroup.add(miniModel);
      }
    });
  }

  public donateToMuseum(creatureId: string): boolean {
    if (this.museumDonatedCreatures.includes(creatureId)) {
      return false; // Already donated
    }
    this.museumDonatedCreatures.push(creatureId);
    return true;
  }

  public upgradeMuseumTier(tier: number) {
    this.museumTier = Math.max(this.museumTier, tier);
  }
}
