# SOLARIS BREACH

A boss rush through a dying star system. Top-down twin-stick roguelike, pure
canvas, zero dependencies, zero build step.

Live: https://solaris-breach.pages.dev/

## Current state | v0.2

- Title screen (original v0.1) with working menu
- 3-slot save system ("sol-records") in localStorage: character, depth,
  vitality, relics, currencies, timestamp. Empty, active, and fallen
  (memorial) states. Purge with confirm.
- Depth I: **The Corona** — procedurally generated room-grid floor:
  - start, combat rooms, treasure room, shop, boss room, bombable secret room
  - doors lock during combat, sigil-locked shop doors
  - obstacles: ferrite chunks (bombable), breach rifts, solar shards
- Twin-stick combat: WASD move, arrow keys fire solar bolts, E places a nova
  charge, ESC pauses, M mutes
- 7 original enemy designs: Ember Mote, Pyre Wisp, Slag Husk (splits into
  Cinderlings), Vent Crawler, Ash Tick, Flare Node
- Boss: **Ignis, Warden of Mercury** — bolt rings, telegraphed wall-bouncing
  dashes, phase-two spiral barrage, ember summons
- 27 original relics (stat ups, multishot, homing, piercing, spectral,
  orbitals, on-hit novas, guard chance and more), pooled by room type, plus
  Eclipse Bargains that cost a heart container
- Pickups and economy: stellar hearts, solari, nova charges, warden sigils
- Infinite descent: each depth regenerates bigger and harder, saves persist
  per floor

The player character is the original Solaris Breach Helio Knight model from
the title screen, shared verbatim between menu and game (`Solaris Knight`).
Every enemy, relic, and pickup design is original vector art drawn with
canvas primitives.
