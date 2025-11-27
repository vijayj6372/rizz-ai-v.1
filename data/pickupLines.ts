export const flirtyPickupLines = [
  "Are you a magician? Because whenever I look at you, everyone else disappears.",
  "Do you have a map? I just got lost in your eyes.",
  "Is your name Google? Because you have everything I've been searching for.",
  "Are you a parking ticket? Because you've got fine written all over you.",
  "Do you believe in love at first sight, or should I walk by again?",
  "I must be a snowflake, because I've fallen for you.",
  "Are you a camera? Because every time I look at you, I smile.",
  "If you were a vegetable, you'd be a cute-cumber.",
  "Is it hot in here, or is it just you?",
  "Do you have a Band-Aid? I just scraped my knee falling for you.",
  "Are you made of copper and tellurium? Because you're Cu-Te.",
  "I was blinded by your beauty... I'm going to need your name and number for insurance purposes.",
  "If beauty were time, you'd be an eternity.",
  "Are you a bank loan? Because you've got my interest.",
  "I'm not a photographer, but I can picture us together.",
];

export const poeticPickupLines = [
  "If I had a star for every time you brightened my day, I'd have a galaxy in my hand.",
  "You must be made of stardust, because you shine brighter than the moon.",
  "In a room full of art, I'd still stare at you.",
  "They say time flies when you're having fun. With you, time would stop entirely.",
  "Your smile is like the sunrise - it lights up my entire world.",
  "If love were a river, you'd be the ocean I'd gladly drown in.",
  "You're the missing verse in the poem I've been writing my whole life.",
  "Like a melody that lingers, you stay in my mind long after the song ends.",
  "If hearts could speak, mine would only say your name.",
  "You're not just beautiful, you're a masterpiece painted by the universe itself.",
  "The stars must be jealous tonight, because you outshine them all.",
  "Your presence is the poetry my soul has been waiting to read.",
  "If I could rearrange the alphabet, I'd put U and I together at the beginning of every love story.",
  "You're the dream I never want to wake up from.",
  "Like the first ray of dawn, you bring hope to my darkest nights.",
];

export const boldPickupLines = [
  "Do you like bacon? Wanna strip?",
  "Are you a campfire? Because you're hot and I want s'more.",
  "I'm not a genie, but I can make your dreams come true tonight.",
  "I hope you know CPR, because you just took my breath away.",
  "Are you a thief? Because you just stole my heart from across the room.",
  "Forget about Spiderman, Superman, and Batman. I'll be your man.",
  "My lips are like Skittles. Want to taste the rainbow?",
  "If I were a cat, I'd spend all nine lives with you.",
  "I'm no electrician, but I can definitely light up your night.",
  "You must be tired from running through my mind all day.",
  "I lost my teddy bear, can I sleep with you tonight?",
  "Are you a volcano? Because I lava you.",
  "You're so hot, you'd make the devil sweat.",
  "I'm not trying to impress you or anything, but I'm Batman.",
  "Do you work at Starbucks? Because I like you a latte.",
];

export function getRandomPickupLines(): string[] {
  const randomFlirty = flirtyPickupLines[Math.floor(Math.random() * flirtyPickupLines.length)];
  const randomPoetic = poeticPickupLines[Math.floor(Math.random() * poeticPickupLines.length)];
  const randomBold = boldPickupLines[Math.floor(Math.random() * boldPickupLines.length)];
  
  return [randomFlirty, randomPoetic, randomBold];
}
