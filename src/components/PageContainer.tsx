type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className={`mx-auto flex min-h-dvh max-w-2xl flex-col p-4 ${className}`}>
        {children}
      </div>
    </div>
  );
}
