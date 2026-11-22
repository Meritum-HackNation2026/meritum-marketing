// One clock for picture and sound: 30 fps, 90 bpm, so a beat is 20 frames and a bar is 80.
// scripts/make-audio.mjs writes the music on the same grid; scenes start on bar lines.
export const FPS = 30;
export const BAR = 80;
export const TOTAL = 32 * BAR;

/** Frames a character takes in the form scene; scripts/make-audio.mjs uses the same cadence for the keys. */
export const TYPE_CADENCE = 1.75;
/** Frames between the words of the opening message. */
export const WORD_CADENCE = 3.4;
/** Frames one phase of the check takes on screen. */
export const PHASE = 34;

export const QUESTION = 'Prezydent w Polsce może rządzić przez trzy kadencje, a językiem urzędowym jest polski.';
