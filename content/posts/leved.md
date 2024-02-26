+++
title = 'A design for LevEd, a Level Editor'
date = 2023-12-26T08:48:30-05:00
draft = true
+++

In my spare time I enjoy tinkering on video game prototypes. A wall I've
frequently hit is the lack of a good level editor that satisfies my needs.


Prior to switching to Godot, I finally settled on an in-editor tool for Unity
called UModeler which worked really well! After switching to Godot, I've
investigated Trenchbroom with the Qodot import and it does a lot of what I want,
but not quite everything. It's just not built for what I want to do.


I'm familiar with using Blender, but I find it too unwieldy for what I want to
do here. The Godot editor has their CSG tools, but that's just for quick
    prototyping, and I found it much worse than just using Trenchbroom. I've
also tried the Cyclops level editor, but it's lacking features I'd want  and is
constrained by the Godot editor itself.


I also spent some time researching what level editors do(and used to do) that
might make for good features, including Valve's latest iteration of Hammer.

Therefore, I'll outline some key features for LevEd:

* Standalone program, not bolted onto Godot's editor.
* Level geometry only. Not the editor for the whole game. Anything that isn't
  level geometry is intended to be added inside Godot itself.
* CSG. The workhorse of level design.
* The user shouldn't care about the mesh topology. Trenchbroom is a good example
  here. I just want to push, pull, extrude, subtract, cut, and so on. I don't
  want to spend time fighting with edge loops.
* Interactive UV editor, again, inspired by Trenchbroom.
    1. Trenchbroom makes use of the Valve 220 map format to alt-shift-click and
       apply textures. Really useful!
* Vertex painting. Also, arbitrary vertex data?
* Useful tools such as extruding, bevels, and so forth.
* GLTF-only export, designed for direct import into Godot.
* Not a prototyping tool. While it will be usable for this, it will firstly be a
  tool for creating whole levels.

With regards to the Trenchbroom UV, taken from its manual:

| Modifier Keys | Meaning |
| --- | --- |
| Alt | Transfer texture and attributes from selected face (by projecting it on to the target faces) |
| AltShift | Transfer texture and attributes from selected face (by rotating it on to the target faces, available on Valve format maps only) |
| AltCtrl | Transfer texture only (attributes of the target are preserved) |

>To clarify, using the Alt modifier copies the source face’s texture projection to the target face without altering it. Sometimes this is desirable, but it can lead to the target face having a stretched texture if the face normals are very different. The AltShift combination avoids this by rotating the source face’s texture projection onto the target face, but it’s only available on Valve format maps.


This is a very useful feature.

Hoping to get a working prototype up quickly to see what works and what doesn't.
