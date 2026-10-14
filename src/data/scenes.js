// Cutscenes and conversations, played one step at a time.
//
//   { say: 'julian', text: '...', expr: 'shocked' }   a character talks (expr is optional)
//   { narrate: '...' }                                text with no speaker
//   { choice: ['A', 'B'], branches: [[...], [...]] }  buttons; then the matching list of steps plays
//   { fade: 'in' | 'out', ms: 1000 }                  fade from / to black
//   { wait: 1000 }                                    pause (milliseconds)
//   { show: 'julian', at: 'door' }                    make a character appear at a named map point
//   { hide: 'julian' }
//   { move: 'julian', to: 'home', speed: 420 }        walk to a map point ('home' = where Tiled put them)
//   { flag: 'intro_done' }                            remember that something happened
//   { sleep: true | false }                           put the player in bed / get her up
//   { follow: 'julian' }                              this character now follows her everywhere
//   { warp: 'town', spawn: 'house', then: 'scene' }   go to another map, then play a scene there
//   { starter: true }                                 the screen where she picks her Juresamon
//   { battle: true }                                  the battle with Julian; then 'battle-win' or 'battle-flirt' plays
//   { end: true }                                     the closing screen
//
// In any line, {name} is her name, {playerMon} her Juresamon and {julianMon} Julian's.
//
// Talking to a character plays the scene called 'talk-<their name>', or 'follow-<their name>'
// if they are following her and the map is marked outside.
export const SCENES = {
  wakeup: [
    { sleep: true },
    { wait: 1200 },
    { narrate: '*Alarms ringing* BEEP BEEP BEEP BEEP' },
    { fade: 'in', ms: 1200 },
    { say: 'player', expr: 'yawn', text: '*yawwwwwwwn*' },
    { say: 'player', expr: 'yawn', text: 'Wait what time is it…' },
    { say: 'player', expr: 'shocked', text: 'OMG IM GOING TO BE LATE TO GET MY JURESAMON!!!' },
    { say: 'player', expr: 'sleep', text: 'Oh well…' },
    { show: 'julian', at: 'door' },
    { move: 'julian', to: 'home', speed: 420 },
    { say: 'julian', expr: 'adamant', text: 'HEYY you have to wake up!!!' },
    { say: 'player', expr: 'down', text: 'ughh' },
    { sleep: false },
    { flag: 'intro_done' },
  ],

  'talk-julian': [
    { say: 'julian', expr: 'adamant', text: 'Hey!! We have to go get our Juresamons, NO DILLY DALLYING!!!' },
    {
      choice: ['Dilly Dally', 'Distraction!!!'],
      branches: [
        [
          { say: 'player', expr: 'dance', text: '*dance dance dance*' },
          { say: 'julian', expr: 'dance', text: 'hehe *dance dance*' },
          { say: 'julian', expr: 'serious', text: 'WAIT WE HAVE TO GET TO BUSINESS!!!' },
        ],
        [
          { say: 'player', expr: 'kiss', text: 'mmmwwahhhh' },
          { say: 'julian', expr: 'blushing', text: 'hehee heh' },
          { say: 'julian', expr: 'serious', text: 'WAIT WE HAVE TO GET TO BUSINESS' },
        ],
      ],
    },
    { say: 'julian', expr: 'adamant', text: 'Our Juresamons are waiting for us at the lab!! we gotta hurry!' },
    { say: 'player', expr: 'down', text: 'blehhhh' },
    { move: 'julian', to: 'door', speed: 300 },
    { hide: 'julian' },
    { move: 'player', to: 'door' },
    { fade: 'out', ms: 400 },
    { flag: 'left_room' },
    { follow: 'julian' },
    { warp: 'town', spawn: 'house', then: 'arrive-town' },
  ],

  'arrive-town': [
    { fade: 'in', ms: 600 },
    { say: 'julian', expr: 'confused', text: 'Umm wait where is it again?' },
    { say: 'julian', expr: 'happy', text: 'Can you lead the way?!' },
  ],

  // Talking to Julian while he follows her around town.
  'follow-julian': [
    { say: 'julian', expr: 'confused', text: 'are we there yet??' },
  ],

  'door-locked': [
    { narrate: 'The door is locked.' },
  ],

  'talk-assistant': [
    { say: 'assistant', text: 'hi i am mini professor' },
  ],

  'talk-professor': [
    { say: 'professor', text: 'Hello Julian and {name}, are you ready to receive your promised Juresamon?' },
    { say: 'julian', expr: 'happy', text: 'Yes!!! We heard you were giving out glaceons and leafeons!!!!' },
    { say: 'player', expr: 'shocked', text: 'OMG REALLY??!!!' },
    { say: 'professor', text: 'Haha.. about that. Those were taken...' },
    { say: 'julian', expr: 'confused', text: 'Wut...' },
    { say: 'player', expr: 'neutral', text: '????' },
    { say: 'julian', expr: 'adamant', text: 'so what can we get?' },
    { say: 'professor', text: 'Here I caught some Juresamons for you at the famous Laundromat Forest! Take a look' },
    { say: 'julian', expr: 'confused', text: 'Alright...' },
    { say: 'professor', text: "NOOOOO YOU CAN'T PICK FIRST" },
    { say: 'professor', text: '{name}, go ahead! which one would you like?' },
    { starter: true },
    { say: 'julian', expr: 'dance', text: 'Wow!! My very own {julianMon}, what do you think cutestgirlever?' },
    { say: 'player', expr: 'dance', text: 'Yeah I think I think' },
    { say: 'assistant', text: 'NOW BATTLE!!!!!!!!!!!!!!!!' },
    { say: 'player', expr: 'shocked', text: 'what?' },
    { say: 'assistant', text: 'YOU HEARD ME BATTLE NOWWW!!!' },
    { battle: true },
  ],

  // After the battle, back in the lab. 'battle-<result>' plays depending on how it ended.
  'battle-win': [
    { say: 'julian', expr: 'serious', text: 'Wow that was a tough battle. You did a great job!!!' },
    { say: 'julian', expr: 'dance', text: 'ALSO HAPPY BIRTHDAY!!! YAY!!!!!' },
    { end: true },
  ],

  'battle-flirt': [
    { say: 'player', expr: 'neutral', text: 'aww julian can you just let me win pleaseeeee ill give you a kiss?' },
    { say: 'julian', expr: 'blushing', text: 'o-okay fine hehe' },
    { say: 'julian', expr: 'happy', text: 'you win!!' },
    { end: true },
  ],
};
