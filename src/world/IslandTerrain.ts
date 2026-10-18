import * as THREE from 'three';
import { BiomeId } from '../../data/fish/CreatureDatabase';

export class IslandTerrain {
  public group: THREE.Group;
  public terrainMesh!: THREE.Mesh;
  public treeMeshes: THREE.Mesh[] = [];
  public foliageMaterials: THREE.MeshToonMaterial[] = [];
  public interactableTerminals: { pos: THREE.Vector3; type: 'shop' | 'quest' }[] = [];
  public campProps: THREE.Group[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'island_world';
    this.buildTerrain();
    this.populateBiomes();
    this.buildCampSite();
  }

  /**
   * Continuous mathematical height function for the island
   */
  public getTerrainHeight(x: number, z: number): number {
    const distFromCenter = Math.sqrt(x * x + z * z);
    const islandRadius = 85.0;

    // Island rim falloff into sea
    if (distFromCenter > islandRadius) {
      return -2.5 - (distFromCenter - islandRadius) * 0.5;
    }

    // Base dome
    let h = (1.0 - Math.pow(distFromCenter / islandRadius, 2)) * 6.0;

    // Southern Beach (Z > 30): gentle slope down to sea level
    if (z > 25) {
      const beachFactor = (z - 25) / (islandRadius - 25);
      h = Math.max(0.2, h * (1.0 - beachFactor * 0.95));
    }

    // Northern Cliffs (Z < -35): dramatic elevated plateau with steep edge
    if (z < -30) {
      const cliffFactor = Math.min(1.0, (-z - 30) / 25.0);
      h += cliffFactor * 9.5;
      // Perlin-like craggy detail
      h += Math.sin(x * 0.3) * Math.cos(z * 0.3) * 1.5;
    }

    // Central Highland Lake (X between 10 and 40, Z between -10 and 20): bowl depression
    const lakeDx = x - 25;
    const lakeDz = z - 5;
    const lakeDist = Math.sqrt(lakeDx * lakeDx + lakeDz * lakeDz);
    if (lakeDist < 16) {
      const bowl = Math.cos((lakeDist / 16) * Math.PI) * 2.5;
      h -= bowl;
    }

    // Forest Stream Canyon (Winding from Highland Lake to South Beach)
    const streamX = -15 + Math.sin(z * 0.15) * 6;
    const distToStream = Math.abs(x - streamX);
    if (distToStream < 6 && z > -25 && z < 45) {
      const carve = Math.cos((distToStream / 6) * (Math.PI / 2)) * 2.2;
      h -= carve;
    }

    // Secret Forest Grove (X < -25, Z around 0): undulating hillocks
    if (x < -25) {
      h += Math.sin(x * 0.25) * Math.cos(z * 0.25) * 1.8;
    }

    // Small natural hill rolls
    h += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.2;

    return Math.max(-1.5, h);
  }

  public getBiomeAt(x: number, z: number): BiomeId {
    if (z > 35) return 'beach';
    if (z < -35) return 'cliffs';
    if (x > 38) return 'reefs';
    if (x < -30) return 'grove';
    const lakeDist = Math.hypot(x - 25, z - 5);
    if (lakeDist < 20) return 'lake';
    return 'stream';
  }

  public isNearWater(x: number, z: number): boolean {
    const h = this.getTerrainHeight(x, z);
    // Water plane is at Y = 0.5; near water is height between 0.3 and 1.8
    if (h < 1.6 && h > 0.0) return true;

    // Or proximity to Highland Lake shore
    const lakeDist = Math.hypot(x - 25, z - 5);
    if (lakeDist >= 12 && lakeDist <= 17) return true;

    // Or proximity to Forest Stream
    const streamX = -15 + Math.sin(z * 0.15) * 6;
    if (Math.abs(x - streamX) < 4.5 && z > -20 && z < 45) return true;

    return false;
  }

