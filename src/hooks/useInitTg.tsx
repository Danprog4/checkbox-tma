import { init, mockTelegramEnv, swipeBehavior } from "@telegram-apps/sdk";
import { useEffect } from "react";

export const useInitTg = () => {
  useEffect(() => {
    const themeParams = {
      accent_text_color: "#6ab2f2",
      bg_color: "#17212b",
      button_color: "#5288c1",
      button_text_color: "#ffffff",
      destructive_text_color: "#ec3942",
      header_bg_color: "#17212b",
      hint_color: "#708499",
      link_color: "#6ab3f3",
      secondary_bg_color: "#232e3c",
      section_bg_color: "#17212b",
      section_header_text_color: "#6ab3f3",
      subtitle_text_color: "#708499",
      text_color: "#f5f5f5",
    } as const;

    if (import.meta.env.DEV) {
      mockTelegramEnv({
        launchParams: {
          tgWebAppPlatform: "web",
          tgWebAppVersion: "8.0.0",
          tgWebAppData: import.meta.env.VITE_MOCK_INIT_DATA,
          tgWebAppThemeParams: themeParams,
          tgWebAppStartParam: "ref=3",
        },
      });
    }

    init();

    if (swipeBehavior.mount.isAvailable()) {
      console.log(
        "Swipe behavior is available",
        swipeBehavior.mount.isAvailable(),
        swipeBehavior.isVerticalEnabled()
      );
      swipeBehavior.mount();
      swipeBehavior.disableVertical();
    }
  }, []);
};
