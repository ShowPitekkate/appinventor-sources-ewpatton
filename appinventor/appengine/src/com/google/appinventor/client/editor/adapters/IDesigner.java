package com.google.appinventor.client.editor.adapters;

import com.google.appinventor.client.editor.simple.components.MockComponent;

public interface IDesigner {
  public void addComponent(String uuid, String type);
  public void removeComponent(String uuid);
  public void renameComponent(String uuid, String name);
  public IComponent getComponentByUuid(String uuid);
  public void setProperty(String uuid, String property, String value);
  public void moveComponent(String uuid, String parentUuid, int index);
}
