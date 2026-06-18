+++
title = "Ultima Underworld PSX outside a PlayStation: AbyssX"
date = 2026-06-18T00:00:00-04:00
draft = false
+++

I've been working on **AbyssX**, a C++20 reimplementation of the PlayStation version of *Ultima Underworld*.

It is still incomplete, but it has reached a fun point: I can wander around the first level, interact with objects, manage inventory, and get into fights.

{{< youtube Eg8ncxRtjvs >}}

## What is working

The video is mostly me poking around level one, but a lot has to be in place before that is possible:

- the original BIN/CUE game data is read locally
- `DATA/AVATAR` resources are loaded through the native storage layer
- map and object state are far enough along for first-level exploration
- inventory handling works
- combat works
- world object interaction works
- input and VSync-style timing are connected to the recovered game loop
- rendering is far enough along to make the level playable
- native audio, video, and platform backends cover enough of the PSX-facing contracts for early gameplay

There is a useful modding path now, too.

At startup, AbyssX can build a virtual `DATA/AVATAR` archive from local override files. That lets me experiment with resource changes without patching the original disc image. I used that to adapt an existing English patch into a native text override.

## What is not working yet

Plenty.

AddressSanitizer is especially noisy right now. Some crashes are ordinary reimplementation bugs. Others come from recovered original out of bounds indexing, buffer overflows, etc.,

Still, it is a good milestone. Enough of the recovered game is running through native systems that the result feels like a game again. It's like seeing light at the end of a very, very long tunnel.

## What's next

The next phase is mostly correctness work:

- work through AddressSanitizer crashes, including unsafe assumptions inherited from the original game code
- improve rendering and audio edge cases
- expose local save storage cleanly
- keep filling in map, object, script, and resource semantics
- compare more behavior against the original PlayStation executable
