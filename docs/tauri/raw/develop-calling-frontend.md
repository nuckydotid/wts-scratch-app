# Calling the Frontend from Rust

> Scraped from `https://v2.tauri.app/develop/calling-frontend/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Calling the Frontend from Rust

This document includes guides on how to communicate with your application frontend from your Rust code.
To see how to communicate with your Rust code from your frontend, see [Calling Rust from the Frontend](/develop/calling-rust/).

The Rust side of your Tauri application can call the frontend by leveraging the Tauri event system,
using channels or directly evaluating JavaScript code.

## Event System

[Section titled “Event System”](#event-system)

Tauri ships a simple event system you can use to have bi-directional communication between Rust and your frontend.

The event system was designed for situations where small amounts of data need to be streamed
or you need to implement a multi consumer multi producer pattern (e.g. push notification system).

The event system is not designed for low latency or high throughput situations.
See the [channels section](#channels) for the implementation optimized for streaming data.

The major differences between a Tauri command and a Tauri event are that events have no strong type support,
event payloads are always JSON strings making them not suitable for bigger messages
and there is no support of the [capabilities](/security/capabilities/) system to fine grain control event data and channels.

The [AppHandle](https://docs.rs/tauri/2.0.0/tauri/struct.AppHandle.html) and [WebviewWindow](https://docs.rs/tauri/2.0.0/tauri/webview/struct.WebviewWindow.html) types implement the event system traits [Listener](https://docs.rs/tauri/2.0.0/tauri/trait.Listener.html) and [Emitter](https://docs.rs/tauri/2.0.0/tauri/trait.Emitter.html).

Events are either global (delivered to all listeners) or webview-specific (only delivered to the webview matching a given label).

### Global Events

[Section titled “Global Events”](#global-events)

To trigger a global event you can use the [Emitter#emit](https://docs.rs/tauri/2.0.0/tauri/trait.Emitter.html#tymethod.emit) function:

src-tauri/src/lib.rs

```
use tauri::{AppHandle, Emitter};

#[tauri::command]

fn download(app: AppHandle, url: String) {

app.emit("download-started", &url).unwrap();

for progress in [1, 15, 50, 80, 100] {

app.emit("download-progress", progress).unwrap();

}

app.emit("download-finished", &url).unwrap();

}
```

Note

Global events are delivered to **all** listeners

### Webview Event

[Section titled “Webview Event”](#webview-event)

To trigger an event to a listener registered by a specific webview you can use the [Emitter#emit\_to](https://docs.rs/tauri/2.0.0/tauri/trait.Emitter.html#tymethod.emit_to) function:

src-tauri/src/lib.rs

```
use tauri::{AppHandle, Emitter};

#[tauri::command]

fn login(app: AppHandle, user: String, password: String) {

let authenticated = user == "tauri-apps" && password == "tauri";

let result = if authenticated { "loggedIn" } else { "invalidCredentials" };

app.emit_to("login", "login-result", result).unwrap();

}
```

It is also possible to trigger an event to a list of webviews by calling [Emitter#emit\_filter](https://docs.rs/tauri/2.0.0/tauri/trait.Emitter.html#tymethod.emit_filter).
In the following example we emit an open-file event to the main and file-viewer webviews:

src-tauri/src/lib.rs

```
use tauri::{AppHandle, Emitter, EventTarget};

#[tauri::command]

fn open_file(app: AppHandle, path: std::path::PathBuf) {

app.emit_filter("open-file", path, |target| match target {

EventTarget::WebviewWindow { label } => label == "main" || label == "file-viewer",

_ => false,

}).unwrap();

}
```

Note

Webview-specific events are **not** triggered to regular global event listeners.
To listen to **any** event you must use the `listen_any` function instead of `listen`,
which defines the listener to act as a catch-all for emitted events.

### Event Payload

[Section titled “Event Payload”](#event-payload)

The event payload can be any [serializable](https://serde.rs/impl-serialize.html) type that also implements [Clone](https://doc.rust-lang.org/std/clone/trait.Clone.html).
Let’s enhance the download event example by using an object to emit more information in each event:

src-tauri/src/lib.rs

```
use tauri::{AppHandle, Emitter};

