/**
 * Apple Design - WWDC 2018 Fluid Interfaces Spring Presets
 *
 * Springs are inherently interruptible, velocity-aware, and natural.
 * Damping ratio 1.0 = critically damped (no overshoot/bounce, smooth settle).
 * Damping ratio < 1.0 = oscillates (bounce).
 */

export const appleSprings = {
  /**
   * Default UI Spring (Critically Damped)
   * Recommended for most UI transitions, modal presentations, and reveals.
   * Damping 1.0 equivalent, graceful without distracting bounce.
   */
  default: {
    type: "spring" as const,
    bounce: 0,
    duration: 0.35,
  },

  /**
   * Snappy Spring
   * For quick UI feedback: menus, sheets, popovers, dropdowns.
   * Response ~0.28s, minimal overshoot.
   */
  snappy: {
    type: "spring" as const,
    bounce: 0.05,
    duration: 0.28,
  },

  /**
   * Momentum / Flick Spring
   * Add bounce ONLY when the gesture itself carried momentum (e.g. flick or drag release).
   * Damping ~0.8 equivalent.
   */
  momentum: {
    type: "spring" as const,
    bounce: 0.18,
    duration: 0.4,
  },

  /**
   * Gentle Spring
   * For larger structural repositioning, cards in view, background shifts.
   */
  gentle: {
    type: "spring" as const,
    bounce: 0,
    duration: 0.45,
  },

  /**
   * Interactive Switch / Toggle Spring
   */
  toggle: {
    type: "spring" as const,
    stiffness: 700,
    damping: 35,
  },
};

/**
 * Exponential decay momentum projection (Apple Fluid Interfaces WWDC 2018)
 * Computes projected resting point based on release velocity.
 */
export function projectMomentum(
  initialVelocity: number,
  decelerationRate: number = 0.998
): number {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Rubber-band resistance for boundaries (Apple Fluid Interfaces)
 * Produces soft resistance the farther past the boundary the gesture travels.
 */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant: number = 0.55
): number {
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}
