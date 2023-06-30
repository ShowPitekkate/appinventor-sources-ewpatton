package com.google.appinventor.client;

import com.google.appinventor.common.utils.StringUtils;
import com.google.gwt.junit.client.GWTTestCase;

public class OdeTest extends GWTTestCase {
  public void testCompareLocales() {
    assertTrue("Handles default case one is null",
        StringUtils.compareLocales(null, "en", "en"));
    assertTrue("Handles both cases being null",
        StringUtils.compareLocales(null, null, "en"));
    assertTrue("Handles when both cases are the same",
        StringUtils.compareLocales("en", "en", "en"));
    assertFalse("Handles when the cases are different",
        StringUtils.compareLocales("en", "fr_FR", "en"));
    assertFalse("Handles when the default is different",
        StringUtils.compareLocales(null, "fr_FR", "en"));
  }

  @Override
  public String getModuleName() {
    return "com.google.appinventor.YaClient";
  }
}
