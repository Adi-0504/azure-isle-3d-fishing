import * as THREE from 'three';

export interface WaterRipple {
  pos: THREE.Vector3;
  radius: number;
  maxRadius: number;
  alpha: number;
  mesh: THREE.Mesh;
}

export class WaterSystem {
  public group: THREE.Group;
  public waterMesh: THREE.Mesh;
  private ripples: WaterRipple[] = [];
  private rippleGeo: THREE.RingGeometry;
  private rippleMat: THREE.MeshBasicMaterial;

  // Swimming fish shadow near bobber
  public fishShadow: THREE.Mesh;
  public isShadowActive = false;
  private shadowTarget = new THREE.Vector3();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'water_system';

    // Stylized semi-transparent ocean & river water plane
    const waterGeo = new THREE.PlaneGeometry(240, 240, 48, 48);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshToonMaterial({
      color: 0x48cae4,
      transparent: true,
      opacity: 0.75
    });

    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = 0.45;
    this.waterMesh.receiveShadow = true;
    this.group.add(this.waterMesh);

    // Ripple template
    this.rippleGeo = new THREE.RingGeometry(0.1, 0.25, 24);
    this.rippleGeo.rotateX(-Math.PI / 2);
    this.rippleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    // Underwater Fish Shadow Silhouette
    const shadowGeo = new THREE.SphereGeometry(0.5, 8, 6);
    shadowGeo.scale(1.6, 0.1, 0.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x001d3d,
      transparent: true,
      opacity: 0.55
    });
    this.fishShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.fishShadow.position.set(0, 0.35, 0);
    this.fishShadow.visible = false;
    this.group.add(this.fishShadow);
  }

  public spawnRipple(pos: THREE.Vector3, maxRadius = 1.8) {
    const mesh = new THREE.Mesh(this.rippleGeo, this.rippleMat.clone());
    mesh.position.set(pos.x, 0.48, pos.z);
    this.group.add(mesh);

    this.ripples.push({
      pos: pos.clone(),
      radius: 0.1,
      maxRadius: maxRadius,
      alpha: 1.0,
      mesh: mesh
    });
  }

  public triggerFishShadow(bobberPos: THREE.Vector3) {
    this.isShadowActive = true;
    this.fishShadow.visible = true;
    // Spawn 5 units away in water
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      0,
      (Math.random() - 0.5) * 6
    ).normalize().multiplyScalar(4.5);
    this.fishShadow.position.copy(bobberPos).add(offset);
    this.fishShadow.position.y = 0.35;
    this.shadowTarget.copy(bobberPos);
  }

  public hideFishShadow() {
    this.isShadowActive = false;
    this.fishShadow.visible = false;
  }

  public update(dt: number, timeSec: number) {
    // Gentle water plane undulation
    const pos = this.waterMesh.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getZ(i);
      const wave = Math.sin(u * 0.15 + timeSec * 1.5) * 0.08 + Math.cos(v * 0.15 + timeSec * 1.2) * 0.08;
      pos.setY(i, wave);
    }
    pos.needsUpdate = true;

    // Update ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += dt * 1.8;
      r.alpha -= dt * 0.8;
      r.mesh.scale.set(r.radius, 1, r.radius);
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, r.alpha);

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.group.remove(r.mesh);
        this.ripples.splice(i, 1);
      }
    }

    // Fish shadow swimming smoothly toward bobber
    if (this.isShadowActive && this.fishShadow.visible) {
      this.fishShadow.position.lerp(this.shadowTarget, dt * 1.8);
      this.fishShadow.lookAt(this.shadowTarget.x, 0.35, this.shadowTarget.z);
      this.fishShadow.position.y = 0.35 + Math.sin(timeSec * 8) * 0.03;
    }
  }
}
