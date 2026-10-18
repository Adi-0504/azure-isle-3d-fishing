import * as THREE from 'three';

export class ToonGradients {
  private static threeToneTexture: THREE.DataTexture | null = null;
  private static fiveToneTexture: THREE.DataTexture | null = null;

  public static getThreeTone(): THREE.DataTexture {
    if (!this.threeToneTexture) {
      // 3-step cel shading ramp: shadow (100), midtone (190), highlight (255)
      const colors = new Uint8Array([110, 190, 255]);
      this.threeToneTexture = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat);
      this.threeToneTexture.minFilter = THREE.NearestFilter;
      this.threeToneTexture.magFilter = THREE.NearestFilter;
      this.threeToneTexture.needsUpdate = true;
    }
    return this.threeToneTexture;
  }

  public static getFiveTone(): THREE.DataTexture {
    if (!this.fiveToneTexture) {
      // 5-step smooth cel shading ramp
      const colors = new Uint8Array([90, 140, 185, 225, 255]);
      this.fiveToneTexture = new THREE.DataTexture(colors, 5, 1, THREE.RedFormat);
      this.fiveToneTexture.minFilter = THREE.NearestFilter;
      this.fiveToneTexture.magFilter = THREE.NearestFilter;
      this.fiveToneTexture.needsUpdate = true;
    }
    return this.fiveToneTexture;
  }

  public static createToonMaterial(color: number | string, isFiveTone = false): THREE.MeshToonMaterial {
    const gradient = isFiveTone ? this.getFiveTone() : this.getThreeTone();
    return new THREE.MeshToonMaterial({
      color: color,
      gradientMap: gradient
    });
  }
}
