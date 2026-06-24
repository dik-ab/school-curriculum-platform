import { useEffect, useState } from "react";

function currentPath(): string {
  // "#/users/alice" → "/users/alice"。ハッシュがなければ "/"
  return location.hash.slice(1) || "/";
}

export function useHashRoute() {
  const [path, setPath] = useState(currentPath());

  useEffect(() => {
    const onHashChange = () => setPath(currentPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (to: string) => {
    location.hash = `#${to}`;
  };

  return { path, navigate };
}
