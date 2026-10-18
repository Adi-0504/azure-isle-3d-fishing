import * as THREE from 'three';
import { SeasonType, WeatherType } from '../../data/fish/CreatureDatabase';

export class WeatherTimeSystem {
  public timeOfDayMinutes: number; // 0 to 1440
  public season: SeasonType;
  public weather: WeatherType;
  public timeSpeed = 1.0; // 1 real sec = 1 in-game minute by default (24 min = full 1440 min day)

  // 3D Lighting, Sky & Atmosphere
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public skyDome!: THREE.Mesh;
  public skyGroup: THREE.Group;
  public rainParticles: THREE.Points | null = null;
  private rainGeo: THREE.BufferGeometry | null = null;
  private rainCount = 1200;
  private clouds: THREE.Group[] = [];
  private starPoints!: THREE.Points;
  private lastSkyUpdateMinute = -999;

  constructor(initialTime = 480, initialSeason: SeasonType = 'spring', initialWeather: WeatherType = 'sunny') {
    this.timeOfDayMinutes = initialTime;
    this.season = initialSeason;
    this.weather = initialWeather;
    this.skyGroup = new THREE.Group();
    this.skyGroup.name = 'sky_atmosphere';

    // Directional Sunlight with optimized crisp soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfff3b0, 1.8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 180;
    const d = 55;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;

    // Hemisphere Light (sky & ground ambient)
    this.hemiLight = new THREE.HemisphereLight(0xbde0fe, 0x8ecae6, 0.85);

    this.buildAtmosphericSkyDome();
    this.buildStylizedClouds();
    this.buildStarField();
    this.createRainSystem();
    this.updateLighting(0, null);
  }

