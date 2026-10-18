import { Hero } from "@/components/hero/hero";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "@/lib/theme/theme-toggle";

export default function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <ThemeToggle />
    </>
  );
}
