export const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-dvh bg-gray-900 text-white p-0 md:p-4 flex items-center justify-center">
    <div className="max-w-xl w-full bg-gray-800 md:rounded-lg shadow-md py-4 md:p-6 h-dvh overflow-y-auto flex flex-col justify-center">{children}</div>
  </div>;
};