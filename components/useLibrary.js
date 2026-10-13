"use client";
import { useEffect, useState } from "react";

// The catalogue and the home ad films, fetched once per page view from /api/library.
// Returns { loading, failed, catalogue: { series, folder, missing }, films: { items, folder } }.
let pending;
const load = () =>
  (pending ||= fetch("/api/library", { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .catch((e) => {
      pending = null; // let the next visit to the page try again
      throw e;
    }));

export function useLibrary() {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    let on = true;
    load().then(
      (d) => on && setState({ loading: false, ...d }),
      () => on && setState({ loading: false, failed: true })
    );
    return () => {
      on = false;
    };
  }, []);
  return state;
}
