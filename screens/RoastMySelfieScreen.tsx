import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { playButtonSound } from "@/utils/soundUtils";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "RoastMySelfie"> };
type Mode = "savage" | "mild" | "brutal";

const ROASTS: Record<Mode, string[]> = {
  mild: [
    "You're not bad looking, just… choose a better photo angle next time. 😅",
    "Solid 6/10 with potential. You've got the bones for a glow-up! 💪",
    "You're cute but clearly haven't discovered what works for you yet. Keep going!",
    "Not the worst face I've seen today. That's… a compliment, kind of. 😂",
    "You've got raw material to work with. The glow-up is within reach! ✨",
    "Bro is giving 'almost there' energy. You need 20% more effort on the fit.",
    "You have good features hidden under that 'I don't care' aesthetic. Care a little! 😄",
    "The jawline has promise. The style does not. Let's work on one thing at a time. 😅",
    "You're giving 'secretly attractive but doesn't know it yet.' That's fixable! 🔥",
    "Honest opinion? You're like a 6.5 but you dress like a 4. Upgrade the fit.",
    "Decent face, chaotic energy. A good haircut alone would bump you up a point.",
    "You're not ugly, you're just unoptimized. That's the kindest way I can say it.",
    "There's a 7/10 in there screaming to get out. Let it out. Please.",
    "You look like you have potential but haven't unlocked it yet. The tutorial is still running.",
    "This is a good base. Bad execution. Fix the style and you've got something here.",
    "Your face structure is actually fine. It's everything else that's letting it down.",
    "I see a 6, I believe a 7.5 is possible. Start with skincare and a haircut.",
    "You're not the main character yet, but you could be a compelling side character. 😄",
    "You've got kind eyes. That counts for a lot. The rest needs work.",
    "You look like someone who's one good haircut away from being a completely different person.",
    "There's potential here that's being buried under bad lighting and questionable clothing choices.",
    "Not ugly, just unpolished. A diamond in the rough kind of situation.",
    "You look like you're on the verge of figuring it out. Almost there!",
    "The face is passing, the style is failing. 50/50. Let's work on the 50 you can control.",
    "You're giving 'I'm comfortable but not confident.' Time to level that up.",
    "A solid 6.8 with room to climb. Start with fixing the hair situation.",
    "You've got the genetics, now you need the execution. It's all in your hands.",
    "Honestly? Not bad. But 'not bad' is not where you want to be. Aim higher.",
    "Your bone structure is doing a lot of heavy lifting. Give it some better clothes to work with.",
    "I've seen worse, and I've seen better. You're firmly in the 'fixable' category.",
    "There's a glow-up in your future if you commit to it. I can see it.",
    "You look like a friendly person, which is nice. Now let's make you a good-looking friendly person.",
    "Mild roast: you're average but average is a launchpad, not a destination.",
    "You look like you've given up on 3 things. Commit to 3 things and you'll be unrecognizable.",
    "I see what you're going for but the execution is maybe 60% there.",
    "Not a bad face day at all. Not a great one either. Push for great.",
    "Your eyes are working overtime to carry this photo. Give them backup.",
    "You look like you know you could do better. Do better.",
    "Genuinely decent looking person who hasn't quite figured out how to show it yet.",
    "You're on the right side of average. Now get off the average side entirely.",
    "You've got symmetry going for you. That's like 40% of the battle. Win the other 60%.",
    "You look like you shower regularly but haven't discovered skincare yet. Next step.",
    "A clean haircut and fitted clothes and this photo is a 7. Literally that simple.",
    "Kind face. Warm energy. Style needs emergency intervention.",
    "You're the 'before' photo that has a genuinely good 'after' waiting. Chase it.",
    "I don't want to roast you too hard because I think you're actually close to breaking through.",
    "You look like someone's cool older cousin who hasn't peaked yet.",
    "This photo is like 70% of what you could be. Find the other 30%.",
    "You've got charm in your face. Your style is not charming. Fix the style.",
    "Honestly, with some effort, you'd be turning heads. With no effort, you're invisible. Try.",
    "You're like a 6 with 7 potential. The gap is closable. I believe in you.",
    "You look like you take decent care of yourself but could take better care. Push.",
    "Mild truth: you're passable but passable won't get you where you want to go.",
    "You look comfortable. Comfortable is the enemy of attractive. Push yourself.",
    "There's a look buried in there. Find a style, commit, and execute.",
    "You look like you haven't made a bold grooming decision in years. Make one.",
    "You're one style decision away from people treating you differently. Make that decision.",
    "Mild roast: you look fine. Fine is forgettable. Be unforgettable.",
    "I can tell you have good energy. Now match it with your appearance.",
    "You look like you're on the right track but the train is moving slowly.",
  ],
  savage: [
    "Bro, you look like you just woke up in a dumpster. Ever heard of a comb? 😂",
    "Your face called – it wants its personality back. Try smiling next time! 💀",
    "Is that a resting judged face or are you always this unimpressed with yourself? 🔥",
    "You've got a face made for radio… and a voice probably made for texting. 😅",
    "I've seen better-looking faces on a passport photo taken on a Monday morning. 💀",
    "Your vibe said 'I gave up' but your eyes say 'I gave up weeks ago.' 😂",
    "Bro your hairline is playing hide and seek – and losing. 🔥",
    "You look like the 'before' picture in every glow-up tutorial. 💀",
    "Did you get dressed in the dark or is this just your vibe? Either way, no. 😭",
    "Your face has a great personality… I'm sure. 😬",
    "The AI tried to compliment you but couldn't find a starting point. 💀",
    "You're not ugly, you're just… aggressively average. That's somehow worse. 😂",
    "Bro looks like he tells people he's 'working on himself' but means Netflix. 😭",
    "Even your shadow is trying to distance itself. 💀",
    "If confidence was a face, you'd have the opposite of that. 🔥",
    "Your haircut looks like it was done by someone who was multitasking. And failing. 😂",
    "You've got resting 'gave up' face and it's extremely loud. 💀",
    "Is that outfit a choice or a dare? Either way the answer should've been no. 😭",
    "Your face looks like it's buffering. Have you tried restarting? 🔄",
    "The gym would like to meet you. Formally. Like immediately. 💀",
    "You look like you describe yourself as 'laid back' which means 'no effort.' 😂",
    "Bro dresses like he's protesting the concept of fashion. 🔥",
    "Your attractiveness score broke the curve. Not the good kind of breaking. 💀",
    "You look like the character in a movie that the main character forgets existed. 😂",
    "The confidence is giving 4/10 but dressed like a 2/10. Dangerous combo. 💀",
    "You look like you've never moisturized in your life and the skin agrees. 😭",
    "Your jawline went somewhere and it didn't leave a note. 💀",
    "The AI needed a moment after analyzing your photo. It needed snacks. 😂",
    "You've got big 'I peaked in high school' energy. And high school was rough. 🔥",
    "Your style is sending a message and the message is 'please ignore me.' 💀",
    "Bro looks like he last thought about his appearance in 2015. 😂",
    "The camera adds 10 pounds… in this case it added a few bad decisions too. 💀",
    "You're not unfixable, you're just heavily under construction. 🔥",
    "Your vibe is giving 'forgotten leftovers.' It's not dangerous, just sad. 😭",
    "Your posture said more than your face did. Both said the same thing: no. 💀",
    "You look like you skip leg day AND skincare day. Busy schedule, huh? 😂",
    "There's no feature here that's doing extra credit work. They're all just showing up. 💀",
    "You look like you think 'winging it' is a grooming strategy. It is not. 😭",
    "Your skin is having a whole conversation about your hydration and diet. It's not flattering. 💀",
    "Bro looks like a background character who accidentally walked into the main story. 😂",
    "The energy is giving 'I read 3 pages of a self-help book.' Finish the book. 🔥",
    "You look like the template photo that comes with a new wallet. 💀",
    "Your look is screaming 'I exist' and not much else. Aim higher. 😂",
    "The face is passable. The everything else is not. Unfortunately everything else is more. 💀",
    "You look like someone who says 'I'm not like other guys' but is exactly like other guys. 😂",
    "You've got the kind of face that blends into crowds. Which is great for espionage, bad for dating. 💀",
    "Bro is giving 'cardboard cutout of a person.' There's no dimension here. 😭",
    "Your attractiveness is hovering at 'technically present.' Aim for 'undeniably attractive.' 🔥",
    "You look like a 6/10 who skipped all the optional upgrades in the character creation screen. 💀",
    "The AI says you have good eye symmetry. The AI is really stretching for compliments here. 😂",
    "You're not a disaster, you're just… a situation. And the situation needs managing. 💀",
    "Your look is communicating 'I'm here' and not much else. Communicate more. 🔥",
    "Bro has been the same since 2018 and 2018 wasn't even his best year. 😂",
    "You look like you're one good mentor away from a complete transformation. Find a mentor. 💀",
    "There's a 7.5 trapped inside a 5 and it's not happy about it. 😭",
    "Your presentation is 'I tried nothing and I'm fresh out of ideas.' Try something. 🔥",
    "You look like you've made peace with average. That's the saddest thing. 💀",
    "Bro is giving 'generic profile photo from 2019.' Time for an update. 😂",
    "Your aesthetic is 'I have a personality' but the photo isn't showing it. Show it. 🔥",
    "You look like someone who needs a complete wardrobe intervention and a skincare tutorial. 💀",
    "The photo is technically a photo of a person. That's where the wins stop. 😭",
    "Your face is working, your style is unemployed. Get it a job. 🔥",
    "You look like you could be a 7 but you're choosing a 5. Stop choosing. 💀",
    "Bro has 'untapped potential' written all over him. The potential remains firmly untapped. 😂",
    "You look like someone who opens dating apps, swipes for 20 minutes, then closes the app confused. 💀",
    "Your attractiveness has a ceiling and you've accepted it. Don't accept it. 🔥",
    "You look like you're going for 'rugged' but landing on 'unkempt.' Different things. 💀",
    "The AI was going to roast your jawline but your style roasted itself first. 😂",
    "You look like the guy who shows up to the party and nobody's sure how he got invited. 💀",
    "You're carrying a lot of potential like a backpack you never opened. Open it. 🔥",
    "Bro looks like a placeholder until someone better comes along. Don't be a placeholder. 💀",
    "You look like the default character before you customize anything. Customize. 😂",
    "Your styling choices are making a statement. The statement is a question mark. 💀",
    "The energy is there, the execution went on vacation. Call it back. 🔥",
    "You look like you'd describe your style as 'casual' when the accurate word is 'careless.' 💀",
    "Bro's face is a 6, his vibe is a 4, and his outfit is a 3. Math isn't mathing. 😂",
    "You look like you've been in the same style era since it stopped being cool. 💀",
    "Your look says 'I have given up' with a side of 'I also gave up on giving up.' 😭",
  ],
  brutal: [
    "I asked the AI to rate you and it crashed. Make of that what you will. 💀",
    "Your face triggered my phone's low-battery warning. Coincidence? I think not. 😂",
    "Bro looks like he lost the genetics lottery AND the fashion lottery. In the same week. 💀",
    "My grandmother has better bone structure and she's been gone 10 years. 😭",
    "The AI rated your symmetry a 2.1. It wanted to go lower but that's the minimum. 🔥",
    "You're proof that confidence and attractiveness are completely unrelated. 😂",
    "Your jawline has gone into witness protection. Nobody has seen it in years. 💀",
    "Even your pores are ugly bro. I've never seen ugly pores before today. 😭",
    "Your attractiveness score broke the algorithm. In the wrong direction. 🔥",
    "The Roast AI had to take a break after seeing your photo. It needed therapy. 💀",
    "The AI flagged this photo as 'requiring additional processing.' It was emotional processing. 😂",
    "Your hairline is so far back it's basically a memory at this point. 💀",
    "I ran your photo through beauty filters and the phone asked if I was sure. 🔥",
    "You look like an AI-generated person who got flagged as 'unsuccessful generation.' 😭",
    "The AI thought your photo was a 'before' picture. It kept waiting for the 'after.' 💀",
    "Your bone structure looks like it was assembled by someone following instructions in a different language. 😂",
    "Bro looks like a cautionary tale told to attractive people. 💀",
    "Your face set my beauty algorithm back 3 updates. We had to rollback. 🔥",
    "The AI identified 17 improvement opportunities. It stopped counting at 17. 😭",
    "You look like every feature was ordered from a different website and none of them matched. 💀",
    "Your style is so bad it retroactively made past fits look worse. 😂",
    "Bro looks like he was assembled in a hurry on a Friday afternoon. 💀",
    "The AI tried to find your best angle and discovered there isn't one. 🔥",
    "You look like the 'before' photo that makes people NOT want to buy the product. 😭",
    "Your attractiveness is so low the AI thought there was a filter on the camera. There wasn't. 💀",
    "Bro looks like a genetics experiment that the scientists disagreed about. 😂",
    "Your face is doing its best. Its best needs significant improvement. 💀",
    "I've seen better styling on a store mannequin. And mannequins don't even have a body. 🔥",
    "The AI rated you 2.4/10 and then wrote a disclaimer apologizing to 2.4s. 😭",
    "You look like what happens when nature doesn't proofread its work. 💀",
    "Your face is a rough draft that never got edited. 😂",
    "Bro is the human equivalent of a typo in a formal document. 💀",
    "The AI needed 8 seconds to process your photo. Usually it takes 1. It was struggling. 🔥",
    "You look like an NFT that didn't sell. Even at the floor price. 😭",
    "Your photo made the AI question whether it was trained on the right data. 💀",
    "Bro has the face of someone who cuts in line and knows it looks bad. 😂",
    "You look like a cautionary example used in a genetics class. Labeled 'unfavorable.' 💀",
    "The AI analyzed your photo and immediately updated its depreciation model. 🔥",
    "You look like something that should come with a warranty but the warranty is expired. 😭",
    "Bro looks like 4 different people fighting for control of one face. Nobody is winning. 💀",
    "Your photo caused a buffer overflow in the compliment module. There was literally nothing to say. 😂",
    "You look like your face was on sale and someone bought it on a final-sale, no-return basis. 💀",
    "The AI said your attractiveness is 'statistically significant.' It meant significantly low. 🔥",
    "Bro has 'last picked in gym class' energy emanating from every pixel. 😭",
    "Your look screams 'I need help' so loudly the AI muted itself. 💀",
    "You look like the guy in the horror movie who doesn't realize he's in a horror movie. 😂",
    "Bro, even your ears look sad. I didn't know ears could express sadness. 💀",
    "The AI rated your photo and then rated its own existence lower. Inspired by you. 🔥",
    "You look like someone tried to reverse-engineer attractiveness with instructions from a fever dream. 😭",
    "Your face is technically symmetrical if you close one eye and squint the other. 💀",
    "Bro looks like he lost a bet and the prize was having to look like this. 😂",
    "The AI processed your photo and requested hazard pay. 💀",
    "You look like what comes up if you search 'glow down.' 🔥",
    "Bro has the aesthetic of a person described only as 'some guy.' 😭",
    "Your face triggered 3 different safety filters and none of them were for the right reasons. 💀",
    "You look like an out-of-stock item that got restocked by accident. 😂",
    "Bro looks like he was the rough draft before the final product. Nobody saved the draft. 💀",
    "The AI ran your face through 12 attractiveness models. All 12 escalated to human review. 🔥",
    "You look like background music made visual. Present but completely unnoticed. 😭",
    "Your face is giving 'error 404: attractiveness not found.' The server is down. 💀",
  ],
};

