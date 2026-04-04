interface PublicPageWrapperProps {
  children: React.ReactNode;
}

const PublicPageWrapper = ({ children }: PublicPageWrapperProps) => {
  return <>{children}</>;
};

export default PublicPageWrapper;
