import { lineType, main, process } from './importer';

describe('Process song text', () => {

  test('Match chordpro metadata', () => {
    const result = process(
`{title:Distant Sun}
{subtitle:Crowded House}
{capo:2}

some other line`);
console.log(result);
    expect(result.title).toEqual('Distant Sun');
    expect(result.subtitle).toEqual('Crowded House');
    expect(result.capo).toEqual('2');
    expect(result.song).toEqual('\nsome other line');
  });

  test('Match alternative chordpro metadata', () => {
    const result = process(
`{t:Black}
{st:Pearl Jam}
{capo:2}

some other line`);

    expect(result.title).toEqual('Black');
    expect(result.subtitle).toEqual('Pearl Jam');
    expect(result.capo).toEqual('2');
    expect(result.song).toEqual('\nsome other line');
  });

  test('Match capo type 1', () => {
    const result = process(`Capo 2`);

    expect(result.capo).toEqual('2');
    expect(result.song).toEqual('');
  });

  test('Match capo type 2', () => {
    const result = process(`Capo 6th fret`);

    expect(result.capo).toEqual('6');
    expect(result.song).toEqual('');
  });

  test('Match capo type 3', () => {
    const result = process(`Capo on 1`);

    expect(result.capo).toEqual('1');
    expect(result.song).toEqual('');
  });

  test('Match chordpro chorus tag', () => {
    const result = process(`{start_of_chorus}`);

    expect(result.song).toEqual('## Chorus');
  });

  test('Match chordpro bridge tag', () => {
    const result = process(`{start_of_bridge}`);

    expect(result.song).toEqual('## Bridge');
  });

  test('Match instrumental tag', () => {
    const result = process(`Instrumental`);

    expect(result.song).toEqual('## Instrumental');
  });

  test('Match instrumental tag /w suffix', () => {
    const result = process(`Instrumental:`);

    expect(result.song).toEqual('## Instrumental');
  });

  test('Match instrumental tag /w [] decorators', () => {
    const result = process(`[Instrumental]`);

    expect(result.song).toEqual('## Instrumental');
  });

  test('Match outro tag /w suffix', () => {
    const result = process(`Outro:`);

    expect(result.song).toEqual('## Outro');
  });

  test('Match chorus tag /w suffix', () => {
    const result = process(`Chorus:`);

    expect(result.song).toEqual('## Chorus');
  });

  test('Match verse tag /w index', () => {
    const result = process(`Verse 3`);

    expect(result.song).toEqual('## Verse');
  });

  test('Match verse tag /w suffix', () => {
    const result = process(`Verse:`);

    expect(result.song).toEqual('## Verse');
  });

  test('Match verse tag /w [] decorators and index', () => {
    const result = process(`[Verse 1]`);

    expect(result.song).toEqual('## Verse');
  });

  test('Match solo 1 tag /w suffix', () => {
    const result = process(`[Solo 1]`);

    expect(result.song).toEqual('## Solo');
  });

  test('Match chord block', () => {
    const result = process(
`Riff 1
G     320003
C     x32010
B:      [x2440x]
F#m4/7: [x442xx]
Dsus4     xx0233
D         xx0232
Bsus2/F#  224422
Dsus4/G   3x0233`);

console.log(result.song);

    expect(result.song).toEqual(
`Riff 1
\`\`\`chordpro
G     320003
C     x32010
B:      [x2440x]
F#m4/7: [x442xx]
Dsus4     xx0233
D         xx0232
Bsus2/F#  224422
Dsus4/G   3x0233
\`\`\`
`
    );
  });

  test('Match guitar tab block', () => {
    const result = process(
`    C#    A    B    Eb/E   F#                 
e|--0-----0----0-----0-----0---|
B|--0-----0----0-----0-----0---|
G|--4-----4----4-----4-----3---|   X 3
D|--2-----2----4-----x-----4---|
A|--4-----0----2\\----2-----4---|
E--9b(11)-7---7------7---10b(12)b(11)7~~~-7-------------------12b(14)br12-10-12-12b(14)~~`);

    expect(result.song).toEqual(
`\`\`\`chordpro
    C#    A    B    Eb/E   F#
e|--0-----0----0-----0-----0---|
B|--0-----0----0-----0-----0---|
G|--4-----4----4-----4-----3---|   X 3
D|--2-----2----4-----x-----4---|
A|--4-----0----2\\----2-----4---|
E--9b(11)-7---7------7---10b(12)b(11)7~~~-7-------------------12b(14)br12-10-12-12b(14)~~
\`\`\`
`);
  });

  test('Regression The Outsider', () => {
    const result = process(
`The Outsider - A Perfect Circle
 
[Intro]
 
C#|-------------------------------------------------|
G#|-------------------------------------------------|
E |-----9---9-------9---9-------9---9-------9-------|
B |-------9-----------9-----------9-----------9-----|
F#|-7-----------7-----------7-----------7---------0-|
C#|-------------------------------------------------|
 
C#|--------------------------------------------------|
G#|--------------------------------------------------|
E |-----9---9-------9---9-------9---9----------------|
B |-------7-----------7---0-------7------------------|
F#|-5-----------5-----------------------------10--p9-|
C#|-------------------------8-----------8------------|
 
C#|----------------------------------------------------|
G#|----------------------------------------------------|
E |-----9---9-------9---9-------9---9---10p9---7h9p7---|
B |-------9-----------9-----------9---9------9-------7-|
F#|-7-----------7-----------7--------------------------|
C#|----------------------------------------------------|


`);

    expect(result.song).toEqual(
`The Outsider - A Perfect Circle

## Intro

\`\`\`chordpro
C#|-------------------------------------------------|
G#|-------------------------------------------------|
E |-----9---9-------9---9-------9---9-------9-------|
B |-------9-----------9-----------9-----------9-----|
F#|-7-----------7-----------7-----------7---------0-|
C#|-------------------------------------------------|

C#|--------------------------------------------------|
G#|--------------------------------------------------|
E |-----9---9-------9---9-------9---9----------------|
B |-------7-----------7---0-------7------------------|
F#|-5-----------5-----------------------------10--p9-|
C#|-------------------------8-----------8------------|

C#|----------------------------------------------------|
G#|----------------------------------------------------|
E |-----9---9-------9---9-------9---9---10p9---7h9p7---|
B |-------9-----------9-----------9---9------9-------7-|
F#|-7-----------7-----------7--------------------------|
C#|----------------------------------------------------|
\`\`\`
`);
  });

  test('Regression chord-line space prefix', () => {
    const result = process(
`another line
            C                                                                Dm
And did you have to pay that fine you was dodging all the time are you still dizzy
      Dm
still dizzy?`);

      expect(result.song).toEqual(
`another line
&nbsp;           C                                                                Dm
And did you have to pay that fine you was dodging all the time are you still dizzy
&nbsp;     Dm
still dizzy?`);
  });

  test('Regression chord-line space prefix following section', () => {
    const result = process(
`\`\`\`

## Verse

        G
I ain't slept in seven days`);

      expect(result.song).toEqual(
`\`\`\`

## Verse

&nbsp;       G
I ain't slept in seven days`);
  });

  test('Regression verse matched as chord-line', () => {
    const result = lineType('And I\'ve missed your ginger hair and the way you like to dress');

    expect(result.type).toEqual('lyric-line');
  });

  test('Regression chord-line verse mismatch', () => {
    const result = process(
`      F                                Em
'Cos since I've come on home, well my body's been a mess
         F                                   Em
And I've missed your ginger hair and the way you like to dress
F                            Em                   G
Won't you come on over, stop making a fool out of me
                                   C             Dm           C             Dm
Why don't you come on over Va-a-lerie, Valerie-e-ee, Va-a-alerie, Valerie-e-ee`);

      expect(result.song).toEqual(
`&nbsp;     F                                Em
'Cos since I've come on home, well my body's been a mess
&nbsp;        F                                   Em
And I've missed your ginger hair and the way you like to dress
F                            Em                   G
Won't you come on over, stop making a fool out of me
&nbsp;                                  C             Dm           C             Dm
Why don't you come on over Va-a-lerie, Valerie-e-ee, Va-a-alerie, Valerie-e-ee`);
  });
});