const GLOW_UP_TIPS = [
  "Try a new hairstyle. Maybe one from this decade!",
  "Skincare is not just for girls – moisturize, king!",
  "Hit the gym. Even 3 days a week transforms you in 3 months.",
  "Sleep 8 hours. Beauty sleep is real, don't skip it.",
  "Fix your posture – stand tall and instantly look more attractive.",
  "Drink water. Hydration literally makes your skin glow.",
  "Upgrade your fit. Clothes that fit = automatic glow-up.",
  "Smile more. Confidence is the most attractive thing you can wear.",
  "Get a beard trim or clean shave – unkempt facial hair drops you 2 points.",
  "Whiten your teeth. A bright smile is the cheapest glow-up there is.",
  "Eyebrow grooming. Seriously. 5 minutes changes everything.",
  "Use SPF every morning. Future you will be way better looking.",
  "Iron your clothes. Wrinkled outfits scream 'I gave up.'",
  "Clean your shoes. People notice, even if they don't say it.",
  "Get a cologne you actually like. Scent is 30% of attraction.",
  "Eat less junk food. Your skin tells on you immediately.",
  "Start reading books. Intelligence is visible. Dumb is visible too.",
  "Learn to make eye contact. Avoiding it reads as low confidence.",
  "Find a signature style and stick to it. Consistency = identity.",
  "Cut out alcohol. It bloats your face within 48 hours.",
  "Add Vitamin C serum to your morning routine for that glow.",
  "Cold shower in the morning — reduces puffiness and boosts energy.",
  "Stop hunching over your phone. Tech neck is not the look.",
  "Get a fresh haircut every 3-4 weeks to look maintained.",
  "Start journaling. Emotional clarity makes you more attractive to be around.",
  "Floss daily. Fresh breath changes how close people stand to you.",
  "Cook more of your own food. Health shows on your face.",
  "Add 20 minutes of walking daily. Blood flow = skin glow.",
  "Learn one interesting skill. Passion is deeply attractive.",
  "Use a hair serum or styling cream to stop the frizz.",
];

