import * as THREE from 'three';
import { PlayerCustomization } from '../save/SaveManager';

export class PlayerModel {
  public group: THREE.Group;
  public customization: PlayerCustomization;

  // Rig Joints for animation
  private headNode!: THREE.Group;
  private torsoNode!: THREE.Group;
  private leftArmNode!: THREE.Group;
  private rightArmNode!: THREE.Group;
  private leftLegNode!: THREE.Group;
  private rightLegNode!: THREE.Group;
  public rodNode!: THREE.Group;
  public lineMesh!: THREE.Line;
  public bobberMesh!: THREE.Mesh;

  // Material handles for live customization
  private skinMat!: THREE.MeshToonMaterial;
  private hairMat!: THREE.MeshToonMaterial;
  private vestMat!: THREE.MeshToonMaterial;
  private pantsMat!: THREE.MeshToonMaterial;
  private hairGroup!: THREE.Group;

  // Animation state
  public animState: 'idle' | 'walk' | 'run' | 'cast' | 'reel' | 'cheer' = 'idle';
  private animTimer = 0;

  constructor(customization: PlayerCustomization) {
    this.customization = customization;
    this.group = new THREE.Group();
    this.group.name = 'player_character';
    this.buildCharacter();
  }

  private buildCharacter() {
    this.skinMat = new THREE.MeshToonMaterial({ color: this.customization.skinTone });
    this.hairMat = new THREE.MeshToonMaterial({ color: this.customization.hairColor });
    this.vestMat = new THREE.MeshToonMaterial({ color: this.customization.outfitColor });
    this.pantsMat = new THREE.MeshToonMaterial({ color: 0x3d5a80 });
    const bootMat = new THREE.MeshToonMaterial({ color: 0x4a3b32 });
    const beltMat = new THREE.MeshToonMaterial({ color: 0x5c4033 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1d3557 });

    // --- HIPS & TORSO ---
    this.torsoNode = new THREE.Group();
    this.torsoNode.position.y = 1.0;
    this.group.add(this.torsoNode);

    // Torso body (shirt & vest)
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.7, 10);
    const torsoMesh = new THREE.Mesh(torsoGeo, this.vestMat);
    torsoMesh.castShadow = true;
    this.torsoNode.add(torsoMesh);

    // Fishing Vest Pockets & Collar
    const pocketGeo = new THREE.BoxGeometry(0.16, 0.16, 0.08);
    const pocketMat = new THREE.MeshToonMaterial({ color: 0xe0a96d });
    const pocketL = new THREE.Mesh(pocketGeo, pocketMat);
    pocketL.position.set(-0.18, -0.05, 0.32);
    const pocketR = new THREE.Mesh(pocketGeo, pocketMat);
    pocketR.position.set(0.18, -0.05, 0.32);
    this.torsoNode.add(pocketL, pocketR);

