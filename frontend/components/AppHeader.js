import { ConnectKitButton } from "connectkit";

export default function AppHeader() {
  return (
    <header className="bg-white mb-24">
      <nav className="flex items-center justify-center p-6 lg:px-8" aria-label="Global">
        <a href="/" className="-m-1.5 p-1.5">
          <h1 className="text-6xl font-bold">SLICE</h1>
        </a>
      </nav>
    </header>
  );
}
