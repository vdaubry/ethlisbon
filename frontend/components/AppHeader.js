import { ConnectKitButton } from "connectkit";

export default function AppHeader() {
  return (
    <header className="bg-white mb-24">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <h2 className="text-2xl">AppName</h2>
          </a>
        </div>

        <div className="lg:flex lg:flex-1 lg:justify-end">
          <ConnectKitButton />
        </div>
      </nav>
    </header>
  );
}
