import AsyncStorage from '@react-native-async-storage/async-storage';

const LOOKMAXING_CREDITS_KEY = 'lookmaxing_credits';

export const getLookmaxingCredits = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(LOOKMAXING_CREDITS_KEY);
    return value !== null ? parseInt(value, 10) : 0;
  } catch (e) {
    return 0;
  }
};

export const setLookmaxingCredits = async (credits: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOOKMAXING_CREDITS_KEY, credits.toString());
  } catch (e) {
    console.error('Error saving credits:', e);
  }
};

export const addLookmaxingCredits = async (amount: number): Promise<number> => {
  const current = await getLookmaxingCredits();
  const next = current + amount;
  await setLookmaxingCredits(next);
  return next;
};

export const spendLookmaxingCredit = async (): Promise<number> => {
  const current = await getLookmaxingCredits();
  if (current <= 0) return 0;
  const next = current - 1;
  await setLookmaxingCredits(next);
  return next;
};
