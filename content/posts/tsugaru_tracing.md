+++
title = 'Reverse Engineering DOS Games on FM Towns'
date = 2025-12-04T12:48:14-05:00
draft = false
+++

I've been reverse engineering old DOS games, and one of the biggest headaches is segmented memory. Real-mode x86 is painful to work with in Ghidra - even if the tooling wasn't lacking, dealing with segmented memory is still difficult.

So I've been looking for ports that avoid it. Enter the FM Towns.

## Why FM Towns?

The FM Towns is a bit of an oddity. It's x86-based, but it's *not* IBM PC compatible - it ran its own custom version of MS-DOS and won't work with DOSBox. What makes it interesting for RE is that applications used a DOS extender by default, giving you flat 32-bit protected mode binaries instead of segmented real-mode nightmares.

The FM Towns was popular in Japan, and many Western games got Japanese ports. If a game you're interested in has a Towns version, there's a good chance you can work with a flat memory model instead.

From what I've seen, most of these applications use the Phar Lap DOS extender. I've written a Ghidra loader for the P3 format (the most common one I've encountered) - I'll get that on GitHub eventually.

## Adding tracing to Tsugaru

Static analysis only gets you so far. I wanted to record execution traces, so I forked [Tsugaru](https://github.com/captainys/TOWNSEMU) (the main FM Towns emulator) to add tracing support.

Traces are stored in SQLite for easy querying. The tracer runs on a separate thread, so runtime overhead is minimal.

```
STARTTRACE output.db -SNAPINT 0 -PCRANGE 0x400000 0x450ee3 -ADAPTIVE 1000
```

The flags:

- `-PCRANGE`: Only trace instructions within this address range. This is in linear address space so you'll need to figure out the mappings.
- `-SNAPINT 0`: Snapshot interval - 0 disables periodic memory snapshots, otherwise it's in # of instructions.
- `-ADAPTIVE 1000`: Throttle capture after 1000 hits to the same address

This captures memory reads/writes, CALLs, and RETs for instructions in the specified range.

## Keeping trace sizes manageable

Naive tracing would generate gigabytes in minutes. The tracer deduplicates aggressively and uses adaptive throttling to back off from hotspots. Playing Ultima Underworld for 30 minutes produced about 214MiB of trace data, with growth slowing significantly after the first ~150MiB as the throttling kicks in.

## What's next

I'll cover how I'm using these traces to map out Ultima Underworld's internals in a future post. The Ghidra loader and the Tsugaru fork will be on my GitHub once they're cleaned up.
