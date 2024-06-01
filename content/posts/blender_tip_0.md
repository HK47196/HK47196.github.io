+++
title = 'Blender Tip #1'
date = 2024-06-01T16:47:31-04:00
draft = false
+++

In my spare time I do some hard edge modeling & level design in Blender. As
anyone who has used Blender is aware, Blender is rather difficult to learn. I've
been using it for a very long time off and on, and thought I'd share some tips.
To start this out, here's a tip for detecting faces with incorrect normals.

First, click the 'Overlays' dropdown in the top-right of the 3D editor, and
toggle on 'Face Orientation':

![Image](/images/blender_tip_0.jpg)

Seems simple so far, but this will add a highlight to both faces with their
normal pointing towards and away from the camera. We just want the faces with
the normals pointing away, so we must go into the preferences(Edit →
Preferences). Select the 'Themes' tab on the left, click the '3D Viewport' tab
on the right to toggle it open. Scroll down to 'Face Orientation Front':

![Image](/images/blender_tip_1.avif)

What you want to do is lower the alpha value of this color to 0, so that there
is no overlay for faces that are oriented towards us. Save your preferences.

To make sur the overlay is enabled at startup, you must save the scene as your
startup file(File → Defaults → Save Startup File).

Here's an example of how it should look, with faces that are pointing away
appearing red after I've removed a face from the default cube:

![Image](/images/blender_tip_2.jpg)

Very handy for level design to quickly find faces that need their normal
flipped.
