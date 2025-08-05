"use client";
import { useAtom } from "jotai";
import { upgradeBannerAtom } from "../atoms";
import UpgradeBanner from "~/app/whiteboard/UpgradeBanner";

export default function WhiteboardsUpgradeBanner() {
  const [upgradeBanner, setUpgradeBanner] = useAtom(upgradeBannerAtom);

  return (
    <UpgradeBanner
      isOpen={upgradeBanner.isOpen}
      onCloseAction={() =>
        setUpgradeBanner((prev) => ({ ...prev, isOpen: false }))
      }
      featureName={upgradeBanner.featureName}
    />
  );
}
