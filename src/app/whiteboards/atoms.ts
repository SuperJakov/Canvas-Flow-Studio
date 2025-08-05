import { atom } from "jotai";

export const errorMessageAtom = atom<string | null>("");

export const upgradeBannerAtom = atom<{
  isOpen: boolean;
  featureName: string;
}>({
  isOpen: false,
  featureName: "",
});