use serde::Serialize;

#[derive(Clone, Serialize)]

#[serde(rename_all = "camelCase")]

struct DownloadStarted<'a> {

url: &'a str,

download_id: usize,

content_length: usize,

}

#[derive(Clone, Serialize)]

#[serde(rename_all = "camelCase")]

struct DownloadProgress {

download_id: usize,

chunk_length: usize,

}

#[derive(Clone, Serialize)]

#[serde(rename_all = "camelCase")]

struct DownloadFinished {

download_id: usize,

}

#[tauri::command]

fn download(app: AppHandle, url: String) {

let content_length = 1000;

let download_id = 1;

app.emit("download-started", DownloadStarted {

url: &url,

download_id,

content_length

}).unwrap();

for chunk_length in [15, 150, 35, 500, 300] {

app.emit("download-progress", DownloadProgress {

download_id,

chunk_length,

}).unwrap();

}

app.emit("download-finished", DownloadFinished { download_id }).unwrap();

}
```

### Listening to Events

[Section titled “Listening to Events”](#listening-to-events)

Tauri provides APIs to listen to events on both the webview and the Rust interfaces.

#### Listening to Events on the Frontend

[Section titled “Listening to Events on the Frontend”](#listening-to-events-on-the-frontend)

The `@tauri-apps/api` NPM package offers APIs to listen to both global and webview-specific events.

- Listening to global events

  ```
  import { listen } from '@tauri-apps/api/event';

  type DownloadStarted = {

  url: string;

  downloadId: number;

  contentLength: number;

  };

  listen<DownloadStarted>('download-started', (event) => {

  console.log(

  `downloading ${event.payload.contentLength} bytes from ${event.payload.url}`

  );

  });
  ```

- Listening to webview-specific events

  ```
  import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

  const appWebview = getCurrentWebviewWindow();

  appWebview.listen<string>('logged-in', (event) => {

  localStorage.setItem('session-token', event.payload);

  });
  ```

The `listen` function keeps the event listener registered for the entire lifetime of the application.
To stop listening on an event you can use the `unlisten` function which is returned by the `listen` function:

```
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('download-started', (event) => {});

unlisten();
```

Note

Always use the unlisten function when your execution context goes out of scope
such as when a component is unmounted.

When the page is reloaded or you navigate to another URL the listeners are unregistered automatically.
This does not apply to a Single Page Application (SPA) router though.

#### Common Pitfalls

[Section titled “Common Pitfalls”](#common-pitfalls)

##### Don’t call `unlisten()` before the listener resolves

[Section titled “Don’t call unlisten() before the listener resolves”](#dont-call-unlisten-before-the-listener-resolves)

The `listen` function returns a Promise that resolves to the `unlisten` handle.
If you call `unlisten` synchronously before the Promise resolves, the handler
will be removed immediately and you won’t receive any events:

```
// Wrong: unlisten is called before the listener is registered

const unlisten = listen('sync-complete', (event) => {

console.log('sync finished');

});

unlisten(); // unlisten is a Promise here, not a function -- the listener is not cleaned up

// Correct: await the Promise to get the unlisten handle

const unlisten = await listen('sync-complete', (event) => {

console.log('sync finished');

});

// Now you can store and call it later, e.g. in a cleanup function

unlisten();
```

##### Timing in setup hooks

[Section titled “Timing in setup hooks”](#timing-in-setup-hooks)

In frameworks like React, Vue, and Svelte, the setup or mount hook runs
before the component is fully rendered. If you listen for events during setup,
make sure the event handler does not depend on DOM elements that haven’t been
rendered yet, or defer the listener registration to an effect/hook that runs
after mount.

```
// Wrong: DOM ref may not be available yet

