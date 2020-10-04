import {RawRigidBodySet} from "@dimforge/rapier-core2d"
import {Rotation, Vector, VectorInterface} from '../math.ts';
import {ColliderHandle} from "../geometry";

export type RigidBodyHandle = number;

export enum BodyStatus {
    Dynamic = 0,
    Static,
    Kinematic,
}

export class RigidBody {
    private RAPIER: any;
    private rawSet: RawRigidBodySet; // The RigidBody won't need to free this.
    readonly handle: RigidBodyHandle;

    constructor(RAPIER: any, rawSet: RawRigidBodySet, handle: RigidBodyHandle) {
        this.RAPIER = RAPIER;
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /**
     * Checks if this rigid-body is still valid (i.e. that it has
     * not been deleted from the rigid-body set yet.
     */
    public isValid(): boolean {
        return this.rawSet.contains(this.handle);
    }

    /**
     * The world-space translation of this rigid-body.
     */
    public translation(): Vector {
        let res = this.rawSet.rbTranslation(this.handle);
        return Vector.fromRaw(res);
    }

    /**
     * The world-space orientation of this rigid-body.
     */
    public rotation(): Rotation {
        let res = this.rawSet.rbRotation(this.handle);
        return Rotation.fromRaw(res);
    }

    /**
     * The world-space predicted translation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicTranslation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
    public predictedTranslation(): Vector {
        let res = this.rawSet.rbPredictedTranslation(this.handle);
        return Vector.fromRaw(res);
    }

    /**
     * The world-space predicted orientation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicRotation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
    public predictedRotation(): Rotation {
        let res = this.rawSet.rbPredictedRotation(this.handle);
        return Rotation.fromRaw(res);
    }

    /**
     * Sets the translation of this rigid-body.
     *
     * @param tra - The world-space position of the rigid-body.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     *                 wasn't moving before modifying its position.
     */
    public setTranslation(tra: VectorInterface, wakeUp: boolean,) {
        // #if DIM2
        this.rawSet.rbSetTranslation(this.handle, tra.x, tra.y, wakeUp);
        // #else
        this.rawSet.rbSetTranslation(this.handle, tra.x, tra.y, tra.z, wakeUp);
        // #endif
    }

    /**
     * Sets the rotation quaternion of this rigid-body.
     *
     * This does nothing if a zero quaternion is provided.
     *
     * @param rotation - The rotation to set.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     */
    // #if DIM3
    public setRotation(rot: Rotation, wakeUp: boolean) {
        this.rawSet.rbSetRotation(this.handle, rot.x, rot.y, rot.z, rot.w, wakeUp);
    }

    // #endif

    /**
     * Sets the rotation angle of this rigid-body.
     *
     * @param angle - The rotation angle, in radians.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     */
    // #if DIM2
    public setRotation(angle: number, wakeUp: boolean) {
        this.rawSet.rbSetRotation(this.handle, angle, wakeUp);
    }

    // #endif

    /**
     * If this rigid body is kinematic, sets its future translation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setTranslation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param t - The kinematic translation to set.
     */
    public setNextKinematicTranslation(t: Vector) {
        // #if DIM2
        this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y);
        // #else
        this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y, t.z);
        // #endif
    }

    /**
     * If this rigid body is kinematic, sets its future rotation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setRotation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param rot - The kinematic rotation to set.
     */
    // #if DIM3
    public setNextKinematicRotation(rot: Rotation) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, rot.x, rot.y, rot.z, rot.w);
    }

    // #endif

    /**
     * If this rigid body is kinematic, sets its future rotation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setRotation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param angle - The kinematic rotation angle, in radians.
     */
    // #if DIM2
    public setNextKinematicRotation(angle: number) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, angle);
    }

    // #endif

    /**
     * The linear velocity of this rigid-body.
     */
    public linvel(): Vector {
        return Vector.fromRaw(this.rawSet.rbLinvel(this.handle));
    }

    /**
     * The angular velocity of this rigid-body.
     */
    // #if DIM3
    public angvel(): Vector {
        return Vector.fromRaw(this.rawSet.rbAngvel(this.handle));
    }

    // #endif

    /**
     * The angular velocity of this rigid-body.
     */
    // #if DIM2
    public angvel(): number {
        return this.rawSet.rbAngvel(this.handle);
    }

    // #endif

    /**
     * The mass of this rigid-body.
     */
    public mass(): number {
        return this.rawSet.rbMass(this.handle);
    }

    /**
     * Put this rigid body to sleep.
     *
     * A sleeping body no longer moves and is no longer simulated by the physics engine unless
     * it is waken up. It can be woken manually with `this.wakeUp()` or automatically due to
     * external forces like contacts.
     */
    public sleep() {
        this.rawSet.rbSleep(this.handle);
    }

    /**
     * Wakes this rigid-body up.
     *
     * A dynamic rigid-body that does not move during several consecutive frames will
     * be put to sleep by the physics engine, i.e., it will stop being simulated in order
     * to avoid useless computations.
     * This methods forces a sleeping rigid-body to wake-up. This is useful, e.g., before modifying
     * the position of a dynamic body so that it is properly simulated afterwards.
     */
    public wakeUp() {
        this.rawSet.rbWakeUp(this.handle);
    }

    /**
     * The number of colliders attached to this rigid-body.
     */
    public numColliders(): number {
        return this.rawSet.rbNumColliders(this.handle);
    }

    /**
     * Retrieves the handle of the `i-th` collider attached to this rigid-body.
     *
     * @param i - The index of the collider to retrieve. Must be a number in `[0, this.numColliders()[`.
     *         This index is **not** the same as the unique identifier of the collider.
     */
    public collider(i: number): ColliderHandle {
        return this.rawSet.rbCollider(this.handle, i);
    }

    /**
     * The status of this rigid-body: static, dynamic, or kinematic.
     */
    public bodyStatus(): BodyStatus {
        return this.rawSet.rbBodyStatus(this.handle);
    }

    /**
     * Is this rigid-body sleeping?
     */
    public isSleeping(): boolean {
        return this.rawSet.rbIsSleeping(this.handle);
    }

    /**
     * Is the velocity of this rigid-body not zero?
     */
    public isMoving(): boolean {
        return this.rawSet.rbIsMoving(this.handle);
    }

    /**
     * Is this rigid-body static?
     */
    public isStatic(): boolean {
        return this.rawSet.rbIsStatic(this.handle);
    }

    /**
     * Is this rigid-body kinematic?
     */
    public isKinematic(): boolean {
        return this.rawSet.rbIsDynamic(this.handle);
    }

    /**
     * Is this rigid-body dynamic?
     */
    public isDynamic(): boolean {
        return this.rawSet.rbIsStatic(this.handle);
    }

    /**
     * Applies a force at the center-of-mass of this rigid-body.
     *
     * @param force - the world-space force to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyForce(force: VectorInterface, wakeUp: boolean) {
        const rawForce = Vector.intoRaw(this.RAPIER, force);
        this.rawSet.rbApplyForce(this.handle, rawForce, wakeUp);
        rawForce.free();
    }

    /**
     * Applies an impulse at the center-of-mass of this rigid-body.
     *
     * @param impulse - the world-space impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyImpulse(
        impulse: VectorInterface,
        wakeUp: boolean,
    ) {
        const rawImpulse = Vector.intoRaw(this.RAPIER, impulse);
        this.rawSet.rbApplyImpulse(this.handle, rawImpulse, wakeUp);
        rawImpulse.free();
    }

    /**
     * Applies a torque at the center-of-mass of this rigid-body.
     *
     * @param torque - the torque to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    // #if DIM2
    public applyTorque(torque: number, wakeUp: boolean) {
        this.rawSet.rbApplyTorque(this.handle, torque, wakeUp);
    }

    // #endif

    /**
     * Applies a torque at the center-of-mass of this rigid-body.
     *
     * @param torque - the world-space torque to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    // #if DIM3
    public applyTorque(torque: VectorInterface, wakeUp: boolean) {
        const rawTorque = Vector.intoRaw(this.RAPIER, torque);
        this.rawSet.rbApplyTorque(this.handle, rawTorque, wakeUp);
        rawTorque.free();
    }

    // #endif

    /**
     * Applies an impulsive torque at the center-of-mass of this rigid-body.
     *
     * @param torqueImpulse - the torque impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    // #if DIM2
    public applyTorqueImpulse(torqueImpulse: number, wakeUp: boolean) {
        this.rawSet.rbApplyTorqueImpulse(this.handle, torqueImpulse, wakeUp);
    }

    // #endif

    /**
     * Applies an impulsive torque at the center-of-mass of this rigid-body.
     *
     * @param torqueImpulse - the world-space torque impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    // #if DIM3
    public applyTorqueImpulse(torqueImpulse: VectorInterface, wakeUp: boolean) {
        const rawTorqueImpulse = Vector.intoRaw(this.RAPIER, torqueImpulse);
        this.rawSet.rbApplyTorqueImpulse(this.handle, rawTorqueImpulse, wakeUp);
        rawTorqueImpulse.free();
    }

    // #endif

    /**
     * Applies a force at the given world-space point of this rigid-body.
     *
     * @param force - the world-space force to apply on the rigid-body.
     * @param point - the world-space point where the impulse is to be applied on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyForceAtPoint(
        force: VectorInterface,
        point: VectorInterface,
        wakeUp: boolean,
    ) {
        const rawForce = Vector.intoRaw(this.RAPIER, force);
        const rawPoint = Vector.intoRaw(this.RAPIER, point);
        this.rawSet.rbApplyForceAtPoint(this.handle, rawForce, rawPoint, wakeUp);
        rawForce.free();
        rawPoint.free();
    }

    /**
     * Applies an impulse at the given world-space point of this rigid-body.
     *
     * @param impulse - the world-space impulse to apply on the rigid-body.
     * @param point - the world-space point where the impulse is to be applied on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyImpulseAtPoint(
        impulse: VectorInterface,
        point: VectorInterface,
        wakeUp: boolean,
    ) {
        const rawImpulse = Vector.intoRaw(this.RAPIER, impulse);
        const rawPoint = Vector.intoRaw(this.RAPIER, point);
        this.rawSet.rbApplyImpulseAtPoint(this.handle, rawImpulse, rawPoint, wakeUp);
        rawImpulse.free();
        rawPoint.free();
    }
}

export class RigidBodyDesc {
    translation: Vector;
    rotation: Rotation;
    linvel: Vector;
    // #if DIM2
    angvel: number;
    // #endif
    // #if DIM3
    angvel: Vector;
    // #endif
    status: BodyStatus;
    canSleep: boolean;

    constructor(status: BodyStatus) {
        this.status = status;
        this.translation = Vector.zeros();
        this.rotation = Rotation.identity();
        this.linvel = Vector.zeros();
        // #if DIM2
        this.angvel = 0.0;
        // #endif
        // #if DIM3
        this.angvel = Vector.zeros();
        // #endif
        this.canSleep = true;
    }

    /**
     * Sets the initial translation of the rigid-body to create.
     *
     * @param tra - The translation to set.
     */
    public setTranslation(tra: Vector): RigidBodyDesc {
        this.translation = tra;
        return this;
    }

    /**
     * Sets the initial rotation of the rigid-body to create.
     *
     * @param rot - The otation to set.
     */
    public setRotation(rot: Rotation): RigidBodyDesc {
        this.rotation = rot;
        return this;
    }

    /**
     * Sets the initial linear velocity of the rigid-body to create.
     *
     * @param vel - The linear velocity to set.
     */
    public setLinvel(vel: Vector): RigidBodyDesc {
        this.linvel = vel;
        return this;
    }

    /**
     * Sets the initial angular velocity of the rigid-body to create.
     *
     * @param vel - The angular velocity to set.
     */
    // #if DIM2
    public setAngvel(vel: number): RigidBodyDesc {
        this.angvel = vel;
        return this;
    }

    // #endif

    /**
     * Sets the initial angular velocity of the rigid-body to create.
     *
     * @param vel - The angular velocity to set.
     */
    // #if DIM3
    public setAngvel(vel: Vector): RigidBodyDesc {
        this.angvel = vel;
        return this;
    }

    // #endif

    /**
     * Sets whether or not the rigid-body to create can sleep.
     *
     * @param can - true if the rigid-body can sleep, false if it can't.
     */
    public setCanSleep(can: boolean): RigidBodyDesc {
        this.canSleep = can;
        return this;
    }
}