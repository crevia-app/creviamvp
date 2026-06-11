interface PublicPageWrapperProps {
  children: React.ReactNode;
}

const PublicPageWrapper = ({ children }: PublicPageWrapperProps) => {
  return (
    <>
      {/* Global ambient bronze glow — fixed behind all content, pointer-safe */}
      <div className="fixed inset-0 z-[-1] w-full h-full bg-background pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[80vh] w-full bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(240,120,47,0.12),transparent)]" />
      </div>
      {children}
    </>
  );
};

export default PublicPageWrapper;
