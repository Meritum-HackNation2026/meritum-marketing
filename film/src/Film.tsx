// The whole film: nine scenes on one track, the music under them, the interface sounds on their own tracks.
// Frame numbers are absolute here; the grid is in timeline.ts (a bar is 80 frames, scenes start on bars).
import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile, Track} from 'remotion';
import './fonts';
import {Grain} from './motion';
import {AbstainScene, ChannelsScene, Closing, DisplayScene, FormScene, Hook, HomeScene, ProgressScene, ResultScene} from './scenes';

export const Film = () => (
  <AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
    <Sequence name="1 Wiadomość" durationInFrames={200}>
      <Hook />
    </Sequence>
    <Sequence name="2 Strona główna" from={200} durationInFrames={240}>
      <HomeScene />
    </Sequence>
    <Sequence name="3 Formularz" from={440} durationInFrames={280}>
      <FormScene />
    </Sequence>
    <Sequence name="4 Sprawdzanie" from={720} durationInFrames={320}>
      <ProgressScene />
    </Sequence>
    <Sequence name="5 Wynik" from={1040} durationInFrames={560}>
      <ResultScene />
    </Sequence>
    <Sequence name="6 Brak dowodów" from={1600} durationInFrames={240}>
      <AbstainScene />
    </Sequence>
    <Sequence name="7 Wygląd" from={1840} durationInFrames={240}>
      <DisplayScene />
    </Sequence>
    <Sequence name="8 Kanały" from={2080} durationInFrames={270}>
      <ChannelsScene />
    </Sequence>
    <Sequence name="9 Zamknięcie" from={2320} durationInFrames={240}>
      <Closing />
    </Sequence>
    <Grain />

    <Track name="Muzyka">
      <Audio name="Muzyka" src={staticFile('audio/music.m4a')} volume={0.8} />
    </Track>
    <Track name="Przejścia">
      <Audio name="Słowa wiadomości" src={staticFile('audio/words.wav')} from={14} volume={0.7} />
      <Audio name="Podać dalej" src={staticFile('audio/whoosh.wav')} from={102} volume={0.6} />
      <Audio name="Do strony głównej" src={staticFile('audio/whoosh.wav')} from={184} volume={0.8} />
      <Audio name="Motyw ciemny" src={staticFile('audio/theme.wav')} from={1902} volume={0.7} />
      <Audio name="Wysoki kontrast" src={staticFile('audio/theme.wav')} from={2000} volume={0.7} />
      <Audio name="Do zamknięcia" src={staticFile('audio/whoosh.wav')} from={2316} />
    </Track>
    <Track name="Kliknięcia">
      <Audio name="Sprawdź informację" src={staticFile('audio/click.wav')} from={366} />
      <Audio name="Pole" src={staticFile('audio/click.wav')} from={478} />
      <Audio name="Wyślij" src={staticFile('audio/click.wav')} from={674} />
      <Audio name="Pokaż kroki" src={staticFile('audio/click.wav')} from={750} />
      <Audio name="Dymek siły" src={staticFile('audio/pop.wav')} from={1322} />
      <Audio name="Wygląd" src={staticFile('audio/click.wav')} from={1874} />
      <Audio name="Ciemny" src={staticFile('audio/click.wav')} from={1902} />
      <Audio name="Wygląd drugi raz" src={staticFile('audio/click.wav')} from={1972} />
      <Audio name="Kontrast" src={staticFile('audio/click.wav')} from={2000} />
    </Track>
    <Track name="Pisanie">
      <Audio name="Pisanie" src={staticFile('audio/typing.wav')} from={486} volume={0.55} />
    </Track>
    <Track name="Kroki">
      <Audio name="Krok 1" src={staticFile('audio/step.wav')} from={778} />
      <Audio name="Krok 2" src={staticFile('audio/step.wav')} from={812} />
      <Audio name="Krok 3" src={staticFile('audio/step.wav')} from={846} />
      <Audio name="Wyszukiwania" src={staticFile('audio/step.wav')} from={880} />
      <Audio name="Krok 5" src={staticFile('audio/step.wav')} from={914} />
      <Audio name="Cytaty" src={staticFile('audio/step.wav')} from={948} />
      <Audio name="Gotowe" src={staticFile('audio/done.wav')} from={982} />
    </Track>
    <Track name="Werdykty">
      <Audio name="Fałszywe" src={staticFile('audio/verdict-false.wav')} from={1076} />
      <Audio name="Potwierdzone" src={staticFile('audio/verdict-confirmed.wav')} from={1460} />
      <Audio name="Brak dowodów" src={staticFile('audio/verdict-open.wav')} from={1634} />
    </Track>
    <Track name="Kreski i wiersze">
      <Audio name="Kreska 1" src={staticFile('audio/tick.wav')} from={1171} durationInFrames={5} />
      <Audio name="Kreska 2" src={staticFile('audio/tick.wav')} from={1176} durationInFrames={5} />
      <Audio name="Kreska 3" src={staticFile('audio/tick.wav')} from={1181} />
      <Audio name="Kreska 4" src={staticFile('audio/tick.wav')} from={1555} durationInFrames={5} />
      <Audio name="Kreska 5" src={staticFile('audio/tick.wav')} from={1560} durationInFrames={5} />
      <Audio name="Kreska 6" src={staticFile('audio/tick.wav')} from={1565} />
      <Audio name="Strona WWW" src={staticFile('audio/tick.wav')} from={2152} />
      <Audio name="Discord" src={staticFile('audio/tick.wav')} from={2182} />
      <Audio name="Wtyczka" src={staticFile('audio/tick.wav')} from={2212} />
    </Track>
  </AbsoluteFill>
);