  private buildTerrain() {
    const size = 180;
    const segments = 90;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors: number[] = [];

    // Distinct biome vertex colors
    const cGrass = new THREE.Color(0x7bc676);
    const cSand = new THREE.Color(0xe9c46a);
    const cRock = new THREE.Color(0x8d99ae);
    const cGrove = new THREE.Color(0x386641);
    const cHighland = new THREE.Color(0x95d5b2);

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = this.getTerrainHeight(vx, vz);
      pos.setY(i, vy);

      // Height and region based vertex coloring
      const biome = this.getBiomeAt(vx, vz);
      let col = cGrass;
      if (vy < 0.6 || biome === 'beach') {
        col = cSand;
      } else if (biome === 'cliffs' || vy > 8.0) {
        col = cRock;
      } else if (biome === 'grove') {
        col = cGrove;
      } else if (biome === 'lake') {
        col = cHighland;
      }
      colors.push(col.r, col.g, col.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshToonMaterial({
      vertexColors: true
    });

    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = true;
    this.group.add(this.terrainMesh);
  }

  private populateBiomes() {
    // Generate trees across island with unified cute Animal Crossing style
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 12 + Math.random() * 65;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // Don't spawn trees directly in lake or stream
      const lakeDist = Math.hypot(x - 25, z - 5);
      const streamX = -15 + Math.sin(z * 0.15) * 6;
      if (lakeDist < 16) continue;
      if (Math.abs(x - streamX) < 4.5 && z > -25 && z < 45) continue;
      // Don't spawn in campsite clearing
      if (Math.hypot(x, z - 5) < 9) continue;

      const y = this.getTerrainHeight(x, z);
      if (y < 0.5) continue; // no trees under water

      const isPine = z < -15 || x > 20;
      this.spawnStylizedTree(x, y, z, isPine);
    }

    // Rocks along cliffs and beach
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 25 + Math.random() * 55;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = this.getTerrainHeight(x, z);
      this.spawnRock(x, y, z);
    }

