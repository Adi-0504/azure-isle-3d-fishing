import * as THREE from 'three';
import { BiomeId } from '../../data/fish/CreatureDatabase';
import { ToonGradients } from './ToonGradients';

export interface ObstacleCollider {
  x: number;
  z: number;
  radius: number;
  name?: string;
}

export interface WalkableDeck {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  deckY: number;
}

export class IslandTerrain {
  public group: THREE.Group;
  public terrainMesh!: THREE.Mesh;
  public treeMeshes: THREE.Mesh[] = [];
  public foliageMaterials: THREE.MeshToonMaterial[] = [];
  public interactableTerminals: { pos: THREE.Vector3; type: 'shop' | 'quest' }[] = [];
  public campProps: THREE.Group[] = [];
  public colliders: ObstacleCollider[] = [];
  public walkableDecks: WalkableDeck[] = [];
  private grassInstancedMesh!: THREE.InstancedMesh;
  private grassUniforms: { [uniform: string]: THREE.IUniform<any> } | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'island_world';
    this.setupWalkableDecks();
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

  private setupWalkableDecks() {
    this.walkableDecks = [
      // South Beach Fishing Pier (startX: 2, startY: 0.55, startZ: 44, length: 14)
      {
        id: 'pier_south',
        minX: 0.75,
        maxX: 3.25,
        minZ: 43.5,
        maxZ: 58.2,
        deckY: 0.60
      },
      // Highland Lake Pier (startX: 25, startY: 1.35, startZ: 7, length: 9, dir: north)
      {
        id: 'pier_lake',
        minX: 23.75,
        maxX: 26.25,
        minZ: -2.2,
        maxZ: 7.5,
        deckY: 1.42
      },
      // Forest Stream Bridge 1 (South: -15, 12)
      {
        id: 'bridge_stream_south',
        minX: -16.8,
        maxX: -13.2,
        minZ: 10.8,
        maxZ: 13.2,
        deckY: this.getTerrainHeight(-15, 12) + 0.28
      },
      // Forest Stream Bridge 2 (North: -13, -8)
      {
        id: 'bridge_stream_north',
        minX: -14.8,
        maxX: -11.2,
        minZ: -9.2,
        maxZ: -6.8,
        deckY: this.getTerrainHeight(-13, -8) + 0.28
      }
    ];
  }

  public isOnWalkableDeck(x: number, z: number): WalkableDeck | null {
    for (let i = 0; i < this.walkableDecks.length; i++) {
      const d = this.walkableDecks[i];
      if (x >= d.minX && x <= d.maxX && z >= d.minZ && z <= d.maxZ) {
        return d;
      }
    }
    return null;
  }

  public getWalkHeight(x: number, z: number): number {
    const deck = this.isOnWalkableDeck(x, z);
    const th = this.getTerrainHeight(x, z);
    if (deck) {
      return Math.max(th, deck.deckY);
    }
    return th;
  }

  public isWalkable(x: number, z: number, playerRadius = 0.35): boolean {
    const onDeck = this.isOnWalkableDeck(x, z);

    if (!onDeck) {
      // 1. Outer Island perimeter boundary (safe cutoff before dome drops into deep sea)
      const distFromCenter = Math.hypot(x, z);
      if (distFromCenter > 78.5) {
        return false;
      }

      // 2. Deep ocean water boundary (sea surface at y = 0.5; terrain < 0.28 is deep sea)
      const h = this.getTerrainHeight(x, z);
      if (h < 0.28) {
        return false;
      }

      // 3. Highland Lake deep water boundary (lake center at 25, 5)
      const lakeDist = Math.hypot(x - 25, z - 5);
      if (lakeDist < 12.0) {
        return false;
      }

      // 4. Forest Stream deep water boundary
      const streamX = -15 + Math.sin(z * 0.15) * 6;
      if (Math.abs(x - streamX) < 2.5 && z > -22 && z < 42 && h < 0.3) {
        return false;
      }
    }

    // 5. Solid obstacles collision (trees, rocks, campsite facilities, beacon pillars)
    for (let i = 0; i < this.colliders.length; i++) {
      const c = this.colliders[i];
      const dx = x - c.x;
      const dz = z - c.z;
      const minD = c.radius + playerRadius;
      if (dx * dx + dz * dz < minD * minD) {
        return false;
      }
    }

    return true;
  }