  private buildAtmosphericSkyDome() {
    const skyGeo = new THREE.SphereGeometry(260, 32, 20);
    // Invert geometry so faces point inward
    skyGeo.scale(-1, 1, 1);

    const pos = skyGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    skyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const skyMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false
    });

    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.skyGroup.add(this.skyDome);
  }

  private buildStylizedClouds() {
    // Generate 12 cute, puffy Animal Crossing style low-poly cloud clusters
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      fog: false
    });

    for (let c = 0; c < 12; c++) {
      const cluster = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const radius = 6.0 + Math.random() * 5.0;
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 10
        );
        puff.scale.set(1.4, 0.7, 1.0);
        cluster.add(puff);
      }

      const angle = (c / 12) * Math.PI * 2;
      const dist = 75 + Math.random() * 70;
      cluster.position.set(
        Math.cos(angle) * dist,
        50 + Math.random() * 25,
        Math.sin(angle) * dist
      );
      this.skyGroup.add(cluster);
      this.clouds.push(cluster);
    }
  }

  private buildStarField() {
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Distribute along upper hemisphere dome
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 240;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 15; // only above horizon
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0,
      fog: false
    });

    this.starPoints = new THREE.Points(starGeo, starMat);
    this.skyGroup.add(this.starPoints);
  }

  public setWeather(w: WeatherType) {
    this.weather = w;
    if (this.rainParticles) {
      this.rainParticles.visible = (w === 'rainy');
    }
  }

  public setSeason(s: SeasonType) {
    this.season = s;
  }

  public getFormattedTime(): string {
    const hours = Math.floor(this.timeOfDayMinutes / 60) % 24;
    const mins = Math.floor(this.timeOfDayMinutes % 60);
    const hh = hours.toString().padStart(2, '0');
    const mm = mins.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  public isNight(): boolean {
    const h = (this.timeOfDayMinutes / 60) % 24;
    return h < 5.8 || h >= 19.5;
  }

  private createRainSystem() {
    this.rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x90e0ef,
      size: 0.18,
      transparent: true,
      opacity: 0.7
    });

    this.rainParticles = new THREE.Points(this.rainGeo, rainMat);
    this.rainParticles.visible = (this.weather === 'rainy');
  }

  public update(dt: number, scene: THREE.Scene, playerPos: THREE.Vector3) {
    // Advance time: 1440 min per 24 real minutes -> 1 min per real sec with timeSpeed = 1
    this.timeOfDayMinutes = (this.timeOfDayMinutes + dt * this.timeSpeed) % 1440;

    this.updateLighting(dt, scene);

    // Keep sky atmosphere centered around player
    this.skyGroup.position.copy(playerPos);

    // Drifting clouds
    for (const cloud of this.clouds) {
      cloud.position.x += dt * 1.5;
      if (cloud.position.x > 180) {
        cloud.position.x = -180;
      }
    }

    // Update rain particles around player
    if (this.weather === 'rainy' && this.rainParticles && this.rainGeo) {
      this.rainParticles.position.x = playerPos.x;
      this.rainParticles.position.z = playerPos.z;

      const pos = this.rainGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < this.rainCount; i++) {
        let y = pos.getY(i) - dt * 26.0;
        if (y < 0) {
          y = 28.0;
        }
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  }

  private updateLighting(_dt: number, scene: THREE.Scene | null) {
    const hour = (this.timeOfDayMinutes / 60) % 24;
    const sunAngle = ((hour - 6) / 24) * Math.PI * 2; // Sunrise at 6 AM

    // Sun trajectory
    const sunDist = 80;
    const sunX = Math.cos(sunAngle) * sunDist;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunZ = 20;

    this.sunLight.position.set(sunX, Math.max(-5, sunY), sunZ);

    const cZenith = new THREE.Color();
    const cHorizon = new THREE.Color();

    if (this.isNight()) {
      // Night lighting & starry indigo sky (magical moonlit night with clear visibility)
      this.sunLight.intensity = 0.55;
      this.sunLight.color.set(0x7da4d4);
      this.hemiLight.color.set(0x3a506b);
      this.hemiLight.groundColor.set(0x1c2541);
      this.hemiLight.intensity = 0.85;

      cZenith.set(0x0a1128);
      cHorizon.set(0x1c2541);
      if (this.starPoints) {
        (this.starPoints.material as THREE.PointsMaterial).opacity = 0.85;
      }
    } else if (hour >= 5.8 && hour <= 8.5) {
      // Sunrise pink/warm gold
      this.sunLight.intensity = 1.45;
      this.sunLight.color.set(0xffb703);
      this.hemiLight.color.set(0xffcad4);
      this.hemiLight.groundColor.set(0xe0a96d);
      this.hemiLight.intensity = 0.75;

      cZenith.set(0x4361ee);
      cHorizon.set(0xffb703);
      if (this.starPoints) {
        (this.starPoints.material as THREE.PointsMaterial).opacity = 0;
      }
    } else if (hour >= 17 && hour <= 19.5) {
      // Golden Hour Sunset
      this.sunLight.intensity = 1.6;
      this.sunLight.color.set(0xfb8500);
      this.hemiLight.color.set(0xff9e00);
      this.hemiLight.groundColor.set(0x9d0208);
      this.hemiLight.intensity = 0.8;

      cZenith.set(0x3a0ca3);
      cHorizon.set(0xfb8500);
      if (this.starPoints) {
        (this.starPoints.material as THREE.PointsMaterial).opacity = 0;
      }
    } else {
      // Midday bright and clear anime blue sky
      const isOvercast = this.weather !== 'sunny';
      this.sunLight.intensity = isOvercast ? 1.1 : 2.0;
      this.sunLight.color.set(isOvercast ? 0xd8e2dc : 0xfffae0);
      this.hemiLight.color.set(isOvercast ? 0xadb5bd : 0xbde0fe);
      this.hemiLight.groundColor.set(0x8ecae6);
      this.hemiLight.intensity = isOvercast ? 0.65 : 0.95;

      cZenith.set(isOvercast ? 0x6c757d : 0x1d3557);
      cHorizon.set(isOvercast ? 0xced4da : 0x90e0ef);
      if (this.starPoints) {
        (this.starPoints.material as THREE.PointsMaterial).opacity = 0;
      }
    }

    // Apply smooth vertex gradient to skyDome (throttled to minute increments for maximum FPS)
    const shouldUpdateSky = Math.abs(this.timeOfDayMinutes - this.lastSkyUpdateMinute) >= 1.0;
    if (this.skyDome && shouldUpdateSky) {
      this.lastSkyUpdateMinute = this.timeOfDayMinutes;
      const pos = this.skyDome.geometry.attributes.position;
      const colorAttr = this.skyDome.geometry.attributes.color as THREE.BufferAttribute;
      const tempCol = new THREE.Color();

      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        // Normalize y: -260 to 260 -> 0 to 1
        const t = Math.max(0, Math.min(1, (y + 40) / 300));
        tempCol.copy(cHorizon).lerp(cZenith, t);
        colorAttr.setXYZ(i, tempCol.r, tempCol.g, tempCol.b);
      }
      colorAttr.needsUpdate = true;
    }

    if (scene) {
      if (scene.background instanceof THREE.Color) {
        scene.background.copy(cHorizon);
      }
      if (scene.fog) {
        scene.fog.color.copy(cHorizon);
      }
    }
  }
}
