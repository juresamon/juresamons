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
//   { teleport: 'professor' }                         spin on the spot and fly up out of sight
//   { flag: 'intro_done' }                            remember that something happened
//   { sleep: true | false }                           put the player in bed / get her up
//   { follow: 'julian' }                              this character now follows her everywhere
//   { unfollow: true }                                whoever is following her stops, right where they are
//   { warp: 'town', spawn: 'house', then: 'scene' }   go to another map, then play a scene there
//   { starter: true }                                 the screen where she picks her Juresamon
//   { battle: true }                                  the battle with Julian; then 'battle-win' or 'battle-flirt' plays
//   { scene: 'after-battle' }                         play another scene's steps here, then carry on
//   { ifFlag: 'x', then: 'scene-a', else: 'scene-b' } play one scene if a flag is set, the other if not
//   { end: true }                                     the closing screen (not used for now)
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

  // Julian's front door once he's home. Pressing Space at it plays 'julian-door'; walking into it
  // plays 'julian-door-walk', which also steps her back unless the lock is broken.
  'julian-door': [
    { ifFlag: 'find_julian', then: 'force-door', else: 'door-locked' },
  ],

  'julian-door-walk': [
    { scene: 'julian-door' },
    { ifFlag: 'door_broken', else: 'step-back-from-door' },
  ],

  'step-back-from-door': [
    { move: 'player', to: 'julian-door-back' },
  ],

  'door-locked': [
    { narrate: "Door is locked, it won't open..." },
  ],

  'force-door': [
    { narrate: "Door is locked, it won't open..." },
    { say: 'player', expr: 'neutral', text: 'Hmmm... should i force it open?' },
    { narrate: 'You unleash your super strength from working out and easily break the lock' },
    { flag: 'door_broken' },
  ],

  // Walking into Julian's door while the two of them are still looking for the lab.
  'not-the-lab': [
    { say: 'julian', expr: 'confused', text: "I don't think this is the lab..." },
    { move: 'player', to: 'julian-door-back' },
  ],

  // The dog guarding the way north until the Professor takes over.
  'talk-dog': [
    { say: 'dog', text: 'ARF ARF (you shall not pass)' },
  ],

  'dog-blocks': [
    { say: 'dog', text: 'ARF ARF (you shall not pass)' },
    { move: 'player', to: 'exit-back' },
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
    { scene: 'after-battle' },
  ],

  'battle-flirt': [
    { say: 'player', expr: 'neutral', text: 'aww julian can you just let me win pleaseeeee ill give you a kiss?' },
    { say: 'julian', expr: 'blushing', text: 'o-okay fine hehe' },
    { say: 'julian', expr: 'happy', text: 'you win!!' },
    { say: 'julian', expr: 'dance', text: 'Also HAPPY BIRTHDAY!!!!!' },
    { scene: 'after-battle' },
  ],

  // Both ways of winning end up here. The Professor warps off to the top of town and Julian heads home.
  'after-battle': [
    { say: 'julian', expr: 'confused', text: "Well... I guess it isn't your birthday anymore" },
    { say: 'professor', text: 'ENOUGH TALKING YOU TWO!!!!!' },
    { say: 'professor', text: 'That was a wonderful battle. You and {playerMon} already make a great team, {name}!' },
    { say: 'assistant', text: 'w battle w {playerMon}' },
    { say: 'professor', text: "I think you're both ready to step out into the big wide world of Juresamons!" },
    { say: 'professor', text: "Out there you'll find new towns, new friends, and lots of wild Juresamons hiding in the tall grass." },
    { say: 'professor', text: "Meet me at the north end of town, I'll show you something important" },
    { teleport: 'professor' },
    { flag: 'professor_outside' },
    { say: 'julian', expr: 'confused', text: 'How did he do that...' },
    { say: 'julian', expr: 'happy', text: "Anyways I'm gonna stop by my house first. I'll see you soon!!" },
    { unfollow: true },
    { move: 'julian', to: 'entry', speed: 320 },
    { hide: 'julian' },
    { flag: 'julian_home' },
  ],

  // The Professor waits at the top of town and won't let her onto the route alone.
  // Talking to him plays 'professor-town'; walking up to him does too, then sends her back.
  'professor-town': [
    { ifFlag: 'find_julian', then: 'professor-hurry', else: 'professor-first' },
  ],

  'professor-stop': [
    { scene: 'professor-town' },
    { move: 'player', to: 'exit-back' },
  ],

  'professor-first': [
    { say: 'professor', text: 'ALRIGHT LETS GOOO CATCH SOME JURESAMONNN!!!' },
    { say: 'professor', text: "Wait where's Julian?" },
    { say: 'player', expr: 'neutral', text: 'i think he said he had something to do?' },
    { say: 'professor', text: 'Alright well could you go get him' },
    { say: 'professor', text: 'HURRRRYYYYYY' },
    { say: 'professor', text: 'STOP TALKING TO ME AND HURRY NOWWWWWWW' },
    { flag: 'find_julian' },
  ],

  'professor-hurry': [
    { say: 'professor', text: 'HURRRYYYYY' },
  ],

  // Julian at home. The dance battle comes next (not made yet).
  'talk-julian-house': [
    { say: 'julian', expr: 'happy', text: 'Hey {name}!' },
    { say: 'player', expr: 'down', text: 'Professor said to hurry :(' },
    { say: 'julian', expr: 'serious', text: 'Alright alright lets go...' },
    { say: 'julian', expr: 'dance', text: 'AFTER YOU BEAT ME IN A DANCE BATTLE!!' },
  ],

  'julian-pc': [
    { narrate: 'The wallpaper is wellmade. Must be made by a true artisan hehe' },
  ],

  'julian-bed': [
    { narrate: 'Looking at the bed makes you want to dilly dally...' },
    { narrate: 'MUST RESIST!!!!' },
  ],

  'mailbox-home': [
    { narrate: "{name}'s house" },
  ],

  'mailbox-julian': [
    { narrate: "Julian's house" },
  ],

  'sign-town': [
    { narrate: 'Welcome to Monkey Town!!' },
  ],

  'sign-lab': [
    { narrate: "Professor's Epic Lab" },
  ],

  'sign-route': [
    { narrate: 'ROUTE 1 - north to the next city' },
  ],
};
