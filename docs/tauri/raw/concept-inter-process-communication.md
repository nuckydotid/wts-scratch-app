# Inter-Process Communication

> Scraped from `https://v2.tauri.app/concept/inter-process-communication/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Inter-Process Communication

Inter-Process Communication (IPC) allows isolated processes to communicate securely and is key to building more complex applications.

Learn more about the specific IPC patterns in the following guides:

[Brownfield](/concept/inter-process-communication/brownfield/)

[Isolation](/concept/inter-process-communication/isolation/)

Tauri uses a particular style of Inter-Process Communication called [Asynchronous Message Passing](https://en.wikipedia.org/wiki/Message_passing#Asynchronous_message_passing), where processes exchange _requests_ and _responses_ serialized using some simple data representation. Message Passing should sound familiar to anyone with web development experience, as this paradigm is used for client-server communication on the internet.

Message passing is a safer technique than shared memory or direct function access because the recipient is free to reject or discard requests as it sees fit. For example, if the Tauri Core process determines a request to be malicious, it simply discards the requests and never executes the corresponding function.

In the following, we explain Tauri’s two IPC primitives - `Events` and `Commands` - in more detail.

## Events

[Section titled “Events”](#events)

Events are fire-and-forget, one-way IPC messages that are best suited to communicate lifecycle events and state changes. Unlike [Commands](#commands), Events can be emitted by both the Frontend _and_ the Tauri Core.

Events sent between the Core and the Webview.

Under the hood, events still utilize Commands, and the access to the events API is controlled by the [Event permissions](/reference/acl/core-permissions/#event).

## Commands

[Section titled “Commands”](#commands)

Tauri also provides a [foreign function interface](https://en.wikipedia.org/wiki/Foreign_function_interface)-like abstraction on top of IPC messages[1](#user-content-fn-1). The primary API, `invoke`, is similar to the browser’s `fetch` API and allows the Frontend to invoke Rust functions, pass arguments, and receive data.

Because this mechanism uses a [JSON-RPC](https://www.jsonrpc.org) like protocol under the hood to serialize requests and responses, all arguments and return data must be serializable to JSON.

IPC messages involved in a command invocation.

## Footnotes

[Section titled “Footnotes”](#footnote-label)

1. Because Commands still use message passing under the hood, they do not share the same security pitfalls as real FFI interfaces do. [↩](#user-content-fnref-1)

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/concept/Inter-Process%20Communication/index.mdx)

Last updated: Aug 20, 2026

[Previous  
App Size](/concept/size/)[Next  
Brownfield Pattern](/concept/inter-process-communication/brownfield/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