    // Footbridges over stream
    this.spawnWoodenBridge(-15, this.getTerrainHeight(-15, 12), 12);
    this.spawnWoodenBridge(-13, this.getTerrainHeight(-13, -8), -8);
  }

  private spawnStylizedTree(x: number, y: number, z: number, isPine: boolean) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    // Trunk
    const trunkMat = new THREE.MeshToonMaterial({ color: 0x6f4e37 });
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 2.0, 7);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.0;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage
    const foliageMat = new THREE.MeshToonMaterial({
      color: isPine ? 0x2d6a4f : 0x52b788
    });
    this.foliageMaterials.push(foliageMat);

    if (isPine) {
      // 3 Stacked Cones
      [0, 1, 2].forEach(level => {
        const coneGeo = new THREE.ConeGeometry(1.6 - level * 0.35, 1.3, 7);
        const cone = new THREE.Mesh(coneGeo, foliageMat);
        cone.position.y = 2.2 + level * 0.9;
        cone.castShadow = true;
        treeGroup.add(cone);
      });
    } else {
      // Rounded Puffy Cloud Canopy (Animal Crossing Style)
      const mainSphere = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), foliageMat);
      mainSphere.position.y = 2.7;
      mainSphere.scale.set(1.1, 1.0, 1.1);
      mainSphere.castShadow = true;
      treeGroup.add(mainSphere);

      // Puffy sub-orbs
      [
        [0.8, 2.5, 0],
        [-0.8, 2.5, 0],
        [0, 2.6, 0.8],
        [0, 2.6, -0.8]
      ].forEach(([ox, oy, oz]) => {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), foliageMat);
        puff.position.set(ox, oy, oz);
        treeGroup.add(puff);
      });
    }

    const scale = 0.8 + Math.random() * 0.5;
    treeGroup.scale.set(scale, scale, scale);
    this.group.add(treeGroup);
  }

  private spawnRock(x: number, y: number, z: number) {
    const rockGeo = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.8, 0);
    const rockMat = new THREE.MeshToonMaterial({ color: 0x7f8c8d });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x, y + 0.3, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.set(1.2, 0.7, 1.0);
    rock.castShadow = true;
    this.group.add(rock);
  }

  private spawnWoodenBridge(x: number, y: number, z: number) {
    const bridge = new THREE.Group();
    bridge.position.set(x, y + 0.2, z);

    const woodMat = new THREE.MeshToonMaterial({ color: 0x8b5a2b });
    // Planks
    for (let i = -3; i <= 3; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 2.2), woodMat);
      plank.position.set(i * 0.45, 0, 0);
      plank.castShadow = true;
      bridge.add(plank);
    }
    // Handrails
    [-1.0, 1.0].forEach(pz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.1), woodMat);
      rail.position.set(0, 0.6, pz);
      bridge.add(rail);
      [-1.3, 0, 1.3].forEach(px => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), woodMat);
        post.position.set(px, 0.3, pz);
        bridge.add(post);
      });
    });

    this.group.add(bridge);
  }

  private buildCampSite() {
    // Initial campsite located at (0, y, 5)
    const campX = 0;
    const campZ = 5;
    const campY = this.getTerrainHeight(campX, campZ);

    const campGroup = new THREE.Group();
    campGroup.position.set(campX, campY, campZ);
    this.campProps.push(campGroup);
    this.group.add(campGroup);

    // 1. Canvas Tent
    const tentMat = new THREE.MeshToonMaterial({ color: 0xf4a261 });
    const tentGeo = new THREE.ConeGeometry(2.2, 2.0, 4);
    tentGeo.rotateY(Math.PI / 4);
    const tent = new THREE.Mesh(tentGeo, tentMat);
    tent.position.set(-2.5, 1.0, -1.5);
    tent.castShadow = true;
    campGroup.add(tent);

    // 2. Campfire with warm light and glowing embers
    const firePit = new THREE.Group();
    firePit.position.set(0, 0, 1.0);
    campGroup.add(firePit);

    // Ring of stones
    const stoneMat = new THREE.MeshToonMaterial({ color: 0x6c757d });
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), stoneMat);
      stone.position.set(Math.cos(ang) * 0.6, 0.1, Math.sin(ang) * 0.6);
      firePit.add(stone);
    }
    // Logs
    const logMat = new THREE.MeshToonMaterial({ color: 0x4a2e18 });
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6), logMat);
      log.rotation.z = Math.PI / 3;
      log.rotation.y = (i * Math.PI) / 3;
      log.position.y = 0.15;
      firePit.add(log);
    }
    // Fire light
    const fireLight = new THREE.PointLight(0xff7b00, 2.0, 12);
    fireLight.position.set(0, 0.6, 0);
    firePit.add(fireLight);

    // 3. Wooden Camp Bench
    const woodMat = new THREE.MeshToonMaterial({ color: 0xa0522d });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.5), woodMat);
    bench.position.set(1.5, 0.25, 1.2);
    bench.castShadow = true;
    campGroup.add(bench);

    // 4. Wooden Storage Crate
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), woodMat);
    crate.position.set(-1.8, 0.3, 1.5);
    crate.castShadow = true;
    campGroup.add(crate);

    // 5. Automated Trading Terminal (Vending Machine)
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(2.8, 0, -1.0);
    campGroup.add(terminalGroup);

    const termBodyMat = new THREE.MeshToonMaterial({ color: 0x2a9d8f });
    const termScreenMat = new THREE.MeshBasicMaterial({ color: 0x52b788 });
    const termBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.6), termBodyMat);
    termBody.position.y = 0.8;
    termBody.castShadow = true;
    const termScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.45), termScreenMat);
    termScreen.position.set(0, 1.1, 0.31);
    terminalGroup.add(termBody, termScreen);

    // Register terminal interaction
    this.interactableTerminals.push({
      pos: new THREE.Vector3(campX + 2.8, campY, campZ - 1.0),
      type: 'shop'
    });

    // 6. Notice Board (Quests)
    const boardGroup = new THREE.Group();
    boardGroup.position.set(-2.8, 0, 0.5);
    campGroup.add(boardGroup);

    const boardMat = new THREE.MeshToonMaterial({ color: 0xd4a373 });
    const boardPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), woodMat);
    boardPost.position.y = 0.75;
    const boardPanel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.08), boardMat);
    boardPanel.position.set(0, 1.1, 0);
    boardGroup.add(boardPost, boardPanel);

    this.interactableTerminals.push({
      pos: new THREE.Vector3(campX - 2.8, campY, campZ + 0.5),
      type: 'quest'
    });
  }

  public updateSeason(season: 'spring' | 'summer' | 'autumn' | 'winter') {
    let foliageColor = 0x52b788; // summer
    if (season === 'spring') foliageColor = 0x95d5b2; // pastel mint
    if (season === 'autumn') foliageColor = 0xd05332; // burnt orange / maple
    if (season === 'winter') foliageColor = 0x6c9a8b; // frosted evergreen

    this.foliageMaterials.forEach(mat => {
      mat.color.set(foliageColor);
    });
  }
}
