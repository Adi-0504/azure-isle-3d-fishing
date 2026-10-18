import * as THREE from 'three';
import { CreatureData } from '../../data/fish/CreatureDatabase';

export class CreatureModelGenerator {
  /**
   * Generates a stylized, high quality 3D model for any creature in the game
   */
  public static createCreatureMesh(data: CreatureData, scaleMultiplier = 1.0): THREE.Group {
    const group = new THREE.Group();
    group.name = `creature_${data.id}`;

    switch (data.category) {
      case 'fish':
        this.buildFishMesh(group, data);
        break;
      case 'shrimp':
        this.buildShrimpMesh(group, data);
        break;
      case 'crab':
        this.buildCrabMesh(group, data);
        break;
      case 'clam':
        this.buildClamMesh(group, data);
        break;
      default:
        this.buildFishMesh(group, data);
        break;
    }

    // Scale according to typical size
    const avgSize = (data.minSize + data.maxSize) / 2;
    const baseScale = Math.max(0.4, Math.min(2.5, avgSize / 35)) * scaleMultiplier;
    group.scale.set(baseScale, baseScale, baseScale);

    return group;
  }

  private static buildFishMesh(root: THREE.Group, data: CreatureData) {
    const bodyMat = new THREE.MeshToonMaterial({
      color: data.colorBase
    });
    const accentMat = new THREE.MeshToonMaterial({
      color: data.colorAccent
    });
    const bellyMat = new THREE.MeshToonMaterial({
      color: 0xffffff
    });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Main Torpedo Body
    const bodyGeo = new THREE.SphereGeometry(0.8, 16, 12);
    bodyGeo.scale(1.8, 0.9, 0.5); // long, taller than wide
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    root.add(body);

    // Belly highlight
    const bellyGeo = new THREE.SphereGeometry(0.7, 12, 8);
    bellyGeo.scale(1.5, 0.45, 0.45);
    bellyGeo.translate(0, -0.3, 0);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    body.add(belly);

    // Dorsal Fin
    const dorsalGeo = new THREE.ConeGeometry(0.4, 0.8, 4);
    dorsalGeo.scale(0.1, 1, 1.2);
    dorsalGeo.rotateZ(-Math.PI / 4);
    const dorsal = new THREE.Mesh(dorsalGeo, accentMat);
    dorsal.position.set(-0.2, 0.85, 0);
    root.add(dorsal);

    // Pectoral Fins (Left & Right)
    const pecGeo = new THREE.ConeGeometry(0.25, 0.5, 4);
    pecGeo.scale(0.08, 1, 0.6);
    const pecL = new THREE.Mesh(pecGeo, accentMat);
    pecL.position.set(0.4, -0.15, 0.42);
    pecL.rotation.set(0.4, 0.6, -0.8);
    root.add(pecL);

    const pecR = new THREE.Mesh(pecGeo, accentMat);
    pecR.position.set(0.4, -0.15, -0.42);
    pecR.rotation.set(-0.4, -0.6, -0.8);
    root.add(pecR);

    // Tail Fin (Pivot for swim animation)
    const tailPivot = new THREE.Group();
    tailPivot.name = 'tail_pivot';
    tailPivot.position.set(-1.4, 0, 0);
    root.add(tailPivot);

    const tailGeo = new THREE.ConeGeometry(0.6, 0.9, 4);
    tailGeo.scale(0.08, 1, 1.1);
    tailGeo.rotateZ(Math.PI / 2);
    const tailFin = new THREE.Mesh(tailGeo, accentMat);
    tailFin.position.set(-0.4, 0, 0);
    tailPivot.add(tailFin);

    // Cute Eyes
    const eyeGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const pupilGeo = new THREE.SphereGeometry(0.07, 8, 8);

    const eyeL = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    eyeL.position.set(1.0, 0.25, 0.35);
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(1.08, 0.25, 0.42);
    root.add(eyeL, pupilL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    eyeR.position.set(1.0, 0.25, -0.35);
    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(1.08, 0.25, -0.42);
    root.add(eyeR, pupilR);

    // Special species accents: e.g. three dots on Three-dot Salmon
    if (data.id === 'three_dot_salmon') {
      const dotGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      [-0.4, 0, 0.4].forEach(x => {
        const dotL = new THREE.Mesh(dotGeo, dotMat);
        dotL.position.set(x, 0.1, 0.43);
        root.add(dotL);
        const dotR = new THREE.Mesh(dotGeo, dotMat);
        dotR.position.set(x, 0.1, -0.43);
        root.add(dotR);
      });
    }
  }

  private static buildShrimpMesh(root: THREE.Group, data: CreatureData) {
    const mat = new THREE.MeshToonMaterial({
      color: data.colorBase,
      transparent: true,
      opacity: 0.9
    });
    const accentMat = new THREE.MeshToonMaterial({ color: data.colorAccent });

    // Segmented curved body
    const segments = 4;
    let prevPart: THREE.Object3D = root;
    for (let i = 0; i < segments; i++) {
      const segGeo = new THREE.CylinderGeometry(0.35 - i * 0.06, 0.4 - i * 0.06, 0.45, 8);
      const segMesh = new THREE.Mesh(segGeo, mat);
      segMesh.rotation.z = Math.PI / 2 + (i * 0.18);
      segMesh.position.set(i === 0 ? 0 : -0.35, i === 0 ? 0 : -0.08, 0);
      prevPart.add(segMesh);
      prevPart = segMesh;
    }

    // Tail fan
    const fanGeo = new THREE.ConeGeometry(0.3, 0.5, 3);
    fanGeo.scale(0.05, 1, 1.2);
    fanGeo.rotateZ(Math.PI / 2);
    const tailFan = new THREE.Mesh(fanGeo, accentMat);
    tailFan.position.set(-0.35, 0, 0);
    prevPart.add(tailFan);

    // Head & Antennae
    const headGeo = new THREE.SphereGeometry(0.38, 8, 8);
    headGeo.scale(1.3, 0.9, 0.8);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.set(0.5, 0.05, 0);
    root.add(head);

    // Long thin antennae
    const antGeo = new THREE.CylinderGeometry(0.015, 0.01, 1.4, 4);
    const antL = new THREE.Mesh(antGeo, accentMat);
    antL.rotation.set(0.2, 0.3, -Math.PI / 3);
    antL.position.set(0.9, 0.3, 0.15);
    const antR = new THREE.Mesh(antGeo, accentMat);
    antR.rotation.set(-0.2, -0.3, -Math.PI / 3);
    antR.position.set(0.9, 0.3, -0.15);
    head.add(antL, antR);
  }

  private static buildCrabMesh(root: THREE.Group, data: CreatureData) {
    const mat = new THREE.MeshToonMaterial({ color: data.colorBase });
    const pincerMat = new THREE.MeshToonMaterial({ color: data.colorAccent });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Wide Oval Carapace
    const shellGeo = new THREE.SphereGeometry(0.7, 12, 10);
    shellGeo.scale(1.2, 0.5, 1.4);
    const shell = new THREE.Mesh(shellGeo, mat);
    shell.castShadow = true;
    root.add(shell);

    // Stalk Eyes
    [-0.3, 0.3].forEach(z => {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), mat);
      stalk.position.set(0.65, 0.3, z);
      const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
      eyeBall.position.set(0.65, 0.45, z);
      root.add(stalk, eyeBall);
    });

