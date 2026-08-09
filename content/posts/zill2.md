+++
title = "Zill O'll Infinite Plus Translation Project, Part 2"
date = 2026-08-09T05:07:27-04:00
draft = false
+++


Some more scattered thoughts.

In the previous post I wrote about changing the dialogue banks from 16-bit to
32-bit offsets. This worked, but it was apparently not free. The larger message
area I added for the wide dialogue offsets lives in BSS, so it takes away memory
before the game's heap gets a chance to use it.

I had started getting crashes after playing for a while. The immediate failure
looked like a font problem: a widget tried to create another set of rendering
surfaces, received a null pointer, and carried on using it. The font was mostly
innocent. Looking at the allocator showed that there was simply no heap left.

Later PSP models have more memory, and a game can request it with `MEMSIZE=1` in
`PARAM.SFO`. PPSSPP supports this, so I added the option to translated builds,
cold-booted the game, and tried the same scene again.

It still crashed.

`MEMSIZE` made the extra memory available, but the game was not actually using
it. Its C runtime still reserved a fixed 17 MiB heap in the `UserSbrk` block it
uses for dynamic allocations, exactly as it did on the original PSP memory
layout. The remaining memory was sitting there untouched while the allocator
returned failure.

I found the heap-size value in the executable and increased it to 49 MiB. That
keeps the game's original 17 MiB and adds the extra 32 MiB made available by the
later PSP models. After rebuilding and cold-booting again, the crash was gone. I
have not reproduced an out-of-memory failure since.

{{< figure src="/images/zill2-combat.webp" alt="The translated game in combat against two monsters" caption="Combat in the translated build." >}}

I can't prove that this is why the developers used 16-bit dialogue offsets, but
the game is tight with memory in more places than one. Making the message banks
larger does not make all of the smaller buffers that receive their text any
larger.

One guild-board posting produced a particularly strange failure. The list of
jobs looked correct when I opened it, but after accepting one, all of the row
text disappeared. The labels were still present and correctly formatted in
memory, so I spent quite a while tracing the list refresh and state machine.

The actual corruption had already happened before I accepted anything. The
posting was copied into a 316-byte buffer, but the expanded English text used
340 bytes including its terminator. Those extra 24 bytes landed in the beginning
of the adjacent guild-list UI node. The list initially survived, then fell apart
when the acceptance path tried to relink the corrupted node.

Finding the tail of an English sentence where a set of pointers should have been
was a fairly good clue.

{{< figure src="/images/zill2-quest-finished.webp" alt="The Guildmaster congratulating the party after a completed quest" caption="Reporting a completed quest to the Guildmaster." >}}

I added the real 316-byte limit to the translation validator. The postings also
contain runtime substitutions for item names, monsters, destinations, and
numbers, so checking only the literal translated text would not be enough. The
validator now uses the longest value that can appear for each substitution and
checks that case.

It found 53 guild postings that could overflow the same buffer. I shortened and
reflowed all of them; the largest remaining worst case is 286 bytes plus its
terminator, leaving 29 bytes of headroom. This is much nicer than waiting for
another menu to turn into part of a sentence.

{{< figure src="/images/zill2-quest-reward.webp" alt="The party receiving experience and skill points after a quest" caption="Quest rewards in the translated build." >}}

The font is also no longer… not good for English.

The game uses a proportional bitmap font stored in 15×15-pixel atlas cells and
renders it at native scale. That is enough room for the original glyphs, but not
much room for an arbitrary desktop font. A replacement can look fine in a large
preview and immediately become blurry, too wide, or both on a 480×272 screen.

{{< figure src="/images/zill2-party-menu.webp" alt="The translated party menu showing character portraits and statistics" caption="The party menu, showing the translated UI and replacement font." >}}

I made a small pipeline to rasterize ordinary fonts into the game's format and
tried several of them in PPSSPP. Ubuntu Condensed and Roboto Condensed were
promising. PixAntiqua looked nice, but used too much horizontal space once it
was in the actual UI.

I eventually went back to Tahoma, rendered at 16 pixels per em (PPEM). It is not
an exciting choice, but it is compact, readable, and looks appropriate for a
PSP game. The replacement is now part of the normal build, so I do not have to
reinstall it every time the game is rebuilt.

{{< figure src="/images/zill2-magic-menu.webp" alt="The translated character Magic menu with Teleport selected" caption="Selecting a spell from the character Magic menu." >}}

While tracing the guild overflow, I also found the game's own implementation of
`strcpy` at `0x21fd30`. It is a small byte-by-byte copy that stops at NUL and has
no idea how large its destination is. There are 309 direct calls to it across
117 functions. Plenty.

I have not audited all of those calls yet. The useful approach is probably to
work through them one by one: find each destination and its capacity, figure out
which translated strings can reach it, and add each verified limit to the build
validator. I may also log some of the copies in PPSSPP while working through
them, but finding the function is not the same as proving every caller safe.

Overconfidently, I'd say I'm not too far away from being complete. I've played
about ten hours of the current build, and most of what I am finding now is odd
wording, untranslated text, or another very specific UI limit. There is still
plenty of QA left, but it is starting to feel like a game I could actually hand
to someone.

I'm sure the next menu will punish me for writing that.
