+++
title = "Zill O'll Infinite Plus Translation Project"
date = 2026-08-06T20:45:03-04:00
draft = false
+++


Some scattered thoughts.

Been having a lot of fun hacking away at old video games. I've never really seen
anyone discuss this game before. It originally launched on the PS1, got a remake
for the PS2, and an enhanced port to the PSP. None of these were released
outside of Japan. It received a prequel which did release outside of Japan, but
seems largely unrelated in terms of gameplay.

I can't comment on the game but it seems quite interesting, perhaps not too
dissimilar from the SaGa games in uniqueness.

I've made extensive use of AI for this translation, and made my own translation
dashboard to assist. I've done a few AI-assisted game translations now and I've
got a good grasp on the process: you need a lot of context to properly translate
games from languages like Japanese to English. Feeding it line-by-line just
produces junk.

{{< figure src="/images/zill-translation-dashboard.webp" alt="The Zill O'll translation dashboard showing translation units and review progress" caption="My translation dashboard, used to track units through translation and review." >}}

The font is… not good for English. I'm probably going to make a minor patch to
the glyphs and maybe investigate the rendering path to improve it.

The dialogue banks are limited to 16-bit, which is an issue due to JP being much
more information dense than EN. Rather than trying to hack down the translation
to fit, I shifted the BSS down and made a minor patch to pull dialogue from
larger banks. During local testing I put traps on the old bank location to make
sure nothing is attempting to access it.

This still requires a lot of manual work to fit strings into various UI
elements, fix overlaps, and so on.

Some examples from QA:

{{< figure src="/images/zill-qa-profile-overflow.webp" alt="A character profile overflowing its UI panel" caption="Character profile text overflowing its UI panel." >}}

{{< figure src="/images/zill-qa-consultation-overflow.webp" alt="A consultation prompt overflowing its UI panel" caption="A consultation prompt running past the edge of its panel." >}}

{{< figure src="/images/zill-qa-untranslated-equipment.webp" alt="Untranslated Japanese item names in the equipment menu" caption="Equipment text that still needs translation." >}}

{{< figure src="/images/zill-qa-description-overflow.webp" alt="An equipment description overflowing the bottom text box" caption="An equipment description overflowing the bottom text box." >}}

The dialogue itself has an embedded scripting language, while also being
embedded inside a state machine. This probably goes a long way towards
explaining why nobody has done proper fan translations.


I also have to be very careful with string sizes. I plan on attempting to trace
and monitor any writes that may cause a buffer overflow…

{{< figure src="/images/zill-buffer-overflow-crash.webp" alt="PPSSPP reporting an invalid memory access in Zill O'll Infinite Plus" caption="What happens when I don't keep a close enough eye on string sizes." >}}

Many of the fixes involve actual executable patches.

Another thing on my TODO list is to check the PS2 prerendered backgrounds as
they may have been higher quality.

I'd like to get a v0.1 out eventually and maybe get some feedback/bug reports.
