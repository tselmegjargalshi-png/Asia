"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

type Props = {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, THREE.IUniform>;
  transparent?: boolean;
  depthWrite?: boolean;
  blending?: THREE.Blending;
  toneMapped?: boolean;
  side?: THREE.Side;
};

/**
 * ShaderMaterial that keeps the caller's uniforms object by reference.
 * (R3F's declarative <shaderMaterial> copies uniforms, so later mutations
 * of the original object would never reach the GPU.)
 */
export function Shader({ vertexShader, fragmentShader, uniforms, ...rest }: Props) {
  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, ...rest }),
    // material parameters are static for the lifetime of each component
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vertexShader, fragmentShader, uniforms],
  );
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}