  public isNearWater(x: number, z: number): boolean {
    if (this.isOnWalkableDeck(x, z)) return true;

    const h = this.getTerrainHeight(x, z);
    // Water plane is at Y = 0.5; near water is height between 0.28 and 1.8
    if (h < 1.8 && h >= 0.25) return true;

    // Or proximity to Highland Lake shore
    const lakeDist = Math.hypot(x - 25, z - 5);
    if (lakeDist >= 11.5 && lakeDist <= 17.5) return true;

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
      vertexColors: true,
      gradientMap: ToonGradients.getThreeTone()
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
      // Don't spawn on piers or bridges
      if (this.isOnWalkableDeck(x, z)) continue;
      if (Math.hypot(x - 2, z - 44) < 5 || Math.hypot(x - 25, z - 7) < 5) continue;

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

    // Fishing Piers (Southern Beach & Highland Lake)
    this.spawnFishingPier(2, 0.55, 44, 14, 'south');
    this.spawnFishingPier(25, 1.35, 7, 9, 'north');

    // Ancient Stone Beacon / Gazebo Landmark on Northern Cliffs
    this.spawnNorthernBeacon(0, this.getTerrainHeight(0, -58), -58);

    // Colorful Flower Patches, Mushrooms & Signposts
    this.spawnFlowerPatches();
    this.spawnForestMushrooms();
    this.spawnSignposts();
    this.spawnGrassTufts();
  }

