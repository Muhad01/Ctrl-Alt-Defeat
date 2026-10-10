"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, eventsUrl } from "@/lib/api";

/** Loads a case and keeps it live via Server-Sent Events. */
export function useCase(id) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const timer = useRef(null);

  const reload = useCallback(async () => {
    try {
      setData(await api.get(`/cases/${id}`));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    reload();
    const es = new EventSource(eventsUrl(id));
    const schedule = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(reload, 120);
    };
    es.addEventListener("hello", () => setLive(true));
    es.addEventListener("timeline", schedule);
    es.addEventListener("case", schedule);
    es.onerror = () => setLive(false);
    return () => {
      clearTimeout(timer.current);
      es.close();
    };
  }, [id, reload]);

  return { data, setData, error, setError, reload, live };
}
