"use client";

let gsapRegistered = false;

export async function getGsap() {
  if (typeof window === "undefined") return null;
  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  if (!gsapRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    gsapRegistered = true;
  }
  return { gsap, ScrollTrigger };
}
