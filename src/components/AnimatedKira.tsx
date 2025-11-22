import kiraLion from "@/assets/kira-lion.png";

export const AnimatedKira = () => {
  return (
    <div className="relative inline-block">
      {/* Animated lion image */}
      <div className="animate-float-gentle">
        <img 
          src={kiraLion} 
          alt="Kira the lion" 
          className="w-64 h-64 object-contain drop-shadow-2xl animate-subtle-bounce"
        />
      </div>

      {/* "Hi I'm Kira" text with speech bubble effect */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-fade-in-up">
        <div className="relative bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border-2 border-bronze/30">
          <p className="font-poppins text-lg font-semibold text-foreground whitespace-nowrap">
            Hi! I'm Kira
          </p>
          {/* Speech bubble pointer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r-2 border-b-2 border-bronze/30"></div>
        </div>
      </div>

      {/* Floating sparkles */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-8 left-4 w-2 h-2 bg-bronze rounded-full animate-sparkle-1"></div>
        <div className="absolute top-12 right-8 w-2.5 h-2.5 bg-bronze rounded-full animate-sparkle-2"></div>
        <div className="absolute bottom-20 left-12 w-2 h-2 bg-bronze rounded-full animate-sparkle-3"></div>
        <div className="absolute bottom-16 right-4 w-2.5 h-2.5 bg-bronze rounded-full animate-sparkle-4"></div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-gentle {
            0%, 100% { 
              transform: translateY(0px);
            }
            50% { 
              transform: translateY(-12px);
            }
          }

          @keyframes subtle-bounce {
            0%, 100% { 
              transform: scale(1);
            }
            50% { 
              transform: scale(1.03);
            }
          }

          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translate(-50%, 10px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }

          @keyframes sparkle {
            0%, 100% { 
              opacity: 0;
              transform: scale(0);
            }
            50% { 
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-float-gentle {
            animation: float-gentle 3s ease-in-out infinite;
          }

          .animate-subtle-bounce {
            animation: subtle-bounce 4s ease-in-out infinite;
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }

          .animate-sparkle-1 {
            animation: sparkle 2s ease-in-out infinite;
            animation-delay: 0s;
          }

          .animate-sparkle-2 {
            animation: sparkle 2s ease-in-out infinite;
            animation-delay: 0.5s;
          }

          .animate-sparkle-3 {
            animation: sparkle 2s ease-in-out infinite;
            animation-delay: 1s;
          }

          .animate-sparkle-4 {
            animation: sparkle 2s ease-in-out infinite;
            animation-delay: 1.5s;
          }
        `
      }} />
    </div>
  );
};
