+++
title = 'Xanadu Next: Patchwork'
date = 2026-07-29T09:19:02-04:00
draft = false
+++


I've created a handful of mods and a loader for the 2006 video game *Xanadu
Next*, collectively these do enough that I feel warranted in calling the modpack
*Xanadu Next: Patchwork*.

The project is available on GitHub:
[HK47196/Xanadu-Next-Patchwork](https://github.com/HK47196/Xanadu-Next-Patchwork).

I've created a mod loader, a replacement text renderer, and a ring menu for
swapping items and skills on a gamepad, inspired by the SNES Mana games.

## Ring menu

{{< video src="/videos/xanadu-next-patchwork-ring-menu.mp4" label="Xanadu Next: Patchwork ring menu demonstration" >}}

## Text renderer

Replacing the font renderer meant hooking the game's Direct3D 8 renderer, then
working backward through the executable to find out how it measures, lays out,
and draws text. That took extensive reverse engineering: tracing calls from
dialogue boxes and menus, identifying the relevant data structures, and finding
the points where the original renderer could be safely replaced.

Dialogue before:

![Dialogue using the original text renderer](/images/XANADU_011.webp)

Dialogue after:

![Dialogue using the replacement text renderer](/images/XANADU_008.webp)

System menu before:

![System menu using the original text renderer](/images/XANADU_010.webp)

System menu after:

![System menu using the replacement text renderer](/images/XANADU_009.webp)

The mod loader uses a small `dinput8` shim to load its DLL, then manages the
lifecycle of each mod.
