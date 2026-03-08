import { useTheme } from "next-themes";
import { useEffect } from "react";

interface PublicPageWrapperProps {
  children: React.ReactNode;
}

const PublicPageWrapper = ({ children }: PublicPageWrapperProps) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Force light mode on public pages
    setTheme("light");

    return () => {
      // Restore app theme when leaving public pages
      const appTheme = localStorage.getItem("app-theme") || "dark";
      setTheme(appTheme);
    };
  }, [setTheme]);

  return <>{children}</>;
};

export default PublicPageWrapper;
