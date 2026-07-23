"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

type FlyFunction = (
  source: HTMLElement | null,
  target: HTMLElement | null
) => Promise<void>;

const FlyContext = createContext<FlyFunction | null>(null);

export function FlyToCartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const animate: FlyFunction = (source, target) => {
    return new Promise((resolve) => {
      if (!source || !target) {
        resolve();
        return;
      }

      const img =
        source.querySelector("img");

      if (!img) {
        resolve();
        return;
      }

      const start = img.getBoundingClientRect();
      const end = target.getBoundingClientRect();

      const clone = img.cloneNode(true) as HTMLImageElement;

      clone.style.position = "fixed";
      clone.style.left = `${start.left}px`;
      clone.style.top = `${start.top}px`;
      clone.style.width = `${start.width}px`;
      clone.style.height = `${start.height}px`;
      clone.style.pointerEvents = "none";
      clone.style.zIndex = "99999";
      clone.style.transition =
        "all .75s cubic-bezier(.25,.8,.25,1)";
      clone.style.borderRadius = "10px";

      document.body.appendChild(clone);

      requestAnimationFrame(() => {
        clone.style.left = `${end.left}px`;
        clone.style.top = `${end.top}px`;
        clone.style.width = "25px";
        clone.style.height = "25px";
        clone.style.opacity = ".2";
        clone.style.transform =
          "scale(.2) rotate(720deg)";
      });

      clone.addEventListener(
        "transitionend",
        () => {
          clone.remove();

          target.animate(
            [
              {
                transform: "scale(1)",
              },
              {
                transform: "scale(1.35)",
              },
              {
                transform: "scale(.9)",
              },
              {
                transform: "scale(1)",
              },
            ],
            {
              duration: 350,
            }
          );

          resolve();
        },
        { once: true }
      );
    });
  };

  return (
    <FlyContext.Provider value={animate}>
      {children}
    </FlyContext.Provider>
  );
}

export function useFlyToCart() {
  const context = useContext(FlyContext);

  if (!context)
    throw new Error("FlyToCartProvider missing");

  return context;
}