function MyComponent() {

const ref = useRef(null);

listen('scroll-to', (event) => {

ref.current.scrollIntoView(); // ref.current may be null during setup

});

return <div ref={ref} />;

}

// Correct: use useEffect which runs after the component mounts

function MyComponent() {

const ref = useRef(null);

useEffect(() => {

const unlisten = listen('scroll-to', (event) => {

ref.current?.scrollIntoView();

});

return () => {

unlisten.then((fn) => fn());

};

}, []);

return <div ref={ref} />;

}
```

##### Event ordering and async listeners

[Section titled “Event ordering and async listeners”](#event-ordering-and-async-listeners)

Event listeners are called in the order they are registered, but if a listener
is async and the event emitter sends multiple events in rapid succession,
the listeners may process events out of order. For ordered, high-throughput
data delivery, consider using [Channels](/develop/calling-frontend/#channels)
instead of the event system.

#### Framework-specific Cleanup Examples

[Section titled “Framework-specific Cleanup Examples”](#framework-specific-cleanup-examples)

When using a frontend framework, you should clean up event listeners when a
component is unmounted to avoid memory leaks and duplicate handlers.

- [React](#tab-panel-0-0)
- [Vue](#tab-panel-0-1)
- [Svelte](#tab-panel-0-2)

```
import { useEffect, useState } from 'react';

import { listen } from '@tauri-apps/api/event';

function DownloadTracker() {

const [progress, setProgress] = useState(0);

useEffect(() => {

const unlisten = listen<number>('download-progress', (event) => {

setProgress(event.payload);

});

return () => {

unlisten.then((fn) => fn());

};

}, []);

return <div>Download progress: {progress}%div>;

}
```

```
<script setup lang="ts">

import { ref, onMounted, onUnmounted } from 'vue';

import { listen } from '@tauri-apps/api/event';

const progress = ref(0);

let unlistenPromise;

onMounted(() => {

unlistenPromise = listen<number>('download-progress', (event) => {

progress.value = event.payload;

});

});

onUnmounted(() => {

unlistenPromise?.then((fn) => fn());

});

script>

<template>

<div>Download progress: {{ progress }}%div>

template>
```

```
<script lang="ts">

import { listen } from '@tauri-apps/api/event';

let progress = $state(0);

$effect(() => {

const unlistenPromise = listen<number>(

'download-progress',

(event) => {

progress = event.payload;

}

);

return () => {

unlistenPromise.then((unlisten) => unlisten());

};

});

script>

<div>Download progress: {progress}%div>
```

Additionally Tauri provides a utility function for listening to an event exactly once:

```
import { once } from '@tauri-apps/api/event';

import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

once('ready', (event) => {});

const appWebview = getCurrentWebviewWindow();

appWebview.once('ready', () => {});
```

Note

Events emitted in the frontend also trigger listeners registered by these APIs.
For more information, see the [Calling Rust from the Frontend](/develop/calling-rust/) documentation.

#### Listening to Events on Rust

[Section titled “Listening to Events on Rust”](#listening-to-events-on-rust)

Global and webview-specific events are also delivered to listeners registered in Rust.

- Listening to global events

  src-tauri/src/lib.rs

  ```
  use tauri::Listener;

  #[cfg_attr(mobile, tauri::mobile_entry_point)]

  pub fn run() {

  tauri::Builder::default()

  .setup(|app| {

  app.listen("download-started", |event| {

  if let Ok(payload) = serde_json::from_str::(&event.payload()) {

  println!("downloading {}", payload.url);

  }

  });

  Ok(())

  })

  .run(tauri::generate_context!())

  .expect("error while running tauri application");

  }
  ```

- Listening to webview-specific events

  src-tauri/src/lib.rs

  ```
  use tauri::{Listener, Manager};

  #[cfg_attr(mobile, tauri::mobile_entry_point)]

  pub fn run() {

  tauri::Builder::default()

  .setup(|app| {

  let webview = app.get_webview_window("main").unwrap();

  webview.listen("logged-in", |event| {

  let session_token = event.data;

  // save token..

  });

  Ok(())

  })

  .run(tauri::generate_context!())

  .expect("error while running tauri application");

  }
  ```

The `listen` function keeps the event listener registered for the entire lifetime of the application.
To stop listening on an event you can use the `unlisten` function:

```
// unlisten outside of the event handler scope:

