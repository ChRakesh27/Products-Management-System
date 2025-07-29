const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white/80 absolute top-0 left-0 w-full h-full z-[99999]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );
};

export default Loader;
