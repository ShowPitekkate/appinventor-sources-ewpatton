package edu.mit.appinventor.ble;

import android.os.Build;
import com.google.appinventor.components.runtime.Component;
import com.google.appinventor.components.runtime.Form;
import com.google.appinventor.components.runtime.util.BulkPermissionRequest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static android.Manifest.permission.ACCESS_FINE_LOCATION;

public class PermissionHelper {
  public static boolean askForPermission(String permission, Form form, Component component,
      String caller, Runnable continuation) {
    return askForPermission(new String[] { permission }, form, component, caller, continuation);
  }

  public static boolean askForPermission(String[] sdk31permissions, Form form, Component component,
      String caller, final Runnable continuation) {
    List<String> permissions = new ArrayList<>();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      Collections.addAll(permissions, sdk31permissions);
    } else {
      permissions.add(ACCESS_FINE_LOCATION);
    }
    boolean ready = true;
    for (String permission : permissions) {
      if (form.isDeniedPermission(permission)) {
        ready = false;
        break;
      }
    }
    if (!ready) {
      form.askPermission(new BulkPermissionRequest(component, caller, permissions.toArray(new String[0])) {
        @Override
        public void onGranted() {
          continuation.run();
        }
      });
    }
    return !ready;
  }
}
