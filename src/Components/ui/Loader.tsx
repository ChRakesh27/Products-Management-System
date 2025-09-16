const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white/80 absolute top-0 left-0 w-full h-full z-[99999]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );
};

// function Loader() {
//   return (
//     <div className="p-6 w-full">
//       <Card className="p-8">
//         <div className="h-4 w-40 rounded bg-slate-200" />
//         <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <div key={i} className="h-20 rounded border bg-slate-50" />
//           ))}
//         </div>
//         <div className="mt-6 h-64 rounded border bg-slate-50" />
//       </Card>
//     </div>
//   );
// }

export default Loader;
