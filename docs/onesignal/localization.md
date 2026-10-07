# Localization

Multi-language messaging for push notifications, in-app messages, email, and SMS.

## Setting Language

### SDK

```javascript
OneSignal.login("external_id");
OneSignal.User.setLanguage("es");
```

### REST API

Include `contents` and `headings` as language-keyed objects:

```json
{
  "contents": {
    "en": "Hello!",
    "es": "¡Hola!",
    "ar": "!مرحبا"
  },
  "headings": {
    "en": "New Message",
    "es": "Nuevo Mensaje"
  }
}
```

Language codes must follow [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

## Multi-Language Fields

| Field           | Supports Multi-Language |
| --------------- | ----------------------- |
| `contents`      | Yes                     |
| `headings`      | Yes                     |
| `subtitle`      | Yes (iOS only)          |
| `email_subject` | Yes                     |
| `email_body`    | Yes                     |
| `sms_body`      | No                      |

## In-App Message Localization

Use tag substitution with Liquid syntax:

```
Hello {{player.name | default: 'User'}}!
```

### Tag-Based Segmentation

Create segments per language using the `language` tag:

```json
{
  "included_segments": ["Spanish Users"],
  "contents": { "es": "Mensaje en español" }
}
```

## Supported Languages

| Code      | Language              |
| --------- | --------------------- |
| `en`      | English               |
| `id`      | Indonesian            |
| `ar`      | Arabic                |
| `zh-Hans` | Chinese (Simplified)  |
| `zh-Hant` | Chinese (Traditional) |
| `hr`      | Croatian              |
| `cs`      | Czech                 |
| `da`      | Danish                |
| `nl`      | Dutch                 |
| `fi`      | Finnish               |
| `fr`      | French                |
| `de`      | German                |
| `el`      | Greek                 |
| `he`      | Hebrew                |
| `hi`      | Hindi                 |
| `hu`      | Hungarian             |
| `it`      | Italian               |
| `ja`      | Japanese              |
| `ko`      | Korean                |
| `ms`      | Malay                 |
| `nb`      | Norwegian (Bokmål)    |
| `pl`      | Polish                |
| `pt`      | Portuguese            |
| `ru`      | Russian               |
| `sk`      | Slovak                |
| `es`      | Spanish               |
| `sv`      | Swedish               |
| `th`      | Thai                  |
| `tr`      | Turkish               |
| `uk`      | Ukrainian             |
| `vi`      | Vietnamese            |