const LOADING_STAGES = [
  "Scanning facial structure...",
  "Analyzing symmetry...",
  "Calculating attractiveness score...",
  "Generating savage roast...",
  "Preparing your verdict...",
];

const FEATURE_LABELS = ["Jawline", "Eyes", "Skin", "Hair", "Style", "Vibe"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomScore(min: number, max: number) {
  return (Math.random() * (max - min) + min).toFixed(1);
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

const MODE_CONFIG: Record<Mode, { label: string; emoji: string; color: string; scoreRange: [number, number] }> = {
  mild:   { label: "Mild",   emoji: "😊", color: "#4CAF50", scoreRange: [5, 8.5] },
  savage: { label: "Savage", emoji: "🔥", color: "#FF6B35", scoreRange: [3, 7]   },
  brutal: { label: "Brutal", emoji: "💀", color: "#9C27B0", scoreRange: [1, 5]   },
};

export default function RoastMySelfieScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [mode, setMode] = useState<Mode>("savage");
  const [result, setResult] = useState<{
    score: string;
    roast: string;
    tip: string;
    features: { label: string; score: number }[];
    shareCount: number;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<"roast" | "tip" | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastTapRef = useRef<number>(0);

  const copyText = async (text: string, key: "roast" | "tip") => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRoastTap = () => {
    if (!result) return;
    const now = Date.now();
    lastTapRef.current = now;
    copyText(result.roast, "roast");
  };

  useEffect(() => {
    if (loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [loading]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) return;
    await playButtonSound();
    setLoading(true);
    setResult(null);
    for (let i = 0; i < LOADING_STAGES.length; i++) {
      setLoadingStage(i);
      await new Promise((r) => setTimeout(r, 420));
    }
    triggerHaptic();
    const cfg = MODE_CONFIG[mode];
    const features = FEATURE_LABELS.map((label) => ({
      label,
      score: randomInt(
        Math.ceil(cfg.scoreRange[0] * 10),
        Math.floor(cfg.scoreRange[1] * 10)
      ) / 10,
    }));
    setResult({
      score: randomScore(cfg.scoreRange[0], cfg.scoreRange[1]),
      roast: randomItem(ROASTS[mode]),
      tip: randomItem(GLOW_UP_TIPS),
      features,
      shareCount: randomInt(12, 9847),
    });
    setLoading(false);
  };

  const cfg = MODE_CONFIG[mode];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Roast My Selfie {cfg.emoji}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selector */}
        <View style={styles.modeRow}>
          {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => {
            const c = MODE_CONFIG[m];
            const active = mode === m;
            return (
              <Pressable
                key={m}
                style={[styles.modeChip, active && { backgroundColor: c.color, borderColor: c.color }]}
                onPress={() => { setMode(m); setResult(null); }}
              >
                <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                  {c.emoji} {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!result ? (
          <>
            <Animated.View style={[styles.imagePickerWrap, { transform: [{ scale: pulseAnim }] }]}>
              <Pressable
                style={[styles.imagePicker, { borderColor: cfg.color + "66" }]}
                onPress={pickImage}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.selfieImage} />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: cfg.color + "14" }]}>
                    <Ionicons name="camera" size={56} color={cfg.color} />
                    <Text style={styles.placeholderTitle}>Upload Your Selfie</Text>
                    <Text style={styles.placeholderSub}>Tap to pick a photo</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            {imageUri && (
              <Pressable style={styles.changeBtn} onPress={pickImage}>
                <Ionicons name="refresh" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.changeBtnText}>Change Photo</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.analyzeBtn, { backgroundColor: cfg.color }, !imageUri && styles.analyzeBtnDisabled]}
              onPress={analyzeImage}
              disabled={!imageUri || loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.analyzeBtnText}>{LOADING_STAGES[loadingStage]}</Text>
                </View>
              ) : (
                <Text style={styles.analyzeBtnText}>{cfg.emoji} Roast Me!</Text>
              )}
            </Pressable>

            {!imageUri && (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  {mode === "brutal" ? "💀 No mercy mode. You asked for it." :
                   mode === "savage" ? "🔥 We will not hold back." :
                   "😊 We'll be kind… kind of."}
                </Text>
                <Text style={styles.roastCount}>🎲 {ROASTS[mode].length} unique roasts ready</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={[styles.resultHeader, { borderColor: cfg.color + "44" }]}>
              <View style={[styles.modeBadge, { backgroundColor: cfg.color }]}>
                <Text style={styles.modeBadgeText}>{cfg.emoji} {cfg.label} Mode</Text>
              </View>
              <Text style={styles.shareCountText}>🔥 {result.shareCount.toLocaleString()} roasted today</Text>
            </View>

            {imageUri && (
              <View style={styles.resultImageWrap}>
                <Image source={{ uri: imageUri }} style={styles.resultImage} />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={styles.resultImageOverlay}
                />
                <View style={styles.scoreOverlayBox}>
                  <Text style={styles.scoreOverlayLabel}>Attractiveness</Text>
                  <Text style={[styles.scoreNumber, { color: cfg.color }]}>{result.score}<Text style={styles.scoreDenom}>/10</Text></Text>
                </View>
              </View>
            )}

            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Face Breakdown</Text>
              <View style={styles.featureGrid}>
                {result.features.map((f) => (
                  <View key={f.label} style={styles.featureItem}>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                    <View style={styles.featureBarBg}>
                      <View style={[styles.featureBarFill, {
                        width: `${(f.score / 10) * 100}%` as any,
                        backgroundColor: cfg.color,
                      }]} />
                    </View>
                    <Text style={[styles.featureScore, { color: cfg.color }]}>{f.score}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Roast Bubble — tap / double-tap / long-press to copy */}
            <Pressable
              style={[
                styles.roastBubble,
                { borderLeftColor: cfg.color },
                copiedKey === "roast" && { backgroundColor: "rgba(255,255,255,0.1)" },
              ]}
              onPress={handleRoastTap}
              onLongPress={() => result && copyText(result.roast, "roast")}
              delayLongPress={400}
            >
              <View style={styles.roastBubbleTop}>
                <Text style={styles.roastEmoji}>💬</Text>
                <View style={[styles.copyHint, copiedKey === "roast" && { backgroundColor: cfg.color + "CC" }]}>
                  <Ionicons
                    name={copiedKey === "roast" ? "checkmark-circle" : "copy-outline"}
                    size={12}
                    color={copiedKey === "roast" ? "#fff" : "rgba(255,255,255,0.35)"}
                  />
                  <Text style={[styles.copyHintText, copiedKey === "roast" && { color: "#fff" }]}>
                    {copiedKey === "roast" ? "Copied!" : "Tap to copy"}
                  </Text>
                </View>
              </View>
              <Text style={styles.roastText}>{result.roast}</Text>
            </Pressable>

            {/* Tip Box — tap / long-press to copy */}
            <Pressable
              style={[
                styles.tipBox,
                { borderLeftColor: cfg.color },
                copiedKey === "tip" && { backgroundColor: "rgba(255,255,255,0.08)" },
              ]}
              onPress={() => result && copyText(result.tip, "tip")}
              onLongPress={() => result && copyText(result.tip, "tip")}
              delayLongPress={400}
            >
              <View style={styles.tipBoxTop}>
                <Text style={[styles.tipLabel, { color: cfg.color }]}>🔥 Glow-Up Tip:</Text>
                <View style={[styles.copyHint, copiedKey === "tip" && { backgroundColor: cfg.color + "CC" }]}>
                  <Ionicons
                    name={copiedKey === "tip" ? "checkmark-circle" : "copy-outline"}
                    size={12}
                    color={copiedKey === "tip" ? "#fff" : "rgba(255,255,255,0.35)"}
                  />
                  <Text style={[styles.copyHintText, copiedKey === "tip" && { color: "#fff" }]}>
                    {copiedKey === "tip" ? "Copied!" : "Tap to copy"}
                  </Text>
                </View>
              </View>
              <Text style={styles.tipText}>"{result.tip}"</Text>
            </Pressable>

            <View style={styles.resultActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => { setImageUri(null); setResult(null); }}>
                <Text style={styles.secondaryBtnText}>New Selfie</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, { backgroundColor: cfg.color }]} onPress={analyzeImage}>
                <Text style={styles.primaryBtnText}>Roast Again</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#100820" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 19, fontWeight: "800", color: "#fff" },
  content: { paddingHorizontal: 20, alignItems: "center", gap: 14 },

  modeRow: { flexDirection: "row", gap: 8, width: "100%" },
  modeChip: {
    flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)",
  },
  modeChipText: { color: "rgba(255,255,255,0.5)", fontWeight: "700", fontSize: 13 },
  modeChipTextActive: { color: "#fff" },

  imagePickerWrap: { width: "100%" },
  imagePicker: {
    width: "100%", aspectRatio: 1, borderRadius: 24,
    overflow: "hidden", borderWidth: 2, borderStyle: "dashed",
  },
  selfieImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1, justifyContent: "center", alignItems: "center", gap: 10,
  },
  placeholderTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  placeholderSub: { color: "rgba(255,255,255,0.35)", fontSize: 13 },

  changeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  changeBtnText: { color: "rgba(255,255,255,0.6)", fontWeight: "600", fontSize: 13 },

  analyzeBtn: {
    width: "100%", paddingVertical: 18, borderRadius: 20, alignItems: "center",
  },
  analyzeBtnDisabled: { opacity: 0.35 },
  analyzeBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  hintBox: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14, padding: 14, alignItems: "center", gap: 6,
  },
  hintText: { color: "rgba(255,255,255,0.45)", fontSize: 14, textAlign: "center" },
  roastCount: { color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: "600" },

  resultHeader: {
    width: "100%", flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14, padding: 12, borderWidth: 1,
  },
  modeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  modeBadgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  shareCountText: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600" },

  resultImageWrap: {
    width: "100%", aspectRatio: 1, borderRadius: 22, overflow: "hidden", position: "relative",
  },
  resultImage: { width: "100%", height: "100%" },
  resultImageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 100 },
  scoreOverlayBox: { position: "absolute", bottom: 16, left: 16 },
  scoreOverlayLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  scoreNumber: { fontSize: 42, fontWeight: "900", lineHeight: 48 },
  scoreDenom: { fontSize: 20, color: "rgba(255,255,255,0.5)", fontWeight: "600" },

  breakdownCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, gap: 12,
  },
  breakdownTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
  featureGrid: { gap: 8 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureLabel: { width: 60, color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" },
  featureBarBg: {
    flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden",
  },
  featureBarFill: { height: "100%", borderRadius: 3 },
  featureScore: { width: 28, fontSize: 12, fontWeight: "800", textAlign: "right" },

  roastBubble: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16, padding: 16, borderLeftWidth: 3, gap: 10,
  },
  roastBubbleTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  roastEmoji: { fontSize: 20 },
  roastText: { color: "#fff", fontSize: 15, lineHeight: 24 },

  tipBox: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16, padding: 16, borderLeftWidth: 3, gap: 8,
  },
  tipBoxTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tipLabel: { fontWeight: "800", fontSize: 14 },
  tipText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontStyle: "italic", lineHeight: 20 },

  copyHint: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  copyHintText: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "600" },

  resultActions: { flexDirection: "row", gap: 10, width: "100%" },
  primaryBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  secondaryBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
