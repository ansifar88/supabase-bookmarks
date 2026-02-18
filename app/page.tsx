"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

type Bookmark = {
  id: string;
  title: string;
  url: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setBookmarks([]);
  };

  const addBookmark = async () => {
    if (!title || !url || !user) return;

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (including https://)");
      return;
    }
    await supabase.from("bookmarks").insert({
      title: title.trim(),
      url: url.trim(),
      user_id: user.id,
    });

    setTitle("");
    setUrl("");
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  useEffect(() => {
    if (!user) return;
    fetchBookmarks();

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        () => {
          fetchBookmarks();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // NOT LOGGED IN UI
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <button
          onClick={signIn}
          className="rounded bg-black px-6 py-3 text-white"
        >
          Sign in with Google
        </button>
      </main>
    );
  }

  //LOGGED IN UI
  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Bookmarks</h1>
        <button
          onClick={signOut}
          className="text-sm text-red-500 hover:underline"
        >
          Sign out
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start">
        <input
          className="flex-1 rounded border px-3 py-2 border-gray-300"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-1 flex-col gap-1">
          <input
            className={`rounded border px-3 py-2 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <button
          onClick={addBookmark}
          disabled={!title || !url}
          className="h-[42px] rounded bg-black px-4 text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded border p-3"
          >
            <a
              href={b.url}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              {b.title}
            </a>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
