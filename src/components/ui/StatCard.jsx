import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "../../utils/formatters.js";

function AnimatedValue({ value }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 18 });
  const rounded = useTransform(spring, (latest) => Math.round(latest).toLocaleString("en"));

  useEffect(() => {
    motionValue.set(Number(value || 0));
  }, [motionValue, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatCard({ title, value, icon: Icon, accent = "cyan", trend, className }) {
  const accentMap = {
    cyan: "from-cyan-500 to-teal-500",
    emerald: "from-green-500 to-emerald-600",
    coral: "from-orange-500 to-rose-500",
    violet: "from-violet-500 to-cyan-500",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={cn(
        "rounded-lg border border-white/45 bg-white/78 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/8",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
          <div className="mt-3 text-3xl font-black tracking-normal text-slate-950 dark:text-white">
            <AnimatedValue value={value} />
          </div>
        </div>
        <div className={cn("rounded-lg bg-gradient-to-br p-3 text-white shadow-lift", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend ? <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{trend}</p> : null}
    </motion.div>
  );
}

