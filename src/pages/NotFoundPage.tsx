const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-foreground font-sans select-none">
      <div className="text-center max-w-md p-8 glass-panel rounded-2xl border border-muted/20">
        <h1 className="text-8xl font-black text-primary font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(179,102,255,0.3)]">
          404
        </h1>

        <h2 className="mt-6 text-2xl font-extrabold text-foreground tracking-tight">
          Page Not Found
        </h2>

        <p className="mt-3 text-xs text-muted font-mono uppercase tracking-wider">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;