    // 2 Massive Front Pincers
    [-0.8, 0.8].forEach(z => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 6), mat);
      arm.position.set(0.5, 0, z);
      arm.rotation.set(z > 0 ? 0.5 : -0.5, 0, Math.PI / 3);
      root.add(arm);

      // Pincer claw
      const claw = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), pincerMat);
      claw.scale.set(1.4, 0.8, 0.8);
      claw.position.set(0.85, 0.15, z * 1.2);
      root.add(claw);
    });

    // 8 Walking legs (4 per side)
    const legGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.7, 4);
    for (let i = 0; i < 4; i++) {
      const xOffset = -0.3 + i * 0.2;
      const legL = new THREE.Mesh(legGeo, mat);
      legL.position.set(xOffset, -0.2, 0.95);
      legL.rotation.set(0.6, 0, 0.2);
      root.add(legL);

      const legR = new THREE.Mesh(legGeo, mat);
      legR.position.set(xOffset, -0.2, -0.95);
      legR.rotation.set(-0.6, 0, 0.2);
      root.add(legR);
    }
  }

  private static buildClamMesh(root: THREE.Group, data: CreatureData) {
    const shellMat = new THREE.MeshToonMaterial({ color: data.colorBase });
    const innerMat = new THREE.MeshToonMaterial({ color: data.colorAccent });
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.3
    });

    // Top Shell
    const topShellGeo = new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    topShellGeo.scale(1.2, 0.35, 1.0);
    const topShell = new THREE.Mesh(topShellGeo, shellMat);
    topShell.position.set(0, 0.08, 0);
    topShell.rotation.z = 0.2; // slightly ajar
    root.add(topShell);

    // Bottom Shell
    const botShellGeo = topShellGeo.clone();
    botShellGeo.scale(1, -1, 1);
    const botShell = new THREE.Mesh(botShellGeo, innerMat);
    botShell.position.set(0, -0.08, 0);
    root.add(botShell);

    // Shiny Pearl inside
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), pearlMat);
    pearl.position.set(0, 0.02, 0);
    root.add(pearl);
  }
}
