import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { init } from "../util/partykit";
import { Heart, LightBulb } from "./icons";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import styles from "./reaction-display.module.css";

gsap.registerPlugin(MotionPathPlugin);

type IconState = {
  id: number;
  type: "heart" | "light-bulb";
}[];

const AnimatedIcon = ({
  type,
  containerDimensions,
}: {
  type: string;
  containerDimensions: { width: number; height: number };
}) => {
  const ref = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const { width, height } = containerDimensions;
      const {
        baseVal: { value: iconWidth },
      } = ref.current!.width;

      const startX = gsap.utils.random(0, width - iconWidth);
      const endX = gsap.utils.random(
        startX - width * 0.02,
        startX + width * 0.02
      );
      const endY = gsap.utils.random(height * -0.15, height * -0.35);

      tl.set(ref.current, {
        x: startX,
        y: 0,
        opacity: 1,
      });

      tl.to(ref.current, {
        duration: 1.5,
        ease: "power2.out",
        motionPath: {
          alignOrigin: [0.5, 0.5],
          autoRotate: 90,
          curviness: 2,
          path: [
            { x: startX, y: 0 },
            { x: startX, y: -20 },
            { x: endX, y: endY * 0.67 },
            { x: endX, y: endY },
          ],
        },
      });

      tl.to(ref.current, {
        duration: 0.75,
        delay: -0.75,
        opacity: 0,
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  const Icon = type === "heart" ? Heart : LightBulb;
  return <Icon ref={ref} className={styles.reactionIcon} />;
};

export const ReactionDisplay = () => {
  const layout = useRef<HTMLDivElement>(null);
  const [icons, setIcons] = useState<IconState>([]);
  const [containerDimensions, setContainerDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 100, height: 100 });

  useEffect(() => {
    init({
      log: (msg) => {
        console.log(msg);
      },
      onMessage({ type, data }) {
        if (type !== "reaction") {
          return;
        }

        const id = Date.now();
        setIcons((icons) => [...icons, { id, type: data.type }]);

        setTimeout(() => {
          setIcons((icons) => icons.filter((icon) => icon.id !== id));
        }, 2000);
      },
    });
  }, []);

  useLayoutEffect(() => {
    const width = layout.current!.offsetWidth;
    const height = layout.current!.offsetHeight;
    setContainerDimensions({ width, height });
  }, []);

  return (
    <div ref={layout} className={styles.display}>
      {icons.map(({ id, type }) => (
        <AnimatedIcon
          type={type}
          key={id}
          containerDimensions={containerDimensions}
        />
      ))}
    </div>
  );
};