    // Utility belt with tackle box pouch
    const beltGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.1, 10);
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = -0.32;
    const pouchGeo = new THREE.BoxGeometry(0.18, 0.16, 0.14);
    const pouch = new THREE.Mesh(pouchGeo, beltMat);
    pouch.position.set(0.32, -0.32, 0.08);
    this.torsoNode.add(belt, pouch);

    // --- HEAD ---
    this.headNode = new THREE.Group();
    this.headNode.position.y = 0.55;
    this.torsoNode.add(this.headNode);

    // Cute round anime head
    const headGeo = new THREE.SphereGeometry(0.42, 16, 14);
    headGeo.scale(1.0, 1.05, 0.95);
    const headMesh = new THREE.Mesh(headGeo, this.skinMat);
    headMesh.castShadow = true;
    this.headNode.add(headMesh);

    // Big Anime Eyes
    [-0.15, 0.15].forEach(x => {
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), eyeWhiteMat);
      eyeL.scale.set(0.8, 1.1, 0.4);
      eyeL.position.set(x, 0.02, 0.38);
      const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), pupilMat);
      pupL.scale.set(0.8, 1.1, 0.4);
      pupL.position.set(x, 0.02, 0.41);
      this.headNode.add(eyeL, pupL);
    });

    // Cute blush cheeks
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: 0.6 });
    [-0.22, 0.22].forEach(x => {
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), blushMat);
      blush.position.set(x, -0.08, 0.39);
      this.headNode.add(blush);
    });

    // Hair & Hat
    this.hairGroup = new THREE.Group();
    this.headNode.add(this.hairGroup);
    this.updateHairStyle(this.customization.hairStyle);

    // --- LEGS ---
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.55, 8);
    const bootGeo = new THREE.BoxGeometry(0.18, 0.2, 0.32);

    // Left Leg
    this.leftLegNode = new THREE.Group();
    this.leftLegNode.position.set(-0.18, 0.65, 0);
    this.group.add(this.leftLegNode);
    const leftLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    leftLegMesh.position.y = -0.22;
    leftLegMesh.castShadow = true;
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(0, -0.48, 0.05);
    leftBoot.castShadow = true;
    this.leftLegNode.add(leftLegMesh, leftBoot);

    // Right Leg
    this.rightLegNode = new THREE.Group();
    this.rightLegNode.position.set(0.18, 0.65, 0);
    this.group.add(this.rightLegNode);
    const rightLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    rightLegMesh.position.y = -0.22;
    rightLegMesh.castShadow = true;
    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0, -0.48, 0.05);
    rightBoot.castShadow = true;
    this.rightLegNode.add(rightLegMesh, rightBoot);

    // --- ARMS ---
    const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8);
    const handGeo = new THREE.SphereGeometry(0.1, 8, 8);

    // Left Arm
    this.leftArmNode = new THREE.Group();
    this.leftArmNode.position.set(-0.46, 0.22, 0);
    this.torsoNode.add(this.leftArmNode);
    const leftArmMesh = new THREE.Mesh(armGeo, this.vestMat);
    leftArmMesh.position.y = -0.22;
    const leftHand = new THREE.Mesh(handGeo, this.skinMat);
    leftHand.position.y = -0.48;
    this.leftArmNode.add(leftArmMesh, leftHand);

    // Right Arm (Holds rod)
    this.rightArmNode = new THREE.Group();
    this.rightArmNode.position.set(0.46, 0.22, 0);
    this.torsoNode.add(this.rightArmNode);
    const rightArmMesh = new THREE.Mesh(armGeo, this.vestMat);
    rightArmMesh.position.y = -0.22;
    const rightHand = new THREE.Mesh(handGeo, this.skinMat);
    rightHand.position.y = -0.48;
    this.rightArmNode.add(rightArmMesh, rightHand);

    // --- FISHING ROD ---
    this.rodNode = new THREE.Group();
    this.rodNode.position.set(0, -0.48, 0);
    this.rodNode.rotation.x = -Math.PI / 4;
    this.rightArmNode.add(this.rodNode);

    // Rod Blank
    const blankGeo = new THREE.CylinderGeometry(0.02, 0.045, 2.4, 6);
    const rodMat = new THREE.MeshToonMaterial({ color: 0xcd853f });
    const blankMesh = new THREE.Mesh(blankGeo, rodMat);
    blankMesh.position.set(0, 1.1, 0.1);
    this.rodNode.add(blankMesh);

    // Reel
    const reelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8);
    const reelMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 });
    const reel = new THREE.Mesh(reelGeo, reelMat);
    reel.rotation.z = Math.PI / 2;
    reel.position.set(0.08, 0.3, 0.05);
    this.rodNode.add(reel);

    // Fishing line & Bobber
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 2.2, 0.1),
      new THREE.Vector3(0, 2.2, 1.5)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    this.lineMesh = new THREE.Line(lineGeo, lineMat);
    this.rodNode.add(this.lineMesh);

    // Bobber (floating buoy)
    const bobberGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const bobberMat = new THREE.MeshToonMaterial({ color: 0xff3333 });
    this.bobberMesh = new THREE.Mesh(bobberGeo, bobberMat);
    this.bobberMesh.position.set(0, 0, 4.0);
    this.bobberMesh.visible = false;
    this.group.add(this.bobberMesh);
  }

  public updateHairStyle(style: 'spiky' | 'flowing' | 'cap') {
    // Clear old hair
    while (this.hairGroup.children.length > 0) {
      this.hairGroup.remove(this.hairGroup.children[0]);
    }

    if (style === 'cap') {
      // Classic Angler Cap + Hair Tufts
      const capGeo = new THREE.SphereGeometry(0.44, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
      const capMat = new THREE.MeshToonMaterial({ color: 0xd90429 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.15;
      const brimGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 12, 1, false, -Math.PI / 3, (Math.PI * 2) / 3);
      const brim = new THREE.Mesh(brimGeo, capMat);
      brim.position.set(0, 0.15, 0.18);
      brim.rotation.x = -0.15;
      this.hairGroup.add(cap, brim);

      // Cute hair fringe underneath
      [-0.2, 0, 0.2].forEach(x => {
        const fringe = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 4), this.hairMat);
        fringe.position.set(x, 0.14, 0.38);
        fringe.rotation.set(0.3, 0, x * 0.5);
        this.hairGroup.add(fringe);
      });
    } else if (style === 'spiky') {
      // Dynamic Anime Spiky Hair
      for (let i = 0; i < 9; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 4), this.hairMat);
        const angle = (i / 9) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 0.32, 0.35 + Math.sin(i) * 0.1, Math.sin(angle) * 0.28);
        spike.rotation.set(Math.sin(angle) * 0.5, 0, -Math.cos(angle) * 0.5);
        this.hairGroup.add(spike);
      }
    } else {
      // Flowing wavy hair
      const hairDome = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), this.hairMat);
      hairDome.scale.set(1.05, 1.05, 1.1);
      hairDome.position.set(0, 0.08, -0.08);
      this.hairGroup.add(hairDome);
    }
  }

  public updateCustomization(c: PlayerCustomization) {
    this.customization = c;
    this.skinMat.color.set(c.skinTone);
    this.hairMat.color.set(c.hairColor);
    this.vestMat.color.set(c.outfitColor);
    this.updateHairStyle(c.hairStyle);
  }

  public update(dt: number) {
    this.animTimer += dt;
    const t = this.animTimer;

    switch (this.animState) {
      case 'idle':
        // Gentle breathing and slight head tilt
        this.torsoNode.position.y = 1.0 + Math.sin(t * 2.5) * 0.02;
        this.headNode.rotation.z = Math.sin(t * 1.5) * 0.04;
        this.leftArmNode.rotation.x = Math.sin(t * 2) * 0.05;
        this.rightArmNode.rotation.x = -0.3 + Math.sin(t * 2) * 0.05;
        this.leftLegNode.rotation.x = 0;
        this.rightLegNode.rotation.x = 0;
        this.rodNode.rotation.x = -Math.PI / 4 + Math.sin(t * 2) * 0.03;
        break;

      case 'walk':
        // Natural swing
        const walkSpeed = 9.0;
        this.torsoNode.position.y = 1.0 + Math.abs(Math.sin(t * walkSpeed)) * 0.06;
        this.leftLegNode.rotation.x = Math.sin(t * walkSpeed) * 0.55;
        this.rightLegNode.rotation.x = -Math.sin(t * walkSpeed) * 0.55;
        this.leftArmNode.rotation.x = -Math.sin(t * walkSpeed) * 0.55;
        this.rightArmNode.rotation.x = -0.3 + Math.sin(t * walkSpeed) * 0.3;
        this.rodNode.rotation.x = -Math.PI / 4;
        break;

      case 'run':
        // High energetic run
        const runSpeed = 15.0;
        this.torsoNode.position.y = 1.0 + Math.abs(Math.sin(t * runSpeed)) * 0.1;
        this.torsoNode.rotation.x = 0.25; // forward lean
        this.leftLegNode.rotation.x = Math.sin(t * runSpeed) * 0.9;
        this.rightLegNode.rotation.x = -Math.sin(t * runSpeed) * 0.9;
        this.leftArmNode.rotation.x = -Math.sin(t * runSpeed) * 0.85;
        this.rightArmNode.rotation.x = -0.4 + Math.sin(t * runSpeed) * 0.6;
        break;

      case 'cast':
        // High overhead cast
        this.torsoNode.rotation.x = -0.15;
        this.rightArmNode.rotation.x = -Math.PI / 1.6;
        this.rodNode.rotation.x = -Math.PI / 2.2;
        break;

      case 'reel':
        // Pulling and cranking
        this.torsoNode.rotation.x = -0.1;
        this.rightArmNode.rotation.x = -0.8 + Math.sin(t * 18) * 0.12;
        this.leftArmNode.rotation.x = -0.6 + Math.cos(t * 18) * 0.15;
        this.rodNode.rotation.x = -Math.PI / 3 + Math.sin(t * 18) * 0.1;
        break;

      case 'cheer':
        // Hold rod up in joy
        this.torsoNode.rotation.x = -0.1;
        this.rightArmNode.rotation.x = -Math.PI / 1.3;
        this.leftArmNode.rotation.x = -Math.PI / 1.3;
        this.rodNode.rotation.x = 0.3;
        break;
    }
  }

  public setFishingLine(targetWorldPos: THREE.Vector3 | null) {
    if (!targetWorldPos) {
      this.bobberMesh.visible = false;
      return;
    }
    this.bobberMesh.visible = true;
    this.bobberMesh.position.copy(targetWorldPos);

    // Line from rod tip to bobber
    const tipPos = new THREE.Vector3(0, 2.3, 0.1);
    this.rodNode.localToWorld(tipPos);
    this.group.worldToLocal(tipPos);
    const localBobber = targetWorldPos.clone();
    this.group.worldToLocal(localBobber);

    const positions = (this.lineMesh.geometry.attributes.position as THREE.BufferAttribute);
    positions.setXYZ(0, tipPos.x, tipPos.y, tipPos.z);
    positions.setXYZ(1, localBobber.x, localBobber.y, localBobber.z);
    positions.needsUpdate = true;
  }
}
