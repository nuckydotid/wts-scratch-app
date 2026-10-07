# Service Extensions

Service extensions let you modify or suppress notifications before they display on the device.

## Android — INotificationServiceExtension

Implement `INotificationServiceExtension` to intercept notifications before display.

```java
public class MyExtension implements NotificationExtensionService {

  @Override
  public void onNotificationReceived(OSNotificationReceivedEvent event) {
    OSNotification notification = event.getNotification();

    // Modify the notification
    notification.setExtender(builder -> {
      builder.setColor(Color.BLUE);
      return builder;
    });

    // Or prevent display entirely
    event.preventDefault();

    // Manually display later
    notification.display();
  }
}
```

### AndroidManifest Registration

```xml
<service
  android:name=".MyExtension"
  android:exported="false">
  <intent-filter>
    <action android:name="com.onesignal.NotificationExtensionService" />
  </intent-filter>
  <meta-data
    android:name="com.onesignal.NotificationExtensionService"
    android:value="com.example.MyExtension" />
</service>
```

### Key Methods

| Method                       | Description                                  |
| ---------------------------- | -------------------------------------------- |
| `event.preventDefault()`     | Suppresses the notification from showing     |
| `notification.display()`     | Manually show a suppressed notification      |
| `notification.setExtender()` | Modify colors, icon, small icon, group, etc. |

## iOS — UNNotificationServiceExtension

Create a notification service extension target in Xcode. The entry point is `OneSignalExtension.didReceiveNotificationExtensionRequest`.

```swift
import OneSignalExtension

class NotificationService: UNNotificationServiceExtension {

  override func didReceive(
    _ request: UNNotificationRequest,
    withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
  ) {
    self.contentHandler = contentHandler
    let userInfo = request.content.userInfo

    // Access additional data
    if let custom = userInfo["custom"] as? [String: Any],
       let additionalData = custom["a"] as? [String: Any] {
      // Use additionalData
    }

    OneSignalExtension.didReceiveNotificationExtensionRequest(
      with: request,
      with: contentHandler
    )
  }
}
```

### Additional Data Access (iOS)

```swift
let userInfo = request.content.userInfo

if let custom = userInfo["custom"] as? [String: Any],
   let additionalData = custom["a"] as? [String: Any] {
  print(additionalData)
}
```

## iOS Xcode Setup Troubleshooting

| Setting                       | Required Value                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| **Supported Destinations**    | iOS                                                                                       |
| **Minimum Deployment Target** | Must match your main app target                                                           |
| **Product Bundle Identifier** | `{main_bundle_id}.OneSignalNotificationServiceExtension`                                  |
| **NSExtension**               | Key in Info.plist with `NSExtensionPointIdentifier = com.apple.usernotifications.service` |

### NSExtension Info.plist Keys

```xml
<key>NSExtension</key>
<dict>
  <key>NSExtensionPointIdentifier</key>
  <string>com.apple.usernotifications.service</string>
  <key>NSExtensionPrincipalClass</key>
  <string>$(PRODUCT_MODULE_NAME).NotificationService</string>
</dict>
```

### Debugging Steps

1. Ensure the extension target shares the same team and provisioning profile as the main app
2. Verify `NSExtensionPointIdentifier` is set to `com.apple.usernotifications.service`
3. Check that the minimum deployment target matches or is lower than the main app
4. Clean the build folder (`Cmd+Shift+K`) and rebuild both targets
5. Confirm the extension bundle identifier follows the `{app_bundle}.OneSignalNotificationServiceExtension` pattern
6. Check Xcode console logs for extension crash logs