let event_id = app.listen("download-started", |event| {});

app.unlisten(event_id);

// unlisten when some event criteria is matched

let handle = app.handle().clone();

app.listen("status-changed", |event| {

if event.data == "ready" {

handle.unlisten(event.id);

}

});
```

Additionally Tauri provides a utility function for listening to an event exactly once:

```
app.once("ready", |event| {

println!("app is ready");

});
```

In this case the event listener is immediately unregistered after its first trigger.

## Channels

[Section titled “Channels”](#channels)

The event system is designed to be a simple two way communication that is globally available in your application.
Under the hood it directly evaluates JavaScript code so it might not be suitable to sending a large amount of data.

Channels are designed to be fast and deliver ordered data. They are used internally for streaming operations
such as download progress, child process output and WebSocket messages.

Let’s rewrite our download command example to use channels instead of the event system:

src-tauri/src/lib.rs

```
use tauri::{AppHandle, ipc::Channel};

use serde::Serialize;

#[derive(Clone, Serialize)]

#[serde(rename_all = "camelCase", rename_all_fields = "camelCase", tag = "event", content = "data")]

enum DownloadEvent<'a> {

Started {

url: &'a str,

download_id: usize,

content_length: usize,

},

Progress {

download_id: usize,

chunk_length: usize,

},

Finished {

download_id: usize,

},

}

#[tauri::command]

fn download(app: AppHandle, url: String, on_event: Channel) {

let content_length = 1000;

let download_id = 1;

on_event.send(DownloadEvent::Started {

url: &url,

download_id,

content_length,

}).unwrap();

for chunk_length in [15, 150, 35, 500, 300] {

on_event.send(DownloadEvent::Progress {

download_id,

chunk_length,

}).unwrap();

}

on_event.send(DownloadEvent::Finished { download_id }).unwrap();

}
```

When calling the download command you must create the channel and provide it as an argument:

```
import { invoke, Channel } from '@tauri-apps/api/core';

type DownloadEvent =

| {

event: 'started';

data: {

url: string;

downloadId: number;

contentLength: number;

};

}

| {

event: 'progress';

data: {

downloadId: number;

chunkLength: number;

};

}

| {

event: 'finished';

data: {

downloadId: number;

};

};

const onEvent = new Channel<DownloadEvent>();

onEvent.onmessage = (message) => {

console.log(`got download event ${message.event}`);

};

await invoke('download', {

url: 'https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-schema-generator/schemas/config.schema.json',

onEvent,

});
```

## Evaluating JavaScript

[Section titled “Evaluating JavaScript”](#evaluating-javascript)

To directly execute any JavaScript code on the webview context you can use the [`WebviewWindow#eval`](https://docs.rs/tauri/2.0.0/tauri/webview/struct.WebviewWindow.html#method.eval) function:

src-tauri/src/lib.rs

```
use tauri::Manager;

tauri::Builder::default()

.setup(|app| {

let webview = app.get_webview_window("main").unwrap();

webview.eval("console.log('hello from Rust')")?;

Ok(())

})
```

If the script to be evaluated is not so simple and must use input from Rust objects we recommend using the [serialize-to-javascript](https://docs.rs/serialize-to-javascript/latest/serialize_to_javascript/) crate.

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/develop/calling-frontend.mdx)

Last updated: Sep 9, 2026

[Previous  
Calling Rust from the Frontend](/develop/calling-rust/)[Next  
Embedding Additional Files](/develop/resources/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
