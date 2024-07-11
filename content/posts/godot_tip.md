+++
title = 'Godot Plugin Tool Script Type Detection'
date = 2024-07-11T14:20:30-04:00
draft = false
+++

When you have a tool script attached to a node in Godot's editor, it will run
both while you are editing the scene, and when it is attached to the editor
itself. You can differentiate between which 'kind' is runnig by checking the
viewport:

```c#
if (GetViewport()?.Name != "root") {
    return;
}
```

The edited scene will not have the root viewport as its nearest viewport.
