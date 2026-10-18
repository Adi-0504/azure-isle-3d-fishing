import * as THREE from 'three';
import { SeasonType, WeatherType } from '../../data/fish/CreatureDatabase';

export class WeatherTimeSystem {
  public timeOfDayMinutes: number; // 0 to 1440
  public season: SeasonType;
  public weather: WeatherType;
  public timeSpeed = 1.0; // 1 real sec = 1 in-game minute by default (24 min = full 1440 min day)

  // 3D Lighting & Sky
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public rainParticles: THREE.Points | null = null;
  private rainGeo: THREE.BufferGeometry | null = null;
  private rainCount = 1200;

  constructor(initialTime = 480, initialSeason: SeasonType = 'spring', initialWeather: WeatherType = 'sunny') {
    this.timeOfDayMinutes = initialTime;
    this.season = initialSeason;
    this.weather = initialWeather;

    // Directional Sunlight with soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfff3b0, 1.8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 150;
    const d = 45;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;

    // Hemisphere Light (sky & ground ambient)
    this.hemiLight = new THREE.HemisphereLight(0xbde0fe, 0x8ecae6, 0.8);

    this.createRainSystem();
    this.updateLighting(0);
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
    return h < 6 || h >= 19.5;
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

    this.updateLighting(dt);

    // Update rain particles around player
    if (this.weather === 'rainy' && this.rainParticles && this.rainGeo) {
      this.rainParticles.position.x = playerPos.x;
      this.rainParticles.position.z = playerPos.z;

      const pos = this.rainGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < this.rainCount; i++) {
        let y = pos.getY(i) - dt * 24.0;
        if (y < 0) {
          y = 28.0;
        }
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  }

  private updateLighting(_dt: number) {
    const hour = (this.timeOfDayMinutes / 60) % 24;
    const sunAngle = ((hour - 6) / 24) * Math.PI * 2; // Sunrise at 6 AM

    // Sun trajectory
    const sunDist = 70;
    const sunX = Math.cos(sunAngle) * sunDist;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunZ = 20;

    this.sunLight.position.set(sunX, Math.max(-5, sunY), sunZ);

    if (this.isNight()) {
      // Night lighting
      this.sunLight.intensity = 0.2;
      this.sunLight.color.set(0x3a5a40);
      this.hemiLight.color.set(0x1d3557);
      this.hemiLight.groundColor.set(0x03071e);
      this.hemiLight.intensity = 0.4;
    } else if (hour >= 6 && hour <= 8.5) {
      // Sunrise pink/warm gold
      this.sunLight.intensity = 1.4;
      this.sunLight.color.set(0xffb703);
      this.hemiLight.color.set(0xffcbf2);
      this.hemiLight.groundColor.set(0xe0a96d);
      this.hemiLight.intensity = 0.7;
    } else if (hour >= 17 && hour <= 19.5) {
      // Golden Hour Sunset
      this.sunLight.intensity = 1.5;
      this.sunLight.color.set(0xfb8500);
      this.hemiLight.color.set(0xffaa00);
      this.hemiLight.groundColor.set(0x7f4f24);
      this.hemiLight.intensity = 0.75;
    } else {
      // Midday bright and clear
      const isOvercast = this.weather !== 'sunny';
      this.sunLight.intensity = isOvercast ? 1.0 : 1.9;
      this.sunLight.color.set(isOvercast ? 0xd8e2dc : 0xfffae0);
      this.hemiLight.color.set(isOvercast ? 0xadb5bd : 0xbde0fe);
      this.hemiLight.groundColor.set(0x8ecae6);
      this.hemiLight.intensity = isOvercast ? 0.6 : 0.9;
    }
  }
}
