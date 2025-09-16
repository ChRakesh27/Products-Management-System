import { SidebarTrigger } from "../ui/sidebar";

function Navbar() {
  return (
    <div className="flex justify-between w-full border-b px-3 items-center nav sticky top-0 bg-white dark:bg-black z-[2]">
      <SidebarTrigger />
      {/* <ModeToggle /> */}
    </div>
  );
}

export default Navbar;
