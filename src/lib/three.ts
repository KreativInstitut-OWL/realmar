import { useMemo } from "react";
import * as THREE from "three";
import { degreesToRadians } from "./math";

export function decomposeMatrix4(
  matrixData?: THREE.Matrix4Tuple | THREE.Matrix4
) {
  matrixData = matrixData ?? DEFAULT_TRANSFORM;

  const matrix = Array.isArray(matrixData)
    ? new THREE.Matrix4().fromArray(matrixData)
    : matrixData.clone();

  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, quaternion, scale);

  const rotation = new THREE.Euler().setFromQuaternion(quaternion);

  return { position, scale, quaternion, rotation, matrix };
}

export const useDecomposeMatrix4 = (
  matrixData?: THREE.Matrix4Tuple | THREE.Matrix4
) => useMemo(() => decomposeMatrix4(matrixData), [matrixData]);

// prettier-ignore
export const DEFAULT_TRANSFORM: THREE.Matrix4Tuple = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

export function getScaleSafeValue(value: number) {
  return value === 0 ? 1e-6 : value;
}

export function composeVector3WithComponent(
  vector: THREE.Vector3,
  component: Vector3Component,
  value: number
) {
  return new THREE.Vector3(
    component === "x" ? value : vector.x,
    component === "y" ? value : vector.y,
    component === "z" ? value : vector.z
  );
}

export function composeEulerWithComponent(
  euler: THREE.Euler,
  component: Vector3Component,
  value: number
) {
  return new THREE.Euler(
    component === "x" ? value : euler.x,
    component === "y" ? value : euler.y,
    component === "z" ? value : euler.z
  );
}

export function composeQuaternionWithComponent(
  quaternion: THREE.Quaternion,
  component: QuaternionComponent,
  value: number
) {
  return new THREE.Quaternion(
    component === "x" ? value : quaternion.x,
    component === "y" ? value : quaternion.y,
    component === "z" ? value : quaternion.z,
    component === "w" ? value : quaternion.w
  ).normalize();
}

export function composeScaleWithComponent(
  scale: THREE.Vector3,
  component: Vector3Component,
  value: number,
  scaleUniformly = false
) {
  const safeValue = getScaleSafeValue(value);

  if (scaleUniformly) {
    // Get the original component value safely
    const originalSafeValue = getScaleSafeValue(scale[component]);

    // Calculate the scale factor based on the ratio between new and old value
    const scaleFactor = safeValue / originalSafeValue;

    // Apply this factor to maintain proportions
    return new THREE.Vector3(
      scale.x * scaleFactor,
      scale.y * scaleFactor,
      scale.z * scaleFactor
    );
  } else {
    // Original non-uniform scaling behavior
    return new THREE.Vector3(
      component === "x" ? safeValue : scale.x,
      component === "y" ? safeValue : scale.y,
      component === "z" ? safeValue : scale.z
    );
  }
}

export type MatrixComponent = "position" | "rotation" | "scale" | "quaternion";
export type Vector3Component = "x" | "y" | "z";
export type QuaternionComponent = "x" | "y" | "z" | "w";

/**
 * Applies a value to a matrixComponent of a matrix (position, rotation, quaternion, scale) for one
 */
export function composeMatrix4WithMatrixComponentAndComponent(
  matrixData: THREE.Matrix4 | THREE.Matrix4Tuple,
  matrixComponent: MatrixComponent,
  component: QuaternionComponent | Vector3Component,
  value: number,
  scaleUniformly = false
): THREE.Matrix4 {
  const { position, quaternion, rotation, scale } =
    decomposeMatrix4(matrixData);

  const matrix = new THREE.Matrix4().compose(
    matrixComponent === "position"
      ? composeVector3WithComponent(
          position,
          component as Vector3Component,
          value
        )
      : position,
    matrixComponent === "rotation"
      ? new THREE.Quaternion().setFromEuler(
          composeEulerWithComponent(
            rotation,
            component as Vector3Component,
            degreesToRadians(value)
          )
        )
      : matrixComponent === "quaternion"
        ? composeQuaternionWithComponent(quaternion, component, value)
        : quaternion,
    matrixComponent === "scale"
      ? composeScaleWithComponent(
          scale,
          component as Vector3Component,
          value,
          scaleUniformly
        )
      : scale
  );

  return matrix;
}
