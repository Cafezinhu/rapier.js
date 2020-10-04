import {RawColliderSet, RawRigidBodySet} from "@dimforge/rapier-core2d"
import {Vector, Rotation} from '../math';
import {Collider, ColliderDesc, ColliderHandle} from './index'
import {RigidBody, RigidBodyHandle} from "../dynamics";
import {RigidBodySet} from "../dynamics";

export class ColliderSet {
    private RAPIER: any;
    raw: RawColliderSet;

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawColliderSet) {
        this.RAPIER = RAPIER;
        this.raw = raw || new RAPIER.RawColliderSet();
    }

    public createCollider(bodies: RigidBodySet, desc: ColliderDesc, parentHandle: RigidBodyHandle): ColliderHandle {
        let rawShape = desc.shape.intoRaw(this.RAPIER);
        let rawTra = Vector.intoRaw(this.RAPIER, desc.translation);
        let rawRot = desc.rotation.intoRaw(this.RAPIER);

        let handle = this.raw.createCollider(
            rawShape,
            rawTra,
            rawRot,
            parentHandle,
            bodies.raw,
        );

        rawShape.free();
        rawTra.free();
        rawRot.free();

        return handle;
    }

    public get(handle: ColliderHandle): Collider {
        if (this.raw.contains(handle)) {
            return new Collider(this.RAPIER, this.raw, handle);
        } else {
            return null;
        }
    }

    public len(): number {
        return this.raw.len();
    }

    public contains(handle: ColliderHandle): boolean {
        return this.raw.contains(handle);
    }


    public forEachCollider(f: (collider: Collider) => void) {
        this.forEachColliderHandle((handle) => {
            f(new Collider(this.RAPIER, this.raw, handle))
        })
    }

    public forEachColliderHandle(f: (handle: ColliderHandle) => void) {
        this.raw.forEachColliderHandle(f)
    }
}
