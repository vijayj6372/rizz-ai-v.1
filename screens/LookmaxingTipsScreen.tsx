import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "LookmaxingTips"> };

type Impact = "🔥 High" | "⚡ Medium" | "✨ Quick Win";
type Category = "HAIR" | "SKIN" | "FITNESS" | "DENTAL" | "STYLE" | "GROOMING" | "HEALTH" | "POSTURE" | "EYES" | "DIET" | "MINDSET" | "SOCIAL";

interface Tip {
  icon: string;
  category: Category;
  title: string;
  desc: string;
  impact: Impact;
  timeframe: string;
  color: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  HAIR: "#FF6B35",
  SKIN: "#00CFA8",
  FITNESS: "#FF1744",
  DENTAL: "#29B6F6",
  STYLE: "#9C27B0",
  GROOMING: "#E040A0",
  HEALTH: "#4CAF50",
  POSTURE: "#FF9800",
  EYES: "#00BCD4",
  DIET: "#8BC34A",
  MINDSET: "#7C4DFF",
  SOCIAL: "#F06292",
};

const TIPS: Tip[] = [
  // ───────── HAIR (18 tips) ─────────
  { icon: "💈", category: "HAIR", title: "Fresh haircut every 3-4 weeks", desc: "A maintained cut signals you have your life together. Grow out your sides or try a modern fade. Consistency in cuts keeps you looking polished even on lazy days.", impact: "🔥 High", timeframe: "1 day", color: CATEGORY_COLORS.HAIR },
  { icon: "🧴", category: "HAIR", title: "Use hair serum or styling cream", desc: "Frizz and dryness age you. A small amount of product transforms your texture and shine instantly. Apply on damp hair for best results.", impact: "✨ Quick Win", timeframe: "5 mins", color: CATEGORY_COLORS.HAIR },
  { icon: "🚿", category: "HAIR", title: "Wash hair 2-3x per week max", desc: "Over-washing strips natural oils and causes your scalp to overproduce sebum. Dry shampoo between washes adds volume without stripping.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.HAIR },
  { icon: "🌡️", category: "HAIR", title: "Use cold water for your final rinse", desc: "Cold water seals the hair cuticle and adds shine. 30 seconds at the end of your shower makes your hair noticeably glossier.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.HAIR },
  { icon: "🛢️", category: "HAIR", title: "Deep condition once a week", desc: "A weekly hair mask or deep conditioner repairs damage and adds elasticity. 10 minutes while you shower, massive difference in texture.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.HAIR },
  { icon: "💇", category: "HAIR", title: "Find a hairstyle that suits your face shape", desc: "Round faces need height on top. Square faces need softer sides. Long faces need width. The wrong cut makes a good-looking person look average.", impact: "🔥 High", timeframe: "1 day", color: CATEGORY_COLORS.HAIR },
  { icon: "🌿", category: "HAIR", title: "Use a scalp massager daily", desc: "Boosts blood circulation to follicles, promotes hair growth, and reduces dandruff. 2 minutes while shampooing pays dividends over months.", impact: "⚡ Medium", timeframe: "3 months", color: CATEGORY_COLORS.HAIR },
  { icon: "🧪", category: "HAIR", title: "Switch to sulfate-free shampoo", desc: "Sulfates strip moisture aggressively. Sulfate-free shampoos clean gently and preserve color and natural oils for healthier, shinier hair.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.HAIR },
  { icon: "🔥", category: "HAIR", title: "Limit heat styling tools", desc: "Blow dryers, flat irons, and curling irons damage hair when used daily. Use heat protectant spray and keep tools on medium-low settings.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.HAIR },
  { icon: "🪮", category: "HAIR", title: "Brush from ends to roots", desc: "Always detangle from the bottom up to avoid breakage. A wide-tooth comb on wet hair prevents snapping and split ends.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.HAIR },
  { icon: "🥚", category: "HAIR", title: "Try a castor oil scalp treatment", desc: "Castor oil stimulates hair growth and thickens hair over time. Apply to scalp, massage for 5 minutes, leave for an hour, then wash out.", impact: "🔥 High", timeframe: "2 months", color: CATEGORY_COLORS.HAIR },
  { icon: "🌙", category: "HAIR", title: "Sleep on a silk pillowcase", desc: "Cotton pillowcases cause friction and frizz while you sleep. Silk pillowcases keep your hair smooth, hydrated, and styled longer.", impact: "✨ Quick Win", timeframe: "1 night", color: CATEGORY_COLORS.HAIR },
  { icon: "💊", category: "HAIR", title: "Take biotin + collagen supplements", desc: "Biotin strengthens hair shafts, reduces shedding, and supports growth. Results take 3 months but the transformation is real.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.HAIR },
  { icon: "🌊", category: "HAIR", title: "Try sea salt spray for texture", desc: "Sea salt spray creates effortless beach-wave texture and adds volume without looking greasy. A game changer for fine or limp hair.", impact: "✨ Quick Win", timeframe: "5 mins", color: CATEGORY_COLORS.HAIR },
  { icon: "🎨", category: "HAIR", title: "Consider highlights or color", desc: "Subtle highlights add dimension and make your hair look fuller and more alive. Even one visit to a colorist can completely change your look.", impact: "🔥 High", timeframe: "1 day", color: CATEGORY_COLORS.HAIR },
  { icon: "🧼", category: "HAIR", title: "Clarify your hair monthly", desc: "Product buildup dulls hair and weighs it down. A clarifying shampoo once a month removes buildup and restores bounce and shine.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.HAIR },
  { icon: "✂️", category: "HAIR", title: "Trim split ends every 6-8 weeks", desc: "Split ends travel up the hair shaft and cause breakage. Regular trims keep the hair looking healthy and prevent damage from spreading.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.HAIR },
  { icon: "🪢", category: "HAIR", title: "Learn 2-3 hairstyle variations", desc: "Knowing how to wear your hair differently — slicked back, natural, textured — gives you versatility for different occasions and moods.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.HAIR },

  // ───────── SKIN (20 tips) ─────────
  { icon: "💧", category: "SKIN", title: "Start a 3-step skincare routine", desc: "Cleanser → Moisturizer → SPF. Non-negotiable. SPF alone prevents aging better than any cream on the market. Start this week.", impact: "🔥 High", timeframe: "30 days", color: CATEGORY_COLORS.SKIN },
  { icon: "🫧", category: "SKIN", title: "Double cleanse at night", desc: "Oil cleanser first to remove sunscreen and sebum, then foam cleanser. Waking up with clear skin is elite. Try it for one week.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "✨", category: "SKIN", title: "Add a Vitamin C serum in the morning", desc: "Brightens dark spots, evens out skin tone, and protects against pollution damage. The cheat code for glowing skin.", impact: "🔥 High", timeframe: "4 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🧴", category: "SKIN", title: "Use retinol 2-3x per week at night", desc: "Retinol speeds up cell turnover, reduces wrinkles, and fades hyperpigmentation. Start low (0.25%) and build up. The gold standard of anti-aging.", impact: "🔥 High", timeframe: "8 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🌞", category: "SKIN", title: "SPF 30+ every single morning", desc: "UV damage is the number one cause of premature aging. Apply SPF even on cloudy days, even when indoors near windows. No excuses.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.SKIN },
  { icon: "💦", category: "SKIN", title: "Use a hyaluronic acid serum", desc: "Hyaluronic acid holds 1000x its weight in water. Plumps skin, reduces fine lines temporarily, and preps skin perfectly for moisturizer.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🧊", category: "SKIN", title: "Ice your face in the morning", desc: "Rubbing an ice cube on your face for 60 seconds reduces puffiness, tightens pores, and gives you an instant glow. Free and takes 1 minute.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.SKIN },
  { icon: "🌿", category: "SKIN", title: "Add niacinamide to your routine", desc: "Niacinamide reduces pores, evens skin tone, controls oil, and strengthens the skin barrier. One of the most versatile skincare ingredients.", impact: "🔥 High", timeframe: "4 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🧽", category: "SKIN", title: "Exfoliate 1-2x per week", desc: "Chemical exfoliants (AHA/BHA) remove dead skin cells and unclog pores. More effective than physical scrubs. Reveals fresh, glowing skin underneath.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🛌", category: "SKIN", title: "Never sleep with makeup or sunscreen on", desc: "Sleeping with product on your face clogs pores, traps bacteria, and accelerates aging. Clean skin before bed is non-negotiable.", impact: "🔥 High", timeframe: "Immediate", color: CATEGORY_COLORS.SKIN },
  { icon: "🍃", category: "SKIN", title: "Use a toner with witch hazel or glycolic acid", desc: "Toners prep skin for serum absorption, reduce pores, and balance pH. A 30-second step that makes everything else work better.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🎭", category: "SKIN", title: "Use a clay mask 1x per week", desc: "Clay masks deep-clean pores, control excess oil, and reduce blackheads. Kaolin clay is gentler, bentonite is stronger. 15 minutes, big results.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.SKIN },
  { icon: "💊", category: "SKIN", title: "Take collagen peptides daily", desc: "Collagen supplementation improves skin elasticity, reduces wrinkles, and strengthens nails. Takes 8 weeks to show but the results are measurable.", impact: "🔥 High", timeframe: "8 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🚱", category: "SKIN", title: "Stop touching your face", desc: "Your hands carry bacteria that cause breakouts. The average person touches their face 23x per hour. Cutting this habit alone clears skin.", impact: "✨ Quick Win", timeframe: "1 week", color: CATEGORY_COLORS.SKIN },
  { icon: "🛏️", category: "SKIN", title: "Change your pillowcase every 3-4 days", desc: "Pillowcases accumulate oil, sweat, and bacteria. This presses directly onto your face for 8 hours. Clean pillowcase = fewer breakouts.", impact: "✨ Quick Win", timeframe: "1 week", color: CATEGORY_COLORS.SKIN },
  { icon: "🥤", category: "SKIN", title: "Drink green tea daily", desc: "Green tea is packed with antioxidants that reduce inflammation, fight acne, and slow aging. One cup a day is a legitimate skin strategy.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🌺", category: "SKIN", title: "Try snail mucin or centella serum", desc: "Korean skincare staples that repair the skin barrier, fade scars, and deeply hydrate. Sounds weird, works brilliantly for sensitive or acne-prone skin.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🫙", category: "SKIN", title: "Use eye cream morning and night", desc: "The skin around your eyes is thinnest and shows age first. An eye cream with caffeine reduces puffiness; with retinol reduces fine lines.", impact: "⚡ Medium", timeframe: "6 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🌡️", category: "SKIN", title: "Wash face with lukewarm water only", desc: "Hot water strips natural oils and triggers inflammation. Cold water doesn't rinse cleanser effectively. Lukewarm is always correct.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.SKIN },
  { icon: "🫁", category: "SKIN", title: "Get a facial or peel quarterly", desc: "Professional facials or chemical peels accelerate results you can't get from home care. Even once every 3 months makes a significant difference.", impact: "🔥 High", timeframe: "1 day", color: CATEGORY_COLORS.SKIN },

  // ───────── FITNESS (18 tips) ─────────
  { icon: "🏋️", category: "FITNESS", title: "Hit the gym 3-4x per week", desc: "Compound lifts only: squat, bench, deadlift, rows. Muscle transforms your face AND body. Jaw gets more defined, face thins out, posture improves.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.FITNESS },
  { icon: "🏃", category: "FITNESS", title: "Add 20 mins of cardio daily", desc: "Better blood flow = skin glow + reduced puffiness. Your face literally changes within 2 weeks of consistent cardio. Walk, run, cycle — just move.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "🧊", category: "FITNESS", title: "Try cold showers daily", desc: "Cold showers trigger norepinephrine release, boost energy, tighten skin, and train mental toughness. Start with 30 seconds, build to 3 minutes.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "🤸", category: "FITNESS", title: "Do 10-minute morning stretching", desc: "Improves posture, reduces stiffness, and signals to your body that it's time to perform. Flexibility is part of being attractive.", impact: "✨ Quick Win", timeframe: "1 week", color: CATEGORY_COLORS.FITNESS },
  { icon: "🏊", category: "FITNESS", title: "Add swimming to your routine", desc: "Full-body low-impact workout that builds a lean, V-shaped physique. Excellent for posture, core strength, and skin health from the water.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.FITNESS },
  { icon: "🚴", category: "FITNESS", title: "Cycle 3x per week", desc: "Builds legs and glutes without bulk, improves cardiovascular health dramatically, and burns calories efficiently. Great complement to weights.", impact: "🔥 High", timeframe: "6 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "🧘", category: "FITNESS", title: "Do yoga 2x per week", desc: "Yoga improves flexibility, posture, and mind-body awareness. The way you carry your body is a huge part of attraction. Yoga transforms this.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "💪", category: "FITNESS", title: "Focus on progressive overload", desc: "Add weight or reps every 1-2 weeks. Without progressive overload, your body has no reason to grow. Track your lifts and keep pushing the numbers.", impact: "🔥 High", timeframe: "2 months", color: CATEGORY_COLORS.FITNESS },
  { icon: "🥊", category: "FITNESS", title: "Try boxing or martial arts", desc: "Full-body conditioning, reflexes, coordination, and confidence. Men who train combat sports carry themselves differently. It's visible.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.FITNESS },
  { icon: "🏃", category: "FITNESS", title: "Walk 10,000 steps daily", desc: "Simple, free, and genuinely effective. Daily walking reduces cortisol, improves metabolism, and helps maintain a lean physique long-term.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "🌅", category: "FITNESS", title: "Work out in the morning", desc: "Morning workouts boost testosterone, improve mood for the entire day, and eliminate scheduling excuses. The hardest part is the first step.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "🏅", category: "FITNESS", title: "Train your neck and jaw muscles", desc: "A defined neck and sharper jaw are massively attractive. Neck curls, chewing harder foods, and mewing improve jaw definition over time.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.FITNESS },
  { icon: "🔄", category: "FITNESS", title: "Do face yoga exercises daily", desc: "5 minutes of targeted face exercises tone facial muscles, reduce double chin, and lift cheekbones. Looks silly, works seriously.", impact: "⚡ Medium", timeframe: "6 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "🎯", category: "FITNESS", title: "Train your core every session", desc: "Strong core = better posture = more attractive instantly. Planks, dead bugs, hollow body holds. A strong core shows even through clothes.", impact: "🔥 High", timeframe: "6 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "🏋️", category: "FITNESS", title: "Prioritize pull-ups and rows", desc: "Back width creates the V-taper that's universally attractive. Weighted pull-ups and cable rows are the fastest route to a broader back.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.FITNESS },
  { icon: "🦵", category: "FITNESS", title: "Never skip legs", desc: "Legs are 50% of your body. Skipping them creates imbalance, hurts your testosterone production, and looks ridiculous. Squat and deadlift.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.FITNESS },
  { icon: "⏱️", category: "FITNESS", title: "Keep rest times under 90 seconds", desc: "Shorter rest periods keep heart rate elevated, increase growth hormone release, and make workouts more time-efficient without sacrificing gains.", impact: "⚡ Medium", timeframe: "1 month", color: CATEGORY_COLORS.FITNESS },
  { icon: "🏆", category: "FITNESS", title: "Sign up for a race or event", desc: "Having a goal (5K, obstacle race, tournament) gives your training purpose and accountability. People who train for events transform faster.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.FITNESS },

  // ───────── DENTAL (10 tips) ─────────
  { icon: "😁", category: "DENTAL", title: "Whiten your teeth", desc: "Whitening strips used consistently give you a celebrity smile for $20. The ROI on this single purchase is insane. Do it before dates, photos, and events.", impact: "✨ Quick Win", timeframe: "1 week", color: CATEGORY_COLORS.DENTAL },
  { icon: "🦷", category: "DENTAL", title: "Floss and use mouthwash daily", desc: "Fresh breath is invisible but immediately sensed. It changes how close people stand to you and how long conversations last.", impact: "✨ Quick Win", timeframe: "1 day", color: CATEGORY_COLORS.DENTAL },
  { icon: "🪥", category: "DENTAL", title: "Electric toothbrush is a game changer", desc: "Electric toothbrushes remove 100% more plaque than manual brushes. Your dentist will notice. So will the people you smile at.", impact: "✨ Quick Win", timeframe: "1 week", color: CATEGORY_COLORS.DENTAL },
  { icon: "🍵", category: "DENTAL", title: "Reduce coffee and tea staining", desc: "Drink coffee through a straw, rinse your mouth after, and use whitening toothpaste. Stained teeth age you significantly.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.DENTAL },
  { icon: "🌊", category: "DENTAL", title: "Oil pull with coconut oil", desc: "Swishing coconut oil for 5-10 minutes kills bacteria, reduces plaque, and whitens teeth naturally over time. Ancient technique, real results.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.DENTAL },
  { icon: "🧪", category: "DENTAL", title: "Use charcoal toothpaste weekly", desc: "Activated charcoal absorbs surface stains effectively. Use 1-2x per week alongside your regular toothpaste for gradual whitening.", impact: "✨ Quick Win", timeframe: "2 weeks", color: CATEGORY_COLORS.DENTAL },
  { icon: "🏥", category: "DENTAL", title: "Get a dental clean every 6 months", desc: "Professional cleaning removes tartar that brushing can't reach, keeps gum disease away, and keeps your smile looking its best.", impact: "🔥 High", timeframe: "1 day", color: CATEGORY_COLORS.DENTAL },
  { icon: "💧", category: "DENTAL", title: "Drink more water, less soda", desc: "Soda erodes enamel and causes severe staining. Replacing soda with water is one change that improves your teeth, skin, and body simultaneously.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.DENTAL },
  { icon: "😬", category: "DENTAL", title: "Consider Invisalign or retainers", desc: "Straight teeth transform your smile without the obvious look of braces. Invisible aligners are more affordable than ever. Worth the investment.", impact: "🔥 High", timeframe: "6 months", color: CATEGORY_COLORS.DENTAL },
  { icon: "🎯", category: "DENTAL", title: "Smile with your eyes, not just your mouth", desc: "A genuine smile engages your eyes (Duchenne smile). Practice in the mirror. People can't tell the difference consciously but they feel it.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.DENTAL },

  // ───────── STYLE (18 tips) ─────────
  { icon: "👔", category: "STYLE", title: "Wear clothes that actually fit", desc: "Oversized is a trend. Poorly fitted is different. Tailor one outfit and see how differently people treat you in that same day.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.STYLE },
  { icon: "👟", category: "STYLE", title: "Clean your shoes before every outing", desc: "People look at shoes more than you think. Dirty shoes read as 'doesn't care about details.' Clean them. It takes 2 minutes.", impact: "✨ Quick Win", timeframe: "3 mins", color: CATEGORY_COLORS.STYLE },
  { icon: "🎨", category: "STYLE", title: "Pick a consistent style identity", desc: "Streetwear, smart casual, or minimal – commit to one. Random outfits scream no identity. Pick yours and everything becomes easier.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.STYLE },
  { icon: "🎽", category: "STYLE", title: "Invest in 5 quality basics", desc: "White tee, black tee, navy/grey sweatshirt, dark jeans, chinos. Five quality pieces outperform 20 cheap ones every single time.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.STYLE },
  { icon: "🧥", category: "STYLE", title: "Own one great jacket or coat", desc: "A leather jacket, tailored coat, or varsity jacket instantly elevates any outfit underneath it. One great outerwear piece = 5 new looks.", impact: "🔥 High", timeframe: "1 day", color: CATEGORY_COLORS.STYLE },
  { icon: "⌚", category: "STYLE", title: "Wear a watch daily", desc: "A watch signals maturity, style awareness, and attention to detail — all attractive qualities. You don't need an expensive one. Just wear one.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.STYLE },
  { icon: "🎒", category: "STYLE", title: "Upgrade your bag or backpack", desc: "A quality leather bag or structured backpack signals you value your possessions. It's the accessory people notice most after shoes.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.STYLE },
  { icon: "🌈", category: "STYLE", title: "Understand color coordination", desc: "Learn which colors work together. Neutrals with one accent color is the safest formula. Clashing colors make even good clothes look bad.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.STYLE },
  { icon: "🧦", category: "STYLE", title: "Match your socks to the occasion", desc: "Plain socks with formal wear. Fun socks with casual outfits. Visible ankle socks with suits look sloppy. This small detail matters more than you'd think.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.STYLE },
  { icon: "🔗", category: "STYLE", title: "Add one statement accessory", desc: "A chain necklace, bracelet, or ring can transform a basic outfit into something with personality. Keep it to one. Less is more.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.STYLE },
  { icon: "🛍️", category: "STYLE", title: "Shop secondhand for unique pieces", desc: "Vintage and thrift stores are full of unique quality pieces you can't find everywhere. Being the only person with that jacket is immeasurably valuable.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.STYLE },
  { icon: "📐", category: "STYLE", title: "Get one item tailored", desc: "A tailor can make a $40 shirt look like a $200 one. Shoulder seams, sleeve length, and chest fit are the three key measurements.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.STYLE },
  { icon: "👖", category: "STYLE", title: "Own both slim and relaxed-fit pants", desc: "Slim or tapered jeans for smart-casual. Relaxed jeans for streetwear. Having both doubles your outfit versatility instantly.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.STYLE },
  { icon: "🌸", category: "STYLE", title: "Try a floral or graphic print tastefully", desc: "One pattern piece mixed with neutrals shows personality. A floral shirt with solid chinos reads as stylish, not loud.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.STYLE },
  { icon: "🎯", category: "STYLE", title: "Dress for the person you want to be", desc: "If you dress like your best self today, you start thinking and acting like your best self. Clothes affect psychology — use this deliberately.", impact: "🔥 High", timeframe: "Immediate", color: CATEGORY_COLORS.STYLE },
  { icon: "💎", category: "STYLE", title: "Invest in one luxury piece", desc: "One quality leather belt, premium sunglasses, or designer sneaker elevates every outfit around it. People notice one thing done really well.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.STYLE },
  { icon: "🕶️", category: "STYLE", title: "Find sunglasses that suit your face", desc: "The right sunglasses add instant mystery and cool. Square faces suit round frames. Round faces suit square frames. Oval faces suit anything.", impact: "✨ Quick Win", timeframe: "1 day", color: CATEGORY_COLORS.STYLE },
  { icon: "🧹", category: "STYLE", title: "Declutter your wardrobe quarterly", desc: "Keep only what you love and what fits. A small wardrobe of great pieces beats a large wardrobe of mediocre ones. Clarity = better daily choices.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.STYLE },

  // ───────── GROOMING (16 tips) ─────────
  { icon: "🌹", category: "GROOMING", title: "Find a signature cologne", desc: "Scent is processed in the same brain region as memory and emotion. A good cologne makes you unforgettable. Wear it consistently.", impact: "✨ Quick Win", timeframe: "1 day", color: CATEGORY_COLORS.GROOMING },
  { icon: "🪒", category: "GROOMING", title: "Maintain your beard or shave clean", desc: "Patchy stubble is the enemy. Either grow it fully, maintain it precisely, or shave clean. No in-between. No undefined lines.", impact: "✨ Quick Win", timeframe: "10 mins", color: CATEGORY_COLORS.GROOMING },
  { icon: "🤨", category: "GROOMING", title: "Groom your eyebrows monthly", desc: "Unibrows and wild brows drop your attractiveness score significantly. Get them threaded or waxed. It takes 20 minutes and lasts a month.", impact: "✨ Quick Win", timeframe: "30 mins", color: CATEGORY_COLORS.GROOMING },
  { icon: "✂️", category: "GROOMING", title: "Trim nose and ear hair", desc: "Visible nose hair is an immediate attractiveness destroyer. An inexpensive nose trimmer is the highest ROI grooming purchase available.", impact: "✨ Quick Win", timeframe: "3 mins", color: CATEGORY_COLORS.GROOMING },
  { icon: "💅", category: "GROOMING", title: "Keep your nails trimmed and clean", desc: "Dirty or long nails are noticed immediately. Clean, trimmed nails signal hygiene and self-respect. File the edges so they're not jagged.", impact: "✨ Quick Win", timeframe: "5 mins", color: CATEGORY_COLORS.GROOMING },
  { icon: "🛁", category: "GROOMING", title: "Shower every morning without fail", desc: "Daily shower is the minimum baseline. Add body wash with a scent that layered with your cologne creates a full fragrance experience.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.GROOMING },
  { icon: "💈", category: "GROOMING", title: "Use beard oil if you have facial hair", desc: "Beard oil moisturizes both the beard and the skin underneath, reduces itching and dandruff, and gives your beard a healthy sheen.", impact: "✨ Quick Win", timeframe: "1 week", color: CATEGORY_COLORS.GROOMING },
  { icon: "🌿", category: "GROOMING", title: "Try dermaplaning or exfoliate your face", desc: "Removing dead skin and peach fuzz makes your skin look smoother, allows better skincare absorption, and gives you a natural glow.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.GROOMING },
  { icon: "🧴", category: "GROOMING", title: "Apply deodorant and antiperspirant", desc: "Deodorant masks odor; antiperspirant blocks sweat. Use both. Apply to dry skin after showering. Reapply in gym bags for touch-ups.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.GROOMING },
  { icon: "💋", category: "GROOMING", title: "Use lip balm daily", desc: "Dry, cracked lips are very noticeable. A simple chapstick or tinted lip balm keeps lips soft, kissable, and healthy-looking year round.", impact: "✨ Quick Win", timeframe: "2 days", color: CATEGORY_COLORS.GROOMING },
  { icon: "🪥", category: "GROOMING", title: "Use a tongue scraper every morning", desc: "Your tongue harbors more bacteria than anywhere else in your mouth. Scraping it eliminates bad breath at the source, not just the surface.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.GROOMING },
  { icon: "🧖", category: "GROOMING", title: "Get a professional shave quarterly", desc: "A barber's hot towel shave is an experience and a grooming upgrade. It teaches you the standard to maintain at home.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.GROOMING },
  { icon: "🌙", category: "GROOMING", title: "Use hand cream before bed", desc: "Dry, cracked hands undermine an otherwise polished look. Working hands need care too. Apply a thick hand cream before sleep.", impact: "✨ Quick Win", timeframe: "1 week", color: CATEGORY_COLORS.GROOMING },
  { icon: "🎭", category: "GROOMING", title: "Try a face mask weekly", desc: "Clay, charcoal, or sheet masks are a genuine grooming ritual that keeps your skin clear and gives you a confidence boost from the self-care.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.GROOMING },
  { icon: "🪞", category: "GROOMING", title: "Check your look before leaving home", desc: "A full mirror check front and back before you leave. Stains, hair, collar, shoes. This habit alone prevents 90% of grooming embarrassments.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.GROOMING },
  { icon: "🌊", category: "GROOMING", title: "Layer your fragrance correctly", desc: "Apply unscented lotion first, then cologne on pulse points (neck, wrists, chest). Fragrance lasts 3x longer on moisturized skin.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.GROOMING },

  // ───────── HEALTH (16 tips) ─────────
  { icon: "😴", category: "HEALTH", title: "Sleep 7-9 hours every night", desc: "Sleep deprivation shows instantly in your skin, eyes, and energy. 8 hours of quality sleep is a better investment than any supplement stack.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.HEALTH },
  { icon: "💊", category: "HEALTH", title: "Take Vitamin D + Omega-3 daily", desc: "Most people are deficient in Vitamin D. It improves mood, skin, and hormone function. Omega-3 reduces inflammation and improves skin glow.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🧘", category: "HEALTH", title: "Reduce cortisol through stress management", desc: "High cortisol causes hair loss, acne, weight gain around the face, and premature aging. Meditation, walks, and breathing exercises all work.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🚭", category: "HEALTH", title: "Quit smoking — your skin will thank you", desc: "Smoking depletes collagen, causes wrinkles, yellows teeth, and gives skin a grey tone. Quitting reverses much of this damage within months.", impact: "🔥 High", timeframe: "4 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🍷", category: "HEALTH", title: "Reduce alcohol significantly", desc: "Alcohol causes facial bloating within 24 hours, disrupts sleep quality, depletes vitamins, and dramatically ages skin. Cut it by 80% and notice the change.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🩺", category: "HEALTH", title: "Get a full blood panel done", desc: "Deficiencies in iron, B12, Vitamin D, and testosterone all show on your face and in your energy. Know your numbers so you can fix them.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.HEALTH },
  { icon: "🌬️", category: "HEALTH", title: "Practice box breathing daily", desc: "4 seconds in, 4 hold, 4 out, 4 hold. Reduces cortisol, improves focus, and lowers resting heart rate. Do it for 5 minutes every morning.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.HEALTH },
  { icon: "🌅", category: "HEALTH", title: "Get morning sunlight within 30 mins of waking", desc: "Morning sunlight regulates your circadian rhythm, boosts serotonin, and improves sleep quality at night. 10 minutes outside without glasses.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🫁", category: "HEALTH", title: "Practice nasal breathing", desc: "Mouth breathing affects jaw development, causes snoring, and dries out your throat and skin. Nasal breathing improves oxygen efficiency and jaw definition.", impact: "🔥 High", timeframe: "1 month", color: CATEGORY_COLORS.HEALTH },
  { icon: "💧", category: "HEALTH", title: "Drink water first thing in the morning", desc: "After 7-9 hours of sleep, your body is dehydrated. 500ml of water immediately upon waking kick-starts metabolism and improves cognitive function.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.HEALTH },
  { icon: "🌡️", category: "HEALTH", title: "Finish every shower with 60 seconds cold", desc: "Cold exposure at the end of your shower increases norepinephrine by 300%, reduces inflammation, and wakes you up better than coffee.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.HEALTH },
  { icon: "🧬", category: "HEALTH", title: "Optimize your testosterone naturally", desc: "Lift heavy, sleep 8 hours, reduce stress, cut alcohol, eat saturated fat and zinc. Natural testosterone is foundational to looking and feeling your best.", impact: "🔥 High", timeframe: "2 months", color: CATEGORY_COLORS.HEALTH },
  { icon: "🍵", category: "HEALTH", title: "Replace coffee with matcha occasionally", desc: "Matcha provides sustained energy without the crash or cortisol spike. L-theanine in matcha reduces anxiety while keeping you alert.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🫀", category: "HEALTH", title: "Track your heart rate variability", desc: "HRV is the best indicator of recovery, stress, and health. High HRV means you're adapting. Low HRV means you need rest. Use a wearable to track.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🌿", category: "HEALTH", title: "Add adaptogens like ashwagandha", desc: "Ashwagandha reduces cortisol, improves testosterone, lowers anxiety, and increases muscle recovery. One of the most evidence-backed supplements.", impact: "⚡ Medium", timeframe: "6 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🛀", category: "HEALTH", title: "Take an Epsom salt bath weekly", desc: "Magnesium from Epsom salts absorbs through skin, reducing muscle soreness, improving sleep, and reducing stress. 20 minutes once a week.", impact: "✨ Quick Win", timeframe: "1 night", color: CATEGORY_COLORS.HEALTH },

  // ───────── POSTURE (10 tips) ─────────
  { icon: "🧍", category: "POSTURE", title: "Fix your posture right now", desc: "Shoulders back, chest up, chin parallel to floor. Do this immediately. The confidence boost is instant, and so is the attractiveness increase.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.POSTURE },
  { icon: "💻", category: "POSTURE", title: "Raise your screen to eye level", desc: "Looking down at your screen for hours creates forward head posture (tech neck) which creates double chins and a rounded upper back. Fix this.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.POSTURE },
  { icon: "🪑", category: "POSTURE", title: "Switch to a standing desk or take standing breaks", desc: "Sitting for hours compresses your spine and trains your body to hunch. Even 20 minutes of standing per hour dramatically improves posture over time.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.POSTURE },
  { icon: "🔧", category: "POSTURE", title: "Strengthen your posterior chain", desc: "Weak glutes, hamstrings, and upper back muscles cause the hunching posture. Deadlifts, Romanian deadlifts, and face pulls fix this structurally.", impact: "🔥 High", timeframe: "2 months", color: CATEGORY_COLORS.POSTURE },
  { icon: "📐", category: "POSTURE", title: "Do chin tucks daily", desc: "Chin tucks counteract forward head posture. Pull your chin straight back (not down) and hold for 5 seconds. Do 10 reps, 3x a day.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.POSTURE },
  { icon: "🤸", category: "POSTURE", title: "Stretch your hip flexors daily", desc: "Tight hip flexors from sitting tilt your pelvis forward and cause lower back arching. Couch stretches and hip flexor lunges fix this in weeks.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.POSTURE },
  { icon: "🛌", category: "POSTURE", title: "Sleep in a posture-friendly position", desc: "Sleeping on your stomach strains your neck. Back or side sleeping with a supportive pillow maintains spinal alignment and prevents morning stiffness.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.POSTURE },
  { icon: "👁️", category: "POSTURE", title: "Lead with your chest when walking", desc: "Imagine a string pulling your sternum forward and up when you walk. This simple cue makes you look taller, more confident, and more dominant instantly.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.POSTURE },
  { icon: "📏", category: "POSTURE", title: "Do wall angels daily", desc: "Stand with your back flat against a wall, arms in goalpost position, and slide them overhead. 10 reps reveals and corrects your shoulder mobility issues.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.POSTURE },
  { icon: "🏋️", category: "POSTURE", title: "Train your rhomboids with face pulls", desc: "Face pulls directly target the rear deltoids and rhomboids responsible for keeping shoulders back. Add them to every upper body session.", impact: "🔥 High", timeframe: "6 weeks", color: CATEGORY_COLORS.POSTURE },

  // ───────── EYES (10 tips) ─────────
  { icon: "👁️", category: "EYES", title: "Cold compress to reduce eye bags", desc: "Refrigerated spoons or a jade roller under-eye for 5 mins every morning eliminates puffiness and brightens the under-eye area instantly.", impact: "✨ Quick Win", timeframe: "5 mins", color: CATEGORY_COLORS.EYES },
  { icon: "😤", category: "EYES", title: "Practice intense, relaxed eye contact", desc: "Darting eyes signal insecurity. Steady, soft eye contact signals dominance and confidence. Practice holding it for 3-5 seconds comfortably.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.EYES },
  { icon: "💤", category: "EYES", title: "Treat dark circles with Vitamin K cream", desc: "Vitamin K reduces the appearance of dark circles by strengthening capillaries under the eyes. Use it nightly for 4-6 weeks.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.EYES },
  { icon: "🥕", category: "EYES", title: "Eat more carrots, spinach, and eggs", desc: "Beta-carotene, lutein, and zeaxanthin protect eye health and reduce puffiness from inflammation. Your eyes literally look healthier.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.EYES },
  { icon: "📱", category: "EYES", title: "Reduce screen time before bed", desc: "Blue light disrupts melatonin and reduces sleep quality, which directly causes puffy, dull eyes. Screens off 1 hour before sleep changes your eye appearance.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.EYES },
  { icon: "🕶️", category: "EYES", title: "Wear sunglasses outdoors always", desc: "UV damage accelerates crow's feet and under-eye wrinkles. Sunglasses protect the delicate eye area skin and reduce squinting habits.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.EYES },
  { icon: "💧", category: "EYES", title: "Use caffeine eye cream in the morning", desc: "Caffeine constricts blood vessels under the eyes and reduces puffiness and dark circles visibly within minutes of application.", impact: "✨ Quick Win", timeframe: "10 mins", color: CATEGORY_COLORS.EYES },
  { icon: "🧘", category: "EYES", title: "Practice the 20-20-20 rule", desc: "Every 20 minutes, look at something 20 feet away for 20 seconds. Reduces eye strain and prevents the tired, unfocused look from screen fatigue.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.EYES },
  { icon: "🌙", category: "EYES", title: "Get allergy treatment if eyes are often red", desc: "Red, watery, puffy eyes from untreated allergies tank your attractiveness daily. Antihistamine eye drops or allergy shots are worth it.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.EYES },
  { icon: "😎", category: "EYES", title: "Practice the squinch for better photos", desc: "The squinch is a slight squinting of the lower eyelid. It makes eyes look more confident and photogenic in every single photo. Practice it.", impact: "✨ Quick Win", timeframe: "5 mins", color: CATEGORY_COLORS.EYES },

  // ───────── DIET (18 tips) ─────────
  { icon: "🥗", category: "DIET", title: "Cut sugar and processed food", desc: "Sugar glycates collagen, causing systemic inflammation visible in your skin. Cut processed food for 2 weeks and the difference will shock you.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🥩", category: "DIET", title: "Eat 1g protein per lb of bodyweight", desc: "Muscle requires protein. So does hair, skin elasticity, and nail strength. Most people eat half of what they actually need.", impact: "🔥 High", timeframe: "1 month", color: CATEGORY_COLORS.DIET },
  { icon: "💧", category: "DIET", title: "Drink 3 liters of water daily", desc: "Dehydration causes dull skin, dark circles, poor metabolism, and brain fog. Water is the cheapest, most underused glow-up strategy.", impact: "✨ Quick Win", timeframe: "3 days", color: CATEGORY_COLORS.DIET },
  { icon: "🫚", category: "DIET", title: "Add olive oil and avocados to your diet", desc: "Monounsaturated fats nourish skin from inside out, improve hair shine, and support hormone production. These fats make you look better.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🐟", category: "DIET", title: "Eat fatty fish 3x per week", desc: "Salmon, mackerel, and sardines are packed with omega-3 that reduce skin inflammation, improve hair thickness, and support testosterone.", impact: "🔥 High", timeframe: "6 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🫐", category: "DIET", title: "Eat antioxidant-rich berries daily", desc: "Blueberries, strawberries, and pomegranate fight free radicals that age your skin. Add a handful to your morning meal daily.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🥚", category: "DIET", title: "Eat 3-4 eggs per day", desc: "Eggs contain biotin, choline, and complete protein — all essential for hair strength and skin health. Don't fear the yolk.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🥦", category: "DIET", title: "Eat cruciferous vegetables daily", desc: "Broccoli, spinach, and kale detoxify the liver, reduce inflammation, and contain zinc for clear skin. The boring truth about glowing skin.", impact: "🔥 High", timeframe: "3 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🍠", category: "DIET", title: "Reduce sodium intake", desc: "High sodium causes facial bloating and puffiness within hours. Restaurant food is loaded with it. Cook at home and your face will slim within days.", impact: "⚡ Medium", timeframe: "3 days", color: CATEGORY_COLORS.DIET },
  { icon: "🌾", category: "DIET", title: "Cut gluten and dairy for 3 weeks", desc: "Many people have low-grade sensitivities that cause chronic inflammation and acne. An elimination trial reveals if food is behind your skin issues.", impact: "🔥 High", timeframe: "3 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🫘", category: "DIET", title: "Add zinc-rich foods to your diet", desc: "Zinc is essential for testosterone production, wound healing, and acne prevention. Pumpkin seeds, beef, and shellfish are top sources.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🍵", category: "DIET", title: "Drink bone broth regularly", desc: "Bone broth is naturally rich in collagen, gelatin, and minerals. Regular consumption improves skin elasticity, gut health, and joint recovery.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🌰", category: "DIET", title: "Eat Brazil nuts for selenium", desc: "Just 2-3 Brazil nuts daily provide your full selenium requirement. Selenium reduces inflammation, supports thyroid, and improves skin clarity.", impact: "✨ Quick Win", timeframe: "3 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "⏰", category: "DIET", title: "Practice intermittent fasting", desc: "16:8 fasting lowers insulin, reduces inflammation, triggers autophagy (cellular cleanup), and helps maintain a lean face and body.", impact: "🔥 High", timeframe: "4 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🥤", category: "DIET", title: "Eliminate liquid calories", desc: "Sodas, juices, and alcohol are calorie-dense and nutrient-poor. Eliminating liquid calories is the easiest way to reduce face fat and bloating.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🧂", category: "DIET", title: "Add turmeric to your meals", desc: "Curcumin in turmeric is a powerful anti-inflammatory that reduces skin redness, puffiness, and acne. Black pepper enhances absorption by 2000%.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🍎", category: "DIET", title: "Eat the rainbow (diverse vegetables)", desc: "Different colored vegetables contain different phytonutrients. Eating a wide variety ensures you get all the micronutrients your skin and body need.", impact: "⚡ Medium", timeframe: "4 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🫙", category: "DIET", title: "Eat fermented foods for gut health", desc: "Yogurt, kimchi, sauerkraut, and kefir improve gut microbiome which directly impacts skin clarity, mood, and immune function.", impact: "🔥 High", timeframe: "4 weeks", color: CATEGORY_COLORS.DIET },

  // ───────── MINDSET (16 tips) ─────────
  { icon: "🧠", category: "MINDSET", title: "Develop a genuine passion or skill", desc: "People are attracted to people interested in life. Read, create, build, explore. Purpose and passion are visible in your face and energy.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "📚", category: "MINDSET", title: "Read one book per month", desc: "Reading makes you more interesting, more articulate, and more attractive. Intelligence and depth are noticed. The library is free.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "🎯", category: "MINDSET", title: "Set and pursue one big goal", desc: "Having a compelling goal gives you drive that's visible. People are drawn to those who are building something. Know what you're building.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "🔒", category: "MINDSET", title: "Stop seeking external validation", desc: "The moment you stop needing people's approval is the moment you become genuinely attractive. Neediness is a repellent. Self-sufficiency draws people in.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "🌅", category: "MINDSET", title: "Build a morning routine and commit to it", desc: "Waking up with a structured morning routine signals to yourself that you're intentional about your life. That confidence radiates outward.", impact: "🔥 High", timeframe: "3 weeks", color: CATEGORY_COLORS.MINDSET },
  { icon: "💬", category: "MINDSET", title: "Practice positive self-talk", desc: "The way you speak to yourself shapes your confidence and eventually your posture, smile, and energy. Speak to yourself like someone you love.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.MINDSET },
  { icon: "🧘", category: "MINDSET", title: "Meditate 10 minutes daily", desc: "Meditation reduces cortisol, improves presence, and makes you a better listener. Being fully present in conversations is profoundly attractive.", impact: "⚡ Medium", timeframe: "3 weeks", color: CATEGORY_COLORS.MINDSET },
  { icon: "📓", category: "MINDSET", title: "Journal daily for 5 minutes", desc: "Journaling processes emotions, clarifies goals, and reduces anxiety. Emotional clarity makes you more grounded and less reactive. Both are attractive.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.MINDSET },
  { icon: "🔇", category: "MINDSET", title: "Reduce social media by 50%", desc: "Social media creates comparison loops that tank confidence. Less time scrolling = more time doing. Doers are always more attractive than watchers.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.MINDSET },
  { icon: "🌊", category: "MINDSET", title: "Embrace discomfort deliberately", desc: "Doing hard things daily (cold showers, difficult conversations, new skills) builds a confidence that's visible in how you carry yourself.", impact: "🔥 High", timeframe: "1 month", color: CATEGORY_COLORS.MINDSET },
  { icon: "🤝", category: "MINDSET", title: "Stop comparing yourself to others", desc: "Comparison drains energy you could spend improving. Your competition is yesterday's version of you. Everyone else is irrelevant.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "🏆", category: "MINDSET", title: "Track your progress weekly", desc: "Reviewing your own progress builds momentum and confidence. Take monthly photos, track fitness metrics, and review your improvements.", impact: "⚡ Medium", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "🌱", category: "MINDSET", title: "Adopt a growth mindset about your looks", desc: "Believing that your appearance can improve with effort is the first and most important step. Fixed mindset kills glow-ups before they start.", impact: "🔥 High", timeframe: "Immediate", color: CATEGORY_COLORS.MINDSET },
  { icon: "💪", category: "MINDSET", title: "Learn to be comfortable in silence", desc: "People who are comfortable with silence in conversations are perceived as more confident and intelligent. Stop filling every pause with noise.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.MINDSET },
  { icon: "🎭", category: "MINDSET", title: "Act confident before you feel confident", desc: "Confidence is a skill that comes from action, not a feeling that precedes it. Fake it structurally: posture, pace, eye contact, until it's real.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.MINDSET },
  { icon: "🫂", category: "MINDSET", title: "Invest in therapy or coaching", desc: "Addressing limiting beliefs, trauma, and mental patterns unlocks a version of yourself that better grooming alone can never reach.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.MINDSET },

  // ───────── SOCIAL (16 tips) ─────────
  { icon: "💬", category: "SOCIAL", title: "Improve your conversational skills", desc: "Ask great questions. Listen actively. Forget about yourself. People leave conversations feeling seen, and that makes them like you.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.SOCIAL },
  { icon: "😄", category: "SOCIAL", title: "Smile more with your eyes", desc: "A genuine smile engages the orbicularis oculi (the eye crinkle muscles). Fake smiles don't. Practice in the mirror. It changes everything.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🗣️", category: "SOCIAL", title: "Lower your speaking voice slightly", desc: "A deeper, slower, more resonant speaking voice is consistently rated as more attractive and authoritative. Speak from your chest, not your throat.", impact: "🔥 High", timeframe: "3 weeks", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🤌", category: "SOCIAL", title: "Use confident body language", desc: "Take up space. Don't cross your arms. Plant your feet shoulder-width apart. Open body language signals confidence and makes you more approachable.", impact: "🔥 High", timeframe: "Immediate", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🎤", category: "SOCIAL", title: "Learn to tell a compelling story", desc: "People who can tell stories well are magnetic. Learn the setup-conflict-resolution structure. Practice stories from your own life until they're polished.", impact: "🔥 High", timeframe: "1 month", color: CATEGORY_COLORS.SOCIAL },
  { icon: "😂", category: "SOCIAL", title: "Develop your sense of humor", desc: "Humor is consistently ranked as one of the most attractive traits in both genders. Watch stand-up, read funny books, practice wit in low-stakes conversations.", impact: "🔥 High", timeframe: "3 months", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🎯", category: "SOCIAL", title: "Be genuinely interested in others", desc: "Ask people what excites them. Remember what they told you and follow up. People are hungry to be truly heard. Giving that is magnetic.", impact: "🔥 High", timeframe: "Immediate", color: CATEGORY_COLORS.SOCIAL },
  { icon: "⏸️", category: "SOCIAL", title: "Slow down your speech", desc: "Fast talking reads as nervous. Slow, deliberate speech reads as confident and thoughtful. Pause before answering. Take up conversational time.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.SOCIAL },
  { icon: "📞", category: "SOCIAL", title: "Invest in your close friendships", desc: "Quality of your social circle shapes your confidence, opportunities, and worldview. Upgrade your friendships and you upgrade yourself.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🤝", category: "SOCIAL", title: "Give firm, confident handshakes", desc: "A weak handshake creates an immediate negative first impression. Firm, two-shake, eye contact. Practice with friends until it's automatic.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🎭", category: "SOCIAL", title: "Take an improv or acting class", desc: "Improv builds quick thinking, comfort with attention, and social spontaneity. People who've done improv are universally more fun to be around.", impact: "🔥 High", timeframe: "2 months", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🌐", category: "SOCIAL", title: "Put your phone away in social settings", desc: "Being fully present when you're with people is so rare that it stands out immediately. Your undivided attention is the most attractive gift you can give.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🏋️", category: "SOCIAL", title: "Join a class, club, or team", desc: "Shared activities create natural social bonds. Joining a gym class, sports team, or hobby club expands your social world and your options.", impact: "🔥 High", timeframe: "1 month", color: CATEGORY_COLORS.SOCIAL },
  { icon: "✍️", category: "SOCIAL", title: "Improve your texting and messaging game", desc: "Be interesting, be brief, end conversations first occasionally, and avoid double-texting. Texting is a skill and most people are bad at it.", impact: "⚡ Medium", timeframe: "1 week", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🌍", category: "SOCIAL", title: "Travel somewhere new annually", desc: "Travel builds perspective, stories, confidence, and open-mindedness. People who've experienced the world are more interesting to talk to.", impact: "🔥 High", timeframe: "1 trip", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🧠", category: "SOCIAL", title: "Learn a person's name and use it", desc: "A person's name is their favorite word. Using it in conversation creates connection instantly. Remember it, use it once or twice, watch the effect.", impact: "✨ Quick Win", timeframe: "Immediate", color: CATEGORY_COLORS.SOCIAL },

  // ───── Extra tips to round out 200 ─────
  { icon: "🌬️", category: "HAIR", title: "Blow dry with a round brush for volume", desc: "A round brush + blow dryer combination lifts hair at the roots and creates volume that styled hair has. 3 minutes of technique that changes your entire look.", impact: "✨ Quick Win", timeframe: "5 mins", color: CATEGORY_COLORS.HAIR },
  { icon: "🧪", category: "SKIN", title: "Use azelaic acid for even skin tone", desc: "Azelaic acid reduces redness, fades hyperpigmentation, fights acne bacteria, and brightens. One of the most underrated skincare actives for all skin types.", impact: "⚡ Medium", timeframe: "6 weeks", color: CATEGORY_COLORS.SKIN },
  { icon: "🏅", category: "FITNESS", title: "Add jump rope to your cardio", desc: "Jump rope burns more calories than running, improves coordination, and builds calf definition. 10 minutes = 30 minutes of jogging. Extremely time-efficient.", impact: "🔥 High", timeframe: "6 weeks", color: CATEGORY_COLORS.FITNESS },
  { icon: "🧖", category: "GROOMING", title: "Get your back and chest waxed or lasered", desc: "Excessive body hair on the back and chest reduces perceived attractiveness in most demographics. Waxing lasts 4-6 weeks, laser is permanent.", impact: "⚡ Medium", timeframe: "1 day", color: CATEGORY_COLORS.GROOMING },
  { icon: "🔬", category: "HEALTH", title: "Take creatine monohydrate daily", desc: "Creatine is the most studied supplement in existence. It increases strength, muscle fullness, and even improves cognitive function. 5g daily, no loading needed.", impact: "🔥 High", timeframe: "4 weeks", color: CATEGORY_COLORS.HEALTH },
  { icon: "🦶", category: "POSTURE", title: "Strengthen your feet and ankles", desc: "Weak feet cause collapsed arches which chain-react into knee valgus, hip misalignment, and poor posture. Single-leg stands and calf raises fix this.", impact: "⚡ Medium", timeframe: "6 weeks", color: CATEGORY_COLORS.POSTURE },
  { icon: "🌈", category: "EYES", title: "Try colored or clear lens contacts", desc: "Even clear lenses whiten the sclera and define the iris border. Colored lenses can subtly enhance eye color to make them more striking.", impact: "✨ Quick Win", timeframe: "1 day", color: CATEGORY_COLORS.EYES },
  { icon: "🫙", category: "DIET", title: "Add magnesium before bed", desc: "Magnesium improves sleep quality, reduces muscle cramps, lowers cortisol, and supports testosterone. Glycinate form is most bioavailable and easiest on the gut.", impact: "⚡ Medium", timeframe: "2 weeks", color: CATEGORY_COLORS.DIET },
  { icon: "🧩", category: "MINDSET", title: "Challenge yourself with one new skill monthly", desc: "Learning new skills activates neuroplasticity, builds confidence, and gives you stories and depth. Guitar, language, cooking — it doesn't matter. Learn.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "🗺️", category: "SOCIAL", title: "Have interesting opinions, not just safe ones", desc: "People who have genuine opinions, even controversial ones, are more magnetic than people who agree with everything to avoid conflict. Stand for something.", impact: "🔥 High", timeframe: "2 weeks", color: CATEGORY_COLORS.SOCIAL },
  { icon: "💡", category: "MINDSET", title: "Reframe rejection as data, not defeat", desc: "Every rejection gives you information about what to improve or who wasn't right. People who can't be rejected can't be chosen. Embrace the process.", impact: "🔥 High", timeframe: "Ongoing", color: CATEGORY_COLORS.MINDSET },
  { icon: "🎵", category: "SOCIAL", title: "Develop a genuine music taste", desc: "Music taste is a window into personality. Having specific artists you love and can talk about passionately is far more attractive than 'I like everything.'", impact: "⚡ Medium", timeframe: "1 month", color: CATEGORY_COLORS.SOCIAL },
  { icon: "🏡", category: "STYLE", title: "Keep your living space clean and styled", desc: "Your home reflects your standards. A clean, intentionally decorated space signals self-respect and taste. Scented candles, plants, and minimal clutter.", impact: "🔥 High", timeframe: "1 week", color: CATEGORY_COLORS.STYLE },
  { icon: "💪", category: "FITNESS", title: "Do 100 push-ups per day for 30 days", desc: "100 push-ups spread across the day (sets of 20-25) builds chest, shoulders, and triceps, improves posture, and creates the habit of daily movement.", impact: "🔥 High", timeframe: "1 month", color: CATEGORY_COLORS.FITNESS },
];

const IMPACT_FILTERS: Impact[] = ["🔥 High", "⚡ Medium", "✨ Quick Win"];
const ALL_CATEGORIES = ["All", ...Array.from(new Set(TIPS.map((t) => t.category)))];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function triggerHaptic() {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

const FEATURED_TIP = randomItem(TIPS);

export default function LookmaxingTipsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [impactFilter, setImpactFilter] = useState<Impact | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return TIPS.filter((t) => {
      const impactOk = impactFilter === "All" || t.impact === impactFilter;
      const catOk = categoryFilter === "All" || t.category === categoryFilter;
      return impactOk && catOk;
    });
  }, [impactFilter, categoryFilter]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Lookmaxing Tips ✨</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Stats Row */}
      <View style={styles.statsRow}>
        <StatBox value={`${TIPS.length}`} label="Total Tips" color="#00CFA8" />
        <StatBox value={`${TIPS.filter(t => t.impact === "🔥 High").length}`} label="High Impact" color="#FF6B35" />
        <StatBox value={`${ALL_CATEGORIES.length - 1}`} label="Categories" color="#9C27B0" />
      </View>

      {/* Featured Tip of the Day */}
      <View style={[styles.featuredCard, { borderColor: FEATURED_TIP.color + "55" }]}>
        <View style={styles.featuredHeader}>
          <View style={[styles.featuredBadge, { backgroundColor: FEATURED_TIP.color }]}>
            <Text style={styles.featuredBadgeText}>⚡ TIP OF THE DAY</Text>
          </View>
          <Text style={styles.featuredTimeframe}>{FEATURED_TIP.timeframe}</Text>
        </View>
        <View style={styles.featuredBody}>
          <Text style={styles.featuredEmoji}>{FEATURED_TIP.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.featuredTitle}>{FEATURED_TIP.title}</Text>
            <Text style={styles.featuredDesc} numberOfLines={2}>{FEATURED_TIP.desc}</Text>
          </View>
        </View>
      </View>

      {/* Impact Filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScrollWrap}
        contentContainerStyle={styles.filterRow}
      >
        {(["All", ...IMPACT_FILTERS] as const).map((f) => {
          const active = impactFilter === f;
          const color = f === "🔥 High" ? "#FF6B35" : f === "⚡ Medium" ? "#9C27B0" : f === "✨ Quick Win" ? "#E040A0" : "#00CFA8";
          return (
            <Pressable
              key={f}
              style={[styles.filterChip, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => { triggerHaptic(); setImpactFilter(f as Impact | "All"); }}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Category Filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScrollWrap}
        contentContainerStyle={styles.filterRow}
      >
        {ALL_CATEGORIES.map((cat) => {
          const active = categoryFilter === cat;
          const color = cat === "All" ? "#00CFA8" : CATEGORY_COLORS[cat as Category];
          return (
            <Pressable
              key={cat}
              style={[styles.catChip, active && { backgroundColor: color + "33", borderColor: color }]}
              onPress={() => { triggerHaptic(); setCategoryFilter(cat); }}
            >
              <Text style={[styles.catChipText, active && { color: color }]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.resultCount}>{filtered.length} tip{filtered.length !== 1 ? "s" : ""} found</Text>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((tip, i) => {
          const isExpanded = expanded === i;
          return (
            <Pressable
              key={`${tip.title}-${i}`}
              style={[styles.tipCard, { borderLeftColor: tip.color }]}
              onPress={() => { triggerHaptic(); setExpanded(isExpanded ? null : i); }}
            >
              <View style={styles.tipTop}>
                <View style={[styles.tipIconBox, { backgroundColor: tip.color + "20" }]}>
                  <Text style={styles.tipEmoji}>{tip.icon}</Text>
                </View>
                <View style={styles.tipMeta}>
                  <View style={styles.tipMetaTop}>
                    <Text style={[styles.tipCategory, { color: tip.color }]}>{tip.category}</Text>
                    <View style={[styles.impactTag, { backgroundColor: tip.color + "22" }]}>
                      <Text style={[styles.impactText, { color: tip.color }]}>{tip.impact}</Text>
                    </View>
                  </View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  {!isExpanded && (
                    <Text style={styles.tipDescPreview} numberOfLines={1}>{tip.desc}</Text>
                  )}
                </View>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="rgba(255,255,255,0.3)"
                />
              </View>

              {isExpanded && (
                <View style={styles.tipExpanded}>
                  <Text style={styles.tipDesc}>{tip.desc}</Text>
                  <View style={[styles.timeframeBadge, { backgroundColor: tip.color + "22" }]}>
                    <Ionicons name="time-outline" size={12} color={tip.color} />
                    <Text style={[styles.timeframeText, { color: tip.color }]}>Results in: {tip.timeframe}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="mirror" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>No tips match your filters</Text>
            <Pressable onPress={() => { setImpactFilter("All"); setCategoryFilter("All"); }}>
              <Text style={styles.emptyReset}>Reset filters</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={[statStyles.box, { borderColor: color + "33" }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  box: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1,
    padding: 10, alignItems: "center", gap: 2,
  },
  value: { fontSize: 22, fontWeight: "900" },
  label: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "700", letterSpacing: 0.5 },
});

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

  statsRow: { flexDirection: "row", gap: 8, marginHorizontal: 20, marginBottom: 12 },

  featuredCard: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 14, gap: 10,
    borderWidth: 1,
  },
  featuredHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  featuredBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  featuredBadgeText: { color: "#000", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  featuredTimeframe: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "600" },
  featuredBody: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featuredEmoji: { fontSize: 28, marginTop: 2 },
  featuredTitle: { color: "#fff", fontWeight: "800", fontSize: 14, marginBottom: 4 },
  featuredDesc: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 18 },

  filterScrollWrap: { marginBottom: 6 },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 2 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)",
  },
  filterChipText: { color: "rgba(255,255,255,0.45)", fontWeight: "700", fontSize: 12 },
  filterChipTextActive: { color: "#fff" },

  catChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  catChipText: { color: "rgba(255,255,255,0.35)", fontWeight: "700", fontSize: 11 },

  resultCount: { marginHorizontal: 20, color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: "600", marginBottom: 4 },

  list: { paddingHorizontal: 20, gap: 10 },
  tipCard: {
    backgroundColor: "#1A0D30", borderRadius: 16, padding: 14, gap: 10,
    borderLeftWidth: 3,
    elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  tipTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  tipEmoji: { fontSize: 22 },
  tipMeta: { flex: 1, gap: 3 },
  tipMetaTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipCategory: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  impactTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  impactText: { fontSize: 10, fontWeight: "700" },
  tipTitle: { fontSize: 14, fontWeight: "800", color: "#fff" },
  tipDescPreview: { fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 18 },
  tipExpanded: { gap: 10, paddingTop: 4, paddingLeft: 56 },
  tipDesc: { color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 21 },
  timeframeBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: "flex-start",
  },
  timeframeText: { fontSize: 11, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: "600" },
  emptyReset: { color: "#00CFA8", fontSize: 14, fontWeight: "700" },
});