  private spawnStylizedTree(x: number, y: number, z: number, isPine: boolean) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    // Trunk
    const trunkMat = new THREE.MeshToonMaterial({
      color: 0x6f4e37,
      gradientMap: ToonGradients.getThreeTone()
    });
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 2.0, 7);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.0;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage
    const foliageMat = new THREE.MeshToonMaterial({
      color: isPine ? 0x2d6a4f : 0x52b788,
      gradientMap: ToonGradients.getFiveTone()
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

    // Register tree trunk collider
    this.colliders.push({ x, z, radius: 0.65 * scale, name: 'tree' });
  }

  private spawnRock(x: number, y: number, z: number) {
    // Don't spawn rock on piers, bridges or paths
    if (this.isOnWalkableDeck(x, z)) return;
    if (Math.hypot(x - 2, z - 44) < 5 || Math.hypot(x - 25, z - 7) < 5) return;
    if (Math.hypot(x - (-15), z - 12) < 4 || Math.hypot(x - (-13), z - (-8)) < 4) return;
    if (Math.hypot(x, z - 5) < 8) return; // avoid campsite

    const rockGeo = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.8, 0);
    const rockMat = new THREE.MeshToonMaterial({
      color: 0x7f8c8d,
      gradientMap: ToonGradients.getThreeTone()
    });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x, y + 0.3, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.set(1.2, 0.7, 1.0);
    rock.castShadow = true;
    this.group.add(rock);

    // Register rock collider
    this.colliders.push({ x, z, radius: 0.85, name: 'rock' });
  }

  private spawnWoodenBridge(x: number, y: number, z: number) {
    const bridge = new THREE.Group();
    bridge.position.set(x, y + 0.2, z);

    const woodMat = new THREE.MeshToonMaterial({
      color: 0x8b5a2b,
      gradientMap: ToonGradients.getThreeTone()
    });
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

  private spawnFishingPier(startX: number, startY: number, startZ: number, length: number, dir: 'south' | 'north') {
    const pier = new THREE.Group();
    pier.position.set(startX, startY, startZ);

    const woodMat = new THREE.MeshToonMaterial({
      color: 0x9c6644,
      gradientMap: ToonGradients.getThreeTone()
    });
    const postMat = new THREE.MeshToonMaterial({
      color: 0x7f4f24,
      gradientMap: ToonGradients.getThreeTone()
    });
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xddb892, roughness: 0.8 });

    const step = 0.5;
    const numPlanks = Math.floor(length / step);
    const zDir = dir === 'south' ? 1 : -1;

    for (let i = 0; i < numPlanks; i++) {
      const pz = i * step * zDir;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.44), woodMat);
      plank.position.set(0, 0, pz);
      plank.castShadow = true;
      pier.add(plank);

      // Support pillars every 4 planks
      if (i % 4 === 0) {
        [-1.0, 1.0].forEach(px => {
          const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), postMat);
          stilt.position.set(px, -1.0, pz);
          stilt.castShadow = true;
          pier.add(stilt);
        });
      }
    }

    // Mooring bollards at pier head with rope coil
    const endZ = (numPlanks - 1) * step * zDir;
    [-1.0, 1.0].forEach(px => {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8), postMat);
      bollard.position.set(px, 0.3, endZ);
      const rope = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 8), ropeMat);
      rope.position.set(px, 0.25, endZ);
      rope.rotation.x = Math.PI / 2;
      pier.add(bollard, rope);
    });

    this.group.add(pier);
  }

  private spawnNorthernBeacon(x: number, y: number, z: number) {
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(x, y, z);

    const stoneMat = new THREE.MeshToonMaterial({
      color: 0x6c757d,
      gradientMap: ToonGradients.getThreeTone()
    });
    const roofMat = new THREE.MeshToonMaterial({
      color: 0x1d3557,
      gradientMap: ToonGradients.getThreeTone()
    });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.85 });

    // Raised Circular Stone Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.8, 12), stoneMat);
    base.position.y = 0.4;
    base.castShadow = true;
    beaconGroup.add(base);

    // 4 Classical Pillars
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      const px = Math.cos(ang) * 2.2;
      const pz = Math.sin(ang) * 2.2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 3.2, 8), stoneMat);
      pillar.position.set(px, 2.0, pz);
      pillar.castShadow = true;
      beaconGroup.add(pillar);

      this.colliders.push({
        x: x + px,
        z: z + pz,
        radius: 0.45,
        name: 'beacon_pillar'
      });
    }

    // Glowing Lantern Centerpiece
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 8), glassMat);
    lantern.position.y = 2.2;
    const light = new THREE.PointLight(0xffb703, 2.5, 25);
    light.position.y = 2.2;
    beaconGroup.add(lantern, light);
    this.colliders.push({ x, z, radius: 0.75, name: 'beacon_lantern' });

    // Domed Peak Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.8, 12), roofMat);
    roof.position.y = 4.4;
    roof.castShadow = true;
    beaconGroup.add(roof);

    this.group.add(beaconGroup);
  }

  private spawnFlowerPatches() {
    const colors = [0xff758f, 0xffd166, 0x70d6ff, 0xffffff, 0xb5e2fa];
    for (let p = 0; p < 35; p++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * 50;
      const px = Math.cos(angle) * r;
      const pz = Math.sin(angle) * r;
      const py = this.getTerrainHeight(px, pz);
      if (py < 0.6 || py > 7.0) continue;

      const patchColor = colors[p % colors.length];
      const flowerMat = new THREE.MeshToonMaterial({
        color: patchColor,
        gradientMap: ToonGradients.getThreeTone()
      });
      const stemMat = new THREE.MeshToonMaterial({
        color: 0x52b788,
        gradientMap: ToonGradients.getThreeTone()
      });

      // Cluster of 4-6 flowers per patch
      for (let f = 0; f < 5; f++) {
        const fx = px + (Math.random() - 0.5) * 1.8;
        const fz = pz + (Math.random() - 0.5) * 1.8;
        const fy = this.getTerrainHeight(fx, fz);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4), stemMat);
        stem.position.set(fx, fy + 0.17, fz);

        const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), flowerMat);
        bloom.position.set(fx, fy + 0.35, fz);

        this.group.add(stem, bloom);
      }
    }
  }

  private spawnForestMushrooms() {
    const capMat = new THREE.MeshToonMaterial({
      color: 0xd90429,
      gradientMap: ToonGradients.getThreeTone()
    });
    const stemMat = new THREE.MeshToonMaterial({
      color: 0xfdf0d5,
      gradientMap: ToonGradients.getThreeTone()
    });
    const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Spawn mushrooms in Secret Grove (x < -25)
    for (let i = 0; i < 20; i++) {
      const mx = -32 - Math.random() * 20;
      const mz = (Math.random() - 0.5) * 25;
      const my = this.getTerrainHeight(mx, mz);
      if (my < 0.6) continue;

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 6), stemMat);
      stem.position.set(mx, my + 0.2, mz);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
      cap.position.set(mx, my + 0.4, mz);

      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), spotMat);
      spot.position.set(mx + 0.08, my + 0.48, mz + 0.08);

      this.group.add(stem, cap, spot);
    }
  }

  private spawnSignposts() {
    const woodMat = new THREE.MeshToonMaterial({
      color: 0x8b5a2b,
      gradientMap: ToonGradients.getThreeTone()
    });
    const signMat = new THREE.MeshToonMaterial({
      color: 0xd4a373,
      gradientMap: ToonGradients.getThreeTone()
    });

    // Signpost at Crossroads (0, 0, 18)
    const signGroup = new THREE.Group();
    const sy = this.getTerrainHeight(0, 18);
    signGroup.position.set(0, sy, 18);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6), woodMat);
    post.position.y = 0.8;

    // Arrow to Southern Beach
    const arrowBeach = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.06), signMat);
    arrowBeach.position.set(0.3, 1.3, 0.05);
    arrowBeach.rotation.z = -0.05;

    // Arrow to Central Lake
    const arrowLake = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.06), signMat);
    arrowLake.position.set(-0.3, 1.0, -0.05);
    arrowLake.rotation.z = 0.05;

    signGroup.add(post, arrowBeach, arrowLake);
    this.group.add(signGroup);

    // Register signpost collider
    this.colliders.push({ x: 0, z: 18, radius: 0.35, name: 'signpost' });
  }

  private spawnGrassTufts() {
    const grassMat = new THREE.MeshToonMaterial({
      color: 0x6dbf67,
      gradientMap: ToonGradients.getThreeTone(),
      side: THREE.DoubleSide
    });

    grassMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      this.grassUniforms = shader.uniforms;
      shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float sway = sin(uTime * 2.5 + position.x * 2.0 + position.z * 1.5) * 0.12 * max(0.0, position.y);
        transformed.x += sway;
        transformed.z += sway * 0.5;`
      );
    };

    const bladeGeo = new THREE.ConeGeometry(0.12, 0.65, 3);
    bladeGeo.scale(0.15, 1, 1);
    bladeGeo.translate(0, 0.32, 0);

    const maxBlades = 360;
    this.grassInstancedMesh = new THREE.InstancedMesh(bladeGeo, grassMat, maxBlades);
    this.grassInstancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let bladeIdx = 0;

    for (let i = 0; i < 110 && bladeIdx < maxBlades; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 68;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      const y = this.getTerrainHeight(x, z);
      if (y < 0.6 || y > 7.5) continue;
      if (Math.hypot(x - 25, z - 5) < 15) continue;
      if (Math.hypot(x, z - 5) < 4) continue;

      const numBlades = 3;
      for (let b = 0; b < numBlades && bladeIdx < maxBlades; b++) {
        dummy.position.set(
          x + (Math.random() - 0.5) * 0.3,
          y,
          z + (Math.random() - 0.5) * 0.3
        );
        const bladeAngle = (b / numBlades) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        dummy.rotation.set(0.15, bladeAngle, 0.2 + (Math.random() - 0.5) * 0.15);
        const s = 0.75 + Math.random() * 0.45;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        this.grassInstancedMesh.setMatrixAt(bladeIdx++, dummy.matrix);
      }
    }

    this.grassInstancedMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.grassInstancedMesh);
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

    // 2. Campfire with warm light and glowing embers
    const firePit = new THREE.Group();
    firePit.position.set(0, 0, 1.0);
    campGroup.add(firePit);

    // Ring of stones
    const stoneMat = new THREE.MeshToonMaterial({
      color: 0x6c757d,
      gradientMap: ToonGradients.getThreeTone()
    });
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), stoneMat);
      stone.position.set(Math.cos(ang) * 0.6, 0.1, Math.sin(ang) * 0.6);
      firePit.add(stone);
    }
    // Logs
    const logMat = new THREE.MeshToonMaterial({
      color: 0x4a2e18,
      gradientMap: ToonGradients.getThreeTone()
    });
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
    const woodMat = new THREE.MeshToonMaterial({
      color: 0xa0522d,
      gradientMap: ToonGradients.getThreeTone()
    });
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

    const termBodyMat = new THREE.MeshToonMaterial({
      color: 0x2a9d8f,
      gradientMap: ToonGradients.getThreeTone()
    });
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

    const boardMat = new THREE.MeshToonMaterial({
      color: 0xd4a373,
      gradientMap: ToonGradients.getThreeTone()
    });
    const boardPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), woodMat);
    boardPost.position.y = 0.75;
    const boardPanel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.08), boardMat);
    boardPanel.position.set(0, 1.1, 0);
    boardGroup.add(boardPost, boardPanel);

    this.interactableTerminals.push({
      pos: new THREE.Vector3(campX - 2.8, campY, campZ + 0.5),
      type: 'quest'
    });

    // Register campsite physical colliders
    this.colliders.push({ x: campX - 2.5, z: campZ - 1.5, radius: 1.75, name: 'camp_cabin' });
    this.colliders.push({ x: campX, z: campZ + 1.0, radius: 0.75, name: 'camp_firepit' });
    this.colliders.push({ x: campX + 1.5, z: campZ + 1.2, radius: 0.7, name: 'camp_bench' });
    this.colliders.push({ x: campX - 1.8, z: campZ + 1.5, radius: 0.55, name: 'camp_crate' });
    this.colliders.push({ x: campX + 2.8, z: campZ - 1.0, radius: 0.7, name: 'camp_shop_terminal' });
    this.colliders.push({ x: campX - 2.8, z: campZ + 0.5, radius: 0.6, name: 'camp_quest_board' });
  }

  public update(_dt: number, timeSec: number) {
    if (this.grassUniforms) {
      this.grassUniforms.uTime.value = timeSec;
    }
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
