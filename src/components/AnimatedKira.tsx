export const AnimatedKira = () => {
  return (
    <div className="relative inline-block">
      <div className="w-72 h-72 rounded-full bg-gradient-to-br from-bronze/20 to-bronze-dark/20 flex items-center justify-center">
        <span className="font-vollkorn text-8xl font-bold text-bronze">K</span>
      </div>

      {/* "Hi I'm Kira" text with speech bubble effect */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
        <div className="relative bg-background/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl border border-primary/30">
          <p className="font-poppins text-xl font-semibold text-foreground whitespace-nowrap">
            Hi! I'm Kira
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-background/95 rotate-45 border-r border-b border-primary/30"></div>
        </div>
      </div>
    </div>
  );
};
