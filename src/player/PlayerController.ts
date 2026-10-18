import * as THREE from 'three';
import { PlayerModel } from './PlayerModel';
import { IslandTerrain } from '../world/IslandTerrain';

export interface InputState {
  moveX: number; // -1 to 1
  moveZ: number; // -1 to 1
  isSprinting: boolean;
  actionPressed: boolean;
  interactPressed: boolean;
}

export class PlayerController {
  public playerModel: PlayerModel;
  public camera: THREE.PerspectiveCamera;
  public terrain: IslandTerrain;

  // Position & Orientation
  public position = new THREE.Vector3(0, 1.5, 5);
  public yaw = 0; // player rotation angle

  // Third-person Camera Orbit
  public cameraDistance = 9.5; // farther third-person camera as requested
  public cameraPitch = 0.35; // radians (tilt down)
  public cameraYaw = 0; // radians
  private isPointerDown = false;
  private prevPointerX = 0;
  private prevPointerY = 0;

  // Stamina
  public stamina = 100;
  public maxStamina = 100;

  // Jump physics
  public isGrounded = true;
  public velocityY = 0;

  // Speed
  private walkSpeed = 5.2;
  private sprintSpeed = 9.2;

  public jump() {
    if (this.isGrounded && this.stamina >= 5) {
      this.velocityY = 6.8;
      this.isGrounded = false;
      this.stamina -= 5;
    }
  }

  // Input
  public input: InputState = {
    moveX: 0,
    moveZ: 0,
    isSprinting: false,
    actionPressed: false,
    interactPressed: false
  };

  private keysDown: Record<string, boolean> = {};

  constructor(playerModel: PlayerModel, camera: THREE.PerspectiveCamera, terrain: IslandTerrain) {
    this.playerModel = playerModel;
    this.camera = camera;
    this.terrain = terrain;

    this.position.y = this.terrain.getTerrainHeight(this.position.x, this.position.z);
    this.playerModel.group.position.copy(this.position);

    this.bindEvents();
  }

  private bindEvents() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      this.keysDown[e.code] = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.input.isSprinting = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.input.isSprinting = false;
      }
    });

    // Mouse / Touch Camera Orbit Drag
    window.addEventListener('pointerdown', (e) => {
      // Don't drag if clicking on interactive UI elements
      if ((e.target as HTMLElement).closest('.interactive-ui')) return;
      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const dx = e.clientX - this.prevPointerX;
      const dy = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      const sensitivity = 0.005;
      this.cameraYaw -= dx * sensitivity;
      this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch + dy * sensitivity));
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    // Mouse wheel zoom
    window.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(5.0, Math.min(18.0, this.cameraDistance + e.deltaY * 0.005));
    }, { passive: true });
  }

  public setVirtualJoystick(vecX: number, vecZ: number) {
    this.input.moveX = vecX;
    this.input.moveZ = vecZ;
  }

  public update(dt: number, canMove = true) {
    // Read keyboard if not using virtual joystick
    if (Math.abs(this.input.moveX) < 0.01 && Math.abs(this.input.moveZ) < 0.01) {
      let kx = 0;
      let kz = 0;
      if (this.keysDown['KeyW'] || this.keysDown['ArrowUp']) kz += 1;
      if (this.keysDown['KeyS'] || this.keysDown['ArrowDown']) kz -= 1;
      if (this.keysDown['KeyA'] || this.keysDown['ArrowLeft']) kx -= 1;
      if (this.keysDown['KeyD'] || this.keysDown['ArrowRight']) kx += 1;
      const len = Math.hypot(kx, kz);
      if (len > 0) {
        this.input.moveX = kx / len;
        this.input.moveZ = kz / len;
      } else {
        this.input.moveX = 0;
        this.input.moveZ = 0;
      }
    }

    const isMoving = (Math.abs(this.input.moveX) > 0.05 || Math.abs(this.input.moveZ) > 0.05) && canMove;

    // Stamina calculation
    if (isMoving && this.input.isSprinting && this.stamina > 0) {
      this.stamina = Math.max(0, this.stamina - dt * 22);
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + dt * 16);
    }

    const isActuallyRunning = isMoving && this.input.isSprinting && this.stamina > 2;

    if (isMoving) {
      // Movement relative to camera orientation
      const camForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
      const camRight = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      const moveDir = new THREE.Vector3()
        .addScaledVector(camForward, this.input.moveZ)
        .addScaledVector(camRight, this.input.moveX)
        .normalize();

      const speed = isActuallyRunning ? this.sprintSpeed : this.walkSpeed;
      const nextX = this.position.x + moveDir.x * speed * dt;
      const nextZ = this.position.z + moveDir.z * speed * dt;

      // Island boundary clamp
      const dist = Math.hypot(nextX, nextZ);
      if (dist < 82) {
        this.position.x = nextX;
        this.position.z = nextZ;
      }

      // Smooth rotate player toward move direction
      const targetYaw = Math.atan2(moveDir.x, moveDir.z);
      this.yaw = this.lerpAngle(this.yaw, targetYaw, dt * 12);
      this.playerModel.group.rotation.y = this.yaw;

      this.playerModel.animState = isActuallyRunning ? 'run' : 'walk';
    } else {
      if (this.playerModel.animState === 'walk' || this.playerModel.animState === 'run') {
        this.playerModel.animState = 'idle';
      }
    }

    // Jump & gravity physics
    const groundY = this.terrain.getTerrainHeight(this.position.x, this.position.z);
    if (!this.isGrounded) {
      this.velocityY -= 18.0 * dt;
      this.position.y += this.velocityY * dt;
      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    } else {
      this.position.y = groundY;
    }

    this.playerModel.group.position.copy(this.position);

    // Update Player Model Animation
    this.playerModel.update(dt);

    // Update Camera Orbit & Follow
    this.updateCamera(dt);
  }

  private updateCamera(dt: number) {
    const target = this.position.clone().add(new THREE.Vector3(0, 1.2, 0));

    // Spherical orbit coordinates
    const cx = target.x + this.cameraDistance * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
    const cz = target.z + this.cameraDistance * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);
    let cy = target.y + this.cameraDistance * Math.sin(this.cameraPitch);

    // Prevent camera sinking into island terrain
    const terrainUnderCam = this.terrain.getTerrainHeight(cx, cz);
    cy = Math.max(cy, terrainUnderCam + 1.2);

    const desiredCamPos = new THREE.Vector3(cx, cy, cz);
    this.camera.position.lerp(desiredCamPos, dt * 8.5);
    this.camera.lookAt(target);
  }

  private lerpAngle(from: number, to: number, t: number): number {
    let diff = (to - from) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    return from + diff * Math.min(1, Math.max(0, t));
  }
}
