---
title: "ECHO"
subtitle: "Browser-native draft listening with system voices and live word tracking"
year: 2026
status: "Browser-local reader active"
description: "A browser-local draft-listening surface with file import, live playback, and ECHO, Ariel, and Voice11 delivery presets."
role: "Creator"
outputs:
  - "Live browser playback with play, pause, and stop controls"
  - "Word-by-word tracking for listening through drafts"
  - "Consolidated ECHO, Ariel, and Voice11 delivery presets"
  - "File import for .txt, .md, .docx, and .pdf with local extraction"
tags:
  - App in development
  - Text to speech
  - English
  - French
  - Audio tooling
featured: false
image: "/assets/geometric-motif-bottomleft.png"
imageAlt: "ECHO text-to-speech app surface for bilingual audio generation."
links:
  - label: "Open ECHO app (new window)"
    url: "/echo/"
---

*ECHO* is a browser-local draft-listening surface for hearing writing back through the voices already installed on a device.

The current app surface consolidates **ECHO**, **Ariel**, and **Voice11** under one route: `/echo/`.
It now runs as a live browser reader: import file or paste text -> choose a profile and system voice -> play, pause, or stop with live highlighting.

The profiles shape pacing and tonal intent while the actual voice catalog comes from the browser and operating system. That keeps the route local-first and zero-cost while still supporting English and French when those voices are available on-device.

The current work is focused on revision through listening: hearing cadence, awkward phrasing, and sentence-level rhythm without sending text to a backend.
This build uses browser speech synthesis and local document extraction, with no paid API requirement.

Source provenance for this import pass:

`C:\Users\softinfo\Desktop\MODELS\VOICE 11`
