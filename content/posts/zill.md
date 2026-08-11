+++
title = "Zill O'll Infinite Plus Translation Project"
date = 2026-08-06T20:45:03-04:00
draft = false
+++


Some scattered thoughts.

I've been having a lot of fun hacking away at old video games, and lately most
of that time has gone into *Zill O'll Infinite Plus*. I've never really seen
anyone discuss it. It began as a PlayStation game, received a PlayStation 2
remake, and was expanded again for the PSP. None of these were released outside
of Japan. There was a prequel released in English, but from what I understand it
is mostly unrelated.

I can't really comment on the game yet, but it seems quite interesting and
perhaps not too dissimilar from the SaGa games in uniqueness. The translation
has ended up involving archive formats, scene scripts, executable patches, and a
lot of PPSSPP debugging.

I've made extensive use of AI, tho feeding it Japanese text line by line mostly
produces junk. For proper dialogue translation, the AI needs as much context as
possible: speakers, full dialogue, branches taken to this specific line, etc.,
An isolated row in a spreadsheet has none of that.

I made a translation dashboard to assist.

{{< figure src="/images/zill-translation-dashboard.webp" alt="The Zill O'll translation dashboard showing translation units and review progress" caption="My translation dashboard, used to track context-rich units through translation and review." >}}

The dialogue itself has an embedded scripting language, while also being
embedded inside a state machine. There are 279 message banks and 43,116 records,
but a record is not necessarily one line. It can contain control codes,
substitutions, and several branches, with the scene script deciding which one
the player actually sees.

That probably goes a long way towards explaining why nobody has done a proper
fan translation. Extracting the strings is not enough; I have to preserve the
structure around them too.

When I finally tried building all of the translated banks, six did not fit.
This was not just a few badly worded lines. English was a little longer in
hundreds of places, and it added up to about 10–25 KB too much in each of the
failing banks.

The retail header looked like this:

```c
uint16_t message_count;
uint16_t message_offsets[message_count];
uint8_t  message_data[];
```

Each offset is measured from the beginning of the bank. The surrounding archive
can hold a larger file, but a 16-bit offset means that no message can start past
byte 65,535. Shortening a few lines was not going to fix this.

Thankfully, the executable side was not quite as bad as it could have been. I
opened the decrypted executable in Rizin and traced the two lookup paths. The
current message offset was already held in a word; the limit came from the table
math and the `lhu` instructions that loaded 16-bit values.

I changed the translated banks to this:

```c
uint16_t message_count;
uint16_t reserved;
uint32_t message_offsets[message_count];
uint8_t  message_data[];
```

The reserved halfword keeps the table aligned for MIPS `lw` instructions. All
279 translated banks use the new format together. Extraction and the original
source files still use the retail layout.

The first version of this patch changed twelve MIPS instructions. That covered
the two readers as well as a less obvious message-call return value that could
still have truncated a wide offset.

The build checks the source executable and the expected bytes at every patch
site before changing anything. I also found that PPSSPP uses `EBOOT.BIN` when it
contains a valid ELF, so patching only `BOOT.BIN` changes the wrong copy. The
built game now gets the same patched decrypted ELF as both files.

Everything compiled and the game booted. Then it crashed during an opening
scene transition.

The CPU had followed an indirect callback to a nonsense address. The corrupted
pointer contained a short piece of English dialogue, which made me suspect the
small buffer used for expanding one message. The bytes around it turned out to
be a continuous piece of `msgsec137`, though, rather than one expanded string.

This fixed the file format, but not the memory layout. The retail loader was
still copying the larger bank into an overlapping static area sized around the
original files. `msgsec137` ran into the globals after it and overwrote a
resource-manager pointer. Not ideal.

I ended up adding a new `0x24000`-byte message area to BSS at `0x344000`,
extending the writable segment through `0x368000`. BSS is just zero-initialized
writable memory reserved by the executable.

The new area is split up like this:

```text
bank 0                    capacity 0x09000
special sections 165–167 capacity 0x04000
ordinary message banks   capacity 0x17000
```

I redirected the loader, resolver, and byte reader there, then updated the
special-slot addresses, the ordinary-slot initializer, and the ELF metadata.
By that point the change involved 21 MIPS instruction edits and two ELF metadata
edits. I left the old area allocated because moving the unrelated globals around
it did not seem worth the risk.

The build now checks that every compiled bank fits in the place where it will
actually be loaded. This is a much more useful error than finding out through a
corrupted function pointer.

I also wanted to make sure the old buffer was really unused. I put a PPSSPP
read/write watchpoint across the old `0x18800`-byte area and played through the
opening scene that used to crash. It showed the translated dialogue without a
single access to that range.

For one final check, I used the debugger to request message `1370632` from bank
137. Its offset is 65,579, just past the old limit. It rendered normally and the
game kept running. This was a much nicer test than wandering around and hoping
the right oversized bank happened to appear.

The build checks the banks, patch sites, archive rebuilds, and final executable
now, mostly so I do not have to rediscover these problems later. It builds into
a temporary game tree and only replaces the previous one after everything has
passed.

The font is… not good for English. I will probably make a small glyph patch and
maybe look further into the rendering path.

There is still plenty of manual work as well. Profiles, prompts, equipment
names, and long descriptions all have slightly different problems, and many of
them only become obvious in the game.

{{< figure src="/images/zill-qa-profile-overflow.webp" alt="A character profile overflowing its UI panel" caption="Character profile text overflowing its UI panel." >}}

{{< figure src="/images/zill-qa-consultation-overflow.webp" alt="A consultation prompt overflowing its UI panel" caption="A consultation prompt running past the edge of its panel." >}}

{{< figure src="/images/zill-qa-untranslated-equipment.webp" alt="Untranslated Japanese item names in the equipment menu" caption="Equipment text that still needs translation." >}}

{{< figure src="/images/zill-qa-description-overflow.webp" alt="An equipment description overflowing the bottom text box" caption="An equipment description overflowing the bottom text box." >}}

Making the banks bigger also does not make every smaller buffer bigger. One
overly long response overran its storage and damaged the character name next to
it. I traced the write, found the actual byte limit, added it to the validator,
and reflowed the affected text.

{{< figure src="/images/zill-buffer-overflow-crash.webp" alt="PPSSPP reporting an invalid memory access in Zill O'll Infinite Plus" caption="What happens when I don't keep a close enough eye on string sizes." >}}

Some fixes require executable patches. Others are just rules and checks in the
tools.

The project can build a complete translated PPSSPP game tree now, including all
of the message banks and the executable patches. What is left is mostly QA:
reviewing the prose, finding untranslated text, fitting things into odd UI
elements, and fixing the font and presentation problems that only show up
in-game.

I still want to compare the PSP backgrounds with the PlayStation 2 ones, since
they may be higher quality.

I'd like to get a v0.1 out eventually and maybe get some feedback and bug
reports. After this much time staring at message banks, I would not mind someone
else finding a few problems.
